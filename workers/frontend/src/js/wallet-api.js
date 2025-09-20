/**
 * Wallet API Integration
 * เชื่อมต่อกับ Backend API ของ Digital Wallet
 */

class WalletAPI {
    constructor() {
        this.baseURL = this.getBaseURL();
        this.authToken = null;
        this.user = null;
        
        this.init();
    }

    /**
     * Initialize API
     */
    init() {
        // Get user data from Telegram
        if (window.telegramAPI) {
            this.user = window.telegramAPI.getUserData();
            this.authToken = window.telegramAPI.getInitData();
        }
        
        console.log('Wallet API initialized with base URL:', this.baseURL);
    }

    /**
     * Get Base URL based on environment
     */
    getBaseURL() {
        // Use main bot API endpoints
        const hostname = window.location.hostname;
        
        if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
            return 'http://localhost:8787'; // Local development
        } else if (hostname.includes('staging')) {
            return 'https://doglc-main-bot-staging.your-worker.workers.dev'; // Staging
        } else {
            return 'https://doglc-main-bot.your-worker.workers.dev'; // Production
        }
    }

    /**
     * Make API Request
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const defaultHeaders = {
            'Content-Type': 'application/json',
        };

        // Add authorization if available
        if (this.authToken) {
            defaultHeaders['Authorization'] = `Bearer ${this.authToken}`;
        }

        // Add Telegram user data
        if (this.user?.id) {
            defaultHeaders['X-Telegram-User-Id'] = this.user.id.toString();
        }

        const config = {
            method: 'GET',
            headers: {
                ...defaultHeaders,
                ...options.headers
            },
            ...options
        };

        try {
            console.log('Making API request:', url, config);
            
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('API response:', data);
            
            return data;

        } catch (error) {
            console.error('API request failed:', error);
            
            // Return mock data for development
            if (endpoint.includes('/wallet/balance')) {
                return this.getMockBalance();
            } else if (endpoint.includes('/wallet/assets')) {
                return this.getMockAssets();
            } else if (endpoint.includes('/transactions')) {
                return this.getMockTransactions();
            } else if (endpoint.includes('/market')) {
                return this.getMockMarketData();
            }
            
            throw error;
        }
    }

    /**
     * Get User Profile
     */
    async getUserProfile() {
        return await this.request('/api/user/profile');
    }

    /**
     * Get Wallet Balance
     */
    async getWalletBalance() {
        return await this.request('/api/wallet/balance');
    }

    /**
     * Get Wallet Assets
     */
    async getWalletAssets() {
        return await this.request('/api/wallet/assets');
    }

    /**
     * Get Transaction History
     */
    async getTransactionHistory(limit = 20, offset = 0) {
        return await this.request(`/api/transactions?limit=${limit}&offset=${offset}`);
    }

    /**
     * Get Market Data
     */
    async getMarketData(type = 'trending') {
        return await this.request(`/api/market/${type}`);
    }

    /**
     * Create Deposit Request
     */
    async createDeposit(amount, method = 'bank_transfer') {
        return await this.request('/api/deposit', {
            method: 'POST',
            body: JSON.stringify({
                amount: parseFloat(amount),
                method,
                currency: 'THB'
            })
        });
    }

    /**
     * Create Withdrawal Request
     */
    async createWithdrawal(amount, bankAccount) {
        return await this.request('/api/withdraw', {
            method: 'POST',
            body: JSON.stringify({
                amount: parseFloat(amount),
                bank_account: bankAccount,
                currency: 'THB'
            })
        });
    }

    /**
     * Send Money to Another User
     */
    async sendMoney(recipientId, amount, note = '') {
        return await this.request('/api/send', {
            method: 'POST',
            body: JSON.stringify({
                recipient_id: recipientId,
                amount: parseFloat(amount),
                note,
                currency: 'THB'
            })
        });
    }

    /**
     * Generate QR Code for Receiving Money
     */
    async generateReceiveQR(amount = null) {
        return await this.request('/api/receive/qr', {
            method: 'POST',
            body: JSON.stringify({
                amount: amount ? parseFloat(amount) : null,
                currency: 'THB'
            })
        });
    }

    /**
     * Get Exchange Rates
     */
    async getExchangeRates() {
        return await this.request('/api/exchange/rates');
    }

    /**
     * Update User Settings
     */
    async updateSettings(settings) {
        return await this.request('/api/user/settings', {
            method: 'PUT',
            body: JSON.stringify(settings)
        });
    }

    /**
     * Upload Document for Verification
     */
    async uploadDocument(file, type = 'id_card') {
        const formData = new FormData();
        formData.append('document', file);
        formData.append('type', type);

        return await this.request('/api/user/documents', {
            method: 'POST',
            headers: {}, // Remove Content-Type to let browser set it
            body: formData
        });
    }

    /**
     * Get VIP Status
     */
    async getVIPStatus() {
        return await this.request('/api/user/vip');
    }

    /**
     * Get Supported Banks
     */
    async getSupportedBanks() {
        return await this.request('/api/banks');
    }

    // Mock Data Methods (for development)
    
    getMockBalance() {
        return {
            success: true,
            data: {
                balance: 15847.50,
                currency: 'THB',
                change_24h: 2.45,
                change_percentage: 0.016
            }
        };
    }

    getMockAssets() {
        return {
            success: true,
            data: [
                {
                    id: 'thb',
                    name: 'Thai Baht',
                    symbol: 'THB',
                    amount: 15847.50,
                    value_usd: 450.25,
                    change_24h: 0.016,
                    icon: '🇹🇭'
                },
                {
                    id: 'usd',
                    name: 'US Dollar',
                    symbol: 'USD',
                    amount: 125.30,
                    value_usd: 125.30,
                    change_24h: -0.002,
                    icon: '🇺🇸'
                }
            ]
        };
    }

    getMockTransactions() {
        return {
            success: true,
            data: [
                {
                    id: 'tx001',
                    type: 'deposit',
                    amount: 1000.00,
                    currency: 'THB',
                    status: 'completed',
                    created_at: new Date(Date.now() - 86400000).toISOString(),
                    description: 'Bank Transfer Deposit'
                },
                {
                    id: 'tx002',
                    type: 'send',
                    amount: -250.00,
                    currency: 'THB',
                    status: 'completed',
                    created_at: new Date(Date.now() - 172800000).toISOString(),
                    description: 'Sent to @friend123'
                },
                {
                    id: 'tx003',
                    type: 'receive',
                    amount: 500.00,
                    currency: 'THB',
                    status: 'completed',
                    created_at: new Date(Date.now() - 259200000).toISOString(),
                    description: 'Received from @family456'
                }
            ]
        };
    }

    getMockMarketData() {
        return {
            success: true,
            data: [
                {
                    id: 'thb_usd',
                    name: 'THB/USD',
                    symbol: 'THBUSD',
                    price: 0.0284,
                    change_24h: -0.0023,
                    change_percentage: -0.81,
                    volume_24h: 1234567
                },
                {
                    id: 'btc_thb',
                    name: 'Bitcoin',
                    symbol: 'BTC',
                    price: 1547820.50,
                    change_24h: 52341.20,
                    change_percentage: 3.5,
                    volume_24h: 987654321
                }
            ]
        };
    }

    /**
     * Format Currency
     */
    formatCurrency(amount, currency = 'THB') {
        const formatter = new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        
        return formatter.format(amount);
    }

    /**
     * Format Percentage
     */
    formatPercentage(value) {
        const sign = value >= 0 ? '+' : '';
        return `${sign}${(value * 100).toFixed(2)}%`;
    }

    /**
     * Format Date
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Validate Amount
     */
    validateAmount(amount) {
        const numAmount = parseFloat(amount);
        
        if (isNaN(numAmount) || numAmount <= 0) {
            throw new Error('Invalid amount');
        }
        
        if (numAmount > 1000000) {
            throw new Error('Amount exceeds maximum limit');
        }
        
        return numAmount;
    }

    /**
     * Validate Bank Account
     */
    validateBankAccount(account) {
        if (!account.bank_code || !account.account_number || !account.account_name) {
            throw new Error('Incomplete bank account information');
        }
        
        if (account.account_number.length < 10) {
            throw new Error('Invalid account number');
        }
        
        return account;
    }
}

// Create global instance
window.walletAPI = new WalletAPI();

export default WalletAPI;