/**
 * English language messages for the bot
 */

export const messages = {
  // Welcome messages
  welcome: '🎉 Welcome to Doglc Digital Wallet!\n\n💰 Safe and easy-to-use digital wallet\n\nType /help to see all commands',
  
  // Help messages
  helpTitle: '📋 Available commands:',
  helpCommands: `
/start - Start using
/wallet - View wallet information
/balance - Check balance
/send - Send money
/receive - Receive money
/history - Transaction history
/help - View all commands
  `,
  
  // Wallet messages
  walletInfo: '💳 Your wallet information',
  noWallet: '❌ You don\'t have a wallet yet\nType /create to create a new wallet',
  createWallet: '✅ Wallet created successfully!\n🔐 Wallet address: {address}',
  
  // Balance messages
  currentBalance: '💰 Current balance: {amount} Baht',
  
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