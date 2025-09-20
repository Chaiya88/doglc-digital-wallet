/**
 * Send/Transfer command handlers for internal and external transfers
 */

import { formatCurrency, formatDateTime, logUserActivity } from '../utils/helpers.js';

export async function handleSend(ctx, transferType = 'internal') {
  try {
    const messages = ctx.messages;
    const userId = ctx.from.id.toString();
    const userLang = ctx.userLanguage;

    await logUserActivity(userId, {
      action: 'send_access',
      transfer_type: transferType,
      language: userLang
    }, ctx.env || {});

    if (transferType === 'internal') {
      return await handleInternalTransfer(ctx);
    } else if (transferType === 'external') {
      return await handleExternalTransfer(ctx);
    } else {
      return await handleSendMenu(ctx);
    }

  } catch (error) {
    console.error('Send handler error:', error);
    await ctx.reply(ctx.messages.errorOccurred);
  }
}

/**
 * Main send menu
 */
async function handleSendMenu(ctx) {
  const messages = ctx.messages;
  
  const userBalance = {
    thb: 1234.56,
    usdt: 42.35,
    doglc: 1000.00
  };

  const sendMenuMessage = `
📤 <b>ส่งเงิน / Send Money</b>

💰 <b>ยอดคงเหลือ:</b>
• THB: ${formatCurrency(userBalance.thb, 'th')} บาท
• USDT: ${userBalance.usdt.toFixed(2)} USDT
• DOGLC: ${userBalance.doglc.toFixed(2)} DOGLC

🔄 <b>ประเภทการส่ง:</b>

💫 <b>โอนภายใน (Internal):</b>
• ส่งให้ผู้ใช้ DOGLC อื่น
• ไม่มีค่าธรรมเนียม
• เข้าบัญชีทันที

🌐 <b>โอนภายนอก (External):</b>
• ส่งไปยัง Wallet ภายนอก
• ค่าธรรมเนียม Network
• เวลาตาม Blockchain

💡 <b>เคล็ดลับ:</b> โอนภายในประหยัดค่าธรรมเนียม!
  `;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '💫 โอนภายใน / Internal Transfer', callback_data: 'send_internal' }
      ],
      [
        { text: '🌐 โอนภายนอก / External Transfer', callback_data: 'send_external' }
      ],
      [
        { text: '📊 ประวัติการส่ง / Transfer History', callback_data: 'send_history' }
      ],
      [
        { text: '📋 รายการโปรด / Favorites', callback_data: 'send_favorites' }
      ],
      [
        { text: '🔙 กลับ / Back', callback_data: 'wallet' }
      ]
    ]
  };

  await ctx.reply(sendMenuMessage, {
    reply_markup: keyboard,
    parse_mode: 'HTML'
  });
}

/**
 * Internal transfer to other DOGLC users
 */
async function handleInternalTransfer(ctx) {
  const messages = ctx.messages;
  
  const internalMessage = `
💫 <b>โอนภายใน / Internal Transfer</b>

🎯 <b>ส่งให้ผู้ใช้ DOGLC:</b>
• ใช้ User ID หรือ Username
• ไม่มีค่าธรรมเนียม
• เข้าบัญชีทันที

💰 <b>สกุลเงินที่รองรับ:</b>
• THB (บาทไทย)
• USDT (Tether)
• DOGLC (DOGLC Token)

📝 <b>วิธีการ:</b>
1. เลือกสกุลเงินที่ต้องการส่ง
2. ใส่ User ID หรือ @username
3. ระบุจำนวนเงิน
4. ยืนยันการโอน

⚡ <b>ข้อดี:</b>
• ฟรี! ไม่มีค่าธรรมเนียม
• เร็วทันใจ
• ปลอดภัย 100%
  `;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '💵 ส่ง THB', callback_data: 'send_internal_thb' },
        { text: '💎 ส่ง USDT', callback_data: 'send_internal_usdt' }
      ],
      [
        { text: '🐕 ส่ง DOGLC', callback_data: 'send_internal_doglc' }
      ],
      [
        { text: '📋 รายการโปรด / Favorites', callback_data: 'internal_favorites' }
      ],
      [
        { text: '📊 ประวัติ Internal / History', callback_data: 'internal_history' }
      ],
      [
        { text: '🔙 กลับเมนูส่ง / Back to Send', callback_data: 'send_menu' }
      ]
    ]
  };

  await ctx.reply(internalMessage, {
    reply_markup: keyboard,
    parse_mode: 'HTML'
  });
}

/**
 * External transfer to external wallets
 */
async function handleExternalTransfer(ctx) {
  const messages = ctx.messages;
  
  const externalMessage = `
🌐 <b>โอนภายนอก / External Transfer</b>

🔗 <b>ส่งไปยัง Wallet ภายนอก:</b>
• รองรับ USDT และ DOGLC
• ใช้ TRON Network (TRC20)
• ค่าธรรมเนียม Network

💎 <b>USDT External:</b>
• ขั้นต่ำ: 10 USDT
• ค่าธรรมเนียม: 2 USDT
• เวลา: 10-15 นาที

🐕 <b>DOGLC External:</b>
• ขั้นต่ำ: 100 DOGLC
• ค่าธรรมเนียม: 5 DOGLC
• เวลา: 10-15 นาที

⚠️ <b>คำเตือนสำคัญ:</b>
• ตรวจสอบ Address ให้ถูกต้อง
• รองรับเฉพาะ TRON Network
• ไม่สามารถยกเลิกได้หลังส่ง
  `;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '💎 ส่ง USDT External', callback_data: 'send_external_usdt' }
      ],
      [
        { text: '🐕 ส่ง DOGLC External', callback_data: 'send_external_doglc' }
      ],
      [
        { text: '📋 Address Book', callback_data: 'external_address_book' }
      ],
      [
        { text: '📊 ประวัติ External / History', callback_data: 'external_history' }
      ],
      [
        { text: '🔙 กลับเมนูส่ง / Back to Send', callback_data: 'send_menu' }
      ]
    ]
  };

  await ctx.reply(externalMessage, {
    reply_markup: keyboard,
    parse_mode: 'HTML'
  });
}

/**
 * Handle internal THB transfer
 */
export async function handleInternalTHBTransfer(ctx) {
  const messages = ctx.messages;
  
  const transferMessage = `
💵 <b>ส่ง THB ภายใน / Send THB Internal</b>

💰 <b>ยอดคงเหลือ:</b> 1,234.56 บาท

📝 <b>ขั้นตอนการส่ง:</b>
1. ใส่ User ID หรือ @username ของผู้รับ
2. ระบุจำนวนเงิน (ขั้นต่ำ 1 บาท)
3. ยืนยันการโอน

💡 <b>ตัวอย่าง User ID:</b>
• <code>123456789</code>
• <code>@username</code>

กรุณาใส่ User ID หรือ @username ของผู้รับ:
  `;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '📋 เลือกจากรายการโปรด', callback_data: 'select_thb_favorite' }
      ],
      [
        { text: '🔙 ยกเลิก / Cancel', callback_data: 'send_internal' }
      ]
    ]
  };

  // Set user state to expect recipient
  await setUserState(ctx.from.id, 'waiting_thb_recipient');

  await ctx.reply(transferMessage, {
    reply_markup: keyboard,
    parse_mode: 'HTML'
  });
}

// Helper function to set user state
async function setUserState(userId, state) {
  global.userStates = global.userStates || {};
  global.userStates[userId] = state;
}