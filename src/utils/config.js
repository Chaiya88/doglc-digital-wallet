/**
 * Configuration utilities for accessing environment variables
 */

/**
 * Get configuration value with fallback
 * @param {object} env - Environment variables object
 * @param {string} key - Configuration key
 * @param {any} defaultValue - Default value if not found
 * @returns {any} Configuration value
 */
export function getConfig(env, key, defaultValue = null) {
  return env[key] || defaultValue;
}

/**
 * Get all Telegram bot configuration
 * @param {object} env - Environment variables object
 * @returns {object} Telegram bot configuration
 */
export function getTelegramConfig(env) {
  return {
    token: getConfig(env, 'TELEGRAM_BOT_TOKEN'),
    username: getConfig(env, 'TELEGRAM_BOT_USERNAME', 'DoglcWallet_Bot'),
    webhookSecret: getConfig(env, 'TELEGRAM_WEBHOOK_SECRET'),
    adminChatId: getConfig(env, 'TELEGRAM_ADMIN_CHAT_ID'),
    supportChatId: getConfig(env, 'TELEGRAM_SUPPORT_CHAT_ID'),
    masterAdminId: getConfig(env, 'MASTER_ADMIN_ID'),
    masterAdminUsername: getConfig(env, 'MASTER_ADMIN_USERNAME')
  };
}

/**
 * Get Cloudflare configuration
 * @param {object} env - Environment variables object
 * @returns {object} Cloudflare configuration
 */
export function getCloudflareConfig(env) {
  return {
    accountId: getConfig(env, 'CLOUDFLARE_ACCOUNT_ID'),
    zoneId: getConfig(env, 'CLOUDFLARE_ZONE_ID'),
    email: getConfig(env, 'CLOUDFLARE_EMAIL'),
    apiToken: getConfig(env, 'CLOUDFLARE_API_TOKEN')
  };
}

/**
 * Get rate limiting configuration
 * @param {object} env - Environment variables object
 * @returns {object} Rate limiting configuration
 */
export function getRateLimitConfig(env) {
  return {
    max: parseInt(getConfig(env, 'RATE_LIMIT_MAX', '100')),
    windowMs: parseInt(getConfig(env, 'RATE_LIMIT_WINDOW_MS', '60000')),
    realtimeDebounceMs: parseInt(getConfig(env, 'REALTIME_DEBOUNCE_MS', '250'))
  };
}

/**
 * Get security configuration
 * @param {object} env - Environment variables object
 * @returns {object} Security configuration
 */
export function getSecurityConfig(env) {
  return {
    jwtSecret: getConfig(env, 'JWT_SECRET'),
    jwtPrimaryKey: getConfig(env, 'JWT_PRIMARY_KEY'),
    encryptionKey: getConfig(env, 'ENCRYPTION_KEY'),
    encryptionKeySecondary: getConfig(env, 'ENCRYPTION_KEY_SECONDARY'),
    passwordPepper: getConfig(env, 'PASSWORD_PEPPER'),
    auditSharedKey: getConfig(env, 'AUDIT_SHARED_KEY'),
    accessTokenTtl: getConfig(env, 'ACCESS_TOKEN_TTL', '15m'),
    refreshTokenTtl: getConfig(env, 'REFRESH_TOKEN_TTL', '7d')
  };
}

/**
 * Get banking configuration
 * @param {object} env - Environment variables object
 * @returns {object} Banking configuration
 */
export function getBankingConfig(env) {
  return {
    primaryAccountHolder: getConfig(env, 'PRIMARY_BANK_ACCOUNT_HOLDER'),
    primaryAccountNumber: getConfig(env, 'PRIMARY_BANK_ACCOUNT_NUMBER'),
    primaryBankBranch: getConfig(env, 'PRIMARY_BANK_BRANCH')
  };
}

/**
 * Get exchange/blockchain API configuration
 * @param {object} env - Environment variables object
 * @returns {object} Exchange API configuration
 */
export function getExchangeConfig(env) {
  return {
    binance: {
      apiKey: getConfig(env, 'BINANCE_API_KEY'),
      secretKey: getConfig(env, 'BINANCE_SECRET_KEY')
    },
    tron: {
      apiKey: getConfig(env, 'TRONSCAN_API_KEY'),
      walletAddress: getConfig(env, 'TRON_WALLET_ADDRESS')
    }
  };
}

/**
 * Get company information
 * @param {object} env - Environment variables object
 * @returns {object} Company information
 */
export function getCompanyConfig(env) {
  return {
    legalName: getConfig(env, 'COMPANY_LEGAL_NAME', 'DOGLC DIGITAL WALLET CO., LTD.'),
    tradeName: getConfig(env, 'COMPANY_TRADE_NAME', 'DOGLC Wallet'),
    supportEmail: getConfig(env, 'SUPPORT_EMAIL', 'support@doglcdigital.com'),
    contactEmail: getConfig(env, 'CONTACT_EMAIL', 'contact@doglcdigital.com')
  };
}

/**
 * Get all worker URLs
 * @param {object} env - Environment variables object
 * @returns {object} Worker URLs
 */
export function getWorkerUrls(env) {
  return {
    frontend: getConfig(env, 'FRONTEND_URL', 'http://127.0.0.1:3000'),
    api: getConfig(env, 'API_BASE_URL', 'http://127.0.0.1:8787'),
    banking: getConfig(env, 'BANKING_WORKER_URL', 'http://127.0.0.1:8788'),
    security: getConfig(env, 'SECURITY_WORKER_URL', 'http://127.0.0.1:8789'),
    monitoring: getConfig(env, 'MONITORING_WORKER_URL', 'http://127.0.0.1:8790')
  };
}

/**
 * Validate required environment variables
 * @param {object} env - Environment variables object
 * @returns {object} Validation result
 */
export function validateConfig(env) {
  const required = [
    'TELEGRAM_BOT_TOKEN',
    'JWT_SECRET',
    'ENCRYPTION_KEY'
  ];

  const missing = required.filter(key => !env[key]);
  
  return {
    isValid: missing.length === 0,
    missing: missing,
    warnings: []
  };
}

/**
 * Get feature flags configuration
 * @param {object} env - Environment variables object
 * @returns {object} Feature flags
 */
export function getFeatureFlags(env) {
  try {
    const flagsJson = getConfig(env, 'FEATURE_FLAGS_JSON', '{}');
    return JSON.parse(flagsJson);
  } catch (error) {
    console.error('Error parsing feature flags:', error);
    return {
      realtime: true,
      'banking.approvalFlow': false,
      'fees.dynamic': false
    };
  }
}