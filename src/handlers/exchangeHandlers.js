/**
 * Exchange Rate and Calculation Handlers
 * Provides real-time rate display and conversion calculators
 */

import { getExchangeRateDisplay, convertTHBtoUSDT, convertUSDTtoTHB, getDepositCalculation, getWithdrawCalculation } from '../utils/exchangeRate.js';

/**
 * Display current exchange rates
 */
export async function handleExchangeRateView(ctx, env, messages) {
  try {
    const rateDisplay = getExchangeRateDisplay();
    
    const keyboard = {
      inline_keyboard: [
        [
          { text: '💱 คำนวณ THB → USDT', callback_data: 'calc_thb_to_usdt' },
          { text: '💱 คำนวณ USDT → THB', callback_data: 'calc_usdt_to_thb' }
        ],
        [
          { text: '💵 ฝาก THB', callback_data: 'deposit_thb' },
          { text: '💎 ถอน USDT', callback_data: 'withdraw_usdt' }
        ],
        [
          { text: '🔄 รีเฟรช / Refresh', callback_data: 'view_exchange_rate' }
        ],
        [
          { text: '🔙 กลับเมนูหลัก', callback_data: 'main_menu' }
        ]
      ]
    };

    await ctx.reply(rateDisplay, {
      reply_markup: keyboard,
      parse_mode: 'HTML'
    });

  } catch (error) {
    console.error('Exchange rate view error:', error);
    await ctx.reply(messages?.errorOccurred || 'เกิดข้อผิดพลาด');
  }
}

/**
 * Calculation menu for conversions
 */
export async function handleCalculationMenu(ctx, env, messages) {
  try {
    const calculatorMessage = `
🧮 <b>เครื่องมือคำนวณ</b>

💡 <b>เลือกประเภทการคำนวณ:</b>

🔸 <b>THB → USDT:</b>
  คำนวณจำนวน USDT ที่จะได้รับ
  จากการฝากเงินบาท

🔸 <b>USDT → THB:</b>
  คำนวณมูลค่าบาท
  จากจำนวน USDT ที่มี

🔸 <b>ค่าธรรมเนียม:</b>
  คำนวณค่าธรรมเนียมตาม VIP

📌 <b>หมายเหตุ:</b>
• การคำนวณใช้อัตราแลกเปลี่ยนปัจจุบัน
• ค่าธรรมเนียมแตกต่างตามระดับ VIP
• ผลลัพธ์เป็นการประมาณการ
    `;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '💵→💎 THB to USDT', callback_data: 'calc_thb_to_usdt' }
        ],
        [
          { text: '💎→💵 USDT to THB', callback_data: 'calc_usdt_to_thb' }
        ],
        [
          { text: '📊 ค่าธรรมเนียม VIP', callback_data: 'calc_vip_fees' }
        ],
        [
          { text: '🔄 อัตราแลกเปลี่ยน', callback_data: 'view_exchange_rate' }
        ],
        [
          { text: '🔙 กลับเมนูหลัก', callback_data: 'main_menu' }
        ]
      ]
    };

    await ctx.reply(calculatorMessage, {
      reply_markup: keyboard,
      parse_mode: 'HTML'
    });

  } catch (error) {
    console.error('Calculation menu error:', error);
    await ctx.reply(messages?.errorOccurred || 'เกิดข้อผิดพลาด');
  }
}

/**
 * Handle bank account display
 */
export async function handleBankAccounts(ctx, env, messages) {
  try {
    const bankAccountsMessage = `
🏦 <b>บัญชีธนาคารสำหรับฝากเงิน</b>

💳 <b>กสิกรไทย (KBANK)</b>
• เลขบัญชี: <code>123-4-56789-0</code>
• ชื่อบัญชี: DOGLC DIGITAL WALLET
• สาขา: สีลม

💳 <b>ไทยพาณิชย์ (SCB)</b>
• เลขบัญชี: <code>234-5-67890-1</code>
• ชื่อบัญชี: DOGLC DIGITAL WALLET
• สาขา: สยาม

💳 <b>กรุงเทพ (BBL)</b>
• เลขบัญชี: <code>345-6-78901-2</code>
• ชื่อบัญชี: DOGLC DIGITAL WALLET
• สาขา: อโศก

⚠️ <b>ข้อสำคัญ:</b>
• โอนเข้าบัญชีใดก็ได้
• ระบุหมายเหตุ: User ID ${ctx.from.id}
• ถ่ายรูปสลิปส่งมาที่บอท
• ระบบตรวจสอบ 5-30 นาที

🔒 <b>ความปลอดภัย:</b>
• บัญชีได้รับการยืนยันจากธนาคาร
• ระบบ OCR ตรวจสอบสลิปอัตโนมัติ
• เก็บประวัติทุกรายการ
    `;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '📸 อัพโหลดสลิป', callback_data: 'upload_slip' }
        ],
        [
          { text: '💱 คำนวณยอดฝาก', callback_data: 'calc_thb_to_usdt' }
        ],
        [
          { text: '📋 คัดลอกเลขบัญชี KBANK', callback_data: 'copy_kbank' },
        ],
        [
          { text: '📋 คัดลอกเลขบัญชี SCB', callback_data: 'copy_scb' },
        ],
        [
          { text: '📋 คัดลอกเลขบัญชี BBL', callback_data: 'copy_bbl' },
        ],
        [
          { text: '🔙 กลับการฝาก', callback_data: 'deposit_thb' }
        ]
      ]
    };

    await ctx.reply(bankAccountsMessage, {
      reply_markup: keyboard,
      parse_mode: 'HTML'
    });

  } catch (error) {
    console.error('Bank accounts error:', error);
    await ctx.reply(messages?.errorOccurred || 'เกิดข้อผิดพลาด');
  }
}

/**
 * Handle slip upload process
 */
export async function handleSlipUpload(ctx, env, messages) {
  try {
    const uploadMessage = `
📸 <b>อัพโหลดสลิปการโอนเงิน</b>

📋 <b>วิธีการ:</b>
1. ถ่ายรูปสลิปการโอนให้ชัด
2. ส่งรูปมาที่แชทนี้
3. รอระบบ OCR ตรวจสอบ
4. รับ USDT เข้ากระเป๋าอัตโนมัติ

✅ <b>ข้อมูลที่ต้องชัดเจน:</b>
• จำนวนเงินที่โอน
• วันที่และเวลา
• เลขบัญชีปลายทาง
• หมายเหตุ (User ID: ${ctx.from.id})

⏱️ <b>เวลาประมวลผล:</b>
• ระบบ OCR: 30 วินาที - 5 นาที
• การยืนยัน: 5-30 นาที
• เข้า USDT: ทันทีหลังยืนยัน

🔒 <b>ความปลอดภัย:</b>
• ระบบเข้ารหัสข้อมูล
• ตรวจสอบด้วย AI
• ยืนยันด้วยคน (หากจำเป็น)

💡 <b>เคล็ดลับ:</b>
• ถ่ายในที่มีแสงเพียงพอ
• ห้ามสั่นมือขณะถ่าย
• ตรวจสอบความชัดก่อนส่ง
    `;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '🏦 ดูบัญชีธนาคาร', callback_data: 'deposit_bank_accounts' }
        ],
        [
          { text: '📊 ประวัติการฝาก', callback_data: 'deposit_history' }
        ],
        [
          { text: '❓ วิธีถ่ายรูปสลิป', callback_data: 'slip_photo_guide' }
        ],
        [
          { text: '🔙 กลับการฝาก', callback_data: 'deposit_thb' }
        ]
      ]
    };

    await ctx.reply(uploadMessage, {
      reply_markup: keyboard,
      parse_mode: 'HTML'
    });

    // Set user state for slip upload
    // In production, save this state to database
    console.log(`User ${ctx.from.id} is ready for slip upload`);

  } catch (error) {
    console.error('Slip upload error:', error);
    await ctx.reply(messages?.errorOccurred || 'เกิดข้อผิดพลาด');
  }
}