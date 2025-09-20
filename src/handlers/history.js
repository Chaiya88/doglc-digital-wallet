/**
 * History command handlers for transaction history and reports
 */

import { formatCurrency, formatDateTime, logUserActivity } from '../utils/helpers.js';

export async function handleHistory(ctx, historyType = 'all') {
  try {
    const messages = ctx.messages;
    const userId = ctx.from.id.toString();
    const userLang = ctx.userLanguage;

    await logUserActivity(userId, {
      action: 'history_access',
      history_type: historyType,
      language: userLang
    }, ctx.env || {});

    if (historyType === 'deposit') {
      return await handleDepositHistory(ctx);
    } else if (historyType === 'withdraw') {
      return await handleWithdrawHistory(ctx);
    } else if (historyType === 'transfer') {
      return await handleTransferHistory(ctx);
    } else {
      return await handleAllHistory(ctx);
    }

  } catch (error) {
    console.error('History handler error:', error);
    await ctx.reply(ctx.messages.errorOccurred);
  }
}

/**
 * All transaction history
 */
async function handleAllHistory(ctx) {
  const messages = ctx.messages;
  
  // Mock transaction data
  const transactions = [
    {
      id: 'TXN001',
      type: 'deposit',
      amount: 1000,
      currency: 'THB',
      status: 'completed',
      date: '2025-09-20 14:30',
      description: 'ฝากเงิน THB ผ่านธนาคาร'
    },
    {
      id: 'TXN002',
      type: 'send',
      amount: -50,
      currency: 'USDT',
      status: 'completed',
      date: '2025-09-20 13:15',
      description: 'โอนให้ @friend123'
    },
    {
      id: 'TXN003',
      type: 'receive',
      amount: 25,
      currency: 'USDT',
      status: 'completed',
      date: '2025-09-20 10:45',
      description: 'รับจาก @buddy456'
    }
  ];

  const historyMessage = `
📊 <b>ประวัติการทำรายการ / Transaction History</b>

📅 <b>รายการล่าสุด (Latest Transactions):</b>

${transactions.map((tx, index) => `
${index + 1}. <b>${getTransactionIcon(tx.type)} ${getTransactionName(tx.type)}</b>
   💰 ${tx.amount > 0 ? '+' : ''}${tx.amount} ${tx.currency}
   📅 ${tx.date}
   📝 ${tx.description}
   ✅ ${getStatusIcon(tx.status)} ${getStatusName(tx.status)}
   🔗 ID: <code>${tx.id}</code>
`).join('\n')}

📈 <b>สถิติ:</b>
• รายการทั้งหมด: ${transactions.length} รายการ
• ยอดฝากรวม: +1,000 THB
• ยอดถอนรวม: -50 USDT
• รายการวันนี้: 3 รายการ
  `;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '💸 ประวัติฝาก / Deposits', callback_data: 'history_deposit' },
        { text: '🏧 ประวัติถอน / Withdrawals', callback_data: 'history_withdraw' }
      ],
      [
        { text: '📤 ประวัติส่ง / Sent', callback_data: 'history_sent' },
        { text: '📥 ประวัติรับ / Received', callback_data: 'history_received' }
      ],
      [
        { text: '🔍 ค้นหารายการ / Search', callback_data: 'history_search' }
      ],
      [
        { text: '📊 รายงาน / Reports', callback_data: 'history_reports' }
      ],
      [
        { text: '⚙️ ตั้งค่า / Settings', callback_data: 'history_settings' }
      ],
      [
        { text: '🔙 กลับ / Back', callback_data: 'wallet' }
      ]
    ]
  };

  await ctx.reply(historyMessage, {
    reply_markup: keyboard,
    parse_mode: 'HTML'
  });
}

/**
 * Deposit history
 */
async function handleDepositHistory(ctx) {
  const messages = ctx.messages;
  
  const deposits = [
    {
      id: 'DEP001',
      amount: 1000,
      currency: 'THB',
      status: 'completed',
      date: '2025-09-20 14:30',
      bank: 'กสิกรไทย',
      fee: 20
    },
    {
      id: 'DEP002',
      amount: 50,
      currency: 'USDT',
      status: 'completed',
      date: '2025-09-19 16:20',
      network: 'TRON',
      fee: 2
    }
  ];

  const depositHistoryMessage = `
💸 <b>ประวัติการฝากเงิน / Deposit History</b>

📋 <b>รายการฝากเงิน:</b>

${deposits.map((dep, index) => `
${index + 1}. <b>💸 ฝาก ${dep.currency}</b>
   💰 +${dep.amount} ${dep.currency}
   💸 ค่าธรรมเนียม: ${dep.fee} ${dep.currency === 'THB' ? 'บาท' : dep.currency}
   🏦 ${dep.bank || dep.network || 'N/A'}
   📅 ${dep.date}
   ✅ ${getStatusIcon(dep.status)} เสร็จสิ้น
   🔗 ID: <code>${dep.id}</code>
`).join('\n')}

📊 <b>สรุปการฝาก:</b>
• รายการทั้งหมด: ${deposits.length} รายการ
• ยอดฝากรวม: 1,050 (THB+USDT)
• ค่าธรรมเนียมรวม: 22
• เดือนนี้: ${deposits.length} รายการ
  `;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '💵 ฝาก THB ใหม่', callback_data: 'deposit_thb' },
        { text: '💎 ฝาก USDT ใหม่', callback_data: 'deposit_usdt' }
      ],
      [
        { text: '🔍 ค้นหาการฝาก', callback_data: 'search_deposits' }
      ],
      [
        { text: '📊 รายงานการฝาก', callback_data: 'deposit_reports' }
      ],
      [
        { text: '🔙 กลับประวัติ / Back to History', callback_data: 'history_all' }
      ]
    ]
  };

  await ctx.reply(depositHistoryMessage, {
    reply_markup: keyboard,
    parse_mode: 'HTML'
  });
}

/**
 * Withdrawal history
 */
async function handleWithdrawHistory(ctx) {
  const messages = ctx.messages;
  
  const withdrawals = [
    {
      id: 'WTH001',
      amount: 100,
      currency: 'USDT',
      status: 'completed',
      date: '2025-09-18 11:30',
      address: 'TR7N...8kL9',
      fee: 2
    }
  ];

  const withdrawHistoryMessage = `
🏧 <b>ประวัติการถอนเงิน / Withdrawal History</b>

📋 <b>รายการถอนเงิน:</b>

${withdrawals.map((wth, index) => `
${index + 1}. <b>🏧 ถอน ${wth.currency}</b>
   💰 -${wth.amount} ${wth.currency}
   💸 ค่าธรรมเนียม: ${wth.fee} ${wth.currency}
   📍 ${wth.address}
   📅 ${wth.date}
   ✅ ${getStatusIcon(wth.status)} เสร็จสิ้น
   🔗 ID: <code>${wth.id}</code>
`).join('\n')}

📊 <b>สรุปการถอน:</b>
• รายการทั้งหมด: ${withdrawals.length} รายการ
• ยอดถอนรวม: 100 USDT
• ค่าธรรมเนียมรวม: 2 USDT
• เดือนนี้: ${withdrawals.length} รายการ

💡 <b>สถิติเพิ่มเติม:</b>
• เวลาประมวลผลเฉลี่ย: 15 นาที
• อัตราสำเร็จ: 100%
  `;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '💎 ถอน USDT ใหม่', callback_data: 'withdraw_usdt' },
        { text: '💵 ถอน THB ใหม่', callback_data: 'withdraw_thb' }
      ],
      [
        { text: '🔍 ค้นหาการถอน', callback_data: 'search_withdrawals' }
      ],
      [
        { text: '📊 รายงานการถอน', callback_data: 'withdrawal_reports' }
      ],
      [
        { text: '🔙 กลับประวัติ / Back to History', callback_data: 'history_all' }
      ]
    ]
  };

  await ctx.reply(withdrawHistoryMessage, {
    reply_markup: keyboard,
    parse_mode: 'HTML'
  });
}

/**
 * Transfer history (sent + received)
 */
async function handleTransferHistory(ctx) {
  const messages = ctx.messages;
  
  const transfers = [
    {
      id: 'TXF001',
      type: 'sent',
      amount: -50,
      currency: 'USDT',
      status: 'completed',
      date: '2025-09-20 13:15',
      counterpart: '@friend123',
      transfer_type: 'internal'
    },
    {
      id: 'TXF002',
      type: 'received',
      amount: 25,
      currency: 'USDT',
      status: 'completed',
      date: '2025-09-20 10:45',
      counterpart: '@buddy456',
      transfer_type: 'internal'
    }
  ];

  const transferHistoryMessage = `
🔄 <b>ประวัติการโอน / Transfer History</b>

📋 <b>รายการโอนเงิน:</b>

${transfers.map((txf, index) => `
${index + 1}. <b>${txf.type === 'sent' ? '📤 ส่ง' : '📥 รับ'} ${txf.currency}</b>
   💰 ${txf.amount > 0 ? '+' : ''}${txf.amount} ${txf.currency}
   👤 ${txf.type === 'sent' ? 'ถึง' : 'จาก'}: ${txf.counterpart}
   🔗 ${txf.transfer_type === 'internal' ? 'ภายใน' : 'ภายนอก'}
   📅 ${txf.date}
   ✅ ${getStatusIcon(txf.status)} เสร็จสิ้น
   🔗 ID: <code>${txf.id}</code>
`).join('\n')}

📊 <b>สรุปการโอน:</b>
• รายการทั้งหมด: ${transfers.length} รายการ
• ยอดส่งรวม: 50 USDT
• ยอดรับรวม: 25 USDT
• โอนภายใน: ${transfers.filter(t => t.transfer_type === 'internal').length} รายการ

💡 <b>ความถี่การใช้งาน:</b>
• โอนภายใน: 100% (ไม่มีค่าธรรมเนียม)
• โอนภายนอก: 0%
  `;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '📤 ประวัติส่ง / Sent Only', callback_data: 'history_sent_only' },
        { text: '📥 ประวัติรับ / Received Only', callback_data: 'history_received_only' }
      ],
      [
        { text: '💫 ภายใน / Internal', callback_data: 'history_internal' },
        { text: '🌐 ภายนอก / External', callback_data: 'history_external' }
      ],
      [
        { text: '📤 ส่งเงินใหม่', callback_data: 'send_menu' }
      ],
      [
        { text: '🔙 กลับประวัติ / Back to History', callback_data: 'history_all' }
      ]
    ]
  };

  await ctx.reply(transferHistoryMessage, {
    reply_markup: keyboard,
    parse_mode: 'HTML'
  });
}

// Helper functions
function getTransactionIcon(type) {
  const icons = {
    deposit: '💸',
    withdraw: '🏧',
    send: '📤',
    receive: '📥',
    exchange: '💱'
  };
  return icons[type] || '💼';
}

function getTransactionName(type) {
  const names = {
    deposit: 'ฝากเงิน',
    withdraw: 'ถอนเงิน',
    send: 'ส่งเงิน',
    receive: 'รับเงิน',
    exchange: 'แลกเปลี่ยน'
  };
  return names[type] || 'ธุรกรรม';
}

function getStatusIcon(status) {
  const icons = {
    completed: '✅',
    pending: '⏳',
    failed: '❌',
    cancelled: '🚫'
  };
  return icons[status] || '❓';
}

function getStatusName(status) {
  const names = {
    completed: 'เสร็จสิ้น',
    pending: 'รอดำเนินการ',
    failed: 'ล้มเหลว',
    cancelled: 'ยกเลิก'
  };
  return names[status] || 'ไม่ทราบ';
}