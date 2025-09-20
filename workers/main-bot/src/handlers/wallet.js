/**
 * Wallet Command Handler
 * Handles all wallet-related operations
 */

export async function handleWallet(ctx) {
  try {
    const userId = ctx.from.id;
    const action = ctx.callbackQuery?.data || ctx.message?.text || 'wallet_main';
    
    // Log wallet interaction
    if (ctx.services.analytics) {
      ctx.services.analytics.fetch('https://analytics-worker/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'wallet_action',
          userId,
          action,
          timestamp: Date.now()
        })
      }).catch(console.error);
    }

    // Handle different wallet actions
    switch (action) {
      case 'wallet_main':
        await showWalletMain(ctx);
        break;
      case 'wallet_balance':
        await showBalance(ctx);
        break;
      case 'wallet_send':
        await showSendMoney(ctx);
        break;
      case 'wallet_receive':
        await showReceiveMoney(ctx);
        break;
      case 'wallet_history':
        await showTransactionHistory(ctx);
        break;
      default:
        await showWalletMain(ctx);
    }

  } catch (error) {
    console.error('Wallet command error:', error);
    await ctx.reply(ctx.getMessage('errorOccurred'));
  }
}

async function showWalletMain(ctx) {
  const userId = ctx.from.id;
  
  try {
    // Get wallet data from banking service
    let walletData = { balance: 0, currency: 'USDT' };
    
    if (ctx.services.banking) {
      const response = await ctx.services.banking.fetch(`https://banking-worker/wallet/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        walletData = await response.json();
      }
    }

    const message = ctx.getMessage('walletMain', {
      balance: formatCurrency(walletData.balance),
      currency: walletData.currency
    });

    const keyboard = {
      inline_keyboard: [
        [
          { text: '💳 ตรวจสอบยอดเงิน', callback_data: 'wallet_balance' },
          { text: '📊 ประวัติการทำรายการ', callback_data: 'wallet_history' }
        ],
        [
          { text: '📤 ส่งเงิน', callback_data: 'wallet_send' },
          { text: '📥 รับเงิน', callback_data: 'wallet_receive' }
        ],
        [
          { text: '💰 ฝากเงิน', callback_data: 'wallet_deposit' },
          { text: '🏧 ถอนเงิน', callback_data: 'wallet_withdraw' }
        ],
        [
          { text: '🏠 กลับเมนูหลัก', callback_data: 'main_menu' }
        ]
      ]
    };

    if (ctx.callbackQuery) {
      await ctx.editMessageText(message, {
        reply_markup: keyboard,
        parse_mode: 'HTML'
      });
      await ctx.answerCbQuery();
    } else {
      await ctx.reply(message, {
        reply_markup: keyboard,
        parse_mode: 'HTML'
      });
    }

  } catch (error) {
    console.error('Show wallet main error:', error);
    await ctx.reply(ctx.getMessage('errorOccurred'));
  }
}

async function showBalance(ctx) {
  const userId = ctx.from.id;
  
  try {
    // Get detailed balance from banking service
    let balanceData = {
      usdt: 0,
      thb: 0,
      transactions: []
    };
    
    if (ctx.services.banking) {
      const response = await ctx.services.banking.fetch(`https://banking-worker/balance/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        balanceData = await response.json();
      }
    }

    const message = ctx.getMessage('balanceDetails', {
      usdtBalance: formatCurrency(balanceData.usdt),
      thbBalance: formatCurrency(balanceData.thb, 'THB'),
      lastUpdate: new Date().toLocaleString('th-TH')
    });

    const keyboard = {
      inline_keyboard: [
        [
          { text: '🔄 รีเฟรช', callback_data: 'wallet_balance' },
          { text: '📊 ประวัติ', callback_data: 'wallet_history' }
        ],
        [
          { text: '📤 ส่งเงิน', callback_data: 'wallet_send' },
          { text: '📥 รับเงิน', callback_data: 'wallet_receive' }
        ],
        [
          { text: '🔙 กลับ', callback_data: 'wallet_main' }
        ]
      ]
    };

    if (ctx.callbackQuery) {
      await ctx.editMessageText(message, {
        reply_markup: keyboard,
        parse_mode: 'HTML'
      });
      await ctx.answerCbQuery();
    } else {
      await ctx.reply(message, {
        reply_markup: keyboard,
        parse_mode: 'HTML'
      });
    }

  } catch (error) {
    console.error('Show balance error:', error);
    await ctx.reply(ctx.getMessage('errorOccurred'));
  }
}

async function showSendMoney(ctx) {
  const message = ctx.getMessage('sendMoneyGuide');

  const keyboard = {
    inline_keyboard: [
      [
        { text: '📱 ส่งด้วยเบอร์โทร', callback_data: 'send_by_phone' },
        { text: '👤 ส่งด้วย Username', callback_data: 'send_by_username' }
      ],
      [
        { text: '🔗 ส่งด้วย QR Code', callback_data: 'send_by_qr' },
        { text: '💳 ส่งด้วย Wallet Address', callback_data: 'send_by_address' }
      ],
      [
        { text: '🔙 กลับ', callback_data: 'wallet_main' }
      ]
    ]
  };

  if (ctx.callbackQuery) {
    await ctx.editMessageText(message, {
      reply_markup: keyboard,
      parse_mode: 'HTML'
    });
    await ctx.answerCbQuery();
  } else {
    await ctx.reply(message, {
      reply_markup: keyboard,
      parse_mode: 'HTML'
    });
  }
}

async function showReceiveMoney(ctx) {
  const userId = ctx.from.id;
  
  try {
    // Generate QR code from banking service
    let qrData = { qrCode: null, address: `user_${userId}` };
    
    if (ctx.services.banking) {
      const response = await ctx.services.banking.fetch(`https://banking-worker/qr/generate/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        qrData = await response.json();
      }
    }

    const message = ctx.getMessage('receiveMoneyDetails', {
      address: qrData.address,
      username: ctx.from.username || 'ไม่มี'
    });

    const keyboard = {
      inline_keyboard: [
      [
        { text: '📱 แชร์เบอร์โทร', callback_data: 'share_phone' },
        { text: '👤 แชร์ Username', callback_data: 'share_username' }
      ],
      [
        { text: '🔗 สร้าง QR Code', callback_data: 'generate_qr' },
        { text: '💳 คัดลอก Address', callback_data: 'copy_address' }
      ],
      [
        { text: '🔙 กลับ', callback_data: 'wallet_main' }
      ]
    ]
    };

    if (ctx.callbackQuery) {
      await ctx.editMessageText(message, {
        reply_markup: keyboard,
        parse_mode: 'HTML'
      });
      await ctx.answerCbQuery();
    } else {
      await ctx.reply(message, {
        reply_markup: keyboard,
        parse_mode: 'HTML'
      });
    }

  } catch (error) {
    console.error('Show receive money error:', error);
    await ctx.reply(ctx.getMessage('errorOccurred'));
  }
}

async function showTransactionHistory(ctx) {
  const userId = ctx.from.id;
  
  try {
    // Get transaction history from banking service
    let transactions = [];
    
    if (ctx.services.banking) {
      const response = await ctx.services.banking.fetch(`https://banking-worker/transactions/${userId}?limit=10`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        transactions = data.transactions || [];
      }
    }

    let message = ctx.getMessage('transactionHistoryHeader');
    
    if (transactions.length === 0) {
      message += '\n\n' + ctx.getMessage('noTransactions');
    } else {
      transactions.slice(0, 5).forEach((tx, index) => {
        const type = tx.type === 'send' ? '📤' : '📥';
        const amount = formatCurrency(tx.amount);
        const date = new Date(tx.timestamp).toLocaleDateString('th-TH');
        message += `\n\n${type} <b>${amount} USDT</b>\n📅 ${date}\n🏷️ ${tx.description || 'ไม่มีรายละเอียด'}`;
      });
    }

    const keyboard = {
      inline_keyboard: [
        [
          { text: '🔄 รีเฟรช', callback_data: 'wallet_history' },
          { text: '📄 ดูทั้งหมด', callback_data: 'history_full' }
        ],
        [
          { text: '📊 สถิติ', callback_data: 'transaction_stats' },
          { text: '📑 Export', callback_data: 'export_history' }
        ],
        [
          { text: '🔙 กลับ', callback_data: 'wallet_main' }
        ]
      ]
    };

    if (ctx.callbackQuery) {
      await ctx.editMessageText(message, {
        reply_markup: keyboard,
        parse_mode: 'HTML'
      });
      await ctx.answerCbQuery();
    } else {
      await ctx.reply(message, {
        reply_markup: keyboard,
        parse_mode: 'HTML'
      });
    }

  } catch (error) {
    console.error('Show transaction history error:', error);
    await ctx.reply(ctx.getMessage('errorOccurred'));
  }
}

// Helper function to format currency
function formatCurrency(amount, currency = 'USDT') {
  const num = parseFloat(amount) || 0;
  
  if (currency === 'THB') {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(num);
  }
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8
  }).format(num);
}