/**
 * Chinese language messages for the bot
 */

export const messages = {
  // Welcome messages
  welcome: '🎉 欢迎使用 Doglc Digital Wallet！\n\n💰 安全易用的数字钱包\n\n输入 /help 查看所有命令',
  
  // Help messages
  helpTitle: '📋 可用命令：',
  helpCommands: `
/start - 开始使用
/wallet - 查看钱包信息
/balance - 检查余额
/send - 发送资金
/receive - 接收资金
/history - 交易历史
/help - 查看所有命令
  `,
  
  // Wallet messages
  walletInfo: '💳 您的钱包信息',
  noWallet: '❌ 您还没有钱包\n输入 /create 创建新钱包',
  createWallet: '✅ 钱包创建成功！\n🔐 钱包地址：{address}',
  
  // Balance messages
  currentBalance: '💰 当前余额：{amount} 泰铢',
  
  // Transaction messages
  sendMoney: '📤 发送资金',
  receiveMoney: '📥 接收资金',
  transactionSuccess: '✅ 交易成功！',
  transactionFailed: '❌ 交易失败',
  
  // Error messages
  unknownCommand: '❓ 无法理解命令。输入 /help 查看可用命令',
  errorOccurred: '⚠️ 发生错误，请重试',
  
  // Security messages
  securityWarning: '🔐 绝对不要与任何人分享个人信息或私钥！',
  
  // Loading messages
  processing: '⏳ 处理中...',
  pleaseWait: '⏳ 请稍候...'
};