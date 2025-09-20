/**
 * Load Balancer Service
 * Handles request routing and load distribution across workers
 */

export class LoadBalancer {
  constructor(env) {
    this.env = env;
    this.strategies = {
      'round-robin': new RoundRobinStrategy(),
      'least-connections': new LeastConnectionsStrategy(),
      'weighted': new WeightedStrategy(),
      'health-aware': new HealthAwareStrategy()
    };
    this.currentStrategy = 'health-aware';
    this.requestCounts = new Map();
    this.responseTimeHistory = new Map();
    this.circuitBreakers = new Map();
  }

  async routeRequest(targetWorkerType, request) {
    const startTime = Date.now();
    
    try {
      // Get available workers for the target type
      const workers = await this.getAvailableWorkers(targetWorkerType);
      
      if (workers.length === 0) {
        throw new Error(`No healthy workers available for type: ${targetWorkerType}`);
      }

      // Select worker using current strategy
      const selectedWorker = await this.selectWorker(workers, request);
      
      // Check circuit breaker
      if (this.isCircuitBreakerOpen(selectedWorker.id)) {
        throw new Error(`Circuit breaker open for worker: ${selectedWorker.id}`);
      }

      // Route the request
      const response = await this.forwardRequest(selectedWorker, request);
      
      // Record success metrics
      await this.recordSuccess(selectedWorker.id, Date.now() - startTime);
      
      return response;
    } catch (error) {
      // Record failure metrics
      await this.recordFailure(targetWorkerType, error.message);
      
      // Try failover if available
      return await this.handleFailover(targetWorkerType, request, error);
    }
  }

  async getAvailableWorkers(workerType) {
    // This would typically integrate with WorkerRegistry
    // For now, we'll simulate based on environment variables
    const workerConfigs = {
      'main-bot': [
        { 
          id: 'main-bot-1', 
          url: this.env.MAIN_BOT_WORKER_URL || 'https://doglc-main-bot-production.chaiya88.workers.dev',
          weight: 100,
          currentConnections: this.requestCounts.get('main-bot-1') || 0
        }
      ],
      'api': [
        { 
          id: 'api-1', 
          url: this.env.API_WORKER_URL || 'https://doglc-api-production.chaiya88.workers.dev',
          weight: 80,
          currentConnections: this.requestCounts.get('api-1') || 0
        },
        { 
          id: 'api-2', 
          url: this.env.API_WORKER_URL_2 || 'https://doglc-api-2-production.chaiya88.workers.dev',
          weight: 80,
          currentConnections: this.requestCounts.get('api-2') || 0
        }
      ],
      'banking': [
        { 
          id: 'banking-1', 
          url: this.env.BANKING_WORKER_URL || 'https://doglc-banking-production.chaiya88.workers.dev',
          weight: 100,
          currentConnections: this.requestCounts.get('banking-1') || 0
        },
        { 
          id: 'banking-2', 
          url: this.env.BANKING_WORKER_URL_2 || 'https://doglc-banking-2-production.chaiya88.workers.dev',
          weight: 90,
          currentConnections: this.requestCounts.get('banking-2') || 0
        }
      ],
      'security': [
        { 
          id: 'security-1', 
          url: this.env.SECURITY_WORKER_URL || 'https://doglc-security-production.chaiya88.workers.dev',
          weight: 100,
          currentConnections: this.requestCounts.get('security-1') || 0
        }
      ],
      'frontend': [
        { 
          id: 'frontend-1', 
          url: this.env.FRONTEND_WORKER_URL || 'https://doglc-frontend-production.chaiya88.workers.dev',
          weight: 100,
          currentConnections: this.requestCounts.get('frontend-1') || 0
        }
      ],
      'analytics': [
        { 
          id: 'analytics-1', 
          url: this.env.ANALYTICS_WORKER_URL || 'https://doglc-analytics-production.chaiya88.workers.dev',
          weight: 100,
          currentConnections: this.requestCounts.get('analytics-1') || 0
        }
      ]
    };

    const workers = workerConfigs[workerType] || [];
    
    // Filter out workers with open circuit breakers
    return workers.filter(worker => !this.isCircuitBreakerOpen(worker.id));
  }

  async selectWorker(workers, request) {
    const strategy = this.strategies[this.currentStrategy];
    return await strategy.selectWorker(workers, request);
  }

  async forwardRequest(worker, request) {
    const workerId = worker.id;
    
    // Increment connection count
    this.incrementConnections(workerId);
    
    try {
      const requestOptions = {
        method: request.method || 'GET',
        headers: {
          ...request.headers,
          'X-Forwarded-By': 'DOGLC-Orchestrator',
          'X-Worker-ID': workerId,
          'X-Request-ID': this.generateRequestId()
        }
      };

      if (request.body && request.method !== 'GET') {
        requestOptions.body = request.body;
      }

      const response = await fetch(worker.url + request.path, requestOptions);
      
      // Handle different response types
      const responseBody = await this.processResponse(response);
      
      return {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseBody
      };
    } finally {
      // Decrement connection count
      this.decrementConnections(workerId);
    }
  }

  async processResponse(response) {
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      try {
        return await response.json();
      } catch {
        return await response.text();
      }
    } else if (contentType.includes('text/')) {
      return await response.text();
    } else {
      return await response.arrayBuffer();
    }
  }

  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  incrementConnections(workerId) {
    const current = this.requestCounts.get(workerId) || 0;
    this.requestCounts.set(workerId, current + 1);
  }

  decrementConnections(workerId) {
    const current = this.requestCounts.get(workerId) || 0;
    this.requestCounts.set(workerId, Math.max(0, current - 1));
  }

  async recordSuccess(workerId, responseTime) {
    // Record response time
    const history = this.responseTimeHistory.get(workerId) || [];
    history.push({ time: Date.now(), responseTime });
    
    // Keep only last 100 records
    if (history.length > 100) {
      history.shift();
    }
    
    this.responseTimeHistory.set(workerId, history);

    // Reset circuit breaker on success
    this.resetCircuitBreaker(workerId);
  }

  async recordFailure(workerType, error) {
    console.error(`🚨 Load balancer failure for ${workerType}: ${error}`);
    
    // Increment failure count for circuit breaker
    // This would integrate with circuit breaker logic
  }

  isCircuitBreakerOpen(workerId) {
    const breaker = this.circuitBreakers.get(workerId);
    if (!breaker) return false;
    
    return breaker.state === 'open' && Date.now() < breaker.nextRetry;
  }

  openCircuitBreaker(workerId, duration = 60000) {
    this.circuitBreakers.set(workerId, {
      state: 'open',
      nextRetry: Date.now() + duration,
      failureCount: (this.circuitBreakers.get(workerId)?.failureCount || 0) + 1
    });
    
    console.warn(`⚡ Circuit breaker opened for worker: ${workerId}`);
  }

  resetCircuitBreaker(workerId) {
    const breaker = this.circuitBreakers.get(workerId);
    if (breaker) {
      breaker.state = 'closed';
      breaker.failureCount = 0;
      this.circuitBreakers.set(workerId, breaker);
    }
  }

  async handleFailover(workerType, request, originalError) {
    // Try to find alternative workers
    const allWorkers = await this.getAvailableWorkers(workerType);
    
    if (allWorkers.length === 0) {
      throw new Error(`Failover failed: No workers available for ${workerType}. Original error: ${originalError.message}`);
    }

    // Try with a different worker
    try {
      const fallbackWorker = allWorkers[Math.floor(Math.random() * allWorkers.length)];
      console.warn(`🔄 Attempting failover to worker: ${fallbackWorker.id}`);
      
      return await this.forwardRequest(fallbackWorker, request);
    } catch (failoverError) {
      throw new Error(`Failover failed: ${failoverError.message}. Original error: ${originalError.message}`);
    }
  }

  setStrategy(strategyName) {
    if (this.strategies[strategyName]) {
      this.currentStrategy = strategyName;
      console.log(`🎯 Load balancing strategy changed to: ${strategyName}`);
    } else {
      throw new Error(`Unknown load balancing strategy: ${strategyName}`);
    }
  }

  async getBalancerStatus() {
    const workerStats = {};
    
    for (const [workerId, count] of this.requestCounts.entries()) {
      const responseHistory = this.responseTimeHistory.get(workerId) || [];
      const avgResponseTime = responseHistory.length > 0 
        ? responseHistory.reduce((sum, r) => sum + r.responseTime, 0) / responseHistory.length 
        : 0;
      
      const circuitBreaker = this.circuitBreakers.get(workerId);
      
      workerStats[workerId] = {
        currentConnections: count,
        avgResponseTime: Math.round(avgResponseTime),
        totalRequests: responseHistory.length,
        circuitBreakerState: circuitBreaker?.state || 'closed',
        lastActivity: responseHistory.length > 0 
          ? new Date(responseHistory[responseHistory.length - 1].time).toISOString() 
          : null
      };
    }

    return {
      currentStrategy: this.currentStrategy,
      availableStrategies: Object.keys(this.strategies),
      workerStats,
      totalActiveConnections: Array.from(this.requestCounts.values()).reduce((sum, count) => sum + count, 0),
      circuitBreakers: Array.from(this.circuitBreakers.entries()).map(([id, breaker]) => ({
        workerId: id,
        state: breaker.state,
        failureCount: breaker.failureCount,
        nextRetry: breaker.nextRetry ? new Date(breaker.nextRetry).toISOString() : null
      }))
    };
  }

  getStatus() {
    return {
      currentStrategy: this.currentStrategy,
      totalActiveConnections: Array.from(this.requestCounts.values()).reduce((sum, count) => sum + count, 0),
      circuitBreakersOpen: Array.from(this.circuitBreakers.values()).filter(b => b.state === 'open').length,
      lastActivity: new Date().toISOString()
    };
  }
}

// Load balancing strategies
class RoundRobinStrategy {
  constructor() {
    this.currentIndex = 0;
  }

  async selectWorker(workers) {
    if (workers.length === 0) return null;
    
    const worker = workers[this.currentIndex % workers.length];
    this.currentIndex = (this.currentIndex + 1) % workers.length;
    
    return worker;
  }
}

class LeastConnectionsStrategy {
  async selectWorker(workers) {
    if (workers.length === 0) return null;
    
    return workers.reduce((min, worker) => 
      worker.currentConnections < min.currentConnections ? worker : min
    );
  }
}

class WeightedStrategy {
  async selectWorker(workers) {
    if (workers.length === 0) return null;
    
    const totalWeight = workers.reduce((sum, worker) => sum + (worker.weight || 100), 0);
    let random = Math.random() * totalWeight;
    
    for (const worker of workers) {
      random -= (worker.weight || 100);
      if (random <= 0) {
        return worker;
      }
    }
    
    return workers[0]; // Fallback
  }
}

class HealthAwareStrategy {
  async selectWorker(workers) {
    if (workers.length === 0) return null;
    
    // Prefer workers with lower connection count and higher weight
    const scored = workers.map(worker => ({
      ...worker,
      score: (worker.weight || 100) / Math.max(1, worker.currentConnections)
    }));
    
    scored.sort((a, b) => b.score - a.score);
    
    return scored[0];
  }
}