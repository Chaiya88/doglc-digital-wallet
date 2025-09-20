#!/usr/bin/env node

/**
 * SSL Certificate Verification Script
 * ตรวจสอบและยืนยันการทำงานของ SSL certificates อัตโนมัติ
 */

import { SSLManager } from '../src/utils/ssl-manager.js';
import fs from 'fs';
import path from 'path';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

class SSLVerifier {
  constructor() {
    this.testResults = [];
    this.startTime = Date.now();
    
    // Mock environment for testing
    this.mockEnv = {
      CLOUDFLARE_DOMAIN: 'example.com',
      CLOUDFLARE_API_KEY: 'test-api-key',
      CLOUDFLARE_EMAIL: 'test@example.com',
      TELEGRAM_BOT_TOKEN: 'test-bot-token',
      ADMIN_CHAT_ID: 'test-chat-id'
    };
  }

  /**
   * แสดงผลหัวข้อ
   */
  printHeader(title) {
    console.log(`\n${colors.cyan}${colors.bright}${'='.repeat(60)}${colors.reset}`);
    console.log(`${colors.cyan}${colors.bright}  ${title}${colors.reset}`);
    console.log(`${colors.cyan}${colors.bright}${'='.repeat(60)}${colors.reset}\n`);
  }

  /**
   * แสดงผลสถานะการทดสอบ
   */
  printTestResult(testName, passed, details = '') {
    const status = passed ? 
      `${colors.green}✅ PASS${colors.reset}` : 
      `${colors.red}❌ FAIL${colors.reset}`;
    
    console.log(`${status} ${testName}`);
    
    if (details) {
      console.log(`     ${colors.yellow}${details}${colors.reset}`);
    }
    
    this.testResults.push({ testName, passed, details });
  }

  /**
   * ทดสอบการสร้าง SSL Manager
   */
  async testSSLManagerCreation() {
    this.printHeader('SSL Manager Creation Tests');

    try {
      // Test 1: Basic SSL Manager creation
      const sslManager = new SSLManager(this.mockEnv);
      this.printTestResult(
        'SSL Manager instantiation',
        sslManager instanceof SSLManager,
        'SSL Manager created successfully'
      );

      // Test 2: Configuration loading
      this.printTestResult(
        'Environment configuration loading',
        sslManager.cloudflareDomain === 'example.com',
        'Environment variables loaded correctly'
      );

      // Test 3: SSL configuration setup
      this.printTestResult(
        'SSL configuration setup',
        sslManager.sslConfig.minTlsVersion === '1.2',
        'SSL configuration initialized properly'
      );

      // Test 4: Security headers configuration
      this.printTestResult(
        'Security headers configuration',
        Object.keys(sslManager.securityHeaders).length > 0,
        'Security headers configured properly'
      );

      return sslManager;

    } catch (error) {
      this.printTestResult(
        'SSL Manager creation',
        false,
        `Error: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * ทดสอบการตรวจสอบสถานะ SSL
   */
  async testSSLStatusCheck(sslManager) {
    this.printHeader('SSL Status Check Tests');

    try {
      // Test 1: SSL status check with valid domain
      const status = await sslManager.checkSSLStatus('example.com');
      this.printTestResult(
        'SSL status check execution',
        status && status.domain === 'example.com',
        'SSL status check completed successfully'
      );

      // Test 2: Certificate details retrieval
      this.printTestResult(
        'Certificate details retrieval',
        status.certificate && status.certificate.domain === 'example.com',
        'Certificate details retrieved properly'
      );

      // Test 3: SSL validation
      this.printTestResult(
        'SSL configuration validation',
        status.validation && typeof status.validation.isSecure === 'boolean',
        'SSL validation performed correctly'
      );

      // Test 4: Recommendations generation
      this.printTestResult(
        'Recommendations generation',
        Array.isArray(status.recommendations),
        'Recommendations generated successfully'
      );

      return status;

    } catch (error) {
      this.printTestResult(
        'SSL status check',
        false,
        `Error: ${error.message}`
      );
    }
  }

  /**
   * ทดสอบ Certificate Details
   */
  async testCertificateDetails(sslManager) {
    this.printHeader('Certificate Details Tests');

    try {
      // Test 1: Certificate details structure
      const certDetails = await sslManager.getCertificateDetails('example.com');
      this.printTestResult(
        'Certificate details structure',
        certDetails.domain && certDetails.issuer && certDetails.validFrom,
        'Certificate details have required fields'
      );

      // Test 2: Expiry calculation
      this.printTestResult(
        'Expiry date calculation',
        typeof certDetails.daysUntilExpiry === 'number',
        `Certificate expires in ${certDetails.daysUntilExpiry} days`
      );

      // Test 3: Certificate validity
      this.printTestResult(
        'Certificate validity check',
        typeof certDetails.isValid === 'boolean',
        `Certificate is ${certDetails.isValid ? 'valid' : 'invalid'}`
      );

      // Test 4: Security algorithms
      this.printTestResult(
        'Security algorithms check',
        certDetails.signatureAlgorithm && certDetails.keySize,
        `Using ${certDetails.signatureAlgorithm} with ${certDetails.keySize}-bit key`
      );

      return certDetails;

    } catch (error) {
      this.printTestResult(
        'Certificate details test',
        false,
        `Error: ${error.message}`
      );
    }
  }

  /**
   * ทดสอบ SSL Configuration Validation
   */
  async testSSLValidation(sslManager) {
    this.printHeader('SSL Configuration Validation Tests');

    try {
      // Test 1: SSL validation execution
      const validation = await sslManager.validateSSLConfiguration('example.com');
      this.printTestResult(
        'SSL validation execution',
        validation && typeof validation.isSecure === 'boolean',
        'SSL validation completed successfully'
      );

      // Test 2: HTTPS redirect check
      this.printTestResult(
        'HTTPS redirect validation',
        typeof validation.httpsRedirect === 'boolean',
        `HTTPS redirect: ${validation.httpsRedirect ? 'enabled' : 'disabled'}`
      );

      // Test 3: HSTS header check
      this.printTestResult(
        'HSTS header validation',
        typeof validation.hstsHeader === 'boolean',
        `HSTS header: ${validation.hstsHeader ? 'configured' : 'not configured'}`
      );

      // Test 4: TLS version check
      this.printTestResult(
        'TLS version validation',
        validation.tlsVersion && validation.tlsVersion >= '1.2',
        `TLS version: ${validation.tlsVersion}`
      );

      // Test 5: Cipher suites check
      this.printTestResult(
        'Cipher suites validation',
        Array.isArray(validation.cipherSuites),
        `${validation.cipherSuites.length} cipher suites configured`
      );

      return validation;

    } catch (error) {
      this.printTestResult(
        'SSL validation test',
        false,
        `Error: ${error.message}`
      );
    }
  }

  /**
   * ทดสอบ Auto-renewal
   */
  async testAutoRenewal(sslManager) {
    this.printHeader('Auto-Renewal Tests');

    try {
      // Test 1: Auto-renewal check (not needed)
      const renewalResult = await sslManager.autoRenewCertificate('example.com');
      this.printTestResult(
        'Auto-renewal execution',
        renewalResult && renewalResult.success,
        renewalResult.message || 'Auto-renewal completed'
      );

      // Test 2: Renewal logic
      this.printTestResult(
        'Renewal logic validation',
        renewalResult.success === true,
        'Renewal logic working correctly'
      );

      return renewalResult;

    } catch (error) {
      this.printTestResult(
        'Auto-renewal test',
        false,
        `Error: ${error.message}`
      );
    }
  }

  /**
   * ทดสอบ Security Headers
   */
  testSecurityHeaders(sslManager) {
    this.printHeader('Security Headers Tests');

    try {
      // Test 1: Security headers presence
      const headers = sslManager.securityHeaders;
      this.printTestResult(
        'Security headers configuration',
        Object.keys(headers).length > 0,
        `${Object.keys(headers).length} security headers configured`
      );

      // Test 2: HSTS header
      this.printTestResult(
        'HSTS header configuration',
        headers['Strict-Transport-Security'] && headers['Strict-Transport-Security'].includes('max-age'),
        'HSTS header properly configured'
      );

      // Test 3: CSP header
      this.printTestResult(
        'Content Security Policy',
        headers['Content-Security-Policy'] && headers['Content-Security-Policy'].includes('default-src'),
        'CSP header properly configured'
      );

      // Test 4: X-Frame-Options
      this.printTestResult(
        'X-Frame-Options header',
        headers['X-Frame-Options'] === 'DENY',
        'X-Frame-Options configured for clickjacking protection'
      );

      // Test 5: Apply headers to response
      const mockResponse = new Response('test', { status: 200 });
      const secureResponse = sslManager.applySSLHeaders(mockResponse);
      this.printTestResult(
        'Headers application to response',
        secureResponse.headers.get('Strict-Transport-Security') !== null,
        'Security headers applied to response successfully'
      );

      return headers;

    } catch (error) {
      this.printTestResult(
        'Security headers test',
        false,
        `Error: ${error.message}`
      );
    }
  }

  /**
   * ทดสอบ Monitoring
   */
  async testSSLMonitoring(sslManager) {
    this.printHeader('SSL Monitoring Tests');

    try {
      // Mock domain list
      sslManager.getDomainList = () => ['example.com'];

      // Test 1: Monitoring execution
      const monitoringReport = await sslManager.monitorSSLCertificates();
      this.printTestResult(
        'SSL monitoring execution',
        monitoringReport && monitoringReport.summary,
        'SSL monitoring completed successfully'
      );

      // Test 2: Report structure
      this.printTestResult(
        'Monitoring report structure',
        monitoringReport.summary && monitoringReport.details,
        'Monitoring report has proper structure'
      );

      // Test 3: Health score calculation
      this.printTestResult(
        'Health score calculation',
        typeof monitoringReport.summary.healthScore === 'number',
        `Health score: ${monitoringReport.summary.healthScore}%`
      );

      return monitoringReport;

    } catch (error) {
      this.printTestResult(
        'SSL monitoring test',
        false,
        `Error: ${error.message}`
      );
    }
  }

  /**
   * ทดสอบ Middleware
   */
  testSSLMiddleware(sslManager) {
    this.printHeader('SSL Middleware Tests');

    try {
      // Test 1: Middleware creation
      const middleware = sslManager.createSSLMiddleware();
      this.printTestResult(
        'SSL middleware creation',
        typeof middleware === 'function',
        'SSL middleware created successfully'
      );

      // Test 2: Middleware execution (mock)
      let contextEnhanced = false;
      const mockContext = {
        ssl: null
      };
      
      const mockNext = async () => {
        contextEnhanced = mockContext.ssl !== null;
      };

      middleware(mockContext, mockNext);
      
      this.printTestResult(
        'Middleware context enhancement',
        mockContext.ssl && mockContext.ssl.manager === sslManager,
        'Middleware enhances context with SSL information'
      );

      return middleware;

    } catch (error) {
      this.printTestResult(
        'SSL middleware test',
        false,
        `Error: ${error.message}`
      );
    }
  }

  /**
   * ทดสอบ Error Handling
   */
  async testErrorHandling(sslManager) {
    this.printHeader('Error Handling Tests');

    try {
      // Test 1: Invalid domain handling
      try {
        await sslManager.checkSSLStatus('');
        this.printTestResult(
          'Invalid domain handling',
          false,
          'Should have thrown error for empty domain'
        );
      } catch (error) {
        this.printTestResult(
          'Invalid domain handling',
          true,
          'Properly handles invalid domain'
        );
      }

      // Test 2: Missing API credentials
      const sslManagerNoAuth = new SSLManager({});
      const status = await sslManagerNoAuth.getCloudflareSSLStatus('example.com');
      this.printTestResult(
        'Missing credentials handling',
        status.error && status.isActive === false,
        'Handles missing API credentials gracefully'
      );

      // Test 3: Error logging
      const loggedError = await sslManager.logSSLError('TEST_ERROR', new Error('Test error'), { test: true });
      this.printTestResult(
        'Error logging functionality',
        true, // logSSLError doesn't throw
        'Error logging completed without exceptions'
      );

    } catch (error) {
      this.printTestResult(
        'Error handling test',
        false,
        `Unexpected error: ${error.message}`
      );
    }
  }

  /**
   * สร้างรายงานผลการทดสอบ
   */
  generateReport() {
    this.printHeader('SSL Verification Report');

    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    const successRate = Math.round((passedTests / totalTests) * 100);
    const duration = Date.now() - this.startTime;

    console.log(`${colors.bright}Test Summary:${colors.reset}`);
    console.log(`  Total Tests: ${totalTests}`);
    console.log(`  ${colors.green}Passed: ${passedTests}${colors.reset}`);
    console.log(`  ${colors.red}Failed: ${failedTests}${colors.reset}`);
    console.log(`  ${colors.blue}Success Rate: ${successRate}%${colors.reset}`);
    console.log(`  ${colors.magenta}Duration: ${duration}ms${colors.reset}`);

    if (failedTests > 0) {
      console.log(`\n${colors.red}${colors.bright}Failed Tests:${colors.reset}`);
      this.testResults
        .filter(r => !r.passed)
        .forEach(test => {
          console.log(`  ${colors.red}❌ ${test.testName}${colors.reset}`);
          if (test.details) {
            console.log(`     ${colors.yellow}${test.details}${colors.reset}`);
          }
        });
    }

    // Generate recommendations based on results
    this.generateRecommendations(successRate);

    return {
      totalTests,
      passedTests,
      failedTests,
      successRate,
      duration,
      details: this.testResults
    };
  }

  /**
   * สร้างคำแนะนำปรับปรุง
   */
  generateRecommendations(successRate) {
    console.log(`\n${colors.cyan}${colors.bright}Recommendations:${colors.reset}`);

    if (successRate >= 95) {
      console.log(`  ${colors.green}✅ SSL implementation is excellent!${colors.reset}`);
      console.log(`  ${colors.green}✅ Ready for production deployment${colors.reset}`);
    } else if (successRate >= 80) {
      console.log(`  ${colors.yellow}⚠️  SSL implementation is good but has some issues${colors.reset}`);
      console.log(`  ${colors.yellow}⚠️  Review failed tests before production deployment${colors.reset}`);
    } else {
      console.log(`  ${colors.red}❌ SSL implementation needs significant improvements${colors.reset}`);
      console.log(`  ${colors.red}❌ DO NOT deploy to production until issues are resolved${colors.reset}`);
    }

    console.log(`\n${colors.cyan}Next Steps:${colors.reset}`);
    console.log(`  1. Configure actual Cloudflare API credentials`);
    console.log(`  2. Set up domain in CLOUDFLARE_DOMAIN environment variable`);
    console.log(`  3. Configure Telegram notifications (optional)`);
    console.log(`  4. Set up KV storage for monitoring and error logs`);
    console.log(`  5. Schedule regular SSL monitoring (cron job)`);
    console.log(`  6. Test with real domain and certificates`);
  }

  /**
   * บันทึกรายงานเป็นไฟล์
   */
  async saveReport(report) {
    try {
      const reportPath = path.join(process.cwd(), 'ssl-verification-report.json');
      const detailedReport = {
        timestamp: new Date().toISOString(),
        environment: 'test',
        ...report
      };

      fs.writeFileSync(reportPath, JSON.stringify(detailedReport, null, 2));
      console.log(`\n${colors.green}Report saved to: ${reportPath}${colors.reset}`);

    } catch (error) {
      console.error(`${colors.red}Failed to save report: ${error.message}${colors.reset}`);
    }
  }

  /**
   * รันการทดสอบทั้งหมด
   */
  async runAllTests() {
    try {
      console.log(`${colors.blue}${colors.bright}Starting SSL Certificate Verification...${colors.reset}`);
      console.log(`${colors.blue}Environment: Test Mode${colors.reset}`);
      console.log(`${colors.blue}Timestamp: ${new Date().toISOString()}${colors.reset}`);

      // Run all tests
      const sslManager = await this.testSSLManagerCreation();
      
      if (sslManager) {
        await this.testSSLStatusCheck(sslManager);
        await this.testCertificateDetails(sslManager);
        await this.testSSLValidation(sslManager);
        await this.testAutoRenewal(sslManager);
        this.testSecurityHeaders(sslManager);
        await this.testSSLMonitoring(sslManager);
        this.testSSLMiddleware(sslManager);
        await this.testErrorHandling(sslManager);
      }

      // Generate and save report
      const report = this.generateReport();
      await this.saveReport(report);

      return report;

    } catch (error) {
      console.error(`${colors.red}${colors.bright}Verification failed: ${error.message}${colors.reset}`);
      console.error(error.stack);
      process.exit(1);
    }
  }
}

// Run verification if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const verifier = new SSLVerifier();
  verifier.runAllTests()
    .then(report => {
      const exitCode = report.successRate >= 80 ? 0 : 1;
      process.exit(exitCode);
    })
    .catch(error => {
      console.error('Verification failed:', error);
      process.exit(1);
    });
}

export default SSLVerifier;