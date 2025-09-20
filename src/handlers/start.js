/**
 * Start command handler with multi-language support
 */

import { createLanguageKeyboard } from '../locales/index.js';

export async function handleStart(ctx) {
  try {
    const messages = ctx.messages; // Set by middleware
    
    const welcomeMessage = `
${messages.welcome}

${messages.securityWarning}
    `;
    
    // Create inline keyboard for quick actions
    const keyboard = {
      inline_keyboard: [
        [
          { text: '💳 ' + messages.walletInfo, callback_data: 'wallet' },
          { text: '💰 ' + messages.currentBalance.replace('{amount}', ''), callback_data: 'balance' }
        ],
        [
          { text: '📤 ' + messages.sendMoney, callback_data: 'send' },
          { text: '📥 ' + messages.receiveMoney, callback_data: 'receive' }
        ],
        [
          { text: '🌐 เปลี่ยนภาษา / Change Language', callback_data: 'change_language' }
        ],
        [
          { text: '📋 ' + messages.helpTitle, callback_data: 'help' }
        ]
      ]
    };

    await ctx.reply(welcomeMessage, {
      reply_markup: keyboard,
      parse_mode: 'HTML'
    });

  } catch (error) {
    console.error('Start handler error:', error);
    await ctx.reply(ctx.messages.errorOccurred);
  }
}

// Handle language change callback
export async function handleLanguageChange(ctx) {
  try {
    const languageKeyboard = createLanguageKeyboard();
    
    await ctx.editMessageText(
      '🌐 เลือกภาษา / Choose Language / 选择语言 / ភាសា / 언어 선택 / Pilih Bahasa:',
      {
        reply_markup: languageKeyboard,
        parse_mode: 'HTML'
      }
    );
  } catch (error) {
    console.error('Language change handler error:', error);
    await ctx.reply(ctx.messages.errorOccurred);
  }
}