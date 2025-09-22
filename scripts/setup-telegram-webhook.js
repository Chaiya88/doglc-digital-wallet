#!/usr/bin/env node

/**
 * Telegram Bot Webhook Setup Script
 * Sets up webhook for DOGLC Digital Wallet Bot
 */

import { execSync } from 'child_process';

const WEBHOOK_URL = 'https://doglc-digital-wallet-production.jameharu-no1.workers.dev';

async function setupWebhook() {
  try {
    console.log('🤖 Setting up Telegram Bot Webhook...');
    
    // Get bot token from wrangler secrets
    console.log('📡 Getting bot token...');
    const botToken = execSync('npx wrangler secret get TELEGRAM_BOT_TOKEN --env production', { 
      encoding: 'utf8' 
    }).trim();
    
    if (!botToken || botToken.includes('ERROR')) {
      throw new Error('Could not retrieve bot token from Wrangler secrets');
    }
    
    console.log(`✅ Bot token retrieved (length: ${botToken.length})`);
    
    // Check current webhook info
    console.log('🔍 Checking current webhook status...');
    const webhookInfoUrl = `https://api.telegram.org/bot${botToken}/getWebhookInfo`;
    
    try {
      const currentWebhook = execSync(`curl -s "${webhookInfoUrl}"`, { encoding: 'utf8' });
      const webhookData = JSON.parse(currentWebhook);
      
      console.log('📋 Current webhook info:');
      console.log(`  URL: ${webhookData.result.url || 'Not set'}`);
      console.log(`  Has custom certificate: ${webhookData.result.has_custom_certificate}`);
      console.log(`  Pending update count: ${webhookData.result.pending_update_count}`);
      console.log(`  Last error date: ${webhookData.result.last_error_date || 'None'}`);
      console.log(`  Last error message: ${webhookData.result.last_error_message || 'None'}`);
    } catch (error) {
      console.log('⚠️  Could not get current webhook info:', error.message);
    }
    
    // Set new webhook
    console.log(`🔧 Setting webhook to: ${WEBHOOK_URL}`);
    const setWebhookUrl = `https://api.telegram.org/bot${botToken}/setWebhook`;
    const webhookData = {
      url: WEBHOOK_URL,
      max_connections: 100,
      allowed_updates: ["message", "callback_query", "inline_query"]
    };
    
    const curlCommand = `curl -X POST "${setWebhookUrl}" -H "Content-Type: application/json" -d '${JSON.stringify(webhookData)}'`;
    const response = execSync(curlCommand, { encoding: 'utf8' });
    const result = JSON.parse(response);
    
    if (result.ok) {
      console.log('✅ Webhook set successfully!');
      console.log(`📡 Webhook URL: ${WEBHOOK_URL}`);
      console.log(`🔧 Description: ${result.description}`);
    } else {
      throw new Error(`Webhook setup failed: ${result.description}`);
    }
    
    // Verify webhook
    console.log('🔍 Verifying webhook setup...');
    const verifyResponse = execSync(`curl -s "${webhookInfoUrl}"`, { encoding: 'utf8' });
    const verifyData = JSON.parse(verifyResponse);
    
    if (verifyData.result.url === WEBHOOK_URL) {
      console.log('✅ Webhook verification successful!');
      console.log(`📡 Active webhook: ${verifyData.result.url}`);
    } else {
      console.log('⚠️  Webhook verification failed');
      console.log(`Expected: ${WEBHOOK_URL}`);
      console.log(`Actual: ${verifyData.result.url}`);
    }
    
    // Test bot functionality
    console.log('🧪 Testing bot functionality...');
    const botInfoUrl = `https://api.telegram.org/bot${botToken}/getMe`;
    const botInfo = execSync(`curl -s "${botInfoUrl}"`, { encoding: 'utf8' });
    const botData = JSON.parse(botInfo);
    
    if (botData.ok) {
      console.log('✅ Bot is functional!');
      console.log(`🤖 Bot name: ${botData.result.first_name}`);
      console.log(`📝 Bot username: @${botData.result.username}`);
      console.log(`🆔 Bot ID: ${botData.result.id}`);
    } else {
      console.log('❌ Bot test failed:', botData.description);
    }
    
    console.log('\n🎉 Telegram Bot Setup Complete!');
    console.log('📱 Users can now interact with the bot');
    console.log('🔗 Webhook URL:', WEBHOOK_URL);
    
  } catch (error) {
    console.error('❌ Webhook setup failed:', error.message);
    process.exit(1);
  }
}

// Run the setup
setupWebhook();