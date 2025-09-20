/**
 * OTP (One-Time Password) System for Digital Wallet
 * Supports SMS and Email OTP with multiple providers
 */

import crypto from 'crypto';

/**
 * OTP Configuration
 */
const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRES: 5 * 60 * 1000, // 5 minutes
  MAX_ATTEMPTS: 3,
  RESEND_COOLDOWN: 60 * 1000, // 1 minute
  
  // SMS Providers
  SMS_PROVIDERS: {
    TWILIO: {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      from: process.env.TWILIO_PHONE_NUMBER
    },
    AWS_SNS: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'ap-southeast-1'
    }
  },
  
  // Email Provider
  EMAIL_PROVIDER: {
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT || 587,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    FROM_EMAIL: process.env.FROM_EMAIL || 'noreply@doglc-wallet.com'
  }
};

/**
 * Generate OTP code
 */
export function generateOTP(length = OTP_CONFIG.LENGTH) {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate secure OTP with crypto
 */
export function generateSecureOTP(length = OTP_CONFIG.LENGTH) {
  const bytes = crypto.randomBytes(length);
  const digits = Array.from(bytes, byte => byte % 10);
  return parseInt(digits.join(''));
}

/**
 * OTP Storage Manager
 */
class OTPStorage {
  static otpStore = new Map(); // In production, use Redis or Database
  
  static async store(userId, otp, purpose = 'login', expiresIn = OTP_CONFIG.EXPIRES) {
    const key = `otp_${userId}_${purpose}`;
    const data = {
      code: otp,
      attempts: 0,
      expires: Date.now() + expiresIn,
      purpose,
      createdAt: Date.now()
    };
    
    this.otpStore.set(key, data);
    return data;
  }
  
  static async get(userId, purpose = 'login') {
    const key = `otp_${userId}_${purpose}`;
    return this.otpStore.get(key) || null;
  }
  
  static async delete(userId, purpose = 'login') {
    const key = `otp_${userId}_${purpose}`;
    return this.otpStore.delete(key);
  }
  
  static async incrementAttempts(userId, purpose = 'login') {
    const key = `otp_${userId}_${purpose}`;
    const data = this.otpStore.get(key);
    if (data) {
      data.attempts++;
      this.otpStore.set(key, data);
    }
    return data;
  }
  
  static async cleanup() {
    const now = Date.now();
    for (const [key, data] of this.otpStore.entries()) {
      if (data.expires < now) {
        this.otpStore.delete(key);
      }
    }
  }
}

/**
 * SMS OTP Service
 */
export class SMSOTPService {
  
  /**
   * Send SMS OTP via Twilio
   */
  static async sendViaTwilio(phoneNumber, otp, purpose = 'login') {
    try {
      // Import Twilio (install: npm install twilio)
      const twilio = require('twilio');
      const client = twilio(
        OTP_CONFIG.SMS_PROVIDERS.TWILIO.accountSid,
        OTP_CONFIG.SMS_PROVIDERS.TWILIO.authToken
      );
      
      const message = this.formatSMSMessage(otp, purpose);
      
      const result = await client.messages.create({
        body: message,
        from: OTP_CONFIG.SMS_PROVIDERS.TWILIO.from,
        to: phoneNumber
      });
      
      return {
        success: true,
        messageId: result.sid,
        provider: 'twilio'
      };
      
    } catch (error) {
      console.error('Twilio SMS error:', error);
      throw new Error('Failed to send SMS via Twilio');
    }
  }
  
  /**
   * Send SMS OTP via AWS SNS
   */
  static async sendViaAWSSNS(phoneNumber, otp, purpose = 'login') {
    try {
      // Import AWS SDK (install: npm install aws-sdk)
      const AWS = require('aws-sdk');
      const sns = new AWS.SNS({
        accessKeyId: OTP_CONFIG.SMS_PROVIDERS.AWS_SNS.accessKeyId,
        secretAccessKey: OTP_CONFIG.SMS_PROVIDERS.AWS_SNS.secretAccessKey,
        region: OTP_CONFIG.SMS_PROVIDERS.AWS_SNS.region
      });
      
      const message = this.formatSMSMessage(otp, purpose);
      
      const params = {
        Message: message,
        PhoneNumber: phoneNumber,
        MessageAttributes: {
          'AWS.SNS.SMS.SMSType': {
            DataType: 'String',
            StringValue: 'Transactional'
          }
        }
      };
      
      const result = await sns.publish(params).promise();
      
      return {
        success: true,
        messageId: result.MessageId,
        provider: 'aws-sns'
      };
      
    } catch (error) {
      console.error('AWS SNS error:', error);
      throw new Error('Failed to send SMS via AWS SNS');
    }
  }
  
  /**
   * Format SMS message based on purpose
   */
  static formatSMSMessage(otp, purpose) {
    const messages = {
      login: `รหัส OTP สำหรับเข้าสู่ระบบ DOGLC Wallet: ${otp}\nใช้ได้ 5 นาที อย่าแชร์ใครอื่น`,
      setup: `รหัส OTP สำหรับตั้งค่า 2FA: ${otp}\nใช้ได้ 5 นาที`,
      transaction: `รหัส OTP สำหรับทำรายการ: ${otp}\nใช้ได้ 5 นาที`,
      withdrawal: `รหัส OTP สำหรับถอนเงิน: ${otp}\nใช้ได้ 5 นาที`,
      admin_action: `รหัส OTP สำหรับผู้ดูแลระบบ: ${otp}\nใช้ได้ 5 นาที`,
      high_value_transaction: `รหัส OTP สำหรับรายการมูลค่าสูง: ${otp}\nใช้ได้ 5 นาที`
    };
    
    return messages[purpose] || `รหัส OTP ของคุณ: ${otp}\nใช้ได้ 5 นาที`;
  }
  
  /**
   * Validate phone number format
   */
  static validatePhoneNumber(phoneNumber) {
    // Thai phone number validation
    const thaiMobileRegex = /^(\+66|0)[6-9]\d{8}$/;
    return thaiMobileRegex.test(phoneNumber);
  }
  
  /**
   * Format phone number for international sending
   */
  static formatPhoneNumber(phoneNumber) {
    // Convert Thai format to international
    if (phoneNumber.startsWith('0')) {
      return '+66' + phoneNumber.substring(1);
    }
    if (!phoneNumber.startsWith('+')) {
      return '+66' + phoneNumber;
    }
    return phoneNumber;
  }
}

/**
 * Email OTP Service
 */
export class EmailOTPService {
  
  /**
   * Send Email OTP
   */
  static async send(email, otp, purpose = 'login') {
    try {
      // Import nodemailer (install: npm install nodemailer)
      const nodemailer = require('nodemailer');
      
      const transporter = nodemailer.createTransporter({
        host: OTP_CONFIG.EMAIL_PROVIDER.SMTP_HOST,
        port: OTP_CONFIG.EMAIL_PROVIDER.SMTP_PORT,
        secure: OTP_CONFIG.EMAIL_PROVIDER.SMTP_PORT === 465,
        auth: {
          user: OTP_CONFIG.EMAIL_PROVIDER.SMTP_USER,
          pass: OTP_CONFIG.EMAIL_PROVIDER.SMTP_PASS
        }
      });
      
      const { subject, html } = this.formatEmailMessage(otp, purpose);
      
      const mailOptions = {
        from: `"DOGLC Digital Wallet" <${OTP_CONFIG.EMAIL_PROVIDER.FROM_EMAIL}>`,
        to: email,
        subject,
        html
      };
      
      const result = await transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: result.messageId,
        provider: 'smtp'
      };
      
    } catch (error) {
      console.error('Email OTP error:', error);
      throw new Error('Failed to send email OTP');
    }
  }
  
  /**
   * Format email message
   */
  static formatEmailMessage(otp, purpose) {
    const templates = {
      login: {
        subject: 'รหัส OTP สำหรับเข้าสู่ระบบ',
        html: this.generateEmailHTML(otp, 'เข้าสู่ระบบ DOGLC Wallet', 'login')
      },
      setup: {
        subject: 'รหัส OTP สำหรับตั้งค่า 2FA',
        html: this.generateEmailHTML(otp, 'ตั้งค่าการยืนยันตัวตน 2 ขั้นตอน', 'setup')
      },
      transaction: {
        subject: 'รหัส OTP สำหรับทำรายการ',
        html: this.generateEmailHTML(otp, 'ยืนยันการทำรายการ', 'transaction')
      },
      withdrawal: {
        subject: 'รหัส OTP สำหรับถอนเงิน',
        html: this.generateEmailHTML(otp, 'ยืนยันการถอนเงิน', 'withdrawal')
      }
    };
    
    return templates[purpose] || {
      subject: 'รหัส OTP จาก DOGLC Wallet',
      html: this.generateEmailHTML(otp, 'ยืนยันตัวตน', 'general')
    };
  }
  
  /**
   * Generate HTML email template
   */
  static generateEmailHTML(otp, title, purpose) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; text-align: center; }
            .otp-code { background: #f8f9fa; border: 2px dashed #6c757d; border-radius: 8px; padding: 20px; margin: 20px 0; font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #495057; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0; color: #856404; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; }
            .btn { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🐕 DOGLC Digital Wallet</h1>
                <p>${title}</p>
            </div>
            <div class="content">
                <h2>รหัสยืนยันตัวตน (OTP)</h2>
                <div class="otp-code">${otp}</div>
                <p>กรุณาใส่รหัสนี้เพื่อ${title}</p>
                <div class="warning">
                    <strong>⚠️ ข้อควรระวัง:</strong><br>
                    • รหัสนี้ใช้ได้เพียง 5 นาที<br>
                    • อย่าแชร์รหัสนี้กับใครอื่น<br>
                    • หากไม่ได้ร้องขอ กรุณาติดต่อฝ่ายสนับสนุน
                </div>
                <p>หากคุณมีคำถาม สามารถติดต่อทีมสนับสนุนได้ตลอด 24 ชั่วโมง</p>
            </div>
            <div class="footer">
                <p>© 2025 DOGLC Digital Wallet. All rights reserved.</p>
                <p>อีเมลนี้ถูกส่งแบบอัตโนมัติ กรุณาอย่าตอบกลับ</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }
  
  /**
   * Validate email format
   */
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

/**
 * Main OTP Service
 */
export class OTPService {
  
  /**
   * Send OTP
   */
  static async sendOTP(userId, contact, method = 'SMS', purpose = 'login') {
    try {
      // Check resend cooldown
      const lastSent = await this.getLastSentTime(userId, purpose);
      if (lastSent && Date.now() - lastSent < OTP_CONFIG.RESEND_COOLDOWN) {
        const remainingTime = Math.ceil((OTP_CONFIG.RESEND_COOLDOWN - (Date.now() - lastSent)) / 1000);
        throw new Error(`กรุณารอ ${remainingTime} วินาที ก่อนขอรหัสใหม่`);
      }
      
      // Generate OTP
      const otp = generateSecureOTP();
      
      // Store OTP
      await OTPStorage.store(userId, otp, purpose);
      
      // Send based on method
      let result;
      if (method === 'SMS') {
        if (!SMSOTPService.validatePhoneNumber(contact)) {
          throw new Error('รูปแบบเบอร์โทรไม่ถูกต้อง');
        }
        const formattedPhone = SMSOTPService.formatPhoneNumber(contact);
        result = await SMSOTPService.sendViaTwilio(formattedPhone, otp, purpose);
      } else if (method === 'EMAIL') {
        if (!EmailOTPService.validateEmail(contact)) {
          throw new Error('รูปแบบอีเมลไม่ถูกต้อง');
        }
        result = await EmailOTPService.send(contact, otp, purpose);
      } else {
        throw new Error('วิธีการส่ง OTP ไม่ถูกต้อง');
      }
      
      // Update last sent time
      await this.updateLastSentTime(userId, purpose);
      
      return {
        success: true,
        message: `รหัส OTP ถูกส่งไปยัง ${this.maskContact(contact, method)}`,
        expiresIn: OTP_CONFIG.EXPIRES / 1000,
        provider: result.provider
      };
      
    } catch (error) {
      console.error('Send OTP error:', error);
      throw error;
    }
  }
  
  /**
   * Verify OTP
   */
  static async verifyOTP(userId, inputOTP, purpose = 'login') {
    try {
      const storedOTP = await OTPStorage.get(userId, purpose);
      
      if (!storedOTP) {
        throw new Error('ไม่พบรหัส OTP กรุณาขอรหัสใหม่');
      }
      
      // Check expiration
      if (Date.now() > storedOTP.expires) {
        await OTPStorage.delete(userId, purpose);
        throw new Error('รหัส OTP หมดอายุ กรุณาขอรหัสใหม่');
      }
      
      // Check max attempts
      if (storedOTP.attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
        await OTPStorage.delete(userId, purpose);
        throw new Error('ใส่รหัสผิดเกินกำหนด กรุณาขอรหัสใหม่');
      }
      
      // Verify OTP
      if (parseInt(inputOTP) !== storedOTP.code) {
        await OTPStorage.incrementAttempts(userId, purpose);
        const remainingAttempts = OTP_CONFIG.MAX_ATTEMPTS - storedOTP.attempts - 1;
        throw new Error(`รหัส OTP ไม่ถูกต้อง เหลือโอกาส ${remainingAttempts} ครั้ง`);
      }
      
      // Success - delete OTP
      await OTPStorage.delete(userId, purpose);
      
      return {
        success: true,
        message: '✅ ยืนยัน OTP สำเร็จ'
      };
      
    } catch (error) {
      console.error('Verify OTP error:', error);
      throw error;
    }
  }
  
  /**
   * Helper methods
   */
  static maskContact(contact, method) {
    if (method === 'EMAIL') {
      const [local, domain] = contact.split('@');
      return `${local.substring(0, 2)}***@${domain}`;
    } else {
      return `***${contact.slice(-4)}`;
    }
  }
  
  static async getLastSentTime(userId, purpose) {
    // Implement with your storage solution
    return null;
  }
  
  static async updateLastSentTime(userId, purpose) {
    // Implement with your storage solution
  }
}

/**
 * Convenient wrapper functions
 */
export async function sendSMSOTP(phoneNumber, otp, purpose = 'login') {
  return SMSOTPService.sendViaTwilio(phoneNumber, otp, purpose);
}

export async function sendEmailOTP(email, otp, purpose = 'login') {
  return EmailOTPService.send(email, otp, purpose);
}

export function verifyOTP(userId, inputOTP, purpose = 'login') {
  return OTPService.verifyOTP(userId, inputOTP, purpose);
}

// Cleanup expired OTPs every minute
setInterval(() => {
  OTPStorage.cleanup();
}, 60 * 1000);

export default {
  generateOTP,
  generateSecureOTP,
  OTPService,
  SMSOTPService,
  EmailOTPService,
  sendSMSOTP,
  sendEmailOTP,
  verifyOTP,
  OTP_CONFIG
};