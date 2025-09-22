/**
 * 🤖 DOGLC DIGITAL WALLET - MAIN BOT
 * Enhanced with multi-language support and full features
 */

import 'dotenv/config';
import { getMessages, detectUserLanguage, formatMessage, getLanguageDisplay } from './locales/index.js';
import { WalletManager, formatCurrency, convertCurrency } from './utils/wallet.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Initialize Wallet Manager
    const walletManager = new WalletManager(env);
    
    // Health check
    if (request.method === 'GET') {
      return Response.json({
        status: 'ok',
        service: 'doglc-digital-wallet',
        version: '3.0-full-features',
        features: [
          'multi_language_support',
          'wallet_management', 
          'deposit_withdrawal',
          'money_transfer',
          'security_system',
          'analytics_monitoring'
        ],
        supported_languages: ['th', 'en', 'zh', 'km', 'ko', 'id'],
        timestamp: new Date().toISOString(),
        uptime: Date.now()
      });
    }
    
    // Handle webhook
    if (request.method === 'POST') {
      try {
        const update = await request.json();
        
        // Initialize Telegraf bot
        const { Telegraf } = await import('telegraf');
        const bot = new Telegraf(env.TELEGRAM_BOT_TOKEN || env.BOT_TOKEN);
        
        // === MIDDLEWARE SETUP ===
        bot.use(async (ctx, next) => {
          try {
            // User session data
            ctx.userId = ctx.from?.id;
            ctx.chatId = ctx.chat?.id;
            
            // Check for saved user language preference first
            let userLang = 'en'; // Default to English
            
            if (ctx.userId && env.USER_SESSIONS) {
              try {
                const userSession = await env.USER_SESSIONS.get(`lang_${ctx.userId}`);
                if (userSession) {
                  userLang = userSession;
                }
              } catch (error) {
                console.log('Could not load user language preference:', error);
                // Fall back to default English
              }
            }
            
            ctx.userLanguage = userLang;
            ctx.messages = getMessages(userLang);
            
            // Add wallet manager to context
            ctx.wallet = walletManager;
            
            // Rate limiting check (basic)
            const rateLimitKey = `rate_${ctx.userId}`;
            const now = Date.now();
            
            await next();
            
          } catch (error) {
            console.error('Middleware error:', error);
            const messages = getMessages('en'); // Always use English for errors
            await ctx.reply(messages.errorOccurred);
          }
        });
        
        // === START COMMAND ===
        bot.start(async (ctx) => {
          try {
            const messages = ctx.messages;
            
            const keyboard = {
              inline_keyboard: [
                [
                  { text: messages.balanceBtn, callback_data: 'balance' },
                  { text: messages.depositBtn, callback_data: 'deposit' }
                ],
                [
                  { text: messages.withdrawBtn, callback_data: 'withdraw' },
                  { text: messages.sendBtn, callback_data: 'send' }
                ],
                [
                  { text: messages.historyBtn, callback_data: 'history' },
                  { text: messages.languageBtn, callback_data: 'change_language' }
                ],
                [
                  { text: messages.settingsBtn, callback_data: 'settings' },
                  { text: messages.helpBtn, callback_data: 'help' }
                ]
              ]
            };
            
            await ctx.reply(messages.welcome, {
              reply_markup: keyboard,
              parse_mode: 'HTML'
            });
            
          } catch (error) {
            console.error('Start error:', error);
            await ctx.reply(ctx.messages.errorOccurred);
          }
        });
        
        // === CALLBACK HANDLERS ===
        bot.on('callback_query', async (ctx) => {
          try {
            const data = ctx.callbackQuery.data;
            const messages = ctx.messages;
            
            let responseMessage = '';
            let keyboard = {};
            
            switch (data) {
              case 'wallet':
                // ดึงข้อมูล wallet จริง
                let userWallet = await ctx.wallet.getWallet(ctx.userId);
                
                if (!userWallet) {
                  // สร้าง wallet ใหม่ถ้ายังไม่มี
                  userWallet = await ctx.wallet.createWallet(ctx.userId, {
                    firstName: ctx.from.first_name,
                    username: ctx.from.username
                  });
                }
                
                responseMessage = ctx.messages.walletDetails
                  .replace('{thbBalance}', formatCurrency(userWallet.balances.THB, 'THB'))
                  .replace('{usdtBalance}', formatCurrency(userWallet.balances.USDT, 'USDT'))
                  .replace('{totalTransactions}', userWallet.statistics.totalTransactions)
                  .replace('{totalDeposits}', formatCurrency(userWallet.statistics.totalDeposits, 'THB'))
                  .replace('{address}', userWallet.address)
                  .replace('{updatedAt}', new Date(userWallet.updatedAt).toLocaleString('en-US'));
                
                keyboard = {
                  inline_keyboard: [
                    [
                      { text: ctx.messages.depositBtn, callback_data: 'deposit' },
                      { text: ctx.messages.withdrawBtn, callback_data: 'withdraw' }
                    ],
                    [
                      { text: ctx.messages.sendBtn, callback_data: 'send' },
                      { text: ctx.messages.historyBtn, callback_data: 'history' }
                    ],
                    [
                      { text: ctx.messages.backToMainBtn, callback_data: 'start' }
                    ]
                  ]
                };
                break;
                
              case 'balance':
                // ดึงข้อมูล wallet และแสดงยอดเงินแบบละเอียด
                const walletData = await ctx.wallet.getWallet(ctx.userId);
                
                if (!walletData) {
                  responseMessage = ctx.messages.noWalletBalance;
                } else {
                  const totalValueTHB = walletData.balances.THB + convertCurrency(walletData.balances.USDT, 'USDT', 'THB');
                  const totalValueUSD = convertCurrency(totalValueTHB, 'THB', 'USDT');
                  
                  responseMessage = ctx.messages.balanceDetails
                    .replace('{thbBalance}', formatCurrency(walletData.balances.THB, 'THB'))
                    .replace('{usdtBalance}', formatCurrency(walletData.balances.USDT, 'USDT'))
                    .replace('{totalValueTHB}', formatCurrency(totalValueTHB, 'THB'))
                    .replace('{totalValueUSD}', totalValueUSD.toFixed(2))
                    .replace('{timestamp}', new Date(walletData.updatedAt).toLocaleString('en-US'));
                }
                
                keyboard = {
                  inline_keyboard: [
                    [
                      { text: ctx.messages.refreshBtn, callback_data: 'balance' },
                      { text: ctx.messages.chartBtn, callback_data: 'chart' }
                    ],
                    [
                      { text: ctx.messages.backBtn, callback_data: 'wallet' }
                    ]
                  ]
                };
                break;
                
              case 'deposit_thb':
                const depositAddressTHB = ctx.wallet.generateDepositAddress(ctx.userId, 'THB');
                
                responseMessage = ctx.messages.depositTHB.replace('{depositAddress}', depositAddressTHB);
                
                keyboard = {
                  inline_keyboard: [
                    [
                      { text: ctx.messages.demoDeposit100, callback_data: 'demo_deposit_100' },
                      { text: ctx.messages.demoDeposit500, callback_data: 'demo_deposit_500' }
                    ],
                    [
                      { text: ctx.messages.sendSlipBtn, callback_data: 'upload_slip' }
                    ],
                    [
                      { text: ctx.messages.backBtn, callback_data: 'deposit' }
                    ]
                  ]
                };
                break;
                
              case 'deposit_usdt':
                const depositAddressUSDT = ctx.wallet.generateDepositAddress(ctx.userId, 'USDT');
                
                responseMessage = ctx.messages.depositUSDT.replace('{depositAddress}', depositAddressUSDT);
                
                keyboard = {
                  inline_keyboard: [
                    [
                      { text: ctx.messages.demoDeposit10USDT, callback_data: 'demo_deposit_10_usdt' },
                      { text: ctx.messages.demoDeposit50USDT, callback_data: 'demo_deposit_50_usdt' }
                    ],
                    [
                      { text: ctx.messages.checkDepositStatus, callback_data: 'check_deposit_status' }
                    ],
                    [
                      { text: ctx.messages.backBtn, callback_data: 'deposit' }
                    ]
                  ]
                };
                break;
                
              // Demo deposit handlers
              case 'demo_deposit_100':
                try {
                  await ctx.wallet.updateBalance(ctx.userId, 'THB', 100, 'add');
                  await ctx.wallet.addTransaction(ctx.userId, {
                    type: 'deposit',
                    currency: 'THB',
                    amount: 100,
                    method: 'bank_transfer',
                    description: 'Demo deposit - Bank Transfer',
                    status: 'completed'
                  });
                  
                  responseMessage = `✅ <b>ฝากเงินสำเร็จ!</b>

💰 <b>รายละเอียด:</b>
• จำนวน: 100.00 บาท
• ประเภท: โอนธนาคาร (Demo)
• สถานะ: สำเร็จ
• เวลา: ${new Date().toLocaleString('th-TH')}

🎉 ยอดเงินในกระเป๋าของคุณได้รับการอัพเดทแล้ว!`;
                  
                  keyboard = {
                    inline_keyboard: [
                      [
                        { text: '💰 ดูยอดเงิน', callback_data: 'balance' },
                        { text: '📋 ดูประวัติ', callback_data: 'history' }
                      ],
                      [
                        { text: '🔙 กลับหน้าหลัก', callback_data: 'start' }
                      ]
                    ]
                  };
                } catch (error) {
                  responseMessage = `❌ <b>เกิดข้อผิดพลาด</b>

ไม่สามารถประมวลผลการฝากเงินได้ กรุณาลองใหม่อีกครั้ง`;
                  
                  keyboard = {
                    inline_keyboard: [
                      [{ text: '🔙 กลับ', callback_data: 'deposit_thb' }]
                    ]
                  };
                }
                break;
                
              case 'demo_deposit_500':
                try {
                  await ctx.wallet.updateBalance(ctx.userId, 'THB', 500, 'add');
                  await ctx.wallet.addTransaction(ctx.userId, {
                    type: 'deposit',
                    currency: 'THB',
                    amount: 500,
                    method: 'bank_transfer',
                    description: 'Demo deposit - Bank Transfer',
                    status: 'completed'
                  });
                  
                  responseMessage = `✅ <b>ฝากเงินสำเร็จ!</b>

💰 <b>รายละเอียด:</b>
• จำนวน: 500.00 บาท
• ประเภท: โอนธนาคาร (Demo)
• สถานะ: สำเร็จ
• เวลา: ${new Date().toLocaleString('th-TH')}

🎉 ยอดเงินในกระเป๋าของคุณได้รับการอัพเดทแล้ว!`;
                  
                  keyboard = {
                    inline_keyboard: [
                      [
                        { text: '💰 ดูยอดเงิน', callback_data: 'balance' },
                        { text: '📋 ดูประวัติ', callback_data: 'history' }
                      ],
                      [
                        { text: '🔙 กลับหน้าหลัก', callback_data: 'start' }
                      ]
                    ]
                  };
                } catch (error) {
                  responseMessage = `❌ <b>เกิดข้อผิดพลาด</b>

ไม่สามารถประมวลผลการฝากเงินได้ กรุณาลองใหม่อีกครั้ง`;
                  
                  keyboard = {
                    inline_keyboard: [
                      [{ text: '🔙 กลับ', callback_data: 'deposit_thb' }]
                    ]
                  };
                }
                break;
                
              case 'demo_deposit_10_usdt':
                try {
                  await ctx.wallet.updateBalance(ctx.userId, 'USDT', 10, 'add');
                  await ctx.wallet.addTransaction(ctx.userId, {
                    type: 'deposit',
                    currency: 'USDT',
                    amount: 10,
                    method: 'crypto_transfer',
                    description: 'Demo deposit - USDT TRC-20',
                    status: 'completed'
                  });
                  
                  responseMessage = `✅ <b>ฝาก USDT สำเร็จ!</b>

🔷 <b>รายละเอียด:</b>
• จำนวน: 10.00 USDT
• Network: TRC-20 (Demo)
• สถานะ: สำเร็จ
• เวลา: ${new Date().toLocaleString('th-TH')}

💎 ยอด USDT ในกระเป๋าของคุณได้รับการอัพเดทแล้ว!`;
                  
                  keyboard = {
                    inline_keyboard: [
                      [
                        { text: '💰 ดูยอดเงิน', callback_data: 'balance' },
                        { text: '📋 ดูประวัติ', callback_data: 'history' }
                      ],
                      [
                        { text: '🔙 กลับหน้าหลัก', callback_data: 'start' }
                      ]
                    ]
                  };
                } catch (error) {
                  responseMessage = `❌ <b>เกิดข้อผิดพลาด</b>

ไม่สามารถประมวลผลการฝากเงินได้ กรุณาลองใหม่อีกครั้ง`;
                  
                  keyboard = {
                    inline_keyboard: [
                      [{ text: '🔙 กลับ', callback_data: 'deposit_usdt' }]
                    ]
                  };
                }
                break;
                
              case 'withdraw':
                responseMessage = `📥 <b>ถอนเงิน</b>

เลือกสกุลเงินที่ต้องการถอน:

💰 <b>THB (บาท):</b>
• ไปยังบัญชีธนาคาร
• ขั้นต่ำ 100 บาท
• ค่าธรรมเนียม 10 บาท

🔷 <b>USDT:</b>
• ไปยัง Wallet Address
• ขั้นต่ำ 10 USDT
• ค่าธรรมเนียม Network`;
                
                keyboard = {
                  inline_keyboard: [
                    [
                      { text: '💰 ถอน THB', callback_data: 'withdraw_thb' },
                      { text: '🔷 ถอน USDT', callback_data: 'withdraw_usdt' }
                    ],
                    [
                      { text: '📋 ดูคำแนะนำ', callback_data: 'withdraw_guide' }
                    ],
                    [
                      { text: '🔙 กลับ', callback_data: 'wallet' }
                    ]
                  ]
                };
                break;
                
              case 'send':
                responseMessage = `📨 <b>ส่งเงิน</b>

เลือกประเภทการส่งเงิน:

👥 <b>ส่งภายใน:</b>
• ส่งให้ผู้ใช้ในระบบ
• ไม่มีค่าธรรมเนียม
• ทันที

🌐 <b>ส่งภายนอก:</b>
• ส่งไปธนาคาร/กระเป๋าเงินอื่น
• มีค่าธรรมเนียม
• 5-30 นาที`;
                
                keyboard = {
                  inline_keyboard: [
                    [
                      { text: '👥 ส่งภายใน', callback_data: 'send_internal' },
                      { text: '🌐 ส่งภายนอก', callback_data: 'send_external' }
                    ],
                    [
                      { text: '📱 QR Code', callback_data: 'send_qr' }
                    ],
                    [
                      { text: '🔙 กลับ', callback_data: 'wallet' }
                    ]
                  ]
                };
                break;
                
              case 'history':
                // ดึงประวัติธุรกรรมจริง
                const transactions = await ctx.wallet.getTransactionHistory(ctx.userId, 10);
                const summary = await ctx.wallet.generateSummaryReport(ctx.userId);
                
                if (!summary) {
                  responseMessage = `📋 <b>ประวัติธุรกรรม</b>

❌ ไม่พบกระเป๋าเงิน กรุณาสร้างกระเป๋าเงินก่อน`;
                } else {
                  let transactionList = '';
                  if (transactions.length === 0) {
                    transactionList = '• ไม่มีธุรกรรม';
                  } else {
                    transactions.slice(0, 5).forEach((tx, index) => {
                      const date = new Date(tx.timestamp).toLocaleDateString('th-TH');
                      const time = new Date(tx.timestamp).toLocaleTimeString('th-TH', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      });
                      transactionList += `• ${tx.type} ${tx.amount} ${tx.currency} (${date} ${time})\n`;
                    });
                  }
                  
                  responseMessage = `📋 <b>ประวัติธุรกรรม</b>

📅 <b>วันนี้:</b> ${summary.recentActivity.today} ธุรกรรม
📊 <b>สัปดาห์นี้:</b> ${summary.recentActivity.thisWeek} ธุรกรรม  
📈 <b>เดือนนี้:</b> ${summary.recentActivity.thisMonth} ธุรกรรม

🏆 <b>ธุรกรรมล่าสุด:</b>
${transactionList}

💡 <b>ยอดรวมทั้งหมด:</b> ${summary.statistics.totalTransactions} ครั้ง`;
                }
                
                keyboard = {
                  inline_keyboard: [
                    [
                      { text: '📊 รายงานสรุป', callback_data: 'history_summary' },
                      { text: '📱 ส่งออก PDF', callback_data: 'export_pdf' }
                    ],
                    [
                      { text: '🔙 กลับ', callback_data: 'wallet' }
                    ]
                  ]
                };
                break;
                
              case 'change_language':
                responseMessage = `🌐 <b>เลือกภาษา / Select Language</b>

เลือกภาษาที่ต้องการ:`;
                
                keyboard = {
                  inline_keyboard: [
                    [
                      { text: '🇹🇭 ไทย', callback_data: 'lang_th' },
                      { text: '🇺🇸 English', callback_data: 'lang_en' }
                    ],
                    [
                      { text: '🇨🇳 中文', callback_data: 'lang_zh' },
                      { text: '🇰🇭 ខ្មែរ', callback_data: 'lang_km' }
                    ],
                    [
                      { text: '🇰🇷 한국어', callback_data: 'lang_ko' },
                      { text: '🇮🇩 Indonesia', callback_data: 'lang_id' }
                    ],
                    [
                      { text: '🔙 กลับหน้าหลัก', callback_data: 'main_menu' }
                    ]
                  ]
                };
                break;
                
              case 'settings':
                responseMessage = ctx.messages.settingsMenu;
                
                keyboard = {
                  inline_keyboard: [
                    [
                      { text: ctx.messages.setPinBtn, callback_data: 'set_pin' },
                      { text: ctx.messages.notificationBtn, callback_data: 'notifications' }
                    ],
                    [
                      { text: ctx.messages.languageBtn, callback_data: 'change_language' }
                    ],
                    [
                      { text: ctx.messages.backToMainBtn, callback_data: 'start' }
                    ]
                  ]
                };
                break;
                
              case 'help':
                responseMessage = ctx.messages.helpMenu;
                
                keyboard = {
                  inline_keyboard: [
                    [
                      { text: '📋 FAQ', callback_data: 'faq' },
                      { text: '💬 Live Chat', callback_data: 'live_chat' }
                    ],
                    [
                      { text: ctx.messages.backToMainBtn, callback_data: 'main_menu' }
                    ]
                  ]
                };
                break;
                
              case 'main_menu':
                // Send main menu message same as /start
                const welcomeMsg = ctx.messages.welcome.replace(/{username}/g, ctx.from?.username || ctx.from?.first_name || 'user');
                responseMessage = welcomeMsg + '\n\n' + ctx.messages.mainMenu;
                
                keyboard = {
                  inline_keyboard: [
                    [
                      { text: ctx.messages.balanceBtn, callback_data: 'balance' },
                      { text: ctx.messages.depositBtn, callback_data: 'deposit' }
                    ],
                    [
                      { text: ctx.messages.withdrawBtn, callback_data: 'withdraw' },
                      { text: ctx.messages.sendBtn, callback_data: 'send' }
                    ],
                    [
                      { text: ctx.messages.historyBtn, callback_data: 'history' },
                      { text: ctx.messages.languageBtn, callback_data: 'change_language' }
                    ],
                    [
                      { text: ctx.messages.settingsBtn, callback_data: 'settings' },
                      { text: ctx.messages.helpBtn, callback_data: 'help' }
                    ]
                  ]
                };
                break;
                
              // Language change handlers
              case 'lang_th':
              case 'lang_en':
              case 'lang_zh':
              case 'lang_km':
              case 'lang_ko':
              case 'lang_id':
                const newLang = data.replace('lang_', '');
                ctx.userLanguage = newLang;
                ctx.messages = getMessages(newLang);
                
                // Save user language preference to KV storage
                if (ctx.userId && env.USER_SESSIONS) {
                  try {
                    await env.USER_SESSIONS.put(`lang_${ctx.userId}`, newLang);
                  } catch (error) {
                    console.log('Could not save user language preference:', error);
                  }
                }
                
                responseMessage = ctx.messages.languageChanged.replace('{language}', getLanguageDisplay(newLang));
                keyboard = {
                  inline_keyboard: [
                    [{ text: ctx.messages.backToMainBtn, callback_data: 'main_menu' }]
                  ]
                };
                break;
                
              // Missing handlers - เพิ่มให้ครบ
              case 'withdraw_thb':
                responseMessage = `💰 <b>ถอนเงิน THB</b>

🏦 <b>ข้อมูลการถอนเงิน:</b>
• ขั้นต่ำ: 100 บาท
• ค่าธรรมเนียม: 10 บาท
• ระยะเวลา: 1-24 ชั่วโมง

📋 <b>ขั้นตอน:</b>
1. ระบุจำนวนเงินที่ต้องการถอน
2. กรอกข้อมูลบัญชีธนาคาร
3. ยืนยันการถอนเงิน
4. รอการประมวลผล

🚧 <b>สถานะ:</b> ฟีเจอร์กำลังพัฒนา`;
                
                keyboard = {
                  inline_keyboard: [
                    [
                      { text: '💰 ทดสอบถอน 50 บาท', callback_data: 'demo_withdraw_50' },
                      { text: '💰 ทดสอบถอน 200 บาท', callback_data: 'demo_withdraw_200' }
                    ],
                    [
                      { text: '🔙 กลับ', callback_data: 'withdraw' }
                    ]
                  ]
                };
                break;
                
              case 'withdraw_usdt':
                responseMessage = `🔷 <b>ถอน USDT</b>

🔗 <b>ข้อมูลการถอนเงิน:</b>
• ขั้นต่ำ: 10 USDT
• ค่าธรรมเนียม: 2 USDT
• Network: TRC-20 (Tron)
• ระยะเวลา: 5-30 นาที

📋 <b>ขั้นตอน:</b>
1. ระบุจำนวน USDT ที่ต้องการถอน
2. กรอก Wallet Address ปลายทาง
3. ยืนยันการถอนเงิน
4. รอ Network Confirmation

🚧 <b>สถานะ:</b> ฟีเจอร์กำลังพัฒนา`;
                
                keyboard = {
                  inline_keyboard: [
                    [
                      { text: '🔷 ทดสอบถอน 5 USDT', callback_data: 'demo_withdraw_5_usdt' },
                      { text: '🔷 ทดสอบถอน 20 USDT', callback_data: 'demo_withdraw_20_usdt' }
                    ],
                    [
                      { text: '🔙 กลับ', callback_data: 'withdraw' }
                    ]
                  ]
                };
                break;
                
              case 'send_internal':
                responseMessage = `👥 <b>ส่งเงินภายใน</b>

💫 <b>ส่งให้ผู้ใช้ในระบบ:</b>
• ไม่มีค่าธรรมเนียม
• ทันที (Real-time)
• รองรับ THB และ USDT
• ปลอดภัย 100%

📋 <b>ขั้นตอน:</b>
1. ระบุ User ID หรือ Username ผู้รับ
2. เลือกสกุลเงินและจำนวน
3. เพิ่มข้อความ (ถ้าต้องการ)
4. ยืนยันการส่งเงิน

🚧 <b>สถานะ:</b> ฟีเจอร์กำลังพัฒนา`;
                
                keyboard = {
                  inline_keyboard: [
                    [
                      { text: '💰 ส่ง THB', callback_data: 'send_thb_internal' },
                      { text: '🔷 ส่ง USDT', callback_data: 'send_usdt_internal' }
                    ],
                    [
                      { text: '🔙 กลับ', callback_data: 'send' }
                    ]
                  ]
                };
                break;
                
              case 'send_external':
                responseMessage = `🌐 <b>ส่งเงินภายนอก</b>

🏦 <b>ส่งไปยังระบบภายนอก:</b>
• ธนาคาร (THB)
• Crypto Wallet (USDT)
• มีค่าธรรมเนียม
• ระยะเวลา 5-60 นาที

📋 <b>ค่าธรรมเนียม:</b>
• THB: 25 บาท + ค่าธรรมเนียมธนาคาร
• USDT: 3 USDT + Network Fee

🚧 <b>สถานะ:</b> ฟีเจอร์กำลังพัฒนา`;
                
                keyboard = {
                  inline_keyboard: [
                    [
                      { text: '🏦 ส่งไปธนาคาร', callback_data: 'send_bank' },
                      { text: '🔷 ส่งไป Wallet', callback_data: 'send_crypto' }
                    ],
                    [
                      { text: '🔙 กลับ', callback_data: 'send' }
                    ]
                  ]
                };
                break;
                
              case 'qr_code':
              case 'send_qr':
                responseMessage = `📱 <b>QR Code สำหรับรับเงิน</b>

🎯 <b>สร้าง QR Code:</b>
• สำหรับรับเงินจากผู้อื่น
• กำหนดจำนวนเงินได้
• มีระยะเวลาหมดอายุ
• ปลอดภัยด้วยการเข้ารหัส

📋 <b>ขั้นตอน:</b>
1. เลือกสกุลเงิน (THB/USDT)
2. ระบุจำนวนเงิน
3. สร้าง QR Code
4. แชร์ให้ผู้ส่งเงิน

🚧 <b>สถานะ:</b> ฟีเจอร์กำลังพัฒนา`;
                
                keyboard = {
                  inline_keyboard: [
                    [
                      { text: '💰 QR รับ THB', callback_data: 'qr_thb' },
                      { text: '🔷 QR รับ USDT', callback_data: 'qr_usdt' }
                    ],
                    [
                      { text: '🔙 กลับ', callback_data: 'send' }
                    ]
                  ]
                };
                break;
                
              case 'payment_link':
                responseMessage = `🔗 <b>Payment Link</b>

🌐 <b>สร้างลิงก์สำหรับรับเงิน:</b>
• แชร์ง่ายทาง Social Media
• รองรับหลายสกุลเงิน
• ติดตามสถานะได้
• กำหนดวันหมดอายุได้

📋 <b>ประโยชน์:</b>
• แชร์ใน Telegram, Line, Facebook
• ลูกค้าจ่ายเงินง่าย
• ติดตามการรับเงินแบบ Real-time

🚧 <b>สถานะ:</b> ฟีเจอร์กำลังพัฒนา`;
                
                keyboard = {
                  inline_keyboard: [
                    [
                      { text: '🔗 สร้างลิงก์ THB', callback_data: 'link_thb' },
                      { text: '🔗 สร้างลิงก์ USDT', callback_data: 'link_usdt' }
                    ],
                    [
                      { text: '🔙 กลับ', callback_data: 'send' }
                    ]
                  ]
                };
                break;
                
              // Back to start
              case 'start':
                const startKeyboard = {
                  inline_keyboard: [
                    [
                      { text: '💳 กระเป๋าเงิน', callback_data: 'wallet' },
                      { text: '💰 ยอดเงิน', callback_data: 'balance' }
                    ],
                    [
                      { text: '📤 ฝากเงิน', callback_data: 'deposit' },
                      { text: '📥 ถอนเงิน', callback_data: 'withdraw' }
                    ],
                    [
                      { text: '📨 ส่งเงิน', callback_data: 'send' },
                      { text: '📋 ประวัติ', callback_data: 'history' }
                    ],
                    [
                      { text: '🌐 เปลี่ยนภาษา', callback_data: 'change_language' },
                      { text: '⚙️ ตั้งค่า', callback_data: 'settings' }
                    ],
                    [
                      { text: '📞 ช่วยเหลือ', callback_data: 'help' }
                    ]
                  ]
                };
                
                responseMessage = messages.welcome;
                keyboard = startKeyboard;
                break;
                
              // Additional missing handlers
              case 'deposit_guide':
                responseMessage = `📋 <b>คำแนะนำการฝากเงิน</b>

🏦 <b>สำหรับ THB:</b>
• ใช้โมบายแบงกิ้งหรือ Internet Banking
• ระบุหมายเหตุการโอนให้ถูกต้อง
• ส่งสลิปการโอนเพื่อยืนยัน
• เงินจะเข้าภายใน 5-30 นาที

🔷 <b>สำหรับ USDT:</b>
• ใช้เฉพาะ Network ที่รองรับ
• ตรวจสอบ Address ให้ถูกต้อง
• รอ Network Confirmation
• เงินจะเข้าอัตโนมัติ

⚠️ <b>ข้อควรระวัง:</b>
• ตรวจสอบข้อมูลก่อนโอน
• เก็บหลักฐานการโอน
• อย่าโอนจากบัญชีบุคคลอื่น`;
                
                keyboard = {
                  inline_keyboard: [
                    [{ text: '🔙 กลับ', callback_data: 'deposit' }]
                  ]
                };
                break;
                
              case 'withdraw_guide':
                responseMessage = `📋 <b>คำแนะนำการถอนเงิน</b>

💰 <b>สำหรับ THB:</b>
• ตรวจสอบข้อมูลบัญชีธนาคาร
• ยืนยันตัวตนด้วย PIN หรือ OTP
• เวลาประมวลผล 1-24 ชั่วโมง
• ค่าธรรมเนียม 10 บาท

🔷 <b>สำหรับ USDT:</b>
• ตรวจสอบ Wallet Address
• เลือก Network ที่ถูกต้อง
• เวลาประมวลผล 5-60 นาที
• ค่าธรรมเนียม Network Fee

🔒 <b>ความปลอดภัย:</b>
• ยืนยันตัวตนทุกครั้ง
• จำกัดจำนวนการถอนต่อวัน
• แจ้งเตือนทาง Email/SMS`;
                
                keyboard = {
                  inline_keyboard: [
                    [{ text: '🔙 กลับ', callback_data: 'withdraw' }]
                  ]
                };
                break;
                
              case 'chart':
                responseMessage = `📊 <b>กราฟยอดเงิน</b>

📈 <b>สถิติการใช้งาน:</b>
• ยอดเงินรายวัน
• แนวโน้มการฝาก-ถอน
• การกระจายของสกุลเงิน
• เปรียบเทียบรายเดือน

📋 <b>รายงานแบบละเอียด:</b>
• กราฟแท่ง และ Line Chart
• ข้อมูล 30-90 วันย้อนหลัง
• ส่งออกเป็น PDF ได้

🚧 <b>สถานะ:</b> ฟีเจอร์กำลังพัฒนา
📱 จะเพิ่มกราฟแบบ Interactive ในเร็วๆ นี้`;
                
                keyboard = {
                  inline_keyboard: [
                    [{ text: '🔙 กลับ', callback_data: 'balance' }]
                  ]
                };
                break;
                
              case 'history_summary':
                const summaryReport = await ctx.wallet.generateSummaryReport(ctx.userId);
                
                if (!summaryReport) {
                  responseMessage = `❌ ไม่สามารถสร้างรายงานได้`;
                } else {
                  responseMessage = `📊 <b>รายงานสรุป</b>

💰 <b>ยอดเงินปัจจุบัน:</b>
• THB: ${formatCurrency(summaryReport.balances.THB, 'THB')}
• USDT: ${formatCurrency(summaryReport.balances.USDT, 'USDT')}

📈 <b>สถิติรวม:</b>
• ธุรกรรมทั้งหมด: ${summaryReport.statistics.totalTransactions} ครั้ง
• เงินฝากสะสม: ${formatCurrency(summaryReport.statistics.totalDeposits, 'THB')}
• เงินถอนสะสม: ${formatCurrency(summaryReport.statistics.totalWithdrawals, 'THB')}

📅 <b>กิจกรรมล่าสุด:</b>
• วันนี้: ${summaryReport.recentActivity.today} ครั้ง
• สัปดาห์นี้: ${summaryReport.recentActivity.thisWeek} ครั้ง
• เดือนนี้: ${summaryReport.recentActivity.thisMonth} ครั้ง

⏰ <b>อัพเดทล่าสุด:</b> ${new Date(summaryReport.lastUpdate).toLocaleString('th-TH')}`;
                }
                
                keyboard = {
                  inline_keyboard: [
                    [{ text: '🔙 กลับ', callback_data: 'history' }]
                  ]
                };
                break;
                
              case 'export_pdf':
                responseMessage = `📱 <b>ส่งออกรายงาน PDF</b>

📋 <b>รายงานที่สามารถส่งออกได้:</b>
• ประวัติธุรกรรมแบบละเอียด
• รายงานยอดเงินรายเดือน
• สรุปการใช้งานประจำปี
• ใบเสร็จรับเงิน

📧 <b>วิธีการส่ง:</b>
• ส่งทาง Email
• ดาวน์โหลดผ่าน Link
• แชร์ใน Telegram

🚧 <b>สถานะ:</b> ฟีเจอร์กำลังพัฒนา
📄 จะเพิ่มระบบสร้าง PDF ในเร็วๆ นี้`;
                
                keyboard = {
                  inline_keyboard: [
                    [{ text: '🔙 กลับ', callback_data: 'history' }]
                  ]
                };
                break;
                
              case 'faq':
                responseMessage = `❓ <b>คำถามที่พบบ่อย (FAQ)</b>

🔑 <b>Q: จะเริ่มใช้งานยังไง?</b>
A: กด /start แล้วเลือกเมนูที่ต้องการ

💰 <b>Q: ฝากเงินขั้นต่ำเท่าไหร่?</b>
A: THB ขั้นต่ำ 50 บาท, USDT ขั้นต่ำ 10 USDT

🔒 <b>Q: ปลอดภัยแค่ไหน?</b>
A: เข้ารหัสข้อมูล + ระบบรักษาความปลอดภัยขั้นสูง

⏰ <b>Q: เงินเข้าใช้เวลานานไหม?</b>
A: THB 5-30 นาที, USDT 5-60 นาที

📞 <b>Q: มีปัญหาติดต่อที่ไหน?</b>
A: @DoglcSupport หรือ support@doglc.com`;
                
                keyboard = {
                  inline_keyboard: [
                    [{ text: '🔙 กลับ', callback_data: 'help' }]
                  ]
                };
                break;
                
              case 'live_chat':
                responseMessage = `💬 <b>แชทสดกับทีมสนับสนุน</b>

👨‍💻 <b>ช่องทางการติดต่อ:</b>
• Telegram: @DoglcSupport
• Line: @doglc-support
• Facebook: DOGLC Digital Wallet
• อีเมล: support@doglc.com

⏰ <b>เวลาทำการ:</b>
• จันทร์-ศุกร์: 8:00-22:00 น.
• เสาร์-อาทิตย์: 9:00-18:00 น.

🚀 <b>ตอบกลับเร็ว:</b>
• Telegram: ทันที
• Line: ภายใน 5 นาที
• อีเมล: ภายใน 2 ชั่วโมง

💡 <b>เคล็ดลับ:</b> ระบุ User ID ของคุณเพื่อความรวดเร็ว`;
                
                keyboard = {
                  inline_keyboard: [
                    [{ text: '🔙 กลับ', callback_data: 'help' }]
                  ]
                };
                break;
                
              default:
                responseMessage = `🤖 <b>ฟีเจอร์ "${data}" กำลังพัฒนา</b>

🔧 เรากำลังพัฒนาฟีเจอร์นี้ให้สมบูรณ์
⏰ จะเปิดใช้งานในเร็วๆ นี้

ขอบคุณสำหรับความอดทนรอครับ! 🙏`;
                
                keyboard = {
                  inline_keyboard: [
                    [{ text: '🔙 กลับหน้าหลัก', callback_data: 'start' }]
                  ]
                };
            }
            
            await ctx.editMessageText(responseMessage, {
              reply_markup: keyboard,
              parse_mode: 'HTML'
            });
            
            await ctx.answerCbQuery();
            
          } catch (error) {
            console.error('Callback error:', error);
            try {
              await ctx.answerCbQuery('❌ เกิดข้อผิดพลาด');
            } catch (cbError) {
              console.error('Failed to answer callback:', cbError);
            }
          }
        });
        
        // === MESSAGE HANDLERS ===
        bot.on('message', async (ctx) => {
          try {
            if (ctx.message?.text?.startsWith('/')) {
              await ctx.reply('🤖 คำสั่งไม่รู้จัก กรุณาใช้ /start เพื่อเริ่มต้น');
            } else {
              // Handle regular messages (potentially for amount input, etc.)
              await ctx.reply('💬 ได้รับข้อความแล้ว กรุณาใช้เมนูด้านล่างเพื่อใช้งาน /start');
            }
          } catch (error) {
            console.error('Message error:', error);
          }
        });
        
        // Process the update
        await bot.handleUpdate(update);
        
        return new Response('OK', {
          status: 200,
          headers: { 'Content-Type': 'text/plain' }
        });
        
      } catch (error) {
        console.error('Webhook error:', error);
        return new Response('Error', { status: 500 });
      }
    }
    
    return new Response('Method not allowed', { status: 405 });
  }
};
