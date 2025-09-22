# 🔐 Security Checklist for Repository Merge

## Overview
This checklist ensures all sensitive data is properly secured during the merge of doglc-digital-wallet and logic-digital-wallet repositories.

## 🚨 Critical Security Tasks

### 1. Sensitive Data Audit
- [ ] **Scan all wrangler.toml files** for sensitive data
  - [ ] Bank account numbers
  - [ ] API keys and tokens  
  - [ ] Email addresses
  - [ ] Webhook URLs
  - [ ] Cloudflare account IDs
  - [ ] Database connection strings

- [ ] **Review all .env and config files**
  - [ ] Check .env.example for placeholder vs real data
  - [ ] Verify .env.cloudflare.example is sanitized
  - [ ] Scan configuration files in workers/ directories

- [ ] **Audit source code for hardcoded secrets**
  - [ ] JWT secrets in source files
  - [ ] Encryption keys
  - [ ] Database passwords
  - [ ] Third-party service credentials

### 2. Git History Security
- [ ] **Run git log search for sensitive patterns**
  ```bash
  git log -p --all -S "password" --source
  git log -p --all -S "secret" --source
  git log -p --all -S "key" --source
  git log -p --all -S "@gmail.com" --source
  git log -p --all -S "BANK_ACCOUNT" --source
  ```

- [ ] **Check for leaked credentials in commit messages**
  ```bash
  git log --grep="password\|secret\|key\|token" --all
  ```

- [ ] **Verify no sensitive files were committed**
  ```bash
  git log --name-only --all | grep -E "\.env$|\.key$|\.pem$"
  ```

### 3. Secrets Migration Plan

#### Current Secrets to Migrate (from wrangler.toml)
- [ ] `TELEGRAM_BOT_TOKEN` → Cloudflare secret
- [ ] `JWT_SECRET` → Cloudflare secret  
- [ ] `ENCRYPTION_KEY` → Cloudflare secret
- [ ] `GOOGLE_VISION_API_KEY` → Cloudflare secret
- [ ] `GMAIL_CLIENT_ID` → Cloudflare secret
- [ ] `GMAIL_CLIENT_SECRET` → Cloudflare secret
- [ ] `BANK_ACCOUNT_NUMBER` → Cloudflare secret
- [ ] `WEBHOOK_URL` → Environment-specific configuration
- [ ] Database connection strings → Cloudflare D1 bindings

#### Migration Commands
```bash
# Set secrets using wrangler
wrangler secret put TELEGRAM_BOT_TOKEN
wrangler secret put JWT_SECRET  
wrangler secret put ENCRYPTION_KEY
wrangler secret put GOOGLE_VISION_API_KEY
wrangler secret put GMAIL_CLIENT_ID
wrangler secret put GMAIL_CLIENT_SECRET
wrangler secret put BANK_ACCOUNT_NUMBER

# For each worker that needs secrets
cd workers/banking && wrangler secret put BANK_ACCOUNT_NUMBER
cd workers/main-bot && wrangler secret put TELEGRAM_BOT_TOKEN
```

### 4. Configuration Security

#### Wrangler.toml Sanitization
- [ ] Remove all `[vars]` sections with sensitive data
- [ ] Replace with placeholder values in examples
- [ ] Add comments explaining secret usage
- [ ] Verify preview_id values are safe to expose

#### Environment Templates
- [ ] Update `.env.example` with safe placeholder values
- [ ] Add clear instructions for secret setup
- [ ] Document which secrets go where (main vs workers)
- [ ] Include validation scripts for secret setup

### 5. Access Control

#### Repository Settings
- [ ] **Set appropriate repository visibility**
  - Private during migration
  - Public after security audit complete

- [ ] **Configure branch protection**
  - Require PR reviews for main branch
  - Require status checks to pass
  - Restrict push access

- [ ] **Set up required reviewers**
  - Security-related changes need admin review
  - Configuration changes need testing verification

### 6. Secret Rotation Schedule

#### Immediate Rotation (if any secrets were leaked)
- [ ] Telegram bot token
- [ ] JWT signing secrets
- [ ] Encryption keys
- [ ] API keys for external services
- [ ] Bank account access credentials

#### Post-Migration Rotation
- [ ] Generate new JWT secrets for production
- [ ] Create new encryption keys
- [ ] Rotate database passwords
- [ ] Update webhook URLs

### 7. Monitoring & Alerts

#### Security Monitoring
- [ ] Set up alerts for secret exposure in new commits
- [ ] Monitor for unauthorized access attempts
- [ ] Track unusual API usage patterns
- [ ] Log all administrative actions

#### Audit Trail
- [ ] Document all secret migrations
- [ ] Record rotation dates and reasons
- [ ] Maintain access logs
- [ ] Regular security reviews scheduled

## 🛡️ Security Tools & Automation

### Recommended Tools
- [ ] **git-secrets** - Prevent committing secrets
- [ ] **truffleHog** - Scan for secrets in git history
- [ ] **GitGuardian** - Continuous secret scanning
- [ ] **GitHub Advanced Security** - Code scanning alerts

### Pre-commit Hooks
```bash
# Install git-secrets
git secrets --install
git secrets --register-aws
git secrets --add 'password.*=.*'
git secrets --add 'secret.*=.*'
git secrets --add 'key.*=.*'
git secrets --add '[A-Za-z0-9+/]{40,}' # Base64 patterns
```

### GitHub Actions Security
- [ ] Add secret scanning workflow
- [ ] Set up dependency vulnerability checks
- [ ] Configure code scanning alerts
- [ ] Monitor for suspicious activities

## 🚀 Deployment Security

### Staging Environment
- [ ] Use separate secrets for staging
- [ ] Test secret injection works correctly
- [ ] Verify no secrets in logs or debug output
- [ ] Validate all workers can access required secrets

### Production Deployment
- [ ] Final security audit before go-live
- [ ] All secrets properly configured
- [ ] Access controls in place
- [ ] Monitoring and alerting active
- [ ] Incident response plan ready

## 📋 Security Sign-off Checklist

Before marking security tasks as complete:

- [ ] ✅ All sensitive data removed from source code
- [ ] ✅ Git history cleaned of any leaked secrets
- [ ] ✅ All secrets migrated to Cloudflare Vault
- [ ] ✅ Access controls and permissions configured
- [ ] ✅ Security monitoring in place
- [ ] ✅ Team trained on new security procedures
- [ ] ✅ Documentation updated with security guidelines
- [ ] ✅ Incident response plan tested

## 🆘 Incident Response

### If Secrets Are Discovered in Code
1. **Immediate Action**
   - Rotate affected secrets immediately
   - Remove from public repositories
   - Audit access logs for unauthorized usage

2. **Investigation**
   - Determine scope of exposure
   - Check for any suspicious activities
   - Document timeline and impact

3. **Remediation**
   - Implement additional controls
   - Update security procedures
   - Train team on prevention

### Emergency Contacts
- **Security Team**: [security@doglcdigital.com](mailto:security@doglcdigital.com)
- **DevOps Lead**: Repository owner
- **Cloudflare Support**: For platform-specific issues

---

**Document Version**: 1.0  
**Last Updated**: September 2025  
**Review Schedule**: Monthly during migration, quarterly after completion