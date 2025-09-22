/**
 * Health Monitor Service
 * Monitors worker health and performs auto-recovery
 */

export class HealthMonitor {
  constructor(env) {
    this.env = env;
    this.healthChecks = new Map();
    this.healthHistory = new Map();
    this.alertThresholds = {
      responseTime: 5000, // 5 seconds
      errorRate: 10, // 10%
      consecutiveFailures: 3
    };
    this.checkInterval = 30000; // 30 seconds
    this.lastHealthCheck = Date.now();
  }

  async startMonitoring() {
    console.log('🏥 Starting health monitoring...');
    
    // Initial health check
    await this.checkAllWorkers();
    
    // Note: Periodic health checks will be handled by Cron triggers
    // instead of setInterval in Cloudflare Workers environment
    console.log('🏥 Health monitor initialized. Use Cron triggers for periodic checks.');
  }

  async checkAllWorkers() {
    const workers = await this.getWorkerList();
    
    const healthPromises = workers.map(worker => 
      this.checkWorkerHealth(worker).catch(error => ({
        workerId: worker.id,
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      }))
    );

    const results = await Promise.all(healthPromises);
    
    // Process results and update health status
    for (const result of results) {
      await this.updateHealthStatus(result.workerId, result);
    }

    return results;
  }

  async checkWorkerHealth(worker) {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${worker.url}/health`, {
        method: 'GET',
        headers: {
          'User-Agent': 'DOGLC-HealthMonitor/1.0',
          'Authorization': `Bearer ${this.env.ORCHESTRATOR_API_KEY}`
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      const responseTime = Date.now() - startTime;
      const healthData = response.ok ? await response.json() : null;

      const result = {
        workerId: worker.id,
        status: this.determineHealthStatus(response, responseTime, healthData),
        responseTime,
        httpStatus: response.status,
        timestamp: new Date().toISOString(),
        details: healthData,
        url: worker.url
      };

      // Check for performance issues
      if (responseTime > this.alertThresholds.responseTime) {
        result.warnings = result.warnings || [];
        result.warnings.push(`High response time: ${responseTime}ms`);
      }

      return result;
    } catch (error) {
      return {
        workerId: worker.id,
        status: 'unhealthy',
        error: error.message,
        responseTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        url: worker.url
      };
    }
  }

  determineHealthStatus(response, responseTime, healthData) {
    if (!response.ok) {
      return 'unhealthy';
    }

    if (responseTime > this.alertThresholds.responseTime) {
      return 'degraded';
    }

    if (healthData && healthData.status === 'healthy') {
      return 'healthy';
    }

    if (healthData && healthData.errors && healthData.errors.length > 0) {
      return 'degraded';
    }

    return 'healthy';
  }

  async updateHealthStatus(workerId, healthResult) {
    // Update current health check
    this.healthChecks.set(workerId, healthResult);

    // Update health history
    const history = this.healthHistory.get(workerId) || [];
    history.push(healthResult);

    // Keep only last 100 checks
    if (history.length > 100) {
      history.shift();
    }

    this.healthHistory.set(workerId, history);

    // Store in KV for persistence
    if (this.env.ORCHESTRATOR_KV) {
      await this.env.ORCHESTRATOR_KV.put(
        `health:${workerId}`,
        JSON.stringify({
          current: healthResult,
          history: history.slice(-10) // Keep last 10 in KV
        }),
        { expirationTtl: 3600 } // 1 hour
      );
    }

    // Check for alerts
    await this.checkForAlerts(workerId, history);

    return healthResult;
  }

  async checkForAlerts(workerId, history) {
    if (history.length < 3) return;

    const recent = history.slice(-3);
    const consecutiveFailures = recent.filter(h => h.status === 'unhealthy').length;

    // Alert on consecutive failures
    if (consecutiveFailures >= this.alertThresholds.consecutiveFailures) {
      await this.triggerAlert('consecutive-failures', workerId, {
        message: `Worker ${workerId} has ${consecutiveFailures} consecutive failures`,
        severity: 'critical',
        failures: recent
      });
    }

    // Calculate error rate over last 10 checks
    const last10 = history.slice(-10);
    const errorRate = (last10.filter(h => h.status === 'unhealthy').length / last10.length) * 100;

    if (errorRate >= this.alertThresholds.errorRate) {
      await this.triggerAlert('high-error-rate', workerId, {
        message: `Worker ${workerId} has high error rate: ${errorRate.toFixed(1)}%`,
        severity: 'warning',
        errorRate,
        checks: last10
      });
    }

    // Check for performance degradation
    const avgResponseTime = this.calculateAverageResponseTime(workerId);
    if (avgResponseTime > this.alertThresholds.responseTime) {
      await this.triggerAlert('performance-degradation', workerId, {
        message: `Worker ${workerId} has high average response time: ${avgResponseTime}ms`,
        severity: 'warning',
        avgResponseTime
      });
    }
  }

  async triggerAlert(alertType, workerId, details) {
    const alert = {
      type: alertType,
      workerId,
      timestamp: new Date().toISOString(),
      ...details
    };

    console.warn(`🚨 ALERT [${alertType}]: ${details.message}`);

    // Store alert
    if (this.env.ORCHESTRATOR_KV) {
      const alertKey = `alert:${Date.now()}:${workerId}:${alertType}`;
      await this.env.ORCHESTRATOR_KV.put(
        alertKey,
        JSON.stringify(alert),
        { expirationTtl: 86400 } // 24 hours
      );
    }

    // Send notifications (integrate with external services)
    await this.sendNotification(alert);

    return alert;
  }

  async sendNotification(alert) {
    try {
      // Send to Slack if configured
      if (this.env.SLACK_WEBHOOK_URL) {
        await this.sendSlackNotification(alert);
      }

      // Send email if configured
      if (this.env.ALERT_EMAIL) {
        await this.sendEmailNotification(alert);
      }

      // Send to Discord if configured
      if (this.env.DISCORD_WEBHOOK_URL) {
        await this.sendDiscordNotification(alert);
      }
    } catch (error) {
      console.error('❌ Failed to send notification:', error.message);
    }
  }

  async sendSlackNotification(alert) {
    const color = {
      'critical': '#FF0000',
      'warning': '#FFA500',
      'info': '#0000FF'
    }[alert.severity] || '#808080';

    const payload = {
      attachments: [{
        color,
        title: `🚨 DOGLC Orchestrator Alert`,
        fields: [
          { title: 'Alert Type', value: alert.type, short: true },
          { title: 'Worker', value: alert.workerId, short: true },
          { title: 'Severity', value: alert.severity, short: true },
          { title: 'Time', value: alert.timestamp, short: true },
          { title: 'Message', value: alert.message, short: false }
        ]
      }]
    };

    await fetch(this.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }

  async sendDiscordNotification(alert) {
    const embed = {
      title: '🚨 DOGLC Orchestrator Alert',
      color: alert.severity === 'critical' ? 0xFF0000 : 0xFFA500,
      fields: [
        { name: 'Alert Type', value: alert.type, inline: true },
        { name: 'Worker', value: alert.workerId, inline: true },
        { name: 'Severity', value: alert.severity, inline: true },
        { name: 'Message', value: alert.message, inline: false }
      ],
      timestamp: alert.timestamp
    };

    await fetch(this.env.DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] })
    });
  }

  async performAutoRecovery() {
    const unhealthyWorkers = Array.from(this.healthChecks.entries())
      .filter(([_, health]) => health.status === 'unhealthy')
      .map(([workerId, health]) => ({ workerId, health }));

    for (const { workerId, health } of unhealthyWorkers) {
      const history = this.healthHistory.get(workerId) || [];
      const consecutiveFailures = this.countConsecutiveFailures(history);

      if (consecutiveFailures >= 3) {
        console.log(`🔄 Attempting auto-recovery for worker: ${workerId}`);
        await this.attemptRecovery(workerId);
      }
    }
  }

  async attemptRecovery(workerId) {
    try {
      // Try restart worker
      const worker = await this.getWorker(workerId);
      if (!worker) return;

      const response = await fetch(`${worker.url}/admin/restart`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.env.ORCHESTRATOR_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log(`✅ Auto-recovery successful for worker: ${workerId}`);
        
        await this.triggerAlert('auto-recovery-success', workerId, {
          message: `Auto-recovery successful for worker ${workerId}`,
          severity: 'info'
        });
      } else {
        throw new Error(`Restart failed with status ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ Auto-recovery failed for worker ${workerId}:`, error.message);
      
      await this.triggerAlert('auto-recovery-failed', workerId, {
        message: `Auto-recovery failed for worker ${workerId}: ${error.message}`,
        severity: 'critical'
      });
    }
  }

  countConsecutiveFailures(history) {
    let count = 0;
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].status === 'unhealthy') {
        count++;
      } else {
        break;
      }
    }
    return count;
  }

  calculateAverageResponseTime(workerId) {
    const history = this.healthHistory.get(workerId) || [];
    const recent = history.slice(-10);
    
    if (recent.length === 0) return 0;
    
    const total = recent.reduce((sum, check) => sum + (check.responseTime || 0), 0);
    return Math.round(total / recent.length);
  }

  async getAllWorkersHealth() {
    const healthMap = {};
    
    for (const [workerId, health] of this.healthChecks.entries()) {
      const history = this.healthHistory.get(workerId) || [];
      const avgResponseTime = this.calculateAverageResponseTime(workerId);
      const uptime = this.calculateUptime(history);
      
      healthMap[workerId] = {
        ...health,
        avgResponseTime,
        uptime,
        totalChecks: history.length,
        consecutiveFailures: this.countConsecutiveFailures(history)
      };
    }

    return healthMap;
  }

  calculateUptime(history) {
    if (history.length === 0) return 0;
    
    const healthyChecks = history.filter(h => h.status === 'healthy').length;
    return Math.round((healthyChecks / history.length) * 100 * 100) / 100; // Percentage with 2 decimals
  }

  async getWorkerList() {
    // This would integrate with WorkerRegistry
    // For now, return static list
    return [
      { id: 'main-bot', url: this.env.MAIN_BOT_WORKER_URL || 'https://doglc-main-bot-production.chaiya88.workers.dev' },
      { id: 'api', url: this.env.API_WORKER_URL || 'https://doglc-api-production.chaiya88.workers.dev' },
      { id: 'banking', url: this.env.BANKING_WORKER_URL || 'https://doglc-banking-production.chaiya88.workers.dev' },
      { id: 'security', url: this.env.SECURITY_WORKER_URL || 'https://doglc-security-production.chaiya88.workers.dev' },
      { id: 'frontend', url: this.env.FRONTEND_WORKER_URL || 'https://doglc-frontend-production.chaiya88.workers.dev' },
      { id: 'analytics', url: this.env.ANALYTICS_WORKER_URL || 'https://doglc-analytics-production.chaiya88.workers.dev' }
    ].filter(worker => worker.url && worker.url !== 'undefined');
  }

  async getWorker(workerId) {
    const workers = await this.getWorkerList();
    return workers.find(w => w.id === workerId);
  }

  getHealthSummary() {
    const checks = Array.from(this.healthChecks.values());
    const total = checks.length;
    const healthy = checks.filter(c => c.status === 'healthy').length;
    const degraded = checks.filter(c => c.status === 'degraded').length;
    const unhealthy = checks.filter(c => c.status === 'unhealthy').length;

    return {
      total,
      healthy,
      degraded,
      unhealthy,
      healthPercentage: total > 0 ? Math.round((healthy / total) * 100) : 0,
      lastCheck: new Date().toISOString()
    };
  }

  // Cron-triggered method for cleanup
  async cleanupOldLogs() {
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
    console.log(`🧹 Cleaning up health logs older than ${new Date(cutoff).toISOString()}`);
    
    try {
      // Clean up health history
      for (const [workerId, history] of this.healthHistory.entries()) {
        const filtered = history.filter(record => record.timestamp > cutoff);
        this.healthHistory.set(workerId, filtered);
        
        if (history.length !== filtered.length) {
          console.log(`🧹 Cleaned up ${history.length - filtered.length} old health records for ${workerId}`);
        }
      }
      
      // Clean up old health checks
      for (const [workerId, check] of this.healthChecks.entries()) {
        if (check.timestamp < cutoff) {
          this.healthChecks.delete(workerId);
          console.log(`🧹 Removed stale health check for ${workerId}`);
        }
      }
      
      console.log('🧹 Health logs cleanup completed');
    } catch (error) {
      console.error('Failed to cleanup old health logs:', error);
    }
  }
}