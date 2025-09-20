/**
 * Wallet API Client
 * เชื่อมต่อกับ Backend API v2
 */
class WalletAPI {
    constructor() {
        this.baseURL = 'http://127.0.0.1:8788';
        this.timeout = 10000; // 10 seconds
    }

    /**
     * Make API request with error handling
     */
    async request(endpoint, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                signal: controller.signal,
                ...options
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'API request failed');
            }

            return data;
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            
            throw error;
        }
    }

    /**
     * Get wallet balance
     */
    async getWalletBalance() {
        return await this.request('/api/wallet/balance');
    }

    /**
     * Get wallet assets
     */
    async getWalletAssets() {
        return await this.request('/api/wallet/assets');
    }

    /**
     * Get market data
     */
    async getMarketData(category = 'trending') {
        return await this.request(`/api/market/${category}`);
    }

    /**
     * Get transaction history
     */
    async getTransactionHistory(options = {}) {
        const params = new URLSearchParams();
        
        if (options.limit) params.append('limit', options.limit);
        if (options.offset) params.append('offset', options.offset);
        if (options.type) params.append('type', options.type);
        
        const queryString = params.toString();
        const endpoint = `/api/transactions${queryString ? '?' + queryString : ''}`;
        
        return await this.request(endpoint);
    }

    /**
     * Get user profile
     */
    async getUserProfile() {
        return await this.request('/api/user/profile');
    }

    /**
     * Validate Telegram init data
     */
    async validateTelegramUser(initData) {
        return await this.request('/api/telegram/validate', {
            method: 'POST',
            headers: {
                'X-Telegram-Init-Data': initData
            }
        });
    }

    /**
     * Format currency amount
     */
    formatCurrency(amount, currency = 'THB') {
        if (currency === 'THB') {
            return new Intl.NumberFormat('th-TH', {
                style: 'currency',
                currency: 'THB'
            }).format(amount);
        }
        
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    /**
     * Format percentage
     */
    formatPercentage(value) {
        const sign = value >= 0 ? '+' : '';
        return `${sign}${value.toFixed(2)}%`;
    }

    /**
     * Format date
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }
}

/**
 * Telegram WebApp API Client
 */
class TelegramAPI {
    constructor() {
        this.webApp = window.Telegram?.WebApp;
        this.isAvailable = !!this.webApp;
    }

    /**
     * Initialize Telegram WebApp
     */
    init() {
        if (!this.isAvailable) {
            console.warn('Telegram WebApp not available');
            return;
        }

        this.webApp.ready();
        this.webApp.expand();
    }

    /**
     * Get user data from Telegram
     */
    getUserData() {
        if (!this.isAvailable) {
            return {
                id: 123456789,
                first_name: 'Test',
                last_name: 'User',
                username: 'test_user'
            };
        }

        return this.webApp.initDataUnsafe?.user;
    }

    /**
     * Get color scheme
     */
    getColorScheme() {
        if (!this.isAvailable) return 'dark';
        return this.webApp.colorScheme;
    }

    /**
     * Show/hide back button
     */
    showBackButton() {
        if (this.isAvailable) {
            this.webApp.BackButton.show();
        }
    }

    hideBackButton() {
        if (this.isAvailable) {
            this.webApp.BackButton.hide();
        }
    }

    /**
     * Haptic feedback
     */
    hapticFeedback(type = 'impact') {
        if (!this.isAvailable) return;
        
        if (type === 'impact') {
            this.webApp.HapticFeedback.impactOccurred('medium');
        } else if (type === 'selection') {
            this.webApp.HapticFeedback.selectionChanged();
        }
    }

    /**
     * Close WebApp
     */
    close() {
        if (this.isAvailable) {
            this.webApp.close();
        }
    }
}

// Initialize global APIs
window.walletAPI = new WalletAPI();
window.telegramAPI = new TelegramAPI();

// Initialize Telegram WebApp
if (window.telegramAPI.isAvailable) {
    window.telegramAPI.init();
}