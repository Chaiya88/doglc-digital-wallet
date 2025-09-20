#!/usr/bin/env node

/**
 * Deployment script for Cloudflare Workers with enhanced configuration
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 เริ่มต้น deployment สำหรับ DOGLC Digital Wallet...\n');

// Check if wrangler is installed
try {
  execSync('wrangler --version', { stdio: 'ignore' });
  console.log('✅ Wrangler CLI พร้อมใช้งาน');
} catch (error) {
  console.log('❌ Wrangler ไม่ได้ติดตั้ง กำลังติดตั้ง...');
  execSync('npm install -g wrangler', { stdio: 'inherit' });
}

// Check if .env file exists for local development
if (!fs.existsSync('.env') && !fs.existsSync('.dev.vars')) {
  console.log('⚠️  ไม่พบไฟล์ .env หรือ .dev.vars');
  console.log('กรุณาคัดลอก .env.example เป็น .env และกรอกข้อมูลที่จำเป็น\n');
  
  // Create basic .env file from example
  if (fs.existsSync('.env.example')) {
    fs.copyFileSync('.env.example', '.env');
    console.log('📄 สร้างไฟล์ .env จาก .env.example แล้ว');
    console.log('กรุณาแก้ไขข้อมูลในไฟล์ .env ก่อน deploy\n');
  }
}

// Validate wrangler.toml
if (!fs.existsSync('wrangler.toml')) {
  console.log('❌ ไม่พบไฟล์ wrangler.toml');
  process.exit(1);
}

// Function to deploy
function deploy(environment = 'staging') {
  try {
    console.log(`📦 กำลัง deploy ไปยัง ${environment}...`);
    console.log(`📂 Project: DOGLC Digital Wallet`);
    console.log(`🌐 Multi-language Telegram Bot`);
    console.log(`⚙️  Environment: ${environment}\n`);
    
    // Pre-deployment checks
    console.log('🔍 ตรวจสอบไฟล์ก่อน deploy...');
    
    const requiredFiles = [
      'src/index.js',
      'src/handlers/start.js',
      'src/handlers/wallet.js', 
      'src/handlers/help.js',
      'src/locales/th.js',
      'src/locales/en.js',
      'src/locales/index.js',
      'src/utils/helpers.js',
      'src/utils/config.js',
      'src/utils/ocr.js',
      'src/utils/gmail.js'
    ];
    
    const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
    
    if (missingFiles.length > 0) {
      console.log('❌ ไฟล์ที่จำเป็นหายไป:');
      missingFiles.forEach(file => console.log(`   - ${file}`));
      process.exit(1);
    }
    
    console.log('✅ ไฟล์ทั้งหมดพร้อม (รวม OCR และ Gmail integration)\n');
    
    // Validate enhanced configuration
    console.log('🔍 ตรวจสอบ configuration สำหรับ advanced features...');
    
    const wranglerConfig = fs.readFileSync('wrangler.toml', 'utf8');
    const requiredBindings = [
      'OCR_LOG_KV',
      'GMAIL_LOG_KV', 
      'SECURITY_EVENTS_KV',
      'SLIP_IMAGES_R2',
      'OCR_WORKER',
      'DEPOSIT_QUEUE'
    ];
    
    const missingBindings = requiredBindings.filter(binding => !wranglerConfig.includes(binding));
    
    if (missingBindings.length > 0) {
      console.log('⚠️  Enhanced bindings ที่อาจยังไม่ได้ตั้งค่า:');
      missingBindings.forEach(binding => console.log(`   - ${binding}`));
      console.log('   (สามารถ deploy ได้ แต่ advanced features อาจไม่ทำงาน)\n');
    } else {
      console.log('✅ Enhanced configuration พร้อม\n');
    }
    
    // Deploy command
    const deployCommand = environment === 'production' 
      ? 'wrangler deploy --env production'
      : 'wrangler deploy --env staging';
    
    console.log(`🔧 Running: ${deployCommand}\n`);
    execSync(deployCommand, { stdio: 'inherit' });
    
    console.log(`\n✅ Deploy สำเร็จ!`);
    console.log(`🌐 DOGLC Digital Wallet Bot พร้อมใช้งานแล้ว`);
    console.log(`📊 Features: Multi-language (6 ภาษา), OCR Slip Verification, Gmail Integration, Enhanced Security`);
    
    if (environment === 'production') {
      console.log(`\n🔧 สิ่งที่ควรทำต่อ:`)
      console.log(`1. ✅ ตั้งค่า Webhook URL ใน Telegram Bot via @BotFather`)
      console.log(`2. ✅ เพิ่ม Environment Variables ใน Cloudflare Dashboard`)
      console.log(`3. ✅ ตรวจสอบ KV Namespaces, D1 Databases, และ R2 Buckets`)
      console.log(`4. ✅ ตั้งค่า Google Vision API สำหรับ OCR`)
      console.log(`5. ✅ ตั้งค่า Gmail API สำหรับ banking integration`)
      console.log(`6. ✅ ทดสอบ Bot ใน Telegram (@DoglcWallet_Bot)`)
      console.log(`7. ✅ ตรวจสอบ Health Check: https://your-worker.workers.dev/health`)
      
      console.log(`\n📋 Environment Variables ที่ต้องตั้งค่า:`)
      console.log(`   • TELEGRAM_BOT_TOKEN`)
      console.log(`   • JWT_SECRET`) 
      console.log(`   • ENCRYPTION_KEY`)
      console.log(`   • GOOGLE_VISION_API_KEY`)
      console.log(`   • GMAIL_CLIENT_ID & GMAIL_CLIENT_SECRET`)
      console.log(`   • CLOUDFLARE_ACCOUNT_ID`)
      console.log(`   • และอื่นๆ ตาม .env.example`)
      
      console.log(`\n🏦 Banking Features:`)
      console.log(`   • ✅ Thai Banking Slip OCR Verification`)
      console.log(`   • ✅ Gmail Auto-confirmation Integration`)
      console.log(`   • ✅ THB/USDT Balance Management`)
      console.log(`   • ✅ VIP System with Enhanced Limits`)
      console.log(`   • ✅ Advanced Security & Fraud Detection`)
    } else {
      console.log(`\n🧪 Staging Environment:`)
      console.log(`   • ทดสอบ OCR slip verification`)
      console.log(`   • ทดสอบ Gmail webhook integration`)
      console.log(`   • ทดสอบ multi-language support (6 ภาษา)`)
      console.log(`   • ทดสอบ enhanced security features`)
      console.log(`   • ทดสอบ rate limiting และ fraud detection`)
    }
    
  } catch (error) {
    console.error('\n❌ Deploy ไม่สำเร็จ:', error.message);
    console.log('\n🔧 วิธีแก้ไขปัญหา:');
    console.log('1. ตรวจสอบ wrangler login status');
    console.log('2. ตรวจสอบ wrangler.toml configuration');
    console.log('3. ตรวจสอบ Cloudflare account permissions');
    console.log('4. ดู error log ด้านบนสำหรับรายละเอียด');
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const environment = args.includes('--prod') || args.includes('--production') ? 'production' : 'staging';

// Show deployment info
console.log('📋 Deployment Information:');
console.log(`   Environment: ${environment}`);
console.log(`   Bot Features: 6 languages, OCR verification, Gmail integration`);
console.log(`   Security: Enhanced fraud detection, audit logging`);
console.log(`   Banking: Thai slip verification, auto-confirmation`);
console.log(`   Architecture: Multi-worker + D1 + KV + R2 + Queues`);
console.log('');

deploy(environment);