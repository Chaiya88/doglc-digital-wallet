/**
 * Service Discovery Service
 * Handles automatic discovery and registration of services
 */

export class ServiceDiscovery {
  constructor(env) {
    this.env = env;
    this.services = new Map();
    this.subscriptions = new Map();
    this.discoveryInterval = 30000; // 30 seconds
    this.startDiscovery();
  }

  async startDiscovery() {
    console.log('🔍 Starting service discovery...');
    
    // Initial discovery
    await this.discoverServices();
    
    // Periodic discovery
    setInterval(async () => {
      await this.discoverServices();
    }, this.discoveryInterval);
  }

  async discoverServices() {
    try {
      // Discover workers from known endpoints
      const workerEndpoints = [
        { id: 'main-bot', url: this.env.MAIN_BOT_WORKER_URL, type: 'telegram-bot' },
        { id: 'api', url: this.env.API_WORKER_URL, type: 'rest-api' },
        { id: 'banking', url: this.env.BANKING_WORKER_URL, type: 'financial-operations' },
        { id: 'security', url: this.env.SECURITY_WORKER_URL, type: 'security-operations' },
        { id: 'frontend', url: this.env.FRONTEND_WORKER_URL, type: 'web-application' },
        { id: 'analytics', url: this.env.ANALYTICS_WORKER_URL, type: 'data-analytics' }
      ];

      for (const endpoint of workerEndpoints) {
        if (endpoint.url) {
          await this.discoverWorkerServices(endpoint);
        }
      }

      // Discover external services
      await this.discoverExternalServices();
      
      console.log(`🔍 Discovery completed. Found ${this.services.size} services`);
    } catch (error) {
      console.error('❌ Service discovery error:', error.message);
    }
  }

  async discoverWorkerServices(endpoint) {
    try {
      const response = await fetch(`${endpoint.url}/discovery/services`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.env.ORCHESTRATOR_API_KEY}`,
          'User-Agent': 'DOGLC-Orchestrator/1.0'
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });

      if (response.ok) {
        const data = await response.json();
        
        // Register the worker itself
        await this.registerService({
          id: endpoint.id,
          name: data.name || endpoint.id,
          type: endpoint.type,
          url: endpoint.url,
          version: data.version || '1.0.0',
          status: 'available',
          capabilities: data.capabilities || [],
          endpoints: data.endpoints || {},
          metadata: {
            lastDiscovered: new Date().toISOString(),
            responseTime: Date.now() - startTime,
            ...data.metadata
          }
        });

        // Register sub-services if any
        if (data.services && Array.isArray(data.services)) {
          for (const service of data.services) {
            await this.registerService({
              ...service,
              parentWorker: endpoint.id,
              parentUrl: endpoint.url
            });
          }
        }
      }
    } catch (error) {
      // Mark service as unavailable
      await this.markServiceUnavailable(endpoint.id, error.message);
    }
  }

  async discoverExternalServices() {
    // Discover external services like databases, APIs, etc.
    const externalServices = [
      {
        id: 'cloudflare-d1',
        name: 'Cloudflare D1 Database',
        type: 'database',
        checkUrl: 'https://api.cloudflare.com/client/v4/user',
        headers: { 'Authorization': `Bearer ${this.env.CLOUDFLARE_API_TOKEN}` }
      },
      {
        id: 'telegram-api',
        name: 'Telegram Bot API',
        type: 'external-api',
        checkUrl: `https://api.telegram.org/bot${this.env.TELEGRAM_BOT_TOKEN}/getMe`
      },
      {
        id: 'google-vision',
        name: 'Google Vision API',
        type: 'external-api',
        checkUrl: 'https://vision.googleapis.com/v1/images:annotate',
        headers: { 'Authorization': `Bearer ${this.env.GOOGLE_VISION_API_KEY}` }
      }
    ];

    for (const service of externalServices) {
      await this.checkExternalService(service);
    }
  }

  async checkExternalService(serviceConfig) {
    try {
      if (!serviceConfig.checkUrl) {
        return;
      }

      const startTime = Date.now();
      const response = await fetch(serviceConfig.checkUrl, {
        method: 'GET',
        headers: serviceConfig.headers || {},
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      const responseTime = Date.now() - startTime;
      const status = response.ok ? 'available' : 'degraded';

      await this.registerService({
        id: serviceConfig.id,
        name: serviceConfig.name,
        type: serviceConfig.type,
        url: serviceConfig.checkUrl,
        status,
        metadata: {
          lastChecked: new Date().toISOString(),
          responseTime,
          httpStatus: response.status
        }
      });
    } catch (error) {
      await this.markServiceUnavailable(serviceConfig.id, error.message);
    }
  }

  async registerService(service) {
    const existingService = this.services.get(service.id);
    
    const updatedService = {
      ...service,
      discoveredAt: existingService?.discoveredAt || new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      uptime: existingService ? this.calculateUptime(existingService) : 0
    };

    this.services.set(service.id, updatedService);

    // Persist to KV
    if (this.env.ORCHESTRATOR_KV) {
      await this.env.ORCHESTRATOR_KV.put(
        `service:${service.id}`,
        JSON.stringify(updatedService),
        { expirationTtl: 300 } // 5 minutes
      );
    }

    // Notify subscribers
    await this.notifySubscribers('service-registered', updatedService);

    return updatedService;
  }

  async markServiceUnavailable(serviceId, reason) {
    const service = this.services.get(serviceId);
    if (service) {
      service.status = 'unavailable';
      service.lastError = reason;
      service.lastSeen = new Date().toISOString();
      
      this.services.set(serviceId, service);
      
      // Notify subscribers
      await this.notifySubscribers('service-unavailable', service);
    }
  }

  calculateUptime(service) {
    if (!service.discoveredAt) return 0;
    
    const now = Date.now();
    const discovered = new Date(service.discoveredAt).getTime();
    return Math.round((now - discovered) / 1000); // uptime in seconds
  }

  async getAvailableServices() {
    const services = Array.from(this.services.values());
    return services.filter(service => service.status === 'available');
  }

  async getAllServices() {
    return Array.from(this.services.values());
  }

  async getService(serviceId) {
    return this.services.get(serviceId);
  }

  async getServicesByType(type) {
    const services = Array.from(this.services.values());
    return services.filter(service => service.type === type);
  }

  async getWorkersByType(workerType) {
    const services = Array.from(this.services.values());
    return services.filter(service => 
      service.type === workerType && 
      service.status === 'available' &&
      !service.parentWorker // Only return main workers, not sub-services
    );
  }

  async findServiceByCapability(capability) {
    const services = Array.from(this.services.values());
    return services.filter(service => 
      service.capabilities && 
      service.capabilities.includes(capability) &&
      service.status === 'available'
    );
  }

  async subscribeToChanges(subscriberId, callback) {
    this.subscriptions.set(subscriberId, callback);
    console.log(`📡 Subscriber ${subscriberId} registered for service changes`);
  }

  async unsubscribeFromChanges(subscriberId) {
    this.subscriptions.delete(subscriberId);
    console.log(`📡 Subscriber ${subscriberId} unregistered`);
  }

  async notifySubscribers(event, service) {
    for (const [subscriberId, callback] of this.subscriptions.entries()) {
      try {
        await callback(event, service);
      } catch (error) {
        console.error(`❌ Failed to notify subscriber ${subscriberId}:`, error.message);
      }
    }
  }

  async getServiceHealth() {
    const services = Array.from(this.services.values());
    const totalServices = services.length;
    const availableServices = services.filter(s => s.status === 'available').length;
    const degradedServices = services.filter(s => s.status === 'degraded').length;
    const unavailableServices = services.filter(s => s.status === 'unavailable').length;

    return {
      total: totalServices,
      available: availableServices,
      degraded: degradedServices,
      unavailable: unavailableServices,
      healthPercentage: totalServices > 0 ? Math.round((availableServices / totalServices) * 100) : 0,
      lastDiscovery: new Date().toISOString()
    };
  }

  async getServiceMetrics() {
    const services = Array.from(this.services.values());
    
    const metrics = {
      byType: {},
      byStatus: {},
      avgResponseTime: 0,
      totalUptime: 0
    };

    // Group by type
    for (const service of services) {
      metrics.byType[service.type] = (metrics.byType[service.type] || 0) + 1;
      metrics.byStatus[service.status] = (metrics.byStatus[service.status] || 0) + 1;
    }

    // Calculate average response time
    const servicesWithResponseTime = services.filter(s => s.metadata?.responseTime);
    if (servicesWithResponseTime.length > 0) {
      metrics.avgResponseTime = Math.round(
        servicesWithResponseTime.reduce((sum, s) => sum + s.metadata.responseTime, 0) / 
        servicesWithResponseTime.length
      );
    }

    // Calculate total uptime
    metrics.totalUptime = services.reduce((sum, s) => sum + (s.uptime || 0), 0);

    return metrics;
  }

  getStatus() {
    const services = Array.from(this.services.values());
    return {
      totalServices: services.length,
      availableServices: services.filter(s => s.status === 'available').length,
      degradedServices: services.filter(s => s.status === 'degraded').length,
      unavailableServices: services.filter(s => s.status === 'unavailable').length,
      lastDiscovery: new Date().toISOString(),
      discoveryInterval: this.discoveryInterval,
      subscribers: this.subscriptions.size
    };
  }

  async performServiceMaintenance() {
    // Clean up old services
    const now = Date.now();
    const services = Array.from(this.services.entries());
    
    for (const [serviceId, service] of services) {
      const lastSeen = new Date(service.lastSeen).getTime();
      const timeSinceLastSeen = now - lastSeen;
      
      // Remove services not seen for more than 10 minutes
      if (timeSinceLastSeen > 600000) {
        this.services.delete(serviceId);
        console.log(`🧹 Removed stale service: ${service.name} (${serviceId})`);
        
        // Remove from KV
        if (this.env.ORCHESTRATOR_KV) {
          await this.env.ORCHESTRATOR_KV.delete(`service:${serviceId}`);
        }
      }
    }
  }
}