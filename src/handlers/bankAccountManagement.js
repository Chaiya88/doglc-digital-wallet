/**
 * Bank Account Management System for Admin
 * Allows Master Admin to add, suspend, and delete bank accounts
 */

import { logUserActivity } from '../utils/helpers.js';

// Mock bank accounts data - should be stored in database in production
const BANK_ACCOUNTS = [
  {
    id: 'bank_001',
    bank_code: 'KBANK',
    bank_name: 'กสิกรไทย',
    account_number: '123-4-56789-0',
    account_name: 'DOGLC DIGITAL WALLET',
    branch: 'สีลม',
    status: 'ACTIVE',
    daily_limit: 1000000,
    monthly_limit: 30000000,
    current_daily_usage: 245000,
    current_monthly_usage: 5230000,
    created_date: '2025-08-01',
    last_used: '2025-09-20',
    total_received: 125000000,
    transaction_count: 2456
  },
  {
    id: 'bank_002',
    bank_code: 'SCB',
    bank_name: 'ไทยพาณิชย์',
    account_number: '234-5-67890-1',
    account_name: 'DOGLC DIGITAL WALLET',
    branch: 'สยาม',
    status: 'ACTIVE',
    daily_limit: 800000,
    monthly_limit: 25000000,
    current_daily_usage: 156000,
    current_monthly_usage: 3890000,
    created_date: '2025-08-01',
    last_used: '2025-09-19',
    total_received: 89000000,
    transaction_count: 1789
  },
  {
    id: 'bank_003',
    bank_code: 'BBL',
    bank_name: 'กรุงเทพ',
    account_number: '345-6-78901-2',
    account_name: 'DOGLC DIGITAL WALLET',
    branch: 'อโศก',
    status: 'SUSPENDED',
    daily_limit: 500000,
    monthly_limit: 15000000,
    current_daily_usage: 0,
    current_monthly_usage: 45000,
    created_date: '2025-07-15',
    last_used: '2025-09-15',
    total_received: 25000000,
    transaction_count: 567
  }
];

/**
 * Main bank account management handler
 */
export async function handleBankAccountManagement(ctx, env) {
  try {
    const adminLevel = checkAdminLevel(ctx.from.id);
    if (!adminLevel || adminLevel === 'ADMIN') {
      await ctx.reply('❌ ต้องเป็น Master Admin ขึ้นไป');
      return;
    }

    await logUserActivity(ctx.from.id.toString(), {
      action: 'bank_account_management_access',
      admin_level: adminLevel,
      timestamp: new Date().toISOString()
    }, env);

    const bankManagementMessage = `
🏦 <b>จัดการบัญชีธนาคาร - Bank Account Management</b>

📊 <b>สรุปบัญชีทั้งหมด:</b>
• บัญชีทั้งหมด: ${BANK_ACCOUNTS.length} บัญชี
• ใช้งานได้: ${BANK_ACCOUNTS.filter(acc => acc.status === 'ACTIVE').length} บัญชี
• ถูกพัก: ${BANK_ACCOUNTS.filter(acc => acc.status === 'SUSPENDED').length} บัญชี
• รับเงินวันนี้: ${BANK_ACCOUNTS.reduce((sum, acc) => sum + acc.current_daily_usage, 0).toLocaleString()} THB

💰 <b>วงเงินรวม:</b>
• วงเงินรายวัน: ${BANK_ACCOUNTS.reduce((sum, acc) => sum + acc.daily_limit, 0).toLocaleString()} THB
• ใช้แล้ววันนี้: ${BANK_ACCOUNTS.reduce((sum, acc) => sum + acc.current_daily_usage, 0).toLocaleString()} THB
• คงเหลือวันนี้: ${BANK_ACCOUNTS.reduce((sum, acc) => sum + (acc.daily_limit - acc.current_daily_usage), 0).toLocaleString()} THB

⚠️ <b>สถานะเตือน:</b>
• บัญชีใกล้เต็ม: ${BANK_ACCOUNTS.filter(acc => (acc.current_daily_usage / acc.daily_limit) > 0.8).length} บัญชี
• บัญชีถูกพัก: ${BANK_ACCOUNTS.filter(acc => acc.status === 'SUSPENDED').length} บัญชี
• บัญชีไม่ได้ใช้: ${BANK_ACCOUNTS.filter(acc => {
      const lastUsed = new Date(acc.last_used);
      const daysDiff = (new Date() - lastUsed) / (1000 * 60 * 60 * 24);
      return daysDiff > 7;
    }).length} บัญชี
    `;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '📋 รายการบัญชี', callback_data: 'bank_list_accounts' },
          { text: '➕ เพิ่มบัญชีใหม่', callback_data: 'bank_add_account' }
        ],
        [
          { text: '⏸️ พักบัญชี', callback_data: 'bank_suspend_account' },
          { text: '▶️ เปิดใช้บัญชี', callback_data: 'bank_activate_account' }
        ],
        [
          { text: '🗑️ ลบบัญชี', callback_data: 'bank_delete_account' },
          { text: '✏️ แก้ไขบัญชี', callback_data: 'bank_edit_account' }
        ],
        [
          { text: '📊 สถิติการใช้งาน', callback_data: 'bank_usage_stats' },
          { text: '⚙️ ตั้งค่าวงเงิน', callback_data: 'bank_set_limits' }
        ],
        [
          { text: '🔍 ตรวจสอบรายการ', callback_data: 'bank_check_transactions' },
          { text: '📈 รายงานประจำวัน', callback_data: 'bank_daily_report' }
        ],
        [
          { text: '🔙 กลับ Admin Panel', callback_data: 'admin_main' }
        ]
      ]
    };

    await ctx.reply(bankManagementMessage, {
      reply_markup: keyboard,
      parse_mode: 'HTML'
    });

  } catch (error) {
    console.error('Bank account management error:', error);
    await ctx.reply('❌ เกิดข้อผิดพลาดในการจัดการบัญชีธนาคาร');
  }
}

/**
 * List all bank accounts
 */
export async function handleListBankAccounts(ctx, env) {
  try {
    const adminLevel = checkAdminLevel(ctx.from.id);
    if (!adminLevel || adminLevel === 'ADMIN') {
      await ctx.reply('❌ ไม่มีสิทธิ์เข้าถึง');
      return;
    }

    let accountList = '🏦 <b>รายการบัญชีธนาคารทั้งหมด</b>\n\n';

    BANK_ACCOUNTS.forEach((account, index) => {
      const statusEmoji = account.status === 'ACTIVE' ? '🟢' : '🔴';
      const usagePercent = ((account.current_daily_usage / account.daily_limit) * 100).toFixed(1);
      
      accountList += `${statusEmoji} <b>${account.bank_name} (${account.bank_code})</b>\n`;
      accountList += `📱 เลขบัญชี: <code>${account.account_number}</code>\n`;
      accountList += `🏢 สาขา: ${account.branch}\n`;
      accountList += `📊 สถานะ: ${account.status}\n`;
      accountList += `💰 ใช้งานวันนี้: ${account.current_daily_usage.toLocaleString()}/${account.daily_limit.toLocaleString()} THB (${usagePercent}%)\n`;
      accountList += `📅 ใช้ล่าสุด: ${new Date(account.last_used).toLocaleDateString('th-TH')}\n`;
      accountList += `🔢 รายการทั้งหมด: ${account.transaction_count.toLocaleString()}\n`;
      accountList += `💵 ยอดรวมที่รับ: ${account.total_received.toLocaleString()} THB\n\n`;
    });

    const keyboard = {
      inline_keyboard: [
        [
          { text: '➕ เพิ่มบัญชีใหม่', callback_data: 'bank_add_account' },
          { text: '✏️ แก้ไขบัญชี', callback_data: 'bank_edit_account' }
        ],
        [
          { text: '⏸️ พักบัญชี', callback_data: 'bank_suspend_account' },
          { text: '▶️ เปิดใช้บัญชี', callback_data: 'bank_activate_account' }
        ],
        [
          { text: '🗑️ ลบบัญชี', callback_data: 'bank_delete_account' },
          { text: '🔄 รีเฟรช', callback_data: 'bank_list_accounts' }
        ],
        [
          { text: '🔙 กลับจัดการบัญชี', callback_data: 'bank_management' }
        ]
      ]
    };

    await ctx.reply(accountList, {
      reply_markup: keyboard,
      parse_mode: 'HTML'
    });

  } catch (error) {
    console.error('List bank accounts error:', error);
    await ctx.reply('❌ ไม่สามารถแสดงรายการบัญชีได้');
  }
}

/**
 * Add new bank account
 */
export async function handleAddBankAccount(ctx, env) {
  try {
    const adminLevel = checkAdminLevel(ctx.from.id);
    if (!adminLevel || adminLevel === 'ADMIN') {
      await ctx.reply('❌ ไม่มีสิทธิ์เข้าถึง');
      return;
    }

    const addAccountMessage = `
➕ <b>เพิ่มบัญชีธนาคารใหม่</b>

📋 <b>ข้อมูลที่ต้องกรอก:</b>

1️⃣ <b>ธนาคาร:</b>
   เลือกธนาคารที่ต้องการเพิ่ม

2️⃣ <b>เลขบัญชี:</b>
   ระบุเลขบัญชีธนาคาร

3️⃣ <b>ชื่อบัญชี:</b>
   ชื่อเจ้าของบัญชี

4️⃣ <b>สาขา:</b>
   สาขาที่เปิดบัญชี

5️⃣ <b>วงเงิน:</b>
   กำหนดวงเงินรายวันและรายเดือน

⚠️ <b>หมายเหตุ:</b>
• ตรวจสอบข้อมูลให้ถูกต้อง
• บัญชีใหม่จะอยู่ในสถานะ "รอยืนยัน"
• ต้องทดสอบการโอนก่อนเปิดใช้จริง
    `;

    const bankSelection = {
      inline_keyboard: [
        [
          { text: '🏦 กสิกรไทย (KBANK)', callback_data: 'bank_add_kbank' },
          { text: '🏦 ไทยพาณิชย์ (SCB)', callback_data: 'bank_add_scb' }
        ],
        [
          { text: '🏦 กรุงเทพ (BBL)', callback_data: 'bank_add_bbl' },
          { text: '🏦 กรุงไทย (KTB)', callback_data: 'bank_add_ktb' }
        ],
        [
          { text: '🏦 ทีเอ็มบี (TMB)', callback_data: 'bank_add_tmb' },
          { text: '🏦 กรุงศรี (BAY)', callback_data: 'bank_add_bay' }
        ],
        [
          { text: '🏦 ยูโอบี (UOB)', callback_data: 'bank_add_uob' },
          { text: '🏦 ซีไอเอ็มบี (CIMB)', callback_data: 'bank_add_cimb' }
        ],
        [
          { text: '🔙 ยกเลิก', callback_data: 'bank_management' }
        ]
      ]
    };

    await ctx.reply(addAccountMessage, {
      reply_markup: bankSelection,
      parse_mode: 'HTML'
    });

  } catch (error) {
    console.error('Add bank account error:', error);
    await ctx.reply('❌ ไม่สามารถเพิ่มบัญชีใหม่ได้');
  }
}

/**
 * Suspend bank account
 */
export async function handleSuspendBankAccount(ctx, env) {
  try {
    const adminLevel = checkAdminLevel(ctx.from.id);
    if (!adminLevel || adminLevel === 'ADMIN') {
      await ctx.reply('❌ ไม่มีสิทธิ์เข้าถึง');
      return;
    }

    const activeAccounts = BANK_ACCOUNTS.filter(acc => acc.status === 'ACTIVE');
    
    if (activeAccounts.length === 0) {
      await ctx.reply('❌ ไม่มีบัญชีที่สามารถพักได้');
      return;
    }

    const suspendMessage = `
⏸️ <b>พักการใช้งานบัญชีธนาคาร</b>

⚠️ <b>คำเตือน:</b>
• การพักบัญชีจะหยุดการรับฝากเงินทันที
• ผู้ใช้จะไม่เห็นบัญชีนี้ในรายการฝากเงิน
• ยังสามารถเปิดใช้ใหม่ได้ภายหลัง

📋 <b>เลือกบัญชีที่ต้องการพัก:</b>

${activeAccounts.map((account, index) => {
  const usagePercent = ((account.current_daily_usage / account.daily_limit) * 100).toFixed(1);
  return `${index + 1}. ${account.bank_name} (${account.account_number})
   💰 ใช้งาน: ${usagePercent}% | รายการ: ${account.transaction_count}`;
}).join('\n\n')}

🎯 <b>เหตุผลที่ควรพัก:</b>
• บัญชีใกล้เต็มวงเงิน
• พบปัญหาในการรับเงิน
• บำรุงรักษาระบบธนาคาร
• ป้องกันความเสี่ยง
    `;

    const keyboard = {
      inline_keyboard: activeAccounts.map((account, index) => [
        { 
          text: `⏸️ พัก ${account.bank_name} (${account.bank_code})`, 
          callback_data: `bank_suspend_${account.id}` 
        }
      ]).concat([[
        { text: '🔙 ยกเลิก', callback_data: 'bank_management' }
      ]])
    };

    await ctx.reply(suspendMessage, {
      reply_markup: keyboard,
      parse_mode: 'HTML'
    });

  } catch (error) {
    console.error('Suspend bank account error:', error);
    await ctx.reply('❌ ไม่สามารถพักบัญชีได้');
  }
}

/**
 * Activate bank account
 */
export async function handleActivateBankAccount(ctx, env) {
  try {
    const adminLevel = checkAdminLevel(ctx.from.id);
    if (!adminLevel || adminLevel === 'ADMIN') {
      await ctx.reply('❌ ไม่มีสิทธิ์เข้าถึง');
      return;
    }

    const suspendedAccounts = BANK_ACCOUNTS.filter(acc => acc.status === 'SUSPENDED');
    
    if (suspendedAccounts.length === 0) {
      await ctx.reply('❌ ไม่มีบัญชีที่ถูกพัก');
      return;
    }

    const activateMessage = `
▶️ <b>เปิดใช้งานบัญชีธนาคาร</b>

✅ <b>หมายเหตุ:</b>
• การเปิดใช้บัญชีจะทำให้สามารถรับฝากเงินได้ทันที
• ผู้ใช้จะเห็นบัญชีนี้ในรายการฝากเงิน
• ตรวจสอบสถานะบัญชีก่อนเปิดใช้

📋 <b>บัญชีที่ถูกพัก:</b>

${suspendedAccounts.map((account, index) => {
  const daysSuspended = Math.floor((new Date() - new Date(account.last_used)) / (1000 * 60 * 60 * 24));
  return `${index + 1}. ${account.bank_name} (${account.account_number})
   📅 พักมา: ${daysSuspended} วัน | รายการ: ${account.transaction_count}`;
}).join('\n\n')}

🔍 <b>ควรตรวจสอบ:</b>
• สถานะบัญชีกับธนาคาร
• วงเงินการรับโอน
• ระบบการแจ้งเตือน
• การเชื่อมต่อ API
    `;

    const keyboard = {
      inline_keyboard: suspendedAccounts.map((account, index) => [
        { 
          text: `▶️ เปิด ${account.bank_name} (${account.bank_code})`, 
          callback_data: `bank_activate_${account.id}` 
        }
      ]).concat([[
        { text: '🔙 ยกเลิก', callback_data: 'bank_management' }
      ]])
    };

    await ctx.reply(activateMessage, {
      reply_markup: keyboard,
      parse_mode: 'HTML'
    });

  } catch (error) {
    console.error('Activate bank account error:', error);
    await ctx.reply('❌ ไม่สามารถเปิดใช้บัญชีได้');
  }
}

/**
 * Delete bank account
 */
export async function handleDeleteBankAccount(ctx, env) {
  try {
    const adminLevel = checkAdminLevel(ctx.from.id);
    if (!adminLevel || adminLevel !== 'SUPER_ADMIN') {
      await ctx.reply('❌ ต้องเป็น Super Admin เท่านั้น');
      return;
    }

    const deleteMessage = `
🗑️ <b>ลบบัญชีธนาคาร</b>

⚠️ <b>คำเตือนสำคัญ:</b>
• การลบบัญชีจะไม่สามารถกู้คืนได้
• ประวัติการทำรายการจะถูกเก็บไว้
• ต้องยืนยันด้วย Super Admin เท่านั้น

🔐 <b>เงื่อนไขการลบ:</b>
• บัญชีต้องอยู่ในสถานะ "SUSPENDED"
• ไม่มีรายการค้างอยู่
• ผ่านการตรวจสอบแล้ว

📋 <b>บัญชีที่สามารถลบได้:</b>

${BANK_ACCOUNTS.filter(acc => acc.status === 'SUSPENDED').map((account, index) => {
  return `${index + 1}. ${account.bank_name} (${account.account_number})
   📊 รายการทั้งหมด: ${account.transaction_count}
   💰 ยอดรวม: ${account.total_received.toLocaleString()} THB`;
}).join('\n\n')}

❌ <b>การลบจะทำให้:</b>
• บัญชีหายจากระบบถาวร
• ไม่สามารถรับฝากเงินได้
• ต้องเพิ่มใหม่หากต้องการใช้อีก
    `;

    const suspendedAccounts = BANK_ACCOUNTS.filter(acc => acc.status === 'SUSPENDED');
    
    if (suspendedAccounts.length === 0) {
      await ctx.reply('❌ ไม่มีบัญชีที่สามารถลบได้ (ต้องพักก่อน)');
      return;
    }

    const keyboard = {
      inline_keyboard: suspendedAccounts.map((account, index) => [
        { 
          text: `🗑️ ลบ ${account.bank_name} (${account.bank_code})`, 
          callback_data: `bank_delete_${account.id}` 
        }
      ]).concat([[
        { text: '❌ ยกเลิก', callback_data: 'bank_management' }
      ]])
    };

    await ctx.reply(deleteMessage, {
      reply_markup: keyboard,
      parse_mode: 'HTML'
    });

  } catch (error) {
    console.error('Delete bank account error:', error);
    await ctx.reply('❌ ไม่สามารถลบบัญชีได้');
  }
}

/**
 * Bank usage statistics
 */
export async function handleBankUsageStats(ctx, env) {
  try {
    const adminLevel = checkAdminLevel(ctx.from.id);
    if (!adminLevel || adminLevel === 'ADMIN') {
      await ctx.reply('❌ ไม่มีสิทธิ์เข้าถึง');
      return;
    }

    const totalDailyLimit = BANK_ACCOUNTS.reduce((sum, acc) => sum + acc.daily_limit, 0);
    const totalDailyUsage = BANK_ACCOUNTS.reduce((sum, acc) => sum + acc.current_daily_usage, 0);
    const totalMonthlyLimit = BANK_ACCOUNTS.reduce((sum, acc) => sum + acc.monthly_limit, 0);
    const totalMonthlyUsage = BANK_ACCOUNTS.reduce((sum, acc) => sum + acc.current_monthly_usage, 0);
    const totalTransactions = BANK_ACCOUNTS.reduce((sum, acc) => sum + acc.transaction_count, 0);
    const totalReceived = BANK_ACCOUNTS.reduce((sum, acc) => sum + acc.total_received, 0);

    const statsMessage = `
📊 <b>สถิติการใช้งานบัญชีธนาคาร</b>

💰 <b>สรุปรายวัน:</b>
• วงเงินรวม: ${totalDailyLimit.toLocaleString()} THB
• ใช้แล้ว: ${totalDailyUsage.toLocaleString()} THB (${((totalDailyUsage/totalDailyLimit)*100).toFixed(1)}%)
• คงเหลือ: ${(totalDailyLimit - totalDailyUsage).toLocaleString()} THB

📈 <b>สรุปรายเดือน:</b>
• วงเงินรวม: ${totalMonthlyLimit.toLocaleString()} THB
• ใช้แล้ว: ${totalMonthlyUsage.toLocaleString()} THB (${((totalMonthlyUsage/totalMonthlyLimit)*100).toFixed(1)}%)
• คงเหลือ: ${(totalMonthlyLimit - totalMonthlyUsage).toLocaleString()} THB

📋 <b>รายละเอียดแต่ละบัญชี:</b>

${BANK_ACCOUNTS.map((account, index) => {
  const dailyPercent = ((account.current_daily_usage / account.daily_limit) * 100).toFixed(1);
  const monthlyPercent = ((account.current_monthly_usage / account.monthly_limit) * 100).toFixed(1);
  const statusEmoji = account.status === 'ACTIVE' ? '🟢' : '🔴';
  
  return `${statusEmoji} <b>${account.bank_name}</b>
💰 วันนี้: ${account.current_daily_usage.toLocaleString()}/${account.daily_limit.toLocaleString()} (${dailyPercent}%)
📊 เดือนนี้: ${account.current_monthly_usage.toLocaleString()}/${account.monthly_limit.toLocaleString()} (${monthlyPercent}%)
🔢 รายการ: ${account.transaction_count.toLocaleString()}`;
}).join('\n\n')}

🏆 <b>สถิติรวม:</b>
• รายการทั้งหมด: ${totalTransactions.toLocaleString()}
• ยอดรวมที่รับ: ${totalReceived.toLocaleString()} THB
• เฉลี่ยต่อรายการ: ${(totalReceived/totalTransactions).toFixed(0)} THB
• บัญชีใช้งาน: ${BANK_ACCOUNTS.filter(acc => acc.status === 'ACTIVE').length}/${BANK_ACCOUNTS.length}
    `;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '📈 รายงานประจำวัน', callback_data: 'bank_daily_report' },
          { text: '📊 รายงานประจำเดือน', callback_data: 'bank_monthly_report' }
        ],
        [
          { text: '⚙️ ตั้งค่าวงเงิน', callback_data: 'bank_set_limits' },
          { text: '🔄 รีเซ็ตยอดรายวัน', callback_data: 'bank_reset_daily' }
        ],
        [
          { text: '📥 Export ข้อมูล', callback_data: 'bank_export_data' },
          { text: '🔄 รีเฟรช', callback_data: 'bank_usage_stats' }
        ],
        [
          { text: '🔙 กลับจัดการบัญชี', callback_data: 'bank_management' }
        ]
      ]
    };

    await ctx.reply(statsMessage, {
      reply_markup: keyboard,
      parse_mode: 'HTML'
    });

  } catch (error) {
    console.error('Bank usage stats error:', error);
    await ctx.reply('❌ ไม่สามารถแสดงสถิติได้');
  }
}

/**
 * Handle specific bank account suspend action
 */
export async function handleBankAccountSuspend(ctx, env, bankId) {
  try {
    const adminLevel = checkAdminLevel(ctx.from.id);
    if (!adminLevel || adminLevel === 'ADMIN') {
      await ctx.reply('❌ ไม่มีสิทธิ์เข้าถึง');
      return;
    }

    const account = BANK_ACCOUNTS.find(acc => acc.id === bankId);
    if (!account) {
      await ctx.reply('❌ ไม่พบบัญชีที่ระบุ');
      return;
    }

    if (account.status === 'SUSPENDED') {
      await ctx.reply('❌ บัญชีนี้ถูกพักอยู่แล้ว');
      return;
    }

    // Update account status
    account.status = 'SUSPENDED';
    account.suspended_date = new Date().toISOString();
    account.suspended_by = ctx.from.id.toString();

    await logUserActivity(ctx.from.id.toString(), {
      action: 'bank_account_suspended',
      bank_id: bankId,
      bank_name: account.bank_name,
      account_number: account.account_number,
      admin_level: adminLevel
    }, env);

    const confirmMessage = `
✅ <b>พักบัญชีเรียบร้อย</b>

🏦 <b>บัญชีที่พัก:</b>
• ธนาคาร: ${account.bank_name}
• เลขบัญชี: ${account.account_number}
• สาขา: ${account.branch}

⏰ <b>รายละเอียด:</b>
• พักเมื่อ: ${new Date().toLocaleString('th-TH')}
• ดำเนินการโดย: ${ctx.from.first_name}
• สถานะ: 🔴 SUSPENDED

⚠️ <b>ผลกระทบ:</b>
• ผู้ใช้จะไม่เห็นบัญชีนี้
• ไม่สามารถฝากเงินเข้าได้
• รายการค้างจะดำเนินการต่อ
• สามารถเปิดใช้ใหม่ได้
    `;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '▶️ เปิดใช้ทันที', callback_data: `bank_activate_${bankId}` },
          { text: '📋 ดูรายการบัญชี', callback_data: 'bank_list_accounts' }
        ],
        [
          { text: '🔙 กลับจัดการบัญชี', callback_data: 'bank_management' }
        ]
      ]
    };

    await ctx.reply(confirmMessage, {
      reply_markup: keyboard,
      parse_mode: 'HTML'
    });

  } catch (error) {
    console.error('Bank account suspend error:', error);
    await ctx.reply('❌ ไม่สามารถพักบัญชีได้');
  }
}

/**
 * Handle specific bank account activate action
 */
export async function handleBankAccountActivate(ctx, env, bankId) {
  try {
    const adminLevel = checkAdminLevel(ctx.from.id);
    if (!adminLevel || adminLevel === 'ADMIN') {
      await ctx.reply('❌ ไม่มีสิทธิ์เข้าถึง');
      return;
    }

    const account = BANK_ACCOUNTS.find(acc => acc.id === bankId);
    if (!account) {
      await ctx.reply('❌ ไม่พบบัญชีที่ระบุ');
      return;
    }

    if (account.status === 'ACTIVE') {
      await ctx.reply('❌ บัญชีนี้ใช้งานอยู่แล้ว');
      return;
    }

    // Update account status
    account.status = 'ACTIVE';
    account.activated_date = new Date().toISOString();
    account.activated_by = ctx.from.id.toString();

    await logUserActivity(ctx.from.id.toString(), {
      action: 'bank_account_activated',
      bank_id: bankId,
      bank_name: account.bank_name,
      account_number: account.account_number,
      admin_level: adminLevel
    }, env);

    const confirmMessage = `
✅ <b>เปิดใช้บัญชีเรียบร้อย</b>

🏦 <b>บัญชีที่เปิดใช้:</b>
• ธนาคาร: ${account.bank_name}
• เลขบัญชี: ${account.account_number}
• สาขา: ${account.branch}

⏰ <b>รายละเอียด:</b>
• เปิดใช้เมื่อ: ${new Date().toLocaleString('th-TH')}
• ดำเนินการโดย: ${ctx.from.first_name}
• สถานะ: 🟢 ACTIVE

✅ <b>ผลกระทบ:</b>
• ผู้ใช้จะเห็นบัญชีนี้
• สามารถฝากเงินเข้าได้
• วงเงิน: ${account.daily_limit.toLocaleString()} THB/วัน
• พร้อมรับรายการทันที
    `;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '⏸️ พักบัญชีทันที', callback_data: `bank_suspend_${bankId}` },
          { text: '📋 ดูรายการบัญชี', callback_data: 'bank_list_accounts' }
        ],
        [
          { text: '📊 ดูสถิติการใช้งาน', callback_data: 'bank_usage_stats' },
          { text: '🔙 กลับจัดการบัญชี', callback_data: 'bank_management' }
        ]
      ]
    };

    await ctx.reply(confirmMessage, {
      reply_markup: keyboard,
      parse_mode: 'HTML'
    });

  } catch (error) {
    console.error('Bank account activate error:', error);
    await ctx.reply('❌ ไม่สามารถเปิดใช้บัญชีได้');
  }
}

/**
 * Handle specific bank account delete action
 */
export async function handleBankAccountDelete(ctx, env, bankId) {
  try {
    const adminLevel = checkAdminLevel(ctx.from.id);
    if (!adminLevel || adminLevel !== 'SUPER_ADMIN') {
      await ctx.reply('❌ ต้องเป็น Super Admin เท่านั้น');
      return;
    }

    const account = BANK_ACCOUNTS.find(acc => acc.id === bankId);
    if (!account) {
      await ctx.reply('❌ ไม่พบบัญชีที่ระบุ');
      return;
    }

    if (account.status !== 'SUSPENDED') {
      await ctx.reply('❌ ต้องพักบัญชีก่อนลบ');
      return;
    }

    const confirmMessage = `
⚠️ <b>ยืนยันการลบบัญชี</b>

🏦 <b>บัญชีที่จะลบ:</b>
• ธนาคาร: ${account.bank_name}
• เลขบัญชี: ${account.account_number}
• สาขา: ${account.branch}

📊 <b>ข้อมูลสถิติ:</b>
• รายการทั้งหมด: ${account.transaction_count.toLocaleString()}
• ยอดรวมที่รับ: ${account.total_received.toLocaleString()} THB
• ใช้งานตั้งแต่: ${new Date(account.created_date).toLocaleDateString('th-TH')}

❌ <b>คำเตือนสุดท้าย:</b>
• การลบไม่สามารถกู้คืนได้
• บัญชีจะหายจากระบบถาวร
• ประวัติจะยังคงอยู่ในฐานข้อมูล
• ต้องเพิ่มใหม่หากต้องการใช้อีก

🔐 <b>การยืนยัน:</b>
ต้องเป็น Super Admin เท่านั้น
    `;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '❌ ยืนยันลบ', callback_data: `bank_confirm_delete_${bankId}` }
        ],
        [
          { text: '🛡️ ยกเลิก', callback_data: 'bank_management' }
        ]
      ]
    };

    await ctx.reply(confirmMessage, {
      reply_markup: keyboard,
      parse_mode: 'HTML'
    });

  } catch (error) {
    console.error('Bank account delete error:', error);
    await ctx.reply('❌ ไม่สามารถลบบัญชีได้');
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