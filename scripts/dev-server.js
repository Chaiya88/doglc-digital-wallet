#!/usr/bin/env node

/**
 * Development Server for DOGLC Digital Wallet
 * ทำงานแบบ standalone โดยไม่ต้อง Cloudflare
 */

import fs from 'fs';
import path from 'path';
import http from 'http';
import url from 'url';

const COLORS = {
  GREEN: '\x1b[32m',
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  MAGENTA: '\x1b[35m',
  CYAN: '\x1b[36m',
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m'
};

class DevelopmentServer {
  constructor() {
    this.port = process.env.PORT || 3000;
    this.projectRoot = process.cwd();
    this.mockKV = new Map(); // Mock KV storage
    this.mockDB = new Map(); // Mock D1 database
    this.requests = []; // Request log
  }

  log(message, color = COLORS.RESET) {
    const timestamp = new Date().toISOString();
    console.log(`${color}[${timestamp}] ${message}${COLORS.RESET}`);
  }

  success(message) {
    this.log(`✅ ${message}`, COLORS.GREEN);
  }

  error(message) {
    this.log(`❌ ${message}`, COLORS.RED);
  }

  warning(message) {
    this.log(`⚠️  ${message}`, COLORS.YELLOW);
  }

  info(message) {
    this.log(`ℹ️  ${message}`, COLORS.BLUE);
  }

  // Mock Cloudflare environment
  createMockEnv() {
    return {
      // Mock KV namespaces
      CONFIG_KV: {
        get: async (key) => this.mockKV.get(`config:${key}`),
        put: async (key, value) => this.mockKV.set(`config:${key}`, value),
        delete: async (key) => this.mockKV.delete(`config:${key}`)
      },
      USER_SESSIONS: {
        get: async (key) => this.mockKV.get(`sessions:${key}`),
        put: async (key, value, options = {}) => {
          this.mockKV.set(`sessions:${key}`, value);
          if (options.expirationTtl) {
            setTimeout(() => {
              this.mockKV.delete(`sessions:${key}`);
            }, options.expirationTtl * 1000);
          }
        },
        delete: async (key) => this.mockKV.delete(`sessions:${key}`)
      },
      RATE_KV: {
        get: async (key) => this.mockKV.get(`rate:${key}`),
        put: async (key, value, options = {}) => {
          this.mockKV.set(`rate:${key}`, value);
          if (options.expirationTtl) {
            setTimeout(() => {
              this.mockKV.delete(`rate:${key}`);
            }, options.expirationTtl * 1000);
          }
        }
      },
      // Mock environment variables
      TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || 'mock-bot-token',
      ENVIRONMENT: 'development',
      DEBUG_MODE: 'true'
    };
  }

  // Create mock context
  createMockContext() {
    return {
      waitUntil: (promise) => promise,
      passThroughOnException: () => {}
    };
  }

  // Health check endpoint
  async handleHealthCheck(req, res) {
    const health = {
      status: 'healthy',
      service: 'doglc-development-server',
      timestamp: new Date().toISOString(),
      version: '1.0.0-dev',
      environment: 'development',
      features: {
        multiLanguage: true,
        mockKV: true,
        mockDB: true,
        rateLimiting: true,
        banking: true,
        security: true
      },
      stats: {
        totalRequests: this.requests.length,
        kvEntries: this.mockKV.size,
        uptime: process.uptime()
      }
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(health, null, 2));
    
    this.success(`Health check requested - Status: ${health.status}`);
  }

  // API dashboard
  async handleDashboard(req, res) {
    const dashboardHTML = `
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DOGLC Digital Wallet - Development Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: #2196F3; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .card { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .status { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .status.healthy { background: #4CAF50; color: white; }
        .status.development { background: #FF9800; color: white; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .metric { text-align: center; padding: 15px; background: #f8f9fa; border-radius: 4px; }
        .metric-value { font-size: 24px; font-weight: bold; color: #2196F3; }
        .metric-label { font-size: 14px; color: #666; margin-top: 5px; }
        pre { background: #f8f9fa; padding: 15px; border-radius: 4px; overflow-x: auto; }
        .btn { display: inline-block; padding: 10px 20px; background: #2196F3; color: white; text-decoration: none; border-radius: 4px; margin: 5px; }
        .btn:hover { background: #1976D2; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🐕 DOGLC Digital Wallet</h1>
            <p>Development Dashboard</p>
            <span class="status healthy">RUNNING</span>
            <span class="status development">DEVELOPMENT MODE</span>
        </div>
        
        <div class="grid">
            <div class="card">
                <h3>📊 System Metrics</h3>
                <div class="metric">
                    <div class="metric-value">${this.requests.length}</div>
                    <div class="metric-label">Total Requests</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${this.mockKV.size}</div>
                    <div class="metric-label">KV Entries</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${Math.floor(process.uptime())}s</div>
                    <div class="metric-label">Uptime</div>
                </div>
            </div>
            
            <div class="card">
                <h3>🔗 API Endpoints</h3>
                <a href="/health" class="btn">Health Check</a>
                <a href="/api/wallet/balance" class="btn">Wallet Balance</a>
                <a href="/api/market/data" class="btn">Market Data</a>
                <a href="/api/user/profile" class="btn">User Profile</a>
            </div>
        </div>
        
        <div class="card">
            <h3>📝 Recent Requests</h3>
            <pre id="requests">${JSON.stringify(this.requests.slice(-10), null, 2)}</pre>
        </div>
        
        <div class="card">
            <h3>🗂️ Mock KV Storage</h3>
            <pre id="kv-data">${JSON.stringify([...this.mockKV.entries()].slice(-10), null, 2)}</pre>
        </div>
        
        <div class="card">
            <h3>📚 Development Guide</h3>
            <p><strong>วิธีการทดสอบ:</strong></p>
            <ol>
                <li>ใช้ Postman หรือ curl เพื่อทดสอบ API endpoints</li>
                <li>ตรวจสอบ logs ใน terminal</li>
                <li>ดู real-time data ใน dashboard นี้</li>
            </ol>
            
            <p><strong>Environment Variables:</strong></p>
            <pre>TELEGRAM_BOT_TOKEN=${process.env.TELEGRAM_BOT_TOKEN || 'not-set'}
ENVIRONMENT=development
DEBUG_MODE=true</pre>
        </div>
    </div>
    
    <script>
        // Auto refresh every 5 seconds
        setTimeout(() => location.reload(), 5000);
    </script>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(dashboardHTML);
    
    this.success('Dashboard accessed');
  }

  // Mock API endpoints
  async handleAPIRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    
    // Log request
    this.requests.push({
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      userAgent: req.headers['user-agent'] || 'unknown'
    });
    
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }
    
    try {
      if (pathname === '/api/wallet/balance') {
        const response = {
          success: true,
          data: {
            userId: 'demo-user-123',
            balances: {
              THB: 15000.50,
              USDT: 125.75
            },
            lastUpdated: new Date().toISOString()
          }
        };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response, null, 2));
        this.info('Mock wallet balance returned');
        
      } else if (pathname === '/api/market/data') {
        const response = {
          success: true,
          data: {
            rates: {
              'THB/USDT': 36.45,
              'USDT/THB': 0.0274
            },
            trends: {
              'THB/USDT': '+0.15%',
              volume24h: '1,250,000 THB'
            },
            timestamp: new Date().toISOString()
          }
        };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response, null, 2));
        this.info('Mock market data returned');
        
      } else if (pathname === '/api/user/profile') {
        const response = {
          success: true,
          data: {
            userId: 'demo-user-123',
            username: 'demo_user',
            vipLevel: 'BRONZE',
            language: 'th',
            createdAt: '2025-01-01T00:00:00Z',
            stats: {
              totalTransactions: 15,
              totalVolume: 45000
            }
          }
        };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response, null, 2));
        this.info('Mock user profile returned');
        
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: 'Endpoint not found',
          availableEndpoints: [
            '/health',
            '/dashboard', 
            '/api/wallet/balance',
            '/api/market/data',
            '/api/user/profile'
          ]
        }, null, 2));
      }
    } catch (error) {
      this.error(`API error: ${error.message}`);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: 'Internal server error',
        message: error.message
      }, null, 2));
    }
  }

  // Main request handler
  async handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    
    this.info(`${req.method} ${pathname}`);
    
    if (pathname === '/health') {
      return this.handleHealthCheck(req, res);
    } else if (pathname === '/' || pathname === '/dashboard') {
      return this.handleDashboard(req, res);
    } else if (pathname.startsWith('/api/')) {
      return this.handleAPIRequest(req, res);
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Not Found',
        message: 'Go to /dashboard for development interface'
      }, null, 2));
    }
  }

  // Start server
  async start() {
    this.log(`\n${COLORS.BOLD}${COLORS.CYAN}🚀 DOGLC Digital Wallet - Development Server${COLORS.RESET}`);
    this.log(`${COLORS.CYAN}${'='.repeat(60)}${COLORS.RESET}\n`);
    
    // Initialize mock data
    await this.initializeMockData();
    
    const server = http.createServer((req, res) => {
      this.handleRequest(req, res).catch(error => {
        this.error(`Request error: ${error.message}`);
        res.writeHead(500);
        res.end('Internal Server Error');
      });
    });
    
    server.listen(this.port, () => {
      this.success(`Development server running!`);
      this.info(`Port: ${this.port}`);
      this.info(`Dashboard: http://localhost:${this.port}/dashboard`);
      this.info(`Health Check: http://localhost:${this.port}/health`);
      this.info(`API Base: http://localhost:${this.port}/api/`);
      
      this.log(`\n${COLORS.BOLD}${COLORS.YELLOW}📝 Available Commands:${COLORS.RESET}`);
      this.log(`${COLORS.CYAN}  curl http://localhost:${this.port}/health${COLORS.RESET}`);
      this.log(`${COLORS.CYAN}  curl http://localhost:${this.port}/api/wallet/balance${COLORS.RESET}`);
      this.log(`${COLORS.CYAN}  curl http://localhost:${this.port}/api/market/data${COLORS.RESET}`);
      
      this.log(`\n${COLORS.BOLD}${COLORS.GREEN}Press Ctrl+C to stop the server${COLORS.RESET}\n`);
    });
    
    // Graceful shutdown
    process.on('SIGINT', () => {
      this.warning('Shutting down development server...');
      server.close(() => {
        this.success('Development server stopped');
        process.exit(0);
      });
    });
  }
  
  // Initialize mock data
  async initializeMockData() {
    this.info('Initializing mock data...');
    
    // Mock user sessions
    this.mockKV.set('sessions:demo-user-123', JSON.stringify({
      userId: 'demo-user-123',
      username: 'demo_user',
      language: 'th',
      loginAt: new Date().toISOString()
    }));
    
    // Mock configuration
    this.mockKV.set('config:exchange_rates', JSON.stringify({
      'THB/USDT': 36.45,
      'USDT/THB': 0.0274,
      lastUpdated: new Date().toISOString()
    }));
    
    // Mock user balances
    this.mockKV.set('config:user_balances', JSON.stringify({
      'demo-user-123': {
        THB: 15000.50,
        USDT: 125.75
      }
    }));
    
    this.success(`Mock data initialized - ${this.mockKV.size} entries`);
  }
}

// Main execution
async function main() {
  const server = new DevelopmentServer();
  await server.start();
}

main().catch(console.error);