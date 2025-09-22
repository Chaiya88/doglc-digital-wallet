/**
 * Start command handler with English-first design
 */

import { createLanguageKeyboard } from '../locales/index.js';

export async function handleStart(ctx) {
  try {
    const messages = ctx.messages; // Set by middleware
    const username = ctx.from?.username || ctx.from?.first_name || 'user';
    
    const welcomeMessage = messages.welcome.replace(/{username}/g, username);
    
    // Clean 8-button layout without undefined
    const keyboard = {
      inline_keyboard: [
        [
          { text: '💰 Balance', callback_data: 'balance' },
          { text: '💳 Deposit', callback_data: 'deposit' }
        ],
        [
          { text: '📤 Withdraw', callback_data: 'withdraw' },
          { text: '📊 Send Money', callback_data: 'send' }
        ],
        [
          { text: '📋 History', callback_data: 'history' },
          { text: '🌐 Change Language', callback_data: 'change_language' }
        ],
        [
          { text: '⚙️ Settings', callback_data: 'settings' },
          { text: '💬 Help', callback_data: 'help' }
        ]
      ]
    };

    await ctx.reply(welcomeMessage + '\n\n' + messages.mainMenu, {
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
      '🌐 Select Language / Choose Language / 选择语言 / ភាសា / 언어 선택 / Pilih Bahasa:',
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