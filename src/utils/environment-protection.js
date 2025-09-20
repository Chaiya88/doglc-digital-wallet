/**
 * Enhanced Environment Variable Protection
 * Secure handling, validation, and encryption of environment variables
 */

import { createHash, createCipheriv, createDecipheriv, randomBytes } from 'crypto';

/**
 * Environment Variable Security Configuration
 */
export const ENV_SECURITY_CONFIG = {
  encryption: {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    ivLength: 16,
    tagLength: 16
  },
  validation: {
    requiredVars: [
      'BOT_TOKEN',
      'JWT_SECRET',
      'WEBHOOK_SECRET',
      'ADMIN_USER_ID'
    ],
    sensitiveVars: [
      'BOT_TOKEN',
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
      'WEBHOOK_SECRET',
      'API_KEY',
      'DATABASE_URL',
      'CLOUDFLARE_API_TOKEN'
    ],
    patterns: {
      BOT_TOKEN: /^\d+:[A-Za-z0-9_-]{35}$/,
      JWT_SECRET: /^[A-Za-z0-9+/]{32,}={0,2}$/,
      WEBHOOK_SECRET: /^[A-Za-z0-9]{32,}$/,
      ADMIN_USER_ID: /^\d+$/,
      API_KEY: /^[A-Za-z0-9]{20,}$/
    }
  },
  access: {
    maxAttempts: 3,
    lockoutDuration: 300000, // 5 minutes
    auditLog: true
  }
};

/**
 * Environment Variable Protection Class
 */
export class EnvironmentVariableProtection {
  constructor(env) {
    this.env = env;
    this.accessLog = new Map();
    this.encryptedCache = new Map();
    this.validationCache = new Map();
    this.masterKey = this.deriveMasterKey();
  }

  /**
   * Derive master key for encryption
   */
  deriveMasterKey() {
    const salt = 'doglc-env-protection-salt-2024';
    const baseKey = this.env.MASTER_ENCRYPTION_KEY || 'fallback-key-change-in-production';
    return createHash('sha256').update(baseKey + salt).digest();
  }

  /**
   * Encrypt sensitive environment variable
   */
  encryptEnvironmentVariable(value, varName) {
    try {
      const iv = randomBytes(ENV_SECURITY_CONFIG.encryption.ivLength);
      const cipher = createCipheriv(ENV_SECURITY_CONFIG.encryption.algorithm, this.masterKey, iv);
      
      let encrypted = cipher.update(value, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();
      
      const encryptedData = {
        encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
        varName,
        timestamp: Date.now()
      };

      // Cache encrypted value
      this.encryptedCache.set(varName, encryptedData);
      
      return encryptedData;
    } catch (error) {
      console.error(`Failed to encrypt environment variable ${varName}:`, error);
      throw new Error('Environment variable encryption failed');
    }
  }

  /**
   * Decrypt environment variable
   */
  decryptEnvironmentVariable(encryptedData, varName) {
    try {
      const { encrypted, iv, authTag } = encryptedData;
      
      const decipher = createDecipheriv(
        ENV_SECURITY_CONFIG.encryption.algorithm,
        this.masterKey,
        Buffer.from(iv, 'hex')
      );
      
      decipher.setAuthTag(Buffer.from(authTag, 'hex'));
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      // Log access
      this.logEnvironmentAccess(varName, 'decrypt');
      
      return decrypted;
    } catch (error) {
      console.error(`Failed to decrypt environment variable ${varName}:`, error);
      throw new Error('Environment variable decryption failed');
    }
  }

  /**
   * Secure environment variable getter
   */
  getSecureEnvironmentVariable(varName, options = {}) {
    const { 
      validate = true, 
      encrypt = false, 
      cache = true,
      requesterInfo = null 
    } = options;

    try {
      // Rate limiting check
      if (!this.checkRateLimit(varName, requesterInfo)) {
        throw new Error(`Rate limit exceeded for environment variable access: ${varName}`);
      }

      // Check if variable exists
      if (!(varName in this.env)) {
        this.logEnvironmentAccess(varName, 'missing', requesterInfo);
        throw new Error(`Environment variable not found: ${varName}`);
      }

      let value = this.env[varName];

      // Validate if requested
      if (validate) {
        const validationResult = this.validateEnvironmentVariable(varName, value);
        if (!validationResult.valid) {
          this.logEnvironmentAccess(varName, 'validation_failed', requesterInfo);
          throw new Error(`Environment variable validation failed: ${varName}`);
        }
      }

      // Return encrypted version if requested
      if (encrypt) {
        return this.encryptEnvironmentVariable(value, varName);
      }

      // Log access
      this.logEnvironmentAccess(varName, 'access', requesterInfo);

      return value;
    } catch (error) {
      this.logEnvironmentAccess(varName, 'error', requesterInfo, error.message);
      throw error;
    }
  }

  /**
   * Validate environment variable format and content
   */
  validateEnvironmentVariable(varName, value) {
    // Use cached validation if available
    const cacheKey = `${varName}_${createHash('sha256').update(value).digest('hex').substring(0, 16)}`;
    if (this.validationCache.has(cacheKey)) {
      return this.validationCache.get(cacheKey);
    }

    const validation = {
      valid: true,
      errors: [],
      warnings: []
    };

    // Check if value exists
    if (!value || value.trim() === '') {
      validation.valid = false;
      validation.errors.push('Environment variable is empty');
    }

    // Pattern validation
    if (ENV_SECURITY_CONFIG.validation.patterns[varName]) {
      const pattern = ENV_SECURITY_CONFIG.validation.patterns[varName];
      if (!pattern.test(value)) {
        validation.valid = false;
        validation.errors.push(`Environment variable does not match expected pattern`);
      }
    }

    // Sensitive variable checks
    if (ENV_SECURITY_CONFIG.validation.sensitiveVars.includes(varName)) {
      // Check for common weak patterns
      if (value.length < 16) {
        validation.valid = false;
        validation.errors.push('Sensitive environment variable too short');
      }
      
      if (/^(test|demo|example|changeme|password|secret)/i.test(value)) {
        validation.valid = false;
        validation.errors.push('Environment variable appears to be a placeholder');
      }
    }

    // Security strength validation for tokens
    if (varName.includes('TOKEN') || varName.includes('SECRET') || varName.includes('KEY')) {
      const entropy = this.calculateEntropy(value);
      if (entropy < 4.0) {
        validation.warnings.push('Environment variable has low entropy');
      }
    }

    // Cache validation result
    this.validationCache.set(cacheKey, validation);

    return validation;
  }

  /**
   * Calculate entropy of a string
   */
  calculateEntropy(str) {
    const freq = {};
    for (const char of str) {
      freq[char] = (freq[char] || 0) + 1;
    }
    
    let entropy = 0;
    const len = str.length;
    
    for (const count of Object.values(freq)) {
      const p = count / len;
      entropy -= p * Math.log2(p);
    }
    
    return entropy;
  }

  /**
   * Validate all required environment variables
   */
  validateAllEnvironmentVariables() {
    const results = {
      valid: true,
      missing: [],
      invalid: [],
      warnings: []
    };

    // Check required variables
    for (const varName of ENV_SECURITY_CONFIG.validation.requiredVars) {
      if (!(varName in this.env)) {
        results.valid = false;
        results.missing.push(varName);
        continue;
      }

      const validation = this.validateEnvironmentVariable(varName, this.env[varName]);
      if (!validation.valid) {
        results.valid = false;
        results.invalid.push({
          varName,
          errors: validation.errors
        });
      }
      
      if (validation.warnings.length > 0) {
        results.warnings.push({
          varName,
          warnings: validation.warnings
        });
      }
    }

    return results;
  }

  /**
   * Rate limiting for environment variable access
   */
  checkRateLimit(varName, requesterInfo) {
    const key = `${varName}_${requesterInfo?.id || 'unknown'}`;
    const now = Date.now();
    
    if (!this.accessLog.has(key)) {
      this.accessLog.set(key, { attempts: 1, lastAttempt: now, lockedUntil: null });
      return true;
    }

    const log = this.accessLog.get(key);
    
    // Check if locked
    if (log.lockedUntil && now < log.lockedUntil) {
      return false;
    }

    // Reset if enough time has passed
    if (now - log.lastAttempt > ENV_SECURITY_CONFIG.access.lockoutDuration) {
      log.attempts = 1;
      log.lastAttempt = now;
      log.lockedUntil = null;
      return true;
    }

    // Increment attempts
    log.attempts++;
    log.lastAttempt = now;

    // Lock if too many attempts
    if (log.attempts > ENV_SECURITY_CONFIG.access.maxAttempts) {
      log.lockedUntil = now + ENV_SECURITY_CONFIG.access.lockoutDuration;
      return false;
    }

    return true;
  }

  /**
   * Log environment variable access
   */
  logEnvironmentAccess(varName, action, requesterInfo = null, error = null) {
    if (!ENV_SECURITY_CONFIG.access.auditLog) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      varName,
      action,
      requester: {
        id: requesterInfo?.id || 'unknown',
        type: requesterInfo?.type || 'unknown',
        ip: requesterInfo?.ip || 'unknown'
      },
      error,
      sensitive: ENV_SECURITY_CONFIG.validation.sensitiveVars.includes(varName)
    };

    // Log to KV store if available
    if (this.env.AUDIT_LOG_KV) {
      this.env.AUDIT_LOG_KV.put(
        `env_access_${Date.now()}`,
        JSON.stringify(logEntry),
        { expirationTtl: 86400 * 30 } // Keep for 30 days
      ).catch(err => console.error('Failed to log environment access:', err));
    }

    // Log to console for sensitive variables or errors
    if (logEntry.sensitive || error) {
      console.warn('Environment variable access:', {
        varName: logEntry.sensitive ? `[REDACTED:${varName}]` : varName,
        action,
        error,
        requester: logEntry.requester.id
      });
    }
  }

  /**
   * Create secure environment accessor middleware
   */
  createSecureAccessorMiddleware() {
    return (ctx, next) => {
      // Add secure environment accessor to context
      ctx.secureEnv = {
        get: (varName, options = {}) => {
          return this.getSecureEnvironmentVariable(varName, {
            ...options,
            requesterInfo: {
              id: ctx.from?.id || 'telegram_bot',
              type: 'telegram_user',
              ip: ctx.request?.ip || 'unknown'
            }
          });
        },
        validate: (varName, value) => {
          return this.validateEnvironmentVariable(varName, value);
        },
        validateAll: () => {
          return this.validateAllEnvironmentVariables();
        }
      };

      return next();
    };
  }

  /**
   * Generate environment variable security report
   */
  generateSecurityReport() {
    const report = {
      timestamp: new Date().toISOString(),
      validation: this.validateAllEnvironmentVariables(),
      security: {
        encryptedVariables: this.encryptedCache.size,
        accessAttempts: this.accessLog.size,
        rateLimitedAccess: Array.from(this.accessLog.values())
          .filter(log => log.lockedUntil && Date.now() < log.lockedUntil).length
      },
      recommendations: []
    };

    // Add recommendations
    if (report.validation.missing.length > 0) {
      report.recommendations.push('Configure missing required environment variables');
    }
    
    if (report.validation.invalid.length > 0) {
      report.recommendations.push('Fix invalid environment variable formats');
    }
    
    if (report.validation.warnings.length > 0) {
      report.recommendations.push('Review environment variables with warnings');
    }

    // Check for weak configurations
    const weakVars = ENV_SECURITY_CONFIG.validation.sensitiveVars.filter(varName => {
      if (!(varName in this.env)) return false;
      const validation = this.validateEnvironmentVariable(varName, this.env[varName]);
      return validation.warnings.length > 0;
    });

    if (weakVars.length > 0) {
      report.recommendations.push('Strengthen weak environment variables');
    }

    return report;
  }

  /**
   * Clean up old access logs and caches
   */
  cleanup() {
    const now = Date.now();
    const cleanupAge = 86400000; // 24 hours

    // Clean access logs
    for (const [key, log] of this.accessLog.entries()) {
      if (now - log.lastAttempt > cleanupAge) {
        this.accessLog.delete(key);
      }
    }

    // Clean encrypted cache
    for (const [key, data] of this.encryptedCache.entries()) {
      if (now - data.timestamp > cleanupAge) {
        this.encryptedCache.delete(key);
      }
    }

    // Clean validation cache
    if (this.validationCache.size > 1000) {
      const entries = Array.from(this.validationCache.entries());
      const toDelete = entries.slice(0, entries.length - 500);
      toDelete.forEach(([key]) => this.validationCache.delete(key));
    }
  }
}

/**
 * Create environment protection instance
 */
export function createEnvironmentProtection(env) {
  return new EnvironmentVariableProtection(env);
}

/**
 * Validate environment configuration on startup
 */
export function validateEnvironmentOnStartup(env) {
  const protection = new EnvironmentVariableProtection(env);
  const validation = protection.validateAllEnvironmentVariables();
  
  if (!validation.valid) {
    const errorMsg = `Environment validation failed:
Missing: ${validation.missing.join(', ')}
Invalid: ${validation.invalid.map(i => i.varName).join(', ')}`;
    
    console.error(errorMsg);
    throw new Error('Environment validation failed');
  }
  
  if (validation.warnings.length > 0) {
    console.warn('Environment warnings:', validation.warnings);
  }
  
  return protection;
}