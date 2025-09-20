/**
 * Real-Time Analytics Dashboard for Digital Wallet
 * Comprehensive monitoring, reporting, and business intelligence system
 */

import { logSecurityEvent, SECURITY_EVENT_TYPES, SEVERITY_LEVELS } from '../utils/security-logger.js';
import { formatCurrency, formatDateTime } from '../utils/helpers.js';
import { CacheManager } from '../api/rest-api.js';

/**
 * Analytics Configuration
 */
export const ANALYTICS_CONFIG = {
  // Data Collection
  COLLECTION: {
    REAL_TIME_INTERVAL: 10000, // 10 seconds
    BATCH_INTERVAL: 300000, // 5 minutes
    RETENTION_DAYS: 365,
    MAX_EVENTS_PER_BATCH: 1000
  },
  
  // Dashboard Settings
  DASHBOARD: {
    REFRESH_INTERVAL: 30000, // 30 seconds
    CHART_DATA_POINTS: 100,
    REAL_TIME_WINDOW: 3600000, // 1 hour
    CACHE_TTL: 60 // 1 minute
  },
  
  // Alerts Configuration
  ALERTS: {
    ENABLED: true,
    THRESHOLDS: {
      FAILED_TRANSACTIONS: 10, // per hour
      HIGH_VOLUME_DEPOSITS: 100000, // THB
      SUSPICIOUS_ACTIVITY: 5, // events per user per hour
      SYSTEM_ERROR_RATE: 0.05, // 5%
      API_RESPONSE_TIME: 5000 // 5 seconds
    },
    NOTIFICATION_CHANNELS: ['email', 'telegram', 'webhook']
  },
  
  // Metrics Storage
  STORAGE: {
    BUCKET_SIZE: 3600000, // 1 hour buckets
    AGGREGATION_LEVELS: ['minute', 'hour', 'day', 'week', 'month'],
    COMPRESSION: true
  }
};

/**
 * Real-Time Metrics Collector
 */
export class MetricsCollector {
  
  static metrics = new Map();
  static counters = new Map();
  static gauges = new Map();
  static histograms = new Map();
  static timers = new Map();
  
  /**
   * Increment counter metric
   */
  static increment(name, value = 1, tags = {}) {
    const key = this.buildKey(name, tags);
    const current = this.counters.get(key) || 0;
    this.counters.set(key, current + value);
    
    this.recordMetric('counter', name, current + value, tags);
  }
  
  /**
   * Set gauge metric
   */
  static gauge(name, value, tags = {}) {
    const key = this.buildKey(name, tags);
    this.gauges.set(key, value);
    
    this.recordMetric('gauge', name, value, tags);
  }
  
  /**
   * Record histogram metric
   */
  static histogram(name, value, tags = {}) {
    const key = this.buildKey(name, tags);
    
    if (!this.histograms.has(key)) {
      this.histograms.set(key, {
        count: 0,
        sum: 0,
        min: Infinity,
        max: -Infinity,
        buckets: new Map()
      });
    }
    
    const hist = this.histograms.get(key);
    hist.count++;
    hist.sum += value;
    hist.min = Math.min(hist.min, value);
    hist.max = Math.max(hist.max, value);
    
    // Add to buckets (0.1, 0.5, 1, 5, 10, 50, 100, 500, 1000, Inf)
    const buckets = [0.1, 0.5, 1, 5, 10, 50, 100, 500, 1000, Infinity];
    for (const bucket of buckets) {
      if (value <= bucket) {
        const bucketKey = bucket === Infinity ? 'inf' : bucket.toString();
        hist.buckets.set(bucketKey, (hist.buckets.get(bucketKey) || 0) + 1);
      }
    }
    
    this.recordMetric('histogram', name, value, tags);
  }
  
  /**
   * Start timer metric
   */
  static startTimer(name, tags = {}) {
    const key = this.buildKey(name, tags);
    const startTime = performance.now();
    
    return {
      stop: () => {
        const duration = performance.now() - startTime;
        this.histogram(name, duration, tags);
        return duration;
      }
    };
  }
  
  /**
   * Record business metrics
   */
  static recordTransaction(type, amount, currency, status, userId) {
    const tags = { type, currency, status };
    
    this.increment('transactions.total', 1, tags);
    this.histogram('transactions.amount', amount, tags);
    
    if (status === 'COMPLETED') {
      this.increment('transactions.completed', 1, tags);
      this.histogram('transactions.completed_amount', amount, tags);
    } else if (status === 'FAILED') {
      this.increment('transactions.failed', 1, tags);
    }
    
    // User activity
    this.increment('users.activity', 1, { userId: userId.toString() });
  }
  
  /**
   * Record user metrics
   */
  static recordUserActivity(userId, action, metadata = {}) {
    const tags = { action, userId: userId.toString() };
    
    this.increment('users.actions', 1, tags);
    this.gauge('users.last_activity', Date.now(), { userId: userId.toString() });
    
    // Track specific actions
    switch (action) {
      case 'login':
        this.increment('users.logins', 1);
        break;
      case 'register':
        this.increment('users.registrations', 1);
        break;
      case 'deposit':
        this.increment('users.deposits', 1);
        break;
      case 'withdrawal':
        this.increment('users.withdrawals', 1);
        break;
    }
  }
  
  /**
   * Record system metrics
   */
  static recordSystemMetrics(metrics) {
    this.gauge('system.cpu_usage', metrics.cpu || 0);
    this.gauge('system.memory_usage', metrics.memory || 0);
    this.gauge('system.disk_usage', metrics.disk || 0);
    this.gauge('system.active_connections', metrics.connections || 0);
    this.gauge('system.queue_size', metrics.queueSize || 0);
  }
  
  /**
   * Record API metrics
   */
  static recordAPIMetrics(endpoint, method, statusCode, responseTime) {
    const tags = { endpoint, method, status: statusCode.toString() };
    
    this.increment('api.requests', 1, tags);
    this.histogram('api.response_time', responseTime, tags);
    
    if (statusCode >= 400) {
      this.increment('api.errors', 1, tags);
    }
    
    if (responseTime > ANALYTICS_CONFIG.ALERTS.THRESHOLDS.API_RESPONSE_TIME) {
      this.increment('api.slow_requests', 1, tags);
    }
  }
  
  /**
   * Get current metrics snapshot
   */
  static getSnapshot() {
    return {
      timestamp: Date.now(),
      counters: Object.fromEntries(this.counters),
      gauges: Object.fromEntries(this.gauges),
      histograms: this.serializeHistograms(),
      metadata: {
        totalMetrics: this.counters.size + this.gauges.size + this.histograms.size,
        uptime: process.uptime ? process.uptime() : 0
      }
    };
  }
  
  /**
   * Reset metrics
   */
  static reset() {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
    this.timers.clear();
  }
  
  /**
   * Build metric key
   */
  static buildKey(name, tags) {
    if (Object.keys(tags).length === 0) {
      return name;
    }
    
    const tagString = Object.entries(tags)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join(',');
    
    return `${name}{${tagString}}`;
  }
  
  /**
   * Record metric for storage
   */
  static recordMetric(type, name, value, tags) {
    const metric = {
      type,
      name,
      value,
      tags,
      timestamp: Date.now()
    };
    
    // Store in time-series format
    const key = `metric_${type}_${name}`;
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }
    
    const series = this.metrics.get(key);
    series.push(metric);
    
    // Keep only recent data points
    const cutoff = Date.now() - ANALYTICS_CONFIG.DASHBOARD.REAL_TIME_WINDOW;
    while (series.length > 0 && series[0].timestamp < cutoff) {
      series.shift();
    }
  }
  
  /**
   * Serialize histograms for JSON
   */
  static serializeHistograms() {
    const result = {};
    
    for (const [key, hist] of this.histograms.entries()) {
      result[key] = {
        count: hist.count,
        sum: hist.sum,
        avg: hist.count > 0 ? hist.sum / hist.count : 0,
        min: hist.min === Infinity ? 0 : hist.min,
        max: hist.max === -Infinity ? 0 : hist.max,
        buckets: Object.fromEntries(hist.buckets)
      };
    }
    
    return result;
  }
}

/**
 * Real-Time Dashboard Data Provider
 */
export class DashboardDataProvider {
  
  static cache = new Map();
  
  /**
   * Get dashboard overview data
   */
  static async getOverviewData(timeRange = '1h') {
    const cacheKey = `dashboard_overview_${timeRange}`;
    let data = CacheManager.get(cacheKey);
    
    if (!data) {
      data = await this.generateOverviewData(timeRange);
      CacheManager.set(cacheKey, data, ANALYTICS_CONFIG.DASHBOARD.CACHE_TTL);
    }
    
    return data;
  }
  
  /**
   * Get transaction analytics
   */
  static async getTransactionAnalytics(timeRange = '24h') {
    const cacheKey = `dashboard_transactions_${timeRange}`;
    let data = CacheManager.get(cacheKey);
    
    if (!data) {
      data = await this.generateTransactionAnalytics(timeRange);
      CacheManager.set(cacheKey, data, ANALYTICS_CONFIG.DASHBOARD.CACHE_TTL);
    }
    
    return data;
  }
  
  /**
   * Get user analytics
   */
  static async getUserAnalytics(timeRange = '24h') {
    const cacheKey = `dashboard_users_${timeRange}`;
    let data = CacheManager.get(cacheKey);
    
    if (!data) {
      data = await this.generateUserAnalytics(timeRange);
      CacheManager.set(cacheKey, data, ANALYTICS_CONFIG.DASHBOARD.CACHE_TTL);
    }
    
    return data;
  }
  
  /**
   * Get system health metrics
   */
  static async getSystemHealth() {
    const snapshot = MetricsCollector.getSnapshot();
    
    return {
      timestamp: Date.now(),
      status: this.calculateSystemStatus(snapshot),
      metrics: {
        cpu: snapshot.gauges['system.cpu_usage'] || 0,
        memory: snapshot.gauges['system.memory_usage'] || 0,
        disk: snapshot.gauges['system.disk_usage'] || 0,
        connections: snapshot.gauges['system.active_connections'] || 0,
        uptime: snapshot.metadata.uptime
      },
      api: {
        totalRequests: this.sumCounters(snapshot.counters, 'api.requests'),
        errorRate: this.calculateErrorRate(snapshot.counters),
        avgResponseTime: this.calculateAvgResponseTime(snapshot.histograms)
      },
      database: {
        activeConnections: snapshot.gauges['db.active_connections'] || 0,
        queryTime: snapshot.histograms['db.query_time']?.avg || 0,
        cacheHitRate: snapshot.gauges['db.cache_hit_rate'] || 0
      }
    };
  }
  
  /**
   * Get real-time metrics
   */
  static async getRealTimeMetrics() {
    const snapshot = MetricsCollector.getSnapshot();
    
    return {
      timestamp: Date.now(),
      transactions: {
        total: this.sumCounters(snapshot.counters, 'transactions.total'),
        completed: this.sumCounters(snapshot.counters, 'transactions.completed'),
        failed: this.sumCounters(snapshot.counters, 'transactions.failed'),
        volume: this.sumHistograms(snapshot.histograms, 'transactions.completed_amount')
      },
      users: {
        active: this.countActiveUsers(snapshot.gauges),
        logins: this.sumCounters(snapshot.counters, 'users.logins'),
        registrations: this.sumCounters(snapshot.counters, 'users.registrations')
      },
      system: {
        requests: this.sumCounters(snapshot.counters, 'api.requests'),
        errors: this.sumCounters(snapshot.counters, 'api.errors'),
        responseTime: snapshot.histograms['api.response_time']?.avg || 0
      }
    };
  }
  
  /**
   * Generate overview data
   */
  static async generateOverviewData(timeRange) {
    // This would query the database for historical data
    return {
      summary: {
        totalUsers: 1234,
        totalTransactions: 5678,
        totalVolume: 1234567.89,
        revenue: 12345.67
      },
      trends: {
        userGrowth: '+12.5%',
        transactionGrowth: '+8.3%',
        volumeGrowth: '+15.7%',
        revenueGrowth: '+9.2%'
      },
      charts: {
        userRegistrations: this.generateChartData('users', timeRange),
        transactionVolume: this.generateChartData('volume', timeRange),
        revenue: this.generateChartData('revenue', timeRange)
      }
    };
  }
  
  /**
   * Generate transaction analytics
   */
  static async generateTransactionAnalytics(timeRange) {
    return {
      summary: {
        total: 5678,
        successful: 5432,
        failed: 246,
        successRate: '95.7%',
        avgAmount: 1234.56,
        totalVolume: 6789123.45
      },
      byType: {
        deposits: { count: 2341, volume: 3456789.12 },
        withdrawals: { count: 1987, volume: 2345678.90 },
        conversions: { count: 1350, volume: 986655.43 }
      },
      byCurrency: {
        THB: { count: 3456, volume: 4567890.12 },
        USDT: { count: 1234, volume: 1234567.89 },
        BTC: { count: 567, volume: 987654.44 },
        ETH: { count: 421, volume: 765432.00 }
      },
      charts: {
        volume: this.generateChartData('transaction_volume', timeRange),
        count: this.generateChartData('transaction_count', timeRange),
        successRate: this.generateChartData('success_rate', timeRange)
      }
    };
  }
  
  /**
   * Generate user analytics
   */
  static async generateUserAnalytics(timeRange) {
    return {
      summary: {
        total: 1234,
        active: 567,
        new: 89,
        retained: '78.5%',
        avgSession: '15.3 min'
      },
      demographics: {
        byCountry: {
          Thailand: 789,
          Vietnam: 234,
          Indonesia: 123,
          Other: 88
        },
        byVIPTier: {
          Bronze: 901,
          Silver: 234,
          Gold: 78,
          Platinum: 18,
          Diamond: 3
        }
      },
      activity: {
        dailyActive: 456,
        weeklyActive: 789,
        monthlyActive: 1123
      },
      charts: {
        registrations: this.generateChartData('user_registrations', timeRange),
        activity: this.generateChartData('user_activity', timeRange),
        retention: this.generateChartData('user_retention', timeRange)
      }
    };
  }
  
  /**
   * Generate chart data
   */
  static generateChartData(type, timeRange) {
    const points = ANALYTICS_CONFIG.DASHBOARD.CHART_DATA_POINTS;
    const data = [];
    const now = Date.now();
    const interval = this.getIntervalForTimeRange(timeRange);
    
    for (let i = points - 1; i >= 0; i--) {
      const timestamp = now - (i * interval);
      const value = this.generateSampleValue(type, timestamp);
      
      data.push({
        timestamp,
        value,
        label: this.formatTimestamp(timestamp, timeRange)
      });
    }
    
    return data;
  }
  
  /**
   * Calculate system status
   */
  static calculateSystemStatus(snapshot) {
    const cpu = snapshot.gauges['system.cpu_usage'] || 0;
    const memory = snapshot.gauges['system.memory_usage'] || 0;
    const errorRate = this.calculateErrorRate(snapshot.counters);
    
    if (cpu > 90 || memory > 90 || errorRate > 0.1) {
      return 'critical';
    } else if (cpu > 70 || memory > 70 || errorRate > 0.05) {
      return 'warning';
    } else {
      return 'healthy';
    }
  }
  
  /**
   * Sum counters by pattern
   */
  static sumCounters(counters, pattern) {
    let sum = 0;
    
    for (const [key, value] of Object.entries(counters)) {
      if (key.includes(pattern)) {
        sum += value;
      }
    }
    
    return sum;
  }
  
  /**
   * Calculate error rate
   */
  static calculateErrorRate(counters) {
    const totalRequests = this.sumCounters(counters, 'api.requests');
    const totalErrors = this.sumCounters(counters, 'api.errors');
    
    return totalRequests > 0 ? totalErrors / totalRequests : 0;
  }
  
  /**
   * Calculate average response time
   */
  static calculateAvgResponseTime(histograms) {
    const responseTimeHist = Object.entries(histograms)
      .find(([key]) => key.includes('api.response_time'));
    
    return responseTimeHist ? responseTimeHist[1].avg : 0;
  }
  
  /**
   * Sum histograms by pattern
   */
  static sumHistograms(histograms, pattern) {
    let sum = 0;
    
    for (const [key, hist] of Object.entries(histograms)) {
      if (key.includes(pattern)) {
        sum += hist.sum;
      }
    }
    
    return sum;
  }
  
  /**
   * Count active users
   */
  static countActiveUsers(gauges) {
    const cutoff = Date.now() - 3600000; // 1 hour ago
    let count = 0;
    
    for (const [key, lastActivity] of Object.entries(gauges)) {
      if (key.includes('users.last_activity') && lastActivity > cutoff) {
        count++;
      }
    }
    
    return count;
  }
  
  /**
   * Get interval for time range
   */
  static getIntervalForTimeRange(timeRange) {
    const intervals = {
      '1h': 60000, // 1 minute
      '6h': 360000, // 6 minutes
      '24h': 1440000, // 24 minutes
      '7d': 10080000, // 2.8 hours
      '30d': 43200000 // 12 hours
    };
    
    return intervals[timeRange] || intervals['24h'];
  }
  
  /**
   * Format timestamp for display
   */
  static formatTimestamp(timestamp, timeRange) {
    const date = new Date(timestamp);
    
    if (timeRange === '1h' || timeRange === '6h') {
      return date.toLocaleTimeString('th-TH', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (timeRange === '24h') {
      return date.toLocaleTimeString('th-TH', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('th-TH', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  }
  
  /**
   * Generate sample values (replace with real data queries)
   */
  static generateSampleValue(type, timestamp) {
    const base = Math.sin(timestamp / 3600000) * 50 + 100;
    const noise = Math.random() * 20 - 10;
    
    switch (type) {
      case 'users':
        return Math.max(0, Math.floor(base + noise));
      case 'volume':
        return Math.max(0, (base + noise) * 1000);
      case 'revenue':
        return Math.max(0, base + noise);
      case 'transaction_volume':
        return Math.max(0, (base + noise) * 500);
      case 'transaction_count':
        return Math.max(0, Math.floor(base / 2 + noise));
      case 'success_rate':
        return Math.min(100, Math.max(90, 95 + noise / 10));
      case 'user_registrations':
        return Math.max(0, Math.floor((base + noise) / 10));
      case 'user_activity':
        return Math.max(0, Math.floor(base / 2 + noise));
      case 'user_retention':
        return Math.min(100, Math.max(70, 80 + noise / 5));
      default:
        return Math.max(0, base + noise);
    }
  }
}

/**
 * Alert Manager
 */
export class AlertManager {
  
  static alerts = [];
  static rules = new Map();
  static notifications = new Map();
  
  /**
   * Add alert rule
   */
  static addRule(name, condition, threshold, action, options = {}) {
    this.rules.set(name, {
      name,
      condition,
      threshold,
      action,
      enabled: true,
      lastTriggered: null,
      triggerCount: 0,
      ...options
    });
  }
  
  /**
   * Check alerts
   */
  static async checkAlerts() {
    if (!ANALYTICS_CONFIG.ALERTS.ENABLED) {
      return;
    }
    
    const snapshot = MetricsCollector.getSnapshot();
    
    for (const [name, rule] of this.rules.entries()) {
      if (!rule.enabled) continue;
      
      try {
        const triggered = await this.evaluateRule(rule, snapshot);
        
        if (triggered) {
          await this.triggerAlert(rule, snapshot);
        }
        
      } catch (error) {
        console.error(`Error evaluating alert rule ${name}:`, error);
      }
    }
  }
  
  /**
   * Evaluate alert rule
   */
  static async evaluateRule(rule, snapshot) {
    switch (rule.condition) {
      case 'counter_threshold':
        const counterValue = this.getCounterValue(snapshot.counters, rule.metric);
        return counterValue >= rule.threshold;
        
      case 'gauge_threshold':
        const gaugeValue = this.getGaugeValue(snapshot.gauges, rule.metric);
        return gaugeValue >= rule.threshold;
        
      case 'rate_threshold':
        const rate = this.calculateRate(snapshot, rule.metric, rule.timeWindow);
        return rate >= rule.threshold;
        
      case 'error_rate':
        const errorRate = DashboardDataProvider.calculateErrorRate(snapshot.counters);
        return errorRate >= rule.threshold;
        
      case 'response_time':
        const avgResponseTime = DashboardDataProvider.calculateAvgResponseTime(snapshot.histograms);
        return avgResponseTime >= rule.threshold;
        
      default:
        console.warn(`Unknown alert condition: ${rule.condition}`);
        return false;
    }
  }
  
  /**
   * Trigger alert
   */
  static async triggerAlert(rule, snapshot) {
    const now = Date.now();
    
    // Check cooldown period
    if (rule.lastTriggered && (now - rule.lastTriggered) < (rule.cooldown || 300000)) {
      return;
    }
    
    const alert = {
      id: `alert_${now}_${Math.random()}`,
      rule: rule.name,
      timestamp: now,
      severity: rule.severity || 'medium',
      message: rule.message || `Alert triggered: ${rule.name}`,
      metadata: {
        snapshot: this.sanitizeSnapshot(snapshot),
        threshold: rule.threshold
      }
    };
    
    this.alerts.push(alert);
    rule.lastTriggered = now;
    rule.triggerCount++;
    
    // Send notifications
    await this.sendNotifications(alert, rule);
    
    // Log security event
    await logSecurityEvent({
      type: SECURITY_EVENT_TYPES.SYSTEM,
      severity: this.mapAlertSeverity(alert.severity),
      description: `System alert: ${alert.message}`,
      metadata: alert.metadata
    });
    
    console.warn(`🚨 Alert triggered: ${alert.message}`);
  }
  
  /**
   * Send notifications
   */
  static async sendNotifications(alert, rule) {
    const channels = rule.notificationChannels || ANALYTICS_CONFIG.ALERTS.NOTIFICATION_CHANNELS;
    
    for (const channel of channels) {
      try {
        switch (channel) {
          case 'email':
            await this.sendEmailNotification(alert);
            break;
          case 'telegram':
            await this.sendTelegramNotification(alert);
            break;
          case 'webhook':
            await this.sendWebhookNotification(alert);
            break;
        }
      } catch (error) {
        console.error(`Failed to send ${channel} notification:`, error);
      }
    }
  }
  
  /**
   * Get active alerts
   */
  static getActiveAlerts(severity = null) {
    const activeAlerts = this.alerts.filter(alert => {
      const age = Date.now() - alert.timestamp;
      return age < 3600000; // Active for 1 hour
    });
    
    if (severity) {
      return activeAlerts.filter(alert => alert.severity === severity);
    }
    
    return activeAlerts;
  }
  
  /**
   * Clear alert
   */
  static clearAlert(alertId) {
    const index = this.alerts.findIndex(alert => alert.id === alertId);
    if (index > -1) {
      this.alerts.splice(index, 1);
      return true;
    }
    return false;
  }
  
  // Helper methods
  static getCounterValue(counters, metric) {
    return Object.entries(counters)
      .filter(([key]) => key.includes(metric))
      .reduce((sum, [, value]) => sum + value, 0);
  }
  
  static getGaugeValue(gauges, metric) {
    return Object.entries(gauges)
      .find(([key]) => key.includes(metric))?.[1] || 0;
  }
  
  static calculateRate(snapshot, metric, timeWindow) {
    // Calculate rate over time window
    const currentValue = this.getCounterValue(snapshot.counters, metric);
    // This would need historical data to calculate properly
    return currentValue / (timeWindow / 1000); // per second
  }
  
  static sanitizeSnapshot(snapshot) {
    return {
      timestamp: snapshot.timestamp,
      totalMetrics: snapshot.metadata.totalMetrics,
      uptime: snapshot.metadata.uptime
    };
  }
  
  static mapAlertSeverity(severity) {
    const mapping = {
      'low': SEVERITY_LEVELS.LOW,
      'medium': SEVERITY_LEVELS.MEDIUM,
      'high': SEVERITY_LEVELS.HIGH,
      'critical': SEVERITY_LEVELS.CRITICAL
    };
    
    return mapping[severity] || SEVERITY_LEVELS.MEDIUM;
  }
  
  // Notification methods (implement based on your setup)
  static async sendEmailNotification(alert) {
    console.log(`📧 Email notification: ${alert.message}`);
  }
  
  static async sendTelegramNotification(alert) {
    console.log(`📱 Telegram notification: ${alert.message}`);
  }
  
  static async sendWebhookNotification(alert) {
    console.log(`🔗 Webhook notification: ${alert.message}`);
  }
}

/**
 * Initialize default alert rules
 */
export function initializeDefaultAlerts() {
  // Transaction alerts
  AlertManager.addRule(
    'high_failed_transactions',
    'counter_threshold',
    ANALYTICS_CONFIG.ALERTS.THRESHOLDS.FAILED_TRANSACTIONS,
    'notify',
    {
      metric: 'transactions.failed',
      severity: 'high',
      message: 'High number of failed transactions detected',
      cooldown: 600000 // 10 minutes
    }
  );
  
  // System alerts
  AlertManager.addRule(
    'high_error_rate',
    'error_rate',
    ANALYTICS_CONFIG.ALERTS.THRESHOLDS.SYSTEM_ERROR_RATE,
    'notify',
    {
      severity: 'critical',
      message: 'System error rate exceeds threshold',
      cooldown: 300000 // 5 minutes
    }
  );
  
  AlertManager.addRule(
    'slow_api_response',
    'response_time',
    ANALYTICS_CONFIG.ALERTS.THRESHOLDS.API_RESPONSE_TIME,
    'notify',
    {
      severity: 'medium',
      message: 'API response time exceeds threshold',
      cooldown: 600000 // 10 minutes
    }
  );
  
  // Security alerts
  AlertManager.addRule(
    'suspicious_activity',
    'rate_threshold',
    ANALYTICS_CONFIG.ALERTS.THRESHOLDS.SUSPICIOUS_ACTIVITY,
    'notify',
    {
      metric: 'security.suspicious_activity',
      timeWindow: 3600000, // 1 hour
      severity: 'high',
      message: 'Suspicious user activity detected',
      cooldown: 1800000 // 30 minutes
    }
  );
  
  console.log('✅ Default alert rules initialized');
}

export default {
  ANALYTICS_CONFIG,
  MetricsCollector,
  DashboardDataProvider,
  AlertManager,
  initializeDefaultAlerts
};