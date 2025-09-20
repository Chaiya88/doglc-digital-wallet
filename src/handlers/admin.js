/**
 * Admin Commands Handler for DOGLC Digital Wallet
 * Supports multi-level admin access: Admin, Master Admin, Super Admin
 * Features: OCR monitoring, automated slip verification, alerts management
 */

import { formatCurrency, formatDateTime, logUserActivity } from '../utils/helpers.js';

// Admin user IDs - should be stored in environment variables in production
const ADMIN_CONFIG = {
  MASTER_ADMINS: ['123456789', '987654321'], // Master Admin User IDs
  ADMINS: ['111222333', '444555666'], // Regular Admin User IDs
  SUPER_ADMIN_ID: '100200300' // Super Admin (system owner)
};

/**
 * Check if user has admin privileges
 */
function checkAdminLevel(userId) {
  const userIdStr = userId.toString();
  
  if (ADMIN_CONFIG.SUPER_ADMIN_ID === userIdStr) {
    return 'SUPER_ADMIN';
  } else if (ADMIN_CONFIG.MASTER_ADMINS.includes(userIdStr)) {
    return 'MASTER_ADMIN';
  } else if (ADMIN_CONFIG.ADMINS.includes(userIdStr)) {
    return 'ADMIN';
  }
  
  return null;
}

/**
 * Main admin command handler
 */
export async function handleAdminCommand(ctx, env) {
  try {
    const userId = ctx.from.id.toString();
    const adminLevel = checkAdminLevel(userId);

    if (!adminLevel) {
      await ctx.reply('❌ คุณไม่มีสิทธิ์เข้าถึงระบบ Admin');
      return;
    }

    // Log admin access
    await logUserActivity(userId, {
      action: 'admin_access',
      level: adminLevel,
      timestamp: new Date().toISOString()
    }, env);

    let keyboard;
    let adminMessage = '';

    if (adminLevel === 'SUPER_ADMIN') {
      keyboard = getSuperAdminKeyboard();
      adminMessage = `
🔴 <b>SUPER ADMIN PANEL</b>
👤 <b>Admin:</b> ${ctx.from.first_name} (${adminLevel})

🎛️ <b>ระบบควบคุมหลัก:</b>
• ควบคุมผู้ใช้และธุรกรรมทั้งหมด
• จัดการตั้งค่าระบบ
• ควบคุม Admin ทุกระดับ
• จัดการความปลอดภัย
• ตรวจสอบสลิปและการยืนยัน
• Analytics และ Maintenance

📊 <b>สถิติระบบ:</b>
• ผู้ใช้ทั้งหมด: 15,247 คน
• ธุรกรรมวันนี้: 1,456 รายการ
• ยอดเงินในระบบ: 45.2M THB / 1.2M USDT
• ระบบ OCR: 96.2% ประสิทธิภาพ
      `;
    } else if (adminLevel === 'MASTER_ADMIN') {
      keyboard = getMasterAdminKeyboard();
      adminMessage = `
🟡 <b>MASTER ADMIN PANEL</b>
👤 <b>Admin:</b> ${ctx.from.first_name} (${adminLevel})

💼 <b>การจัดการธุรกิจ:</b>
• จัดการผู้ใช้และ VIP
• ควบคุมธุรกรรมและค่าบริการ
• รายงานและอนุมัติ
• จัดการบัญชีธนาคาร
• ตรวจสอบระบบ OCR

📈 <b>สถิติประจำวัน:</b>
• ธุรกรรมใหม่: 1,456 รายการ
• รอการอนุมัติ: 23 รายการ
• ระบบ OCR: ตรวจสอบ 1,234 รายการ
• รายได้ค่าธรรมเนียม: 27,630 THB
      `;
    } else {
      keyboard = getRegularAdminKeyboard();
      adminMessage = `
🟢 <b>ADMIN PANEL</b>
👤 <b>Admin:</b> ${ctx.from.first_name} (${adminLevel})

🎯 <b>งานประจำวัน:</b>
• ดูแลลูกค้าและการสนับสนุน
• อนุมัติฝากเงินและธุรกรรม
• ตรวจสอบระบบ OCR
• รายงานและแจ้งเตือน

📋 <b>งานรอดำเนินการ:</b>
• ฝากเงินรออนุมัติ: 12 รายการ
• Support Tickets: 5 รายการ
• OCR ต้องตรวจสอบ: 8 รายการ
• การร้องเรียน: 2 รายการ
      `;
    }

    await ctx.reply(adminMessage, {
      reply_markup: keyboard,
      parse_mode: 'HTML'
    });

  } catch (error) {
    console.error('Admin command error:', error);
    await ctx.reply('❌ เกิดข้อผิดพลาดในระบบ Admin');
  }
}

/**
 * Super Admin keyboard (full access)
 */
function getSuperAdminKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '👥 จัดการผู้ใช้', callback_data: 'admin_users' },
        { text: '💰 จัดการธุรกรรม', callback_data: 'admin_transactions' }
      ],
      [
        { text: '⚙️ ตั้งค่าระบบ', callback_data: 'admin_system_settings' },
        { text: '💸 จัดการค่าบริการ', callback_data: 'fee_management' }
      ],
      [
        { text: '💱 จัดการอัตราแลกเปลี่ยน', callback_data: 'admin_exchange_rates' },
        { text: '🛡️ จัดการ Admin', callback_data: 'admin_manage_admins' }
      ],
      [
        { text: '📊 รายงานระบบ', callback_data: 'admin_system_reports' },
        { text: '🏦 จัดการบัญชีธนาคาร', callback_data: 'admin_bank_management' }
      ],
      [
        { text: '🤖 ระบบ OCR', callback_data: 'admin_ocr_monitoring' },
        { text: '🔒 ความปลอดภัย', callback_data: 'admin_security' }
      ],
      [
        { text: '📈 Analytics', callback_data: 'admin_analytics' },
        { text: '🔧 Maintenance', callback_data: 'admin_maintenance' }
      ],
      [
        { text: '🔙 กลับเมนูหลัก', callback_data: 'main_menu' }
      ]
    ]
  };
}

/**
 * Master Admin keyboard (high privileges)
 */
function getMasterAdminKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '👥 จัดการผู้ใช้', callback_data: 'admin_users' },
        { text: '💰 จัดการธุรกรรม', callback_data: 'admin_transactions' }
      ],
      [
        { text: '💱 อัตราแลกเปลี่ยน', callback_data: 'admin_exchange_rates' },
        { text: '💸 จัดการค่าบริการ', callback_data: 'fee_management' }
      ],
      [
        { text: '🎖️ จัดการ VIP', callback_data: 'admin_vip_management' },
        { text: '📊 รายงานผู้ใช้', callback_data: 'admin_user_reports' }
      ],
      [
        { text: '🚫 บล็อกผู้ใช้', callback_data: 'admin_block_users' },
        { text: '📢 ส่งประกาศ', callback_data: 'admin_broadcast' }
      ],
      [
        { text: '🤖 ระบบ OCR', callback_data: 'admin_ocr_monitoring' },
        { text: '📈 สถิติรายวัน', callback_data: 'admin_daily_stats' }
      ],
      [
        { text: '🏦 จัดการบัญชีธนาคาร', callback_data: 'admin_bank_management' },
        { text: '⚠️ จัดการแจ้งเตือน', callback_data: 'admin_alerts_management' }
      ],
      [
        { text: '🔙 กลับเมนูหลัก', callback_data: 'main_menu' }
      ]
    ]
  };
}

/**
 * Regular Admin keyboard (limited access)
 */
function getRegularAdminKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '👤 ค้นหาผู้ใช้', callback_data: 'admin_search_user' },
        { text: '💳 ตรวจสอบธุรกรรม', callback_data: 'admin_check_transaction' }
      ],
      [
        { text: '📋 รายการรอดำเนินการ', callback_data: 'admin_pending_list' },
        { text: '✅ อนุมัติฝากเงิน', callback_data: 'admin_approve_deposits' }
      ],
      [
        { text: '🤖 ตรวจสอบ OCR', callback_data: 'admin_ocr_monitoring' },
        { text: '📞 รายการติดต่อ', callback_data: 'admin_support_tickets' }
      ],
      [
        { text: '📊 รายงานประจำวัน', callback_data: 'admin_daily_report' },
        { text: '⚠️ รายการเตือน', callback_data: 'admin_alerts' }
      ],
      [
        { text: '🔙 กลับเมนูหลัก', callback_data: 'main_menu' }
      ]
    ]
  };
}

/**
 * Handle user management
 */
export async function handleUserManagement(ctx, env) {
  try {
    const adminLevel = checkAdminLevel(ctx.from.id);
    if (!adminLevel) {
      await ctx.reply('❌ ไม่มีสิทธิ์เข้าถึง');
      return;
    }

    const userStatsMessage = `
👥 <b>จัดการผู้ใช้ - User Management</b>

📊 <b>สถิติผู้ใช้:</b>
• ผู้ใช้ทั้งหมด: 15,247 คน
• ออนไลน์ตอนนี้: 247 คน
• สมาชิกใหม่วันนี้: 89 คน
• ผู้ใช้ที่ยืนยันเบอร์โทร: 12,156 คน

🎖️ <b>ระดับ VIP:</b>
• Bronze: 10,234 คน (67%)
• Silver: 3,456 คน (23%)
• Gold: 1,234 คน (8%)
• Platinum: 323 คน (2%)

💰 <b>ธุรกรรมวันนี้:</b>
• ฝากเงิน: 456 รายการ
• ถอนเงิน: 234 รายการ
• โอนเงิน: 123 รายการ
• แลกเปลี่ยน: 89 รายการ

⚠️ <b>รายการแจ้งเตือน:</b>
• ธุรกรรมใหญ่: 12 รายการ
• ธุรกรรมรอการอนุมัติ: 8 รายการ
• การร้องเรียน: 3 รายการ

🔍 <b>เครื่องมือค้นหา:</b>
• ค้นหาด้วย User ID
• ค้นหาด้วยชื่อ
• ค้นหาด้วย Telegram Username
• กรองตามสถานะ
    `;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '🔍 ค้นหาผู้ใช้', callback_data: 'admin_search_user' },
          { text: '📋 รายชื่อผู้ใช้', callback_data: 'admin_user_list' }
        ],
        [
          { text: '🚫 บล็อกผู้ใช้', callback_data: 'admin_block_user' },
          { text: '✅ ปลดบล็อกผู้ใช้', callback_data: 'admin_unblock_user' }
        ],
        [
          { text: '🎖️ อัพเกรด VIP', callback_data: 'admin_upgrade_vip' },
          { text: '📉 ลดระดับ VIP', callback_data: 'admin_downgrade_vip' }
        ],
        [
          { text: '💰 ปรับยอดเงิน', callback_data: 'admin_adjust_balance' },
          { text: '📊 ประวัติผู้ใช้', callback_data: 'admin_user_history' }
        ],
        [
          { text: '📞 ข้อความซัพพอร์ต', callback_data: 'admin_support_messages' },
          { text: '⚠️ รายงานปัญหา', callback_data: 'admin_user_reports' }
        ],
        [
          { text: '🔙 กลับ Admin Panel', callback_data: 'admin_main' }
        ]
      ]
    };

    await ctx.reply(userStatsMessage, {
      reply_markup: keyboard,
      parse_mode: 'HTML'
    });

  } catch (error) {
    console.error('User management error:', error);
    await ctx.reply('❌ เกิดข้อผิดพลาดในการจัดการผู้ใช้');
  }
}

/**
 * Handle transaction management
 */
export async function handleTransactionManagement(ctx, env) {
  try {
    const adminLevel = checkAdminLevel(ctx.from.id);
    if (!adminLevel) {
      await ctx.reply('❌ ไม่มีสิทธิ์เข้าถึง');
      return;
    }

    const transactionMessage = `
💰 <b>จัดการธุรกรรม - Transaction Management</b>

📊 <b>สถิติธุรกรรมวันนี้:</b>
• ฝากเงิน: 456 รายการ (45.2M THB)
• ถอนเงิน: 234 รายการ (12.8M THB / 342K USDT)
• โอนเงินภายใน: 123 รายการ
• แลกเปลี่ยน: 89 รายการ

⏳ <b>รอการดำเนินการ:</b>
• รอตรวจสอบสลิป: 23 รายการ
• รอการอนุมัติ: 8 รายการ
• รอการยืนยัน: 5 รายการ

💳 <b>ธุรกรรมใหญ่ (>100K THB):</b>
• รายการใหม่: 12 รายการ
• ต้องตรวจสอบเพิ่ม: 3 รายการ
• อนุมัติแล้ว: 8 รายการ

🎯 <b>ประสิทธิภาพ:</b>
• เวลาเฉลี่ยการอนุมัติ: 15 นาที
• อัตราการอนุมัติ: 98.2%
• ความพึงพอใจ: 4.8/5.0
    `;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '📋 รายการรอการอนุมัติ', callback_data: 'admin_pending_transactions' },
          { text: '✅ อนุมัติด่วน', callback_data: 'admin_quick_approve' }
        ],
        [
          { text: '🔍 ค้นหาธุรกรรม', callback_data: 'admin_search_transaction' },
          { text: '📊 รายงานธุรกรรม', callback_data: 'admin_transaction_report' }
        ],
        [
          { text: '💰 ธุรกรรมใหญ่', callback_data: 'admin_large_transactions' },
          { text: '⚠️ ธุรกรรมผิดปกติ', callback_data: 'admin_suspicious_transactions' }
        ],
        [
          { text: '🏦 ตามธนาคาร', callback_data: 'admin_bank_transactions' },
          { text: '👤 ตามผู้ใช้', callback_data: 'admin_user_transactions' }
        ],
        [
          { text: '📈 สถิติเรียลไทม์', callback_data: 'admin_realtime_stats' },
          { text: '🔄 รีเฟรชข้อมูล', callback_data: 'admin_refresh_data' }
        ],
        [
          { text: '🔙 กลับ Admin Panel', callback_data: 'admin_main' }
        ]
      ]
    };

    await ctx.reply(transactionMessage, {
      reply_markup: keyboard,
      parse_mode: 'HTML'
    });

  } catch (error) {
    console.error('Transaction management error:', error);
    await ctx.reply('❌ เกิดข้อผิดพลาดในการจัดการธุรกรรม');
  }
}

/**
 * Handle system settings
 */
export async function handleSystemSettings(ctx, env) {
  try {
    const adminLevel = checkAdminLevel(ctx.from.id);
    if (!adminLevel || adminLevel === 'ADMIN') {
      await ctx.reply('❌ ต้องเป็น Master Admin ขึ้นไป');
      return;
    }

    const systemMessage = `
⚙️ <b>ตั้งค่าระบบ - System Settings</b>

🎛️ <b>การตั้งค่าหลัก:</b>
• อัตราแลกเปลี่ยน: อัตโนมัติ (API)
• ค่าธรรมเนียม: ตามระดับ VIP
• ลิมิตการฝาก: 100-50,000 THB/วัน
• ลิมิตการถอน: 10-5,000 USDT/วัน

🛡️ <b>ความปลอดภัย:</b>
• Rate Limiting: เปิดใช้งาน
• 2FA สำหรับ Admin: เปิดใช้งาน
• OCR Verification: เปิดใช้งาน (96.2%)
• Auto Block: เปิดใช้งาน

📊 <b>ลิมิตต่างๆ:</b>
• ฝากขั้นต่ำ: 100 THB
• ฝากสูงสุด: 50,000 THB/วัน
• ถอนขั้นต่ำ: 10 USDT
• ถอนสูงสุด: 5,000 USDT/วัน

🤖 <b>ระบบอัตโนมัติ:</b>
• OCR Processing: เปิดใช้งาน
• Gmail Notifications: เปิดใช้งาน
• Auto-Approval: เปิดใช้งาน (<100K THB)
• Risk Management: เปิดใช้งาน
    `;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '💱 ตั้งค่าอัตราแลกเปลี่ยน', callback_data: 'admin_set_exchange_rate' },
          { text: '💸 ตั้งค่าค่าธรรมเนียม', callback_data: 'admin_set_fees' }
        ],
        [
          { text: '📈 ตั้งค่าลิมิต', callback_data: 'admin_set_limits' },
          { text: '🛡️ ตั้งค่าความปลอดภัย', callback_data: 'admin_security_settings' }
        ],
        [
          { text: '🤖 ตั้งค่า OCR', callback_data: 'admin_ocr_settings' },
          { text: '📧 ตั้งค่า Gmail API', callback_data: 'admin_gmail_settings' }
        ],
        [
          { text: '🔔 ตั้งค่าการแจ้งเตือน', callback_data: 'admin_notification_settings' },
          { text: '🗄️ จัดการฐานข้อมูล', callback_data: 'admin_database_management' }
        ],
        [
          { text: '🔄 Backup & Restore', callback_data: 'admin_backup_restore' },
          { text: '🔄 รีสตาร์ทระบบ', callback_data: 'admin_system_restart' }
        ],
        [
          { text: '🔙 กลับ Admin Panel', callback_data: 'admin_main' }
        ]
      ]
    };

    await ctx.reply(systemMessage, {
      reply_markup: keyboard,
      parse_mode: 'HTML'
    });

  } catch (error) {
    console.error('System settings error:', error);
    await ctx.reply('❌ เกิดข้อผิดพลาดในการตั้งค่าระบบ');
  }
}

/**
 * Handle OCR system monitoring (main feature)
 */
export async function handleOCRSystemMonitoring(ctx, env) {
  try {
    const adminLevel = checkAdminLevel(ctx.from.id);
    if (!adminLevel) {
      await ctx.reply('❌ ไม่มีสิทธิ์เข้าถึง');
      return;
    }

    const ocrMonitoringMessage = `
🤖 <b>ระบบ OCR และการตรวจสอบอัตโนมัติ</b>

🎯 <b>ประสิทธิภาพ OCR วันนี้:</b>
• สลิปที่ตรวจสอบ: 1,234 รายการ
• ตรวจสอบสำเร็จ: 1,187 รายการ (96.2%)
• ต้องตรวจสอบด้วยตา: 47 รายการ (3.8%)
• ผิดพลาด: 0 รายการ

📧 <b>Gmail Notifications:</b>
• อีเมลจากธนาคาร: 892 รายการ
• ตรวจสอบแล้ว: 892 รายการ (100%)
• จับคู่สำเร็จ: 845 รายการ (94.7%)
• ไม่พบรายการ: 47 รายการ (5.3%)

⏱️ <b>เวลาเฉลี่ยในการประมวลผล:</b>
• OCR Processing: 15 วินาที
• Gmail Verification: 8 วินาที
• รวม: 23 วินาที (เป้าหมาย: <30 วินาที)

🏦 <b>ประสิทธิภาพแยกตามธนาคาร:</b>
• กสิกรไทย: 98.5% (343/349)
• ไทยพาณิชย์: 97.1% (268/276)
• กรุงเทพ: 95.8% (229/239)
• ธ.กรุงไทย: 94.2% (147/156)

🔍 <b>สลิปที่ต้องตรวจสอบด้วยตา:</b>
• ภาพไม่ชัด: 23 รายการ
• ข้อมูลไม่ครบ: 15 รายการ
• ธนาคารไม่รองรับ: 9 รายการ

⚡ <b>ระบบ Auto-Approval:</b>
• อนุมัติอัตโนมัติ: 1,142 รายการ (92.5%)
• ส่งให้ Admin ตรวจ: 92 รายการ (7.5%)
• Threshold: >100,000 THB หรือ Confidence <85%
    `;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '🔍 สลิปรอตรวจสอบ', callback_data: 'admin_pending_manual_review' },
          { text: '📊 สถิติ OCR', callback_data: 'admin_ocr_statistics' }
        ],
        [
          { text: '📧 Gmail Monitoring', callback_data: 'admin_gmail_monitoring' },
          { text: '⚙️ ตั้งค่า OCR', callback_data: 'admin_ocr_settings' }
        ],
        [
          { text: '🏦 ประสิทธิภาพธนาคาร', callback_data: 'admin_bank_performance' },
          { text: '🎯 ปรับ Threshold', callback_data: 'admin_adjust_threshold' }
        ],
        [
          { text: '🔄 รีสตาร์ท OCR', callback_data: 'admin_restart_ocr' },
          { text: '📈 รายงานประจำวัน', callback_data: 'admin_ocr_daily_report' }
        ],
        [
          { text: '🔙 กลับ Admin Panel', callback_data: 'admin_main' }
        ]
      ]
    };

    await ctx.reply(ocrMonitoringMessage, {
      reply_markup: keyboard,
      parse_mode: 'HTML'
    });

  } catch (error) {
    console.error('OCR monitoring error:', error);
    await ctx.reply('❌ เกิดข้อผิดพลาดในการตรวจสอบระบบ OCR');
  }
}

/**
 * Handle alerts management
 */
export async function handleAlertsManagement(ctx, env) {
  try {
    const adminLevel = checkAdminLevel(ctx.from.id);
    if (!adminLevel) {
      await ctx.reply('❌ ไม่มีสิทธิ์เข้าถึง');
      return;
    }

    const alertsMessage = `
⚠️ <b>จัดการแจ้งเตือน - Alerts Management</b>

🚨 <b>การแจ้งเตือนที่สำคัญ:</b>
• ธุรกรรมยอดใหญ่: 12 รายการ
• ธุรกรรมผิดปกติ: 5 รายการ
• ความล่าช้าในการโอน: 3 รายการ
• ปัญหาระบบ: 1 รายการ

💰 <b>ธุรกรรมที่ต้องตรวจสอบ:</b>
• > 100,000 THB: 8 รายการ
• > 500,000 THB: 3 รายการ  
• > 1,000,000 THB: 1 รายการ

👤 <b>ผู้ใช้ที่ต้องสังเกต:</b>
• ทำธุรกรรมบ่อย: 15 คน
• ยอดเงินสูงผิดปกติ: 5 คน
• พฤติกรรมน่าสงสัย: 2 คน

🔄 <b>สถานะระบบ:</b>
• API ตอบสนองช้า: 2 เซอร์วิส
• อัตราแลกเปลี่ยนล่าช้า: ปกติ
• การเชื่อมต่อธนาคาร: ปกติ

📈 <b>แนวโน้มการแจ้งเตือน:</b>
• วันนี้: 21 รายการ
• เมื่อวาน: 18 รายการ
• เฉลี่ย 7 วัน: 19 รายการ
    `;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '🚨 แจ้งเตือนเร่งด่วน', callback_data: 'admin_urgent_alerts' },
          { text: '💰 ธุรกรรมยอดใหญ่', callback_data: 'admin_large_transactions' }
        ],
        [
          { text: '👤 ผู้ใช้น่าสงสัย', callback_data: 'admin_suspicious_users' },
          { text: '🔄 สถานะระบบ', callback_data: 'admin_system_status' }
        ],
        [
          { text: '📊 รายงานแจ้งเตือน', callback_data: 'admin_alerts_report' },
          { text: '⚙️ ตั้งค่าแจ้งเตือน', callback_data: 'admin_alert_settings' }
        ],
        [
          { text: '🔕 ปิดแจ้งเตือน', callback_data: 'admin_dismiss_alert' },
          { text: '📧 ส่งรายงาน', callback_data: 'admin_send_alert_report' }
        ],
        [
          { text: '🔙 กลับ Admin Panel', callback_data: 'admin_main' }
        ]
      ]
    };

    await ctx.reply(alertsMessage, {
      reply_markup: keyboard,
      parse_mode: 'HTML'
    });

  } catch (error) {
    console.error('Alerts management error:', error);
    await ctx.reply('❌ เกิดข้อผิดพลาดในการจัดการแจ้งเตือน');
  }
}

/**
 * Handle analytics (Master Admin+ only)
 */
export async function handleAnalytics(ctx, env) {
  try {
    const adminLevel = checkAdminLevel(ctx.from.id);
    if (!adminLevel || adminLevel === 'ADMIN') {
      await ctx.reply('❌ ต้องเป็น Master Admin ขึ้นไป');
      return;
    }

    const analyticsMessage = `
📈 <b>Analytics Dashboard</b>

💰 <b>รายได้และกำไร:</b>
• รายได้วันนี้: 27,630 THB
• รายได้สัปดาห์: 193,410 THB
• รายได้เดือน: 830,500 THB
• เติบโต: +18.7% (เทียบเดือนก่อน)

👥 <b>ผู้ใช้งาน:</b>
• ผู้ใช้ใหม่วันนี้: 89 คน
• ผู้ใช้ที่ใช้งาน: 1,456 คน
• Retention Rate: 78.5%
• VIP Conversion: 32.1%

🔄 <b>ธุรกรรม:</b>
• ปริมาณธุรกรรม: 58.2M THB
• จำนวนธุรกรรม: 902 รายการ
• เฉลี่ยต่อรายการ: 64,523 THB
• Success Rate: 98.2%

🎯 <b>ประสิทธิภาพ:</b>
• OCR Accuracy: 96.2%
• Auto-Approval: 92.5%
• Customer Satisfaction: 4.8/5
• Response Time: 23 วินาที
    `;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '💰 รายงานรายได้', callback_data: 'analytics_revenue' },
          { text: '👥 รายงานผู้ใช้', callback_data: 'analytics_users' }
        ],
        [
          { text: '🔄 รายงานธุรกรรม', callback_data: 'analytics_transactions' },
          { text: '🎖️ รายงาน VIP', callback_data: 'analytics_vip' }
        ],
        [
          { text: '📊 กราฟแนวโน้ม', callback_data: 'analytics_trends' },
          { text: '🔍 วิเคราะห์เชิงลึก', callback_data: 'analytics_deep_dive' }
        ],
        [
          { text: '📧 ส่งรายงาน', callback_data: 'analytics_email_report' },
          { text: '📥 Export ข้อมูล', callback_data: 'analytics_export' }
        ],
        [
          { text: '🔙 กลับ Admin Panel', callback_data: 'admin_main' }
        ]
      ]
    };

    await ctx.reply(analyticsMessage, {
      reply_markup: keyboard,
      parse_mode: 'HTML'
    });

  } catch (error) {
    console.error('Analytics error:', error);
    await ctx.reply('❌ เกิดข้อผิดพลาดในการดู Analytics');
  }
}