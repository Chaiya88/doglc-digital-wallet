/**
 * Help Command Handler
 * Provides comprehensive help and support information
 */

export async function handleHelp(ctx) {
  try {
    const action = ctx.callbackQuery?.data || 'help_main';
    
    // Log help interaction
    if (ctx.services.analytics) {
      ctx.services.analytics.fetch('https://analytics-worker/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'help_request',
          userId: ctx.from.id,
          action,
          timestamp: Date.now()
        })
      }).catch(console.error);
    }

    switch (action) {
      case 'help_main':
        await showMainHelp(ctx);
        break;
      case 'help_commands':
        await showCommandHelp(ctx);
        break;
      case 'help_wallet':
        await showWalletHelp(ctx);
        break;
      case 'help_security':
        await showSecurityHelp(ctx);
        break;
      case 'help_contact':
        await showContactHelp(ctx);
        break;
      case 'help_faq':
        await showFAQ(ctx);
        break;
      default:
        await showMainHelp(ctx);
    }

  } catch (error) {
    console.error('Help command error:', error);
    await ctx.reply(ctx.getMessage('errorOccurred'));
  }
}

async function showMainHelp(ctx) {
  const message = ctx.getMessage('helpMain');

  const keyboard = {
    inline_keyboard: [
      [
        { text: '📝 คำสั่งทั้งหมด', callback_data: 'help_commands' },
        { text: '💰 การใช้กระเป๋าเงิน', callback_data: 'help_wallet' }
      ],
      [
        { text: '🔐 ความปลอดภัย', callback_data: 'help_security' },
        { text: '❓ คำถามที่พบบ่อย', callback_data: 'help_faq' }
      ],
      [
        { text: '📞 ติดต่อเรา', callback_data: 'help_contact' },
        { text: '🌐 เปลี่ยนภาษา', callback_data: 'language_select' }
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
}

async function showCommandHelp(ctx) {
  const message = ctx.getMessage('helpCommands');

  const keyboard = {
    inline_keyboard: [
      [
        { text: '💰 คำสั่งกระเป๋าเงิน', callback_data: 'help_wallet' },
        { text: '🔐 คำสั่งความปลอดภัย', callback_data: 'help_security' }
      ],
      [
        { text: '📱 การใช้งานขั้นสูง', callback_data: 'help_advanced' },
        { text: '🤖 เกี่ยวกับบอท', callback_data: 'help_about' }
      ],
      [
        { text: '🔙 กลับ', callback_data: 'help_main' }
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

async function showWalletHelp(ctx) {
  const message = ctx.getMessage('helpWallet');

  const keyboard = {
    inline_keyboard: [
      [
        { text: '💳 การตรวจสอบยอดเงิน', callback_data: 'help_balance' },
        { text: '📤 การส่งเงิน', callback_data: 'help_send' }
      ],
      [
        { text: '📥 การรับเงิน', callback_data: 'help_receive' },
        { text: '📊 ประวัติการทำรายการ', callback_data: 'help_history' }
      ],
      [
        { text: '💰 การฝาก-ถอน', callback_data: 'help_deposit' },
        { text: '🔗 QR Code', callback_data: 'help_qr' }
      ],
      [
        { text: '🔙 กลับ', callback_data: 'help_main' }
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

async function showSecurityHelp(ctx) {
  const message = ctx.getMessage('helpSecurity');

  const keyboard = {
    inline_keyboard: [
      [
        { text: '🔒 การตั้งรหัส PIN', callback_data: 'help_pin' },
        { text: '🔑 การยืนยันตัวตน', callback_data: 'help_auth' }
      ],
      [
        { text: '📷 การตรวจสอบสลิป', callback_data: 'help_ocr' },
        { text: '⚠️ การแจ้งเตือน', callback_data: 'help_alerts' }
      ],
      [
        { text: '🛡️ เคล็ดลับความปลอดภัย', callback_data: 'help_tips' },
        { text: '🚨 รายงานปัญหา', callback_data: 'help_report' }
      ],
      [
        { text: '🔙 กลับ', callback_data: 'help_main' }
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

async function showFAQ(ctx) {
  const message = ctx.getMessage('helpFAQ');

  const keyboard = {
    inline_keyboard: [
      [
        { text: '💸 ค่าธรรมเนียม', callback_data: 'faq_fees' },
        { text: '⏱️ เวลาการทำรายการ', callback_data: 'faq_timing' }
      ],
      [
        { text: '🔢 ขีดจำกัดการใช้งาน', callback_data: 'faq_limits' },
        { text: '🌍 ประเทศที่รองรับ', callback_data: 'faq_countries' }
      ],
      [
        { text: '💱 อัตราแลกเปลี่ยน', callback_data: 'faq_exchange' },
        { text: '🔧 แก้ไขปัญหา', callback_data: 'faq_troubleshoot' }
      ],
      [
        { text: '🔙 กลับ', callback_data: 'help_main' }
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

async function showContactHelp(ctx) {
  const message = ctx.getMessage('helpContact');

  const keyboard = {
    inline_keyboard: [
      [
        { text: '📧 อีเมล', url: 'mailto:support@doglcdigital.com' },
        { text: '💬 Telegram', url: 'https://t.me/doglcdigital' }
      ],
      [
        { text: '🌐 เว็บไซต์', url: 'https://doglcdigital.com' },
        { text: '📱 Facebook', url: 'https://facebook.com/doglcdigital' }
      ],
      [
        { text: '🐦 Twitter', url: 'https://twitter.com/doglcdigital' },
        { text: '📺 YouTube', url: 'https://youtube.com/doglcdigital' }
      ],
      [
        { text: '📞 สายด่วน 24/7', callback_data: 'contact_hotline' }
      ],
      [
        { text: '🔙 กลับ', callback_data: 'help_main' }
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