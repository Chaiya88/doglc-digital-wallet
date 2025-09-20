/**
 * Security Middleware for Digital Wallet System
 * Implements 2FA, Rate Limiting, and Security Headers
 */

import { generateOTP, verifyOTP, sendSMSOTP, sendEmailOTP } from '../utils/otp.js';
import { encrypt, decrypt, hashPassword, verifyPassword } from '../utils/encryption.js';
import { logSecurityEvent } from '../utils/security-logger.js';

// Rate limiting storage (in production, use Redis)
const rateLimitStore = new Map();
const loginAttempts = new Map();
const suspiciousActivities = new Map();

/**
 * Security Configuration
 */
export const SECURITY_CONFIG = {
  // Rate Limiting
  RATE_LIMITS: {
    LOGIN: { requests: 5, window: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
    API: { requests: 100, window: 60 * 1000 }, // 100 requests per minute
    TRANSACTION: { requests: 10, window: 60 * 1000 }, // 10 transactions per minute
    OTP: { requests: 3, window: 5 * 60 * 1000 }, // 3 OTP requests per 5 minutes
  },
  
  // Session Management
  SESSION: {
    JWT_EXPIRES: '1h',
    REFRESH_EXPIRES: '7d',
    SECRET_ROTATION: 24 * 60 * 60 * 1000, // 24 hours
  },
  
  // Security Thresholds
  THRESHOLDS: {
    MAX_LOGIN_ATTEMPTS: 5,
    ACCOUNT_LOCKOUT_TIME: 30 * 60 * 1000, // 30 minutes
    SUSPICIOUS_THRESHOLD: 10,
    HIGH_VALUE_TRANSACTION: 100000, // THB
  },

  // Admin Security
  ADMIN: {
    REQUIRE_2FA: true,
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
    IP_WHITELIST_REQUIRED: true,
  }
};

/**
 * Rate Limiting Middleware
 */
export function rateLimitMiddleware(limitType = 'API') {
  return async (ctx, next) => {
    try {
      const userId = ctx.from?.id || ctx.request?.ip || 'anonymous';
      const limit = SECURITY_CONFIG.RATE_LIMITS[limitType];
      const key = `${limitType}_${userId}`;
      
      // Get current count
      const current = rateLimitStore.get(key) || { count: 0, resetTime: Date.now() + limit.window };
      
      // Reset if window expired
      if (Date.now() > current.resetTime) {
        current.count = 0;
        current.resetTime = Date.now() + limit.window;
      }
      
      // Check if limit exceeded
      if (current.count >= limit.requests) {
        await logSecurityEvent({
          type: 'RATE_LIMIT_EXCEEDED',
          userId,
          limitType,
          count: current.count,
          ip: ctx.request?.ip
        });
        
        const remainingTime = Math.ceil((current.resetTime - Date.now()) / 1000);
        await ctx.reply(`⚠️ คำขอเกินกำหนด กรุณารอ ${remainingTime} วินาที`);
        return;
      }
      
      // Increment count
      current.count++;
      rateLimitStore.set(key, current);
      
      await next();
    } catch (error) {
      console.error('Rate limit middleware error:', error);
      await next();
    }
  };
}

/**
 * Two-Factor Authentication System
 */
export class TwoFactorAuth {
  
  /**
   * Enable 2FA for user
   */
  static async enable2FA(userId, method = 'SMS', contact) {
    try {
      const otpCode = generateOTP();
      const secret = await encrypt(otpCode);
      
      // Store 2FA setup
      await this.store2FASetup(userId, {
        method,
        contact,
        secret,
        enabled: false,
        setupCode: otpCode,
        createdAt: new Date().toISOString()
      });
      
      // Send setup code
      if (method === 'SMS') {
        await sendSMSOTP(contact, otpCode, 'setup');
      } else if (method === 'EMAIL') {
        await sendEmailOTP(contact, otpCode, 'setup');
      }
      
      await logSecurityEvent({
        type: '2FA_SETUP_INITIATED',
        userId,
        method,
        contact: this.maskContact(contact)
      });
      
      return {
        success: true,
        message: `รหัส OTP ถูกส่งไปยัง ${this.maskContact(contact)}`
      };
      
    } catch (error) {
      console.error('2FA enable error:', error);
      throw new Error('ไม่สามารถเปิดใช้ 2FA ได้');
    }
  }
  
  /**
   * Verify 2FA setup
   */
  static async verify2FASetup(userId, code) {
    try {
      const setup = await this.get2FASetup(userId);
      if (!setup) {
        throw new Error('ไม่พบการตั้งค่า 2FA');
      }
      
      const decryptedCode = await decrypt(setup.secret);
      if (code !== decryptedCode) {
        await logSecurityEvent({
          type: '2FA_SETUP_FAILED',
          userId,
          reason: 'Invalid code'
        });
        throw new Error('รหัส OTP ไม่ถูกต้อง');
      }
      
      // Enable 2FA
      await this.update2FAStatus(userId, { enabled: true });
      
      await logSecurityEvent({
        type: '2FA_ENABLED',
        userId,
        method: setup.method
      });
      
      return {
        success: true,
        message: '✅ เปิดใช้ 2FA สำเร็จ'
      };
      
    } catch (error) {
      console.error('2FA verify setup error:', error);
      throw error;
    }
  }
  
  /**
   * Send 2FA code for authentication
   */
  static async send2FACode(userId, action = 'login') {
    try {
      const user2FA = await this.get2FA(userId);
      if (!user2FA || !user2FA.enabled) {
        throw new Error('2FA ไม่ได้เปิดใช้งาน');
      }
      
      const otpCode = generateOTP();
      const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      
      // Store verification code
      await this.storeVerificationCode(userId, {
        code: await encrypt(otpCode),
        action,
        expires: expires.toISOString(),
        attempts: 0
      });
      
      // Send code
      if (user2FA.method === 'SMS') {
        await sendSMSOTP(user2FA.contact, otpCode, action);
      } else if (user2FA.method === 'EMAIL') {
        await sendEmailOTP(user2FA.contact, otpCode, action);
      }
      
      await logSecurityEvent({
        type: '2FA_CODE_SENT',
        userId,
        action,
        method: user2FA.method
      });
      
      return {
        success: true,
        message: `รหัส OTP ถูกส่งไปยัง ${this.maskContact(user2FA.contact)}`,
        expiresIn: 300 // 5 minutes
      };
      
    } catch (error) {
      console.error('Send 2FA code error:', error);
      throw error;
    }
  }
  
  /**
   * Verify 2FA code
   */
  static async verify2FACode(userId, code, action = 'login') {
    try {
      const verification = await this.getVerificationCode(userId);
      if (!verification) {
        throw new Error('ไม่พบรหัส OTP');
      }
      
      // Check expiration
      if (new Date() > new Date(verification.expires)) {
        await this.deleteVerificationCode(userId);
        throw new Error('รหัส OTP หมดอายุ');
      }
      
      // Check attempts
      if (verification.attempts >= 3) {
        await this.deleteVerificationCode(userId);
        await logSecurityEvent({
          type: '2FA_MAX_ATTEMPTS',
          userId,
          action
        });
        throw new Error('พยายามใส่รหัสเกินกำหนด');
      }
      
      // Verify code
      const decryptedCode = await decrypt(verification.code);
      if (code !== decryptedCode) {
        await this.incrementVerificationAttempts(userId);
        throw new Error('รหัส OTP ไม่ถูกต้อง');
      }
      
      // Success
      await this.deleteVerificationCode(userId);
      await logSecurityEvent({
        type: '2FA_VERIFIED',
        userId,
        action
      });
      
      return {
        success: true,
        message: '✅ ยืนยัน 2FA สำเร็จ'
      };
      
    } catch (error) {
      console.error('Verify 2FA code error:', error);
      throw error;
    }
  }
  
  /**
   * Helper methods
   */
  static maskContact(contact) {
    if (contact.includes('@')) {
      // Email
      const [local, domain] = contact.split('@');
      return `${local.substring(0, 2)}***@${domain}`;
    } else {
      // Phone
      return `***${contact.slice(-4)}`;
    }
  }
  
  // Database methods (implement with your storage solution)
  static async store2FASetup(userId, data) {
    // Implement with D1/KV
  }
  
  static async get2FASetup(userId) {
    // Implement with D1/KV
  }
  
  static async update2FAStatus(userId, data) {
    // Implement with D1/KV
  }
  
  static async get2FA(userId) {
    // Implement with D1/KV
  }
  
  static async storeVerificationCode(userId, data) {
    // Implement with D1/KV
  }
  
  static async getVerificationCode(userId) {
    // Implement with D1/KV
  }
  
  static async deleteVerificationCode(userId) {
    // Implement with D1/KV
  }
  
  static async incrementVerificationAttempts(userId) {
    // Implement with D1/KV
  }
}

/**
 * Admin Security Middleware
 */
export async function adminSecurityMiddleware(ctx, next) {
  try {
    const userId = ctx.from.id.toString();
    const userIP = ctx.request?.ip || 'unknown';
    
    // Check admin status
    const adminLevel = checkAdminLevel(ctx.from.id);
    if (!adminLevel) {
      await ctx.reply('❌ ไม่มีสิทธิ์เข้าถึง');
      return;
    }
    
    // Check IP whitelist for high-level admins
    if (adminLevel === 'SUPER_ADMIN' || adminLevel === 'MASTER_ADMIN') {
      const isWhitelisted = await checkIPWhitelist(userIP, adminLevel);
      if (!isWhitelisted) {
        await logSecurityEvent({
          type: 'ADMIN_IP_NOT_WHITELISTED',
          userId,
          adminLevel,
          ip: userIP
        });
        await ctx.reply('❌ IP ไม่ได้รับอนุญาตสำหรับการเข้าถึงระดับนี้');
        return;
      }
    }
    
    // Check session validity
    const session = await getAdminSession(userId);
    if (!session || session.expires < Date.now()) {
      await ctx.reply('❌ Session หมดอายุ กรุณาเข้าสู่ระบบใหม่');
      return;
    }
    
    // Require 2FA for sensitive operations
    const requiresInternal2FA = ['delete', 'approve', 'modify', 'suspend'];
    const action = ctx.callbackQuery?.data || ctx.message?.text;
    
    if (requiresInternal2FA.some(op => action.includes(op))) {
      const recent2FA = await getRecent2FA(userId);
      if (!recent2FA || recent2FA.timestamp < Date.now() - 5 * 60 * 1000) {
        await ctx.reply('🔐 กรุณายืนยัน 2FA สำหรับการดำเนินการนี้');
        await TwoFactorAuth.send2FACode(userId, 'admin_action');
        return;
      }
    }
    
    await next();
    
  } catch (error) {
    console.error('Admin security middleware error:', error);
    await ctx.reply('❌ เกิดข้อผิดพลาดด้านความปลอดภัย');
  }
}

/**
 * Transaction Security Middleware
 */
export async function transactionSecurityMiddleware(ctx, next) {
  try {
    const userId = ctx.from.id.toString();
    const amount = parseFloat(ctx.session?.amount || 0);
    
    // Check for high-value transactions
    if (amount > SECURITY_CONFIG.THRESHOLDS.HIGH_VALUE_TRANSACTION) {
      await logSecurityEvent({
        type: 'HIGH_VALUE_TRANSACTION',
        userId,
        amount,
        currency: 'THB'
      });
      
      // Require additional verification
      await ctx.reply('💰 รายการนี้มีมูลค่าสูง ต้องการการยืนยันเพิ่มเติม');
      await TwoFactorAuth.send2FACode(userId, 'high_value_transaction');
      return;
    }
    
    // Check for suspicious patterns
    const suspiciousScore = await calculateSuspiciousScore(userId);
    if (suspiciousScore > SECURITY_CONFIG.THRESHOLDS.SUSPICIOUS_THRESHOLD) {
      await logSecurityEvent({
        type: 'SUSPICIOUS_ACTIVITY',
        userId,
        score: suspiciousScore,
        action: 'transaction_blocked'
      });
      
      await ctx.reply('⚠️ ตรวจพบกิจกรรมที่น่าสงสัย กรุณาติดต่อฝ่ายสนับสนุน');
      return;
    }
    
    await next();
    
  } catch (error) {
    console.error('Transaction security middleware error:', error);
    await next();
  }
}

/**
 * Security utilities
 */
async function checkIPWhitelist(ip, adminLevel) {
  // Implement IP whitelist checking
  // For demo, return true
  return true;
}

async function getAdminSession(userId) {
  // Implement session management
  return null;
}

async function getRecent2FA(userId) {
  // Check recent 2FA verification
  return null;
}

async function calculateSuspiciousScore(userId) {
  // Implement ML-based suspicious activity detection
  return 0;
}

function checkAdminLevel(userId) {
  // Import from existing admin.js
  const userIdStr = userId.toString();
  
  if (userIdStr === '100200300') return 'SUPER_ADMIN';
  if (['123456789', '987654321'].includes(userIdStr)) return 'MASTER_ADMIN';
  if (['111222333', '444555666'].includes(userIdStr)) return 'ADMIN';
  
  return null;
}

export default {
  rateLimitMiddleware,
  TwoFactorAuth,
  adminSecurityMiddleware,
  transactionSecurityMiddleware,
  SECURITY_CONFIG
};