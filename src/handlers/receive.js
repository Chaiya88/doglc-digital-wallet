/**
 * Receive/QR Code command handlers for receiving payments
 */

import { formatCurrency, formatDateTime, logUserActivity } from '../utils/helpers.js';

export async function handleReceive(ctx, receiveType = 'qr') {
  try {
    const messages = ctx.messages;
    const userId = ctx.from.id.toString();
    const userLang = ctx.userLanguage;

    await logUserActivity(userId, {
      action: 'receive_access',
      receive_type: receiveType,
      language: userLang
    }, ctx.env || {});

    if (receiveType === 'qr') {
      return await handleQRCode(ctx);
    } else if (receiveType === 'address') {
      return await handleShowAddress(ctx);
    } else {
      return await handleReceiveMenu(ctx);
    }

  } catch (error) {
    console.error('Receive handler error:', error);
    await ctx.reply(ctx.messages.errorOccurred);
  }
}

/**
 * Main receive menu
 */
async function handleReceiveMenu(ctx) {
  const messages = ctx.messages;
  
  // Generate user's wallet addresses
  const userAddresses = {
    user_id: ctx.from.id,
    internal_id: `@${ctx.from.username || ctx.from.first_name}`,
    tron_address: 'TR' + Math.random().toString(16).substr(2, 32),
    doglc_address: 'DG' + Math.random().toString(16).substr(2, 32)
  };

  const receiveMenuMessage = `
📥 <b>รับเงิน / Receive Money</b>

👤 <b>ข้อมูลบัญชี:</b>
• User ID: <code>${userAddresses.user_id}</code>
• Username: <code>${userAddresses.internal_id}</code>

🔗 <b>Wallet Addresses:</b>
• USDT/DOGLC: <code>${userAddresses.tron_address}</code>

📱 <b>วิธีการรับเงิน:</b>

💫 <b>รับเงินภายใน:</b>
• แชร์ User ID หรือ Username
• ไม่มีค่าธรรมเนียม
• เข้าบัญชีทันที

🔗 <b>รับเงินภายนอก:</b>
• แชร์ Wallet Address
• จาก External Wallet
• ผ่าน TRON Network

📱 <b>QR Code:</b>
• สร้าง QR สำหรับรับเงิน
• ระบุจำนวนเงินได้
• สแกนง่าย สะดวก
  `;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '📱 สร้าง QR Code', callback_data: 'create_qr_code' }
      ],
      [
        { text: '📋 คัดลอก User ID', callback_data: `copy_user_id_${userAddresses.user_id}` }
      ],
      [
        { text: '🔗 คัดลอก TRON Address', callback_data: `copy_tron_address_${userAddresses.tron_address}` }
      ],
      [
        { text: '📊 ประวัติการรับ / Receive History', callback_data: 'receive_history' }
      ],
      [
        { text: '⚙️ ตั้งค่าการรับเงิน / Settings', callback_data: 'receive_settings' }
      ],
      [
        { text: '🔙 กลับ / Back', callback_data: 'wallet' }
      ]
    ]
  };

  await ctx.reply(receiveMenuMessage, {
    reply_markup: keyboard,
    parse_mode: 'HTML'
  });
}

/**
 * Generate QR Code for receiving payments
 */
async function handleQRCode(ctx) {
  const messages = ctx.messages;
  
  const qrMessage = `
📱 <b>สร้าง QR Code รับเงิน / Create QR Code</b>

🎯 <b>เลือกประเภท QR Code:</b>

💫 <b>QR รับเงินภายใน:</b>
• สำหรับผู้ใช้ DOGLC
• ไม่มีค่าธรรมเนียม
• รองรับ THB, USDT, DOGLC

🔗 <b>QR รับเงินภายนอก:</b>
• สำหรับ External Wallet
• รองรับ USDT, DOGLC
• ผ่าน TRON Network

💰 <b>QR จำนวนเงินคงที่:</b>
• ระบุจำนวนเงินล่วงหน้า
• ผู้ส่งไม่ต้องใส่จำนวน
• สะดวกสำหรับขายของ

📊 <b>QR จำนวนเปิด:</b>
• ผู้ส่งใส่จำนวนเอง
• ยืดหยุ่นในการใช้งาน
• เหมาะสำหรับการใช้ทั่วไป
  `;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '💫 QR ภายใน / Internal QR', callback_data: 'qr_internal' }
      ],
      [
        { text: '🔗 QR ภายนอก / External QR', callback_data: 'qr_external' }
      ],
      [
        { text: '💰 QR จำนวนคงที่ / Fixed Amount', callback_data: 'qr_fixed_amount' }
      ],
      [
        { text: '📊 QR จำนวนเปิด / Open Amount', callback_data: 'qr_open_amount' }
      ],
      [
        { text: '🔙 กลับเมนูรับ / Back to Receive', callback_data: 'receive_menu' }
      ]
    ]
  };

  await ctx.reply(qrMessage, {
    reply_markup: keyboard,
    parse_mode: 'HTML'
  });
}

/**
 * Show wallet addresses
 */
async function handleShowAddress(ctx) {
  const messages = ctx.messages;
  
  const userAddresses = {
    user_id: ctx.from.id,
    username: ctx.from.username || 'ไม่มี',
    tron_address: 'TR' + Math.random().toString(16).substr(2, 32),
    doglc_address: 'DG' + Math.random().toString(16).substr(2, 32)
  };

  const addressMessage = `
🔗 <b>ที่อยู่ Wallet / Wallet Addresses</b>

👤 <b>ข้อมูลผู้ใช้:</b>
• User ID: <code>${userAddresses.user_id}</code>
• Username: <code>@${userAddresses.username}</code>
• ชื่อ: ${ctx.from.first_name}

💫 <b>สำหรับการรับเงินภายใน:</b>
ให้ผู้ส่งใช้ User ID หรือ Username

🔗 <b>TRON Address (TRC20):</b>
<code>${userAddresses.tron_address}</code>

💰 <b>รองรับสกุลเงิน:</b>
• USDT (Tether USD)
• DOGLC (DOGLC Token)
• TRX (TRON)

⚠️ <b>คำเตือนสำคัญ:</b>
• ส่งเฉพาะ TRON Network เท่านั้น
• ตรวจสอบ Address ให้ถูกต้อง
• ส่งสกุลเงินอื่นจะสูญหาย

🔒 <b>ความปลอดภัย:</b>
• Address นี้เป็นของคุณเท่านั้น
• ไม่แชร์ Private Key ให้ใคร
• บันทึกรายการทุกธุรกรรม
  `;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '📋 คัดลอก User ID', callback_data: `copy_user_id_${userAddresses.user_id}` }
      ],
      [
        { text: '📋 คัดลอก TRON Address', callback_data: `copy_tron_${userAddresses.tron_address}` }
      ],
      [
        { text: '📱 สร้าง QR Code', callback_data: 'create_qr_code' }
      ],
      [
        { text: '🔍 ตรวจสอบ TronScan', url: `https://tronscan.org/#/address/${userAddresses.tron_address}` }
      ],
      [
        { text: '🔙 กลับเมนูรับ / Back to Receive', callback_data: 'receive_menu' }
      ]
    ]
  };

  await ctx.reply(addressMessage, {
    reply_markup: keyboard,
    parse_mode: 'HTML'
  });
}

/**
 * Create internal QR code
 */
export async function handleCreateInternalQR(ctx) {
  const messages = ctx.messages;
  
  const qrInternalMessage = `
💫 <b>QR Code รับเงินภายใน / Internal QR Code</b>

🎯 <b>เลือกสกุลเงิน:</b>

💵 <b>THB (บาทไทย):</b>
• รับจากผู้ใช้ DOGLC อื่น
• ไม่มีค่าธรรมเนียม
• เข้าบัญชีทันที

💎 <b>USDT (Tether):</b>
• รับจากผู้ใช้ DOGLC อื่น
• ไม่มีค่าธรรมเนียม
• เข้าบัญชีทันที

🐕 <b>DOGLC (DOGLC Token):</b>
• รับจากผู้ใช้ DOGLC อื่น
• ไม่มีค่าธรรมเนียม
• เข้าบัญชีทันที

💡 <b>ข้อดีของการรับเงินภายใน:</b>
• ฟรี! ไม่มีค่าธรรมเนียม
• เร็วทันใจ
• ปลอดภัย 100%
  `;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '💵 QR รับ THB', callback_data: 'qr_internal_thb' }
      ],
      [
        { text: '💎 QR รับ USDT', callback_data: 'qr_internal_usdt' }
      ],
      [
        { text: '🐕 QR รับ DOGLC', callback_data: 'qr_internal_doglc' }
      ],
      [
        { text: '🔙 กลับ QR Menu', callback_data: 'create_qr_code' }
      ]
    ]
  };

  await ctx.reply(qrInternalMessage, {
    reply_markup: keyboard,
    parse_mode: 'HTML'
  });
}