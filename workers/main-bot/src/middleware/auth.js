/**
 * Authentication Middleware
 * Handles user authentication and authorization
 */

export function authMiddleware(env) {
  return async (ctx, next) => {
    try {
      const userId = ctx.from?.id;
      const chatType = ctx.chat?.type;
      
      // Skip auth for private chats (allow all users)
      if (chatType === 'private') {
        await next();
        return;
      }
      
      // For group/channel chats, check if bot is admin
      if (chatType === 'group' || chatType === 'supergroup' || chatType === 'channel') {
        try {
          const botMember = await ctx.telegram.getChatMember(ctx.chat.id, ctx.botInfo.id);
          if (botMember.status !== 'administrator') {
            await ctx.reply('⚠️ ฉันต้องการสิทธิ์ admin เพื่อทำงานในกลุ่มนี้');
            return;
          }
        } catch (error) {
          console.warn('Could not check bot admin status:', error);
        }
      }
      
      // Check if user is banned
      if (env.USER_SESSIONS) {
        const banKey = `banned:${userId}`;
        const banStatus = await env.USER_SESSIONS.get(banKey);
        
        if (banStatus) {
          const banData = JSON.parse(banStatus);
          if (banData.until > Date.now()) {
            await ctx.reply('🚫 บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อฝ่ายสนับสนุน');
            return;
          } else {
            // Ban expired, remove it
            await env.USER_SESSIONS.delete(banKey);
          }
        }
      }
      
      // Add user info to context
      ctx.user = {
        id: userId,
        firstName: ctx.from?.first_name,
        lastName: ctx.from?.last_name,
        username: ctx.from?.username,
        languageCode: ctx.from?.language_code || 'th',
        isPremium: ctx.from?.is_premium || false
      };
      
      await next();
      
    } catch (error) {
      console.error('Auth middleware error:', error);
      await ctx.reply('❌ เกิดข้อผิดพลาดในการยืนยันตัวตน');
    }
  };
}