/**
 * DOGLC Digital Wallet - Main Telegram Bot Worker
 * Entry point for Telegram Bot interface with multi-language support
 */

import { Telegraf } from 'telegraf';
import { handleStart } from './handlers/start.js';
import { handleWallet } from './handlers/wallet.js';
import { handleHelp } from './handlers/help.js';
import { authMiddleware } from './middleware/auth.js';
import { rateLimitMiddleware } from './middleware/rateLimit.js';
import { loggingMiddleware } from './middleware/logging.js';
import { getLocalizedMessage } from './locales/index.js';

class TelegramBotWorker {
  constructor(env) {
    this.env = env;
    this.bot = new Telegraf(env.TELEGRAM_BOT_TOKEN);
    this.setupMiddleware();
    this.setupCommands();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    // Logging middleware (first)
    this.bot.use(loggingMiddleware(this.env));
    
    // Rate limiting middleware
    this.bot.use(rateLimitMiddleware(this.env));
    
    // Authentication middleware
    this.bot.use(authMiddleware(this.env));
    
    // Add environment and services to context
    this.bot.use((ctx, next) => {
      ctx.env = this.env;
      ctx.services = {
        banking: this.env.BANKING_WORKER,
        security: this.env.SECURITY_WORKER,
        api: this.env.API_WORKER,
        analytics: this.env.ANALYTICS_WORKER
      };
      ctx.getMessage = (key, params = {}) => getLocalizedMessage(ctx.from?.language_code || 'th', key, params);
      return next();
    });
  }

  setupCommands() {
    // Main commands
    this.bot.command('start', handleStart);
    this.bot.command('wallet', handleWallet);
    this.bot.command('balance', handleWallet);
    this.bot.command('send', handleWallet);
    this.bot.command('receive', handleWallet);
    this.bot.command('history', handleWallet);
    this.bot.command('help', handleHelp);
    
    // Callback query handlers
    this.bot.on('callback_query', async (ctx) => {
      const data = ctx.callbackQuery.data;
      
      try {
        if (data.startsWith('wallet_')) {
          await handleWallet(ctx);
        } else if (data.startsWith('help_')) {
          await handleHelp(ctx);
        } else if (data === 'main_menu') {
          await handleStart(ctx);
        } else {
          await ctx.answerCbQuery(ctx.getMessage('unknownAction'));
        }
      } catch (error) {
        console.error('Callback query error:', error);
        await ctx.answerCbQuery(ctx.getMessage('errorOccurred'));
      }
    });

    // Text message handlers
    this.bot.on('text', async (ctx) => {
      const text = ctx.message.text.toLowerCase();
      
      // Handle special text commands
      if (text.includes('balance') || text.includes('ยอดเงิน')) {
        await handleWallet(ctx);
      } else if (text.includes('help') || text.includes('ช่วยเหลือ')) {
        await handleHelp(ctx);
      } else {
        // Default response for unrecognized text
        await ctx.reply(
          ctx.getMessage('unrecognizedMessage'),
          {
            reply_markup: {
              inline_keyboard: [[
                { text: '🏠 เมนูหลัก', callback_data: 'main_menu' },
                { text: '❓ ช่วยเหลือ', callback_data: 'help_main' }
              ]]
            }
          }
        );
      }
    });

    // Photo handlers (for OCR)
    this.bot.on('photo', async (ctx) => {
      try {
        await ctx.reply(ctx.getMessage('processingImage'));
        
        // Get the largest photo
        const photo = ctx.message.photo[ctx.message.photo.length - 1];
        const fileId = photo.file_id;
        
        // Forward to security worker for OCR processing
        if (ctx.services.security) {
          const response = await ctx.services.security.fetch('https://security-worker/ocr/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileId,
              userId: ctx.from.id,
              messageId: ctx.message.message_id
            })
          });
          
          const result = await response.json();
          
          if (result.success) {
            await ctx.reply(
              ctx.getMessage('ocrSuccess', { amount: result.amount, bank: result.bank }),
              {
                reply_markup: {
                  inline_keyboard: [[
                    { text: '✅ ยืนยัน', callback_data: `confirm_deposit_${result.amount}` },
                    { text: '❌ ยกเลิก', callback_data: 'cancel_deposit' }
                  ]]
                }
              }
            );
          } else {
            await ctx.reply(ctx.getMessage('ocrError'));
          }
        }
      } catch (error) {
        console.error('Photo processing error:', error);
        await ctx.reply(ctx.getMessage('errorOccurred'));
      }
    });
  }

  setupErrorHandling() {
    this.bot.catch((err, ctx) => {
      console.error('Bot error:', err);
      
      // Log error to analytics
      if (ctx?.services?.analytics) {
        ctx.services.analytics.fetch('https://analytics-worker/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'bot_error',
            userId: ctx.from?.id,
            error: err.message,
            timestamp: Date.now()
          })
        }).catch(console.error);
      }
      
      // Send user-friendly error message
      if (ctx?.reply) {
        ctx.reply(ctx.getMessage('errorOccurred')).catch(console.error);
      }
    });
  }

  async handleWebhook(request) {
    try {
      const body = await request.json();
      await this.bot.handleUpdate(body);
      return new Response('OK', { status: 200 });
    } catch (error) {
      console.error('Webhook error:', error);
      return new Response('Error', { status: 500 });
    }
  }

  async setWebhook() {
    const webhookUrl = `${this.env.WEBHOOK_URL}/webhook`;
    
    try {
      await this.bot.telegram.setWebhook(webhookUrl, {
        secret_token: this.env.TELEGRAM_WEBHOOK_SECRET
      });
      console.log('Webhook set successfully:', webhookUrl);
      return true;
    } catch (error) {
      console.error('Failed to set webhook:', error);
      return false;
    }
  }
}

// Cloudflare Workers entry point
export default {
  async fetch(request, env, ctx) {
    const bot = new TelegramBotWorker(env);
    const url = new URL(request.url);

    // Health check endpoint
    if (request.method === 'GET' && url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'healthy',
        worker: 'main-bot',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Webhook setup endpoint
    if (request.method === 'POST' && url.pathname === '/setup-webhook') {
      const success = await bot.setWebhook();
      return new Response(JSON.stringify({
        success,
        webhook_url: env.WEBHOOK_URL
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Webhook handler
    if (request.method === 'POST' && url.pathname === '/webhook') {
      // Verify webhook secret
      const secretToken = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
      if (secretToken !== env.TELEGRAM_WEBHOOK_SECRET) {
        return new Response('Unauthorized', { status: 401 });
      }

      return await bot.handleWebhook(request);
    }

    // Default response
    return new Response('DOGLC Digital Wallet - Main Bot Worker', {
      headers: { 'Content-Type': 'text/plain' }
    });
  }
};