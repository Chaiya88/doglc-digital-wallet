/**
 * English Language Messages
 * English messages for DOGLC Digital Wallet Bot
 */

export const enMessages = {
  // Welcome and Main Menu
  welcomeMessage: `🏦 <b>Welcome to DOGLC Digital Wallet</b>

Hello <b>{firstName}</b>! 👋

🌟 <b>Key Features:</b>
• 💰 USDT Digital Wallet
• 🔐 High Security System
• ⚡ Fast Money Transfer
• 📊 Real-time Balance Tracking
• 🌐 Multi-language Support

Choose from the menu below to get started:`,

  // Wallet Messages
  walletMain: `💰 <b>Your Wallet</b>

💳 <b>Current Balance:</b> {balance} {currency}
📅 <b>Last Updated:</b> ${new Date().toLocaleString('en-US')}

Select your desired action:`,

  balanceDetails: `💳 <b>Balance Details</b>

💰 <b>USDT:</b> {usdtBalance}
🇺🇸 <b>USD:</b> {thbBalance}

📊 <b>Statistics:</b>
📈 Today's Income: +{dailyIncome} USDT
📉 Today's Expense: -{dailyExpense} USDT

⏰ <b>Last Updated:</b> {lastUpdate}`,

  sendMoneyGuide: `📤 <b>Send USDT</b>

Choose your sending method:

🔹 <b>Send by Phone:</b> Fast & convenient
🔹 <b>Send by Username:</b> Use @username
🔹 <b>Send by QR Code:</b> Scan to send
🔹 <b>Send by Wallet Address:</b> Wallet address

💡 <b>Tip:</b> Double-check recipient details before sending`,

  receiveMoneyDetails: `📥 <b>Receive USDT</b>

📱 <b>Your Information:</b>
• Phone: {phoneNumber}
• Username: @{username}
• Wallet Address: <code>{address}</code>

🔗 <b>QR Code:</b> Click button below to generate

💡 <b>Share this information with the sender</b>`,

  transactionHistoryHeader: `📊 <b>Transaction History</b>

Latest 5 transactions:`,

  noTransactions: `No transactions yet
Start using your digital wallet! 💰`,

  // Help Messages
  helpMain: `❓ <b>Help & Support</b>

👋 Welcome to DOGLC Digital Wallet Help Center

🔍 <b>Choose a topic for assistance:</b>

📝 <b>All Commands</b> - List of available commands
💰 <b>Wallet Usage</b> - How to use your wallet
🔐 <b>Security</b> - Security tips and guidelines
❓ <b>FAQ</b> - Frequently asked questions

📞 <b>Need more help?</b>
Contact our 24/7 customer support team`,

  helpCommands: `📝 <b>All Commands</b>

🤖 <b>Basic Commands:</b>
• <code>/start</code> - Start using the bot
• <code>/help</code> - View help
• <code>/wallet</code> - Open wallet

💰 <b>Wallet Commands:</b>
• <code>/balance</code> - Check balance
• <code>/send</code> - Send money
• <code>/receive</code> - Receive money
• <code>/history</code> - Transaction history

⚙️ <b>Settings Commands:</b>
• <code>/settings</code> - Account settings
• <code>/language</code> - Change language
• <code>/notifications</code> - Notification settings

💡 <b>Tip:</b> You can use buttons instead of typing commands`,

  helpWallet: `💰 <b>Wallet Usage Guide</b>

🔍 <b>Checking Balance:</b>
• Tap "💳 Balance" or use <code>/balance</code>
• View USDT and USD amounts
• Check income/expense statistics

📤 <b>Sending Money:</b>
• Choose method: Phone, Username, QR, Address
• Enter amount and confirm
• Get notification when sent successfully

📥 <b>Receiving Money:</b>
• Share your information with sender
• Generate QR Code for receiving
• Receive money in real-time

📊 <b>Transaction History:</b>
• View all transactions
• Filter by date and type
• Export data to file

💡 <b>Recommendations:</b>
• Verify details before transactions
• Keep transaction receipts
• Contact support if issues occur`,

  helpSecurity: `🔐 <b>Security & Protection</b>

🛡️ <b>Security Measures:</b>
• 🔒 End-to-End Encryption
• 🔑 2FA Authentication System
• 📱 Login Notifications
• ⏰ Auto-lock when inactive

🔐 <b>Setting PIN:</b>
• Create 6-digit PIN
• Use PIN to confirm transactions
• Change PIN anytime

📷 <b>Receipt Verification:</b>
• Take photo of bank slip
• OCR system auto-verifies
• Confirm accuracy before deposit

⚠️ <b>Security Tips:</b>
• Never share your PIN
• Verify URL accuracy
• Update app to latest version
• Use secure Wi-Fi networks

🚨 <b>Report Issues:</b>
Contact our team immediately if you notice suspicious activity`,

  helpFAQ: `❓ <b>Frequently Asked Questions</b>

💸 <b>Fees:</b>
• Money Transfer: 0.1% (minimum 1 USDT)
• USD Deposit: Free
• USDT Withdrawal: 2 USDT

⏱️ <b>Transaction Times:</b>
• USDT to USDT: Instant
• USD Deposit: 1-5 minutes (after slip verification)
• USDT Withdrawal: 5-15 minutes

🔢 <b>Limits:</b>
• Daily Sending: 50,000 USDT
• Daily Receiving: Unlimited
• Minimum per transaction: 1 USDT

💱 <b>Exchange Rates:</b>
• Updated every 1 minute
• Based on global markets
• Competitive spreads

🌍 <b>Supported Countries:</b>
• Thailand (Full support)
• ASEAN Countries (Partial)
• More details on website

🔧 <b>Troubleshooting:</b>
• Restart Telegram app
• Check internet connection
• Try /start command again
• Contact support if issues persist`,

  helpContact: `📞 <b>Contact Us</b>

🏢 <b>DOGLC Digital Wallet Support Center</b>

📧 <b>Email:</b> support@doglcdigital.com
📞 <b>Hotline:</b> +66-2-123-4567 (24/7)
💬 <b>Telegram:</b> @doglcdigital
🌐 <b>Website:</b> https://doglcdigital.com

📱 <b>Social Media:</b>
• Facebook: facebook.com/doglcdigital
• Twitter: @doglcdigital
• YouTube: DOGLC Digital
• LINE: @doglcdigital

⏰ <b>Operating Hours:</b>
• Hotline: 24 hours, 7 days
• Email: Reply within 1 hour
• Chat: Online 24/7

🎯 <b>Support Types:</b>
• Technical issues
• Usage questions
• Security issue reports
• Suggestions and feedback`,

  // Error Messages
  errorOccurred: `❌ An error occurred. Please try again`,
  unknownAction: `🤔 Unknown command`,
  unrecognizedMessage: `💬 Message not recognized. Please use the menu below`,
  processingImage: `📷 Processing image...`,
  ocrSuccess: `✅ Receipt verified successfully!\n💰 Amount: {amount} USD\n🏦 Bank: {bank}`,
  ocrError: `❌ Cannot read receipt. Please take a clearer photo`,

  // Currency formatting
  currency: {
    thb: 'THB',
    usdt: 'USDT',
    usd: 'USD'
  }
};