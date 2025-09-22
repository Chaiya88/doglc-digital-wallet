/**
 * 💳 WALLET MANAGEMENT SYSTEM
 * ระบบจัดการกระเป๋าเงินสำหรับ DOGLC Digital Wallet
 */

export class WalletManager {
  constructor(env) {
    this.userSessionsKV = env.USER_SESSIONS;
    this.walletDbKV = env.WALLET_DB; 
    this.auditLogKV = env.AUDIT_LOG_KV;
  }

  /**
   * สร้างกระเป๋าเงินใหม่สำหรับผู้ใช้
   */
  async createWallet(userId, userInfo) {
    try {
      const walletId = `doglc_${userId}_wallet`;
      const walletData = {
        id: walletId,
        userId: userId,
        balances: {
          THB: 0.00,
          USDT: 0.00
        },
        address: walletId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        securityLevel: 'basic',
        transactions: [],
        statistics: {
          totalTransactions: 0,
          totalDeposits: 0,
          totalWithdrawals: 0,
          lastActivity: new Date().toISOString()
        }
      };

      // บันทึกลง KV
      await this.userSessionsKV.put(
        `wallet_${userId}`, 
        JSON.stringify(walletData),
        { expirationTtl: 86400 * 30 } // 30 วัน
      );

      // Log การสร้าง wallet
      await this.logActivity(userId, 'wallet_created', {
        walletId: walletId,
        timestamp: new Date().toISOString()
      });

      return walletData;
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw error;
    }
  }

  /**
   * ดึงข้อมูลกระเป๋าเงิน
   */
  async getWallet(userId) {
    try {
      const walletData = await this.userSessionsKV.get(`wallet_${userId}`, 'json');
      
      if (!walletData) {
        return null; // ยังไม่มี wallet
      }

      return walletData;
    } catch (error) {
      console.error('Error getting wallet:', error);
      return null;
    }
  }

  /**
   * อัพเดทยอดเงิน
   */
  async updateBalance(userId, currency, amount, type = 'add') {
    try {
      const wallet = await this.getWallet(userId);
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      // คำนวณยอดเงินใหม่
      if (type === 'add') {
        wallet.balances[currency] += parseFloat(amount);
      } else if (type === 'subtract') {
        if (wallet.balances[currency] < parseFloat(amount)) {
          throw new Error('Insufficient balance');
        }
        wallet.balances[currency] -= parseFloat(amount);
      }

      // อัพเดทสถิติ
      wallet.statistics.totalTransactions += 1;
      wallet.statistics.lastActivity = new Date().toISOString();
      wallet.updatedAt = new Date().toISOString();

      if (type === 'add') {
        wallet.statistics.totalDeposits += parseFloat(amount);
      } else {
        wallet.statistics.totalWithdrawals += parseFloat(amount);
      }

      // บันทึกกลับ KV
      await this.userSessionsKV.put(
        `wallet_${userId}`, 
        JSON.stringify(wallet),
        { expirationTtl: 86400 * 30 }
      );

      // Log transaction
      await this.logActivity(userId, 'balance_updated', {
        currency: currency,
        amount: amount,
        type: type,
        newBalance: wallet.balances[currency],
        timestamp: new Date().toISOString()
      });

      return wallet;
    } catch (error) {
      console.error('Error updating balance:', error);
      throw error;
    }
  }

  /**
   * เพิ่ม transaction ในประวัติ
   */
  async addTransaction(userId, transactionData) {
    try {
      const wallet = await this.getWallet(userId);
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const transaction = {
        id: `tx_${Date.now()}_${userId}`,
        ...transactionData,
        timestamp: new Date().toISOString(),
        status: 'completed'
      };

      // เพิ่มใน transactions array (เก็บแค่ 50 รายการล่าสุด)
      wallet.transactions.unshift(transaction);
      if (wallet.transactions.length > 50) {
        wallet.transactions = wallet.transactions.slice(0, 50);
      }

      wallet.updatedAt = new Date().toISOString();

      // บันทึกกลับ KV
      await this.userSessionsKV.put(
        `wallet_${userId}`, 
        JSON.stringify(wallet),
        { expirationTtl: 86400 * 30 }
      );

      return transaction;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  }

  /**
   * ดึงประวัติธุรกรรม
   */
  async getTransactionHistory(userId, limit = 10) {
    try {
      const wallet = await this.getWallet(userId);
      if (!wallet) {
        return [];
      }

      return wallet.transactions.slice(0, limit);
    } catch (error) {
      console.error('Error getting transaction history:', error);
      return [];
    }
  }

  /**
   * ตรวจสอบยอดเงิน
   */
  async checkBalance(userId, currency, amount) {
    try {
      const wallet = await this.getWallet(userId);
      if (!wallet) {
        return false;
      }

      return wallet.balances[currency] >= parseFloat(amount);
    } catch (error) {
      console.error('Error checking balance:', error);
      return false;
    }
  }

  /**
   * สร้าง wallet address สำหรับ deposit
   */
  generateDepositAddress(userId, currency) {
    if (currency === 'THB') {
      return `doglc_thb_${userId}`;
    } else if (currency === 'USDT') {
      // จำลอง USDT address
      return `TQ7YXmqrxKsJp8HE${userId}`.substring(0, 20);
    }
    return `doglc_${currency.toLowerCase()}_${userId}`;
  }

  /**
   * คำนวณค่าธรรมเนียม
   */
  calculateFee(currency, amount, type = 'withdraw') {
    const fees = {
      THB: {
        withdraw: 10, // 10 บาท
        send: 5      // 5 บาท
      },
      USDT: {
        withdraw: 2,  // 2 USDT
        send: 1       // 1 USDT
      }
    };

    return fees[currency]?.[type] || 0;
  }

  /**
   * Log กิจกรรม
   */
  async logActivity(userId, action, data) {
    try {
      const logEntry = {
        userId: userId,
        action: action,
        data: data,
        timestamp: new Date().toISOString(),
        ip: 'cloudflare_worker'
      };

      const logKey = `log_${userId}_${Date.now()}`;
      await this.auditLogKV.put(logKey, JSON.stringify(logEntry), {
        expirationTtl: 86400 * 90 // เก็บ 90 วัน
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  /**
   * สร้างรายงานสรุป
   */
  async generateSummaryReport(userId) {
    try {
      const wallet = await this.getWallet(userId);
      if (!wallet) {
        return null;
      }

      const today = new Date();
      const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const todayTx = wallet.transactions.filter(tx => 
        new Date(tx.timestamp).toDateString() === today.toDateString()
      ).length;

      const weekTx = wallet.transactions.filter(tx => 
        new Date(tx.timestamp) >= thisWeek
      ).length;

      const monthTx = wallet.transactions.filter(tx => 
        new Date(tx.timestamp) >= thisMonth
      ).length;

      return {
        balances: wallet.balances,
        statistics: wallet.statistics,
        recentActivity: {
          today: todayTx,
          thisWeek: weekTx,
          thisMonth: monthTx
        },
        lastUpdate: wallet.updatedAt
      };
    } catch (error) {
      console.error('Error generating summary:', error);
      return null;
    }
  }
}

/**
 * Currency exchange rates (mock data)
 */
export const EXCHANGE_RATES = {
  USDT_TO_THB: 36.50,
  THB_TO_USDT: 1 / 36.50
};

/**
 * แปลงสกุลเงิน
 */
export function convertCurrency(amount, fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) {
    return parseFloat(amount);
  }

  if (fromCurrency === 'USDT' && toCurrency === 'THB') {
    return parseFloat(amount) * EXCHANGE_RATES.USDT_TO_THB;
  }

  if (fromCurrency === 'THB' && toCurrency === 'USDT') {
    return parseFloat(amount) * EXCHANGE_RATES.THB_TO_USDT;
  }

  return parseFloat(amount);
}

/**
 * จัดรูปแบบเงิน
 */
export function formatCurrency(amount, currency) {
  const num = parseFloat(amount).toFixed(2);
  
  if (currency === 'THB') {
    return `${num} บาท`;
  } else if (currency === 'USDT') {
    return `${num} USDT`;
  }
  
  return `${num} ${currency}`;
}