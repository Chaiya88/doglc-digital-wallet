#!/usr/bin/env node

/**
 * SSL Automation Script
 * จัดการ SSL certificates อัตโนมัติด้วยระบบตรวจสอบและแจ้งเตือน
 */

import { SSLManager } from '../src/utils/ssl-manager.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

class SSLAutomation {
  constructor() {
    this.configPath = path.join(__dirname, '..', '.env');
    this.logPath = path.join(__dirname, '..', 'logs', 'ssl-automation.log');
    this.env = this.loadEnvironment();
    this.sslManager = new SSLManager(this.env);
    
    // Ensure logs directory exists
    this.ensureLogDirectory();
  }

  /**
   * โหลด Environment Variables
   */
  loadEnvironment() {
    try {
      // Load from .env file if exists
      if (fs.existsSync(this.configPath)) {
        const envContent = fs.readFileSync(this.configPath, 'utf8');
        const envVars = {};
        
        envContent.split('\n').forEach(line => {
          if (line.trim() && !line.startsWith('#')) {
            const [key, ...valueParts] = line.split('=');
            envVars[key.trim()] = valueParts.join('=').trim();
          }
        });
        
        return { ...process.env, ...envVars };
      }
      
      return process.env;
      
    } catch (error) {
      console.error(`${colors.red}Failed to load environment: ${error.message}${colors.reset}`);
      return process.env;
    }
  }

  /**
   * สร้างไดเรกทอรี logs หากไม่มี
   */
  ensureLogDirectory() {
    const logDir = path.dirname(this.logPath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  /**
   * บันทึก log
   */
  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data
    };

    // Console output
    const colorMap = {
      INFO: colors.blue,
      SUCCESS: colors.green,
      WARNING: colors.yellow,
      ERROR: colors.red
    };
    
    const color = colorMap[level] || colors.reset;
    console.log(`${color}[${timestamp}] ${level}: ${message}${colors.reset}`);
    
    if (data) {
      console.log(`${colors.cyan}${JSON.stringify(data, null, 2)}${colors.reset}`);
    }

    // File output
    try {
      fs.appendFileSync(this.logPath, JSON.stringify(logEntry) + '\n');
    } catch (error) {
      console.error(`Failed to write to log file: ${error.message}`);
    }
  }

  /**
   * ตรวจสอบสถานะ SSL ทั้งหมด
   */
  async checkAllSSLStatus() {
    this.log('INFO', 'Starting SSL status check for all domains');

    try {
      const domains = this.getConfiguredDomains();
      const results = [];

      for (const domain of domains) {
        this.log('INFO', `Checking SSL status for: ${domain}`);
        
        try {
          const status = await this.sslManager.checkSSLStatus(domain);
          results.push(status);
          
          if (status.isValid) {
            this.log('SUCCESS', `SSL check passed for ${domain}`);
          } else {
            this.log('WARNING', `SSL issues found for ${domain}`, {
              recommendations: status.recommendations
            });
          }
          
        } catch (error) {
          this.log('ERROR', `SSL check failed for ${domain}`, { error: error.message });
          results.push({
            domain,
            error: error.message,
            isValid: false,
            timestamp: new Date().toISOString()
          });
        }
      }

      return results;

    } catch (error) {
      this.log('ERROR', 'SSL status check failed', { error: error.message });
      throw error;
    }
  }

  /**
   * รันการตรวจสอบและต่ออายุอัตโนมัติ
   */
  async runAutomaticRenewal() {
    this.log('INFO', 'Starting automatic SSL renewal process');

    try {
      const domains = this.getConfiguredDomains();
      const renewalResults = [];

      for (const domain of domains) {
        this.log('INFO', `Checking renewal for: ${domain}`);
        
        try {
          const renewalResult = await this.sslManager.autoRenewCertificate(domain);
          renewalResults.push(renewalResult);
          
          if (renewalResult.success) {
            this.log('SUCCESS', `Renewal check completed for ${domain}`, renewalResult);
          } else {
            this.log('WARNING', `Renewal issues for ${domain}`, renewalResult);
          }
          
        } catch (error) {
          this.log('ERROR', `Renewal failed for ${domain}`, { error: error.message });
          renewalResults.push({
            domain,
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
          });
        }
      }

      return renewalResults;

    } catch (error) {
      this.log('ERROR', 'Automatic renewal failed', { error: error.message });
      throw error;
    }
  }

  /**
   * รันการตรวจสอบแบบครบวงจร
   */
  async runFullSSLMonitoring() {
    this.log('INFO', 'Starting full SSL monitoring cycle');

    try {
      // 1. Check SSL status
      const statusResults = await this.checkAllSSLStatus();
      
      // 2. Run monitoring
      const monitoringReport = await this.sslManager.monitorSSLCertificates();
      
      // 3. Check renewals
      const renewalResults = await this.runAutomaticRenewal();
      
      // 4. Generate comprehensive report
      const fullReport = {
        timestamp: new Date().toISOString(),
        statusCheck: {
          total: statusResults.length,
          valid: statusResults.filter(r => r.isValid).length,
          invalid: statusResults.filter(r => !r.isValid).length,
          results: statusResults
        },
        monitoring: monitoringReport,
        renewal: {
          total: renewalResults.length,
          successful: renewalResults.filter(r => r.success).length,
          failed: renewalResults.filter(r => !r.success).length,
          results: renewalResults
        }
      };

      // 5. Save report
      await this.saveAutomationReport(fullReport);
      
      // 6. Send summary notification
      await this.sendSummaryNotification(fullReport);

      this.log('SUCCESS', 'Full SSL monitoring completed', {
        summary: {
          totalDomains: fullReport.statusCheck.total,
          validSSL: fullReport.statusCheck.valid,
          healthScore: monitoringReport.summary.healthScore
        }
      });

      return fullReport;

    } catch (error) {
      this.log('ERROR', 'Full SSL monitoring failed', { error: error.message });
      throw error;
    }
  }

  /**
   * ตั้งค่า SSL อัตโนมัติสำหรับ Cloudflare
   */
  async setupSSLAutomation() {
    this.log('INFO', 'Setting up SSL automation for Cloudflare');

    try {
      const setupTasks = [
        this.validateCloudflareCredentials(),
        this.validateDomainConfiguration(),
        this.testSSLConnectivity(),
        this.configureSecurityHeaders(),
        this.setupMonitoringSchedule()
      ];

      const results = await Promise.allSettled(setupTasks);
      
      const setupReport = {
        timestamp: new Date().toISOString(),
        tasks: results.map((result, index) => ({
          task: ['credentials', 'domain', 'connectivity', 'headers', 'monitoring'][index],
          status: result.status,
          result: result.status === 'fulfilled' ? result.value : result.reason.message
        }))
      };

      const successfulTasks = results.filter(r => r.status === 'fulfilled').length;
      const totalTasks = results.length;

      this.log('INFO', `SSL automation setup completed: ${successfulTasks}/${totalTasks} tasks successful`, setupReport);

      return setupReport;

    } catch (error) {
      this.log('ERROR', 'SSL automation setup failed', { error: error.message });
      throw error;
    }
  }

  /**
   * ตรวจสอบ Cloudflare credentials
   */
  async validateCloudflareCredentials() {
    const requiredVars = ['CLOUDFLARE_API_KEY', 'CLOUDFLARE_EMAIL', 'CLOUDFLARE_DOMAIN'];
    const missingVars = requiredVars.filter(varName => !this.env[varName]);

    if (missingVars.length > 0) {
      throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
    }

    // Test API connectivity
    try {
      const status = await this.sslManager.getCloudflareSSLStatus(this.env.CLOUDFLARE_DOMAIN);
      
      if (status.error) {
        throw new Error(`Cloudflare API test failed: ${status.error}`);
      }

      return { valid: true, message: 'Cloudflare credentials validated successfully' };

    } catch (error) {
      throw new Error(`Cloudflare API validation failed: ${error.message}`);
    }
  }

  /**
   * ตรวจสอบการตั้งค่า Domain
   */
  async validateDomainConfiguration() {
    const domains = this.getConfiguredDomains();
    
    if (domains.length === 0) {
      throw new Error('No domains configured for SSL monitoring');
    }

    const validationResults = [];
    
    for (const domain of domains) {
      try {
        const status = await this.sslManager.checkSSLStatus(domain);
        validationResults.push({
          domain,
          valid: status.isValid,
          issues: status.recommendations
        });
      } catch (error) {
        validationResults.push({
          domain,
          valid: false,
          error: error.message
        });
      }
    }

    const validDomains = validationResults.filter(r => r.valid).length;
    
    return {
      totalDomains: domains.length,
      validDomains,
      results: validationResults,
      message: `${validDomains}/${domains.length} domains configured correctly`
    };
  }

  /**
   * ทดสอบ SSL connectivity
   */
  async testSSLConnectivity() {
    try {
      const testDomain = this.env.CLOUDFLARE_DOMAIN;
      const validation = await this.sslManager.validateSSLConfiguration(testDomain);
      
      return {
        domain: testDomain,
        httpsRedirect: validation.httpsRedirect,
        hstsHeader: validation.hstsHeader,
        secureHeaders: validation.secureHeaders,
        tlsVersion: validation.tlsVersion,
        isSecure: validation.isSecure,
        message: `SSL connectivity test ${validation.isSecure ? 'passed' : 'failed'}`
      };

    } catch (error) {
      throw new Error(`SSL connectivity test failed: ${error.message}`);
    }
  }

  /**
   * ตั้งค่า Security Headers
   */
  async configureSecurityHeaders() {
    try {
      // Test security headers application
      const mockResponse = new Response('test', { status: 200 });
      const secureResponse = this.sslManager.applySSLHeaders(mockResponse);
      
      const appliedHeaders = {};
      secureResponse.headers.forEach((value, name) => {
        if (name.toLowerCase().includes('security') || 
            name.toLowerCase().includes('transport') ||
            name.toLowerCase().includes('frame') ||
            name.toLowerCase().includes('content')) {
          appliedHeaders[name] = value;
        }
      });

      return {
        headersConfigured: Object.keys(appliedHeaders).length,
        headers: appliedHeaders,
        message: 'Security headers configured successfully'
      };

    } catch (error) {
      throw new Error(`Security headers configuration failed: ${error.message}`);
    }
  }

  /**
   * ตั้งค่า Monitoring Schedule
   */
  async setupMonitoringSchedule() {
    // This would be configured in wrangler.toml as cron triggers
    const scheduleConfig = {
      dailyCheck: '0 6 * * *',    // 6 AM daily
      weeklyReport: '0 9 * * 1',  // 9 AM every Monday
      monthlyAudit: '0 10 1 * *'  // 10 AM first day of month
    };

    return {
      schedules: scheduleConfig,
      message: 'Monitoring schedules configured (requires cron triggers in wrangler.toml)'
    };
  }

  /**
   * ดึงรายการ domains ที่ตั้งค่าไว้
   */
  getConfiguredDomains() {
    const domains = [];
    
    if (this.env.CLOUDFLARE_DOMAIN) {
      domains.push(this.env.CLOUDFLARE_DOMAIN);
    }
    
    // Support for multiple domains
    if (this.env.ADDITIONAL_DOMAINS) {
      const additional = this.env.ADDITIONAL_DOMAINS.split(',').map(d => d.trim());
      domains.push(...additional);
    }

    return domains.filter(domain => domain);
  }

  /**
   * บันทึกรายงานการทำงานอัตโนมัติ
   */
  async saveAutomationReport(report) {
    try {
      const reportsDir = path.join(__dirname, '..', 'reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      const reportPath = path.join(reportsDir, `ssl-automation-${Date.now()}.json`);
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      
      this.log('INFO', `Automation report saved: ${reportPath}`);

    } catch (error) {
      this.log('ERROR', 'Failed to save automation report', { error: error.message });
    }
  }

  /**
   * ส่งการแจ้งเตือนสรุปผล
   */
  async sendSummaryNotification(report) {
    try {
      if (!this.env.TELEGRAM_BOT_TOKEN || !this.env.ADMIN_CHAT_ID) {
        return;
      }

      const summary = `🔒 SSL Automation Report

📊 SSL Status Check:
✅ Valid: ${report.statusCheck.valid}/${report.statusCheck.total}
❌ Invalid: ${report.statusCheck.invalid}/${report.statusCheck.total}

📈 Health Score: ${report.monitoring.summary.healthScore}%

🔄 Certificate Renewal:
✅ Successful: ${report.renewal.successful}/${report.renewal.total}
❌ Failed: ${report.renewal.failed}/${report.renewal.total}

⏰ Generated: ${new Date(report.timestamp).toLocaleString('th-TH')}`;

      await this.sslManager.sendSSLNotification({
        type: 'AUTOMATION_SUMMARY',
        message: summary
      });

    } catch (error) {
      this.log('ERROR', 'Failed to send summary notification', { error: error.message });
    }
  }

  /**
   * แสดงความช่วยเหลือ
   */
  showHelp() {
    console.log(`
${colors.cyan}${colors.bright}SSL Automation Tool${colors.reset}

${colors.yellow}Usage:${colors.reset}
  node scripts/ssl-automation.js [command]

${colors.yellow}Commands:${colors.reset}
  check      - Check SSL status for all configured domains
  renew      - Run automatic renewal process
  monitor    - Run full SSL monitoring cycle
  setup      - Setup SSL automation configuration
  help       - Show this help message

${colors.yellow}Examples:${colors.reset}
  node scripts/ssl-automation.js check
  node scripts/ssl-automation.js monitor
  node scripts/ssl-automation.js setup

${colors.yellow}Environment Variables:${colors.reset}
  CLOUDFLARE_DOMAIN      - Primary domain to monitor
  CLOUDFLARE_API_KEY     - Cloudflare API key
  CLOUDFLARE_EMAIL       - Cloudflare account email
  TELEGRAM_BOT_TOKEN     - Bot token for notifications (optional)
  ADMIN_CHAT_ID          - Admin chat ID for notifications (optional)
  ADDITIONAL_DOMAINS     - Comma-separated list of additional domains (optional)

${colors.yellow}Logs:${colors.reset}
  Automation logs: logs/ssl-automation.log
  Reports: reports/ssl-automation-*.json
`);
  }
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  const automation = new SSLAutomation();

  try {
    switch (command) {
      case 'check':
        await automation.checkAllSSLStatus();
        break;
        
      case 'renew':
        await automation.runAutomaticRenewal();
        break;
        
      case 'monitor':
        await automation.runFullSSLMonitoring();
        break;
        
      case 'setup':
        await automation.setupSSLAutomation();
        break;
        
      case 'help':
      default:
        automation.showHelp();
        break;
    }

  } catch (error) {
    console.error(`${colors.red}Command failed: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default SSLAutomation;