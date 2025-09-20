# 🏗️ DOGLC Digital Wallet Workers

สถาปัตยกรรม Multi-Worker สำหรับระบบกระเป๋าเงินดิจิทัล

## 📁 โครงสร้าง Workers

```
workers/
├── main-bot/         # 🤖 Telegram Bot Worker
├── api/              # 🌐 RESTful API Worker  
├── banking/          # 🏦 Banking Operations Worker
├── security/         # 🛡️ Security & OCR Worker
├── frontend/         # 🎨 Frontend Web App Worker
└── analytics/        # 📊 Analytics & Monitoring Worker
```

## 🔗 Worker Communications

### 🤖 Main Bot Worker
- **หน้าที่**: Telegram Bot Interface, User Commands
- **เชื่อมต่อ**: Banking, Security, API, Analytics Workers
- **Port**: 8787 (default)

### 🌐 API Worker  
- **หน้าที่**: RESTful API Services, Authentication
- **เชื่อมต่อ**: Banking, Security, Analytics Workers
- **Port**: 8788

### 🏦 Banking Worker
- **หน้าที่**: Financial Operations, Transactions
- **เชื่อมต่อ**: Security, Analytics Workers
- **Port**: 8789

### 🛡️ Security Worker
- **หน้าที่**: OCR Processing, Fraud Detection, Security
- **เชื่อมต่อ**: Analytics Worker
- **Port**: 8790

### 🎨 Frontend Worker
- **หน้าที่**: Web Application Interface
- **เชื่อมต่อ**: API, Banking, Security, Analytics Workers
- **Port**: 8791

### 📊 Analytics Worker
- **หน้าที่**: Data Analysis, Monitoring, Reporting
- **เชื่อมต่อ**: All other workers (receives data)
- **Port**: 8792

## 🚀 การ Deploy แบบ Multi-Worker

### Development
```bash
# Deploy all workers to staging
npm run deploy:all:staging

# Deploy specific worker
cd workers/main-bot && npm run deploy:staging
```

### Production
```bash
# Deploy all workers to production
npm run deploy:all:production

# Deploy specific worker
cd workers/banking && npm run deploy:production
```

## 🔧 Configuration

แต่ละ worker มี:
- `wrangler.toml` - Cloudflare Workers configuration
- `package.json` - Dependencies และ scripts
- `src/` - Source code
- `README.md` - Worker-specific documentation

## 📊 Resource Allocation

| Worker | CPU | Memory | KV Namespaces | D1 Databases | R2 Buckets |
|--------|-----|--------|---------------|--------------|------------|
| Main Bot | Medium | 128MB | 3 | 0 | 0 |
| API | Medium | 128MB | 2 | 1 | 0 |
| Banking | High | 256MB | 4 | 2 | 1 |
| Security | High | 256MB | 4 | 1 | 2 |
| Frontend | Medium | 128MB | 2 | 1 | 2 |
| Analytics | High | 256MB | 3 | 2 | 2 |

## 🔐 Security Features

- **Inter-worker Authentication** - JWT tokens between workers
- **Rate Limiting** - ทุก worker มี rate limiting
- **Input Validation** - การตรวจสอบข้อมูลทุกชั้น
- **Audit Logging** - บันทึกการทำงานครอบคลุม
- **Encryption** - การเข้ารหัสข้อมูลสำคัญ

## 📈 Scalability

- **Horizontal Scaling** - เพิ่ม worker instances ตามความต้องการ
- **Load Balancing** - Cloudflare จัดการ load balancing อัตโนมัติ
- **Resource Isolation** - แต่ละ worker ทำงานแยกกัน
- **Fault Tolerance** - worker หนึ่งล้มไม่กระทบอื่น