/**
 * Exchange Rate System for THB ↔ USDT
 * Handles real-time rate conversion and display
 */

/**
 * Current exchange rates (should be fetched from external API)
 */
const EXCHANGE_RATES = {
  THB_TO_USDT: 36.50, // 1 USDT = 36.50 THB
  USDT_TO_THB: 0.02740, // 1 THB = 0.02740 USDT
  LAST_UPDATE: new Date().toISOString(),
  SOURCE: 'binance_api'
};

/**
 * Convert THB to USDT
 */
export function convertTHBtoUSDT(thbAmount) {
  const usdtAmount = thbAmount / EXCHANGE_RATES.THB_TO_USDT;
  return {
    thb: parseFloat(thbAmount),
    usdt: parseFloat(usdtAmount.toFixed(6)),
    rate: EXCHANGE_RATES.THB_TO_USDT,
    lastUpdate: EXCHANGE_RATES.LAST_UPDATE
  };
}

/**
 * Convert USDT to THB
 */
export function convertUSDTtoTHB(usdtAmount) {
  const thbAmount = usdtAmount * EXCHANGE_RATES.THB_TO_USDT;
  return {
    usdt: parseFloat(usdtAmount),
    thb: parseFloat(thbAmount.toFixed(2)),
    rate: EXCHANGE_RATES.THB_TO_USDT,
    lastUpdate: EXCHANGE_RATES.LAST_UPDATE
  };
}

/**
 * Get current exchange rate display
 */
export function getExchangeRateDisplay() {
  const updateTime = new Date(EXCHANGE_RATES.LAST_UPDATE);
  const timeDisplay = updateTime.toLocaleString('th-TH', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `
💱 <b>อัตราแลกเปลี่ยนปัจจุบัน</b>

🔄 <b>THB → USDT:</b>
• 1 USDT = ${EXCHANGE_RATES.THB_TO_USDT} THB
• 1,000 THB = ${(1000 / EXCHANGE_RATES.THB_TO_USDT).toFixed(4)} USDT
• 10,000 THB = ${(10000 / EXCHANGE_RATES.THB_TO_USDT).toFixed(2)} USDT

🔄 <b>USDT → THB:</b>
• 1 THB = ${EXCHANGE_RATES.USDT_TO_THB} USDT
• 100 USDT = ${(100 * EXCHANGE_RATES.THB_TO_USDT).toFixed(2)} THB
• 1,000 USDT = ${(1000 * EXCHANGE_RATES.THB_TO_USDT).toLocaleString()} THB

⏰ <b>อัพเดทล่าสุด:</b> ${timeDisplay}
📊 <b>แหล่งข้อมูล:</b> ${EXCHANGE_RATES.SOURCE.toUpperCase()}

<i>* อัตราแลกเปลี่ยนอาจเปลี่ยนแปลงตามสภาวะตลาด</i>
  `;
}

/**
 * Calculate fees based on VIP level
 */
export function calculateFees(amount, operation, vipLevel = 'BRONZE') {
  const feeRates = {
    deposit: {
      BRONZE: 0.02, // 2%
      SILVER: 0.015, // 1.5%
      GOLD: 0.01, // 1%
      PLATINUM: 0.005 // 0.5%
    },
    withdraw: {
      BRONZE: 0.015, // 1.5%
      SILVER: 0.01, // 1%
      GOLD: 0.008, // 0.8%
      PLATINUM: 0.005 // 0.5%
    }
  };

  const rate = feeRates[operation]?.[vipLevel] || feeRates[operation]['BRONZE'];
  const feeAmount = amount * rate;
  const minimumFee = operation === 'deposit' ? 10 : 2; // THB for deposit, USDT for withdraw

  return {
    rate: rate,
    feeAmount: Math.max(feeAmount, minimumFee),
    netAmount: amount - Math.max(feeAmount, minimumFee),
    vipLevel: vipLevel
  };
}

/**
 * Fetch live exchange rates (mock implementation)
 * In production, this should fetch from external APIs like Binance, CoinGecko, etc.
 */
export async function fetchLiveRates() {
  try {
    // Mock API call - replace with real API
    const mockResponse = {
      USDTTRY: 36.48,
      TRYUSDT: 0.02741,
      lastUpdate: new Date().toISOString(),
      source: 'binance_api'
    };

    // Update internal rates
    EXCHANGE_RATES.THB_TO_USDT = mockResponse.USDTTRY;
    EXCHANGE_RATES.USDT_TO_THB = mockResponse.TRYUSDT;
    EXCHANGE_RATES.LAST_UPDATE = mockResponse.lastUpdate;
    EXCHANGE_RATES.SOURCE = mockResponse.source;

    return {
      success: true,
      rates: EXCHANGE_RATES
    };

  } catch (error) {
    console.error('Failed to fetch live rates:', error);
    return {
      success: false,
      error: 'Failed to fetch live rates',
      rates: EXCHANGE_RATES // Return cached rates
    };
  }
}

/**
 * Get deposit calculation preview
 */
export function getDepositCalculation(thbAmount, vipLevel = 'BRONZE') {
  const conversion = convertTHBtoUSDT(thbAmount);
  const fees = calculateFees(thbAmount, 'deposit', vipLevel);
  
  return `
💰 <b>การคำนวณการฝาก</b>

💵 <b>จำนวนฝาก:</b> ${thbAmount.toLocaleString()} THB
💎 <b>ได้รับ:</b> ${conversion.usdt} USDT

💸 <b>ค่าธรรมเนียม:</b>
• อัตรา VIP ${vipLevel}: ${(fees.rate * 100)}%
• จำนวน: ${fees.feeAmount.toFixed(2)} THB
• สุทธิ: ${fees.netAmount.toFixed(2)} THB

🔄 <b>อัตราแลกเปลี่ยน:</b> 1 USDT = ${conversion.rate} THB

⏰ <b>อัพเดท:</b> ${new Date(conversion.lastUpdate).toLocaleString('th-TH')}
  `;
}

/**
 * Get withdrawal calculation preview
 */
export function getWithdrawCalculation(usdtAmount, vipLevel = 'BRONZE') {
  const conversion = convertUSDTtoTHB(usdtAmount);
  const fees = calculateFees(usdtAmount, 'withdraw', vipLevel);
  
  return `
💎 <b>การคำนวณการถอน</b>

💎 <b>จำนวนถอน:</b> ${usdtAmount} USDT
💵 <b>มูลค่า:</b> ${conversion.thb.toLocaleString()} THB

💸 <b>ค่าธรรมเนียม:</b>
• อัตรา VIP ${vipLevel}: ${(fees.rate * 100)}%
• จำนวน: ${fees.feeAmount.toFixed(4)} USDT
• สุทธิ: ${fees.netAmount.toFixed(4)} USDT

🔄 <b>อัตราแลกเปลี่ยน:</b> 1 USDT = ${conversion.rate} THB

⏰ <b>อัพเดท:</b> ${new Date(conversion.lastUpdate).toLocaleString('th-TH')}
  `;
}