#!/usr/bin/env node
/**
 * Environment Variables Validation Script
 * Validates all required environment variables for production deployment
 */

import { createEnvironmentProtection, validateEnvironmentOnStartup } from '../src/utils/environment-protection.js';
import { getConfig } from '../src/utils/config.js';
import { readFileSync } from 'fs';
import { join } from 'path';

const VALIDATION_SCRIPT_VERSION = '1.0.0';

/**
 * Color codes for console output
 */
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

/**
 * Log with colors
 */
function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Mock environment for testing
 */
function createMockEnvironment() {
  return {
    // Core bot configuration
    BOT_TOKEN: '1234567890:AABBCCDDEE1122334455667788FFGGHHIIJJKKLL',
    WEBHOOK_SECRET: 'a'.repeat(32),
    ADMIN_USER_ID: '123456789',
    
    // Security configuration
    JWT_SECRET: Buffer.from('test-jwt-secret-for-validation').toString('base64'),
    JWT_REFRESH_SECRET: Buffer.from('test-refresh-secret-for-validation').toString('base64'),
    MASTER_ENCRYPTION_KEY: Buffer.from('test-master-encryption-key-for-validation').toString('base64'),
    
    // Cloudflare configuration
    CLOUDFLARE_ACCOUNT_ID: 'test-account-id',
    CLOUDFLARE_API_TOKEN: 'test-api-token-1234567890',
    CLOUDFLARE_ZONE_ID: 'test-zone-id',
    
    // Domain configuration
    DOMAIN_NAME: 'doglc-wallet.com',
    API_DOMAIN: 'api.doglc-wallet.com',
    BOT_DOMAIN: 'bot.doglc-wallet.com',
    DASHBOARD_DOMAIN: 'dashboard.doglc-wallet.com',
    
    // Optional configuration
    ENVIRONMENT: 'production',
    NODE_ENV: 'production',
    LOG_LEVEL: 'info',
    
    // KV namespaces (simulated)
    USER_BALANCE_KV: 'mock-kv',
    TRANSACTION_HISTORY_KV: 'mock-kv',
    AUDIT_LOG_KV: 'mock-kv'
  };
}

/**
 * Validate environment configuration
 */
async function validateEnvironment(env) {
  log('\n🔍 Environment Variables Validation Starting...', 'cyan');
  log(`📋 Validation Script Version: ${VALIDATION_SCRIPT_VERSION}`, 'blue');
  log(`🕒 Timestamp: ${new Date().toISOString()}`, 'blue');

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
    details: []
  };

  try {
    // Create environment protection instance
    const envProtection = createEnvironmentProtection(env);
    
    // Validate all environment variables
    log('\n📊 Running comprehensive environment validation...', 'yellow');
    const validation = envProtection.validateAllEnvironmentVariables();
    
    // Check validation results
    if (validation.valid) {
      log('✅ Basic validation: PASSED', 'green');
      results.passed++;
    } else {
      log('❌ Basic validation: FAILED', 'red');
      results.failed++;
      
      if (validation.missing.length > 0) {
        log(`   Missing variables: ${validation.missing.join(', ')}`, 'red');
      }
      
      if (validation.invalid.length > 0) {
        validation.invalid.forEach(invalid => {
          log(`   Invalid ${invalid.varName}: ${invalid.errors.join(', ')}`, 'red');
        });
      }
    }
    
    if (validation.warnings.length > 0) {
      results.warnings += validation.warnings.length;
      validation.warnings.forEach(warning => {
        log(`⚠️  Warning ${warning.varName}: ${warning.warnings.join(', ')}`, 'yellow');
      });
    }
    
    results.total++;

    // Test specific environment variables
    log('\n🔐 Testing specific environment variables...', 'yellow');
    
    const testCases = [
      {
        name: 'BOT_TOKEN Format',
        test: () => {
          const token = env.BOT_TOKEN;
          return /^\d+:[A-Za-z0-9_-]{35}$/.test(token);
        }
      },
      {
        name: 'JWT_SECRET Strength',
        test: () => {
          const secret = env.JWT_SECRET;
          return secret && secret.length >= 32;
        }
      },
      {
        name: 'WEBHOOK_SECRET Format',
        test: () => {
          const secret = env.WEBHOOK_SECRET;
          return secret && secret.length >= 32 && /^[a-zA-Z0-9]+$/.test(secret);
        }
      },
      {
        name: 'ADMIN_USER_ID Format',
        test: () => {
          const id = env.ADMIN_USER_ID;
          return /^\d+$/.test(id);
        }
      },
      {
        name: 'Domain Configuration',
        test: () => {
          return env.DOMAIN_NAME && 
                 env.API_DOMAIN && 
                 env.BOT_DOMAIN && 
                 env.DASHBOARD_DOMAIN;
        }
      }
    ];

    testCases.forEach(testCase => {
      results.total++;
      try {
        if (testCase.test()) {
          log(`✅ ${testCase.name}: PASSED`, 'green');
          results.passed++;
        } else {
          log(`❌ ${testCase.name}: FAILED`, 'red');
          results.failed++;
        }
      } catch (error) {
        log(`❌ ${testCase.name}: ERROR - ${error.message}`, 'red');
        results.failed++;
      }
    });

    // Test environment protection features
    log('\n🛡️  Testing environment protection features...', 'yellow');
    
    const protectionTests = [
      {
        name: 'Secure Variable Access',
        test: async () => {
          const secureToken = envProtection.getSecureEnvironmentVariable('BOT_TOKEN', {
            validate: true,
            requesterInfo: { id: 'validation_script', type: 'system' }
          });
          return secureToken === env.BOT_TOKEN;
        }
      },
      {
        name: 'Variable Encryption',
        test: async () => {
          const encrypted = envProtection.encryptEnvironmentVariable('test-value', 'TEST_VAR');
          const decrypted = envProtection.decryptEnvironmentVariable(encrypted, 'TEST_VAR');
          return decrypted === 'test-value';
        }
      },
      {
        name: 'Rate Limiting',
        test: async () => {
          // Test multiple rapid accesses
          for (let i = 0; i < 5; i++) {
            envProtection.getSecureEnvironmentVariable('BOT_TOKEN', {
              requesterInfo: { id: 'rate_limit_test', type: 'system' }
            });
          }
          return true; // Should not throw error for reasonable access
        }
      }
    ];

    for (const test of protectionTests) {
      results.total++;
      try {
        if (await test.test()) {
          log(`✅ ${test.name}: PASSED`, 'green');
          results.passed++;
        } else {
          log(`❌ ${test.name}: FAILED`, 'red');
          results.failed++;
        }
      } catch (error) {
        log(`❌ ${test.name}: ERROR - ${error.message}`, 'red');
        results.failed++;
      }
    }

    // Generate security report
    log('\n📋 Generating security report...', 'yellow');
    const securityReport = envProtection.generateSecurityReport();
    
    if (securityReport.recommendations.length > 0) {
      log('\n💡 Security Recommendations:', 'yellow');
      securityReport.recommendations.forEach(rec => {
        log(`   • ${rec}`, 'yellow');
        results.warnings++;
      });
    }

    // Test configuration loading
    log('\n⚙️  Testing configuration loading...', 'yellow');
    results.total++;
    try {
      const config = getConfig(env);
      if (config.telegram.botToken && config.security.rateLimit) {
        log('✅ Configuration Loading: PASSED', 'green');
        results.passed++;
      } else {
        log('❌ Configuration Loading: FAILED', 'red');
        results.failed++;
      }
    } catch (error) {
      log(`❌ Configuration Loading: ERROR - ${error.message}`, 'red');
      results.failed++;
    }

  } catch (error) {
    log(`❌ Environment validation error: ${error.message}`, 'red');
    results.failed++;
    results.total++;
  }

  return results;
}

/**
 * Display validation results
 */
function displayResults(results) {
  log('\n' + '='.repeat(60), 'cyan');
  log('🏆 ENVIRONMENT VALIDATION RESULTS', 'cyan');
  log('='.repeat(60), 'cyan');
  
  const successRate = ((results.passed / results.total) * 100).toFixed(1);
  
  log(`📊 Total Tests: ${results.total}`, 'blue');
  log(`✅ Passed: ${results.passed}`, 'green');
  log(`❌ Failed: ${results.failed}`, 'red');
  log(`⚠️  Warnings: ${results.warnings}`, 'yellow');
  log(`📈 Success Rate: ${successRate}%`, 'blue');
  
  if (results.failed === 0) {
    log('\n🎉 VALIDATION SUCCESSFUL!', 'green');
    log('✅ Environment is ready for production deployment', 'green');
  } else {
    log('\n⚠️  VALIDATION FAILED!', 'red');
    log('❌ Environment needs attention before production deployment', 'red');
  }
  
  if (results.warnings > 0) {
    log(`⚠️  ${results.warnings} warnings detected - review recommended`, 'yellow');
  }
  
  log('\n📋 Next Steps:', 'blue');
  if (results.failed > 0) {
    log('   1. Fix failed validation items', 'blue');
    log('   2. Re-run validation script', 'blue');
    log('   3. Proceed with deployment when all tests pass', 'blue');
  } else {
    log('   1. Review any warnings if present', 'blue');
    log('   2. Deploy to production environment', 'blue');
    log('   3. Run post-deployment verification', 'blue');
  }
  
  log('\n🔗 Documentation: config/production-environment-template.md', 'blue');
  log('🔗 Support: https://github.com/your-org/doglc-digital-wallet/issues', 'blue');
}

/**
 * Main validation function
 */
async function main() {
  const args = process.argv.slice(2);
  const useMockData = args.includes('--mock') || args.includes('-m');
  const showHelp = args.includes('--help') || args.includes('-h');
  
  if (showHelp) {
    log('Environment Variables Validation Script', 'cyan');
    log('Usage: node scripts/validate-environment.js [options]', 'blue');
    log('\nOptions:', 'blue');
    log('  --mock, -m     Use mock data for testing validation logic', 'blue');
    log('  --help, -h     Show this help message', 'blue');
    log('\nExamples:', 'blue');
    log('  node scripts/validate-environment.js          # Validate actual environment', 'blue');
    log('  node scripts/validate-environment.js --mock   # Test with mock data', 'blue');
    return;
  }

  let env;
  
  if (useMockData) {
    log('🧪 Using mock environment data for testing...', 'yellow');
    env = createMockEnvironment();
  } else {
    log('🔍 Using actual environment variables...', 'blue');
    env = process.env;
    
    // Check if running in Node.js environment with access to process.env
    if (Object.keys(env).length === 0) {
      log('❌ No environment variables found!', 'red');
      log('💡 Make sure to run this script with proper environment variables loaded', 'yellow');
      log('💡 Or use --mock flag to test validation logic', 'yellow');
      process.exit(1);
    }
  }

  try {
    const results = await validateEnvironment(env);
    displayResults(results);
    
    // Exit with appropriate code
    if (results.failed > 0) {
      process.exit(1);
    } else if (results.warnings > 0) {
      process.exit(2); // Warning exit code
    } else {
      process.exit(0);
    }
    
  } catch (error) {
    log(`💥 Fatal error during validation: ${error.message}`, 'red');
    log('🔍 Stack trace:', 'red');
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
}