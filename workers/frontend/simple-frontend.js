/**
 * 🌐 DOGLC Digital Wallet - Simple Frontend Worker
 * Lightweight Frontend for E2E Testing
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }

    // Main page
    if (url.pathname === '/') {
      return new Response(getMainHTML(), {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    // CSS file
    if (url.pathname === '/styles/app.css') {
      return new Response(getCSS(), {
        headers: {
          'Content-Type': 'text/css',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    // JavaScript files
    if (url.pathname === '/js/app.js') {
      return new Response(getAppJS(), {
        headers: {
          'Content-Type': 'application/javascript',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    if (url.pathname === '/js/api.js') {
      return new Response(getAPIJS(), {
        headers: {
          'Content-Type': 'application/javascript',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    // Health check for testing
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'OK',
        message: 'DOGLC Frontend Worker',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    // 404 for other paths
    return new Response('Not Found', { status: 404 });
  }
};

function getMainHTML() {
  return `<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>💰 DOGLC Digital Wallet</title>
    <link rel="stylesheet" href="/styles/app.css">
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
</head>
<body>
    <div class="app-container">
        <!-- Header -->
        <header class="header">
            <h1>💰 DOGLC Digital Wallet</h1>
            <div class="header-info">
                <span class="status-indicator">🟢 Online</span>
                <span class="time" id="currentTime"></span>
            </div>
        </header>

        <!-- Balance Section -->
        <section class="balance-section">
            <div class="balance-card">
                <h2>💳 ยอดเงินคงเหลือ</h2>
                <div class="balance-amount" id="balanceAmount">
                    <span class="currency">THB</span>
                    <span class="amount">12,345.67</span>
                </div>
                <div class="balance-usd" id="balanceUSD">≈ $345.67 USD</div>
            </div>
        </section>

        <!-- Assets Grid -->
        <section class="assets-section">
            <h3>📊 สินทรัพย์ของคุณ</h3>
            <div class="assets-grid">
                <div class="asset-card">
                    <div class="asset-icon">₿</div>
                    <div class="asset-info">
                        <div class="asset-name">Bitcoin</div>
                        <div class="asset-amount">0.00123 BTC</div>
                        <div class="asset-value">฿65,432.10</div>
                    </div>
                </div>
                <div class="asset-card">
                    <div class="asset-icon">Ξ</div>
                    <div class="asset-info">
                        <div class="asset-name">Ethereum</div>
                        <div class="asset-amount">0.5678 ETH</div>
                        <div class="asset-value">฿45,123.45</div>
                    </div>
                </div>
                <div class="asset-card">
                    <div class="asset-icon">🐕</div>
                    <div class="asset-info">
                        <div class="asset-name">DOGLC</div>
                        <div class="asset-amount">1,000 DOGLC</div>
                        <div class="asset-value">฿2,500.00</div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Bottom Navigation -->
        <nav class="bottom-nav">
            <button class="nav-item active" id="portfolio-tab">
                <div class="nav-icon">💼</div>
                <div class="nav-label">Portfolio</div>
            </button>
            <button class="nav-item" id="market-tab">
                <div class="nav-icon">📈</div>
                <div class="nav-label">Market</div>
            </button>
            <button class="nav-item" id="send-tab">
                <div class="nav-icon">📤</div>
                <div class="nav-label">Send</div>
            </button>
            <button class="nav-item" id="receive-tab">
                <div class="nav-icon">📥</div>
                <div class="nav-label">Receive</div>
            </button>
        </nav>
    </div>

    <script src="/js/api.js"></script>
    <script src="/js/app.js"></script>
</body>
</html>`;
}

function getCSS() {
  return `
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #333;
    min-height: 100vh;
    line-height: 1.6;
}

.app-container {
    max-width: 400px;
    margin: 0 auto;
    background: white;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.header {
    background: linear-gradient(45deg, #4CAF50, #45a049);
    color: white;
    padding: 20px;
    text-align: center;
}

.header h1 {
    font-size: 1.5em;
    margin-bottom: 10px;
}

.header-info {
    display: flex;
    justify-content: space-between;
    font-size: 0.9em;
    opacity: 0.9;
}

.balance-section {
    padding: 20px;
}

.balance-card {
    background: linear-gradient(45deg, #2196F3, #1976D2);
    color: white;
    padding: 25px;
    border-radius: 15px;
    text-align: center;
    box-shadow: 0 4px 15px rgba(33, 150, 243, 0.3);
}

.balance-card h2 {
    font-size: 1.1em;
    margin-bottom: 15px;
    opacity: 0.9;
}

.balance-amount {
    display: flex;
    justify-content: center;
    align-items: baseline;
    gap: 10px;
    margin-bottom: 10px;
}

.currency {
    font-size: 1.2em;
    font-weight: bold;
}

.amount {
    font-size: 2.5em;
    font-weight: bold;
}

.balance-usd {
    opacity: 0.8;
    font-size: 1.1em;
}

.assets-section {
    padding: 0 20px 20px;
    flex: 1;
}

.assets-section h3 {
    margin-bottom: 15px;
    color: #333;
}

.assets-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.asset-card {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    padding: 15px;
    display: flex;
    align-items: center;
    gap: 15px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: transform 0.2s ease;
}

.asset-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.asset-icon {
    font-size: 2em;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    border-radius: 50%;
}

.asset-info {
    flex: 1;
}

.asset-name {
    font-weight: bold;
    margin-bottom: 5px;
}

.asset-amount {
    color: #666;
    font-size: 0.9em;
    margin-bottom: 3px;
}

.asset-value {
    color: #4CAF50;
    font-weight: bold;
}

.bottom-nav {
    display: flex;
    background: white;
    border-top: 1px solid #e0e0e0;
    padding: 10px 0;
}

.nav-item {
    flex: 1;
    border: none;
    background: none;
    padding: 10px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease;
}

.nav-item:hover {
    background: #f5f5f5;
}

.nav-item.active {
    color: #2196F3;
}

.nav-icon {
    font-size: 1.5em;
    margin-bottom: 5px;
}

.nav-label {
    font-size: 0.8em;
    font-weight: 500;
}

.status-indicator {
    display: inline-flex;
    align-items: center;
    gap: 5px;
}

@media (max-width: 480px) {
    .app-container {
        max-width: 100%;
    }
    
    .balance-amount .amount {
        font-size: 2em;
    }
}
`;
}

function getAppJS() {
  return `
// 🚀 DOGLC Digital Wallet - Main Application JavaScript

class DoglcWalletApp {
    constructor() {
        this.apiClient = new WalletAPI();
        this.init();
    }

    async init() {
        console.log('🚀 Initializing DOGLC Digital Wallet...');
        
        // Initialize Telegram WebApp
        if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.ready();
            window.Telegram.WebApp.expand();
        }

        // Setup event listeners
        this.setupEventListeners();
        
        // Load initial data
        await this.loadWalletData();
        
        // Start real-time updates
        this.startRealTimeUpdates();
        
        console.log('✅ DOGLC Digital Wallet initialized successfully');
    }

    setupEventListeners() {
        // Navigation tabs
        document.getElementById('portfolio-tab')?.addEventListener('click', () => this.switchTab('portfolio'));
        document.getElementById('market-tab')?.addEventListener('click', () => this.switchTab('market'));
        document.getElementById('send-tab')?.addEventListener('click', () => this.switchTab('send'));
        document.getElementById('receive-tab')?.addEventListener('click', () => this.switchTab('receive'));
        
        // Update time
        setInterval(() => this.updateTime(), 1000);
        
        console.log('📱 Event listeners setup complete');
    }

    async loadWalletData() {
        try {
            console.log('📊 Loading wallet data...');
            
            // Load balance
            const balance = await this.apiClient.getBalance();
            this.updateBalance(balance);
            
            // Load assets
            const assets = await this.apiClient.getAssets();
            this.updateAssets(assets);
            
            console.log('✅ Wallet data loaded successfully');
            
        } catch (error) {
            console.error('❌ Error loading wallet data:', error);
            this.showError('Unable to load wallet data');
        }
    }

    updateBalance(balance) {
        const amountElement = document.querySelector('.balance-amount .amount');
        const usdElement = document.getElementById('balanceUSD');
        
        if (amountElement && balance.thb) {
            amountElement.textContent = this.formatNumber(balance.thb);
        }
        
        if (usdElement && balance.usd) {
            usdElement.textContent = \`≈ $\${this.formatNumber(balance.usd)} USD\`;
        }
    }

    updateAssets(assets) {
        // For demo purposes, we'll keep the static display
        // In a real app, this would dynamically update the assets grid
        console.log('📈 Assets updated:', assets);
    }

    switchTab(tabName) {
        console.log(\`🔄 Switching to \${tabName} tab\`);
        
        // Update active tab
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        document.getElementById(\`\${tabName}-tab\`)?.classList.add('active');
        
        // In a real app, this would change the content area
        this.showTabContent(tabName);
    }

    showTabContent(tabName) {
        switch(tabName) {
            case 'portfolio':
                console.log('📊 Showing portfolio');
                break;
            case 'market':
                console.log('📈 Showing market data');
                break;
            case 'send':
                console.log('📤 Showing send form');
                break;
            case 'receive':
                console.log('📥 Showing receive options');
                break;
        }
    }

    startRealTimeUpdates() {
        // Update every 30 seconds
        setInterval(async () => {
            try {
                await this.loadWalletData();
            } catch (error) {
                console.warn('⚠️ Real-time update failed:', error);
            }
        }, 30000);
        
        console.log('🔄 Real-time updates started');
    }

    updateTime() {
        const timeElement = document.getElementById('currentTime');
        if (timeElement) {
            const now = new Date();
            timeElement.textContent = now.toLocaleTimeString('th-TH');
        }
    }

    formatNumber(num) {
        return new Intl.NumberFormat('th-TH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num);
    }

    showError(message) {
        console.error('❌ Error:', message);
        // In a real app, this would show a toast or modal
        alert(\`Error: \${message}\`);
    }

    showSuccess(message) {
        console.log('✅ Success:', message);
        // In a real app, this would show a success toast
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.doglcApp = new DoglcWalletApp();
});

// Global functions for testing
window.testFrontend = function() {
    console.log('🧪 Testing frontend functionality...');
    return {
        status: 'OK',
        app: window.doglcApp,
        timestamp: new Date().toISOString()
    };
};
`;
}

function getAPIJS() {
  return `
// 🔌 DOGLC Digital Wallet - API Client

class WalletAPI {
    constructor() {
        this.baseURL = 'http://127.0.0.1:8788';
        this.timeout = 5000;
    }

    async request(endpoint, options = {}) {
        const url = \`\${this.baseURL}\${endpoint}\`;
        
        const config = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            timeout: this.timeout,
            ...options
        };

        try {
            console.log(\`🔌 API Request: \${config.method} \${url}\`);
            
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
            }
            
            const data = await response.json();
            console.log(\`✅ API Response: \${endpoint}\`, data);
            
            return data;
            
        } catch (error) {
            console.error(\`❌ API Error: \${endpoint}\`, error);
            throw error;
        }
    }

    // Wallet endpoints
    async getBalance() {
        const response = await this.request('/api/wallet/balance');
        return response.data;
    }

    async getAssets() {
        const response = await this.request('/api/wallet/assets');
        return response.data;
    }

    async getTransactions(limit = 10) {
        const response = await this.request(\`/api/transactions?limit=\${limit}\`);
        return response.data;
    }

    // Market endpoints
    async getMarketData() {
        const response = await this.request('/api/market/trending');
        return response.data;
    }

    // User endpoints
    async getUserProfile() {
        const response = await this.request('/api/user/profile');
        return response.data;
    }

    // Health check
    async healthCheck() {
        const response = await this.request('/');
        return response;
    }
}

class TelegramAPI {
    constructor() {
        this.webApp = window.Telegram?.WebApp;
    }

    isAvailable() {
        return !!this.webApp;
    }

    getUser() {
        return this.webApp?.initDataUnsafe?.user;
    }

    close() {
        this.webApp?.close();
    }

    expand() {
        this.webApp?.expand();
    }

    showAlert(message) {
        this.webApp?.showAlert(message);
    }

    showConfirm(message, callback) {
        this.webApp?.showConfirm(message, callback);
    }
}

// Global API instances
window.WalletAPI = WalletAPI;
window.TelegramAPI = TelegramAPI;

// Global testing functions
window.testAPI = async function() {
    console.log('🧪 Testing API connectivity...');
    
    const api = new WalletAPI();
    const results = {};
    
    try {
        results.health = await api.healthCheck();
        results.balance = await api.getBalance();
        results.assets = await api.getAssets();
        results.market = await api.getMarketData();
        
        console.log('✅ API Test Results:', results);
        return results;
        
    } catch (error) {
        console.error('❌ API Test Failed:', error);
        throw error;
    }
};
`;
}