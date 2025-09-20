/**
 * DOGLC Digital Wallet Orchestrator
 * Central coordination system for managing all workers
 * 
 * Features:
 * - Service Discovery & Registration
 * - Load Balancing & Request Routing
 * - Health Monitoring & Auto-recovery
 * - Worker Lifecycle Management
 * - Real-time Monitoring Dashboard
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';

import { WorkerRegistry } from './services/WorkerRegistry.js';
import { LoadBalancer } from './services/LoadBalancer.js';
import { HealthMonitor } from './services/HealthMonitor.js';
import { ServiceDiscovery } from './services/ServiceDiscovery.js';
import { MetricsCollector } from './services/MetricsCollector.js';
import { alertMiddleware } from './middleware/alertMiddleware.js';
import { authMiddleware } from './middleware/authMiddleware.js';
import { rateLimitMiddleware } from './middleware/rateLimitMiddleware.js';

class DigitalWalletOrchestrator {
  constructor(env) {
    this.env = env;
    this.app = new Hono();
    this.workerRegistry = new WorkerRegistry(env);
    this.loadBalancer = new LoadBalancer(env);
    this.healthMonitor = new HealthMonitor(env);
    this.serviceDiscovery = new ServiceDiscovery(env);
    this.metricsCollector = new MetricsCollector(env);
    
    this.setupMiddleware();
    this.setupRoutes();
    this.startHealthMonitoring();
  }

  setupMiddleware() {
    // CORS configuration
    this.app.use('*', cors({
      origin: ['https://doglc.digital', 'https://admin.doglc.digital'],
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization', 'X-Worker-Target']
    }));

    // Logging and formatting
    this.app.use('*', logger());
    this.app.use('*', prettyJSON());

    // Security and rate limiting
    this.app.use('/admin/*', authMiddleware);
    this.app.use('*', rateLimitMiddleware);
    this.app.use('*', alertMiddleware);
  }

  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', async (c) => {
      const allWorkersHealth = await this.healthMonitor.getAllWorkersHealth();
      
      return c.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        orchestrator: {
          version: '1.0.0',
          uptime: process.uptime(),
          memory: process.memoryUsage()
        },
        workers: allWorkersHealth,
        services: {
          registry: this.workerRegistry.getStatus(),
          loadBalancer: this.loadBalancer.getStatus(),
          serviceDiscovery: this.serviceDiscovery.getStatus()
        }
      });
    });

    // Worker management endpoints
    this.app.get('/admin/workers', async (c) => {
      const workers = await this.workerRegistry.getAllWorkers();
      return c.json({ workers });
    });

    this.app.post('/admin/workers/:workerId/restart', async (c) => {
      const workerId = c.req.param('workerId');
      const result = await this.workerRegistry.restartWorker(workerId);
      return c.json(result);
    });

    this.app.post('/admin/workers/:workerId/stop', async (c) => {
      const workerId = c.req.param('workerId');
      const result = await this.workerRegistry.stopWorker(workerId);
      return c.json(result);
    });

    this.app.post('/admin/workers/:workerId/start', async (c) => {
      const workerId = c.req.param('workerId');
      const result = await this.workerRegistry.startWorker(workerId);
      return c.json(result);
    });

    // Service discovery endpoints
    this.app.get('/discovery/services', async (c) => {
      const services = await this.serviceDiscovery.getAvailableServices();
      return c.json({ services });
    });

    this.app.get('/discovery/workers/:type', async (c) => {
      const workerType = c.req.param('type');
      const workers = await this.serviceDiscovery.getWorkersByType(workerType);
      return c.json({ workers });
    });

    // Load balancer endpoints
    this.app.get('/balancer/status', async (c) => {
      const status = await this.loadBalancer.getBalancerStatus();
      return c.json(status);
    });

    // Metrics and monitoring
    this.app.get('/metrics', async (c) => {
      const metrics = await this.metricsCollector.getAllMetrics();
      return c.json(metrics);
    });

    this.app.get('/metrics/:workerId', async (c) => {
      const workerId = c.req.param('workerId');
      const metrics = await this.metricsCollector.getWorkerMetrics(workerId);
      return c.json(metrics);
    });

    // Request routing - Main orchestration logic
    this.app.all('/api/*', async (c) => {
      const path = c.req.path;
      const method = c.req.method;
      const headers = c.req.header();
      
      // Determine target worker based on request
      const targetWorker = this.determineTargetWorker(path, method, headers);
      
      if (!targetWorker) {
        return c.json({ error: 'No suitable worker found for this request' }, 503);
      }

      // Route request through load balancer
      const response = await this.loadBalancer.routeRequest(targetWorker, {
        path,
        method,
        headers,
        body: await c.req.text()
      });

      return new Response(response.body, {
        status: response.status,
        headers: response.headers
      });
    });

    // Telegram webhook routing
    this.app.post('/webhook/telegram', async (c) => {
      const body = await c.req.json();
      
      // Always route to main-bot worker
      const response = await this.loadBalancer.routeRequest('main-bot', {
        path: '/webhook/telegram',
        method: 'POST',
        headers: c.req.header(),
        body: JSON.stringify(body)
      });

      return new Response(response.body, {
        status: response.status,
        headers: response.headers
      });
    });

    // Gmail webhook routing
    this.app.post('/webhook/gmail', async (c) => {
      const body = await c.req.text();
      
      // Route to security worker for Gmail processing
      const response = await this.loadBalancer.routeRequest('security', {
        path: '/webhook/gmail',
        method: 'POST',
        headers: c.req.header(),
        body
      });

      return new Response(response.body, {
        status: response.status,
        headers: response.headers
      });
    });

    // Admin dashboard
    this.app.get('/admin', async (c) => {
      const dashboardHTML = await this.generateDashboard();
      return c.html(dashboardHTML);
    });

    // Default route
    this.app.get('/', async (c) => {
      return c.json({
        name: 'DOGLC Digital Wallet Orchestrator',
        version: '1.0.0',
        description: 'Central coordination system for multi-worker architecture',
        endpoints: {
          health: '/health',
          admin: '/admin',
          metrics: '/metrics',
          discovery: '/discovery/services',
          api: '/api/*',
          webhooks: {
            telegram: '/webhook/telegram',
            gmail: '/webhook/gmail'
          }
        },
        workers: await this.workerRegistry.getWorkerSummary()
      });
    });
  }

  determineTargetWorker(path, method, headers) {
    // API routing logic
    if (path.startsWith('/api/auth') || path.startsWith('/api/user')) {
      return 'api';
    }
    
    if (path.startsWith('/api/wallet') || path.startsWith('/api/banking')) {
      return 'banking';
    }
    
    if (path.startsWith('/api/security') || path.startsWith('/api/ocr')) {
      return 'security';
    }
    
    if (path.startsWith('/api/analytics') || path.startsWith('/api/metrics')) {
      return 'analytics';
    }
    
    // Check for explicit worker target header
    const targetHeader = headers['x-worker-target'];
    if (targetHeader && this.workerRegistry.isValidWorker(targetHeader)) {
      return targetHeader;
    }
    
    // Default to API worker for generic API requests
    if (path.startsWith('/api/')) {
      return 'api';
    }
    
    return null;
  }

  async startHealthMonitoring() {
    // Start continuous health monitoring
    setInterval(async () => {
      await this.healthMonitor.checkAllWorkers();
      await this.metricsCollector.collectMetrics();
    }, 30000); // Check every 30 seconds

    // Worker auto-recovery
    setInterval(async () => {
      await this.healthMonitor.performAutoRecovery();
    }, 60000); // Auto-recovery check every minute
  }

  async generateDashboard() {
    const workers = await this.workerRegistry.getAllWorkers();
    const metrics = await this.metricsCollector.getAllMetrics();
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>DOGLC Orchestrator Dashboard</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
            .container { max-width: 1200px; margin: 0 auto; }
            .header { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
            .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .status-healthy { color: #22c55e; }
            .status-warning { color: #f59e0b; }
            .status-error { color: #ef4444; }
            .worker-status { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
            .status-indicator { width: 12px; height: 12px; border-radius: 50%; }
            .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-top: 15px; }
            .metric { text-align: center; padding: 10px; background: #f8fafc; border-radius: 4px; }
            .metric-value { font-size: 24px; font-weight: bold; color: #1f2937; }
            .metric-label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏗️ DOGLC Digital Wallet Orchestrator</h1>
                <p>Central coordination system managing ${workers.length} workers</p>
            </div>
            
            <div class="grid">
                <div class="card">
                    <h3>🤖 Worker Status</h3>
                    ${workers.map(worker => `
                        <div class="worker-status">
                            <div class="status-indicator" style="background-color: ${worker.status === 'healthy' ? '#22c55e' : worker.status === 'warning' ? '#f59e0b' : '#ef4444'}"></div>
                            <strong>${worker.name}</strong>
                            <span class="status-${worker.status}">${worker.status}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="card">
                    <h3>📊 System Metrics</h3>
                    <div class="metrics-grid">
                        <div class="metric">
                            <div class="metric-value">${metrics.totalRequests || 0}</div>
                            <div class="metric-label">Total Requests</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value">${metrics.avgResponseTime || 0}ms</div>
                            <div class="metric-label">Avg Response</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value">${metrics.errorRate || 0}%</div>
                            <div class="metric-label">Error Rate</div>
                        </div>
                        <div class="metric">
                            <div class="metric-value">${workers.filter(w => w.status === 'healthy').length}/${workers.length}</div>
                            <div class="metric-label">Healthy Workers</div>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <h3>🔄 Load Balancing</h3>
                    <canvas id="loadChart" width="400" height="200"></canvas>
                </div>
                
                <div class="card">
                    <h3>⚡ Performance</h3>
                    <canvas id="performanceChart" width="400" height="200"></canvas>
                </div>
            </div>
        </div>
        
        <script>
            // Load distribution chart
            const loadCtx = document.getElementById('loadChart').getContext('2d');
            new Chart(loadCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Main Bot', 'API', 'Banking', 'Security', 'Frontend', 'Analytics'],
                    datasets: [{
                        data: [25, 20, 30, 15, 5, 5],
                        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
                    }]
                },
                options: { responsive: true }
            });
            
            // Performance chart
            const perfCtx = document.getElementById('performanceChart').getContext('2d');
            new Chart(perfCtx, {
                type: 'line',
                data: {
                    labels: ['1h ago', '45m', '30m', '15m', 'Now'],
                    datasets: [{
                        label: 'Response Time (ms)',
                        data: [120, 110, 95, 105, 98],
                        borderColor: '#3b82f6',
                        tension: 0.1
                    }]
                },
                options: { responsive: true }
            });
            
            // Auto-refresh every 30 seconds
            setTimeout(() => location.reload(), 30000);
        </script>
    </body>
    </html>
    `;
  }
}

export default {
  async fetch(request, env, ctx) {
    const orchestrator = new DigitalWalletOrchestrator(env);
    return orchestrator.app.fetch(request, env, ctx);
  }
};