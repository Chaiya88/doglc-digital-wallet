/**
 * VIP and membership command handlers
 */

import { formatCurrency, formatDateTime, logUserActivity } from '../utils/helpers.js';

export async function handleVIP(ctx, vipAction = 'status') {
  try {
    const messages = ctx.messages;
    const userId = ctx.from.id.toString();
    const userLang = ctx.userLanguage;

    await logUserActivity(userId, {
      action: 'vip_access',
      vip_action: vipAction,
      language: userLang
    }, ctx.env || {});

    if (vipAction === 'upgrade') {
      return await handleVIPUpgrade(ctx);
    } else if (vipAction === 'benefits') {
      return await handleVIPBenefits(ctx);
    } else {
      return await handleVIPStatus(ctx);
    }

  } catch (error) {
    console.error('VIP handler error:', error);
    await ctx.reply(ctx.messages.errorOccurred);
  }
}

/**
 * VIP status and current membership
 */
async function handleVIPStatus(ctx) {
  const messages = ctx.messages;
  
  // Mock user VIP data
  const vipData = {
    current_level: 'BRONZE',
    join_date: '2025-09-01',
    total_volume: 25000,
    monthly_volume: 5000,
    next_level: 'SILVER',
    next_level_requirement: 50000,
    progress_percent: 50,
    benefits_used: {
      fast_withdraw: 3,
      fee_discount: 125.50,
      priority_support: 1
    }
  };

  const vipMessage = `
🎖️ <b>สถานะสมาชิก VIP / VIP Membership Status</b>

👑 <b>ระดับปัจจุบัน:</b> ${getVIPIcon(vipData.current_level)} ${vipData.current_level}
📅 <b>เป็นสมาชิกตั้งแต่:</b> ${vipData.join_date}

📊 <b>ความคืบหน้า:</b>
• ปริมาณรวม: ${formatCurrency(vipData.total_volume, 'th')} บาท
• เดือนนี้: ${formatCurrency(vipData.monthly_volume, 'th')} บาท
• เป้าหมาย ${vipData.next_level}: ${formatCurrency(vipData.next_level_requirement, 'th')} บาท
• ความคืบหน้า: ${vipData.progress_percent}% ${'█'.repeat(Math.floor(vipData.progress_percent/10))}${'░'.repeat(10-Math.floor(vipData.progress_percent/10))}

🎁 <b>สิทธิพิเศษที่ใช้ (เดือนนี้):</b>
• ⚡ Fast Withdraw: ${vipData.benefits_used.fast_withdraw}/10 ครั้ง
• 💸 ส่วนลดค่าธรรมเนียม: ${vipData.benefits_used.fee_discount} บาท
• 🎫 Priority Support: ${vipData.benefits_used.priority_support} ครั้ง

${getCurrentLevelBenefits(vipData.current_level)}

💡 <b>เคล็ดลับ:</b> เพิ่มปริมาณการซื้อขายเพื่ออัพเกรดระดับ VIP!
  `;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '📈 อัพเกรดสมาชิก / Upgrade VIP', callback_data: 'vip_upgrade' }
      ],
      [
        { text: '🎁 สิทธิพิเศษทั้งหมด / All Benefits', callback_data: 'vip_benefits' }
      ],
      [
        { text: '📊 ประวัติ VIP / VIP History', callback_data: 'vip_history' }
      ],
      [
        { text: '🏆 Leaderboard', callback_data: 'vip_leaderboard' }
      ],
      [
        { text: '🔙 กลับ / Back', callback_data: 'wallet' }
      ]
    ]
  };

  await ctx.reply(vipMessage, {
    reply_markup: keyboard,
    parse_mode: 'HTML'
  });
}

/**
 * VIP upgrade options
 */
async function handleVIPUpgrade(ctx) {
  const messages = ctx.messages;
  
  const upgradeMessage = `
📈 <b>อัพเกรดสมาชิก VIP / VIP Upgrade</b>

🏆 <b>ระดับสมาชิก VIP:</b>

🥉 <b>BRONZE (ปัจจุบัน)</b>
• ปริมาณขั้นต่ำ: 0 บาท
• ส่วนลดค่าธรรมเนียม: 5%
• วงเงินถอนเพิ่ม: 10%

🥈 <b>SILVER (ถัดไป)</b>
• ปริมาณขั้นต่ำ: 50,000 บาท
• ส่วนลดค่าธรรมเนียม: 10%
• วงเงินถอนเพิ่ม: 25%
• ⚡ Fast Withdraw: 20 ครั้ง/เดือน

🥇 <b>GOLD</b>
• ปริมาณขั้นต่ำ: 200,000 บาท
• ส่วนลดค่าธรรมเนียม: 20%
• วงเงินถอนเพิ่ม: 50%
• ⚡ Fast Withdraw: 50 ครั้ง/เดือน
• 🎫 Priority Support 24/7

💎 <b>PLATINUM</b>
• ปริมาณขั้นต่ำ: 1,000,000 บาท
• ส่วนลดค่าธรรมเนียม: 50%
• วงเงินถอนเพิ่ม: 100%
• ⚡ Fast Withdraw: ไม่จำกัด
• 🎫 Dedicated Account Manager
• 🎁 Exclusive Rewards

📊 <b>ความคืบหน้าของคุณ:</b>
• ปริมาณปัจจุบัน: 25,000 บาท
• ต้องการอีก: 25,000 บาท สำหรับ SILVER
  `;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '⚡ วิธีเพิ่มปริมาณ / How to Increase Volume', callback_data: 'increase_volume_guide' }
      ],
      [
        { text: '🎁 สิทธิพิเศษแต่ละระดับ / Level Benefits', callback_data: 'vip_benefits' }
      ],
      [
        { text: '📊 คำนวณสิทธิ / Calculate Benefits', callback_data: 'vip_calculator' }
      ],
      [
        { text: '🏆 Top VIP Members', callback_data: 'vip_leaderboard' }
      ],
      [
        { text: '🔙 กลับสถานะ VIP / Back to VIP Status', callback_data: 'vip_status' }
      ]
    ]
  };

  await ctx.reply(upgradeMessage, {
    reply_markup: keyboard,
    parse_mode: 'HTML'
  });
}

/**
 * VIP benefits detailed breakdown
 */
async function handleVIPBenefits(ctx) {
  const messages = ctx.messages;
  
  const benefitsMessage = `
🎁 <b>สิทธิพิเศษสมาชิก VIP / VIP Benefits</b>

💸 <b>ส่วนลดค่าธรรมเนียม:</b>
• 🥉 BRONZE: 5% ส่วนลด
• 🥈 SILVER: 10% ส่วนลด
• 🥇 GOLD: 20% ส่วนลด
• 💎 PLATINUM: 50% ส่วนลด

⚡ <b>Fast Withdraw (ถอนเร็ว):</b>
• 🥉 BRONZE: 10 ครั้ง/เดือน
• 🥈 SILVER: 20 ครั้ง/เดือน
• 🥇 GOLD: 50 ครั้ง/เดือน
• 💎 PLATINUM: ไม่จำกัด

💰 <b>วงเงินถอนเพิ่ม:</b>
• 🥉 BRONZE: +10% จากปกติ
• 🥈 SILVER: +25% จากปกติ
• 🥇 GOLD: +50% จากปกติ
• 💎 PLATINUM: +100% จากปกติ

🎫 <b>การสนับสนุน:</b>
• 🥉 BRONZE: Support ปกติ
• 🥈 SILVER: Priority Support
• 🥇 GOLD: Priority Support 24/7
• 💎 PLATINUM: Dedicated Account Manager

🎁 <b>สิทธิพิเศษอื่นๆ:</b>
• 🥈 SILVER+: Early Access ฟีเจอร์ใหม่
• 🥇 GOLD+: Exclusive Market Insights
• 💎 PLATINUM: Custom API Access
• 💎 PLATINUM: Exclusive Events & Rewards

💡 <b>ประโยชน์ที่ได้รับจริง:</b>
• ประหยัดค่าธรรมเนียมได้ถึง 50%
• ถอนเงินเร็วขึ้น 10 เท่า
• การสนับสนุนระดับพรีเมียม
  `;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '📈 อัพเกรดเลย / Upgrade Now', callback_data: 'vip_upgrade' }
      ],
      [
        { text: '📊 คำนวณประโยชน์ / Calculate Savings', callback_data: 'vip_savings_calculator' }
      ],
      [
        { text: '🏆 VIP Leaderboard', callback_data: 'vip_leaderboard' }
      ],
      [
        { text: '🔙 กลับสถานะ VIP / Back to VIP Status', callback_data: 'vip_status' }
      ]
    ]
  };

  await ctx.reply(benefitsMessage, {
    reply_markup: keyboard,
    parse_mode: 'HTML'
  });
}

// Helper functions
function getVIPIcon(level) {
  const icons = {
    'BRONZE': '🥉',
    'SILVER': '🥈',
    'GOLD': '🥇',
    'PLATINUM': '💎'
  };
  return icons[level] || '👤';
}

function getCurrentLevelBenefits(level) {
  const benefits = {
    'BRONZE': `
🥉 <b>สิทธิ BRONZE ปัจจุบัน:</b>
• 💸 ส่วนลดค่าธรรมเนียม 5%
• 💰 วงเงินถอนเพิ่ม 10%
• ⚡ Fast Withdraw 10 ครั้ง/เดือน`,
    
    'SILVER': `
🥈 <b>สิทธิ SILVER ปัจจุบัน:</b>
• 💸 ส่วนลดค่าธรรมเนียม 10%
• 💰 วงเงินถอนเพิ่ม 25%
• ⚡ Fast Withdraw 20 ครั้ง/เดือน
• 🎫 Priority Support`,
    
    'GOLD': `
🥇 <b>สิทธิ GOLD ปัจจุบัน:</b>
• 💸 ส่วนลดค่าธรรมเนียม 20%
• 💰 วงเงินถอนเพิ่ม 50%
• ⚡ Fast Withdraw 50 ครั้ง/เดือน
• 🎫 Priority Support 24/7
• 🎁 Exclusive Market Insights`,
    
    'PLATINUM': `
💎 <b>สิทธิ PLATINUM ปัจจุบัน:</b>
• 💸 ส่วนลดค่าธรรมเนียม 50%
• 💰 วงเงินถอนเพิ่ม 100%
• ⚡ Fast Withdraw ไม่จำกัด
• 🎫 Dedicated Account Manager
• 🎁 Exclusive Events & Custom API`
  };
  
  return benefits[level] || '';
}