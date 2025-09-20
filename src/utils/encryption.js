/**
 * Encryption Utilities for Digital Wallet System
 * Provides AES encryption, password hashing, and cryptographic functions
 */

import crypto from 'crypto';

/**
 * Encryption Configuration
 */
const ENCRYPTION_CONFIG = {
  ALGORITHM: 'aes-256-gcm',
  KEY_LENGTH: 32,
  IV_LENGTH: 16,
  TAG_LENGTH: 16,
  SALT_LENGTH: 32,
  ITERATIONS: 100000, // PBKDF2 iterations
};

/**
 * Get encryption key from environment or generate
 */
function getEncryptionKey() {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable not set');
  }
  return Buffer.from(key, 'hex');
}

/**
 * Generate secure random key
 */
export function generateEncryptionKey() {
  return crypto.randomBytes(ENCRYPTION_CONFIG.KEY_LENGTH).toString('hex');
}

/**
 * Encrypt sensitive data
 */
export function encrypt(text) {
  try {
    if (!text) return null;
    
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(ENCRYPTION_CONFIG.IV_LENGTH);
    const cipher = crypto.createCipher(ENCRYPTION_CONFIG.ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    // Combine iv + tag + encrypted data
    return iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted;
    
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt sensitive data
 */
export function decrypt(encryptedData) {
  try {
    if (!encryptedData) return null;
    
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }
    
    const key = getEncryptionKey();
    const iv = Buffer.from(parts[0], 'hex');
    const tag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipher(ENCRYPTION_CONFIG.ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
    
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Hash password with salt
 */
export function hashPassword(password) {
  try {
    const salt = crypto.randomBytes(ENCRYPTION_CONFIG.SALT_LENGTH);
    const hash = crypto.pbkdf2Sync(
      password, 
      salt, 
      ENCRYPTION_CONFIG.ITERATIONS, 
      ENCRYPTION_CONFIG.KEY_LENGTH, 
      'sha256'
    );
    
    return salt.toString('hex') + ':' + hash.toString('hex');
    
  } catch (error) {
    console.error('Password hashing error:', error);
    throw new Error('Failed to hash password');
  }
}

/**
 * Verify password against hash
 */
export function verifyPassword(password, hashedPassword) {
  try {
    const parts = hashedPassword.split(':');
    if (parts.length !== 2) {
      return false;
    }
    
    const salt = Buffer.from(parts[0], 'hex');
    const hash = Buffer.from(parts[1], 'hex');
    
    const testHash = crypto.pbkdf2Sync(
      password, 
      salt, 
      ENCRYPTION_CONFIG.ITERATIONS, 
      ENCRYPTION_CONFIG.KEY_LENGTH, 
      'sha256'
    );
    
    return crypto.timingSafeEqual(hash, testHash);
    
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Generate secure token
 */
export function generateSecureToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate API key
 */
export function generateAPIKey() {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(16).toString('hex');
  return `dw_${timestamp}_${random}`;
}

/**
 * Hash data for integrity checking
 */
export function hashData(data) {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

/**
 * Verify data integrity
 */
export function verifyDataIntegrity(data, hash) {
  const computedHash = hashData(data);
  return crypto.timingSafeEqual(
    Buffer.from(hash, 'hex'),
    Buffer.from(computedHash, 'hex')
  );
}

/**
 * Encrypt file data
 */
export function encryptFile(buffer) {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(ENCRYPTION_CONFIG.IV_LENGTH);
    const cipher = crypto.createCipher(ENCRYPTION_CONFIG.ALGORITHM, key, iv);
    
    const encrypted = Buffer.concat([
      cipher.update(buffer),
      cipher.final()
    ]);
    
    const tag = cipher.getAuthTag();
    
    return Buffer.concat([iv, tag, encrypted]);
    
  } catch (error) {
    console.error('File encryption error:', error);
    throw new Error('Failed to encrypt file');
  }
}

/**
 * Decrypt file data
 */
export function decryptFile(encryptedBuffer) {
  try {
    const key = getEncryptionKey();
    const iv = encryptedBuffer.slice(0, ENCRYPTION_CONFIG.IV_LENGTH);
    const tag = encryptedBuffer.slice(
      ENCRYPTION_CONFIG.IV_LENGTH, 
      ENCRYPTION_CONFIG.IV_LENGTH + ENCRYPTION_CONFIG.TAG_LENGTH
    );
    const encrypted = encryptedBuffer.slice(
      ENCRYPTION_CONFIG.IV_LENGTH + ENCRYPTION_CONFIG.TAG_LENGTH
    );
    
    const decipher = crypto.createDecipher(ENCRYPTION_CONFIG.ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    return Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);
    
  } catch (error) {
    console.error('File decryption error:', error);
    throw new Error('Failed to decrypt file');
  }
}

/**
 * Secure string comparison
 */
export function secureCompare(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  
  return crypto.timingSafeEqual(
    Buffer.from(a),
    Buffer.from(b)
  );
}

/**
 * Generate HMAC signature
 */
export function generateHMAC(data, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('hex');
}

/**
 * Verify HMAC signature
 */
export function verifyHMAC(data, signature, secret) {
  const expectedSignature = generateHMAC(data, secret);
  return secureCompare(signature, expectedSignature);
}

/**
 * Encryption middleware for database storage
 */
export class EncryptedStorage {
  
  static async encryptSensitiveFields(data, fields = []) {
    const encrypted = { ...data };
    
    for (const field of fields) {
      if (encrypted[field]) {
        encrypted[field] = encrypt(encrypted[field]);
      }
    }
    
    return encrypted;
  }
  
  static async decryptSensitiveFields(data, fields = []) {
    const decrypted = { ...data };
    
    for (const field of fields) {
      if (decrypted[field]) {
        try {
          decrypted[field] = decrypt(decrypted[field]);
        } catch (error) {
          console.error(`Failed to decrypt field ${field}:`, error);
          decrypted[field] = null;
        }
      }
    }
    
    return decrypted;
  }
}

/**
 * Security audit functions
 */
export class SecurityAudit {
  
  static generateAuditHash(operation, userId, data) {
    const auditData = {
      operation,
      userId,
      data: hashData(data),
      timestamp: Date.now()
    };
    
    return hashData(auditData);
  }
  
  static verifyAuditTrail(operations) {
    return operations.every((op, index) => {
      if (index === 0) return true;
      
      const prevHash = operations[index - 1].hash;
      const currentData = { ...op };
      delete currentData.hash;
      
      const expectedHash = this.generateAuditHash(
        currentData.operation,
        currentData.userId,
        currentData.data
      );
      
      return op.hash === expectedHash;
    });
  }
}

export default {
  encrypt,
  decrypt,
  hashPassword,
  verifyPassword,
  generateSecureToken,
  generateAPIKey,
  hashData,
  verifyDataIntegrity,
  encryptFile,
  decryptFile,
  secureCompare,
  generateHMAC,
  verifyHMAC,
  EncryptedStorage,
  SecurityAudit,
  generateEncryptionKey
};