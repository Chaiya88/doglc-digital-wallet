/**
 * English language messages for DOGLC Digital Wallet
 */

export const messages = {
  // Welcome messages
  welcome: `🌟 <b>DOGLC DIGITAL WALLET</b>
<b>Welcome</b> @{username} <b>to Your Caring Companion</b>
<b>Guarantee ▪︎ Fast ▪︎ Secure</b>

✨ Grand Digital Wallet Experience:
💎 Premium Service Level
🌍 6 International Languages Support
🛡️ Bank-Grade Security Protection
⚡ Lightning-Fast 24/7 Processing

🚀 Start Your Financial Journey!`,

  mainMenu: `📋 <b>Main Menu</b>

💎 Choose Your Premium Service:

🔸 Commands in Order of Usage:
1️⃣ Balance - Check Funds
2️⃣ Deposit - Add Funds  
3️⃣ Withdraw - Cash Out
4️⃣ Send - Transfer to Others
5️⃣ History - Transaction Records
6️⃣ Language - Change Language
7️⃣ Settings - System Config
8️⃣ Help - Guide & FAQ

🎯 Select menu below to start:`,
  
  // Button Labels - English
  balanceBtn: '💰 Balance',
  depositBtn: '💳 Deposit', 
  withdrawBtn: '📤 Withdraw',
  sendBtn: '📊 Send Money',
  historyBtn: '📋 History',
  languageBtn: '🌐 Change Language',
  settingsBtn: '⚙️ Settings',
  helpBtn: '💬 Help',
  backBtn: '🔙 Back',
  backToMainBtn: '🔙 Back to Main Menu',
  refreshBtn: '🔄 Refresh',
  chartBtn: '📊 Chart',
  uploadSlipBtn: '📷 Upload Slip',
  demoDeposit100: '💰 Deposit 100 Baht (Demo)',
  demoDeposit500: '💰 Deposit 500 Baht (Demo)',
  demoDeposit10USDT: '🔷 Deposit 10 USDT (Demo)',
  demoDeposit50USDT: '🔷 Deposit 50 USDT (Demo)',
  checkDepositStatus: '📋 Check Status',
  sendSlipBtn: '📷 Send Slip',
  setPinBtn: '🔐 Set PIN',
  notificationBtn: '🔔 Notifications',
  securityBtn: '🔐 Security',
  demoWithdraw50: '💰 Test Withdraw 50 Baht',
  demoWithdraw200: '💰 Test Withdraw 200 Baht',
  demoWithdraw5USDT: '🔷 Test Withdraw 5 USDT',
  demoWithdraw20USDT: '🔷 Test Withdraw 20 USDT',

  // Wallet messages
  walletInfo: '💳 Your wallet information',
  walletTitle: '💳 Wallet',
  walletDetails: `💳 <b>Your Wallet</b>

💰 <b>Current Balance:</b>
• THB: {thbBalance}
• USDT: {usdtBalance}

📊 <b>Statistics:</b>
• Total Transactions: {totalTransactions} times
• Total Deposits: {totalDeposits}

🔐 <b>Wallet Address:</b>
\`{address}\`

⏰ <b>Last Updated:</b> {updatedAt}`,
  
  balanceDetails: `💰 <b>Balance Details</b>

💳 <b>Main Wallet:</b>
• THB: {thbBalance}
• USDT: {usdtBalance}

💎 <b>Total Value:</b>
• THB Equivalent: {totalValueTHB}
• USD Equivalent: {totalValueUSD}

📈 <b>Performance:</b>
• 24h Change: +2.5% 📈
• Portfolio: Stable 💎

⏰ <b>Updated:</b> {timestamp}`,
  
  noWallet: '❌ You don\'t have a wallet yet\nType /create to create a new wallet',
  noWalletBalance: `❌ <b>Wallet Not Found</b>
  
Please click "💳 Wallet" to create a new wallet`,
  createWallet: '✅ Wallet created successfully!\n🔐 Wallet address: {address}',

  // Balance messages
  currentBalance: '💰 Current balance: {amount} Baht',
  
  // Deposit messages
  depositTHB: `📤 <b>Deposit THB</b>

🏦 <b>Bank Account for Transfer:</b>
• Bank: Kasikorn Bank
• Account Name: DOGLC DIGITAL WALLET
• Account Number: 123-4-56789-0
• PromptPay: 0812345678

💬 <b>Transfer Note:</b>
\`{depositAddress}\`

⚠️ <b>Deposit Steps:</b>
1. Transfer money to the account above
2. Include the note as specified
3. Send your transfer slip here
4. Wait for confirmation within 5-30 minutes

💡 <b>Demo:</b> Click "💰 Deposit 100 Baht" to test`,

  depositUSDT: `🔷 <b>Deposit USDT</b>

🔗 <b>Wallet Address (TRC-20):</b>
\`{depositAddress}\`

⚠️ <b>Important Notes:</b>
• Send only USDT on Tron Network (TRC-20)
• Double-check the address
• Minimum 10 USDT

📋 <b>Steps:</b>
1. Copy the address above
2. Send USDT from your wallet
3. Wait for 1-6 confirmations
4. Balance will be credited automatically

💡 <b>Demo:</b> Click "🔷 Deposit 10 USDT" to test`,

  // Settings messages
  settingsMenu: `⚙️ <b>Settings</b>

🔐 <b>Security:</b>
• PIN Code: Not set
• 2FA: Disabled
• Session: Active

🌐 <b>Language:</b>
• Current: English 🇺🇸

📱 <b>Notifications:</b>
• Transactions: Enabled
• Promotions: Enabled

💼 <b>Account Type:</b>
• Standard User`,

  // Help messages
  helpMenu: `📞 <b>Help & Support</b>

🎯 <b>Quick Help:</b>
• How to deposit money?
• How to send USDT?
• Transaction not showing?
• Security questions?

📋 <b>Available Commands:</b>
/start - Main menu
/wallet - View wallet
/balance - Check balance
/deposit - Add funds
/send - Send money
/history - View transactions
/help - Show this help

💬 <b>Contact Support:</b>
• Telegram: @doglc_support
• Hours: 24/7
• Response: Within 30 minutes`,

  // Success messages
  languageChanged: `✅ Language changed to {language} successfully!`,
  
  // Help messages
  helpTitle: '📋 Available commands:',
  helpCommands: `
/start - Show main menu
/wallet - View wallet information
/balance - Check balance
/send - Send money
/deposit - Deposit money
/withdraw - Withdraw money
/history - Transaction history
/help - Show this help`,
  
  // Transaction messages
  sendMoney: '📤 Send money',
  receiveMoney: '📥 Receive money',
  transactionSuccess: '✅ Transaction successful!',
  transactionFailed: '❌ Transaction failed',
  
  // Error messages
  unknownCommand: '❓ Don\'t understand command. Type /help to see available commands',
  errorOccurred: '⚠️ An error occurred. Please try again',
  
  // Security messages
  securityWarning: '🔐 Never share personal information or Private Key with anyone!',
  
  // Loading messages
  processing: '⏳ Processing...',
  pleaseWait: '⏳ Please wait a moment...'
};