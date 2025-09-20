# Production Environment Variables Configuration Template
# Complete configuration guide for DOGLC Digital Wallet production deployment

## 🔐 Required Environment Variables

### Core Bot Configuration
BOT_TOKEN=1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_ABC
# Format: {bot_id}:{bot_token}
# Get from @BotFather on Telegram
# Example: 5432109876:AABBCCDDEE1122334455667788FFGGHHIIJJKKLL

WEBHOOK_SECRET=your-32-character-webhook-secret-here
# Generate: openssl rand -hex 32
# Used to validate webhook requests from Telegram

ADMIN_USER_ID=123456789
# Your Telegram user ID (numeric)
# Get from @userinfobot or @getidsbot

### Security Configuration
JWT_SECRET=your-jwt-secret-base64-encoded-min-32-chars
# Generate: openssl rand -base64 48
# Used for JWT token signing

JWT_REFRESH_SECRET=your-refresh-jwt-secret-base64-encoded
# Generate: openssl rand -base64 48
# Used for refresh token signing

MASTER_ENCRYPTION_KEY=your-master-encryption-key-for-env-vars
# Generate: openssl rand -base64 64
# Used for encrypting sensitive environment variables

### Cloudflare Configuration
CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id
# Get from Cloudflare dashboard -> Right sidebar

CLOUDFLARE_API_TOKEN=your-cloudflare-api-token
# Create from Cloudflare dashboard -> My Profile -> API Tokens
# Permissions: Zone:Read, Zone:Edit, Account:Read

CLOUDFLARE_ZONE_ID=your-cloudflare-zone-id
# Get from Cloudflare dashboard -> Domain overview -> Zone ID

### Domain Configuration
DOMAIN_NAME=doglc-wallet.com
# Your production domain name

API_DOMAIN=api.doglc-wallet.com
# API subdomain

BOT_DOMAIN=bot.doglc-wallet.com
# Bot webhook subdomain

DASHBOARD_DOMAIN=dashboard.doglc-wallet.com
# Monitoring dashboard subdomain

### Database & Storage
KV_BINDING_PREFIX=DOGLC_PROD
# Prefix for KV namespace bindings in production

### External Services
GOOGLE_VISION_API_KEY=your-google-vision-api-key-for-ocr
# Optional: For OCR functionality
# Get from Google Cloud Console

SENDGRID_API_KEY=your-sendgrid-api-key-for-emails
# Optional: For email notifications
# Get from SendGrid dashboard

### Monitoring & Alerting
SENTRY_DSN=your-sentry-dsn-for-error-tracking
# Optional: For error tracking
# Get from Sentry.io

WEBHOOK_ALERT_URL=your-webhook-url-for-alerts
# Optional: For alert notifications (Slack, Discord, etc.)

### Rate Limiting Configuration
RATE_LIMIT_MAX_REQUESTS=100
# Maximum requests per user per window

RATE_LIMIT_WINDOW_SECONDS=3600
# Rate limit window in seconds (default: 1 hour)

### Performance Configuration
MAX_CONCURRENT_UPLOADS=10
# Maximum concurrent file uploads

DATABASE_CONNECTION_POOL_SIZE=20
# Database connection pool size

CACHE_TTL_SECONDS=300
# Default cache TTL in seconds

### Feature Flags
ENABLE_OCR=true
# Enable OCR functionality

ENABLE_ANALYTICS=true
# Enable analytics collection

ENABLE_DEBUG_LOGGING=false
# Enable debug logging (set to false in production)

MAINTENANCE_MODE=false
# Enable maintenance mode

## 🔧 Environment-Specific Configurations

### Production Environment
ENVIRONMENT=production
NODE_ENV=production
LOG_LEVEL=info

### Staging Environment (if used)
# ENVIRONMENT=staging
# NODE_ENV=staging
# LOG_LEVEL=debug

## 📋 Environment Variables Validation

### Required Variables Checklist
# ✅ BOT_TOKEN - Telegram bot token
# ✅ WEBHOOK_SECRET - Webhook validation secret
# ✅ ADMIN_USER_ID - Admin user Telegram ID
# ✅ JWT_SECRET - JWT signing secret
# ✅ JWT_REFRESH_SECRET - Refresh token secret
# ✅ MASTER_ENCRYPTION_KEY - Environment encryption key
# ✅ CLOUDFLARE_ACCOUNT_ID - Cloudflare account ID
# ✅ CLOUDFLARE_API_TOKEN - Cloudflare API token
# ✅ CLOUDFLARE_ZONE_ID - Cloudflare zone ID
# ✅ DOMAIN_NAME - Production domain

### Security Validation Rules
# - BOT_TOKEN: Must match pattern /^\d+:[A-Za-z0-9_-]{35}$/
# - JWT_SECRET: Minimum 32 characters, base64 encoded
# - WEBHOOK_SECRET: Minimum 32 characters hex
# - ADMIN_USER_ID: Must be numeric
# - All secrets: High entropy, no common words

### Optional but Recommended
# ✅ GOOGLE_VISION_API_KEY - For OCR functionality
# ✅ SENDGRID_API_KEY - For email notifications
# ✅ SENTRY_DSN - For error tracking
# ✅ WEBHOOK_ALERT_URL - For alert notifications

## 🚀 Deployment Instructions

### 1. Create Environment File
```bash
# Copy this template to .env.production
cp .env.example .env.production

# Edit with your actual values
nano .env.production
```

### 2. Validate Environment Variables
```bash
# Run validation script
node scripts/validate-environment.js

# Expected output: All environment variables validated successfully
```

### 3. Deploy to Cloudflare Workers
```bash
# Deploy with production environment
npm run deploy:production

# Verify deployment
npm run health-check:production
```

### 4. Set Up Webhook
```bash
# Configure Telegram webhook
curl -X POST "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://bot.doglc-wallet.com/webhook",
       "secret_token": "'${WEBHOOK_SECRET}'"
     }'
```

## 🔒 Security Best Practices

### Environment Variable Security
1. **Never commit sensitive values** to version control
2. **Use strong, unique values** for all secrets
3. **Rotate secrets regularly** (every 90 days)
4. **Use different values** for staging and production
5. **Enable audit logging** for environment access

### Access Control
1. **Limit access** to production environment variables
2. **Use role-based access** for team members
3. **Enable two-factor authentication** for all accounts
4. **Monitor access logs** regularly

### Backup & Recovery
1. **Backup environment configuration** securely
2. **Test recovery procedures** regularly
3. **Document all configurations** and procedures
4. **Keep encrypted backups** of sensitive data

## 📊 Monitoring Configuration

### Health Checks
- Bot response time: < 500ms
- Webhook delivery: 99.9% success rate
- Database queries: < 1s average
- File uploads: < 5s average
- Memory usage: < 80%

### Alerts
- Error rate > 1%
- Response time > 2s
- Failed webhook deliveries > 10/hour
- Database connection failures
- High memory/CPU usage

### Metrics Collection
- Transaction volume and success rates
- User activity patterns
- Performance metrics
- Security events
- Resource utilization

## 🔧 Troubleshooting

### Common Issues
1. **Bot not responding**
   - Check BOT_TOKEN format
   - Verify webhook URL is accessible
   - Check Cloudflare Worker logs

2. **Webhook failures**
   - Verify WEBHOOK_SECRET matches
   - Check domain SSL certificate
   - Verify Cloudflare routing

3. **Authentication errors**
   - Check JWT_SECRET configuration
   - Verify token expiration settings
   - Check user permissions

4. **Database issues**
   - Check KV namespace bindings
   - Verify connection pool settings
   - Check rate limiting configuration

### Debug Commands
```bash
# Check environment validation
node scripts/validate-environment.js

# Test bot connectivity
node scripts/test-bot-connection.js

# Verify webhook setup
node scripts/verify-webhook.js

# Run health checks
node scripts/health-check.js

# View logs
wrangler tail --env production
```

## 📚 Additional Resources

### Documentation
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)

### Security Guidelines
- [OWASP Security Guidelines](https://owasp.org/www-project-web-security-testing-guide/)
- [Cloudflare Security Features](https://developers.cloudflare.com/security/)
- [Environment Variable Security](https://blog.gitguardian.com/secrets-api-management/)

### Support
- Project Repository: https://github.com/your-org/doglc-digital-wallet
- Documentation: https://docs.doglc-wallet.com
- Support Email: support@doglc-wallet.com
- Discord Community: https://discord.gg/doglc-wallet