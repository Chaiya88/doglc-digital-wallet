/**
 * Khmer language messages for the bot
 */

export const messages = {
  // Welcome messages
  welcome: '🎉 សូមស្វាគមន៍មកកាន់ Doglc Digital Wallet!\n\n💰 កាបូបឌីជីថលដែលមានសុវត្ថិភាព និងងាយស្រួលប្រើ\n\nវាយ /help ដើម្បីមើលពាក្យបញ្ជាទាំងអស់',
  
  // Help messages
  helpTitle: '📋 ពាក្យបញ្ជាដែលអាចប្រើបាន៖',
  helpCommands: `
/start - ចាប់ផ្តើមប្រើ
/wallet - មើលព័ត៌មានកាបូប
/balance - ពិនិត្យសមតុល្យ
/send - ផ្ញើប្រាក់
/receive - ទទួលប្រាក់
/history - ប្រវត្តិប្រតិបត្តិការ
/help - មើលពាក្យបញ្ជាទាំងអស់
  `,
  
  // Wallet messages
  walletInfo: '💳 ព័ត៌មានកាបូបរបស់អ្នក',
  noWallet: '❌ អ្នកមិនទាន់មានកាបូបទេ\nវាយ /create ដើម្បីបង្កើតកាបូបថ្មី',
  createWallet: '✅ បង្កើតកាបូបបានជោគជ័យ!\n🔐 អាសយដ្ឋានកាបូប៖ {address}',
  
  // Balance messages
  currentBalance: '💰 សមតុល្យបច្ចុប្បន្ន៖ {amount} បាត',
  
  // Transaction messages
  sendMoney: '📤 ផ្ញើប្រាក់',
  receiveMoney: '📥 ទទួលប្រាក់',
  transactionSuccess: '✅ ប្រតិបត្តិការជោគជ័យ!',
  transactionFailed: '❌ ប្រតិបត្តិការបរាជ័យ',
  
  // Error messages
  unknownCommand: '❓ មិនយល់ពាក្យបញ្ជា។ វាយ /help ដើម្បីមើលពាក្យបញ្ជាដែលអាចប្រើបាន',
  errorOccurred: '⚠️ មានកំហុសកើតឡើង។ សូមព្យាយាមម្តងទៀត',
  
  // Security messages
  securityWarning: '🔐 កុំចែករំលែកព័ត៌មានផ្ទាល់ខ្លួន ឬ Private Key ជាមួយនរណាម្នាក់ឡើយ!',
  
  // Loading messages
  processing: '⏳ កំពុងដំណើរការ...',
  pleaseWait: '⏳ សូមរង់ចាំបន្តិច...'
};