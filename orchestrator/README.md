# DOGLC Digital Wallet Orchestrator

Central orchestration service for managing and coordinating the DOGLC Digital Wallet microservices architecture. This service provides service discovery, load balancing, health monitoring, metrics collection, and centralized management for all wallet workers.

## 🏗️ Architecture Overview

The orchestrator serves as the central nervous system for the digital wallet platform, coordinating 6 specialized workers:

- **main-bot**: Telegram bot interface
- **api**: REST API services
- **banking**: Financial transaction processing
- **security**: Authentication and fraud detection
- **frontend**: Web interface
- **analytics**: Data processing and insights

## ✨ Features

### Core Services
- **Service Discovery**: Automatic worker registration and discovery
- **Load Balancing**: Multiple strategies (round-robin, least-connections, weighted, health-aware)
- **Health Monitoring**: Continuous health checks with auto-recovery
- **Metrics Collection**: Real-time performance metrics and analytics
- **Worker Registry**: Centralized worker lifecycle management

### Middleware
- **Authentication**: Bearer token auth for admin endpoints
- **Rate Limiting**: Configurable rate limits per endpoint
- **CORS**: Cross-origin resource sharing support
- **Request Logging**: Comprehensive request/response logging
- **Alert System**: Real-time error and performance alerts

### Monitoring Dashboard
- Real-time worker status visualization
- Performance metrics and trends
- Health check results
- Error rate monitoring
- Request throughput analytics

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Cloudflare Workers account
- Wrangler CLI installed

### Installation

1. **Clone and navigate to orchestrator**:
   ```bash
   cd orchestrator
   npm install
   ```

2. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Configure Wrangler**:
   ```bash
   wrangler login
   # Update wrangler.toml with your account details
   ```

4. **Deploy to staging**:
   ```bash
   npm run deploy:staging
   ```

5. **Set secrets**:
   ```bash
   wrangler secret put ORCHESTRATOR_API_KEY --env staging
   wrangler secret put SLACK_WEBHOOK_URL --env staging  # Optional
   ```

## 📖 API Documentation

### Health Endpoints

#### `GET /health`
Returns orchestrator health status
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 3600000
}
```

#### `GET /health/workers`
Returns health status of all workers
```json
{
  "status": "healthy",
  "workers": {
    "main-bot": { "status": "healthy", "responseTime": 125 },
    "api": { "status": "healthy", "responseTime": 98 },
    "banking": { "status": "degraded", "responseTime": 2500 }
  }
}
```

### Metrics Endpoints

#### `GET /metrics`
Returns aggregated metrics from all workers
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "global": {
    "totalRequests": 15420,
    "errorRate": 1.2,
    "avgResponseTime": 245
  },
  "workers": { ... }
}
```

#### `GET /metrics/worker/{workerName}`
Returns detailed metrics for specific worker

### Admin Endpoints (Require Authentication)

#### `POST /admin/workers/{workerName}/restart`
Restart a specific worker

#### `POST /admin/workers/{workerName}/stop`
Stop a specific worker

#### `POST /admin/workers/{workerName}/start`
Start a specific worker

#### `GET /admin/dashboard`
Returns HTML dashboard for monitoring

### Request Routing

#### `/{workerName}/*`
Routes requests to appropriate worker with load balancing

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ORCHESTRATOR_API_KEY` | Yes | Authentication key for admin endpoints |
| `SLACK_WEBHOOK_URL` | No | Slack webhook for alerts |
| `DISCORD_WEBHOOK_URL` | No | Discord webhook for alerts |
| `ENVIRONMENT` | No | Environment identifier (development/staging/production) |
| `ERROR_RATE_THRESHOLD` | No | Error rate threshold for alerts (default: 5%) |
| `RESPONSE_TIME_THRESHOLD` | No | Response time threshold for alerts (default: 5000ms) |

### Load Balancing Strategies

- **round-robin**: Distributes requests evenly across healthy workers
- **least-connections**: Routes to worker with fewest active connections
- **weighted**: Routes based on predefined worker weights
- **health-aware**: Routes to healthiest workers first

### Health Check Configuration

```javascript
const healthConfig = {
  interval: 30000,        // Check every 30 seconds
  timeout: 5000,          // 5 second timeout
  retries: 3,             // 3 retries before marking unhealthy
  alertThreshold: 2       // Alert after 2 consecutive failures
};
```

## 📊 Monitoring

### Dashboard Access
Visit `/admin/dashboard` with proper authentication to access the real-time monitoring dashboard.

### Metrics Available
- Request throughput per worker
- Response time percentiles
- Error rates and types
- Worker health status
- Resource utilization
- Alert history

### Alerting
Automatic alerts are sent via Slack/Discord for:
- Worker health failures
- High error rates (>5% by default)
- Slow response times (>5s by default)
- Service discovery issues

## 🔐 Security

### Authentication
Admin endpoints require Bearer token authentication:
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://your-orchestrator.workers.dev/admin/workers/main-bot/restart
```

### Rate Limiting
Default rate limits per client IP:
- Health endpoints: 60 requests/minute
- Metrics endpoints: 30 requests/minute  
- Admin endpoints: 10 requests/minute
- General endpoints: 100 requests/minute

### CORS
Configured for frontend origins with proper security headers.

## 🚀 Deployment

### Staging Deployment
```bash
npm run deploy:staging
```

### Production Deployment
```bash
npm run deploy:production
```

### Service Bindings
The orchestrator uses Cloudflare service bindings to communicate with workers. Ensure all referenced services are deployed before the orchestrator.

## 📈 Scaling

### Auto-scaling
The orchestrator can automatically scale workers based on:
- CPU utilization
- Request queue depth
- Response time degradation
- Error rate increases

### Manual Scaling
Use admin endpoints to manually start/stop/restart workers as needed.

## 🔍 Troubleshooting

### Common Issues

1. **Service binding errors**: Ensure all worker services are deployed
2. **Authentication failures**: Verify ORCHESTRATOR_API_KEY is set
3. **Health check failures**: Check worker URLs and network connectivity
4. **Rate limit errors**: Adjust rate limits in middleware configuration

### Debug Mode
Set `DEV_MODE=true` in environment for enhanced logging and debug endpoints.

### Logs
View logs via Wrangler:
```bash
wrangler tail --env production
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the monitoring dashboard for system status