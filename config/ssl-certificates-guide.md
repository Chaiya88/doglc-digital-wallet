# SSL Certificates Configuration Guide

## การตั้งค่า SSL Certificates สำหรับ Cloudflare Workers

### 1. การตั้งค่าเบื้องต้น

#### Environment Variables ที่จำเป็น
```bash
# Cloudflare Configuration
CLOUDFLARE_DOMAIN=your-domain.com
CLOUDFLARE_API_KEY=your-api-key
CLOUDFLARE_EMAIL=your-email@example.com

# Telegram Notifications (Optional)
TELEGRAM_BOT_TOKEN=your-bot-token
ADMIN_CHAT_ID=your-admin-chat-id

# KV Storage for SSL Monitoring
SSL_MONITORING_KV=ssl-monitoring
SSL_ERROR_KV=ssl-errors
```

#### Cloudflare Dashboard Setup
1. **Enable SSL/TLS**
   - Go to SSL/TLS → Overview
   - Set SSL/TLS encryption mode to "Full (strict)"
   - Enable "Always Use HTTPS"

2. **Configure HSTS**
   - Go to SSL/TLS → Edge Certificates
   - Enable "HTTP Strict Transport Security (HSTS)"
   - Set Max Age: 12 months
   - Enable "Include subdomains"
   - Enable "Preload"

3. **Advanced Certificate Manager (Optional)**
   - Go to SSL/TLS → Edge Certificates
   - Consider enabling "Dedicated SSL Certificates" for enhanced security

### 2. SSL Manager Integration

#### Basic Usage
```javascript
import { SSLManager } from './src/utils/ssl-manager.js';

// Initialize SSL Manager
const sslManager = new SSLManager(env);

// Check SSL status
const status = await sslManager.checkSSLStatus();
console.log('SSL Status:', status);

// Apply security headers to responses
const secureResponse = sslManager.applySSLHeaders(response);
```

#### Telegram Bot Integration
```javascript
import { Telegraf } from 'telegraf';
import { SSLManager } from './src/utils/ssl-manager.js';

const bot = new Telegraf(env.TELEGRAM_BOT_TOKEN);
const sslManager = new SSLManager(env);

// Apply SSL middleware
bot.use(sslManager.createSSLMiddleware());

// SSL context will be available in all handlers
bot.command('ssl', async (ctx) => {
  const status = await ctx.ssl.manager.checkSSLStatus();
  ctx.reply(`SSL Status: ${status.isValid ? '✅ Valid' : '❌ Invalid'}`);
});
```

### 3. Automated Monitoring

#### Scheduled Monitoring (using Cron Triggers)
```javascript
// In your scheduled event handler
export default {
  async scheduled(event, env, ctx) {
    if (event.cron === '0 6 * * *') { // Daily at 6 AM
      const sslManager = new SSLManager(env);
      await sslManager.monitorSSLCertificates();
    }
  }
}
```

#### Manual Monitoring
```javascript
// Check all configured domains
const monitoringReport = await sslManager.monitorSSLCertificates();

// Check specific domain
const domainStatus = await sslManager.checkSSLStatus('example.com');
```

### 4. Certificate Auto-Renewal

#### Cloudflare Automatic Renewal
Cloudflare automatically renews Let's Encrypt certificates. No manual intervention required.

#### Monitoring Renewal Process
```javascript
// The SSL Manager will automatically detect upcoming renewals
// and send notifications when certificates are close to expiry

// Force check renewal status
const renewalResult = await sslManager.autoRenewCertificate();
```

### 5. Security Headers Configuration

#### Default Security Headers
The SSL Manager automatically applies these security headers:

```javascript
{
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; ..."
}
```

#### Custom Security Headers
```javascript
// Customize security headers in SSL Manager constructor
const customSSLManager = new SSLManager(env);
customSSLManager.securityHeaders['Custom-Header'] = 'custom-value';
```

### 6. Error Handling และ Notifications

#### Telegram Notifications
SSL Manager will automatically send Telegram notifications for:
- Certificate expiry warnings (30, 14, 7, 3, 1 days before)
- Renewal initiation/completion
- SSL validation failures
- Configuration issues

#### Error Logging
```javascript
// Errors are automatically logged to KV storage
// Access error logs:
const errorLogs = await env.SSL_ERROR_KV.list();
```

### 7. Testing และ Verification

#### Run SSL Verification Script
```bash
node scripts/verify-ssl-certificates.js
```

#### Expected Output
```
✅ PASS SSL Manager instantiation
✅ PASS Environment configuration loading
✅ PASS SSL configuration setup
✅ PASS Security headers configuration
✅ PASS SSL status check execution
✅ PASS Certificate details retrieval
...

Test Summary:
  Total Tests: 25
  Passed: 25
  Failed: 0
  Success Rate: 100%
```

### 8. Production Deployment Checklist

#### Before Deployment
- [ ] Configure Cloudflare API credentials
- [ ] Set up domain in environment variables
- [ ] Enable SSL/TLS in Cloudflare Dashboard
- [ ] Configure HSTS settings
- [ ] Set up KV namespaces for monitoring
- [ ] Configure Telegram notifications (optional)
- [ ] Run SSL verification script
- [ ] Test with staging environment

#### After Deployment
- [ ] Verify SSL certificate installation
- [ ] Test HTTPS redirect
- [ ] Confirm security headers are applied
- [ ] Set up monitoring schedule
- [ ] Monitor certificate renewal process
- [ ] Configure alerting for SSL issues

### 9. Troubleshooting

#### Common Issues

**1. SSL Not Active**
```
Error: SSL not active in Cloudflare
Solution: Enable SSL in Cloudflare dashboard, set to "Full (strict)"
```

**2. Certificate Validation Failed**
```
Error: Certificate validation failed
Solution: Check domain DNS settings, ensure proper Cloudflare setup
```

**3. Missing API Credentials**
```
Error: Cloudflare API credentials not configured
Solution: Set CLOUDFLARE_API_KEY and CLOUDFLARE_EMAIL environment variables
```

**4. HSTS Not Working**
```
Error: HSTS header not configured
Solution: Enable HSTS in Cloudflare Security settings
```

#### Debug Commands
```javascript
// Enable debug logging
console.log = (...args) => console.info('[SSL-DEBUG]', ...args);

// Check specific SSL component
const certDetails = await sslManager.getCertificateDetails('domain.com');
const validation = await sslManager.validateSSLConfiguration('domain.com');
```

### 10. Advanced Configuration

#### Custom SSL Policies
```javascript
// Modify SSL configuration
sslManager.sslConfig.minTlsVersion = '1.3';
sslManager.sslConfig.hsts.maxAge = 63072000; // 2 years
```

#### Multiple Domain Monitoring
```javascript
// Override domain list for monitoring
sslManager.getDomainList = () => [
  'domain1.com',
  'domain2.com',
  'api.domain.com'
];
```

#### Custom Notification Logic
```javascript
// Override notification method
sslManager.sendSSLNotification = async (notification) => {
  // Custom notification logic (email, Slack, etc.)
  console.log('Custom SSL notification:', notification);
};
```

### 11. Performance Considerations

#### KV Storage Optimization
- SSL monitoring reports expire after 30 days
- Error logs expire after 7 days
- Use appropriate TTL values to manage storage

#### API Rate Limiting
- Cloudflare API has rate limits
- SSL Manager includes retry logic with exponential backoff
- Monitor API usage in Cloudflare dashboard

#### Caching Strategy
- SSL status checks are cached for 1 hour
- Certificate details cached for 6 hours
- Validation results cached for 24 hours

### 12. Security Best Practices

#### Environment Variables Security
- Never commit API keys to source control
- Use Cloudflare Workers secrets for sensitive data
- Rotate API keys regularly
- Use least-privilege API permissions

#### Certificate Security
- Use strong cipher suites
- Enable Perfect Forward Secrecy
- Monitor for weak cryptographic algorithms
- Regular security audits

#### Monitoring Security
- Secure KV storage access
- Encrypt sensitive monitoring data
- Audit SSL configuration changes
- Monitor for certificate transparency logs

---

## Quick Start Commands

```bash
# Install dependencies
npm install

# Run SSL verification
node scripts/verify-ssl-certificates.js

# Deploy with SSL configuration
npm run deploy

# Test SSL in staging
ENVIRONMENT=staging node scripts/verify-ssl-certificates.js
```

## Support

For SSL-related issues:
1. Check Cloudflare SSL/TLS dashboard
2. Run verification script for detailed diagnostics
3. Review error logs in KV storage
4. Monitor Telegram notifications for alerts
5. Consult Cloudflare SSL documentation