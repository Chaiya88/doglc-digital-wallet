# 🏦 Doglc Digital Wallet

ระบบกระเป๋าเงินดิจิทัลที่ออกแบบมาเพื่อความปลอดภัย โปร่งใส และแบ่งบทบาทผู้ใช้ชัดเจน  
รองรับการใช้งาน 3 กลุ่มหลัก คือ User, Admin และ MasterAdmin  
แต่ละกลุ่มจะมีสิทธิ์และคำสั่งเฉพาะที่สามารถเข้าถึงได้ดังนี้

---

## Command Summary

| กลุ่มผู้ใช้     | รายละเอียดคำสั่ง                                                                                  |
|----------------|---------------------------------------------------------------------------------------------------|
| User           | [คำสั่งสำหรับ User](docs/commands_user.md) - ฝาก-ถอน ดูยอดเงิน ตั้งค่าข้อมูลส่วนตัว ฯลฯ           |
| Admin          | [คำสั่งสำหรับ Admin](docs/commands_admin.md) - อนุมัติธุรกรรม จัดการ user ตั้งค่าระบบ ฯลฯ         |
| MasterAdmin    | [คำสั่งสำหรับ MasterAdmin](docs/commands_masteradmin.md) - จัดการ admin สำรอง/กู้คืน ดู log ฯลฯ    |

---

## แนวทางการใช้งาน

1. **ศึกษาสิทธิ์ของบทบาทตนเอง**  
   ตรวจสอบว่าท่านมีสิทธิ์ในกลุ่มไหน และศึกษาคำสั่งที่เกี่ยวข้องเท่านั้น

2. **ปฏิบัติตามขั้นตอนอย่างถูกต้อง**  
   ใช้คำสั่งตามรูปแบบที่กำหนดในแต่ละไฟล์ markdown

3. **ติดต่อแอดมินเมื่อพบปัญหา**  
   ใช้ `/contactadmin` หรือช่องทางที่แอปกำหนด

---

## หมายเหตุ

- ทุกคำสั่งธุรกรรมหรือการเปลี่ยนแปลงจะถูก log เพื่อความโปร่งใส
- การใช้งานผิดวัตถุประสงค์หรือผิดนโยบาย อาจถูกระงับบัญชีหรือแจ้งเตือน
- ข้อมูลเพิ่มเติมเกี่ยวกับการติดตั้ง การใช้งาน หรือรายละเอียด API สามารถดูได้ในไฟล์คู่มือที่แนบใน repo

---

**Copyright © 2025 Doglc Digital Wallet**

---

## 🎉 Production Ready - ระบบพร้อมใช้งาน!

**Status:** ✅ OPERATIONAL | **Health:** 3/4 services | **Version:** 2.1-security-enhanced

🤖 **Bot URL:** https://doglc-digital-wallet-production.jameharu-no1.workers.dev  
🔧 **Orchestrator:** https://doglc-digital-wallet-orchestrator-production.jameharu-no1.workers.dev

## ⚡ Quick Start - เริ่มใช้งานเร็ว

### 1️⃣ Setup Telegram Webhook (Windows)
```powershell
# Run this command in PowerShell
.\setup-telegram-webhook.ps1
```

### 2️⃣ Setup Telegram Webhook (Node.js)
```bash
# Set your bot token (get from @BotFather)
export TELEGRAM_BOT_TOKEN="your_bot_token_here"

# Run setup script
node setup-telegram-webhook.js
```

### 3️⃣ Manual Setup (curl)
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url":"https://doglc-digital-wallet-production.jameharu-no1.workers.dev","max_connections":100}'
```

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

## 📋 Project Management

### GitHub Projects v2 Board: merge-doglc-into-logic-workspace

This repository is part of a larger initiative to merge the best features from both `doglc-digital-wallet` and `logic-digital-wallet` repositories. We use a comprehensive project board to track progress and coordinate development efforts.

#### 🎯 Project Overview
- **Main Issue**: [logic-digital-wallet#4](https://github.com/Chaiya88/logic-digital-wallet/issues/4) - Complete merge checklist
- **Project Board**: `merge-doglc-into-logic-workspace` (Public)
- **Workflow**: Backlog → To do → In progress → Review → Done

#### 📚 Project Documentation
- [📋 Project Board Configuration](.github/PROJECT_BOARD_CONFIG.md) - Complete board setup and structure
- [🚀 Setup Instructions](.github/SETUP_INSTRUCTIONS.md) - Step-by-step board creation guide  
- [📝 Project README](.github/PROJECT_BOARD_README.md) - Project overview and guidelines
- [🔐 Security Checklist](.github/SECURITY_CHECKLIST.md) - Security audit and migration guidelines

#### 🔄 Automated Workflow
The project board includes automated card movement based on:
- Issue state changes (opened → Backlog, assigned → To do, closed → Done)
- Pull request lifecycle (opened → In progress, review → Review, merged → Done)
- GitHub Actions integration for seamless project management

#### 🎯 Current Focus Areas
1. **Security & Secrets Management** - Sanitizing sensitive data and implementing proper secrets management
2. **Code Consolidation** - Merging source code from both repositories
3. **Configuration Management** - Combining production configs and deployment settings
4. **Documentation Integration** - Creating comprehensive guides and documentation

## 🤝 Contributing

### Development Workflow
1. **Check the Project Board** - Review current tasks and priorities
2. **Pick a Card** - Select an item from "To do" column and assign yourself
3. **Create Feature Branch** - `git checkout -b feature/AmazingFeature`
4. **Move Card to "In Progress"** - Update the project board
5. **Implement Changes** - Follow security guidelines and coding standards
6. **Create Pull Request** - Link to the corresponding project card
7. **Code Review** - Card automatically moves to "Review" column
8. **Merge and Complete** - Card moves to "Done" upon merge

### Security Guidelines
- **Never commit secrets** - Use Cloudflare Vault for sensitive data
- **Follow the security checklist** - Reference `.github/SECURITY_CHECKLIST.md`
- **Audit before committing** - Check for sensitive information in code
- **Use proper branch protection** - All changes require review

### Pull Request Strategy
Following the 5-PR approach from the main issue:
1. **PR#1: Core Structure** - Foundation files and architecture
2. **PR#2: Production Config** - Deployment and environment setup
3. **PR#3: Documentation** - README, guides, and examples  
4. **PR#4: Cleanup** - Remove duplicates and deprecated files
5. **PR#5: Security** - Secrets management and hardening

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

หากมีปัญหาหรือต้องการความช่วยเหลือ สามารถติดต่อได้ที่:
- 📧 Email: support@doglcdigital.com
- 💬 Telegram: [@doglcdigital](https://t.me/doglcdigital)

---

Made with ❤️ by [Doglc Digital](https://doglcdigital.com)
