/**
 * Utility Functions for DOGLC Digital Wallet Bot
 * Helper functions for validation, security, formatting, etc.
 */

/**
 * Validation Functions
 */

/**
 * Validate USDT amount
 * @param {string|number} amount - Amount to validate
 * @returns {object} Validation result
 */
export function validateAmount(amount) {
  try {
    const num = parseFloat(amount);
    
    if (isNaN(num)) {
      return { valid: false, error: 'ยอดเงินไม่ถูกต้อง' };
    }
    
    if (num <= 0) {
      return { valid: false, error: 'ยอดเงินต้องมากกว่า 0' };
    }
    
    if (num < 1) {
      return { valid: false, error: 'ยอดเงินขั้นต่ำ 1 USDT' };
    }
    
    if (num > 50000) {
      return { valid: false, error: 'ยอดเงินสูงสุด 50,000 USDT ต่อวัน' };
    }
    
    // Check decimal places (max 8 for USDT)
    const decimalPlaces = (num.toString().split('.')[1] || '').length;
    if (decimalPlaces > 8) {
      return { valid: false, error: 'ทศนิยมสูงสุด 8 ตำแหน่ง' };
    }
    
    return { valid: true, amount: num };
    
  } catch (error) {
    return { valid: false, error: 'ยอดเงินไม่ถูกต้อง' };
  }
}

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @returns {object} Validation result
 */
export function validatePhoneNumber(phone) {
  try {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Check Thai phone number patterns
    const thaiPatterns = [
      /^66[0-9]{9}$/,     // +66 format
      /^0[0-9]{9}$/,      // 0 prefix format
      /^[0-9]{10}$/       // 10 digits
    ];
    
    const isValid = thaiPatterns.some(pattern => pattern.test(cleaned));
    
    if (!isValid) {
      return { valid: false, error: 'เบอร์โทรศัพท์ไม่ถูกต้อง' };
    }
    
    // Normalize to international format
    let normalized = cleaned;
    if (normalized.startsWith('0')) {
      normalized = '66' + normalized.substring(1);
    } else if (!normalized.startsWith('66')) {
      normalized = '66' + normalized;
    }
    
    return { valid: true, phone: normalized };
    
  } catch (error) {
    return { valid: false, error: 'เบอร์โทรศัพท์ไม่ถูกต้อง' };
  }
}

/**
 * Validate wallet address
 * @param {string} address - Wallet address to validate
 * @returns {object} Validation result
 */
export function validateWalletAddress(address) {
  try {
    if (!address || typeof address !== 'string') {
      return { valid: false, error: 'ที่อยู่กระเป๋าเงินไม่ถูกต้อง' };
    }
    
    const trimmed = address.trim();
    
    // Basic wallet address patterns
    const patterns = [
      /^user_[0-9]+$/,              // Internal user format
      /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/, // Bitcoin format
      /^0x[a-fA-F0-9]{40}$/,        // Ethereum format
      /^T[A-Za-z1-9]{33}$/          // TRON format
    ];
    
    const isValid = patterns.some(pattern => pattern.test(trimmed));
    
    if (!isValid) {
      return { valid: false, error: 'รูปแบบที่อยู่กระเป๋าเงินไม่ถูกต้อง' };
    }
    
    return { valid: true, address: trimmed };
    
  } catch (error) {
    return { valid: false, error: 'ที่อยู่กระเป๋าเงินไม่ถูกต้อง' };
  }
}

/**
 * Validate username
 * @param {string} username - Username to validate
 * @returns {object} Validation result
 */
export function validateUsername(username) {
  try {
    if (!username || typeof username !== 'string') {
      return { valid: false, error: 'ชื่อผู้ใช้ไม่ถูกต้อง' };
    }
    
    // Remove @ if present
    const cleaned = username.replace('@', '');
    
    // Telegram username pattern
    const pattern = /^[a-zA-Z0-9_]{5,32}$/;
    
    if (!pattern.test(cleaned)) {
      return { valid: false, error: 'ชื่อผู้ใช้ต้องมี 5-32 ตัวอักษร (a-z, 0-9, _)' };
    }
    
    return { valid: true, username: cleaned };
    
  } catch (error) {
    return { valid: false, error: 'ชื่อผู้ใช้ไม่ถูกต้อง' };
  }
}

/**
 * Security Functions
 */

/**
 * Sanitize input string
 * @param {string} input - Input string to sanitize
 * @returns {string} Sanitized string
 */
export function sanitizeInput(input) {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML
    .replace(/[\\]/g, '') // Remove backslashes
    .substring(0, 1000);  // Limit length
}

/**
 * Generate transaction ID
 * @returns {string} Unique transaction ID
 */
export function generateTransactionId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `tx_${timestamp}_${random}`.toUpperCase();
}

/**
 * Generate secure PIN
 * @returns {string} 6-digit PIN
 */
export function generatePIN() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Hash sensitive data (simple hash for demo)
 * @param {string} data - Data to hash
 * @returns {string} Hashed data
 */
export function hashData(data) {
  // Simple hash implementation for demo
  // In production, use proper cryptographic hash
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Formatting Functions
 */

/**
 * Format USDT amount
 * @param {number} amount - Amount to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted amount
 */
export function formatUSDT(amount, decimals = 2) {
  const num = parseFloat(amount) || 0;
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: 8
  }).format(num);
}

/**
 * Format Thai Baht
 * @param {number} amount - Amount to format
 * @returns {string} Formatted amount
 */
export function formatTHB(amount) {
  const num = parseFloat(amount) || 0;
  
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB'
  }).format(num);
}

/**
 * Format percentage
 * @param {number} value - Value to format as percentage
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
export function formatPercentage(value, decimals = 2) {
  const num = parseFloat(value) || 0;
  return (num * 100).toFixed(decimals) + '%';
}

/**
 * Utility Functions
 */

/**
 * Check if user is rate limited
 * @param {object} env - Environment object
 * @param {string} userId - User ID
 * @param {string} action - Action type
 * @returns {Promise<boolean>} True if rate limited
 */
export async function checkRateLimit(env, userId, action = 'default') {
  try {
    if (!env.RATE_LIMIT_KV) return false;
    
    const limits = {
      default: { requests: 30, window: 60 },
      wallet: { requests: 10, window: 60 },
      send: { requests: 5, window: 300 }
    };
    
    const limit = limits[action] || limits.default;
    const key = `rate_limit:${userId}:${action}`;
    
    const current = await env.RATE_LIMIT_KV.get(key);
    const count = current ? parseInt(current) : 0;
    
    return count >= limit.requests;
    
  } catch (error) {
    console.error('Rate limit check error:', error);
    return false;
  }
}

/**
 * Sleep function
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after delay
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Truncate string
 * @param {string} str - String to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated string
 */
export function truncateString(str, length = 50) {
  if (!str || str.length <= length) {
    return str;
  }
  
  return str.substring(0, length - 3) + '...';
}

/**
 * Parse callback data
 * @param {string} data - Callback data string
 * @returns {object} Parsed data object
 */
export function parseCallbackData(data) {
  try {
    const parts = data.split('_');
    return {
      action: parts[0],
      type: parts[1],
      value: parts.slice(2).join('_')
    };
  } catch (error) {
    return { action: data, type: null, value: null };
  }
}

/**
 * Get random element from array
 * @param {Array} array - Array to pick from
 * @returns {*} Random element
 */
export function getRandomElement(array) {
  if (!array || array.length === 0) {
    return null;
  }
  
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Chunk array into smaller arrays
 * @param {Array} array - Array to chunk
 * @param {number} size - Chunk size
 * @returns {Array} Array of chunks
 */
export function chunkArray(array, size) {
  if (!array || size <= 0) {
    return [];
  }
  
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  
  return chunks;
}

/**
 * Escape HTML entities
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
export function escapeHTML(text) {
  if (!text) return '';
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Get user display name
 * @param {object} user - User object from Telegram
 * @returns {string} Display name
 */
export function getUserDisplayName(user) {
  if (!user) return 'Unknown User';
  
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`;
  }
  
  return user.first_name || user.username || 'Unknown User';
}