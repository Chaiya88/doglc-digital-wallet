/**
 * Multi-Currency Support System for Digital Wallet
 * Supports BTC, ETH, USDC, and other cryptocurrencies beyond USDT
 */

import { formatCurrency, logUserActivity } from './helpers.js';
import { encrypt, decrypt } from './encryption.js';
import { logSecurityEvent, SECURITY_EVENT_TYPES, SEVERITY_LEVELS } from './security-logger.js';

/**
 * Supported Currencies Configuration
 */
export const SUPPORTED_CURRENCIES = {
  // Fiat Currencies
  THB: {
    code: 'THB',
    name: 'Thai Baht',
    symbol: '฿',
    type: 'FIAT',
    decimals: 2,
    enabled: true,
    isBase: true,
    country: 'TH',
    icon: '🇹🇭'
  },
  USD: {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    type: 'FIAT',
    decimals: 2,
    enabled: true,
    country: 'US',
    icon: '🇺🇸'
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    type: 'FIAT',
    decimals: 2,
    enabled: true,
    country: 'EU',
    icon: '🇪🇺'
  },
  
  // Cryptocurrencies
  USDT: {
    code: 'USDT',
    name: 'Tether',
    symbol: 'USDT',
    type: 'CRYPTO',
    decimals: 6,
    enabled: true,
    network: 'TRC20',
    contractAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    icon: '🪙',
    color: '#26A17B',
    minWithdraw: 10,
    maxWithdraw: 50000,
    withdrawFee: 1
  },
  USDC: {
    code: 'USDC',
    name: 'USD Coin',
    symbol: 'USDC',
    type: 'CRYPTO',
    decimals: 6,
    enabled: true,
    network: 'TRC20',
    contractAddress: 'TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8',
    icon: '🔵',
    color: '#2775CA',
    minWithdraw: 10,
    maxWithdraw: 50000,
    withdrawFee: 1
  },
  BTC: {
    code: 'BTC',
    name: 'Bitcoin',
    symbol: '₿',
    type: 'CRYPTO',
    decimals: 8,
    enabled: true,
    network: 'BTC',
    icon: '₿',
    color: '#F7931A',
    minWithdraw: 0.001,
    maxWithdraw: 10,
    withdrawFee: 0.0005
  },
  ETH: {
    code: 'ETH',
    name: 'Ethereum',
    symbol: 'Ξ',
    type: 'CRYPTO',
    decimals: 18,
    enabled: true,
    network: 'ETH',
    icon: '⬟',
    color: '#627EEA',
    minWithdraw: 0.01,
    maxWithdraw: 100,
    withdrawFee: 0.002
  },
  BNB: {
    code: 'BNB',
    name: 'Binance Coin',
    symbol: 'BNB',
    type: 'CRYPTO',
    decimals: 18,
    enabled: true,
    network: 'BSC',
    icon: '🟡',
    color: '#F3BA2F',
    minWithdraw: 0.01,
    maxWithdraw: 100,
    withdrawFee: 0.001
  },
  ADA: {
    code: 'ADA',
    name: 'Cardano',
    symbol: 'ADA',
    type: 'CRYPTO',
    decimals: 6,
    enabled: true,
    network: 'ADA',
    icon: '🔷',
    color: '#0033AD',
    minWithdraw: 10,
    maxWithdraw: 10000,
    withdrawFee: 1
  },
  DOT: {
    code: 'DOT',
    name: 'Polkadot',
    symbol: 'DOT',
    type: 'CRYPTO',
    decimals: 10,
    enabled: true,
    network: 'DOT',
    icon: '⚪',
    color: '#E6007A',
    minWithdraw: 1,
    maxWithdraw: 1000,
    withdrawFee: 0.1
  },
  MATIC: {
    code: 'MATIC',
    name: 'Polygon',
    symbol: 'MATIC',
    type: 'CRYPTO',
    decimals: 18,
    enabled: true,
    network: 'POLYGON',
    icon: '🟣',
    color: '#8247E5',
    minWithdraw: 10,
    maxWithdraw: 10000,
    withdrawFee: 1
  }
};

/**
 * Exchange Rate Service
 */
export class ExchangeRateService {
  
  static rateCache = new Map();
  static lastUpdate = null;
  static updateInterval = 60000; // 1 minute
  
  /**
   * Get exchange rates from multiple sources
   */
  static async getExchangeRates() {
    try {
      // Check cache
      if (this.lastUpdate && Date.now() - this.lastUpdate < this.updateInterval) {
        return Object.fromEntries(this.rateCache);
      }
      
      // Fetch from multiple sources
      const rates = await this.fetchFromMultipleSources();
      
      // Update cache
      this.rateCache.clear();
      Object.entries(rates).forEach(([pair, rate]) => {
        this.rateCache.set(pair, rate);
      });
      this.lastUpdate = Date.now();
      
      return rates;
      
    } catch (error) {
      console.error('Exchange rate fetch error:', error);
      
      // Return cached rates if available
      if (this.rateCache.size > 0) {
        console.warn('Using cached exchange rates due to fetch error');
        return Object.fromEntries(this.rateCache);
      }
      
      // Fallback to hardcoded rates
      return this.getFallbackRates();
    }
  }
  
  /**
   * Fetch rates from multiple sources with redundancy
   */
  static async fetchFromMultipleSources() {
    const sources = [
      () => this.fetchFromBinance(),
      () => this.fetchFromCoinGecko(),
      () => this.fetchFromKraken(),
      () => this.fetchFromExchangeRateAPI()
    ];
    
    let rates = null;
    let lastError = null;
    
    // Try each source until one succeeds
    for (const fetchSource of sources) {
      try {
        rates = await fetchSource();
        if (rates && Object.keys(rates).length > 0) {
          break;
        }
      } catch (error) {
        lastError = error;
        console.warn('Exchange rate source failed, trying next...', error.message);
      }
    }
    
    if (!rates) {
      throw lastError || new Error('All exchange rate sources failed');
    }
    
    return rates;
  }
  
  /**
   * Fetch from Binance API
   */
  static async fetchFromBinance() {
    const response = await fetch('https://api.binance.com/api/v3/ticker/price');
    const data = await response.json();
    
    const rates = {};
    
    // Convert Binance format to our format
    data.forEach(ticker => {
      const symbol = ticker.symbol;
      const price = parseFloat(ticker.price);
      
      // Map common pairs
      if (symbol === 'BTCUSDT') rates['BTC/USDT'] = price;
      if (symbol === 'ETHUSDT') rates['ETH/USDT'] = price;
      if (symbol === 'BNBUSDT') rates['BNB/USDT'] = price;
      if (symbol === 'ADAUSDT') rates['ADA/USDT'] = price;
      if (symbol === 'DOTUSDT') rates['DOT/USDT'] = price;
      if (symbol === 'MATICUSDT') rates['MATIC/USDT'] = price;
    });
    
    return rates;
  }
  
  /**
   * Fetch from CoinGecko API
   */
  static async fetchFromCoinGecko() {
    const coins = 'bitcoin,ethereum,binancecoin,cardano,polkadot,polygon';
    const currencies = 'usd,thb';
    
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coins}&vs_currencies=${currencies}`
    );
    const data = await response.json();
    
    const rates = {};
    
    // Convert CoinGecko format
    if (data.bitcoin) {
      rates['BTC/USD'] = data.bitcoin.usd;
      rates['BTC/THB'] = data.bitcoin.thb;
    }
    if (data.ethereum) {
      rates['ETH/USD'] = data.ethereum.usd;
      rates['ETH/THB'] = data.ethereum.thb;
    }
    if (data.binancecoin) {
      rates['BNB/USD'] = data.binancecoin.usd;
      rates['BNB/THB'] = data.binancecoin.thb;
    }
    if (data.cardano) {
      rates['ADA/USD'] = data.cardano.usd;
      rates['ADA/THB'] = data.cardano.thb;
    }
    if (data.polkadot) {
      rates['DOT/USD'] = data.polkadot.usd;
      rates['DOT/THB'] = data.polkadot.thb;
    }
    if (data.polygon) {
      rates['MATIC/USD'] = data.polygon.usd;
      rates['MATIC/THB'] = data.polygon.thb;
    }
    
    return rates;
  }
  
  /**
   * Fetch from Kraken API
   */
  static async fetchFromKraken() {
    const response = await fetch('https://api.kraken.com/0/public/Ticker?pair=XBTUSD,ETHUSD');
    const data = await response.json();
    
    const rates = {};
    
    if (data.result) {
      if (data.result.XXBTZUSD) {
        rates['BTC/USD'] = parseFloat(data.result.XXBTZUSD.c[0]);
      }
      if (data.result.XETHZUSD) {
        rates['ETH/USD'] = parseFloat(data.result.XETHZUSD.c[0]);
      }
    }
    
    return rates;
  }
  
  /**
   * Fetch THB/USD rate from ExchangeRate-API
   */
  static async fetchFromExchangeRateAPI() {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json();
    
    const rates = {};
    
    if (data.rates && data.rates.THB) {
      rates['USD/THB'] = data.rates.THB;
      rates['THB/USD'] = 1 / data.rates.THB;
    }
    
    return rates;
  }
  
  /**
   * Fallback rates for when all APIs are down
   */
  static getFallbackRates() {
    return {
      'USD/THB': 35.5,
      'THB/USD': 0.028,
      'BTC/USD': 43000,
      'BTC/THB': 1526500,
      'ETH/USD': 2300,
      'ETH/THB': 81650,
      'BNB/USD': 220,
      'BNB/THB': 7810,
      'ADA/USD': 0.35,
      'ADA/THB': 12.43,
      'DOT/USD': 5.2,
      'DOT/THB': 184.6,
      'MATIC/USD': 0.8,
      'MATIC/THB': 28.4,
      'USDT/USD': 1.0,
      'USDT/THB': 35.5,
      'USDC/USD': 1.0,
      'USDC/THB': 35.5
    };
  }
  
  /**
   * Convert amount between currencies
   */
  static async convertCurrency(amount, fromCurrency, toCurrency) {
    try {
      if (fromCurrency === toCurrency) {
        return amount;
      }
      
      const rates = await this.getExchangeRates();
      
      // Direct rate
      const directRate = rates[`${fromCurrency}/${toCurrency}`];
      if (directRate) {
        return amount * directRate;
      }
      
      // Reverse rate
      const reverseRate = rates[`${toCurrency}/${fromCurrency}`];
      if (reverseRate) {
        return amount / reverseRate;
      }
      
      // Via USD conversion
      const fromUSDRate = rates[`${fromCurrency}/USD`] || (rates[`USD/${fromCurrency}`] ? 1 / rates[`USD/${fromCurrency}`] : null);
      const toUSDRate = rates[`${toCurrency}/USD`] || (rates[`USD/${toCurrency}`] ? 1 / rates[`USD/${toCurrency}`] : null);
      
      if (fromUSDRate && toUSDRate) {
        const usdAmount = amount * fromUSDRate;
        return usdAmount / toUSDRate;
      }
      
      // Via THB conversion
      const fromTHBRate = rates[`${fromCurrency}/THB`] || (rates[`THB/${fromCurrency}`] ? 1 / rates[`THB/${fromCurrency}`] : null);
      const toTHBRate = rates[`${toCurrency}/THB`] || (rates[`THB/${toCurrency}`] ? 1 / rates[`THB/${toCurrency}`] : null);
      
      if (fromTHBRate && toTHBRate) {
        const thbAmount = amount * fromTHBRate;
        return thbAmount / toTHBRate;
      }
      
      throw new Error(`Cannot find exchange rate for ${fromCurrency}/${toCurrency}`);
      
    } catch (error) {
      console.error('Currency conversion error:', error);
      throw error;
    }
  }
  
  /**
   * Get formatted exchange rate
   */
  static async getFormattedRate(fromCurrency, toCurrency) {
    try {
      const rate = await this.convertCurrency(1, fromCurrency, toCurrency);
      const fromCurr = SUPPORTED_CURRENCIES[fromCurrency];
      const toCurr = SUPPORTED_CURRENCIES[toCurrency];
      
      return {
        rate,
        formatted: `1 ${fromCurr.symbol} = ${rate.toFixed(toCurr.decimals)} ${toCurr.symbol}`,
        lastUpdate: new Date(this.lastUpdate).toISOString()
      };
      
    } catch (error) {
      console.error('Get formatted rate error:', error);
      return null;
    }
  }
}

/**
 * Multi-Currency Wallet Service
 */
export class MultiCurrencyWallet {
  
  /**
   * Get user balances for all currencies
   */
  static async getUserBalances(userId, env) {
    try {
      const balances = {};
      
      // Get balances for each supported currency
      for (const [code, currency] of Object.entries(SUPPORTED_CURRENCIES)) {
        if (currency.enabled) {
          const balance = await this.getCurrencyBalance(userId, code, env);
          balances[code] = {
            amount: balance,
            currency: currency,
            formatted: this.formatAmount(balance, currency),
            usdValue: await this.getUSDValue(balance, code)
          };
        }
      }
      
      return balances;
      
    } catch (error) {
      console.error('Get user balances error:', error);
      throw error;
    }
  }
  
  /**
   * Get balance for specific currency
   */
  static async getCurrencyBalance(userId, currencyCode, env) {
    try {
      // In production, get from database
      const key = `balance_${userId}_${currencyCode}`;
      const balance = await env.WALLET_KV.get(key);
      return balance ? parseFloat(balance) : 0;
      
    } catch (error) {
      console.error('Get currency balance error:', error);
      return 0;
    }
  }
  
  /**
   * Update currency balance
   */
  static async updateCurrencyBalance(userId, currencyCode, amount, env) {
    try {
      const key = `balance_${userId}_${currencyCode}`;
      const currentBalance = await this.getCurrencyBalance(userId, currencyCode, env);
      const newBalance = Math.max(0, currentBalance + amount); // Prevent negative balances
      
      await env.WALLET_KV.put(key, newBalance.toString());
      
      // Log balance change
      await logUserActivity(userId, {
        action: 'balance_updated',
        currency: currencyCode,
        amount,
        oldBalance: currentBalance,
        newBalance,
        timestamp: new Date().toISOString()
      }, env);
      
      return newBalance;
      
    } catch (error) {
      console.error('Update currency balance error:', error);
      throw error;
    }
  }
  
  /**
   * Transfer between currencies (internal exchange)
   */
  static async exchangeCurrencies(userId, fromCurrency, toCurrency, amount, env) {
    try {
      // Validate currencies
      if (!SUPPORTED_CURRENCIES[fromCurrency] || !SUPPORTED_CURRENCIES[toCurrency]) {
        throw new Error('ไม่รองรับสกุลเงินที่เลือก');
      }
      
      // Check balance
      const fromBalance = await this.getCurrencyBalance(userId, fromCurrency, env);
      if (fromBalance < amount) {
        throw new Error('ยอดเงินไม่เพียงพอ');
      }
      
      // Get exchange rate
      const convertedAmount = await ExchangeRateService.convertCurrency(amount, fromCurrency, toCurrency);
      
      // Calculate fees (0.1% exchange fee)
      const exchangeFee = convertedAmount * 0.001;
      const finalAmount = convertedAmount - exchangeFee;
      
      // Execute exchange
      await this.updateCurrencyBalance(userId, fromCurrency, -amount, env);
      await this.updateCurrencyBalance(userId, toCurrency, finalAmount, env);
      
      // Log exchange transaction
      await logSecurityEvent({
        type: SECURITY_EVENT_TYPES.TRANSACTION_CREATED,
        userId,
        severity: SEVERITY_LEVELS.MEDIUM,
        description: `Currency exchange: ${amount} ${fromCurrency} → ${finalAmount} ${toCurrency}`,
        metadata: {
          type: 'CURRENCY_EXCHANGE',
          fromCurrency,
          toCurrency,
          fromAmount: amount,
          toAmount: finalAmount,
          exchangeFee,
          rate: convertedAmount / amount
        }
      });
      
      return {
        success: true,
        fromCurrency,
        toCurrency,
        fromAmount: amount,
        toAmount: finalAmount,
        exchangeFee,
        rate: convertedAmount / amount
      };
      
    } catch (error) {
      console.error('Currency exchange error:', error);
      throw error;
    }
  }
  
  /**
   * Get total portfolio value in USD
   */
  static async getPortfolioValue(userId, env) {
    try {
      const balances = await this.getUserBalances(userId, env);
      let totalUSD = 0;
      
      for (const [code, balance] of Object.entries(balances)) {
        if (balance.amount > 0) {
          totalUSD += balance.usdValue || 0;
        }
      }
      
      return {
        totalUSD,
        totalTHB: await ExchangeRateService.convertCurrency(totalUSD, 'USD', 'THB'),
        breakdown: balances,
        lastUpdate: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Get portfolio value error:', error);
      return { totalUSD: 0, totalTHB: 0, breakdown: {}, lastUpdate: new Date().toISOString() };
    }
  }
  
  /**
   * Helper methods
   */
  static formatAmount(amount, currency) {
    if (!amount || !currency) return '0';
    
    const formatter = new Intl.NumberFormat('th-TH', {
      minimumFractionDigits: 0,
      maximumFractionDigits: currency.decimals
    });
    
    return `${currency.symbol}${formatter.format(amount)}`;
  }
  
  static async getUSDValue(amount, currencyCode) {
    try {
      if (currencyCode === 'USD') return amount;
      return await ExchangeRateService.convertCurrency(amount, currencyCode, 'USD');
    } catch (error) {
      return 0;
    }
  }
}

/**
 * Currency Selection Handler
 */
export async function handleCurrencySelection(ctx, env) {
  try {
    const userId = ctx.from.id.toString();
    
    // Get enabled currencies
    const enabledCurrencies = Object.entries(SUPPORTED_CURRENCIES)
      .filter(([code, currency]) => currency.enabled)
      .sort((a, b) => {
        // Sort: Fiat first, then crypto by popularity
        if (a[1].type !== b[1].type) {
          return a[1].type === 'FIAT' ? -1 : 1;
        }
        return a[0].localeCompare(b[0]);
      });
    
    let currencyMessage = '💰 <b>เลือกสกุลเงิน - Select Currency</b>\n\n';
    
    currencyMessage += '💵 <b>สกุลเงินสด - Fiat Currencies:</b>\n';
    enabledCurrencies
      .filter(([code, currency]) => currency.type === 'FIAT')
      .forEach(([code, currency]) => {
        currencyMessage += `${currency.icon} ${currency.symbol} ${currency.name}\n`;
      });
    
    currencyMessage += '\n🪙 <b>สกุลเงินดิจิทัล - Cryptocurrencies:</b>\n';
    enabledCurrencies
      .filter(([code, currency]) => currency.type === 'CRYPTO')
      .forEach(([code, currency]) => {
        const network = currency.network ? ` (${currency.network})` : '';
        currencyMessage += `${currency.icon} ${currency.symbol} ${currency.name}${network}\n`;
      });
    
    // Create keyboard with currency options
    const keyboard = {
      inline_keyboard: []
    };
    
    // Add fiat currencies
    const fiatCurrencies = enabledCurrencies.filter(([code, currency]) => currency.type === 'FIAT');
    for (let i = 0; i < fiatCurrencies.length; i += 2) {
      const row = [];
      row.push({
        text: `${fiatCurrencies[i][1].icon} ${fiatCurrencies[i][0]}`,
        callback_data: `select_currency_${fiatCurrencies[i][0]}`
      });
      if (fiatCurrencies[i + 1]) {
        row.push({
          text: `${fiatCurrencies[i + 1][1].icon} ${fiatCurrencies[i + 1][0]}`,
          callback_data: `select_currency_${fiatCurrencies[i + 1][0]}`
        });
      }
      keyboard.inline_keyboard.push(row);
    }
    
    // Add crypto currencies
    const cryptoCurrencies = enabledCurrencies.filter(([code, currency]) => currency.type === 'CRYPTO');
    for (let i = 0; i < cryptoCurrencies.length; i += 2) {
      const row = [];
      row.push({
        text: `${cryptoCurrencies[i][1].icon} ${cryptoCurrencies[i][0]}`,
        callback_data: `select_currency_${cryptoCurrencies[i][0]}`
      });
      if (cryptoCurrencies[i + 1]) {
        row.push({
          text: `${cryptoCurrencies[i + 1][1].icon} ${cryptoCurrencies[i + 1][0]}`,
          callback_data: `select_currency_${cryptoCurrencies[i + 1][0]}`
        });
      }
      keyboard.inline_keyboard.push(row);
    }
    
    // Add portfolio and exchange options
    keyboard.inline_keyboard.push([
      { text: '📊 ดูพอร์ตโฟลิโอ', callback_data: 'view_portfolio' },
      { text: '🔄 แลกเปลี่ยน', callback_data: 'currency_exchange' }
    ]);
    
    keyboard.inline_keyboard.push([
      { text: '📈 ราคาตลาด', callback_data: 'market_rates' },
      { text: '🔙 กลับเมนูหลัก', callback_data: 'main_menu' }
    ]);
    
    await ctx.reply(currencyMessage, {
      reply_markup: keyboard,
      parse_mode: 'HTML'
    });
    
  } catch (error) {
    console.error('Currency selection error:', error);
    await ctx.reply('❌ เกิดข้อผิดพลาดในการแสดงสกุลเงิน');
  }
}

export default {
  SUPPORTED_CURRENCIES,
  ExchangeRateService,
  MultiCurrencyWallet,
  handleCurrencySelection
};