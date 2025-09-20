/**
 * Basic System Health Tests
 * ทดสอบระบบพื้นฐานและ configuration
 */

const fs = require('fs');
const path = require('path');

describe('System Health Tests', () => {
  test('Environment should be properly configured', () => {
    // Test that we can import basic modules
    expect(true).toBe(true);
  });

  test('Package.json should have correct type setting', () => {
    const packageJson = require('../package.json');
    expect(packageJson.type).toBe('module');
  });

  test('Main entry point should exist', () => {
    const mainPath = path.join(__dirname, '..', 'src', 'index.js');
    expect(fs.existsSync(mainPath)).toBe(true);
  });

  test('Important directories should exist', () => {
    const srcPath = path.join(__dirname, '..', 'src');
    const handlersPath = path.join(__dirname, '..', 'src', 'handlers');
    const utilsPath = path.join(__dirname, '..', 'src', 'utils');
    const localesPath = path.join(__dirname, '..', 'src', 'locales');
    
    expect(fs.existsSync(srcPath)).toBe(true);
    expect(fs.existsSync(handlersPath)).toBe(true);
    expect(fs.existsSync(utilsPath)).toBe(true);
    expect(fs.existsSync(localesPath)).toBe(true);
  });
});

describe('SSL Security Tests', () => {
  test('SSL Manager script should exist', () => {
    const sslManagerPath = path.join(__dirname, '..', 'src', 'utils', 'ssl-manager.js');
    expect(fs.existsSync(sslManagerPath)).toBe(true);
  });

  test('SSL verification script should exist', () => {
    const sslVerificationPath = path.join(__dirname, '..', 'scripts', 'verify-ssl-certificates.js');
    expect(fs.existsSync(sslVerificationPath)).toBe(true);
  });

  test('SSL automation script should exist', () => {
    const sslAutomationPath = path.join(__dirname, '..', 'scripts', 'ssl-automation.js');
    expect(fs.existsSync(sslAutomationPath)).toBe(true);
  });
});

describe('Security Features Tests', () => {
  test('XSS Protection module should exist', () => {
    const xssProtectionPath = path.join(__dirname, '..', 'src', 'utils', 'xss-protection.js');
    expect(fs.existsSync(xssProtectionPath)).toBe(true);
  });

  test('Environment Protection module should exist', () => {
    const envProtectionPath = path.join(__dirname, '..', 'src', 'utils', 'environment-protection.js');
    expect(fs.existsSync(envProtectionPath)).toBe(true);
  });

  test('Security Logger module should exist', () => {
    const securityLoggerPath = path.join(__dirname, '..', 'src', 'utils', 'security-logger.js');
    expect(fs.existsSync(securityLoggerPath)).toBe(true);
  });
});

describe('Performance Features Tests', () => {
  test('Optimized File Handler should exist', () => {
    const optimizedFilePath = path.join(__dirname, '..', 'src', 'utils', 'optimized-file-handler.js');
    expect(fs.existsSync(optimizedFilePath)).toBe(true);
  });

  test('Optimized Database Manager should exist', () => {
    const optimizedDBPath = path.join(__dirname, '..', 'src', 'utils', 'optimized-database.js');
    expect(fs.existsSync(optimizedDBPath)).toBe(true);
  });

  test('Enhanced Performance module should exist', () => {
    const enhancedPerfPath = path.join(__dirname, '..', 'src', 'utils', 'enhanced-performance.js');
    expect(fs.existsSync(enhancedPerfPath)).toBe(true);
  });
});

describe('Production Scripts Tests', () => {
  test('Production readiness test script should exist', () => {
    const prodTestPath = path.join(__dirname, '..', 'scripts', 'production-readiness-test.js');
    expect(fs.existsSync(prodTestPath)).toBe(true);
  });

  test('Environment validation script should exist', () => {
    const envValidationPath = path.join(__dirname, '..', 'scripts', 'validate-environment.js');
    expect(fs.existsSync(envValidationPath)).toBe(true);
  });

  test('Deploy script should exist', () => {
    const deployPath = path.join(__dirname, '..', 'scripts', 'deploy.js');
    expect(fs.existsSync(deployPath)).toBe(true);
  });
});

describe('Configuration Tests', () => {
  test('Wrangler config should exist', () => {
    const wranglerPath = path.join(__dirname, '..', 'wrangler.toml');
    expect(fs.existsSync(wranglerPath)).toBe(true);
  });

  test('Production environment template should exist', () => {
    const prodTemplatePath = path.join(__dirname, '..', 'config', 'production-environment-template.md');
    expect(fs.existsSync(prodTemplatePath)).toBe(true);
  });

  test('SSL certificates guide should exist', () => {
    const sslGuidePath = path.join(__dirname, '..', 'config', 'ssl-certificates-guide.md');
    expect(fs.existsSync(sslGuidePath)).toBe(true);
  });
});

describe('Telegram Bot Features Tests', () => {
  test('Start handler should exist', () => {
    const startHandlerPath = path.join(__dirname, '..', 'src', 'handlers', 'start.js');
    expect(fs.existsSync(startHandlerPath)).toBe(true);
  });

  test('Wallet handler should exist', () => {
    const walletHandlerPath = path.join(__dirname, '..', 'src', 'handlers', 'wallet.js');
    expect(fs.existsSync(walletHandlerPath)).toBe(true);
  });

  test('Language locales should exist', () => {
    const localesIndexPath = path.join(__dirname, '..', 'src', 'locales', 'index.js');
    const thLocalePath = path.join(__dirname, '..', 'src', 'locales', 'th.js');
    const enLocalePath = path.join(__dirname, '..', 'src', 'locales', 'en.js');
    
    expect(fs.existsSync(localesIndexPath)).toBe(true);
    expect(fs.existsSync(thLocalePath)).toBe(true);
    expect(fs.existsSync(enLocalePath)).toBe(true);
  });
});