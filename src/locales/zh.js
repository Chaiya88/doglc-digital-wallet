/**
  // Welcome messages
  welcome: `🌟 <b>DOGLC DIGITAL WALLET</b>
<b>欢迎</b> @{username} <b>加入您的贴心伙伴</b>
<b>保证 ▪︎ 快速 ▪︎ 安全</b>

✨ 顶级数字钱包体验:
💎 尊享级服务
🌍 支持6种国际语言
🛡️ 银行级安全保障
⚡ 24/7闪电处理

🚀 开启您的金融之旅！`,uage messages for the bot
 */

export const messages = {
  // Welcome messages
  welcome: `� <b>DOGLC DIGITAL WALLET</b>
<b>欢迎</b> @{username} <b>加入您的贴心伙伴</b>
<b>保证 ▪︎ 快速 ▪︎ 安全</b>

🎉 <b>ยินดีต้อนรับ</b> @{username} <b>สู่เพื่อนที่รู้ใจ</b>
<b>การันตี ▪︎ รวดเร็ว ▪︎ ปลอดภัย</b>

✨ 顶级数字钱包体验:
💎 尊享级服务
🌍 支持6种国际语言
🛡️ 银行级安全保障
⚡ 24/7闪电处理

🚀 开启您的金融之旅！`,

  mainMenu: `📋 <b>主菜单 - Main Menu</b>

💎 选择您的尊享服务:

🔸 按使用顺序排列的命令:
1️⃣ 钱包管理 - 账户管理
2️⃣ 存款充值 - 资金入账  
3️⃣ 提款取现 - 资金提取
4️⃣ 转账汇款 - 转给他人
5️⃣ 交易历史 - 查看明细
6️⃣ 系统设置 - 个性配置
7️⃣ 帮助支持 - 指南FAQ
8️⃣ 语言切换 - Switch Language
9️⃣ 余额查询 - 查看资产

🎯 点击下方菜单开始:`,
  
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