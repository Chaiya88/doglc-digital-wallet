# 🌐 API Worker

บริการ RESTful API สำหรับ DOGLC Digital Wallet

## 📋 หน้าที่หลัก

- 🔌 **RESTful API Services** - บริการ API ครอบคลุม
- 🔐 **JWT Authentication** - ระบบ authentication ด้วย JWT
- 📊 **Data Validation** - การตรวจสอบข้อมูลด้วย Zod
- 🚀 **High Performance** - ประสิทธิภาพสูงด้วย Hono framework
- 🔒 **CORS Management** - จัดการ CORS อย่างปลอดภัย
- ⚡ **Rate Limiting** - การจำกัดอัตราการเรียก API

## 🛣️ API Endpoints

### Authentication
- `POST /auth/login` - เข้าสู่ระบบ
- `POST /auth/refresh` - รีเฟรช token
- `POST /auth/logout` - ออกจากระบบ

### Wallet Operations
- `GET /wallet/balance` - ดูยอดเงิน
- `POST /wallet/deposit` - ฝากเงิน
- `POST /wallet/withdraw` - ถอนเงิน
- `GET /wallet/transactions` - ประวัติการทำรายการ

### User Management
- `GET /user/profile` - ข้อมูลผู้ใช้
- `PUT /user/profile` - อัปเดตข้อมูล
- `GET /user/settings` - การตั้งค่า

## 🏗️ สถาปัตยกรรม

```typescript
src/
├── index.js          # Main API entry point
├── routes/           # API route handlers
│   ├── auth.js      # Authentication routes
│   ├── wallet.js    # Wallet API routes
│   └── user.js      # User management routes
├── middleware/       # API middleware
├── validators/       # Request validators
└── utils/           # Utility functions
```

## 🔗 Service Bindings

- **BANKING_WORKER** - การดำเนินการทางการเงิน
- **SECURITY_WORKER** - ระบบความปลอดภัย
- **ANALYTICS_WORKER** - การบันทึกและวิเคราะห์

## 🚀 การ Deploy

```bash
# Development
npm run dev

# Staging
npm run deploy:staging

# Production
npm run deploy:production
```

## 📝 Environment Variables

- `JWT_SECRET` - Secret สำหรับ JWT
- `API_RATE_LIMIT` - จำนวนครั้งการเรียก API ต่อนาที
- `CORS_ORIGINS` - Allowed origins สำหรับ CORS
- `ENVIRONMENT` - staging/production