# 🤖 Main Bot Worker

ระบบ Telegram Bot หลักสำหรับ DOGLC Digital Wallet

## 📋 หน้าที่หลัก

- 🔌 **Telegram Bot Interface** - จัดการการติดต่อกับผู้ใช้ผ่าน Telegram
- 🎯 **Command Handling** - ประมวลผลคำสั่งและข้อความจากผู้ใช้
- 🌐 **Multi-language Support** - รองรับ 6 ภาษา (TH, EN, ZH, KM, KO, ID)
- 🔐 **Authentication** - ระบบการยืนยันตัวตนผู้ใช้
- ⚡ **Rate Limiting** - การจำกัดอัตราการใช้งาน
- 📊 **User Session Management** - จัดการ session ผู้ใช้

## 🏗️ สถาปัตยกรรม

```
src/
├── index.js          # Main entry point
├── handlers/         # Command handlers
│   ├── start.js     # Start command
│   ├── wallet.js    # Wallet operations
│   └── help.js      # Help system
├── middleware/       # Bot middleware
├── locales/         # Language files
└── utils/           # Utility functions
```

## 🔗 Service Bindings

- **BANKING_WORKER** - การดำเนินการทางการเงิน
- **SECURITY_WORKER** - ระบบความปลอดภัยและ OCR
- **API_WORKER** - บริการ RESTful API
- **ANALYTICS_WORKER** - การวิเคราะห์และติดตาม

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

- `TELEGRAM_BOT_TOKEN` - Token ของ Telegram Bot
- `TELEGRAM_WEBHOOK_SECRET` - Secret สำหรับ webhook
- `ENVIRONMENT` - staging/production
- `DEBUG_MODE` - เปิด/ปิด debug mode