/**
 * Chinese Language Messages
 * 中文消息 for DOGLC Digital Wallet Bot
 */

export const zhMessages = {
  // Welcome and Main Menu
  welcomeMessage: `🏦 <b>欢迎使用 DOGLC 数字钱包</b>

您好 <b>{firstName}</b>! 👋

🌟 <b>主要功能：</b>
• 💰 USDT 数字钱包
• 🔐 高级安全系统
• ⚡ 快速转账
• 📊 实时余额跟踪
• 🌐 多语言支持

从下面的菜单中选择开始：`,

  // Wallet Messages
  walletMain: `💰 <b>您的钱包</b>

💳 <b>当前余额：</b> {balance} {currency}
📅 <b>最后更新：</b> ${new Date().toLocaleString('zh-CN')}

选择您想要的操作：`,

  balanceDetails: `💳 <b>余额详情</b>

💰 <b>USDT：</b> {usdtBalance}
🇨🇳 <b>CNY：</b> {thbBalance}

📊 <b>统计：</b>
📈 今日收入：+{dailyIncome} USDT
📉 今日支出：-{dailyExpense} USDT

⏰ <b>最后更新：</b> {lastUpdate}`,

  sendMoneyGuide: `📤 <b>发送 USDT</b>

选择发送方式：

🔹 <b>通过手机号发送：</b> 快速便捷
🔹 <b>通过用户名发送：</b> 使用 @用户名
🔹 <b>通过二维码发送：</b> 扫描发送
🔹 <b>通过钱包地址发送：</b> 钱包地址

💡 <b>提示：</b> 发送前请仔细核对收款人信息`,

  receiveMoneyDetails: `📥 <b>接收 USDT</b>

📱 <b>您的信息：</b>
• 手机号：{phoneNumber}
• 用户名：@{username}
• 钱包地址：<code>{address}</code>

🔗 <b>二维码：</b> 点击下方按钮生成

💡 <b>将此信息分享给发送方</b>`,

  transactionHistoryHeader: `📊 <b>交易历史</b>

最近 5 笔交易：`,

  noTransactions: `暂无交易记录
开始使用您的数字钱包吧！💰`,

  // Help Messages
  helpMain: `❓ <b>帮助与支持</b>

👋 欢迎来到 DOGLC 数字钱包帮助中心

🔍 <b>选择需要帮助的主题：</b>

📝 <b>所有命令</b> - 可用命令列表
💰 <b>钱包使用</b> - 如何使用钱包
🔐 <b>安全</b> - 安全提示和指南
❓ <b>常见问题</b> - 常见问题解答

📞 <b>需要更多帮助？</b>
联系我们的 24/7 客户支持团队`,

  helpCommands: `📝 <b>所有命令</b>

🤖 <b>基本命令：</b>
• <code>/start</code> - 开始使用机器人
• <code>/help</code> - 查看帮助
• <code>/wallet</code> - 打开钱包

💰 <b>钱包命令：</b>
• <code>/balance</code> - 查看余额
• <code>/send</code> - 发送资金
• <code>/receive</code> - 接收资金
• <code>/history</code> - 交易历史

⚙️ <b>设置命令：</b>
• <code>/settings</code> - 账户设置
• <code>/language</code> - 更改语言
• <code>/notifications</code> - 通知设置

💡 <b>提示：</b> 您可以使用按钮而不是输入命令`,

  helpWallet: `💰 <b>钱包使用指南</b>

🔍 <b>查看余额：</b>
• 点击"💳 余额"或使用 <code>/balance</code>
• 查看 USDT 和 CNY 金额
• 检查收支统计

📤 <b>发送资金：</b>
• 选择方式：手机号、用户名、二维码、地址
• 输入金额并确认
• 发送成功时获得通知

📥 <b>接收资金：</b>
• 与发送方分享您的信息
• 生成接收二维码
• 实时接收资金

📊 <b>交易历史：</b>
• 查看所有交易
• 按日期和类型筛选
• 导出数据到文件

💡 <b>建议：</b>
• 交易前核实详情
• 保留交易凭证
• 遇到问题联系支持`,

  helpSecurity: `🔐 <b>安全与保护</b>

🛡️ <b>安全措施：</b>
• 🔒 端到端加密
• 🔑 双因素认证系统
• 📱 登录通知
• ⏰ 不活动时自动锁定

🔐 <b>设置密码：</b>
• 创建 6 位数密码
• 使用密码确认交易
• 随时更改密码

📷 <b>凭证验证：</b>
• 拍摄银行凭证照片
• OCR 系统自动验证
• 存款前确认准确性

⚠️ <b>安全提示：</b>
• 永远不要分享您的密码
• 验证 URL 准确性
• 更新应用到最新版本
• 使用安全的 Wi-Fi 网络

🚨 <b>报告问题：</b>
如果发现可疑活动，请立即联系我们的团队`,

  helpFAQ: `❓ <b>常见问题</b>

💸 <b>费用：</b>
• 转账：0.1%（最低 1 USDT）
• CNY 存款：免费
• USDT 提取：2 USDT

⏱️ <b>交易时间：</b>
• USDT 到 USDT：即时
• CNY 存款：1-5 分钟（凭证验证后）
• USDT 提取：5-15 分钟

🔢 <b>限额：</b>
• 日发送限额：50,000 USDT
• 日接收限额：无限制
• 单笔最低金额：1 USDT

💱 <b>汇率：</b>
• 每 1 分钟更新
• 基于全球市场
• 有竞争力的价差

🌍 <b>支持的国家：</b>
• 泰国（完全支持）
• 东盟国家（部分支持）
• 更多详情见网站

🔧 <b>故障排除：</b>
• 重启 Telegram 应用
• 检查网络连接
• 再次尝试 /start 命令
• 如问题持续存在请联系支持`,

  helpContact: `📞 <b>联系我们</b>

🏢 <b>DOGLC 数字钱包支持中心</b>

📧 <b>邮箱：</b> support@doglcdigital.com
📞 <b>热线：</b> +66-2-123-4567（24/7）
💬 <b>Telegram：</b> @doglcdigital
🌐 <b>网站：</b> https://doglcdigital.com

📱 <b>社交媒体：</b>
• Facebook：facebook.com/doglcdigital
• Twitter：@doglcdigital
• YouTube：DOGLC Digital
• LINE：@doglcdigital

⏰ <b>服务时间：</b>
• 热线：24 小时，7 天
• 邮箱：1 小时内回复
• 在线聊天：24/7 在线

🎯 <b>支持类型：</b>
• 技术问题
• 使用问题
• 安全问题报告
• 建议和反馈`,

  // Error Messages
  errorOccurred: `❌ 发生错误，请重试`,
  unknownAction: `🤔 未知命令`,
  unrecognizedMessage: `💬 无法识别消息，请使用下方菜单`,
  processingImage: `📷 正在处理图片...`,
  ocrSuccess: `✅ 凭证验证成功！\n💰 金额：{amount} 元\n🏦 银行：{bank}`,
  ocrError: `❌ 无法读取凭证，请拍摄更清晰的照片`,

  // Currency formatting
  currency: {
    thb: 'THB',
    usdt: 'USDT',
    usd: 'USD',
    cny: 'CNY'
  }
};