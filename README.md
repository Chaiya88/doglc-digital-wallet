# 🏦 Doglc Digital Wallet Bot

กระเป๋าเงินดิจิทัล Telegram Bot ที่รองรับภาษาไทยและ deploy บน Cloudflare Workers

## ✨ Features

- 🇹🇭 รองรับภาษาไทยเต็มรูปแบบ (+ 5 ภาษาเพิ่มเติม)
- 💳 ระบบกระเป๋าเงินดิจิทัล
- 🔐 ระบบความปลอดภัยสูง
- ⚡ ประสิทธิภาพสูงด้วย Cloudflare Workers
- 📱 ใช้งานง่ายผ่าน Telegram
- 🔍 **OCR Banking Slip Verification** - ตรวจสอบสลิปอัตโนมัติ
- 📧 **Gmail Banking Integration** - เชื่อมต่อกับอีเมลธนาคาร
- 🛡️ **Enhanced Security Suite** - ระบบรักษาความปลอดภัยขั้นสูง
- 🏦 **Advanced Banking Operations** - การดำเนินการธนาคารขั้นสูง

## 🚀 New Enhanced Features

### 🔍 OCR Slip Verification System
- **Google Vision API Integration** - การประมวลผล OCR ขั้นสูง
- **Tesseract.js Fallback** - ระบบ OCR สำรอง
- **Thai Banking Slip Recognition** - รู้จักสลิปธนาคารไทย
- **Heuristic Text Parsing** - การวิเคราะห์ข้อความอัจฉริยะ
- **Multi-engine Consensus Scoring** - คะแนนความเชื่อมันจากหลายเครื่องมือ
- **Automatic Amount Detection** - การตรวจจับยอดเงินอัตโนมัติ

### 📧 Gmail Banking Integration
- **Webhook Processing** - ประมวลผลเว็บฮุกอัตโนมัติ
- **Bank Email Parsing** - การแปลงอีเมลธนาคาร
- **Transaction Matching** - การจับคู่ธุรกรรม
- **Auto-confirmation System** - ระบบยืนยันอัตโนมัติ
- **Signature Verification** - การตรวจสอบลายเซ็น
- **Multi-bank Support** - รองรับหลายธนาคาร

### 🛡️ Enhanced Security Framework
- **Advanced Rate Limiting** - การจำกัดอัตราขั้นสูง
- **Fraud Detection Engine** - เครื่องมือตรวจจับการฉ้อโกง
- **Audit Trail Logging** - การบันทึกรอยการตรวจสอบ
- **User Activity Tracking** - การติดตามกิจกรรมผู้ใช้
- **Input Sanitization** - การทำความสะอาดข้อมูลนำเข้า
- **Crypto Hash Security** - ความปลอดภัยด้วยการเข้ารหัสแฮช

### 🌐 Multi-language Enhancement
- **6 Language Support**: Thai (TH), English (EN), Chinese (ZH), Khmer (KM), Korean (KO), Indonesian (ID)
- **Banking Terminology** - คำศัพท์ธนาคารเฉพาะทาง
- **Cultural Localization** - การปรับให้เข้ากับวัฒนธรรม
- **Dynamic Language Switching** - การเปลี่ยนภาษาแบบไดนามิก

## <a id="architecture"></a>🏗️ สถาปัตยกรรมระบบ

### 🔧 Core Infrastructure (5 Workers)

| Worker | ขนาด | หน้าที่ |
|--------|------|---------|
| **🤖 Main Bot Worker** | ระบบ Telegram Bot หลัก |
| **🔌 API Worker** | บริการ RESTful API |
| **🏦 Banking Worker** | ระบบการเงินและธุรกรรม |
| **🔒 Security Worker** | ระบบความปลอดภัยและ OCR |
| **🎨 Frontend Worker**| ส่วนติดต่อผู้ใช้เว็บแอปพลิเคชัน |

### 📊 Database Infrastructure

- **💾 Cloudflare D1 Database** - ฐานข้อมูล SQLite แบบ Serverless
- **🗄️ KV Storage** - ระบบจัดเก็บข้อมูล Key-Value สำหรับ Cache
- **📈 Analytics Database** - ฐานข้อมูลสำหรับการวิเคราะห์

---

## <a id="main-features"></a>💰 ฟีเจอร์หลักของระบบ Digital Wallet

### 🏦 ระบบการเงินพื้นฐาน 

#### 💸 การฝากเงิน (Deposit System)
- **สกุลเงิน**: THB (บาทไทย)
- **จำนวนเงินที่รองรับ**: 
  - 📋 จำนวนเงินแบบกำหนดล่วงหน้า: 1,000, 5,000, 10,000 บาท
  - ⌨️ จำนวนเงินแบบกำหนดเอง: รองรับการป้อนจำนวนเงินตามต้องการ
- **ช่องทางการฝาก**:
  - 🏧 การโอนผ่านธนาคาร (Bank Transfer)
  - 📱 QR Code Payment
  - 💳 Mobile Banking
- **ระบบยืนยัน**: การยืนยันธุรกรรมแบบ 2-Step Confirmation

#### 💱 การถอนเงิน (Withdrawal System)
- **สกุลเงิน**: USDT (Tether)
- **จำนวนเงินที่รองรับ**:
  - 📋 จำนวนเงินแบบกำหนดล่วงหน้า: 50, 100, 500 USDT
  - ⌨️ จำนวนเงินแบบกำหนดเอง: รองรับการป้อนจำนวนเงินตามต้องการ
- **ระบบการรักษาความปลอดภัย**: การยืนยันตัวตนหลายขั้นตอน
- **เวลาการประมวลผล**: อัตโนมัติและรวดเร็ว

#### 🔄 การโอนเงิน (Transfer System)
- **การโอนภายใน**: ระหว่างผู้ใช้ในระบบ DOGLC
- **การโอนภายนอก**: ไปยัง Wallet Address ภายนอก
- **สกุลเงินที่รองรับ**: DOGLC, USDT, THB
- **ค่าธรรมเนียม**: ระบบคำนวณค่าธรรมเนียมอัตโนมัติ

#### 💼 การจัดการยอดเงิน (Balance Management)
- **การตรวจสอบยอดเงิน**: Real-time Balance Display
- **การอัปเดตยอดเงิน**: อัตโนมัติทันทีหลังการทำธุรกรรม
- **Multi-Currency Support**: รองรับหลายสกุลเงินพร้อมกัน
- **การแสดงผล**: แสดงยอดเงินแยกตามสกุลเงิน

### 📊 ระบบการทำธุรกรรม (Transaction System)

#### 📈 Transaction History (ประวัติการทำรายการ)
- **การบันทึกธุรกรรม**: บันทึกทุกการทำรายการพร้อม Timestamp
- **การจัดหมวดหมู่**: แยกประเภทตาม Deposit, Withdrawal, Transfer
- **การค้นหา**: ระบบค้นหาประวัติตามวันที่และประเภท
- **การส่งออกข้อมูล**: Export ประวัติเป็น PDF/Excel

#### 🔐 Transaction Security (ความปลอดภัยธุรกรรม)
- **การยืนยันตัวตน**: Multi-factor Authentication
- **การเข้ารหัส**: End-to-end Encryption สำหรับข้อมูลสำคัญ
- **การตรวจสอบ**: Real-time Fraud Detection
- **การสำรองข้อมูล**: Backup และ Recovery System

---

## <a id="gamification"></a>🎮 ระบบ Gamification และรางวัล

### 🏆 Achievement System (ระบบความสำเร็จ)

**จำนวนความสำเร็จ**: 15+ Achievements ที่หลากหลาย

**ประเภทความสำเร็จ**:
- 💰 **First Deposit Achievement** - การฝากเงินครั้งแรก
- 🎯 **Trading Milestones** - เป้าหมายการเทรด
- 📈 **VIP Level Achievements** - การเลื่อนระดับ VIP
- 🔄 **Transaction Volume** - ปริมาณการทำธุรกรรม
- ⏰ **Login Streak** - การเข้าสู่ระบบต่อเนื่อง

### 👑 VIP Program (โปรแกรม VIP)

**ระดับ VIP**: 3 ระดับหลัก

| ระดับ | ชื่อ | สิทธิประโยชน์ |
|-------|------|---------------|
| 🥈 | **Silver VIP** | สำหรับผู้ใช้ระดับกลาง |
| 🥇 | **Gold VIP** | สำหรับผู้ใช้ระดับสูง |
| 💎 | **Diamond VIP** | สำหรับผู้ใช้ระดับพรีเมียม |

**สิทธิประโยชน์**:
- ✨ ลดค่าธรรมเนียมการทำธุรกรรม
- 🎧 การสนับสนุนลูกค้าแบบพิเศษ
- 🎁 โบนัสและรางวัลพิเศษ
- 🔓 การเข้าถึงฟีเจอร์เฉพาะ VIP

### 🎁 Point System (ระบบคะแนน)
- **การสะสมคะแนน**: จากการทำธุรกรรมและกิจกรรมต่างๆ
- **การใช้คะแนน**: แลกรางวัล, ลดค่าธรรมเนียม, โบนัส
- **คะแนนพิเศษ**: Event และ Promotion พิเศษ
- **การหมดอายุ**: ระบบการหมดอายุของคะแนนอย่างยุติธรรม

### 🎯 Loyalty Program (โปรแกรมสะสมแต้ม)
- **ระบบสะสมแต้มระยะยาว**: สำหรับผู้ใช้ที่ใช้งานต่อเนื่อง
- **โบนัสรายเดือน**: สำหรับผู้ใช้ที่ใช้งานสม่ำเสมอ
- **Event พิเศษ**: งานส่งเสริมการขายและกิจกรรมพิเศษ

---

## <a id="market-data"></a>📈 ระบบ Market Data และการลงทุน

### 💹 Real-time Market Data

**Cryptocurrency ที่รองรับ**: 9 คู่เทรดหลัก

| สัญลักษณ์ | ชื่อ | คู่เทรด |
|----------|-----|---------|
| BTC | Bitcoin | BTC/USDT |
| ETH | Ethereum | ETH/USDT |
| BNB | Binance Coin | BNB/USDT |
| ADA | Cardano | ADA/USDT |
| DOT | Polkadot | DOT/USDT |
| XRP | Ripple | XRP/USDT |
| SOL | Solana | SOL/USDT |
| DOGE | Dogecoin | DOGE/USDT |
| MATIC | Polygon | MATIC/USDT |

### 📊 Market Dashboard Features
- **📈 Top Gainers/Losers**: อันดับสกุลเงินที่ขึ้น/ลงมากที่สุด
- **📉 Market Trends**: แนวโน้มตลาดแบบ Real-time
- **📊 Price Charts**: กราฟแท่งเทียนแบบ Candlestick
- **⏱️ Multiple Timeframes**: 1m, 5m, 15m, 1h, 4h, 1d
- **📋 Technical Indicators**: ตัวชี้วัดทางเทคนิค

### 🔔 Price Alert System
- **🎯 Custom Price Alerts**: การตั้งการแจ้งเตือนราคาตามต้องการ
- **📱 Price Movement Notifications**: แจ้งเตือนการเคลื่อนไหวของราคา
- **🎚️ Threshold Alerts**: การแจ้งเตือนเมื่อถึงราคาเป้าหมาย

---

## <a id="telegram-bot"></a>🤖 ระบบ Telegram Bot

### 💬 Core Bot Functionality
- **🌐 Multi-language Support**: 6 ภาษา (ไทย, อังกฤษ, จีน, เขมร, เกาหลี, อินโดนีเซีย)
- **⌨️ Inline Keyboard Navigation**: ระบบนำทางแบบปุ่มอินไลน์
- **✏️ EditMessageText UX**: ประสบการณ์ผู้ใช้แบบ Smooth
- **🛠️ Error Handling**: การจัดการข้อผิดพลาดอย่างครอบคลุม
- **🔗 Service Binding**: เชื่อมต่อกับ 5 Workers อย่างสมบูรณ์

### 📱 Bot Commands

| คำสั่ง | คำอธิบาย |
|--------|-----------|
| `/start` | เริ่มต้นใช้งาน |
| `/balance` | ตรวจสอบยอดเงิน |
| `/send` | โอน USDT |
| `/history` | ประวัติการทำรายการ |
| `/deposit` | ฝากเงิน THB |
| `/withdraw` | ถอน USDT |
| `/settings` | ตั้งค่า |
| `/help` | ช่วยเหลือ |
| `/market` | ข้อมูลตลาด |
| `/vip` | สถานะ VIP |

### 🔄 Real-time Synchronization
- **⚡ Dashboard-Bot Sync**: การซิงค์ข้อมูลแบบ Real-time
- **🔌 WebSocket Integration**: การเชื่อมต่อแบบ WebSocket
- **📱 Cross-platform Notifications**: การแจ้งเตือนข้ามแพลตฟอร์ม
- **📺 Live Updates**: การอัปเดตข้อมูลแบบสด

### 🎮 Interactive Features
- **🗂️ Menu Flow Management**: การจัดการเมนูแบบ Flow
- **🔄 Callback Query Handling**: การจัดการ Callback อย่างมีประสิทธิภาพ
- **🎯 Context-aware Help**: ความช่วยเหลือตามบริบท
- **👤 User Guidance System**: ระบบแนะนำผู้ใช้

---

## <a id="dashboard"></a>🖥️ ระบบ Dashboard และ Web Application

### 📱 Progressive Web App (PWA)
- **📐 Responsive Design**: รองรับทุกอุปกรณ์ (Mobile, Tablet, Desktop)
- **📴 Offline Capability**: สามารถใช้งานได้แม้ไม่มีอินเทอร์เน็ต
- **📲 App-like Experience**: ประสบการณ์เหมือนแอปพลิเคชัน
- **⚡ Fast Loading**: โหลดเร็วด้วยเทคโนโลยี Service Worker

### 🎨 Enhanced Dashboard Features
- **📊 Real-time Activity Feed**: ฟีดกิจกรรมแบบเรียลไทม์
- **🔋 System Health Monitor**: ระบบตรวจสอบสุขภาพระบบ
- **🔲 Advanced Feature Grid**: กริดฟีเจอร์ขั้นสูง

**ฟีเจอร์ในกริด**:
- 📊 **Analytics Dashboard** - แดชบอร์ดการวิเคราะห์
- 💱 **Trading Interface** - ส่วนติดต่อการซื้อขาย
- 🏦 **DeFi Integration** - การเชื่อมต่อ DeFi
- 🔒 **Staking Platform** - แพลตฟอร์มการสเตค
- 🎨 **NFT Marketplace** - ตลาดซื้อขาย NFT
- 🤖 **AI Assistant** - ผู้ช่วย AI

### 🔗 Bot Integration Controls
- **🤖 Telegram Bot Sync**: การซิงค์ข้อมูลกับ Telegram Bot
- **🔄 Real-time Synchronization**: การซิงค์แบบเรียลไทม์
- **📱 Cross-platform Notifications**: การแจ้งเตือนข้ามแพลตฟอร์ม
- **🎮 Direct Bot Interaction**: การควบคุม Bot จาก Dashboard

### ⚡ Real-time Features
- **📺 Live Activity Updates**: อัปเดตกิจกรรมแบบสด
- **🔌 WebSocket Connections**: การเชื่อมต่อ WebSocket
- **⚡ Instant Notifications**: การแจ้งเตือนทันที
- **📊 System Monitoring**: การตรวจสอบระบบแบบเรียลไทม์

---

## <a id="support"></a>🎫 ระบบ Customer Support

### 📞 Multi-channel Support

**🎫 Ticket System**: ระบบตั๋วการสนับสนุน 4 ระดับความสำคัญ

| ระดับ | สี | ความสำคัญ | เวลาตอบสนอง |
|-------|-----|------------|--------------|
| 🔴 | Critical | วิกฤต | < 15 นาที |
| 🟠 | High | สูง | < 1 ชั่วโมง |
| 🟡 | Medium | กลาง | < 4 ชั่วโมง |
| 🟢 | Low | ต่ำ | < 24 ชั่วโมง |

**ช่องทางการสนับสนุน**:
- 💬 **Live Chat**: แชทสดแบบเรียลไทม์
- ❓ **FAQ Database**: ฐานข้อมูล FAQ แบบ 2 ภาษา
- 🔗 **Multi-channel Integration**: ผสานระบบ Telegram, Email, Phone

### 🤖 AI-Powered Support
- **🤖 Automated Responses**: การตอบกลับอัตโนมัติ
- **🎯 Smart Routing**: การส่งต่อคำขออย่างชาญฉลาด
- **🧠 Context Awareness**: การเข้าใจบริบทของปัญหา
- **🕐 24/7 Availability**: บริการตลอด 24 ชั่วโมง

---

## <a id="notifications"></a>🔔 ระบบการแจ้งเตือน (Smart Notification System)

### 📢 ประเภทการแจ้งเตือน

| ประเภท | ไอคอน | คำอธิบาย |
|--------|-------|-----------|
| **Price Alerts** | 💰 | การแจ้งเตือนการเคลื่อนไหวของราคา |
| **Security Alerts** | 🔒 | การแจ้งเตือนความปลอดภัยและกิจกรรมผิดปกติ |
| **Transaction Alerts** | 💸 | การแจ้งเตือนธุรกรรม (ฝาก, ถอน, โอน) |
| **VIP Updates** | 👑 | การแจ้งเตือนการเปลี่ยนแปลงสถานะและสิทธิประโยชน์ |
| **Achievement Notifications** | 🏆 | การแจ้งเตือนรางวัลและความสำเร็จ |

### 📱 Notification Channels
- **📲 In-App Notifications**: การแจ้งเตือนในแอป
- **🤖 Telegram Notifications**: การแจ้งเตือนผ่าน Telegram
- **📧 Email Notifications**: การแจ้งเตือนผ่านอีเมล
- **📱 SMS Notifications**: การแจ้งเตือนผ่าน SMS (สำหรับรายการสำคัญ)

---

## <a id="multi-language"></a>🌐 ระบบภาษาหลายภาษา (Multi-language Support)

### 🗣️ ภาษาที่รองรับ

| ธง | ภาษา | สถานะ | ความครอบคลุม |
|----|------|-------|---------------|
| 🇹🇭 | **ภาษาไทย** | ภาษาหลัก | 100% |
| 🇺🇸 | **English** | ภาษาอังกฤษ | 100% |
| 🇨🇳 | **中文** | ภาษาจีน | 95% |
| 🇰🇭 | **ខ្មែរ** | ภาษาเขมร | 90% |
| 🇰🇷 | **한국어** | ภาษาเกาหลี | 85% |
| 🇮🇩 | **Bahasa Indonesia** | ภาษาอินโดนีเซีย | 85% |

### 🔄 Dynamic Translation Features
- **⚡ Real-time Language Switching**: การเปลี่ยนภาษาแบบเรียลไทม์
- **🌍 Localized Content**: การปรับเนื้อหาตามวัฒนธรรม
- **💰 Currency Localization**: การแสดงสกุลเงินตามท้องถิ่น
- **📅 Date/Time Localization**: การแสดงวันที่และเวลาตามภูมิภาค

---

## <a id="security"></a>🛡️ ระบบความปลอดภัย (Security System)

### 🔒 Authentication & Authorization

**ระดับการรักษาความปลอดภัย**:

| ระดับ | ฟีเจอร์ | คำอธิบาย |
|-------|---------|-----------|
| **Level 1** | **Multi-factor Authentication (MFA)** | การยืนยันตัวตนหลายขั้นตอน |
| **Level 2** | **JWT Token Management** | การจัดการ Token แบบ JSON Web Token |
| **Level 3** | **Session Management** | การจัดการ Session ของผู้ใช้ |
| **Level 4** | **Role-based Access Control** | การควบคุมการเข้าถึงตามบทบาท |

### 🛡️ Input Validation & Protection
- **🚫 XSS Protection**: การป้องกัน Cross-site Scripting
- **💉 SQL Injection Prevention**: การป้องกัน SQL Injection
- **🔐 CSRF Protection**: การป้องกัน Cross-site Request Forgery
- **⏱️ Rate Limiting**: การจำกัดอัตราการเรียกใช้ API

### 📷 OCR Security Features

**การตรวจสอบเอกสาร**:
- **🧾 Bank Slip Verification**: การตรวจสอบสลิปธนาคารด้วย OCR
- **📄 Document Authentication**: การยืนยันเอกสารด้วย AI
- **🔄 Multi-provider OCR**: รองรับหลายผู้ให้บริการ OCR

**ผู้ให้บริการ OCR**:
- 🔍 **Google Vision API**
- 🔵 **Azure OCR**
- 🟠 **AWS Textract**

### 🔐 Data Protection
- **🔒 End-to-end Encryption**: การเข้ารหัสข้อมูลแบบครบวงจร
- **🔑 Secure Key Management**: การจัดการคีย์ความปลอดภัย
- **🎭 Data Anonymization**: การทำให้ข้อมูลไม่สามารถระบุตัวตนได้
- **💾 Backup & Recovery**: ระบบสำรองและกู้คืนข้อมูล

---

## 🚀 การติดตั้ง

### 1. Clone Repository

```bash
git clone https://github.com/Chaiya88/doglc-digital-wallet.git
cd doglc-digital-wallet
```

### 2. ติดตั้ง Dependencies

```bash
npm install
```

### 3. ตั้งค่า Environment Variables

```bash
cp .env.example .env
# แก้ไขไฟล์ .env ด้วยข้อมูลของคุณ
```

### 4. สร้าง Telegram Bot

1. พูดคุยกับ [@BotFather](https://t.me/botfather) ใน Telegram
2. สร้าง Bot ใหม่ด้วยคำสั่ง `/newbot`
3. คัดลอก Bot Token มาใส่ในไฟล์ `.env`

### 5. ติดตั้ง Cloudflare CLI

```bash
npm install -g wrangler
wrangler login
```

## 🛠️ Development

### รัน Bot ในโหมด Development

```bash
npm run dev
```

### Deploy ไปยัง Staging

```bash
npm run deploy
```

### Deploy ไปยัง Production

```bash
npm run deploy -- --prod
```

## 📁 โครงสร้างโปรเจ็กต์

```
doglc-digital-wallet/
├── src/
│   ├── index.js              # Entry point
│   ├── handlers/             # Command handlers
│   │   ├── start.js
│   │   ├── wallet.js
│   │   └── help.js
│   ├── locales/              # Language files
│   │   └── th.js
│   └── utils/                # Utility functions
│       └── helpers.js
├── scripts/
│   └── deploy.js             # Deploy script
├── wrangler.toml             # Cloudflare config
├── package.json
└── README.md
```

## 🔧 Configuration

### Environment Variables (.env)

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
WEBHOOK_URL=https://your-worker.workers.dev
```

### Cloudflare Workers Configuration (wrangler.toml)

```toml
name = "doglc-digital-wallet"
main = "src/index.js"
compatibility_date = "2024-03-29"
```

## 🎯 คำสั่งที่รองรับ

- `/start` - เริ่มต้นใช้งาน
- `/wallet` - ดูข้อมูลกระเป๋าเงิน
- `/balance` - ตรวจสอบยอดเงิน
- `/send` - ส่งเงิน
- `/receive` - รับเงิน
- `/history` - ประวัติการทำรายการ
- `/help` - ดูคำสั่งทั้งหมด

## 🔐 Security Features

- Rate limiting
- Input sanitization
- Secure token handling
- Environment variable protection

## 📊 Tech Stack

- **Runtime**: Cloudflare Workers
- **Bot Framework**: Telegraf.js
- **Language**: JavaScript (ES6+)
- **Storage**: Cloudflare KV (optional)
- **Deployment**: Wrangler CLI

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

หากมีปัญหาหรือต้องการความช่วยเหลือ สามารถติดต่อได้ที่:
- 📧 Email: support@doglcdigital.com
- 💬 Telegram: [@doglcdigital](https://t.me/doglcdigital)

---

Made with ❤️ by [Doglc Digital](https://doglcdigital.com)
