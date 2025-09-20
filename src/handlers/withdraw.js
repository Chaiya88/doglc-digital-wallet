/**
 * Withdraw command handlers for USDT and THB withdrawals
 */

import { formatCurrency, formatDateTime, logUserActivity } from '../utils/helpers.js';

export async function handleWithdraw(ctx, withdrawType = 'usdt') {
  try {
    const messages = ctx.messages;
    const userId = ctx.from.id.toString();
    const userLang = ctx.userLanguage;

    await logUserActivity(userId, {
      action: 'withdraw_access',
      withdraw_type: withdrawType,
      language: userLang
    }, ctx.env || {});

    if (withdrawType === 'usdt') {
      return await handleWithdrawUSDT(ctx);
    } else if (withdrawType === 'thb') {
      return await handleWithdrawTHB(ctx);
    } else {
      return await handleWithdrawMenu(ctx);
    }

  } catch (error) {
    console.error('Withdraw handler error:', error);
    await ctx.reply(ctx.messages.errorOccurred);
  }
}

/**
 * USDT Withdrawal to external wallet
 */
async function handleWithdrawUSDT(ctx) {
  const messages = ctx.messages;
  
  // Mock user balance
  const userBalance = {
    usdt: 42.35,
    vip_level: 'BRONZE',
    daily_withdraw_used: 100.00,
    daily_withdraw_limit: 5000.00
  };

  const withdrawMessage = `
🏧 <b>ถอน USDT จากยอดบาท</b>

💎 <b>ยอดคงเหลือ:</b> ${userBalance.usdt.toFixed(2)} USDT (≈ ${(userBalance.usdt * 36.50).toFixed(2)} THB)

🔄 <b>ระบบถอน:</b>
• ถอน USDT จากยอดที่แปลงจากบาท
• ส่งไปยัง Wallet ภายนอกได้ทันที
• รองรับ TRON Network (TRC-20)

� <b>ข้อมูลการถอน:</b>
• ขั้นต่ำ: 10 USDT
• สูงสุดต่อวัน: ${userBalance.daily_withdraw_limit} USDT
• ใช้ไปแล้ววันนี้: ${userBalance.daily_withdraw_used} USDT
• คงเหลือ: ${(userBalance.daily_withdraw_limit - userBalance.daily_withdraw_used).toFixed(2)} USDT

🏆 <b>สถานะ VIP:</b> ${userBalance.vip_level}
• ค่าธรรมเนียม: ${userBalance.vip_level === 'BRONZE' ? '1.5%' : '1.0%'}
• วงเงินถอนสูงขึ้น
• อัตราแลกเปลี่ยนดีกว่า
🔗 <b>Network:</b> TRON (TRC20)
💸 <b>ค่าธรรมเนียม:</b> 2 USDT

⚠️ <b>คำเตือน:</b>
• ตรวจสอบ Address ให้ถูกต้อง
• รองรับเฉพาะ TRON Network
• ไม่สามารถยกเลิกได้หลังยืนยัน
  `;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '📝 สร้างคำขอถอน / Create Withdrawal', callback_data: 'create_usdt_withdrawal' }
      ],
      [
        { text: '🔄 ดูอัตราแลกเปลี่ยน / Exchange Rate', callback_data: 'view_exchange_rate' }
      ],
      [
        { text: '📋 Address Book', callback_data: 'usdt_address_book' }
      ],
      [
        { text: '📊 ประวัติการถอน / Withdrawal History', callback_data: 'usdt_withdraw_history' }
      ],
      [
        { text: '🎖️ อัพเกรด VIP / Upgrade VIP', callback_data: 'vip_upgrade' }
      ],
      [
        { text: '🔙 กลับเมนูถอน / Back to Withdraw', callback_data: 'withdraw_menu' }
      ]
    ]
  };

  await ctx.reply(withdrawMessage, {
    reply_markup: keyboard,
    parse_mode: 'HTML'
  });
}

/**
 * THB Withdrawal to bank account
 */
async function handleWithdrawTHB(ctx) {
  const messages = ctx.messages;
  
  const userBalance = {
    thb: 1234.56,
    vip_level: 'BRONZE',
    daily_withdraw_used: 0,
    daily_withdraw_limit: 50000.00
  };

  const withdrawMessage = `
🏧 <b>ถอน THB / THB Withdrawal</b>

💵 <b>ยอดคงเหลือ:</b> ${formatCurrency(userBalance.thb, 'th')} บาท

🏦 <b>วิธีการถอน:</b>
• โอนไปบัญชีธนาคารไทย
• รองรับธนาคารหลักทุกแห่ง
• ประมวลผลวันจันทร์-ศุกร์

💰 <b>ขั้นต่ำ:</b> 500 บาท
💰 <b>สูงสุด:</b> 50,000 บาท/วัน
💸 <b>ค่าธรรมเนียม:</b> 25 บาท

📊 <b>วงเงินวันนี้:</b>
• ใช้แล้ว: ${formatCurrency(userBalance.daily_withdraw_used, 'th')} บาท
• คงเหลือ: ${formatCurrency(userBalance.daily_withdraw_limit - userBalance.daily_withdraw_used, 'th')} บาท

⏱️ <b>เวลาประมวลผล:</b>
• วันจันทร์-ศุกร์: 1-4 ชั่วโมง
• วันเสาร์-อาทิตย์: วันจันทร์ถัดไป

🔒 <b>ความปลอดภัย:</b>
• ยืนยันผ่าน 2FA
• ตรวจสอบข้อมูลธนาคาร
• บันทึกประวัติทุกรายการ
  `;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '📝 สร้างคำขอถอน / Create Withdrawal', callback_data: 'create_thb_withdrawal' }
      ],
      [
        { text: '🏦 บัญชีธนาคาร / Bank Accounts', callback_data: 'thb_bank_accounts' }
      ],
      [
        { text: '📊 ประวัติการถอน / Withdrawal History', callback_data: 'thb_withdraw_history' }
      ],
      [
        { text: '⚙️ ตั้งค่า 2FA / Setup 2FA', callback_data: 'setup_2fa' }
      ],
      [
        { text: '🔙 กลับเมนูถอน / Back to Withdraw', callback_data: 'withdraw_menu' }
      ]
    ]
  };

  await ctx.reply(withdrawMessage, {
    reply_markup: keyboard,
    parse_mode: 'HTML'
  });
}

/**
 * Main withdrawal menu
 */
async function handleWithdrawMenu(ctx) {
  const messages = ctx.messages;
  
  const withdrawMenuMessage = `
🏧 <b>เมนูถอนเงิน / Withdrawal Menu</b>

💎 <b>ถอน USDT:</b>
• ส่งไปยัง External Wallet
• ใช้ TRON Network (TRC20)
• ประมวลผลอัตโนมัติ

💵 <b>ถอน THB:</b>
• โอนไปบัญชีธนาคารไทย
• รองรับธนาคารหลักทุกแห่ง
• ประมวลผลในวันทำการ

📊 <b>ข้อมูลสำคัญ:</b>
• ถอนขั้นต่ำ: USDT 10 / THB 500
• ประมวลผล: 24/7 (USDT), วันทำการ (THB)
• ระบบรักษาความปลอดภัยสูง
  `;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '💎 ถอน USDT / Withdraw USDT', callback_data: 'withdraw_usdt' }
      ],
      [
        { text: '💵 ถอน THB / Withdraw THB', callback_data: 'withdraw_thb' }
      ],
      [
        { text: '📊 ประวัติการถอน / Withdrawal History', callback_data: 'withdraw_history_all' }
      ],
      [
        { text: '⚙️ ตั้งค่าการถอน / Withdrawal Settings', callback_data: 'withdraw_settings' }
      ],
      [
        { text: '🔙 กลับ / Back', callback_data: 'wallet' }
      ]
    ]
  };

  await ctx.reply(withdrawMenuMessage, {
    reply_markup: keyboard,
    parse_mode: 'HTML'
  });
}

/**
 * Handle USDT withdrawal creation
 */
export async function handleCreateUSDTWithdrawal(ctx) {
  const messages = ctx.messages;
  
  const createMessage = `
📝 <b>สร้างคำขอถอน USDT / Create USDT Withdrawal</b>

กรุณากรอกข้อมูลตามลำดับ:

1️⃣ <b>จำนวน USDT ที่ต้องการถอน</b>
   • ขั้นต่ำ: 10 USDT
   • ค่าธรรมเนียม: 2 USDT
   • พิมพ์ตัวเลขเท่านั้น (เช่น 50)

📋 <b>ตัวอย่าง:</b> <code>50</code>

กรุณาพิมพ์จำนวน USDT ที่ต้องการถอน:
  `;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '💎 ถอนทั้งหมด / Withdraw All', callback_data: 'withdraw_usdt_all' }
      ],
      [
        { text: '🔙 ยกเลิก / Cancel', callback_data: 'withdraw_usdt' }
      ]
    ]
  };

  // Set user state to expect withdrawal amount
  await setUserState(ctx.from.id, 'waiting_usdt_amount');

  await ctx.reply(createMessage, {
    reply_markup: keyboard,
    parse_mode: 'HTML'
  });
}

// Helper function to set user state (simplified)
async function setUserState(userId, state) {
  // In production, this would use KV storage
  global.userStates = global.userStates || {};
  global.userStates[userId] = state;
}