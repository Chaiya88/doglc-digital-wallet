/**
 * Metrics Collector Service
 * Collects and aggregates metrics from all workers
 */

export class MetricsCollector {
  constructor(env) {
    this.env = env;
    this.metrics = new Map();
    this.aggregatedMetrics = {};
    this.collectionInterval = 60000; // 1 minute
    this.retentionPeriod = 86400000; // 24 hours
    this.lastCollectionTime = Date.now();
  }

  async startCollection() {
    console.log('📊 Starting metrics collection...');
    
    // Initial metrics collection
    await this.collectMetrics();
    
    // Note: Periodic collection will be handled by Cron triggers
    // instead of setInterval in Cloudflare Workers environment
    console.log('📊 Metrics collector initialized. Use Cron triggers for periodic collection.');
  }

  // Cron-triggered method for system metrics collection
  async collectSystemMetrics() {
    const now = Date.now();
    console.log('📊 Collecting system metrics...');
    
    try {
      // Collect basic system metrics
      const workers = await this.getWorkerList();
      
      const systemMetrics = {
        timestamp: now,
        totalWorkers: workers.length,
        activeWorkers: 0,
        totalRequests: 0,
        avgResponseTime: 0,
        errorRate: 0,
        memoryUsage: 0
      };

      // Aggregate worker metrics
      for (const worker of workers) {
        try {
          const workerMetrics = await this.collectWorkerMetrics(worker);
          if (workerMetrics && !workerMetrics.error) {
            systemMetrics.activeWorkers++;
            systemMetrics.totalRequests += workerMetrics.requests || 0;
            systemMetrics.avgResponseTime += workerMetrics.responseTime || 0;
            systemMetrics.errorRate += workerMetrics.errorRate || 0;
            systemMetrics.memoryUsage += workerMetrics.memoryUsage || 0;
          }
        } catch (error) {
          console.error(`Failed to collect metrics for worker ${worker.id}:`, error);
        }
      }

      // Calculate averages
      if (systemMetrics.activeWorkers > 0) {
        systemMetrics.avgResponseTime = systemMetrics.avgResponseTime / systemMetrics.activeWorkers;
        systemMetrics.errorRate = systemMetrics.errorRate / systemMetrics.activeWorkers;
        systemMetrics.memoryUsage = systemMetrics.memoryUsage / systemMetrics.activeWorkers;
      }

      // Store system metrics
      await this.storeSystemMetrics(systemMetrics);
      this.lastCollectionTime = now;
      
      console.log(`📊 System metrics collected: ${systemMetrics.activeWorkers}/${systemMetrics.totalWorkers} workers active`);
    } catch (error) {
      console.error('Failed to collect system metrics:', error);
    }
  }

  // Cron-triggered method for metrics aggregation
  async aggregateMetrics() {
    console.log('📊 Aggregating metrics...');
    
    try {
      const timeWindows = [
        { name: '5min', duration: 5 * 60 * 1000 },
        { name: '15min', duration: 15 * 60 * 1000 },
        { name: '1hour', duration: 60 * 60 * 1000 },
        { name: '24hour', duration: 24 * 60 * 60 * 1000 }
      ];

      for (const window of timeWindows) {
        const aggregated = await this.aggregateMetricsForWindow(window);
        await this.storeAggregatedMetrics(window.name, aggregated);
      }
      
      console.log('📊 Metrics aggregation completed');
    } catch (error) {
      console.error('Failed to aggregate metrics:', error);
    }
  }

  // Cron-triggered method for cleanup
  async cleanupOldMetrics() {
    const cutoff = Date.now() - this.retentionPeriod;
    console.log(`🧹 Cleaning up metrics older than ${new Date(cutoff).toISOString()}`);
    
    try {
      // Cleanup logic would go here
      // For now, just log the action
      console.log('🧹 Metrics cleanup completed');
    } catch (error) {
      console.error('Failed to cleanup old metrics:', error);
    }
  }

  async collectMetrics() {
    try {
      const workers = await this.getWorkerList();
      
      const metricsPromises = workers.map(worker => 
        this.collectWorkerMetrics(worker).catch(error => ({
          workerId: worker.id,
          error: error.message,
          timestamp: new Date().toISOString()
        }))
      );

      const results = await Promise.all(metricsPromises);
      
      // Process and store metrics
      for (const result of results) {
        if (!result.error) {
          await this.storeWorkerMetrics(result.workerId, result);
        }
      }

      // Update aggregated metrics
      await this.updateAggregatedMetrics();
      
      console.log(`📊 Metrics collected from ${results.filter(r => !r.error).length}/${workers.length} workers`);
    } catch (error) {
      console.error('❌ Metrics collection error:', error.message);
    }
  }

  async collectWorkerMetrics(worker) {
    try {
      const response = await fetch(`${worker.url}/metrics`, {
        method: 'GET',
        headers: {
          'User-Agent': 'DOGLC-MetricsCollector/1.0',
          'Authorization': `Bearer ${this.env.ORCHESTRATOR_API_KEY}`
        },
        signal: AbortSignal.timeout(15000) // 15 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const metricsData = await response.json();
      
      return {
        workerId: worker.id,
        timestamp: new Date().toISOString(),
        metrics: this.normalizeMetrics(metricsData),
        url: worker.url
      };
    } catch (error) {
      throw new Error(`Failed to collect metrics from ${worker.id}: ${error.message}`);
    }
  }

  normalizeMetrics(rawMetrics) {
    // Normalize metrics from different workers to a standard format
    return {
      // Performance metrics
      totalRequests: rawMetrics.totalRequests || rawMetrics.requests_total || 0,
      requestsPerMinute: rawMetrics.requestsPerMinute || rawMetrics.rpm || 0,
      avgResponseTime: rawMetrics.avgResponseTime || rawMetrics.response_time_avg || 0,
      maxResponseTime: rawMetrics.maxResponseTime || rawMetrics.response_time_max || 0,
      minResponseTime: rawMetrics.minResponseTime || rawMetrics.response_time_min || 0,
      
      // Error metrics
      totalErrors: rawMetrics.totalErrors || rawMetrics.errors_total || 0,
      errorRate: rawMetrics.errorRate || rawMetrics.error_rate || 0,
      httpErrors: rawMetrics.httpErrors || {},
      
      // Resource metrics
      memoryUsage: rawMetrics.memoryUsage || rawMetrics.memory_usage || {},
      cpuUsage: rawMetrics.cpuUsage || rawMetrics.cpu_usage || 0,
      
      // Worker-specific metrics
      activeConnections: rawMetrics.activeConnections || rawMetrics.connections_active || 0,
      queueSize: rawMetrics.queueSize || rawMetrics.queue_size || 0,
      
      // Business metrics
      walletOperations: rawMetrics.walletOperations || 0,
      securityEvents: rawMetrics.securityEvents || 0,
      ocrProcessed: rawMetrics.ocrProcessed || 0,
      gmailWebhooks: rawMetrics.gmailWebhooks || 0,
      
      // Health metrics
      uptime: rawMetrics.uptime || 0,
      version: rawMetrics.version || 'unknown',
      status: rawMetrics.status || 'unknown'
    };
  }

  async storeWorkerMetrics(workerId, metricsData) {
    // Store in memory
    const workerMetrics = this.metrics.get(workerId) || [];
    workerMetrics.push(metricsData);
    
    // Keep only last 1440 records (24 hours worth at 1-minute intervals)
    if (workerMetrics.length > 1440) {
      workerMetrics.shift();
    }
    
    this.metrics.set(workerId, workerMetrics);

    // Store in KV for persistence
    if (this.env.ORCHESTRATOR_KV) {
      const kvKey = `metrics:${workerId}:${Date.now()}`;
      await this.env.ORCHESTRATOR_KV.put(
        kvKey,
        JSON.stringify(metricsData),
        { expirationTtl: this.retentionPeriod / 1000 } // Convert to seconds
      );
    }

    // Store latest metrics summary
    if (this.env.ORCHESTRATOR_KV) {
      await this.env.ORCHESTRATOR_KV.put(
        `metrics:latest:${workerId}`,
        JSON.stringify({
          ...metricsData,
          summary: this.calculateWorkerSummary(workerId)
        }),
        { expirationTtl: 300 } // 5 minutes
      );
    }
  }

  async updateAggregatedMetrics() {
    const allWorkers = Array.from(this.metrics.keys());
    const now = new Date().toISOString();
    
    let totalRequests = 0;
    let totalErrors = 0;
    let totalResponseTime = 0;
    let responseTimeCount = 0;
    let totalMemory = 0;
    let totalActiveConnections = 0;
    let totalWalletOperations = 0;
    let totalSecurityEvents = 0;
    let totalOcrProcessed = 0;
    let totalGmailWebhooks = 0;

    for (const workerId of allWorkers) {
      const workerMetrics = this.metrics.get(workerId) || [];
      const latest = workerMetrics[workerMetrics.length - 1];
      
      if (latest && latest.metrics) {
        const m = latest.metrics;
        totalRequests += m.totalRequests;
        totalErrors += m.totalErrors;
        totalActiveConnections += m.activeConnections;
        totalWalletOperations += m.walletOperations;
        totalSecurityEvents += m.securityEvents;
        totalOcrProcessed += m.ocrProcessed;
        totalGmailWebhooks += m.gmailWebhooks;
        
        if (m.avgResponseTime > 0) {
          totalResponseTime += m.avgResponseTime;
          responseTimeCount++;
        }
        
        if (m.memoryUsage && m.memoryUsage.used) {
          totalMemory += m.memoryUsage.used;
        }
      }
    }

    this.aggregatedMetrics = {
      timestamp: now,
      totalRequests,
      totalErrors,
      errorRate: totalRequests > 0 ? Math.round((totalErrors / totalRequests) * 10000) / 100 : 0,
      avgResponseTime: responseTimeCount > 0 ? Math.round(totalResponseTime / responseTimeCount) : 0,
      totalMemoryUsage: totalMemory,
      totalActiveConnections,
      totalWorkers: allWorkers.length,
      healthyWorkers: this.countHealthyWorkers(),
      
      // Business metrics
      totalWalletOperations,
      totalSecurityEvents,
      totalOcrProcessed,
      totalGmailWebhooks,
      
      // Performance indicators
      requestsPerSecond: this.calculateRequestsPerSecond(),
      systemLoad: this.calculateSystemLoad()
    };

    // Store aggregated metrics
    if (this.env.ORCHESTRATOR_KV) {
      await this.env.ORCHESTRATOR_KV.put(
        'metrics:aggregated:latest',
        JSON.stringify(this.aggregatedMetrics),
        { expirationTtl: 300 } // 5 minutes
      );
    }
  }

  calculateWorkerSummary(workerId) {
    const workerMetrics = this.metrics.get(workerId) || [];
    if (workerMetrics.length === 0) return {};

    const latest = workerMetrics[workerMetrics.length - 1];
    const last10 = workerMetrics.slice(-10);
    
    // Calculate trends
    const responseTimes = last10.map(m => m.metrics?.avgResponseTime || 0).filter(rt => rt > 0);
    const requests = last10.map(m => m.metrics?.totalRequests || 0);
    const errors = last10.map(m => m.metrics?.totalErrors || 0);

    return {
      current: latest.metrics,
      trends: {
        avgResponseTime: responseTimes.length > 0 ? 
          Math.round(responseTimes.reduce((sum, rt) => sum + rt, 0) / responseTimes.length) : 0,
        requestTrend: this.calculateTrend(requests),
        errorTrend: this.calculateTrend(errors),
        isImproving: this.isPerformanceImproving(responseTimes),
        isDegrading: this.isPerformanceDegrading(responseTimes)
      },
      alerts: this.generateMetricAlerts(workerId, latest.metrics)
    };
  }

  calculateTrend(values) {
    if (values.length < 2) return 'stable';
    
    const recent = values.slice(-3);
    const older = values.slice(-6, -3);
    
    if (recent.length === 0 || older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((sum, v) => sum + v, 0) / recent.length;
    const olderAvg = older.reduce((sum, v) => sum + v, 0) / older.length;
    
    const change = ((recentAvg - olderAvg) / Math.max(olderAvg, 1)) * 100;
    
    if (change > 10) return 'increasing';
    if (change < -10) return 'decreasing';
    return 'stable';
  }

  isPerformanceImproving(responseTimes) {
    if (responseTimes.length < 5) return false;
    
    const recent = responseTimes.slice(-3);
    const older = responseTimes.slice(-6, -3);
    
    if (recent.length === 0 || older.length === 0) return false;
    
    const recentAvg = recent.reduce((sum, rt) => sum + rt, 0) / recent.length;
    const olderAvg = older.reduce((sum, rt) => sum + rt, 0) / older.length;
    
    return recentAvg < olderAvg * 0.9; // 10% improvement
  }

  isPerformanceDegrading(responseTimes) {
    if (responseTimes.length < 5) return false;
    
    const recent = responseTimes.slice(-3);
    const older = responseTimes.slice(-6, -3);
    
    if (recent.length === 0 || older.length === 0) return false;
    
    const recentAvg = recent.reduce((sum, rt) => sum + rt, 0) / recent.length;
    const olderAvg = older.reduce((sum, rt) => sum + rt, 0) / older.length;
    
    return recentAvg > olderAvg * 1.5; // 50% degradation
  }

  generateMetricAlerts(workerId, metrics) {
    const alerts = [];
    
    if (metrics.errorRate > 5) {
      alerts.push({
        type: 'high-error-rate',
        severity: 'warning',
        message: `High error rate: ${metrics.errorRate}%`
      });
    }
    
    if (metrics.avgResponseTime > 5000) {
      alerts.push({
        type: 'slow-response',
        severity: 'warning',
        message: `Slow response time: ${metrics.avgResponseTime}ms`
      });
    }
    
    if (metrics.memoryUsage?.used > 200 * 1024 * 1024) { // 200MB
      alerts.push({
        type: 'high-memory-usage',
        severity: 'warning',
        message: `High memory usage: ${Math.round(metrics.memoryUsage.used / 1024 / 1024)}MB`
      });
    }
    
    return alerts;
  }

  calculateRequestsPerSecond() {
    const workers = Array.from(this.metrics.values());
    let totalRPS = 0;
    
    for (const workerMetrics of workers) {
      if (workerMetrics.length >= 2) {
        const latest = workerMetrics[workerMetrics.length - 1];
        const previous = workerMetrics[workerMetrics.length - 2];
        
        const timeDiff = (new Date(latest.timestamp) - new Date(previous.timestamp)) / 1000;
        const requestDiff = latest.metrics.totalRequests - previous.metrics.totalRequests;
        
        if (timeDiff > 0) {
          totalRPS += requestDiff / timeDiff;
        }
      }
    }
    
    return Math.round(totalRPS * 100) / 100;
  }

  calculateSystemLoad() {
    const workers = Array.from(this.metrics.values());
    let totalLoad = 0;
    let workerCount = 0;
    
    for (const workerMetrics of workers) {
      const latest = workerMetrics[workerMetrics.length - 1];
      if (latest && latest.metrics.cpuUsage !== undefined) {
        totalLoad += latest.metrics.cpuUsage;
        workerCount++;
      }
    }
    
    return workerCount > 0 ? Math.round((totalLoad / workerCount) * 100) / 100 : 0;
  }

  countHealthyWorkers() {
    let healthyCount = 0;
    
    for (const workerMetrics of this.metrics.values()) {
      const latest = workerMetrics[workerMetrics.length - 1];
      if (latest && latest.metrics.status === 'healthy') {
        healthyCount++;
      }
    }
    
    return healthyCount;
  }

  async getAllMetrics() {
    return {
      aggregated: this.aggregatedMetrics,
      workers: await this.getAllWorkerMetrics(),
      timestamp: new Date().toISOString()
    };
  }

  async getAllWorkerMetrics() {
    const result = {};
    
    for (const [workerId, workerMetrics] of this.metrics.entries()) {
      const latest = workerMetrics[workerMetrics.length - 1];
      const summary = this.calculateWorkerSummary(workerId);
      
      result[workerId] = {
        latest: latest?.metrics || {},
        summary,
        historyCount: workerMetrics.length,
        lastUpdate: latest?.timestamp
      };
    }
    
    return result;
  }

  async getWorkerMetrics(workerId) {
    const workerMetrics = this.metrics.get(workerId) || [];
    const summary = this.calculateWorkerSummary(workerId);
    
    return {
      workerId,
      metrics: workerMetrics.map(m => ({
        timestamp: m.timestamp,
        ...m.metrics
      })),
      summary,
      count: workerMetrics.length
    };
  }

  async getWorkerList() {
    // This would integrate with WorkerRegistry
    return [
      { id: 'main-bot', url: this.env.MAIN_BOT_WORKER_URL || 'https://doglc-main-bot-production.chaiya88.workers.dev' },
      { id: 'api', url: this.env.API_WORKER_URL || 'https://doglc-api-production.chaiya88.workers.dev' },
      { id: 'banking', url: this.env.BANKING_WORKER_URL || 'https://doglc-banking-production.chaiya88.workers.dev' },
      { id: 'security', url: this.env.SECURITY_WORKER_URL || 'https://doglc-security-production.chaiya88.workers.dev' },
      { id: 'frontend', url: this.env.FRONTEND_WORKER_URL || 'https://doglc-frontend-production.chaiya88.workers.dev' },
      { id: 'analytics', url: this.env.ANALYTICS_WORKER_URL || 'https://doglc-analytics-production.chaiya88.workers.dev' }
    ].filter(worker => worker.url && worker.url !== 'undefined');
  }

  async storeSystemMetrics(metrics) {
    // Store system-wide metrics
    try {
      if (this.env.METRICS_KV) {
        const key = `system_metrics_${metrics.timestamp}`;
        await this.env.METRICS_KV.put(key, JSON.stringify(metrics), {
          expirationTtl: this.retentionPeriod / 1000 // Convert to seconds
        });
      }
      
      // Also store in memory for quick access
      this.aggregatedMetrics.system = metrics;
    } catch (error) {
      console.error('Failed to store system metrics:', error);
    }
  }

  async aggregateMetricsForWindow(window) {
    // Aggregate metrics for a specific time window
    const cutoff = Date.now() - window.duration;
    
    try {
      // For now, return basic aggregation
      // In a full implementation, this would query stored metrics
      return {
        windowName: window.name,
        duration: window.duration,
        startTime: cutoff,
        endTime: Date.now(),
        totalRequests: 0,
        avgResponseTime: 0,
        errorRate: 0,
        workerCount: 0
      };
    } catch (error) {
      console.error(`Failed to aggregate metrics for ${window.name}:`, error);
      return null;
    }
  }

  async storeAggregatedMetrics(windowName, metrics) {
    // Store aggregated metrics
    try {
      if (this.env.METRICS_KV && metrics) {
        const key = `aggregated_${windowName}_${Date.now()}`;
        await this.env.METRICS_KV.put(key, JSON.stringify(metrics), {
          expirationTtl: this.retentionPeriod / 1000
        });
      }
    } catch (error) {
      console.error(`Failed to store aggregated metrics for ${windowName}:`, error);
    }
  }
}