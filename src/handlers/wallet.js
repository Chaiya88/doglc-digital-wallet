/**
 * Enhanced wallet command handler with banking operations
 *     const keyboard = {
      inline_keyboard: [
        [
          { text: '💰 ดูยอดเงิน / Check Balance', callback_data: 'balance' },
          { text: '📊 ประวัติ / History', callback_data: 'history' }
        ],
        [
          { text: '💵 ฝาก THB / Deposit THB', callback_data: 'deposit_thb' },
          { text: '💎 ถอน USDT / Withdraw USDT', callback_data: 'withdraw_usdt' }
        ],
        [
          { text: '🔄 อัตราแลกเปลี่ยน / Exchange Rate', callback_data: 'view_exchange_rate' },
          { text: '💱 คำนวณ / Calculator', callback_data: 'calculate_conversion' }
        ],
        [
          { text: '🎖️ ระดับ VIP / VIP Status', callback_data: 'vip_status' },osits, USDT withdrawals, and slip verification
 */

import { formatCurrency, formatDateTime, logUserActivity, getUserState } from '../utils/helpers.js';
import { convertUSDTtoTHB, getExchangeRateDisplay } from '../utils/exchangeRate.js';

export async function handleWallet(ctx, action = null) {
  try {
    const messages = ctx.messages; // Set by middleware
    const userId = ctx.from.id.toString();
    const userLang = ctx.userLanguage;

    // Log wallet access
    await logUserActivity(userId, {
      action: 'wallet_access',
      specific_action: action || 'main_menu',
      language: userLang
    }, ctx.env || {});

    // Handle specific wallet actions
    if (action === 'balance') {
      return await handleBalance(ctx);
    } else if (action === 'deposit') {
      return await handleDepositMenu(ctx);
    } else if (action === 'withdraw') {
      return await handleWithdrawMenu(ctx);
    }

    // Main wallet menu with enhanced features
    const mockWallet = {
      address: 'DG' + Math.random().toString(16).substr(2, 40),
      usdt_balance: 142.35,
      last_deposit_thb: 5000,
      last_deposit_date: new Date('2025-09-19'),
      total_deposited_thb: 25000,
      vip_level: 'SILVER',
      created: new Date('2025-08-15')
    };

    // Calculate THB equivalent for USDT balance
    const conversion = convertUSDTtoTHB(mockWallet.usdt_balance);

    const walletMessage = `
💳 <b>กระเป๋าเงิน DOGLC Wallet</b>

👤 <b>เจ้าของ:</b> ${ctx.from.first_name}
🏦 <b>Address:</b> <code>${mockWallet.address}</code>

💰 <b>ยอดคงเหลือ:</b>
• USDT: ${mockWallet.usdt_balance.toFixed(2)} USDT
• มูลค่า: ~${conversion.thb.toLocaleString()} บาท

📊 <b>สถิติการใช้งาน:</b>
• ฝากล่าสุด: ${mockWallet.last_deposit_thb.toLocaleString()} THB
• วันที่ฝาก: ${mockWallet.last_deposit_date.toLocaleDateString('th-TH')}
• ฝากรวม: ${mockWallet.total_deposited_thb.toLocaleString()} THB

� <b>สถานะ VIP:</b> ${mockWallet.vip_level}
• ค่าธรรมเนียมถอนลดลง
• วงเงินถอนสูงขึ้น
• อัตราแลกเปลี่ยนดีกว่า

� <b>ระบบ:</b> ฝากบาท → ได้ USDT → ถอน USDT
📅 <b>สมาชิกตั้งแต่:</b> ${mockWallet.created.toLocaleDateString('th-TH')}
    `;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '💰 ดูยอดเงิน / Balance', callback_data: 'balance' },
          { text: '� ประวัติ / History', callback_data: 'history' }
        ],
        [
          { text: '� ฝากเงิน THB / Deposit', callback_data: 'deposit_thb' },
          { text: '🏧 ถอน USDT / Withdraw', callback_data: 'withdraw_usdt' }
        ],
        [
          { text: '🔄 โอนภายใน / Transfer', callback_data: 'internal_transfer' },
          { text: '� แลกเปลี่ยน / Exchange', callback_data: 'exchange' }
        ],
        [
          { text: '🎖️ ระดับ VIP / VIP Status', callback_data: 'vip_status' },
          { text: '🔐 ความปลอดภัย / Security', callback_data: 'security_settings' }
        ],
        [
          { text: '🏠 หน้าหลัก / Home', callback_data: 'start' }
        ]
      ]
    };

    await ctx.reply(walletMessage, {
      reply_markup: keyboard,
      parse_mode: 'HTML'
    });

  } catch (error) {
    console.error('Wallet handler error:', error);
    await ctx.reply(ctx.messages.errorOccurred);
  }
}

/**
 * Handle balance inquiry with enhanced details
 */
async function handleBalance(ctx) {
  const messages = ctx.messages;
  const userId = ctx.from.id.toString();
  const userLang = ctx.userLanguage;

  // Mock balance data - in production, fetch from database
  const balanceData = {
    thb_balance: 1234.56,
    usdt_balance: 42.35,
    doglc_balance: 1000.00,
    total_value_thb: 2580.45,
    daily_limit_used: 500.00,
    daily_limit_total: 50000.00,
    vip_level: 'BRONZE',
    last_transaction: '2 นาที ที่แล้ว'
  };

  const balanceMessage = `
💰 <b>ยอดเงินในบัญชี / Account Balance</b>

💵 <b>THB:</b> ${formatCurrency(balanceData.thb_balance, userLang)} บาท
💎 <b>USDT:</b> ${balanceData.usdt_balance.toFixed(2)} USDT
🐕 <b>DOGLC:</b> ${balanceData.doglc_balance.toFixed(2)} DOGLC

📊 <b>มูลค่ารวม / Total Value:</b> ${formatCurrency(balanceData.total_value_thb, userLang)} บาท

📈 <b>ข้อมูลวันนี้ / Today's Data:</b>
• ใช้แล้ว / Used: ${formatCurrency(balanceData.daily_limit_used, userLang)} บาท
• วงเงิน / Limit: ${formatCurrency(balanceData.daily_limit_total, userLang)} บาท
• คงเหลือ / Remaining: ${formatCurrency(balanceData.daily_limit_total - balanceData.daily_limit_used, userLang)} บาท

🎖️ <b>สถานะ VIP:</b> ${balanceData.vip_level}
⏰ <b>รายการล่าสุด:</b> ${balanceData.last_transaction}

💡 <b>เคล็ดลับ:</b> อัพเกรด VIP เพื่อรับสิทธิพิเศษ!
  `;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '📱 รีเฟรช / Refresh', callback_data: 'balance' },
        { text: '📊 รายละเอียด / Details', callback_data: 'balance_details' }
      ],
      [
        { text: '💸 ฝากเงิน / Deposit', callback_data: 'deposit_thb' },
        { text: '🏧 ถอนเงิน / Withdraw', callback_data: 'withdraw_usdt' }
      ],
      [
        { text: '🔙 กลับ / Back', callback_data: 'wallet' }
      ]
    ]
  };

  await ctx.reply(balanceMessage, {
    reply_markup: keyboard,
    parse_mode: 'HTML'
  });
}

/**
 * Handle deposit menu with multiple options
 */
async function handleDepositMenu(ctx) {
  const messages = ctx.messages;
  
  const depositMessage = `
💸 <b>ฝากเงิน / Deposit Money</b>

💳 <b>ฝากเงิน THB:</b>
• โอนผ่านธนาคารไทย
• ใช้ระบบ OCR ตรวจสอบสลิป
• เข้าบัญชีภายใน 5-30 นาที
• ค่าธรรมเนียม 2% (ขั้นต่ำ 10 บาท)

💎 <b>ฝาก USDT:</b>
• ส่งผ่าน TRON Network (TRC20)
• ยืนยันอัตโนมัติผ่าน Blockchain
• เข้าบัญชีภายใน 10-15 นาที
• ค่าธรรมเนียม 2 USDT

🎯 <b>ขั้นต่ำ - สูงสุด:</b>
• THB: 100 - 50,000 บาท
• USDT: 10 - 10,000 USDT

🔒 ระบบรักษาความปลอดภัยขั้นสูง
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
        { text: '📖 คู่มือการฝาก / Deposit Guide', callback_data: 'deposit_guide' }
      ],
      [
        { text: '🔙 กลับ / Back', callback_data: 'wallet' }
      ]
    ]
  };

  await ctx.reply(depositMessage, {
    reply_markup: keyboard,
    parse_mode: 'HTML'
  });
}

/**
 * Handle withdrawal menu with multiple options
 */
async function handleWithdrawMenu(ctx) {
  const messages = ctx.messages;
  
  const withdrawMessage = `
🏧 <b>ถอนเงิน / Withdraw Money</b>

💵 <b>ถอน THB:</b>
• โอนไปบัญชีธนาคารไทย
• รองรับธนาคารหลัก 15 แห่ง
• ดำเนินการภายใน 30-60 นาที
• ค่าธรรมเนียม 25 บาท/รายการ

💎 <b>ถอน USDT:</b>
• ส่งไป External Wallet
• ผ่าน TRON Network (TRC20)
• ดำเนินการภายใน 10-30 นาที
• ค่าธรรมเนียม 2 USDT

🎯 <b>ขั้นต่ำ - สูงสุด:</b>
• THB: 500 - 100,000 บาท
• USDT: 10 - 50,000 USDT

⚠️ <b>หมายเหตุ:</b> ตรวจสอบข้อมูลให้ถูกต้อง
  `;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '💵 ถอน THB / Withdraw THB', callback_data: 'withdraw_thb' }
      ],
      [
        { text: '💎 ถอน USDT / Withdraw USDT', callback_data: 'withdraw_usdt' }
      ],
      [
        { text: '📖 คู่มือการถอน / Withdraw Guide', callback_data: 'withdraw_guide' }
      ],
      [
        { text: '🔙 กลับ / Back', callback_data: 'wallet' }
      ]
    ]
  };

  await ctx.reply(withdrawMessage, {
    reply_markup: keyboard,
    parse_mode: 'HTML'
  });
}