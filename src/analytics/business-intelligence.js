/**
 * Business Intelligence Reporting System for Digital Wallet
 * Comprehensive reporting, data analysis, and business insights
 */

import { formatCurrency, formatDateTime } from '../utils/helpers.js';
import { CacheManager } from '../api/rest-api.js';
import { MetricsCollector } from './real-time-dashboard.js';

/**
 * Business Intelligence Configuration
 */
export const BI_CONFIG = {
  // Report Settings
  REPORTS: {
    CACHE_TTL: 1800, // 30 minutes
    MAX_EXPORT_ROWS: 50000,
    DEFAULT_TIMEZONE: 'Asia/Bangkok',
    SUPPORTED_FORMATS: ['json', 'csv', 'excel', 'pdf']
  },
  
  // Data Warehouse
  WAREHOUSE: {
    BATCH_SIZE: 1000,
    SYNC_INTERVAL: 3600000, // 1 hour
    RETENTION_POLICY: {
      RAW_DATA: 90, // days
      AGGREGATED_DATA: 365, // days
      REPORTS: 730 // days
    }
  },
  
  // Analysis Settings
  ANALYSIS: {
    STATISTICAL_CONFIDENCE: 0.95,
    TREND_DETECTION_WINDOW: 30, // days
    ANOMALY_THRESHOLD: 2.5, // standard deviations
    FORECASTING_HORIZON: 90 // days
  }
};

/**
 * Report Generator
 */
export class ReportGenerator {
  
  static templates = new Map();
  static scheduledReports = new Map();
  
  /**
   * Register report template
   */
  static registerTemplate(name, config) {
    this.templates.set(name, {
      name,
      ...config,
      createdAt: Date.now()
    });
  }
  
  /**
   * Generate financial summary report
   */
  static async generateFinancialSummary(startDate, endDate, options = {}) {
    try {
      const cacheKey = `report_financial_${startDate}_${endDate}`;
      let report = CacheManager.get(cacheKey);
      
      if (!report) {
        report = await this.buildFinancialSummary(startDate, endDate, options);
        CacheManager.set(cacheKey, report, BI_CONFIG.REPORTS.CACHE_TTL);
      }
      
      return this.formatReport(report, options.format || 'json');
      
    } catch (error) {
      console.error('Error generating financial summary:', error);
      throw error;
    }
  }
  
  /**
   * Generate user analytics report
   */
  static async generateUserAnalyticsReport(startDate, endDate, options = {}) {
    try {
      const cacheKey = `report_users_${startDate}_${endDate}`;
      let report = CacheManager.get(cacheKey);
      
      if (!report) {
        report = await this.buildUserAnalyticsReport(startDate, endDate, options);
        CacheManager.set(cacheKey, report, BI_CONFIG.REPORTS.CACHE_TTL);
      }
      
      return this.formatReport(report, options.format || 'json');
      
    } catch (error) {
      console.error('Error generating user analytics report:', error);
      throw error;
    }
  }
  
  /**
   * Generate transaction analysis report
   */
  static async generateTransactionAnalysisReport(startDate, endDate, options = {}) {
    try {
      const cacheKey = `report_transactions_${startDate}_${endDate}`;
      let report = CacheManager.get(cacheKey);
      
      if (!report) {
        report = await this.buildTransactionAnalysisReport(startDate, endDate, options);
        CacheManager.set(cacheKey, report, BI_CONFIG.REPORTS.CACHE_TTL);
      }
      
      return this.formatReport(report, options.format || 'json');
      
    } catch (error) {
      console.error('Error generating transaction analysis report:', error);
      throw error;
    }
  }
  
  /**
   * Generate risk assessment report
   */
  static async generateRiskAssessmentReport(startDate, endDate, options = {}) {
    try {
      const cacheKey = `report_risk_${startDate}_${endDate}`;
      let report = CacheManager.get(cacheKey);
      
      if (!report) {
        report = await this.buildRiskAssessmentReport(startDate, endDate, options);
        CacheManager.set(cacheKey, report, BI_CONFIG.REPORTS.CACHE_TTL);
      }
      
      return this.formatReport(report, options.format || 'json');
      
    } catch (error) {
      console.error('Error generating risk assessment report:', error);
      throw error;
    }
  }
  
  /**
   * Build financial summary report
   */
  static async buildFinancialSummary(startDate, endDate, options) {
    const data = await this.getFinancialData(startDate, endDate);
    
    return {
      reportType: 'financial_summary',
      period: { startDate, endDate },
      generatedAt: new Date().toISOString(),
      summary: {
        totalRevenue: this.calculateTotalRevenue(data),
        totalFees: this.calculateTotalFees(data),
        netProfit: this.calculateNetProfit(data),
        transactionVolume: this.calculateTransactionVolume(data),
        averageTransactionSize: this.calculateAverageTransactionSize(data)
      },
      breakdown: {
        byType: this.groupByTransactionType(data),
        byCurrency: this.groupByCurrency(data),
        byPeriod: this.groupByPeriod(data, 'day')
      },
      trends: {
        revenueGrowth: this.calculateGrowthRate(data, 'revenue'),
        volumeGrowth: this.calculateGrowthRate(data, 'volume'),
        userGrowth: this.calculateGrowthRate(data, 'users')
      },
      kpis: {
        revenuePerUser: this.calculateRevenuePerUser(data),
        transactionsPerUser: this.calculateTransactionsPerUser(data),
        averageFeeRate: this.calculateAverageFeeRate(data),
        customerLifetimeValue: this.calculateCustomerLifetimeValue(data)
      }
    };
  }
  
  /**
   * Build user analytics report
   */
  static async buildUserAnalyticsReport(startDate, endDate, options) {
    const data = await this.getUserData(startDate, endDate);
    
    return {
      reportType: 'user_analytics',
      period: { startDate, endDate },
      generatedAt: new Date().toISOString(),
      summary: {
        totalUsers: data.users.length,
        newUsers: data.users.filter(u => new Date(u.createdAt) >= new Date(startDate)).length,
        activeUsers: data.users.filter(u => u.lastActivity >= new Date(startDate)).length,
        retentionRate: this.calculateRetentionRate(data.users),
        churnRate: this.calculateChurnRate(data.users)
      },
      demographics: {
        byCountry: this.groupUsersByCountry(data.users),
        byVIPTier: this.groupUsersByVIPTier(data.users),
        byRegistrationSource: this.groupUsersBySource(data.users),
        byAge: this.groupUsersByAge(data.users)
      },
      behavior: {
        loginFrequency: this.analyzeLoginFrequency(data.sessions),
        transactionPatterns: this.analyzeTransactionPatterns(data.transactions),
        featureUsage: this.analyzeFeatureUsage(data.events),
        sessionDuration: this.analyzeSessionDuration(data.sessions)
      },
      cohorts: {
        monthlyRetention: this.calculateCohortRetention(data.users, 'month'),
        weeklyRetention: this.calculateCohortRetention(data.users, 'week'),
        ltv: this.calculateCohortLTV(data.users, data.transactions)
      }
    };
  }
  
  /**
   * Build transaction analysis report
   */
  static async buildTransactionAnalysisReport(startDate, endDate, options) {
    const data = await this.getTransactionData(startDate, endDate);
    
    return {
      reportType: 'transaction_analysis',
      period: { startDate, endDate },
      generatedAt: new Date().toISOString(),
      summary: {
        totalTransactions: data.transactions.length,
        successfulTransactions: data.transactions.filter(t => t.status === 'COMPLETED').length,
        failedTransactions: data.transactions.filter(t => t.status === 'FAILED').length,
        successRate: this.calculateSuccessRate(data.transactions),
        totalVolume: this.calculateTotalVolume(data.transactions),
        averageAmount: this.calculateAverageAmount(data.transactions)
      },
      breakdown: {
        byType: this.groupTransactionsByType(data.transactions),
        byCurrency: this.groupTransactionsByCurrency(data.transactions),
        byStatus: this.groupTransactionsByStatus(data.transactions),
        byHour: this.groupTransactionsByHour(data.transactions),
        byDay: this.groupTransactionsByDay(data.transactions)
      },
      performance: {
        processingTime: this.analyzeProcessingTime(data.transactions),
        throughput: this.analyzeThroughput(data.transactions),
        errorPatterns: this.analyzeErrorPatterns(data.transactions),
        peakHours: this.identifyPeakHours(data.transactions)
      },
      risks: {
        suspiciousTransactions: this.identifySuspiciousTransactions(data.transactions),
        highValueTransactions: this.identifyHighValueTransactions(data.transactions),
        frequentFailures: this.identifyFrequentFailures(data.transactions),
        anomalies: this.detectTransactionAnomalies(data.transactions)
      }
    };
  }
  
  /**
   * Build risk assessment report
   */
  static async buildRiskAssessmentReport(startDate, endDate, options) {
    const data = await this.getRiskData(startDate, endDate);
    
    return {
      reportType: 'risk_assessment',
      period: { startDate, endDate },
      generatedAt: new Date().toISOString(),
      summary: {
        overallRiskScore: this.calculateOverallRiskScore(data),
        highRiskUsers: data.users.filter(u => u.riskScore > 0.7).length,
        suspiciousActivities: data.events.filter(e => e.suspicious).length,
        securityIncidents: data.incidents.length,
        complianceScore: this.calculateComplianceScore(data)
      },
      categories: {
        transactionRisk: {
          score: this.calculateTransactionRisk(data.transactions),
          factors: this.identifyTransactionRiskFactors(data.transactions),
          mitigation: this.suggestTransactionRiskMitigation(data.transactions)
        },
        userRisk: {
          score: this.calculateUserRisk(data.users),
          factors: this.identifyUserRiskFactors(data.users),
          mitigation: this.suggestUserRiskMitigation(data.users)
        },
        operationalRisk: {
          score: this.calculateOperationalRisk(data.operations),
          factors: this.identifyOperationalRiskFactors(data.operations),
          mitigation: this.suggestOperationalRiskMitigation(data.operations)
        },
        regulatoryRisk: {
          score: this.calculateRegulatoryRisk(data.compliance),
          factors: this.identifyRegulatoryRiskFactors(data.compliance),
          mitigation: this.suggestRegulatoryRiskMitigation(data.compliance)
        }
      },
      recommendations: {
        immediate: this.generateImmediateRecommendations(data),
        shortTerm: this.generateShortTermRecommendations(data),
        longTerm: this.generateLongTermRecommendations(data)
      }
    };
  }
  
  /**
   * Format report output
   */
  static formatReport(report, format) {
    switch (format.toLowerCase()) {
      case 'json':
        return report;
        
      case 'csv':
        return this.convertToCSV(report);
        
      case 'excel':
        return this.convertToExcel(report);
        
      case 'pdf':
        return this.convertToPDF(report);
        
      default:
        return report;
    }
  }
  
  /**
   * Schedule report generation
   */
  static scheduleReport(name, template, schedule, options = {}) {
    const reportConfig = {
      name,
      template,
      schedule, // cron format
      options,
      enabled: true,
      lastRun: null,
      nextRun: this.calculateNextRun(schedule),
      createdAt: Date.now()
    };
    
    this.scheduledReports.set(name, reportConfig);
    console.log(`📊 Report scheduled: ${name}`);
  }
  
  /**
   * Run scheduled reports
   */
  static async runScheduledReports() {
    const now = Date.now();
    
    for (const [name, config] of this.scheduledReports.entries()) {
      if (config.enabled && config.nextRun <= now) {
        try {
          console.log(`🔄 Running scheduled report: ${name}`);
          
          const report = await this.generateReport(config.template, config.options);
          await this.deliverReport(name, report, config.options);
          
          config.lastRun = now;
          config.nextRun = this.calculateNextRun(config.schedule);
          
          console.log(`✅ Scheduled report completed: ${name}`);
          
        } catch (error) {
          console.error(`❌ Scheduled report failed: ${name}`, error);
        }
      }
    }
  }
  
  /**
   * Generate custom report
   */
  static async generateCustomReport(query, options = {}) {
    try {
      const data = await this.executeCustomQuery(query);
      
      return {
        reportType: 'custom',
        query,
        generatedAt: new Date().toISOString(),
        results: data,
        metadata: {
          rowCount: Array.isArray(data) ? data.length : 1,
          executionTime: options.executionTime || 0,
          cached: options.cached || false
        }
      };
      
    } catch (error) {
      console.error('Error generating custom report:', error);
      throw error;
    }
  }
  
  // Helper methods for calculations
  static calculateTotalRevenue(data) {
    return data.transactions
      .filter(t => t.type === 'FEE' && t.status === 'COMPLETED')
      .reduce((sum, t) => sum + t.amount, 0);
  }
  
  static calculateTotalFees(data) {
    return data.transactions
      .filter(t => t.status === 'COMPLETED')
      .reduce((sum, t) => sum + (t.fee || 0), 0);
  }
  
  static calculateNetProfit(data) {
    const revenue = this.calculateTotalRevenue(data);
    const costs = this.calculateOperatingCosts(data);
    return revenue - costs;
  }
  
  static calculateTransactionVolume(data) {
    return data.transactions
      .filter(t => t.status === 'COMPLETED')
      .reduce((sum, t) => sum + t.amount, 0);
  }
  
  static calculateAverageTransactionSize(data) {
    const completedTransactions = data.transactions.filter(t => t.status === 'COMPLETED');
    if (completedTransactions.length === 0) return 0;
    
    const totalVolume = this.calculateTransactionVolume(data);
    return totalVolume / completedTransactions.length;
  }
  
  static calculateSuccessRate(transactions) {
    if (transactions.length === 0) return 0;
    
    const successful = transactions.filter(t => t.status === 'COMPLETED').length;
    return (successful / transactions.length) * 100;
  }
  
  static calculateRetentionRate(users) {
    // Simplified retention calculation
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeUsers = users.filter(u => new Date(u.lastActivity) >= thirtyDaysAgo);
    
    return users.length > 0 ? (activeUsers.length / users.length) * 100 : 0;
  }
  
  static calculateChurnRate(users) {
    return 100 - this.calculateRetentionRate(users);
  }
  
  static calculateOverallRiskScore(data) {
    const transactionRisk = this.calculateTransactionRisk(data.transactions);
    const userRisk = this.calculateUserRisk(data.users);
    const operationalRisk = this.calculateOperationalRisk(data.operations);
    
    return (transactionRisk + userRisk + operationalRisk) / 3;
  }
  
  static calculateTransactionRisk(transactions) {
    // Simplified risk calculation
    const failureRate = 1 - (this.calculateSuccessRate(transactions) / 100);
    const highValueTransactions = transactions.filter(t => t.amount > 100000).length;
    const highValueRate = transactions.length > 0 ? highValueTransactions / transactions.length : 0;
    
    return Math.min(1, (failureRate * 0.3) + (highValueRate * 0.7));
  }
  
  static calculateUserRisk(users) {
    // Simplified user risk calculation
    const highRiskUsers = users.filter(u => u.riskScore > 0.7).length;
    return users.length > 0 ? highRiskUsers / users.length : 0;
  }
  
  static calculateOperationalRisk(operations) {
    // Simplified operational risk calculation
    return 0.2; // 20% baseline operational risk
  }
  
  static calculateComplianceScore(data) {
    // Simplified compliance score
    return 0.85; // 85% compliance score
  }
  
  // Grouping and analysis helper methods
  static groupByTransactionType(data) {
    const grouped = {};
    data.transactions.forEach(t => {
      if (!grouped[t.type]) {
        grouped[t.type] = { count: 0, volume: 0 };
      }
      grouped[t.type].count++;
      grouped[t.type].volume += t.amount;
    });
    return grouped;
  }
  
  static groupByCurrency(data) {
    const grouped = {};
    data.transactions.forEach(t => {
      if (!grouped[t.currency]) {
        grouped[t.currency] = { count: 0, volume: 0 };
      }
      grouped[t.currency].count++;
      grouped[t.currency].volume += t.amount;
    });
    return grouped;
  }
  
  static groupByPeriod(data, period) {
    // Group data by time period (day, week, month)
    const grouped = {};
    
    data.transactions.forEach(t => {
      const date = new Date(t.createdAt);
      let key;
      
      switch (period) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const week = this.getWeekNumber(date);
          key = `${date.getFullYear()}-W${week}`;
          break;
        case 'month':
          key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          break;
        default:
          key = date.toISOString().split('T')[0];
      }
      
      if (!grouped[key]) {
        grouped[key] = { count: 0, volume: 0 };
      }
      grouped[key].count++;
      grouped[key].volume += t.amount;
    });
    
    return grouped;
  }
  
  // Data fetching methods (implement based on your database)
  static async getFinancialData(startDate, endDate) {
    // Implement database queries
    return {
      transactions: [], // Get from database
      users: [], // Get from database
      fees: [] // Get from database
    };
  }
  
  static async getUserData(startDate, endDate) {
    // Implement database queries
    return {
      users: [], // Get from database
      sessions: [], // Get from database
      transactions: [], // Get from database
      events: [] // Get from database
    };
  }
  
  static async getTransactionData(startDate, endDate) {
    // Implement database queries
    return {
      transactions: [] // Get from database
    };
  }
  
  static async getRiskData(startDate, endDate) {
    // Implement database queries
    return {
      users: [], // Get from database
      transactions: [], // Get from database
      events: [], // Get from database
      incidents: [], // Get from database
      operations: [], // Get from database
      compliance: [] // Get from database
    };
  }
  
  // Utility methods
  static getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }
  
  static calculateNextRun(schedule) {
    // Implement cron schedule calculation
    return Date.now() + 24 * 60 * 60 * 1000; // Default: 24 hours
  }
  
  static async deliverReport(name, report, options) {
    // Implement report delivery (email, file save, etc.)
    console.log(`📧 Delivering report: ${name}`);
  }
  
  static async executeCustomQuery(query) {
    // Implement custom query execution
    return [];
  }
  
  static convertToCSV(report) {
    // Implement CSV conversion
    return 'CSV format not implemented';
  }
  
  static convertToExcel(report) {
    // Implement Excel conversion
    return 'Excel format not implemented';
  }
  
  static convertToPDF(report) {
    // Implement PDF conversion
    return 'PDF format not implemented';
  }
  
  // Additional calculation methods...
  static calculateOperatingCosts(data) { return 0; }
  static calculateGrowthRate(data, metric) { return 0; }
  static calculateRevenuePerUser(data) { return 0; }
  static calculateTransactionsPerUser(data) { return 0; }
  static calculateAverageFeeRate(data) { return 0; }
  static calculateCustomerLifetimeValue(data) { return 0; }
  static groupUsersByCountry(users) { return {}; }
  static groupUsersByVIPTier(users) { return {}; }
  static groupUsersBySource(users) { return {}; }
  static groupUsersByAge(users) { return {}; }
  static analyzeLoginFrequency(sessions) { return {}; }
  static analyzeTransactionPatterns(transactions) { return {}; }
  static analyzeFeatureUsage(events) { return {}; }
  static analyzeSessionDuration(sessions) { return {}; }
  static calculateCohortRetention(users, period) { return {}; }
  static calculateCohortLTV(users, transactions) { return {}; }
  static groupTransactionsByType(transactions) { return {}; }
  static groupTransactionsByCurrency(transactions) { return {}; }
  static groupTransactionsByStatus(transactions) { return {}; }
  static groupTransactionsByHour(transactions) { return {}; }
  static groupTransactionsByDay(transactions) { return {}; }
  static analyzeProcessingTime(transactions) { return {}; }
  static analyzeThroughput(transactions) { return {}; }
  static analyzeErrorPatterns(transactions) { return {}; }
  static identifyPeakHours(transactions) { return {}; }
  static identifySuspiciousTransactions(transactions) { return []; }
  static identifyHighValueTransactions(transactions) { return []; }
  static identifyFrequentFailures(transactions) { return []; }
  static detectTransactionAnomalies(transactions) { return []; }
  static identifyTransactionRiskFactors(transactions) { return []; }
  static suggestTransactionRiskMitigation(transactions) { return []; }
  static identifyUserRiskFactors(users) { return []; }
  static suggestUserRiskMitigation(users) { return []; }
  static identifyOperationalRiskFactors(operations) { return []; }
  static suggestOperationalRiskMitigation(operations) { return []; }
  static identifyRegulatoryRiskFactors(compliance) { return []; }
  static suggestRegulatoryRiskMitigation(compliance) { return []; }
  static generateImmediateRecommendations(data) { return []; }
  static generateShortTermRecommendations(data) { return []; }
  static generateLongTermRecommendations(data) { return []; }
  static calculateTotalVolume(transactions) { return 0; }
  static calculateAverageAmount(transactions) { return 0; }
}

/**
 * Data Visualization Generator
 */
export class DataVisualization {
  
  /**
   * Generate chart configuration
   */
  static generateChart(type, data, options = {}) {
    const config = {
      type,
      data: this.formatChartData(data, type),
      options: {
        responsive: true,
        maintainAspectRatio: false,
        ...this.getDefaultOptions(type),
        ...options
      }
    };
    
    return config;
  }
  
  /**
   * Generate dashboard widgets
   */
  static generateDashboardWidgets(data) {
    return {
      kpiCards: this.generateKPICards(data),
      charts: {
        transactionVolume: this.generateChart('line', data.transactionVolume, {
          title: 'Transaction Volume Over Time'
        }),
        userGrowth: this.generateChart('bar', data.userGrowth, {
          title: 'User Growth'
        }),
        currencyDistribution: this.generateChart('doughnut', data.currencyDistribution, {
          title: 'Currency Distribution'
        }),
        transactionTypes: this.generateChart('bar', data.transactionTypes, {
          title: 'Transaction Types'
        })
      },
      tables: {
        topUsers: this.generateTopUsersTable(data.topUsers),
        recentTransactions: this.generateRecentTransactionsTable(data.recentTransactions),
        alerts: this.generateAlertsTable(data.alerts)
      }
    };
  }
  
  /**
   * Generate KPI cards
   */
  static generateKPICards(data) {
    return [
      {
        title: 'Total Users',
        value: data.totalUsers || 0,
        change: '+12.5%',
        trend: 'up',
        color: 'blue'
      },
      {
        title: 'Total Volume',
        value: formatCurrency(data.totalVolume || 0, 'THB'),
        change: '+8.3%',
        trend: 'up',
        color: 'green'
      },
      {
        title: 'Success Rate',
        value: `${(data.successRate || 0).toFixed(1)}%`,
        change: '+2.1%',
        trend: 'up',
        color: 'purple'
      },
      {
        title: 'Active Users',
        value: data.activeUsers || 0,
        change: '+5.7%',
        trend: 'up',
        color: 'orange'
      }
    ];
  }
  
  /**
   * Format chart data
   */
  static formatChartData(data, type) {
    switch (type) {
      case 'line':
      case 'bar':
        return {
          labels: data.labels || [],
          datasets: [{
            label: data.label || 'Data',
            data: data.values || [],
            backgroundColor: this.getColors(type, data.values?.length || 1),
            borderColor: this.getBorderColors(type, data.values?.length || 1),
            borderWidth: type === 'line' ? 2 : 1
          }]
        };
        
      case 'doughnut':
      case 'pie':
        return {
          labels: data.labels || [],
          datasets: [{
            data: data.values || [],
            backgroundColor: this.getColors(type, data.values?.length || 1),
            borderWidth: 1
          }]
        };
        
      default:
        return data;
    }
  }
  
  /**
   * Get default chart options
   */
  static getDefaultOptions(type) {
    const common = {
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      }
    };
    
    switch (type) {
      case 'line':
        return {
          ...common,
          scales: {
            x: {
              display: true,
              title: {
                display: true,
                text: 'Time'
              }
            },
            y: {
              display: true,
              title: {
                display: true,
                text: 'Value'
              }
            }
          },
          elements: {
            point: {
              radius: 3
            }
          }
        };
        
      case 'bar':
        return {
          ...common,
          scales: {
            x: {
              display: true
            },
            y: {
              display: true,
              beginAtZero: true
            }
          }
        };
        
      case 'doughnut':
      case 'pie':
        return {
          ...common,
          cutout: type === 'doughnut' ? '60%' : 0
        };
        
      default:
        return common;
    }
  }
  
  /**
   * Get chart colors
   */
  static getColors(type, count) {
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
    ];
    
    if (type === 'line') {
      return colors[0];
    }
    
    return colors.slice(0, count);
  }
  
  /**
   * Get border colors
   */
  static getBorderColors(type, count) {
    const borderColors = [
      '#1D4ED8', '#059669', '#D97706', '#DC2626', '#7C3AED',
      '#0891B2', '#65A30D', '#EA580C', '#DB2777', '#4F46E5'
    ];
    
    if (type === 'line') {
      return borderColors[0];
    }
    
    return borderColors.slice(0, count);
  }
  
  /**
   * Generate tables
   */
  static generateTopUsersTable(data) {
    return {
      headers: ['User ID', 'Username', 'Volume', 'Transactions', 'VIP Tier'],
      rows: (data || []).map(user => [
        user.id,
        user.username,
        formatCurrency(user.volume, 'THB'),
        user.transactions,
        user.vipTier
      ])
    };
  }
  
  static generateRecentTransactionsTable(data) {
    return {
      headers: ['ID', 'Type', 'Amount', 'Currency', 'Status', 'Date'],
      rows: (data || []).map(tx => [
        tx.id,
        tx.type,
        formatCurrency(tx.amount, tx.currency),
        tx.currency,
        tx.status,
        formatDateTime(tx.createdAt)
      ])
    };
  }
  
  static generateAlertsTable(data) {
    return {
      headers: ['Severity', 'Message', 'Time', 'Status'],
      rows: (data || []).map(alert => [
        alert.severity,
        alert.message,
        formatDateTime(alert.timestamp),
        alert.status || 'Active'
      ])
    };
  }
}

export default {
  BI_CONFIG,
  ReportGenerator,
  DataVisualization
};