/**
 * Rate Limiting Middleware
 * Prevents spam and abuse of bot commands
 */

export function rateLimitMiddleware(env) {
  return async (ctx, next) => {
    try {
      const userId = ctx.from?.id;
      const commandType = getCommandType(ctx);
      
      if (!userId || !env.RATE_LIMIT_KV) {
        await next();
        return;
      }
      
      // Rate limit configuration
      const limits = {
        message: { requests: 30, window: 60 }, // 30 messages per minute
        command: { requests: 20, window: 60 }, // 20 commands per minute
        wallet: { requests: 10, window: 60 },  // 10 wallet operations per minute
        photo: { requests: 5, window: 60 },    // 5 photo uploads per minute
        callback: { requests: 50, window: 60 } // 50 button clicks per minute
      };
      
      const limit = limits[commandType] || limits.message;
      const key = `rate_limit:${userId}:${commandType}`;
      
      // Get current usage
      const current = await env.RATE_LIMIT_KV.get(key);
      const requestCount = current ? parseInt(current) : 0;
      
      // Check if limit exceeded
      if (requestCount >= limit.requests) {
        const resetTime = Math.ceil(limit.window / 60);
        await ctx.reply(
          `⏰ คุณใช้งานเกินขีดจำกัด\nกรุณารอ ${resetTime} นาที แล้วลองใหม่อีกครั้ง`,
          {
            reply_markup: {
              inline_keyboard: [[
                { text: '❓ เกี่ยวกับขีดจำกัด', callback_data: 'help_rate_limit' }
              ]]
            }
          }
        );
        return;
      }
      
      // Increment counter
      await env.RATE_LIMIT_KV.put(
        key, 
        (requestCount + 1).toString(), 
        { expirationTtl: limit.window }
      );
      
      // Add rate limit info to context
      ctx.rateLimit = {
        remaining: limit.requests - requestCount - 1,
        resetIn: limit.window
      };
      
      await next();
      
    } catch (error) {
      console.error('Rate limit middleware error:', error);
      // Continue on rate limiting errors
      await next();
    }
  };
}

function getCommandType(ctx) {
  // Photo upload
  if (ctx.message?.photo) {
    return 'photo';
  }
  
  // Callback query (button press)
  if (ctx.callbackQuery) {
    return 'callback';
  }
  
  // Bot command
  if (ctx.message?.text?.startsWith('/')) {
    const command = ctx.message.text.split(' ')[0].substring(1).toLowerCase();
    
    // Wallet-related commands
    if (['wallet', 'balance', 'send', 'receive', 'history', 'deposit', 'withdraw'].includes(command)) {
      return 'wallet';
    }
    
    return 'command';
  }
  
  // Regular message
  return 'message';
}