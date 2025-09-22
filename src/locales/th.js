/**
 * Thai language messages for DOGLC Digital Wallet
 * Starting with English first as requested
 */

export const messages = {
  // Basic commands - All English
  welcome: `💎 <b>DOGLC DIGITAL WALLET</b>
<b>Welcome @{username} to Your Caring Companion</b>
<b>Guarantee — Fast — Secure</b>

✨ <b>Grand Digital Wallet Experience:</b>
💎 Premium Service Level
🌍 6 International Languages Support
🛡️ Bank-Grade Security Protection
⚡ Lightning-Fast 24/7 Processing

🚀 <b>Start Your Financial Journey!</b>`,

  mainMenu: `📁 undefined                            💰 Balance

💳 Deposit                                  📤 Withdraw

📊 Send Money                               📋 History

🌐 Change Language                          ⚙️ Settings

💬 Help`,

  // Wallet operations - English
  walletTitle: '💳 Wallet',
  walletInfo: '💳 Your Wallet Information',
  currentBalance: '💰 Current Balance: {amount} Baht',
  noWallet: '❌ You don\'t have a wallet yet\nType /create to create a new wallet',
  createWallet: '✅ Wallet created successfully!\n🔐 Wallet address: {address}',
  
  // Enhanced deposit messages - English
  depositTitle: 'Deposit Money',
  depositTHB: 'Deposit THB',
  depositUSDT: 'Deposit USDT',
  depositInstructions: `💰 <b>How to Deposit Money</b>

📋 <b>Steps:</b>
1. Select amount you want to deposit
2. Transfer money to the specified account
3. Send transfer slip for confirmation
4. Wait for confirmation within 5-30 minutes

💡 <b>Tip:</b> Take clear photos of slip for faster processing`,

  // Enhanced withdrawal messages - English
  withdrawTitle: 'Withdraw Money',
  withdrawUSDT: 'Withdraw USDT',
  withdrawTHB: 'Withdraw THB',
  withdrawInstructions: `💸 <b>How to Withdraw Money</b>

📋 <b>Steps:</b>
1. Specify destination address
2. Enter withdrawal amount
3. Confirm transaction details
4. Wait for processing (5-60 minutes)

⚠️ <b>Important:</b> Check address carefully before confirming`,

  // Send money messages - English
  sendTitle: 'Send Money',
  sendInternal: 'Send Internal',
  sendExternal: 'Send External',
  sendInstructions: `📨 <b>How to Send Money</b>

📋 <b>Options:</b>
• Internal: To other DOGLC users
• External: To bank accounts or crypto wallets

💡 <b>Features:</b>
• Instant internal transfers
• Low fees for external transfers
• Transaction tracking`,

  // Transaction history - English
  historyTitle: 'Transaction History',
  historyEmpty: '📋 No transactions yet\nStart by making a deposit!',
  historyItem: `📊 <b>Transaction #{id}</b>
Type: {type}
Amount: {amount}
Status: {status}
Date: {date}`,

  // Settings - English
  settingsTitle: 'Settings',
  securitySettings: 'Security Settings',
  languageSettings: 'Language Settings',

  // Help messages - English
  helpTitle: 'Help & Support',
  helpCommands: `📋 <b>Available Commands:</b>

/start - Start the bot
/wallet - View wallet info
/balance - Check balance
/deposit - Deposit money
/withdraw - Withdraw money
/send - Send money
/history - Transaction history
/settings - Bot settings
/help - Show this help`,

  faqTitle: 'Frequently Asked Questions',
  contactSupport: 'Contact Support',

  // Error messages - English
  unknownCommand: '❓ Unknown command. Type /help to see available commands',
  errorOccurred: '⚠️ An error occurred. Please try again',
  insufficientBalance: '❌ Insufficient balance',
  invalidAmount: '❌ Invalid amount',
  transactionFailed: '❌ Transaction failed',
  
  // Success messages - English
  transactionSuccess: '✅ Transaction successful!',
  balanceUpdated: '✅ Balance updated successfully',
  settingsSaved: '✅ Settings saved',

  // Security messages - English
  securityWarning: '🔐 Never share your personal information or private keys with anyone!',
  rateLimitWarning: '⚠️ Too many requests. Please wait a moment',
  
  // Loading messages - English
  processing: '⏳ Processing...',
  pleaseWait: '⏳ Please wait...',
  connecting: '🔗 Connecting...',

  // Currency formatting - English
  thbSymbol: '฿',
  usdtSymbol: 'USDT',
  
  // Button texts - English
  backButton: '🔙 Back',
  cancelButton: '❌ Cancel',
  confirmButton: '✅ Confirm',
  continueButton: '➡️ Continue',
  retryButton: '🔄 Retry',

  // Status messages - English
  online: '🟢 Online',
  offline: '🔴 Offline',
  maintenance: '🟡 Under Maintenance',
  
  // Demo messages - English
  demoMode: '🎮 Demo Mode',
  demoTransaction: 'This is a demo transaction',
  demoSuccess: '✅ Demo transaction completed successfully!',

  // Language selection - English
  changeLanguage: 'Change Language',
  languageChanged: '✅ Language changed successfully!',
  selectLanguage: '🌐 Please select your language:',

  // Advanced features - English
  qrCode: 'QR Code',
  paymentLink: 'Payment Link',
  exportData: 'Export Data',
  analytics: 'Analytics',
  
  // Coming soon messages - English
  comingSoon: '⚡ Coming Soon',
  featureInDevelopment: '🔧 This feature is currently in development',
  stayTuned: '📢 Stay tuned for updates!',

  // Premium features - English
  premiumFeature: '💎 Premium Feature',
  upgradeRequired: '⬆️ Upgrade required',
  premiumBenefits: 'Premium Benefits',

  // Validation messages - English
  enterValidAmount: 'Please enter a valid amount',
  enterValidAddress: 'Please enter a valid address',
  confirmTransaction: 'Please confirm your transaction',
  
  // Time-related messages - English
  lastUpdated: 'Last updated',
  timeRemaining: 'Time remaining',
  expiredSession: 'Session expired',
  
  // Notification messages - English
  newNotification: '🔔 New Notification',
  enableNotifications: 'Enable Notifications',
  
  // Account messages - English
  accountInfo: 'Account Information',
  accountCreated: 'Account Created',
  accountVerification: 'Account Verification',
  
  // Support messages - English
  supportTicket: 'Support Ticket',
  contactUs: 'Contact Us',
  reportIssue: 'Report Issue',
  feedback: 'Feedback'
};

// Export default for compatibility
export default { messages };