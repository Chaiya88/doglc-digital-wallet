/**
 * Help command handler with multi-language support
 */

export async function handleHelp(ctx) {
  try {
    const messages = ctx.messages; // Set by middleware
    
    const helpMessage = `
${messages.helpTitle}

${messages.helpCommands}

💡 <b>เคล็ดลับการใช้งาน / Tips:</b>
• คลิกที่ปุ่มด้านล่างเพื่อเข้าถึงฟีเจอร์ต่างๆ ได้อย่างรวดเร็ว
• Use buttons below for quick access to features
• ใช้คำสั่ง /start เพื่อกลับไปหน้าหลัก
• ระบบรองรับ 6 ภาษา (System supports 6 languages)

${messages.securityWarning}
    `;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '🏠 หน้าหลัก / Home', callback_data: 'start' },
          { text: '💳 กระเป๋าเงิน / Wallet', callback_data: 'wallet' }
        ],
        [
          { text: '🌐 เปลี่ยนภาษา / Language', callback_data: 'change_language' }
        ],
        [
          { text: '📞 ติดต่อสนับสนุน / Support', url: 'https://t.me/doglcdigital' }
        ]
      ]
    };

    await ctx.reply(helpMessage, {
      reply_markup: keyboard,
      parse_mode: 'HTML'
    });

  } catch (error) {
    console.error('Help handler error:', error);
    await ctx.reply(ctx.messages.errorOccurred);
  }
}