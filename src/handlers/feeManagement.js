/**
 * Fee Management System for DOGLC Digital Wallet
 * Allows Master Admin to adjust service fees and commission rates
 */

import { formatCurrency, formatDateTime, logUserActivity } from '../utils/helpers.js';

// Current fee structure - should be stored in database in production
const CURRENT_FEES = {
  deposit: {
    thb: {
      rate: 0.020, // 2.0%
      minimum: 10, // THB
      maximum: 1000, // THB
      vip_discounts: {
        BRONZE: 0,
        SILVER: 0.005, // 0.5% discount
        GOLD: 0.010, // 1.0% discount
        PLATINUM: 0.015 // 1.5% discount
      }
    }
  },
  
  withdraw: {
    usdt: {
      rate: 0.015, // 1.5%
      minimum: 2, // USDT
      maximum: 100, // USDT
      fixed_fee: 2, // USDT network fee
      vip_discounts: {
        BRONZE: 0,
        SILVER: 0.005, // 0.5% discount
        GOLD: 0.008, // 0.8% discount
        PLATINUM: 0.010 // 1.0% discount
      }
    },
    thb: {
      rate: 0.025, // 2.5%
      minimum: 20, // THB
      maximum: 500, // THB
      vip_discounts: {
        BRONZE: 0,
        SILVER: 0.005,
        GOLD: 0.010,
        PLATINUM: 0.015
      }
    }
  },
  
  transfer: {
    internal: {
      rate: 0.005, // 0.5%
      minimum: 1, // THB equivalent
      maximum: 50, // THB equivalent
      free_for_vip: ['GOLD', 'PLATINUM']
    },
    external: {
      rate: 0.010, // 1.0%
      minimum: 5, // THB equivalent
      maximum: 100, // THB equivalent
      vip_discounts: {
        BRONZE: 0,
        SILVER: 0.002,
        GOLD: 0.005,
        PLATINUM: 0.008
      }
    }
  },
  
  exchange: {
    thb_to_usdt: {
      spread: 0.005, // 0.5% spread
      minimum_fee: 5, // THB
      vip_discounts: {
        BRONZE: 0,
        SILVER: 0.001,
        GOLD: 0.002,
        PLATINUM: 0.003
      }
    },
    usdt_to_thb: {
      spread: 0.005, // 0.5% spread
      minimum_fee: 0.1, // USDT
      vip_discounts: {
        BRONZE: 0,
        SILVER: 0.001,
        GOLD: 0.002,
        PLATINUM: 0.003
      }
    }
  },
  
  vip_upgrade: {
    silver: {
      fee: 500, // THB
      monthly_fee: 0 // One-time only
    },
    gold: {
      fee: 2000, // THB
      monthly_fee: 100 // THB per month
    },
    platinum: {
      fee: 10000, // THB
      monthly_fee: 500 // THB per month
    }
  },
  
  last_updated: new Date().toISOString(),
  updated_by: null
};

/**
 * Main fee management handler
 */
export async function handleFeeManagement(ctx, env) {
  try {
    const adminLevel = checkAdminLevel(ctx.from.id);
    if (!adminLevel || adminLevel === 'ADMIN') {
      await ctx.reply('❌ ต้องเป็น Master Admin ขึ้นไป');
      return;
    }

    await logUserActivity(ctx.from.id.toString(), {
      action: 'fee_management_access',
      admin_level: adminLevel,
      timestamp: new Date().toISOString()
    }, env);

    const feeManagementMessage = `
💸 <b>จัดการค่าบริการและคอมมิชชั่น</b>

📊 <b>อัตราค่าบริการปัจจุบัน:</b>

💵 <b>ฝากเงิน THB:</b>
• อัตรา: ${(CURRENT_FEES.deposit.thb.rate * 100).toFixed(1)}%
• ขั้นต่ำ: ${CURRENT_FEES.deposit.thb.minimum} THB
• สูงสุด: ${CURRENT_FEES.deposit.thb.maximum} THB

💎 <b>ถอน USDT:</b>
• อัตรา: ${(CURRENT_FEES.withdraw.usdt.rate * 100).toFixed(1)}%
• ขั้นต่ำ: ${CURRENT_FEES.withdraw.usdt.minimum} USDT
• ค่า Network: ${CURRENT_FEES.withdraw.usdt.fixed_fee} USDT

🔄 <b>แลกเปลี่ยน:</b>
• Spread: ${(CURRENT_FEES.exchange.thb_to_usdt.spread * 100).toFixed(1)}%
• ขั้นต่ำ: ${CURRENT_FEES.exchange.thb_to_usdt.minimum_fee} THB

🎖️ <b>อัพเกรด VIP:</b>
• Silver: ${CURRENT_FEES.vip_upgrade.silver.fee.toLocaleString()} THB
• Gold: ${CURRENT_FEES.vip_upgrade.gold.fee.toLocaleString()} THB
• Platinum: ${CURRENT_FEES.vip_upgrade.platinum.fee.toLocaleString()} THB

⏰ <b>อัพเดทล่าสุด:</b> ${new Date(CURRENT_FEES.last_updated).toLocaleString('th-TH')}

💰 <b>รายได้ค่าธรรมเนียมวันนี้:</b>
• ฝากเงิน: 12,450 THB
• ถอนเงิน: 8,230 THB
• แลกเปลี่ยน: 3,560 THB
• รวม: 24,240 THB
    `;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '💵 ค่าฝากเงิน', callback_data: 'fee_deposit' },
          { text: '💎 ค่าถอนเงิน', callback_data: 'fee_withdraw' }
        ],
        [
          { text: '🔄 ค่าแลกเปลี่ยน', callback_data: 'fee_exchange' },
          { text: '📤 ค่าโอนเงิน', callback_data: 'fee_transfer' }
        ],
        [
          { text: '🎖️ ค่าอัพเกรด VIP', callback_data: 'fee_vip_upgrade' },
          { text: '🏆 ส่วนลด VIP', callback_data: 'fee_vip_discounts' }
        ],
        [
          { text: '📊 รายงานรายได้', callback_data: 'fee_revenue_report' },
          { text: '📈 สถิติค่าธรรมเนียม', callback_data: 'fee_statistics' }
        ],
        [
          { text: '⚙️ ตั้งค่าขั้นสูง', callback_data: 'fee_advanced_settings' },
          { text: '🔄 รีเซ็ตค่าเริ่มต้น', callback_data: 'fee_reset_defaults' }
        ],
        [
          { text: '🔙 กลับ Admin Panel', callback_data: 'admin_main' }
        ]
      ]
    };

    await ctx.reply(feeManagementMessage, {
      reply_markup: keyboard,
      parse_mode: 'HTML'
    });

  } catch (error) {
    console.error('Fee management error:', error);
    await ctx.reply('❌ เกิดข้อผิดพลาดในการจัดการค่าบริการ');
  }
}

/**
 * Handle deposit fee management
 */
export async function handleDepositFeeManagement(ctx, env) {
  try {
    const adminLevel = checkAdminLevel(ctx.from.id);
    if (!adminLevel || adminLevel === 'ADMIN') {
      await ctx.reply('❌ ไม่มีสิทธิ์เข้าถึง');
      return;
    }

    const depositFees = CURRENT_FEES.deposit.thb;
    
    const depositFeeMessage = `
💵 <b>จัดการค่าบริการฝากเงิน THB</b>

📊 <b>ค่าธรรมเนียมปัจจุบัน:</b>
• อัตราพื้นฐาน: ${(depositFees.rate * 100).toFixed(1)}%
• ขั้นต่ำ: ${depositFees.minimum} THB
• สูงสุด: ${depositFees.maximum} THB

🎖️ <b>ส่วนลด VIP:</b>
• Bronze: ${(depositFees.vip_discounts.BRONZE * 100).toFixed(1)}% (${(depositFees.rate * 100).toFixed(1)}%)
• Silver: ${(depositFees.vip_discounts.SILVER * 100).toFixed(1)}% (${((depositFees.rate - depositFees.vip_discounts.SILVER) * 100).toFixed(1)}%)
• Gold: ${(depositFees.vip_discounts.GOLD * 100).toFixed(1)}% (${((depositFees.rate - depositFees.vip_discounts.GOLD) * 100).toFixed(1)}%)
• Platinum: ${(depositFees.vip_discounts.PLATINUM * 100).toFixed(1)}% (${((depositFees.rate - depositFees.vip_discounts.PLATINUM) * 100).toFixed(1)}%)

💰 <b>ตัวอย่างการคำนวณ:</b>
• ฝาก 10,000 THB (Bronze): ค่าธรรมเนียม ${(10000 * depositFees.rate).toFixed(0)} THB
• ฝาก 10,000 THB (Gold): ค่าธรรมเนียม ${(10000 * (depositFees.rate - depositFees.vip_discounts.GOLD)).toFixed(0)} THB

📈 <b>สถิติรายได้ (7 วัน):</b>
• รายการฝาก: 2,456 รายการ
• ยอดรวม: 45,670,000 THB
• ค่าธรรมเนียม: 913,400 THB
• เฉลี่ย/รายการ: 372 THB
    `;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '📊 ปรับอัตราพื้นฐาน', callback_data: 'fee_deposit_rate' },
          { text: '💰 ปรับขั้นต่ำ-สูงสุด', callback_data: 'fee_deposit_limits' }
        ],
        [
          { text: '🎖️ ปรับส่วนลด VIP', callback_data: 'fee_deposit_vip' },
          { text: '⚡ ตั้งค่าด่วน', callback_data: 'fee_deposit_quick' }
        ],
        [
          { text: '📊 ดูสถิติรายละเอียด', callback_data: 'fee_deposit_stats' },
          { text: '🧮 ทดสอบการคำนวณ', callback_data: 'fee_deposit_calculator' }
        ],
        [
          { text: '🔄 คืนค่าเริ่มต้น', callback_data: 'fee_deposit_reset' },
          { text: '💾 บันทึกการตั้งค่า', callback_data: 'fee_deposit_save' }
        ],
        [
          { text: '🔙 กลับจัดการค่าบริการ', callback_data: 'fee_management' }
        ]
      ]
    };

    await ctx.reply(depositFeeMessage, {
      reply_markup: keyboard,
      parse_mode: 'HTML'
    });

  } catch (error) {
    console.error('Deposit fee management error:', error);
    await ctx.reply('❌ ไม่สามารถจัดการค่าบริการฝากเงินได้');
  }
}

/**
 * Handle withdraw fee management
 */
export async function handleWithdrawFeeManagement(ctx, env) {
  try {
    const adminLevel = checkAdminLevel(ctx.from.id);
    if (!adminLevel || adminLevel === 'ADMIN') {
      await ctx.reply('❌ ไม่มีสิทธิ์เข้าถึง');
      return;
    }

    const withdrawFees = CURRENT_FEES.withdraw.usdt;
    
    const withdrawFeeMessage = `
💎 <b>จัดการค่าบริการถอน USDT</b>

📊 <b>ค่าธรรมเนียมปัจจุบัน:</b>
• อัตราพื้นฐาน: ${(withdrawFees.rate * 100).toFixed(1)}%
• ขั้นต่ำ: ${withdrawFees.minimum} USDT
• สูงสุด: ${withdrawFees.maximum} USDT
• ค่า Network: ${withdrawFees.fixed_fee} USDT (คงที่)

🎖️ <b>ส่วนลด VIP:</b>
• Bronze: ${(withdrawFees.vip_discounts.BRONZE * 100).toFixed(1)}% (${(withdrawFees.rate * 100).toFixed(1)}%)
• Silver: ${(withdrawFees.vip_discounts.SILVER * 100).toFixed(1)}% (${((withdrawFees.rate - withdrawFees.vip_discounts.SILVER) * 100).toFixed(1)}%)
• Gold: ${(withdrawFees.vip_discounts.GOLD * 100).toFixed(1)}% (${((withdrawFees.rate - withdrawFees.vip_discounts.GOLD) * 100).toFixed(1)}%)
• Platinum: ${(withdrawFees.vip_discounts.PLATINUM * 100).toFixed(1)}% (${((withdrawFees.rate - withdrawFees.vip_discounts.PLATINUM) * 100).toFixed(1)}%)

💰 <b>ตัวอย่างการคำนวณ:</b>
• ถอน 100 USDT (Bronze): ค่าธรรมเนียม ${(100 * withdrawFees.rate + withdrawFees.fixed_fee).toFixed(1)} USDT
• ถอน 100 USDT (Gold): ค่าธรรมเนียม ${(100 * (withdrawFees.rate - withdrawFees.vip_discounts.GOLD) + withdrawFees.fixed_fee).toFixed(1)} USDT

📈 <b>สถิติรายได้ (7 วัน):</b>
• รายการถอน: 1,234 รายการ
• ยอดรวม: 156,780 USDT
• ค่าธรรมเนียม: 4,703 USDT
• เฉลี่ย/รายการ: 3.81 USDT
    `;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '📊 ปรับอัตราพื้นฐาน', callback_data: 'fee_withdraw_rate' },
          { text: '💰 ปรับขั้นต่ำ-สูงสุด', callback_data: 'fee_withdraw_limits' }
        ],
        [
          { text: '🌐 ปรับค่า Network', callback_data: 'fee_withdraw_network' },
          { text: '🎖️ ปรับส่วนลด VIP', callback_data: 'fee_withdraw_vip' }
        ],
        [
          { text: '⚡ ตั้งค่าด่วน', callback_data: 'fee_withdraw_quick' },
          { text: '📊 ดูสถิติรายละเอียด', callback_data: 'fee_withdraw_stats' }
        ],
        [
          { text: '🧮 ทดสอบการคำนวณ', callback_data: 'fee_withdraw_calculator' },
          { text: '💾 บันทึกการตั้งค่า', callback_data: 'fee_withdraw_save' }
        ],
        [
          { text: '🔙 กลับจัดการค่าบริการ', callback_data: 'fee_management' }
        ]
      ]
    };

    await ctx.reply(withdrawFeeMessage, {
      reply_markup: keyboard,
      parse_mode: 'HTML'
    });

  } catch (error) {
    console.error('Withdraw fee management error:', error);
    await ctx.reply('❌ ไม่สามารถจัดการค่าบริการถอนเงินได้');
  }
}

/**
 * Handle VIP upgrade fee management
 */
export async function handleVIPUpgradeFeeManagement(ctx, env) {
  try {
    const adminLevel = checkAdminLevel(ctx.from.id);
    if (!adminLevel || adminLevel === 'ADMIN') {
      await ctx.reply('❌ ไม่มีสิทธิ์เข้าถึง');
      return;
    }

    const vipFees = CURRENT_FEES.vip_upgrade;
    
    const vipFeeMessage = `
🎖️ <b>จัดการค่าบริการอัพเกรด VIP</b>

💎 <b>ค่าธรรมเนียมปัจจุบัน:</b>

🥈 <b>Silver VIP:</b>
• ค่าสมัคร: ${vipFees.silver.fee.toLocaleString()} THB
• ค่ารายเดือน: ${vipFees.silver.monthly_fee} THB (ฟรี)
• สิทธิประโยชน์: ส่วนลดค่าธรรมเนียม, ลำดับความสำคัญ

🥇 <b>Gold VIP:</b>
• ค่าสมัคร: ${vipFees.gold.fee.toLocaleString()} THB
• ค่ารายเดือน: ${vipFees.gold.monthly_fee} THB
• สิทธิประโยชน์: ส่วนลดสูง, โอนภายในฟรี, ซัพพอร์ตพิเศษ

💎 <b>Platinum VIP:</b>
• ค่าสมัคร: ${vipFees.platinum.fee.toLocaleString()} THB
• ค่ารายเดือน: ${vipFees.platinum.monthly_fee} THB
• สิทธิประโยชน์: ส่วนลดสูงสุด, บริการพิเศษทุกอย่าง

📈 <b>สถิติรายได้ VIP (เดือนนี้):</b>
• Silver: 45 คน = ${(45 * vipFees.silver.fee).toLocaleString()} THB
• Gold: 23 คน = ${(23 * vipFees.gold.fee).toLocaleString()} THB
• Platinum: 8 คน = ${(8 * vipFees.platinum.fee).toLocaleString()} THB
• รายเดือน: ${(23 * vipFees.gold.monthly_fee + 8 * vipFees.platinum.monthly_fee).toLocaleString()} THB
• รวม: ${(45 * vipFees.silver.fee + 23 * vipFees.gold.fee + 8 * vipFees.platinum.fee + 23 * vipFees.gold.monthly_fee + 8 * vipFees.platinum.monthly_fee).toLocaleString()} THB

💡 <b>Conversion Rate:</b>
• Silver: 12.3% (จากผู้ใช้ทั่วไป)
• Gold: 18.7% (จาก Silver)
• Platinum: 23.1% (จาก Gold)
    `;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '🥈 ปรับค่า Silver', callback_data: 'fee_vip_silver' },
          { text: '🥇 ปรับค่า Gold', callback_data: 'fee_vip_gold' }
        ],
        [
          { text: '💎 ปรับค่า Platinum', callback_data: 'fee_vip_platinum' },
          { text: '📅 ค่ารายเดือน', callback_data: 'fee_vip_monthly' }
        ],
        [
          { text: '🎁 โปรโมชั่น VIP', callback_data: 'fee_vip_promotion' },
          { text: '📊 สถิติการแปลง', callback_data: 'fee_vip_conversion' }
        ],
        [
          { text: '⚡ ตั้งค่าด่วน', callback_data: 'fee_vip_quick' },
          { text: '🧮 คำนวณรายได้', callback_data: 'fee_vip_calculator' }
        ],
        [
          { text: '🔙 กลับจัดการค่าบริการ', callback_data: 'fee_management' }
        ]
      ]
    };

    await ctx.reply(vipFeeMessage, {
      reply_markup: keyboard,
      parse_mode: 'HTML'
    });

  } catch (error) {
    console.error('VIP upgrade fee management error:', error);
    await ctx.reply('❌ ไม่สามารถจัดการค่าบริการ VIP ได้');
  }
}

/**
 * Handle fee revenue report
 */
export async function handleFeeRevenueReport(ctx, env) {
  try {
    const adminLevel = checkAdminLevel(ctx.from.id);
    if (!adminLevel || adminLevel === 'ADMIN') {
      await ctx.reply('❌ ไม่มีสิทธิ์เข้าถึง');
      return;
    }

    // Mock data - should come from real database
    const revenueData = {
      today: {
        deposit: 12450,
        withdraw: 8230,
        exchange: 3560,
        transfer: 890,
        vip: 2500,
        total: 27630
      },
      week: {
        deposit: 87150,
        withdraw: 57610,
        exchange: 24920,
        transfer: 6230,
        vip: 17500,
        total: 193410
      },
      month: {
        deposit: 374500,
        withdraw: 247200,
        exchange: 107000,
        transfer: 26800,
        vip: 75000,
        total: 830500
      }
    };

    const revenueMessage = `
📊 <b>รายงานรายได้ค่าบริการ</b>

💰 <b>รายได้วันนี้:</b>
• ฝากเงิน: ${revenueData.today.deposit.toLocaleString()} THB (45.1%)
• ถอนเงิน: ${revenueData.today.withdraw.toLocaleString()} THB (29.8%)
• แลกเปลี่ยน: ${revenueData.today.exchange.toLocaleString()} THB (12.9%)
• โอนเงิน: ${revenueData.today.transfer.toLocaleString()} THB (3.2%)
• VIP: ${revenueData.today.vip.toLocaleString()} THB (9.0%)
<b>รวม: ${revenueData.today.total.toLocaleString()} THB</b>

📅 <b>รายได้สัปดาห์นี้:</b>
• รวม: ${revenueData.week.total.toLocaleString()} THB
• เฉลี่ย/วัน: ${Math.round(revenueData.week.total / 7).toLocaleString()} THB
• เติบโต: +12.4% (vs สัปดาห์ก่อน)

📈 <b>รายได้เดือนนี้:</b>
• รวม: ${revenueData.month.total.toLocaleString()} THB
• เฉลี่ย/วัน: ${Math.round(revenueData.month.total / 30).toLocaleString()} THB
• เติบโต: +18.7% (vs เดือนก่อน)

🎯 <b>เป้าหมายเดือน:</b>
• เป้าหมาย: 1,000,000 THB
• ความคืบหน้า: ${((revenueData.month.total / 1000000) * 100).toFixed(1)}%
• คงเหลือ: ${(1000000 - revenueData.month.total).toLocaleString()} THB

📊 <b>Top 5 แหล่งรายได้:</b>
1. ฝากเงิน THB: ${revenueData.month.deposit.toLocaleString()} THB (45.1%)
2. ถอน USDT: ${revenueData.month.withdraw.toLocaleString()} THB (29.8%)
3. แลกเปลี่ยน: ${revenueData.month.exchange.toLocaleString()} THB (12.9%)
4. VIP Upgrade: ${revenueData.month.vip.toLocaleString()} THB (9.0%)
5. โอนเงิน: ${revenueData.month.transfer.toLocaleString()} THB (3.2%)
    `;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '📊 รายงานรายวัน', callback_data: 'revenue_daily' },
          { text: '📅 รายงานรายเดือน', callback_data: 'revenue_monthly' }
        ],
        [
          { text: '📈 กราฟแนวโน้ม', callback_data: 'revenue_trends' },
          { text: '🔍 วิเคราะห์รายละเอียด', callback_data: 'revenue_analysis' }
        ],
        [
          { text: '📥 Export ข้อมูล', callback_data: 'revenue_export' },
          { text: '📊 Dashboard', callback_data: 'revenue_dashboard' }
        ],
        [
          { text: '🎯 ตั้งเป้าหมาย', callback_data: 'revenue_targets' },
          { text: '📧 รายงานอีเมล', callback_data: 'revenue_email' }
        ],
        [
          { text: '🔙 กลับจัดการค่าบริการ', callback_data: 'fee_management' }
        ]
      ]
    };

    await ctx.reply(revenueMessage, {
      reply_markup: keyboard,
      parse_mode: 'HTML'
    });

  } catch (error) {
    console.error('Fee revenue report error:', error);
    await ctx.reply('❌ ไม่สามารถแสดงรายงานรายได้ได้');
  }
}

// Helper function - should be imported from admin.js
function checkAdminLevel(userId) {
  const userIdStr = userId.toString();
  const ADMIN_CONFIG = {
    SUPER_ADMIN_ID: '100200300',
    MASTER_ADMINS: ['123456789', '987654321'], 
    ADMINS: ['111222333', '444555666']
  };
  
  if (ADMIN_CONFIG.SUPER_ADMIN_ID === userIdStr) {
    return 'SUPER_ADMIN';
  } else if (ADMIN_CONFIG.MASTER_ADMINS.includes(userIdStr)) {
    return 'MASTER_ADMIN';
  } else if (ADMIN_CONFIG.ADMINS.includes(userIdStr)) {
    return 'ADMIN';
  }
  
  return null;
}