/**
 * Worker Registry Service
 * Manages registration, discovery, and lifecycle of all workers
 */

export class WorkerRegistry {
  constructor(env) {
    this.env = env;
    this.workers = new Map();
    this.initializeWorkers();
  }

  async initializeWorkers() {
    // Define all available workers with their configurations
    const workerConfigs = [
      {
        id: 'main-bot',
        name: 'Main Bot Worker',
        type: 'telegram-bot',
        url: this.env.MAIN_BOT_WORKER_URL || 'https://doglc-main-bot-production.chaiya88.workers.dev',
        healthPath: '/health',
        capabilities: ['telegram-api', 'user-management', 'rate-limiting'],
        priority: 1,
        maxInstances: 3,
        currentInstances: 1,
        status: 'unknown'
      },
      {
        id: 'api',
        name: 'API Worker',
        type: 'rest-api',
        url: this.env.API_WORKER_URL || 'https://doglc-api-production.chaiya88.workers.dev',
        healthPath: '/health',
        capabilities: ['rest-api', 'authentication', 'user-operations'],
        priority: 2,
        maxInstances: 5,
        currentInstances: 2,
        status: 'unknown'
      },
      {
        id: 'banking',
        name: 'Banking Worker',
        type: 'financial-operations',
        url: this.env.BANKING_WORKER_URL || 'https://doglc-banking-production.chaiya88.workers.dev',
        healthPath: '/health',
        capabilities: ['transactions', 'deposits', 'withdrawals', 'balance-management'],
        priority: 1,
        maxInstances: 4,
        currentInstances: 2,
        status: 'unknown'
      },
      {
        id: 'security',
        name: 'Security Worker',
        type: 'security-operations',
        url: this.env.SECURITY_WORKER_URL || 'https://doglc-security-production.chaiya88.workers.dev',
        healthPath: '/health',
        capabilities: ['ocr-processing', 'fraud-detection', 'gmail-integration', 'security-monitoring'],
        priority: 1,
        maxInstances: 3,
        currentInstances: 1,
        status: 'unknown'
      },
      {
        id: 'frontend',
        name: 'Frontend Worker',
        type: 'web-application',
        url: this.env.FRONTEND_WORKER_URL || 'https://doglc-frontend-production.chaiya88.workers.dev',
        healthPath: '/health',
        capabilities: ['web-interface', 'static-assets', 'user-dashboard'],
        priority: 3,
        maxInstances: 2,
        currentInstances: 1,
        status: 'unknown'
      },
      {
        id: 'analytics',
        name: 'Analytics Worker',
        type: 'data-analytics',
        url: this.env.ANALYTICS_WORKER_URL || 'https://doglc-analytics-production.chaiya88.workers.dev',
        healthPath: '/health',
        capabilities: ['metrics-collection', 'data-analysis', 'reporting', 'monitoring'],
        priority: 4,
        maxInstances: 2,
        currentInstances: 1,
        status: 'unknown'
      }
    ];

    // Register all workers
    for (const config of workerConfigs) {
      await this.registerWorker(config);
    }
  }

  async registerWorker(config) {
    const worker = {
      ...config,
      registeredAt: new Date().toISOString(),
      lastHealthCheck: null,
      lastResponse: null,
      errorCount: 0,
      totalRequests: 0,
      avgResponseTime: 0,
      metadata: {
        version: '1.0.0',
        deployment: this.env.ENVIRONMENT || 'production',
        region: 'auto'
      }
    };

    this.workers.set(config.id, worker);
    
    // Store in KV for persistence
    if (this.env.ORCHESTRATOR_KV) {
      await this.env.ORCHESTRATOR_KV.put(
        `worker:${config.id}`,
        JSON.stringify(worker),
        { expirationTtl: 86400 } // 24 hours
      );
    }

    console.log(`✅ Registered worker: ${config.name} (${config.id})`);
    return worker;
  }

  async getAllWorkers() {
    return Array.from(this.workers.values());
  }

  async getWorker(workerId) {
    return this.workers.get(workerId);
  }

  async getWorkersByType(type) {
    return Array.from(this.workers.values()).filter(worker => worker.type === type);
  }

  async getHealthyWorkers() {
    return Array.from(this.workers.values()).filter(worker => worker.status === 'healthy');
  }

  async getWorkersByCapability(capability) {
    return Array.from(this.workers.values()).filter(worker => 
      worker.capabilities.includes(capability) && worker.status === 'healthy'
    );
  }

  async updateWorkerStatus(workerId, status, metadata = {}) {
    const worker = this.workers.get(workerId);
    if (!worker) {
      throw new Error(`Worker ${workerId} not found`);
    }

    worker.status = status;
    worker.lastHealthCheck = new Date().toISOString();
    worker.metadata = { ...worker.metadata, ...metadata };

    // Update error count
    if (status === 'unhealthy' || status === 'error') {
      worker.errorCount++;
    } else if (status === 'healthy') {
      worker.errorCount = Math.max(0, worker.errorCount - 1);
    }

    this.workers.set(workerId, worker);

    // Persist to KV
    if (this.env.ORCHESTRATOR_KV) {
      await this.env.ORCHESTRATOR_KV.put(
        `worker:${workerId}`,
        JSON.stringify(worker)
      );
    }

    // Log significant status changes
    if (status === 'unhealthy' || status === 'error') {
      console.warn(`⚠️ Worker ${worker.name} status changed to ${status}`);
    } else if (status === 'healthy') {
      console.log(`✅ Worker ${worker.name} is healthy`);
    }

    return worker;
  }

  async updateWorkerMetrics(workerId, metrics) {
    const worker = this.workers.get(workerId);
    if (!worker) {
      return;
    }

    worker.totalRequests = metrics.totalRequests || worker.totalRequests;
    worker.avgResponseTime = metrics.avgResponseTime || worker.avgResponseTime;
    worker.lastResponse = metrics.lastResponse || worker.lastResponse;

    this.workers.set(workerId, worker);
  }

  async restartWorker(workerId) {
    const worker = this.workers.get(workerId);
    if (!worker) {
      return { success: false, error: 'Worker not found' };
    }

    try {
      // Call worker's restart endpoint
      const response = await fetch(`${worker.url}/admin/restart`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.env.ORCHESTRATOR_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await this.updateWorkerStatus(workerId, 'restarting');
        console.log(`🔄 Restarted worker: ${worker.name}`);
        return { success: true, message: `Worker ${worker.name} restarted successfully` };
      } else {
        throw new Error(`Restart failed with status ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ Failed to restart worker ${worker.name}:`, error.message);
      await this.updateWorkerStatus(workerId, 'error', { lastError: error.message });
      return { success: false, error: error.message };
    }
  }

  async stopWorker(workerId) {
    const worker = this.workers.get(workerId);
    if (!worker) {
      return { success: false, error: 'Worker not found' };
    }

    try {
      // Call worker's stop endpoint
      const response = await fetch(`${worker.url}/admin/stop`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.env.ORCHESTRATOR_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await this.updateWorkerStatus(workerId, 'stopped');
        console.log(`⏹️ Stopped worker: ${worker.name}`);
        return { success: true, message: `Worker ${worker.name} stopped successfully` };
      } else {
        throw new Error(`Stop failed with status ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ Failed to stop worker ${worker.name}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  async startWorker(workerId) {
    const worker = this.workers.get(workerId);
    if (!worker) {
      return { success: false, error: 'Worker not found' };
    }

    try {
      // Call worker's start endpoint
      const response = await fetch(`${worker.url}/admin/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.env.ORCHESTRATOR_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await this.updateWorkerStatus(workerId, 'starting');
        console.log(`▶️ Started worker: ${worker.name}`);
        return { success: true, message: `Worker ${worker.name} started successfully` };
      } else {
        throw new Error(`Start failed with status ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ Failed to start worker ${worker.name}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  isValidWorker(workerId) {
    return this.workers.has(workerId);
  }

  getStatus() {
    const workers = Array.from(this.workers.values());
    return {
      totalWorkers: workers.length,
      healthyWorkers: workers.filter(w => w.status === 'healthy').length,
      unhealthyWorkers: workers.filter(w => w.status === 'unhealthy' || w.status === 'error').length,
      unknownWorkers: workers.filter(w => w.status === 'unknown').length,
      totalInstances: workers.reduce((sum, w) => sum + w.currentInstances, 0),
      maxCapacity: workers.reduce((sum, w) => sum + w.maxInstances, 0),
      lastUpdate: new Date().toISOString()
    };
  }

  async getWorkerSummary() {
    const workers = Array.from(this.workers.values());
    return workers.map(worker => ({
      id: worker.id,
      name: worker.name,
      type: worker.type,
      status: worker.status,
      capabilities: worker.capabilities,
      instances: `${worker.currentInstances}/${worker.maxInstances}`,
      lastHealthCheck: worker.lastHealthCheck
    }));
  }

  async scaleWorker(workerId, instances) {
    const worker = this.workers.get(workerId);
    if (!worker) {
      return { success: false, error: 'Worker not found' };
    }

    if (instances > worker.maxInstances) {
      return { success: false, error: `Cannot scale beyond max instances (${worker.maxInstances})` };
    }

    if (instances < 1) {
      return { success: false, error: 'Cannot scale below 1 instance' };
    }

    try {
      // Call worker's scale endpoint
      const response = await fetch(`${worker.url}/admin/scale`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.env.ORCHESTRATOR_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ instances })
      });

      if (response.ok) {
        worker.currentInstances = instances;
        this.workers.set(workerId, worker);
        console.log(`📈 Scaled worker ${worker.name} to ${instances} instances`);
        return { success: true, message: `Worker scaled to ${instances} instances` };
      } else {
        throw new Error(`Scale failed with status ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ Failed to scale worker ${worker.name}:`, error.message);
      return { success: false, error: error.message };
    }
  }
}