/**
 * Security Event Logger for Digital Wallet System
 * Comprehensive logging for security events, audit trails, and compliance
 */

import { hashData, generateHMAC } from './encryption.js';

/**
 * Security Event Types
 */
export const SECURITY_EVENT_TYPES = {
  // Authentication Events
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGIN_BLOCKED: 'LOGIN_BLOCKED',
  LOGOUT: 'LOGOUT',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  
  // 2FA Events
  '2FA_ENABLED': '2FA_ENABLED',
  '2FA_DISABLED': '2FA_DISABLED',
  '2FA_CODE_SENT': '2FA_CODE_SENT',
  '2FA_VERIFIED': '2FA_VERIFIED',
  '2FA_FAILED': '2FA_FAILED',
  '2FA_MAX_ATTEMPTS': '2FA_MAX_ATTEMPTS',
  
  // Admin Events
  ADMIN_ACCESS: 'ADMIN_ACCESS',
  ADMIN_ACTION: 'ADMIN_ACTION',
  ADMIN_IP_NOT_WHITELISTED: 'ADMIN_IP_NOT_WHITELISTED',
  ADMIN_PRIVILEGE_ESCALATION: 'ADMIN_PRIVILEGE_ESCALATION',
  
  // Transaction Events
  TRANSACTION_CREATED: 'TRANSACTION_CREATED',
  TRANSACTION_APPROVED: 'TRANSACTION_APPROVED',
  TRANSACTION_REJECTED: 'TRANSACTION_REJECTED',
  HIGH_VALUE_TRANSACTION: 'HIGH_VALUE_TRANSACTION',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  
  // Security Violations
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
  DATA_BREACH_ATTEMPT: 'DATA_BREACH_ATTEMPT',
  SQL_INJECTION_ATTEMPT: 'SQL_INJECTION_ATTEMPT',
  XSS_ATTEMPT: 'XSS_ATTEMPT',
  
  // System Events
  SYSTEM_STARTUP: 'SYSTEM_STARTUP',
  SYSTEM_SHUTDOWN: 'SYSTEM_SHUTDOWN',
  DATABASE_CONNECTION_FAILED: 'DATABASE_CONNECTION_FAILED',
  ENCRYPTION_KEY_ROTATED: 'ENCRYPTION_KEY_ROTATED',
  BACKUP_COMPLETED: 'BACKUP_COMPLETED',
  BACKUP_FAILED: 'BACKUP_FAILED'
};

/**
 * Security Event Severity Levels
 */
export const SEVERITY_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

/**
 * Security Event Logger Class
 */
export class SecurityLogger {
  
  static logStore = []; // In production, use persistent storage
  static alertThresholds = new Map();
  
  /**
   * Log security event
   */
  static async logEvent({
    type,
    userId = null,
    adminLevel = null,
    severity = SEVERITY_LEVELS.MEDIUM,
    description = '',
    metadata = {},
    ip = null,
    userAgent = null,
    sessionId = null
  }) {
    try {
      const timestamp = new Date().toISOString();
      const eventId = this.generateEventId();
      
      const securityEvent = {
        eventId,
        type,
        severity,
        timestamp,
        userId,
        adminLevel,
        description,
        metadata,
        context: {
          ip,
          userAgent,
          sessionId
        },
        checksum: null
      };
      
      // Generate integrity checksum
      securityEvent.checksum = this.generateChecksum(securityEvent);
      
      // Store event
      await this.storeEvent(securityEvent);
      
      // Check for alerts
      await this.checkAlerts(securityEvent);
      
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 Security Event:', securityEvent);
      }
      
      return eventId;
      
    } catch (error) {
      console.error('Security logging error:', error);
      // Critical: security logging failure
      await this.logCriticalError(error);
    }
  }
  
  /**
   * Log authentication events
   */
  static async logAuth(type, userId, success = true, metadata = {}) {
    const severity = success ? SEVERITY_LEVELS.LOW : SEVERITY_LEVELS.MEDIUM;
    const description = this.getAuthDescription(type, success);
    
    return this.logEvent({
      type,
      userId,
      severity,
      description,
      metadata
    });
  }
  
  /**
   * Log admin actions
   */
  static async logAdminAction(adminId, adminLevel, action, target, metadata = {}) {
    return this.logEvent({
      type: SECURITY_EVENT_TYPES.ADMIN_ACTION,
      userId: adminId,
      adminLevel,
      severity: SEVERITY_LEVELS.HIGH,
      description: `Admin ${adminLevel} performed: ${action}`,
      metadata: {
        action,
        target,
        ...metadata
      }
    });
  }
  
  /**
   * Log transaction events
   */
  static async logTransaction(type, userId, amount, currency, metadata = {}) {
    const severity = amount > 100000 ? SEVERITY_LEVELS.HIGH : SEVERITY_LEVELS.MEDIUM;
    
    return this.logEvent({
      type,
      userId,
      severity,
      description: `Transaction: ${amount} ${currency}`,
      metadata: {
        amount,
        currency,
        ...metadata
      }
    });
  }
  
  /**
   * Log suspicious activity
   */
  static async logSuspicious(userId, activity, riskScore, metadata = {}) {
    const severity = riskScore > 80 ? SEVERITY_LEVELS.CRITICAL : SEVERITY_LEVELS.HIGH;
    
    return this.logEvent({
      type: SECURITY_EVENT_TYPES.SUSPICIOUS_ACTIVITY,
      userId,
      severity,
      description: `Suspicious activity detected: ${activity}`,
      metadata: {
        activity,
        riskScore,
        ...metadata
      }
    });
  }
  
  /**
   * Query security events
   */
  static async queryEvents(filters = {}) {
    try {
      let events = [...this.logStore];
      
      // Apply filters
      if (filters.userId) {
        events = events.filter(e => e.userId === filters.userId);
      }
      
      if (filters.type) {
        events = events.filter(e => e.type === filters.type);
      }
      
      if (filters.severity) {
        events = events.filter(e => e.severity === filters.severity);
      }
      
      if (filters.dateFrom) {
        events = events.filter(e => new Date(e.timestamp) >= new Date(filters.dateFrom));
      }
      
      if (filters.dateTo) {
        events = events.filter(e => new Date(e.timestamp) <= new Date(filters.dateTo));
      }
      
      if (filters.adminLevel) {
        events = events.filter(e => e.adminLevel === filters.adminLevel);
      }
      
      // Sort by timestamp (newest first)
      events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      // Limit results
      if (filters.limit) {
        events = events.slice(0, filters.limit);
      }
      
      return events;
      
    } catch (error) {
      console.error('Security query error:', error);
      return [];
    }
  }
  
  /**
   * Generate security report
   */
  static async generateSecurityReport(timeframe = '24h') {
    try {
      const now = new Date();
      const hours = timeframe === '24h' ? 24 : timeframe === '7d' ? 168 : 1;
      const fromTime = new Date(now.getTime() - hours * 60 * 60 * 1000);
      
      const events = await this.queryEvents({
        dateFrom: fromTime.toISOString(),
        limit: 1000
      });
      
      const report = {
        timeframe,
        totalEvents: events.length,
        eventsBySeverity: this.groupBy(events, 'severity'),
        eventsByType: this.groupBy(events, 'type'),
        topUsers: this.getTopUsers(events),
        suspiciousActivities: events.filter(e => e.type === SECURITY_EVENT_TYPES.SUSPICIOUS_ACTIVITY),
        criticalEvents: events.filter(e => e.severity === SEVERITY_LEVELS.CRITICAL),
        adminActions: events.filter(e => e.type === SECURITY_EVENT_TYPES.ADMIN_ACTION),
        summary: this.generateSummary(events)
      };
      
      return report;
      
    } catch (error) {
      console.error('Security report error:', error);
      return null;
    }
  }
  
  /**
   * Setup security alerts
   */
  static setupAlerts() {
    this.alertThresholds.set(SECURITY_EVENT_TYPES.LOGIN_FAILED, {
      count: 5,
      timeWindow: 15 * 60 * 1000, // 15 minutes
      action: 'LOCK_ACCOUNT'
    });
    
    this.alertThresholds.set(SECURITY_EVENT_TYPES.RATE_LIMIT_EXCEEDED, {
      count: 3,
      timeWindow: 5 * 60 * 1000, // 5 minutes
      action: 'IP_BAN'
    });
    
    this.alertThresholds.set(SECURITY_EVENT_TYPES.SUSPICIOUS_ACTIVITY, {
      count: 1,
      timeWindow: 0,
      action: 'IMMEDIATE_ALERT'
    });
    
    this.alertThresholds.set(SECURITY_EVENT_TYPES.HIGH_VALUE_TRANSACTION, {
      count: 3,
      timeWindow: 60 * 60 * 1000, // 1 hour
      action: 'REVIEW_REQUIRED'
    });
  }
  
  /**
   * Check for security alerts
   */
  static async checkAlerts(event) {
    try {
      const threshold = this.alertThresholds.get(event.type);
      if (!threshold) return;
      
      // Count recent events of same type
      const recentEvents = await this.queryEvents({
        type: event.type,
        userId: event.userId,
        dateFrom: new Date(Date.now() - threshold.timeWindow).toISOString()
      });
      
      if (recentEvents.length >= threshold.count) {
        await this.triggerAlert(event, threshold, recentEvents);
      }
      
    } catch (error) {
      console.error('Alert check error:', error);
    }
  }
  
  /**
   * Trigger security alert
   */
  static async triggerAlert(event, threshold, recentEvents) {
    const alert = {
      alertId: this.generateEventId(),
      triggeredBy: event.eventId,
      type: event.type,
      action: threshold.action,
      userId: event.userId,
      count: recentEvents.length,
      timeWindow: threshold.timeWindow,
      timestamp: new Date().toISOString(),
      events: recentEvents.map(e => e.eventId)
    };
    
    // Execute alert action
    await this.executeAlertAction(alert);
    
    // Log the alert
    await this.logEvent({
      type: 'SECURITY_ALERT_TRIGGERED',
      userId: event.userId,
      severity: SEVERITY_LEVELS.CRITICAL,
      description: `Security alert: ${threshold.action}`,
      metadata: alert
    });
    
    console.warn('🚨 Security Alert:', alert);
  }
  
  /**
   * Execute alert actions
   */
  static async executeAlertAction(alert) {
    switch (alert.action) {
      case 'LOCK_ACCOUNT':
        await this.lockUserAccount(alert.userId);
        break;
      case 'IP_BAN':
        await this.banIP(alert.metadata?.ip);
        break;
      case 'IMMEDIATE_ALERT':
        await this.notifyAdmins(alert);
        break;
      case 'REVIEW_REQUIRED':
        await this.flagForReview(alert);
        break;
    }
  }
  
  /**
   * Helper methods
   */
  static generateEventId() {
    return `se_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  static generateChecksum(event) {
    const eventData = { ...event };
    delete eventData.checksum;
    return hashData(eventData);
  }
  
  static async storeEvent(event) {
    // In production, store in database
    this.logStore.push(event);
    
    // Keep only last 10000 events in memory
    if (this.logStore.length > 10000) {
      this.logStore = this.logStore.slice(-10000);
    }
  }
  
  static getAuthDescription(type, success) {
    const descriptions = {
      [SECURITY_EVENT_TYPES.LOGIN_SUCCESS]: 'User login successful',
      [SECURITY_EVENT_TYPES.LOGIN_FAILED]: 'User login failed',
      [SECURITY_EVENT_TYPES.LOGIN_BLOCKED]: 'User login blocked',
      [SECURITY_EVENT_TYPES.LOGOUT]: 'User logout',
      [SECURITY_EVENT_TYPES.SESSION_EXPIRED]: 'User session expired'
    };
    return descriptions[type] || 'Authentication event';
  }
  
  static groupBy(array, key) {
    return array.reduce((groups, item) => {
      const group = item[key] || 'undefined';
      groups[group] = (groups[group] || 0) + 1;
      return groups;
    }, {});
  }
  
  static getTopUsers(events) {
    const userCounts = this.groupBy(events, 'userId');
    return Object.entries(userCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([userId, count]) => ({ userId, eventCount: count }));
  }
  
  static generateSummary(events) {
    const critical = events.filter(e => e.severity === SEVERITY_LEVELS.CRITICAL).length;
    const high = events.filter(e => e.severity === SEVERITY_LEVELS.HIGH).length;
    const failed_logins = events.filter(e => e.type === SECURITY_EVENT_TYPES.LOGIN_FAILED).length;
    const admin_actions = events.filter(e => e.type === SECURITY_EVENT_TYPES.ADMIN_ACTION).length;
    
    return {
      criticalEvents: critical,
      highSeverityEvents: high,
      failedLogins: failed_logins,
      adminActions: admin_actions,
      securityScore: this.calculateSecurityScore(events)
    };
  }
  
  static calculateSecurityScore(events) {
    // Simple security score calculation
    const weights = {
      [SEVERITY_LEVELS.CRITICAL]: -10,
      [SEVERITY_LEVELS.HIGH]: -5,
      [SEVERITY_LEVELS.MEDIUM]: -2,
      [SEVERITY_LEVELS.LOW]: -1
    };
    
    const score = events.reduce((total, event) => {
      return total + (weights[event.severity] || 0);
    }, 100);
    
    return Math.max(0, Math.min(100, score));
  }
  
  static async logCriticalError(error) {
    console.error('🚨 CRITICAL SECURITY LOGGING ERROR:', error);
    // Implement fallback logging mechanism
  }
  
  static async lockUserAccount(userId) {
    // Implement account locking
    console.log(`🔒 Account locked: ${userId}`);
  }
  
  static async banIP(ip) {
    // Implement IP banning
    console.log(`🚫 IP banned: ${ip}`);
  }
  
  static async notifyAdmins(alert) {
    // Implement admin notification
    console.log(`📢 Admin notification: ${alert.type}`);
  }
  
  static async flagForReview(alert) {
    // Implement review flagging
    console.log(`🔍 Flagged for review: ${alert.type}`);
  }
}

/**
 * Convenient wrapper functions
 */
export async function logSecurityEvent(eventData) {
  return SecurityLogger.logEvent(eventData);
}

export async function logUserActivity(userId, activity, env = null) {
  return SecurityLogger.logEvent({
    type: 'USER_ACTIVITY',
    userId,
    severity: SEVERITY_LEVELS.LOW,
    description: 'User activity',
    metadata: activity
  });
}

export async function logAdminActivity(adminId, adminLevel, action, target, metadata = {}) {
  return SecurityLogger.logAdminAction(adminId, adminLevel, action, target, metadata);
}

// Initialize security alerts
SecurityLogger.setupAlerts();

export default SecurityLogger;