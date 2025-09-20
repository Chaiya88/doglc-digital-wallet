# Production Secrets Template
อัปเดต wrangler secrets สำหรับ production deployment

## 🔐 Required Secrets (ใช้ wrangler secret put)

### Orchestrator Secrets
```bash
# Authentication
npx wrangler secret put ORCHESTRATOR_API_KEY --name doglc-digital-wallet-orchestrator-production

# Alert Webhooks (Optional)
npx wrangler secret put SLACK_WEBHOOK_URL --name doglc-digital-wallet-orchestrator-production
npx wrangler secret put DISCORD_WEBHOOK_URL --name doglc-digital-wallet-orchestrator-production
```

### Main Bot Worker Secrets
```bash
# Telegram Bot
npx wrangler secret put TELEGRAM_BOT_TOKEN --name doglc-main-bot-production
npx wrangler secret put MASTER_ADMIN_ID --name doglc-main-bot-production
npx wrangler secret put MASTER_ADMIN_USERNAME --name doglc-main-bot-production

# Security & Encryption
npx wrangler secret put JWT_SECRET --name doglc-main-bot-production
npx wrangler secret put ENCRYPTION_KEY --name doglc-main-bot-production
npx wrangler secret put PASSWORD_PEPPER --name doglc-main-bot-production
npx wrangler secret put INTERNAL_API_SECRET --name doglc-main-bot-production

# Banking & Crypto
npx wrangler secret put TRON_WALLET_ADDRESS --name doglc-main-bot-production
npx wrangler secret put TRONSCAN_API_KEY --name doglc-main-bot-production

# OCR & Image Processing
npx wrangler secret put OCR_API_KEY --name doglc-main-bot-production

# Gmail Integration
npx wrangler secret put GMAIL_CLIENT_ID --name doglc-main-bot-production
npx wrangler secret put GMAIL_CLIENT_SECRET --name doglc-main-bot-production
npx wrangler secret put GMAIL_REFRESH_TOKEN --name doglc-main-bot-production
npx wrangler secret put GMAIL_WEBHOOK_SECRET --name doglc-main-bot-production

# Admin Contacts
npx wrangler secret put TELEGRAM_ADMIN_CHAT_ID --name doglc-main-bot-production
npx wrangler secret put TELEGRAM_SUPPORT_CHAT_ID --name doglc-main-bot-production
```

## 📋 Values from Production Config
From the .env.example และ production.env ที่ส่งมา:

- **CLOUDFLARE_ACCOUNT_ID**: `85bcd386f06541844632ecb984afa9fb`
- **DOMAIN**: `teenoi96.org`
- **PRIMARY_BANK_ACCOUNT_NUMBER**: `6645769717`
- **PRIMARY_BANK_BRANCH**: `Lotus Wonghin`

## 🔄 Next Steps
1. ตั้งค่า secrets ทั้งหมดข้างต้น
2. Deploy orchestrator และ main-bot workers
3. Test การเชื่อมต่อระหว่าง services
4. Setup webhook สำหรับ Telegram Bot