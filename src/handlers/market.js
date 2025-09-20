/**
 * Market data and trading command handlers
 */

import { formatCurrency, formatDateTime, logUserActivity } from '../utils/helpers.js';

export async function handleMarket(ctx, marketType = 'overview') {
  try {
    const messages = ctx.messages;
    const userId = ctx.from.id.toString();
    const userLang = ctx.userLanguage;

    await logUserActivity(userId, {
      action: 'market_access',
      market_type: marketType,
      language: userLang
    }, ctx.env || {});

    if (marketType === 'prices') {
      return await handlePrices(ctx);
    } else if (marketType === 'charts') {
      return await handleCharts(ctx);
    } else if (marketType === 'alerts') {
      return await handleAlerts(ctx);
    } else {
      return await handleMarketOverview(ctx);
    }

  } catch (error) {
    console.error('Market handler error:', error);
    await ctx.reply(ctx.messages.errorOccurred);
  }
}

/**
 * Market overview with current prices
 */
async function handleMarketOverview(ctx) {
  const messages = ctx.messages;
  
  // Mock market data
  const marketData = {
    doglc: {
      price_thb: 12.45,
      price_usdt: 0.352,
      change_24h: 5.2,
      volume_24h: 125000,
      market_cap: 15600000
    },
    usdt: {
      price_thb: 35.42,
      change_24h: 0.1,
      volume_24h: 2500000
    },
    btc: {
      price_usdt: 28450.50,
      price_thb: 1008500,
      change_24h: 2.8
    },
    eth: {
      price_usdt: 1685.25,
      price_thb: 59700,
      change_24h: -1.5
    }
  };

  const marketMessage = `
📈 <b>ข้อมูลตลาด / Market Data</b>

🐕 <b>DOGLC Token:</b>
💰 ราคา: ${marketData.doglc.price_thb} บาท (${marketData.doglc.price_usdt} USDT)
📊 24h: ${marketData.doglc.change_24h > 0 ? '📈 +' : '📉 '}${marketData.doglc.change_24h}%
💹 ปริมาณ: ${formatCurrency(marketData.doglc.volume_24h, 'th')} บาท
🏪 Market Cap: ${formatCurrency(marketData.doglc.market_cap, 'th')} บาท

💎 <b>USDT/THB:</b>
💰 ราคา: ${marketData.usdt.price_thb} บาท
📊 24h: ${marketData.usdt.change_24h > 0 ? '📈 +' : '📉 '}${marketData.usdt.change_24h}%

₿ <b>Bitcoin (BTC):</b>
💰 ราคา: ${marketData.btc.price_usdt.toLocaleString()} USDT
📊 24h: ${marketData.btc.change_24h > 0 ? '📈 +' : '📉 '}${marketData.btc.change_24h}%

⚡ <b>Ethereum (ETH):</b>
💰 ราคา: ${marketData.eth.price_usdt.toLocaleString()} USDT
📊 24h: ${marketData.eth.change_24h > 0 ? '📈 +' : '📉 '}${marketData.eth.change_24h}%

🕐 <b>อัพเดตล่าสุด:</b> ${new Date().toLocaleString('th-TH')}
  `;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '📊 รายละเอียดราคา / Price Details', callback_data: 'market_prices' },
        { text: '📈 กราฟ / Charts', callback_data: 'market_charts' }
      ],
      [
        { text: '🔔 ตั้งแจ้งเตือนราคา / Price Alerts', callback_data: 'market_alerts' }
      ],
      [
        { text: '💱 แลกเปลี่ยน / Exchange', callback_data: 'exchange_menu' }
      ],
      [
        { text: '📱 รีเฟรช / Refresh', callback_data: 'market_overview' }
      ],
      [
        { text: '🔙 กลับ / Back', callback_data: 'wallet' }
      ]
    ]
  };

  await ctx.reply(marketMessage, {
    reply_markup: keyboard,
    parse_mode: 'HTML'
  });
}

/**
 * Detailed price information
 */
async function handlePrices(ctx) {
  const messages = ctx.messages;
  
  const priceData = {
    doglc: {
      current: 12.45,
      high_24h: 13.20,
      low_24h: 11.80,
      open_24h: 11.85,
      volume_thb: 125000,
      trades_24h: 892
    }
  };

  const pricesMessage = `
📊 <b>รายละเอียดราคา DOGLC / DOGLC Price Details</b>

💰 <b>ราคาปัจจุบัน:</b> ${priceData.doglc.current} บาท

📈 <b>ข้อมูล 24 ชั่วโมง:</b>
• สูงสุด: ${priceData.doglc.high_24h} บาท
• ต่ำสุด: ${priceData.doglc.low_24h} บาท
• เปิด: ${priceData.doglc.open_24h} บาท
• ปิด: ${priceData.doglc.current} บาท

📊 <b>ปริมาณการซื้อขาย:</b>
• ปริมาณ: ${formatCurrency(priceData.doglc.volume_thb, 'th')} บาท
• จำนวนรายการ: ${priceData.doglc.trades_24h} รายการ

📈 <b>การเปลี่ยนแปลง:</b>
• จากเปิด: +${((priceData.doglc.current - priceData.doglc.open_24h) / priceData.doglc.open_24h * 100).toFixed(2)}%
• จากสูงสุด: ${((priceData.doglc.current - priceData.doglc.high_24h) / priceData.doglc.high_24h * 100).toFixed(2)}%
• จากต่ำสุด: +${((priceData.doglc.current - priceData.doglc.low_24h) / priceData.doglc.low_24h * 100).toFixed(2)}%

💡 <b>การวิเคราะห์:</b>
• Trend: 📈 Bullish
• Support: ${priceData.doglc.low_24h} บาท
• Resistance: ${priceData.doglc.high_24h} บาท
  `;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '📈 กราฟ 1h / 1H Chart', callback_data: 'chart_1h' },
        { text: '📈 กราฟ 24h / 24H Chart', callback_data: 'chart_24h' }
      ],
      [
        { text: '🔔 ตั้งแจ้งเตือน / Set Alert', callback_data: 'set_price_alert' }
      ],
      [
        { text: '💱 ซื้อ/ขาย DOGLC / Trade', callback_data: 'trade_doglc' }
      ],
      [
        { text: '📱 รีเฟรช / Refresh', callback_data: 'market_prices' }
      ],
      [
        { text: '🔙 กลับตลาด / Back to Market', callback_data: 'market_overview' }
      ]
    ]
  };

  await ctx.reply(pricesMessage, {
    reply_markup: keyboard,
    parse_mode: 'HTML'
  });
}

/**
 * Price alerts management
 */
async function handleAlerts(ctx) {
  const messages = ctx.messages;
  
  // Mock user alerts
  const userAlerts = [
    {
      id: 'ALT001',
      symbol: 'DOGLC',
      type: 'above',
      target_price: 15.00,
      current_price: 12.45,
      status: 'active',
      created: '2025-09-20 10:00'
    },
    {
      id: 'ALT002',
      symbol: 'DOGLC',
      type: 'below',
      target_price: 10.00,
      current_price: 12.45,
      status: 'active',
      created: '2025-09-19 15:30'
    }
  ];

  const alertsMessage = `
🔔 <b>การแจ้งเตือนราคา / Price Alerts</b>

📊 <b>การแจ้งเตือนที่ตั้งไว้:</b>

${userAlerts.map((alert, index) => `
${index + 1}. <b>${alert.symbol}</b>
   🎯 ${alert.type === 'above' ? '📈 เมื่อราคาสูงกว่า' : '📉 เมื่อราคาต่ำกว่า'}: ${alert.target_price} บาท
   💰 ราคาปัจจุบัน: ${alert.current_price} บาท
   📅 ตั้งเมื่อ: ${alert.created}
   ✅ สถานะ: ${alert.status === 'active' ? '🟢 ใช้งาน' : '🔴 ปิด'}
   🔗 ID: <code>${alert.id}</code>
`).join('\n')}

📈 <b>สถิติการแจ้งเตือน:</b>
• การแจ้งเตือนทั้งหมด: ${userAlerts.length} รายการ
• กำลังใช้งาน: ${userAlerts.filter(a => a.status === 'active').length} รายการ
• เรียกแล้ววันนี้: 0 รายการ

💡 <b>เคล็ดลับ:</b> ตั้งราคาเป้าหมายเพื่อไม่พลาดโอกาสซื้อขาย!
  `;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '➕ เพิ่มแจ้งเตือนใหม่', callback_data: 'add_price_alert' }
      ],
      [
        { text: '📈 แจ้งเมื่อราคาสูงขึ้น', callback_data: 'alert_above' },
        { text: '📉 แจ้งเมื่อราคาลดลง', callback_data: 'alert_below' }
      ],
      [
        { text: '⚙️ จัดการแจ้งเตือน', callback_data: 'manage_alerts' }
      ],
      [
        { text: '🔙 กลับตลาด / Back to Market', callback_data: 'market_overview' }
      ]
    ]
  };

  await ctx.reply(alertsMessage, {
    reply_markup: keyboard,
    parse_mode: 'HTML'
  });
}

export async function handleExchange(ctx, exchangeType = 'menu') {
  try {
    const messages = ctx.messages;
    
    if (exchangeType === 'thb_to_usdt') {
      return await handleTHBtoUSDT(ctx);
    } else if (exchangeType === 'usdt_to_thb') {
      return await handleUSDTtoTHB(ctx);
    } else {
      return await handleExchangeMenu(ctx);
    }

  } catch (error) {
    console.error('Exchange handler error:', error);
    await ctx.reply(ctx.messages.errorOccurred);
  }
}

/**
 * Exchange menu
 */
async function handleExchangeMenu(ctx) {
  const messages = ctx.messages;
  
  const exchangeRates = {
    thb_to_usdt: 35.42,
    usdt_to_thb: 35.38,
    fee_percent: 0.5
  };

  const exchangeMessage = `
💱 <b>แลกเปลี่ยนสกุลเงิน / Currency Exchange</b>

📊 <b>อัตราแลกเปลี่ยนปัจจุบัน:</b>
• 1 USDT = ${exchangeRates.usdt_to_thb} บาท
• 1 บาท = ${(1 / exchangeRates.thb_to_usdt).toFixed(6)} USDT

💸 <b>ค่าธรรมเนียม:</b> ${exchangeRates.fee_percent}% (ขั้นต่ำ 1 บาท)

💰 <b>ยอดคงเหลือ:</b>
• THB: 1,234.56 บาท
• USDT: 42.35 USDT

🔄 <b>การแลกเปลี่ยนที่รองรับ:</b>

💵➡️💎 <b>THB เป็น USDT:</b>
• ขั้นต่ำ: 100 บาท
• สูงสุด: 50,000 บาท/วัน
• ได้รับทันที

💎➡️💵 <b>USDT เป็น THB:</b>
• ขั้นต่ำ: 3 USDT
• สูงสุด: 1,500 USDT/วัน
• ได้รับทันที

⚡ <b>ข้อดี:</b>
• แลกเปลี่ยนทันที
• อัตราแลกเปลี่ยนแข่งขันได้
• ไม่ต้องรอนาน
  `;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '💵➡️💎 THB เป็น USDT', callback_data: 'exchange_thb_to_usdt' }
      ],
      [
        { text: '💎➡️💵 USDT เป็น THB', callback_data: 'exchange_usdt_to_thb' }
      ],
      [
        { text: '📊 ประวัติแลกเปลี่ยน / Exchange History', callback_data: 'exchange_history' }
      ],
      [
        { text: '🔔 ตั้งแจ้งเตือนอัตรา / Rate Alerts', callback_data: 'exchange_alerts' }
      ],
      [
        { text: '🔙 กลับ / Back', callback_data: 'market_overview' }
      ]
    ]
  };

  await ctx.reply(exchangeMessage, {
    reply_markup: keyboard,
    parse_mode: 'HTML'
  });
}