/**
 * Start Command Handler
 * Welcome message and main menu for DOGLC Digital Wallet
 */

export async function handleStart(ctx) {
  try {
    const userId = ctx.from.id;
    const firstName = ctx.from.first_name || 'ผู้ใช้';
    
    // Log user interaction
    if (ctx.services.analytics) {
      ctx.services.analytics.fetch('https://analytics-worker/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'command_start',
          userId,
          timestamp: Date.now()
        })
      }).catch(console.error);
    }

    // Create user session if not exists
    if (ctx.env.USER_SESSIONS) {
      const sessionKey = `session:${userId}`;
      const existingSession = await ctx.env.USER_SESSIONS.get(sessionKey);
      
      if (!existingSession) {
        const newSession = {
          userId,
          firstName,
          languageCode: ctx.from.language_code || 'th',
          createdAt: Date.now(),
          lastActivity: Date.now()
        };
        
        await ctx.env.USER_SESSIONS.put(sessionKey, JSON.stringify(newSession));
      } else {
        // Update last activity
        const session = JSON.parse(existingSession);
        session.lastActivity = Date.now();
        await ctx.env.USER_SESSIONS.put(sessionKey, JSON.stringify(session));
      }
    }

    // Welcome message with main menu
    const welcomeMessage = ctx.getMessage('welcomeMessage', { firstName });
    
    const mainMenuKeyboard = {
      inline_keyboard: [
        [
          { text: '💰 กระเป๋าเงิน', callback_data: 'wallet_main' },
          { text: '💳 ยอดเงิน', callback_data: 'wallet_balance' }
        ],
        [
          { text: '📤 ส่งเงิน', callback_data: 'wallet_send' },
          { text: '📥 รับเงิน', callback_data: 'wallet_receive' }
        ],
        [
          { text: '📊 ประวัติ', callback_data: 'wallet_history' },
          { text: '📈 ตลาด', callback_data: 'market_data' }
        ],
        [
          { text: '⚙️ ตั้งค่า', callback_data: 'settings_main' },
          { text: '❓ ช่วยเหลือ', callback_data: 'help_main' }
        ],
        [
          { text: '🌐 เปลี่ยนภาษา', callback_data: 'language_select' }
        ]
      ]
    };

    // Check if this is a callback query (inline button press)
    if (ctx.callbackQuery) {
      await ctx.editMessageText(welcomeMessage, {
        reply_markup: mainMenuKeyboard,
        parse_mode: 'HTML'
      });
      await ctx.answerCbQuery();
    } else {
      // This is a direct /start command
      await ctx.reply(welcomeMessage, {
        reply_markup: mainMenuKeyboard,
        parse_mode: 'HTML'
      });
    }

  } catch (error) {
    console.error('Start command error:', error);
    await ctx.reply(ctx.getMessage('errorOccurred'));
  }
}