name: Production & MiniApp Readiness Checklist
about: Comprehensive checklist to prepare DOGLC Digital Wallet for production deployment
title: '🚀 Production & MiniApp Readiness Checklist'
labels: 'critical, production, miniapp, infrastructure'
assignees: ''

---

# Production & MiniApp Readiness Checklist

## 🎯 Overview

Comprehensive checklist to prepare DOGLC Digital Wallet for production deployment with full MiniApp (Telegram WebApp) support. This issue tracks critical infrastructure, security, and functionality requirements.

## 📋 Critical Areas & Action Items

### A) Service Bindings & Orchestrator Routes

**Goal**: orchestrator เรียกทุก worker ได้สำเร็จใน prod

**Success Criteria**: `/discovery/services` และ `/health` ใช้งานได้ ไม่มี 5xx/404

- [ ] **Fix orchestrator service bindings**
  - [ ] Update `orchestrator/wrangler.toml` - remove empty SECURITY_SERVICE binding
  - [ ] Add proper environment-specific service bindings for all workers
  - [ ] Validate service names match actual worker deployments

- [ ] **Configure proper routes in all workers**
  - [ ] `workers/main-bot/wrangler.toml` - add routes configuration
  - [ ] `workers/api/wrangler.toml` - add routes configuration
  - [ ] `workers/banking/wrangler.toml` - add routes configuration
  - [ ] `workers/security/wrangler.toml` - add routes configuration
  - [ ] `workers/frontend/wrangler.toml` - add routes configuration

- [ ] **Remove development artifacts**
  - [ ] Remove `setInterval` from `orchestrator/src/index.js`
  - [ ] Remove `process.uptime/memoryUsage` calls (not available in Workers)
  - [ ] Fix `ServiceDiscovery.js` - declare `startTime` variable
  - [ ] Replace background timers with scheduled handlers

### B) CORS/Domain/Routes Configuration

**Goal**: ทั้งระบบผูกกับโดเมน production เดียว

**Success Criteria**: คำขอจาก MiniApp ผ่าน web.telegram.org สำเร็จ, ไม่มี CORS error

- [ ] **Fix CORS configuration**
  - [ ] Remove invalid `[cors]` section from `workers/api/wrangler.toml` (not Wrangler spec)
  - [ ] Implement proper CORS in code with allowed origins
  - [ ] Add `https://web.telegram.org` to ALLOWED_ORIGINS
  - [ ] Remove wildcard CORS (`*`) from `src/index.js`

- [ ] **Set production domains**
  - [ ] Update `FRONTEND_URL` from placeholder in `workers/frontend/wrangler.toml`
  - [ ] Set `MAIN_BOT_URL` to production domain
  - [ ] Update `API_BASE_URL` to match orchestrator routing
  - [ ] Ensure all worker URLs are consistent

### C) Secret Management & .env Cleanup

**Goal**: ไม่มีไฟล์ .env ใน git, ทุกคีย์อยู่ใน wrangler secret

**Success Criteria**: สแกน git log/ประวัติ และเปิดใช้ secret ใหม่แล้ว

- [ ] **Remove .env from git history**
  - [ ] Add `.env` to `.gitignore`
  - [ ] Remove `.env` from git tracking: `git rm --cached .env`
  - [ ] Scan git history for exposed secrets
  - [ ] Create new secrets for any that were exposed

- [ ] **Migrate to wrangler secrets**
  - [ ] Create secret management documentation
  - [ ] Move all sensitive values to `wrangler secret put`
  - [ ] Update deployment scripts to handle secrets
  - [ ] Add GitHub Actions secrets configuration

- [ ] **Document secret requirements**
  - [ ] Create `SECRETS.md` with required secret list
  - [ ] Add setup instructions for each environment
  - [ ] Document secret rotation procedures

### D) Background Jobs → Cron/Queues

**Goal**: ไม่มี setInterval ใน Workers

**Success Criteria**: scheduled handlers ทำงานจริง (log และผลลัพธ์)

- [ ] **Replace timers with cron triggers**
  - [ ] `MetricsCollector.js` - convert to scheduled handler
  - [ ] `HealthMonitor.js` - convert to scheduled handler
  - [ ] Add cron triggers to wrangler.toml files
  - [ ] Test scheduled execution in staging

- [ ] **Implement Queue-based background jobs**
  - [ ] Add Queue bindings to wrangler.toml
  - [ ] Convert heavy operations to queue consumers
  - [ ] Add retry logic and dead letter queues
  - [ ] Monitor queue performance

### E) D1 Database Migration & Seeds

**Goal**: D1 schema พร้อมใช้งาน

**Success Criteria**: integration test ผ่านใน staging

- [ ] **Create complete migration scripts**
  - [ ] Users table with proper constraints and indexes
  - [ ] Transactions table with foreign keys and audit fields
  - [ ] Bank accounts table with validation rules
  - [ ] VIP levels table with tier definitions
  - [ ] Exchange rates table with timestamp tracking
  - [ ] Admin/audit tables for compliance

- [ ] **Create seed data scripts**
  - [ ] Thai bank list (Kasikorn, SCB, BBL, KTB, etc.)
  - [ ] Default VIP levels and benefits
  - [ ] Initial exchange rates (THB/USDT baseline)
  - [ ] Admin user and permissions

- [ ] **Add integration test workflow**
  - [ ] D1 database setup in staging
  - [ ] Migration execution test
  - [ ] Basic CRUD operation validation
  - [ ] Foreign key constraint verification

### F) MiniApp (Telegram WebApp) Security

**Goal**: verify initData และ rate limit

**Success Criteria**: Backend ปฏิเสธ initData ที่ hash ไม่ถูกต้อง, log audit ครบ

- [ ] **Implement initData verification**
  - [ ] Add `/auth/telegram/webapp-verify` endpoint
  - [ ] Verify initData hash with bot token
  - [ ] Create session/user mapping in KV/DO
  - [ ] Remove dependency on direct X-Telegram-User-Id header

- [ ] **CORS/Origins hardening**
  - [ ] Frontend ALLOWED_ORIGINS: include `https://web.telegram.org`
  - [ ] Backend: restrict origins to frontend domain + Telegram only
  - [ ] Remove development origins from production config

- [ ] **URL mapping validation**
  - [ ] Set production values for MAIN_BOT_URL/FRONTEND_URL/API_BASE_URL
  - [ ] Ensure consistency with orchestrator routing
  - [ ] Validate all cross-worker communication URLs

### G) Cloudflare Resources/Plans Audit

**Goal**: ตรวจสอบความพร้อมใช้งาน resources ตามแผน

**Success Criteria**: ทุก binding ใน wrangler.toml ใช้งานได้จริง

- [ ] **Audit resource bindings**
  - [ ] Check [browser] binding availability on current plan
  - [ ] Verify [ai], [vectorize], [email] plan requirements
  - [ ] Validate R2 bucket quotas and permissions
  - [ ] Test Queue binding functionality
  - [ ] Check [placement] mode="smart" plan compatibility

- [ ] **Create real resources**
  - [ ] Create required KV namespaces with proper IDs
  - [ ] Set up D1 database instances for staging/production
  - [ ] Configure R2 buckets with appropriate permissions
  - [ ] Test all bindings in staging environment

- [ ] **Remove unused bindings**
  - [ ] Remove placeholder IDs from wrangler.toml files
  - [ ] Comment out unused advanced features
  - [ ] Document which features require plan upgrades

### H) Remove "Coming Soon" Features

**Goal**: ไม่มี endpoint สาธารณะที่ยังไม่พร้อม

**Success Criteria**: 501/401/403 ที่เหมาะสม หรือฟีเจอร์ใช้งานได้จริง

- [ ] **Banking worker cleanup**
  - [ ] Replace "Coming soon" in `workers/banking/src/index.js`
  - [ ] Implement basic OCR endpoint or return 501
  - [ ] Add proper error responses for unimplemented features
  - [ ] Hide incomplete features in staging mode

- [ ] **Security worker cleanup**
  - [ ] Replace "Coming soon" in `workers/security/src/index.js`
  - [ ] Implement basic security endpoints or return 501
  - [ ] Add authentication for security endpoints
  - [ ] Document security feature roadmap

- [ ] **Frontend feature flags**
  - [ ] Hide incomplete buttons/features in production MiniApp
  - [ ] Show "coming soon" only in staging environment
  - [ ] Implement feature flag system for gradual rollout

### I) CI/CD, Security, Observability

**Goal**: Production-grade deployment and monitoring

**Success Criteria**: Automated deployment, security scanning, monitoring active

- [ ] **GitHub Actions setup**
  - [ ] Lint + test workflow
  - [ ] Build and staging deployment
  - [ ] Manual approval for production deployment
  - [ ] Secret scanning and CodeQL integration
  - [ ] ESLint and Prettier enforcement

- [ ] **Security hardening**
  - [ ] Enable secret scanning on repository
  - [ ] Add dependency vulnerability scanning
  - [ ] Implement rate limiting per endpoint
  - [ ] Add request/response logging for audit

- [ ] **Logging/Monitoring**
  - [ ] Connect Cloudflare tail/logpush for orchestrator
  - [ ] Set up alerting for 5xx errors and timeouts
  - [ ] Add timeout and retry logic to all fetch calls
  - [ ] Monitor worker memory and CPU usage

## 🎯 Implementation Order & Success Criteria

### Phase 1: Core Infrastructure (Critical Path)

1. **Service bindings** → orchestrator can call all workers
2. **Routes & domains** → consistent URL structure
3. **Secrets cleanup** → no exposed credentials

### Phase 2: Database & Background Jobs

1. **D1 migrations** → database schema ready
2. **Cron/Queues** → no timer-based background jobs

### Phase 3: Security & MiniApp

1. **MiniApp authentication** → secure initData handling
2. **Resource audit** → all bindings functional

### Phase 4: Production Readiness

1. **Feature cleanup** → no "coming soon" endpoints
2. **CI/CD** → automated deployment pipeline

## 📝 Reference Files for Issues

- `orchestrator/wrangler.toml` (service binding, DOMAIN, missing routes)
- `orchestrator/src/index.js` (setInterval, process.uptime/memoryUsage)
- `orchestrator/src/services/MetricsCollector.js`, `HealthMonitor.js`, `ServiceDiscovery.js`
- `workers/main-bot/wrangler.toml` (durable_objects bindings)
- `workers/api/wrangler.toml` (invalid [cors], missing service environment)
- `workers/banking/wrangler.toml` & `src/index.js` (placeholder IDs, "Coming soon")
- `workers/security/wrangler.toml` & `src/index.js` (placeholder IDs, "Coming soon")
- `workers/frontend/wrangler.toml` (MAIN_BOT_URL placeholder)
- `src/index.js` (MiniApp API, CORS = "*")
- `.env` (committed to git)

## ✅ Definition of Done

- [ ] All workers deploy successfully to production
- [ ] MiniApp works through web.telegram.org without CORS errors
- [ ] No secrets in git history, all use wrangler secret
- [ ] Database schema complete with seed data
- [ ] All "coming soon" features removed or properly handled
- [ ] CI/CD pipeline operational with staging → production flow
- [ ] Monitoring and alerting active
- [ ] Documentation updated for production operations

---

**Priority**: 🔥 Critical for production launch

**Estimated effort**: 2-3 weeks full development

**Dependencies**: Cloudflare plan verification, domain configuration, security review

## 🛠️ Tools & Scripts Created

- **Fix Script**: `scripts/fix-phase1-service-bindings.js` - Automated Phase 1 fixes
- **Validation**: `scripts/validate-phase1.js` - Test script for verification
- **Documentation**: `PRODUCTION_READINESS_CHECKLIST.md` - Complete checklist

To start implementation:
```bash
node scripts/fix-phase1-service-bindings.js
node scripts/validate-phase1.js
```