/**
 * Enhanced utility functions for the digital wallet bot
 * Includes security, validation, OCR processing, and banking operations
 */

import crypto from 'crypto';

/**
 * Format Thai Baht currency for multiple languages
 * @param {number} amount - Amount to format
 * @param {string} languageCode - Language code (th, en, zh, km, ko, id)
 * @returns {string} Formatted amount
 */
export function formatCurrency(amount, languageCode = 'th') {
  const localeMap = {
    th: 'th-TH',
    en: 'en-US', 
    zh: 'zh-CN',
    km: 'km-KH',
    ko: 'ko-KR',
    id: 'id-ID'
  };
  
  const locale = localeMap[languageCode] || 'th-TH';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2
  }).format(amount);
}

/**
 * Format date/time for multiple languages
 * @param {Date} date - Date to format
 * @param {string} languageCode - Language code
 * @returns {string} Formatted date
 */
export function formatDateTime(date, languageCode = 'th') {
  const localeMap = {
    th: 'th-TH',
    en: 'en-US',
    zh: 'zh-CN', 
    km: 'km-KH',
    ko: 'ko-KR',
    id: 'id-ID'
  };
  
  const locale = localeMap[languageCode] || 'th-TH';
  
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

/**
 * Generate a simple wallet address (mock)
 * @returns {string} Mock wallet address
 */
export function generateWalletAddress() {
  const chars = '0123456789abcdef';
  let address = '0x';
  for (let i = 0; i < 40; i++) {
    address += chars[Math.floor(Math.random() * chars.length)];
  }
  return address;
}

/**
 * Validate Thai phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Is valid phone number
 */
export function validateThaiPhone(phone) {
  const thaiPhoneRegex = /^(\+66|0)[0-9]{8,9}$/;
  return thaiPhoneRegex.test(phone);
}

/**
 * Format Thai date
 * @param {Date} date - Date to format
 * @returns {string} Formatted Thai date
 * @deprecated Use formatDateTime instead for multi-language support
 */
export function formatThaiDate(date) {
  return formatDateTime(date, 'th');
}

/**
 * Generate transaction ID
 * @returns {string} Unique transaction ID
 */
export function generateTransactionId() {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substr(2, 9);
  return `TXN${timestamp}${random}`.toUpperCase();
}

/**
 * Sanitize user input
 * @param {string} input - User input to sanitize
 * @returns {string} Sanitized input
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[<>&"']/g, '');
}

/**
 * Check if amount is valid
 * @param {string|number} amount - Amount to validate
 * @returns {boolean} Is valid amount
 */
export function isValidAmount(amount) {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0 && num <= 1000000; // Max 1M THB
}

/**
 * Rate limiting helper
 * @param {string} userId - User ID
 * @param {Object} storage - Storage object (KV)
 * @param {number} maxRequests - Max requests per minute
 * @returns {Promise<boolean>} Is within rate limit
 */
export async function checkRateLimit(userId, storage, maxRequests = 10) {
  const key = `rate_limit_${userId}`;
  const now = Math.floor(Date.now() / 60000); // Current minute
  
  try {
    const data = await storage.get(key);
    const rateData = data ? JSON.parse(data) : { minute: now, count: 0 };
    
    if (rateData.minute !== now) {
      // New minute, reset counter
      await storage.put(key, JSON.stringify({ minute: now, count: 1 }), { expirationTtl: 120 });
      return true;
    }
    
    if (rateData.count >= maxRequests) {
      return false; // Rate limit exceeded
    }
    
    // Increment counter
    rateData.count++;
    await storage.put(key, JSON.stringify(rateData), { expirationTtl: 120 });
    return true;
    
  } catch (error) {
    console.error('Rate limit check error:', error);
    return true; // Allow on error
  }
}

/**
 * Enhanced security functions
 */

/**
 * Hash user ID for privacy protection
 */
export function hashUserId(userId) {
  return crypto.createHash('sha256').update(userId.toString()).digest('hex').substring(0, 12);
}

/**
 * Sanitize user input to prevent injection attacks
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  // Remove potentially dangerous characters
  return input
    .replace(/[<>\"'&]/g, '') // Remove HTML/script characters
    .replace(/javascript:/gi, '') // Remove javascript protocol
    .replace(/data:/gi, '') // Remove data protocol
    .trim()
    .substring(0, 1000); // Limit length
}

/**
 * Validate Thai phone number
 */
export function validateThaiPhone(phone) {
  const phoneRegex = /^(\+66|66|0)(2|3|6|7|8|9)\d{8}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
}

/**
 * Validate cryptocurrency address
 */
export function validateCryptoAddress(address, type = 'USDT') {
  switch (type.toUpperCase()) {
    case 'USDT':
    case 'TRX':
      // TRON address validation
      return /^T[A-Za-z1-9]{33}$/.test(address);
    case 'BTC':
      // Bitcoin address validation (simplified)
      return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address) || 
             /^bc1[a-z0-9]{39,59}$/.test(address);
    case 'ETH':
      // Ethereum address validation
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    default:
      return false;
  }
}

/**
 * Generate secure random ID
 */
export function generateSecureId(prefix = '', length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = prefix;
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Validate transaction amount
 */
export function validateAmount(amount, min = 1, max = 1000000) {
  const numAmount = parseFloat(amount);
  
  if (isNaN(numAmount)) return { valid: false, error: 'Invalid number format' };
  if (numAmount < min) return { valid: false, error: `Minimum amount is ${min}` };
  if (numAmount > max) return { valid: false, error: `Maximum amount is ${max}` };
  if (!/^\d+(\.\d{1,2})?$/.test(amount.toString())) {
    return { valid: false, error: 'Invalid decimal format' };
  }
  
  return { valid: true, amount: numAmount };
}

/**
 * Calculate transaction fee
 */
export function calculateFee(amount, feeRate = 0.02, minFee = 10, maxFee = 500) {
  const fee = Math.max(minFee, Math.min(maxFee, amount * feeRate));
  return Math.round(fee * 100) / 100; // Round to 2 decimal places
}

/**
 * Enhanced OCR text processing for Thai banking slips
 */
export function parseThaiSlipText(text) {
  // Common Thai banking slip patterns
  const patterns = {
    amount: [
      /จำนวนเงิน[:\s]*([0-9,]+\.?\d*)/i,
      /amount[:\s]*([0-9,]+\.?\d*)/i,
      /([0-9,]+\.?\d*)[:\s]*บาท/i
    ],
    account: [
      /เลขที่บัญชี[:\s]*([0-9\-\s]+)/i,
      /account[:\s]*([0-9\-\s]+)/i,
      /(\d{3}-?\d{1}-?\d{5}-?\d{1})/
    ],
    reference: [
      /อ้างอิง[:\s]*([A-Z0-9]+)/i,
      /ref[:\s]*([A-Z0-9]+)/i,
      /reference[:\s]*([A-Z0-9]+)/i
    ],
    bank: [
      /(กสิกรไทย|kasikorn|kbank)/i,
      /(ไทยพาณิชย์|scb|siam)/i,
      /(กรุงเทพ|bangkok|bbl)/i,
      /(กรุงไทย|krung thai|ktb)/i,
      /(ทหารไทย|tmb|thanachart)/i
    ]
  };

  const result = {};

  // Extract information using patterns
  for (const [key, patternArray] of Object.entries(patterns)) {
    for (const pattern of patternArray) {
      const match = text.match(pattern);
      if (match) {
        result[key] = match[1]?.trim() || match[0]?.trim();
        break;
      }
    }
  }

  // Clean up extracted data
  if (result.amount) {
    result.amount = parseFloat(result.amount.replace(/,/g, '')) || null;
  }

  if (result.account) {
    result.account = result.account.replace(/[\s-]/g, '');
  }

  return result;
}

/**
 * Security event logging with enhanced details
 */
export async function logSecurityEvent(eventType, userId, data, env) {
  if (!env.AUDIT_LOG_KV) return;

  const logEntry = {
    event_type: eventType,
    user_id: userId ? hashUserId(userId) : null,
    timestamp: new Date().toISOString(),
    data: data || {},
    ip_hash: data?.ip ? crypto.createHash('sha256').update(data.ip).digest('hex').substring(0, 16) : null,
    user_agent_hash: data?.user_agent ? crypto.createHash('sha256').update(data.user_agent).digest('hex').substring(0, 16) : null
  };

  const key = `security_${eventType}_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  
  try {
    await env.AUDIT_LOG_KV.put(key, JSON.stringify(logEntry), {
      expirationTtl: 86400 * 30 // Keep for 30 days
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

/**
 * Log user activity for analytics
 */
export async function logUserActivity(userId, activity, env) {
  if (!env.USER_ACTIVITY_KV) return;

  const activityEntry = {
    user_id: hashUserId(userId),
    ...activity,
    timestamp: activity.timestamp || new Date().toISOString()
  };

  const key = `activity_${hashUserId(userId)}_${Date.now()}`;
  
  try {
    await env.USER_ACTIVITY_KV.put(key, JSON.stringify(activityEntry), {
      expirationTtl: 86400 * 7 // Keep for 7 days
    });
  } catch (error) {
    console.error('Failed to log user activity:', error);
  }
}

/**
 * Log performance metrics
 */
export async function logPerformanceMetric(metricType, data, env) {
  if (!env.PERFORMANCE_KV) return;

  const metricEntry = {
    metric_type: metricType,
    timestamp: new Date().toISOString(),
    ...data
  };

  const key = `perf_${metricType}_${Date.now()}`;
  
  try {
    await env.PERFORMANCE_KV.put(key, JSON.stringify(metricEntry), {
      expirationTtl: 86400 * 3 // Keep for 3 days
    });
  } catch (error) {
    console.error('Failed to log performance metric:', error);
  }
}

/**
 * Get user state from session storage
 */
export async function getUserState(userId, env) {
  if (!env.USER_SESSIONS) return null;

  try {
    const data = await env.USER_SESSIONS.get(`state_${userId}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to get user state:', error);
    return null;
  }
}

/**
 * Set user state in session storage
 */
export async function setUserState(userId, state, env, ttl = 3600) {
  if (!env.USER_SESSIONS) return;

  try {
    await env.USER_SESSIONS.put(
      `state_${userId}`, 
      JSON.stringify(state), 
      { expirationTtl: ttl }
    );
  } catch (error) {
    console.error('Failed to set user state:', error);
  }
}

/**
 * Clear user state
 */
export async function clearUserState(userId, env) {
  if (!env.USER_SESSIONS) return;

  try {
    await env.USER_SESSIONS.delete(`state_${userId}`);
  } catch (error) {
    console.error('Failed to clear user state:', error);
  }
}