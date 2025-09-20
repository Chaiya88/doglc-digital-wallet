/**
 * Logging Middleware
 * Comprehensive logging of all bot interactions
 */

export function loggingMiddleware(env) {
  return async (ctx, next) => {
    const startTime = Date.now();
    const requestId = generateRequestId();
    
    // Extract request information
    const userId = ctx.from?.id || 'unknown';
    const chatId = ctx.chat?.id || 'unknown';
    const chatType = ctx.chat?.type || 'unknown';
    const messageType = getMessageType(ctx);
    const command = getCommand(ctx);
    
    // Add request ID to context
    ctx.requestId = requestId;
    
    // Log incoming request
    console.log(`🔵 [${requestId}] Incoming ${messageType}`, {
      userId,
      chatId,
      chatType,
      command,
      timestamp: new Date().toISOString()
    });
    
    try {
      await next();
      
      const duration = Date.now() - startTime;
      
      // Log successful completion
      console.log(`✅ [${requestId}] Completed ${messageType} - ${duration}ms`, {
        userId,
        command,
        duration
      });
      
      // Log to analytics service
      if (env.ANALYTICS_WORKER) {
        logToAnalytics(env.ANALYTICS_WORKER, {
          type: 'bot_interaction',
          requestId,
          userId,
          chatId,
          chatType,
          messageType,
          command,
          duration,
          status: 'success',
          timestamp: Date.now()
        });
      }
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Log error
      console.error(`❌ [${requestId}] Error in ${messageType} - ${duration}ms`, {
        userId,
        command,
        error: error.message,
        stack: error.stack
      });
      
      // Log error to analytics
      if (env.ANALYTICS_WORKER) {
        logToAnalytics(env.ANALYTICS_WORKER, {
          type: 'bot_error',
          requestId,
          userId,
          chatId,
          messageType,
          command,
          duration,
          error: error.message,
          timestamp: Date.now()
        });
      }
      
      throw error;
    }
  };
}

function getMessageType(ctx) {
  if (ctx.callbackQuery) return 'callback_query';
  if (ctx.message?.photo) return 'photo';
  if (ctx.message?.document) return 'document';
  if (ctx.message?.text?.startsWith('/')) return 'command';
  if (ctx.message?.text) return 'text';
  if (ctx.message?.voice) return 'voice';
  if (ctx.message?.video) return 'video';
  if (ctx.message?.sticker) return 'sticker';
  return 'unknown';
}

function getCommand(ctx) {
  if (ctx.callbackQuery) {
    return ctx.callbackQuery.data;
  }
  
  if (ctx.message?.text?.startsWith('/')) {
    return ctx.message.text.split(' ')[0];
  }
  
  return null;
}

function generateRequestId() {
  return Math.random().toString(36).substring(2, 10);
}

async function logToAnalytics(analyticsWorker, data) {
  try {
    await analyticsWorker.fetch('https://analytics-worker/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (error) {
    console.warn('Failed to log to analytics:', error.message);
  }
}