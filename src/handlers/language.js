/**
 * Language change handler for start.js
 */

import { createLanguageKeyboard } from '../locales/index.js';

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