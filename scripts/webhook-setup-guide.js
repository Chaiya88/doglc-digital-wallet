#!/usr/bin/env node

/**
 * Simple Telegram Bot Webhook Setup
 * Uses hardcoded bot token for production setup
 */

import { execSync } from 'child_process';

const WEBHOOK_URL = 'https://doglc-digital-wallet-production.jameharu-no1.workers.dev';

// First, let's check if we have the token from environment or user input
async function setupWebhook() {
  try {
    console.log('🤖 DOGLC Digital Wallet - Telegram Bot Webhook Setup');
    console.log('='.repeat(60));
    
    // For security, we'll use a manual approach
    console.log('📋 Manual webhook setup required');
    console.log('📡 Webhook URL:', WEBHOOK_URL);
    console.log('');
    
    console.log('🔧 To setup the webhook manually, run these commands:');
    console.log('');
    console.log('1️⃣ Get your bot token and run:');
    console.log(`   curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \\`);
    console.log(`        -H "Content-Type: application/json" \\`);
    console.log(`        -d '{"url":"${WEBHOOK_URL}","max_connections":100}'`);
    console.log('');
    
    console.log('2️⃣ Verify webhook setup:');
    console.log(`   curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"`);
    console.log('');
    
    console.log('3️⃣ Test bot info:');
    console.log(`   curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getMe"`);
    console.log('');
    
    // Test the webhook endpoint
    console.log('🧪 Testing webhook endpoint...');
    try {
      const response = execSync(`curl -s "${WEBHOOK_URL}/health"`, { encoding: 'utf8' });
      const healthData = JSON.parse(response);
      
      if (healthData.status === 'ok') {
        console.log('✅ Bot worker is healthy and ready!');
        console.log(`🤖 Service: ${healthData.service}`);
        console.log(`📦 Version: ${healthData.version}`);
        console.log(`🔧 Features: ${healthData.features?.length || 0} enabled`);
      } else {
        console.log('⚠️  Bot worker health check failed');
      }
    } catch (error) {
      console.log('❌ Could not test webhook endpoint:', error.message);
    }
    
    console.log('');
    console.log('📱 After setting up the webhook, users can start chatting with your bot!');
    console.log('💬 Bot commands available:');
    console.log('   /start - Start the bot');
    console.log('   /wallet - View wallet information');
    console.log('   /help - Get help');
    console.log('   /admin - Admin commands (if authorized)');
    console.log('');
    console.log('🎉 Setup guide complete!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setupWebhook();