/**
 * Thai language messages for DOGLC Digital Wallet
 * Enhanced with banking operations and security features
 */

export const messages = {
  // Basic commands
  welcome: `🎉 <b>ยินดีต้อนรับสู่ DOGLC Digital Wallet</b>

� กระเป๋าเงินดิจิทัลครบครันที่รองรับ:
• 💸 ฝาก-ถอน THB และ USDT
• 🔒 ระบบรักษาความปลอดภัยขั้นสูง
• 🌍 รองรับ 6 ภาษา
• ⚡ ประมวลผลรวดเร็ว 24/7

� เริ่มใช้งานได้ทันที!`,

  mainMenu: `📋 <b>เมนูหลัก</b>

เลือกบริการที่ต้องการ:`,

  // Wallet operations
  walletTitle: '💳 กระเป๋าเงิน',
  walletInfo: '💳 ข้อมูลกระเป๋าเงินของคุณ',
  currentBalance: '💰 ยอดเงินคงเหลือ: {amount} บาท',
  noWallet: '❌ คุณยังไม่มีกระเป๋าเงิน\nพิมพ์ /create เพื่อสร้างกระเป๋าเงินใหม่',
  createWallet: '✅ สร้างกระเป๋าเงินสำเร็จ!\n🔐 ที่อยู่กระเป๋า: {address}',
  
  // Enhanced deposit messages
  depositTitle: 'ฝากเงิน',
  depositTHB: 'ฝากเงิน THB',
  depositUSDT: 'ฝาก USDT',
  depositInstructions: `� <b>วิธีการฝากเงิน</b>

📋 <b>ขั้นตอน:</b>
1. เลือกจำนวนเงินที่ต้องการฝาก
2. โอนเงินไปยังบัญชีที่ระบุ
3. ส่งสลิปโอนเงินเพื่อยืนยัน
4. รอการยืนยันภายใน 5-30 นาที

💡 <b>เคล็ดลับ:</b> ถ่ายสลิปให้ชัดเจนเพื่อความรวดเร็ว`,

  // Enhanced withdrawal messages
  withdrawTitle: 'ถอนเงิน',
  withdrawUSDT: 'ถอน USDT',
  withdrawTHB: 'ถอน THB',
  withdrawInstructions: `💸 <b>วิธีการถอนเงิน</b>

📋 <b>ขั้นตอน:</b>
1. ระบุที่อยู่ปลายทาง
2. เลือกจำนวนที่ต้องการถอน
3. ยืนยันการทำรายการ
4. รอรับเงินภายใน 10-30 นาที

⚠️ <b>หมายเหตุ:</b> ตรวจสอบที่อยู่ให้ถูกต้อง`,

  // Transaction messages
  transferTitle: 'โอนเงิน',
  historyTitle: 'ประวัติ',
  sendMoney: '📤 ส่งเงิน',
  receiveMoney: '📥 รับเงิน',
  transactionSuccess: '✅ ทำรายการสำเร็จ!',
  transactionFailed: '❌ ทำรายการไม่สำเร็จ',
  transactionPending: '⏳ รายการอยู่ระหว่างดำเนินการ',
  transactionCompleted: '✅ รายการสำเร็จ',
  
  // Enhanced help messages
  helpTitle: '❓ ช่วยเหลือ',
  helpCommands: `📋 <b>คำสั่งที่มี:</b>
/start - เริ่มใช้งาน
/wallet - เปิดกระเป๋าเงิน
/balance - ดูยอดเงิน
/help - ความช่วยเหลือ

💡 <b>การใช้งาน:</b>
• คลิกปุ่มเพื่อเข้าถึงฟีเจอร์
• ส่งสลิปเป็นรูปภาพหรือไฟล์
• ระบบประมวลผลอัตโนมัติ`,

  // Error messages
  errorOccurred: '❌ เกิดข้อผิดพลาด กรุณาลองใหม่',
  unknownCommand: '❓ ไม่เข้าใจคำสั่ง กรุณาใช้เมนูด้านล่าง',
  rateLimitExceeded: '⏰ ใช้งานบ่อยเกินไป กรุณารอสักครู่',
  
  // Enhanced security messages
  securityWarning: `� <b>ความปลอดภัย:</b>
• อย่าแชร์ข้อมูลส่วนตัว
• ตรวจสอบที่อยู่ก่อนโอนเงิน
• แจ้งทันทีหากพบความผิดปกติ`,

  // Language support
  languageChanged: '✅ เปลี่ยนภาษาเรียบร้อย',
  selectLanguage: '🌐 เลือกภาษา',

  // Banking operations
  bankAccountInfo: `🏦 <b>ข้อมูลบัญชีรับเงิน</b>

🏛️ ธนาคาร: กสิกรไทย (KBank)
💳 เลขบัญชี: 123-4-56789-0
👤 ชื่อบัญชี: DOGLC Digital Wallet Co., Ltd.`,

  depositAmountSelection: '💰 เลือกจำนวนเงินที่ต้องการฝาก:',
  customAmount: 'จำนวนอื่น',
  
  // Slip verification
  slipUploadInstructions: `📸 <b>ส่งสลิปโอนเงิน</b>

กรุณาส่งสลิปโอนเงินในรูปแบบ:
• 📱 รูปภาพ (JPG, PNG)
• 📄 ไฟล์ PDF

✅ <b>ข้อกำหนด:</b>
• รูปชัดเจน เห็นจำนวนเงิน
• แสดงวันที่-เวลาทำรายการ
• ขนาดไม่เกิน 20MB`,

  slipProcessing: '🔄 กำลังประมวลผลสลิป...',
  slipVerified: '✅ ยืนยันสลิปสำเร็จ! ยอดเงินจะเข้าภายใน 5-10 นาที',
  slipVerificationFailed: `❌ ไม่สามารถยืนยันสลิปได้

🔍 สาเหตุที่เป็นไปได้:
• จำนวนเงินไม่ตรงกัน
• รูปภาพไม่ชัดเจน
• ข้อมูลไม่ครบถ้วน

📞 กรุณาติดต่อฝ่ายสนับสนุน`,

  // Cryptocurrency
  cryptoAddress: 'ที่อยู่กระเป๋าเงิน',
  invalidAddress: '❌ ที่อยู่ไม่ถูกต้อง',
  addressRequired: 'กรุณาระบุที่อยู่ปลายทาง',
  
  // Amounts and fees
  minimumAmount: 'จำนวนขั้นต่ำ',
  maximumAmount: 'จำนวนสูงสุด',
  transactionFee: 'ค่าธรรมเนียม',
  totalAmount: 'จำนวนรวม',
  netAmount: 'จำนวนสุทธิ',

  // Time and dates
  processingTime: 'เวลาดำเนินการ',
  estimatedTime: 'เวลาโดยประมาณ',
  
  // Status messages
  pending: 'รอดำเนินการ',
  processing: '⏳ กำลังดำเนินการ...',
  completed: 'สำเร็จ',
  failed: 'ไม่สำเร็จ',
  cancelled: 'ยกเลิก',
  pleaseWait: '⏳ กรุณารอสักครู่...',

  // File upload
  unexpectedPhoto: '📸 กรุณาใช้เมนูฝากเงินก่อนส่งรูปภาพ',
  unexpectedDocument: '📄 กรุณาใช้เมนูฝากเงินก่อนส่งเอกสาร',
  invalidFileType: '❌ ประเภทไฟล์ไม่ถูกต้อง (รองรับเฉพาะรูปภาพ)',
  fileTooLarge: '❌ ไฟล์ใหญ่เกินไป (ขนาดสูงสุด 20MB)',

  // Navigation
  backToMenu: '🔙 กลับเมนูหลัก',
  backToWallet: '🔙 กลับกระเป๋าเงิน',
  cancel: 'ยกเลิก',
  confirm: 'ยืนยัน',
  
  // Support
  contactSupport: '📞 ติดต่อฝ่ายสนับสนุน',
  supportHours: 'เวลาทำการ: 24/7',
  
  // VIP System
  vipLevel: 'ระดับ VIP',
  vipBenefits: 'สิทธิประโยชน์ VIP',
  upgadeVIP: 'อัพเกรด VIP',

  // Security
  twoFactorAuth: 'การยืนยันตัวตน 2 ขั้นตอน',
  securitySettings: 'ตั้งค่าความปลอดภัย',
  loginAlert: 'แจ้งเตือนการเข้าใช้งาน',

  // Analytics
  transactionHistory: 'ประวัติรายการ',
  dailyLimit: 'วงเงินรายวัน',
  monthlyVolume: 'ยอดใช้รายเดือน',

  // Special messages
  maintenanceMode: '🔧 ระบบอยู่ระหว่างการบำรุงรักษา กรุณาลองใหม่ภายหลัง',
  systemUpgrade: '⬆️ กำลังอัพเกรดระบบ เพื่อประสิทธิภาพที่ดีขึ้น',
  thankYou: '🙏 ขอบคุณที่ใช้บริการ DOGLC Digital Wallet'
};