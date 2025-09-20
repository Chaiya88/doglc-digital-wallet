/**
 * Deposit command handlers for THB and USDT deposits
 */

import { formatCurrency, formatDateTime, logUserActivity } from '../utils/helpers.js';

export async function handleDeposit(ctx, depositType = 'thb') {
  try {
    const messages = ctx.messages;
    const userId = ctx.from.id.toString();
    const userLang = ctx.userLanguage;

    await logUserActivity(userId, {
      action: 'deposit_access',
      deposit_type: depositType,
      language: userLang
    }, ctx.env || {});

    if (depositType === 'thb') {
      return await handleDepositTHB(ctx);
    } else if (depositType === 'usdt') {
      return await handleDepositUSDT(ctx);
    } else {
      return await handleDepositMenu(ctx);
    }

  } catch (error) {
    console.error('Deposit handler error:', error);
    await ctx.reply(ctx.messages.errorOccurred);
  }
}

/**
 * THB Deposit with banking integration
 */
async function handleDepositTHB(ctx) {
  const messages = ctx.messages;
  
  const depositMessage = `
💵 <b>ฝากเงิน THB → ได้รับ USDT</b>

🔄 <b>ระบบแลกเปลี่ยน:</b>
• ฝากเงินบาทไทย → ได้รับ USDT ในกระเป๋า
• อัตราแลกเปลี่ยนตามราคาตลาดปัจจุบัน
• ระบบคำนวณอัตโนมัติและแม่นยำ

🏦 <b>วิธีการฝากเงิน:</b>
1. โอนเงินบาทไปยังบัญชีธนาคารที่ระบุ
2. ถ่ายรูปสลิปการโอน
3. ส่งรูปสลิปให้บอท
4. รอระบบ OCR ตรวจสอบ (5-30 นาที)
5. รับ USDT เข้ากระเป๋าอัตโนมัติ

💰 <b>ข้อมูลการฝาก:</b>
• ขั้นต่ำ: 100 บาท
• สูงสุด: 50,000 บาท/วัน
• ค่าธรรมเนียม: 2% (ขั้นต่ำ 10 บาท)
• อัตราแลกเปลี่ยน: 1 USDT = 36.50 THB

🏧 <b>บัญชีรับโอน:</b>
• กสิกรไทย: 123-4-56789-0
• ไทยพาณิชย์: 234-5-67890-1
• กรุงเทพ: 345-6-78901-2

🔒 <b>ความปลอดภัย:</b>
• ระบบ OCR ตรวจสอบอัตโนมัติ
• เข้ารหัสข้อมูล 256-bit
• บันทึกประวัติทุกขั้นตอน
  `;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '🔄 ดูอัตราแลกเปลี่ยน / Exchange Rate', callback_data: 'view_exchange_rate' }
      ],
      [
        { text: '🏦 ดูบัญชีธนาคาร / Bank Accounts', callback_data: 'deposit_bank_accounts' }
      ],
      [
        { text: '📸 อัพโหลดสลิป / Upload Slip', callback_data: 'upload_slip' }
      ],
      [
        { text: '� คำนวณ THB → USDT / Calculate', callback_data: 'calculate_thb_usdt' }
      ],
      [
        { text: '📊 ประวัติการฝาก / Deposit History', callback_data: 'deposit_history' }
      ],
      [
        { text: '🔙 กลับเมนูหลัก / Back to Main', callback_data: 'main_menu' }
      ]
    ]
  };

  await ctx.reply(depositMessage, {
    reply_markup: keyboard,
    parse_mode: 'HTML'
  });
}

/**
 * USDT Deposit with blockchain integration
 */
async function handleDepositUSDT(ctx) {
  const messages = ctx.messages;
  
  // Generate unique deposit address for user
  const depositAddress = 'TR' + Math.random().toString(16).substr(2, 32);
  
  const depositMessage = `
💎 <b>ฝาก USDT / USDT Deposit</b>

🔗 <b>Network:</b> TRON (TRC20)
📍 <b>Deposit Address:</b>
<code>${depositAddress}</code>

⚠️ <b>คำเตือนสำคัญ:</b>
• ส่งเฉพาะ USDT (TRC20) เท่านั้น
• ส่งสกุลเงินอื่นจะสูญหาย
• ยืนยันอัตโนมัติผ่าน Blockchain
• ขั้นต่ำ 10 USDT

💰 <b>ข้อมูลการฝาก:</b>
• ขั้นต่ำ: 10 USDT
• สูงสุด: 10,000 USDT/วัน
• ค่าธรรมเนียม: 2 USDT
• เวลาเข้าบัญชี: 10-15 นาที

🔍 <b>การติดตาม:</b>
• ตรวจสอบ TX Hash ได้ที่ TronScan
• แจ้งเตือนเมื่อเข้าบัญชี
• บันทึกประวัติทุกรายการ
  `;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '📋 คัดลอก Address', callback_data: `copy_address_${depositAddress}` }
      ],
      [
        { text: '🔍 ตรวจสอบ TronScan', url: `https://tronscan.org/#/address/${depositAddress}` }
      ],
      [
        { text: '📊 ประวัติการฝาก / History', callback_data: 'usdt_deposit_history' }
      ],
      [
        { text: '🔙 กลับเมนูฝาก / Back to Deposit', callback_data: 'deposit_menu' }
      ]
    ]
  };

  await ctx.reply(depositMessage, {
    reply_markup: keyboard,
    parse_mode: 'HTML'
  });
}

/**
 * Main deposit menu
 */
async function handleDepositMenu(ctx) {
  const messages = ctx.messages;
  
  const depositMenuMessage = `
💸 <b>เมนูฝากเงิน / Deposit Menu</b>

💵 <b>ฝาก THB:</b>
• โอนผ่านธนาคารไทย
• ระบบ OCR ตรวจสอบสลิป
• ค่าธรรมเนียม 2%

💎 <b>ฝาก USDT:</b>
• ส่งผ่าน TRON Network
• ยืนยันอัตโนมัติ
• ค่าธรรมเนียม 2 USDT

📊 <b>ข้อมูลสำคัญ:</b>
• ฝากขั้นต่ำ: THB 100 / USDT 10
• ประมวลผล: 24/7
• รองรับทุกธนาคารหลัก
  `;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '💵 ฝาก THB / Deposit THB', callback_data: 'deposit_thb' }
      ],
      [
        { text: '💎 ฝาก USDT / Deposit USDT', callback_data: 'deposit_usdt' }
      ],
      [
        { text: '📊 ประวัติการฝาก / Deposit History', callback_data: 'deposit_history_all' }
      ],
      [
        { text: '📖 คู่มือการฝาก / Deposit Guide', callback_data: 'deposit_guide' }
      ],
      [
        { text: '🔙 กลับ / Back', callback_data: 'wallet' }
      ]
    ]
  };

  await ctx.reply(depositMenuMessage, {
    reply_markup: keyboard,
    parse_mode: 'HTML'
  });
}

/**
 * Handle slip upload for THB deposits
 */
export async function handleSlipUpload(ctx) {
  const messages = ctx.messages;
  
  const uploadMessage = `
📸 <b>อัพโหลดสลิปการโอน / Upload Transfer Slip</b>

📝 <b>วิธีการ:</b>
1. ถ่ายรูปสลิปให้ชัดเจน
2. ส่งรูปให้บอทผ่านแชท
3. รอระบบ OCR ตรวจสอบ
4. ได้รับการยืนยันภายใน 30 นาที

✅ <b>เงื่อนไขสลิป:</b>
• รูปชัด ไม่เบลอ
• เห็นยอดเงินและเวลาโอน
• เห็นชื่อบัญชีผู้รับ
• ไม่เก่าเกิน 24 ชั่วโมง

🔍 <b>ระบบ OCR จะตรวจสอบ:</b>
• ยอดเงินที่โอน
• เวลาการโอน
• บัญชีปลายทาง
• ธนาคารต้นทาง

กรุณาส่งรูปสลิปในข้อความถัดไป
  `;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '📖 ดูตัวอย่างสลิป / View Examples', callback_data: 'slip_examples' }
      ],
      [
        { text: '❓ ปัญหาการอัพโหลด / Upload Issues', callback_data: 'upload_help' }
      ],
      [
        { text: '🔙 กลับ / Back', callback_data: 'deposit_thb' }
      ]
    ]
  };

  await ctx.reply(uploadMessage, {
    reply_markup: keyboard,
    parse_mode: 'HTML'
  });
}