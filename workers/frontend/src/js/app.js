/**
 * Main Application JavaScript
 * จัดการ UI interactions และ app logic
 */

class DigitalWalletApp {
    constructor() {
        this.currentTab = 'portfolio';
        this.isLoading = false;
        this.refreshInterval = null;
        
        this.init();
    }

    /**
     * Initialize Application
     */
    async init() {
        console.log('🚀 Initializing Digital Wallet App...');
        
        try {
            // Wait for APIs to be ready
            await this.waitForAPIs();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Setup user interface
            this.setupUserInterface();
            
            // Load initial data
            await this.loadInitialData();
            
            // Start auto refresh
            this.startAutoRefresh();
            
            console.log('✅ Digital Wallet App initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize app:', error);
            this.showToast('Failed to initialize app. Please try again.', 'error');
        }
    }

    /**
     * Wait for APIs to be ready
     */
    async waitForAPIs() {
        let attempts = 0;
        const maxAttempts = 10;
        
        while ((!window.telegramAPI || !window.walletAPI) && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.telegramAPI || !window.walletAPI) {
            throw new Error('APIs not available');
        }
    }

    /**
     * Setup Event Listeners
     */
    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab, .nav-item').forEach(element => {
            element.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                if (tab) {
                    this.switchTab(tab);
                }
            });
        });

        // Action buttons
        this.setupActionButtons();
        
        // Settings toggles
        this.setupSettingsToggles();
        
        // Language selection
        this.setupLanguageSelection();
        
        // Pull to refresh
        this.setupPullToRefresh();
        
        // Keyboard shortcuts
        this.setupKeyboardShortcuts();
    }

    /**
     * Setup Action Buttons
     */
    setupActionButtons() {
        // Asset cards
        document.querySelectorAll('.asset-card').forEach(card => {
            card.addEventListener('click', () => {
                const assetId = card.dataset.assetId;
                this.viewAssetDetails(assetId);
            });
        });

        // Market items
        document.addEventListener('click', (e) => {
            if (e.target.closest('.market-item')) {
                const item = e.target.closest('.market-item');
                const symbol = item.dataset.symbol;
                this.viewMarketDetails(symbol);
            }
        });

        // Quick actions
        document.addEventListener('click', (e) => {
            if (e.target.closest('.quick-action')) {
                const action = e.target.closest('.quick-action');
                const actionType = action.dataset.action;
                this.handleQuickAction(actionType);
            }
        });
    }

    /**
     * Setup Settings Toggles
     */
    setupSettingsToggles() {
        const notificationsToggle = document.getElementById('notifications-toggle');
        const darkModeToggle = document.getElementById('dark-mode-toggle');

        if (notificationsToggle) {
            notificationsToggle.addEventListener('change', (e) => {
                this.toggleNotifications(e.target.checked);
            });
        }

        if (darkModeToggle) {
            darkModeToggle.addEventListener('change', (e) => {
                this.toggleDarkMode(e.target.checked);
            });
        }
    }

    /**
     * Setup Language Selection
     */
    setupLanguageSelection() {
        document.querySelectorAll('.language-option').forEach(option => {
            option.addEventListener('click', () => {
                const lang = option.dataset.lang;
                this.changeLanguage(lang);
            });
        });
    }

    /**
     * Setup Pull to Refresh
     */
    setupPullToRefresh() {
        let startY = 0;
        let currentY = 0;
        let isPulling = false;

        document.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
        });

        document.addEventListener('touchmove', (e) => {
            currentY = e.touches[0].clientY;
            const diff = currentY - startY;

            if (diff > 0 && window.scrollY === 0) {
                isPulling = true;
                e.preventDefault();
                
                if (diff > 100) {
                    document.body.style.transform = `translateY(${Math.min(diff * 0.3, 50)}px)`;
                }
            }
        });

        document.addEventListener('touchend', () => {
            if (isPulling && currentY - startY > 100) {
                this.refreshData();
            }
            
            document.body.style.transform = '';
            isPulling = false;
        });
    }

    /**
     * Setup Keyboard Shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'r':
                        e.preventDefault();
                        this.refreshData();
                        break;
                    case '1':
                        e.preventDefault();
                        this.switchTab('portfolio');
                        break;
                    case '2':
                        e.preventDefault();
                        this.switchTab('market');
                        break;
                    case '3':
                        e.preventDefault();
                        this.switchTab('transactions');
                        break;
                    case '4':
                        e.preventDefault();
                        this.switchTab('settings');
                        break;
                }
            }
        });
    }

    /**
     * Setup User Interface
     */
    setupUserInterface() {
        // Update user info
        this.updateUserInfo();
        
        // Setup theme
        this.setupTheme();
        
        // Setup navigation
        this.setupNavigation();
    }

    /**
     * Update User Info
     */
    updateUserInfo() {
        const user = window.telegramAPI?.getUserData();
        
        if (user) {
            const userName = document.getElementById('user-name');
            const userAvatar = document.getElementById('user-avatar');
            
            if (userName) {
                userName.textContent = user.first_name + (user.last_name ? ` ${user.last_name}` : '');
            }
            
            if (userAvatar) {
                const initials = (user.first_name.charAt(0) + (user.last_name?.charAt(0) || '')).toUpperCase();
                userAvatar.textContent = initials;
            }
        }
    }

    /**
     * Setup Theme
     */
    setupTheme() {
        const colorScheme = window.telegramAPI?.getColorScheme() || 'dark';
        this.updateTheme(colorScheme);
    }

    /**
     * Setup Navigation
     */
    setupNavigation() {
        // Show/hide back button based on tab
        this.updateBackButton();
    }

    /**
     * Load Initial Data
     */
    async loadInitialData() {
        this.setLoading(true);
        
        try {
            // Load data for current tab
            await this.loadTabData(this.currentTab);
            
        } catch (error) {
            console.error('Failed to load initial data:', error);
            this.showToast('Failed to load data. Using offline mode.', 'warning');
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Load Tab Data
     */
    async loadTabData(tab) {
        switch (tab) {
            case 'portfolio':
                await this.loadPortfolioData();
                break;
            case 'market':
                await this.loadMarketData();
                break;
            case 'transactions':
                await this.loadTransactionData();
                break;
            case 'settings':
                await this.loadSettingsData();
                break;
        }
    }

    /**
     * Load Portfolio Data
     */
    async loadPortfolioData() {
        try {
            // Load balance
            const balanceData = await window.walletAPI.getWalletBalance();
            this.updateBalance(balanceData.data);
            
            // Load assets
            const assetsData = await window.walletAPI.getWalletAssets();
            this.updateAssets(assetsData.data);
            
            // Load portfolio chart
            this.updatePortfolioChart();
            
        } catch (error) {
            console.error('Failed to load portfolio data:', error);
        }
    }

    /**
     * Load Market Data
     */
    async loadMarketData() {
        try {
            const marketData = await window.walletAPI.getMarketData('trending');
            this.updateMarketList(marketData.data);
            
        } catch (error) {
            console.error('Failed to load market data:', error);
        }
    }

    /**
     * Load Transaction Data
     */
    async loadTransactionData() {
        try {
            const transactionData = await window.walletAPI.getTransactionHistory();
            this.updateTransactionList(transactionData.data);
            
        } catch (error) {
            console.error('Failed to load transaction data:', error);
        }
    }

    /**
     * Load Settings Data
     */
    async loadSettingsData() {
        try {
            const user = window.telegramAPI?.getUserData();
            
            if (user) {
                // Update settings based on user preferences
                this.updateSettingsUI(user);
            }
            
        } catch (error) {
            console.error('Failed to load settings data:', error);
        }
    }

    /**
     * Switch Tab
     */
    switchTab(tabName) {
        if (this.currentTab === tabName) return;
        
        // Haptic feedback
        window.telegramAPI?.hapticFeedback('selection');
        
        // Hide current tab
        const currentTabContent = document.getElementById(`${this.currentTab}-tab`);
        if (currentTabContent) {
            currentTabContent.classList.remove('active');
        }
        
        // Remove active class from current tab buttons
        document.querySelectorAll('.tab.active, .nav-item.active').forEach(element => {
            element.classList.remove('active');
        });
        
        // Show new tab
        const newTabContent = document.getElementById(`${tabName}-tab`);
        if (newTabContent) {
            newTabContent.classList.add('active');
        }
        
        // Add active class to new tab buttons
        document.querySelectorAll(`[data-tab="${tabName}"]`).forEach(element => {
            element.classList.add('active');
        });
        
        // Update current tab
        this.currentTab = tabName;
        
        // Load tab data if not loaded
        this.loadTabData(tabName);
        
        // Update back button
        this.updateBackButton();
    }

    /**
     * Update Balance
     */
    updateBalance(balanceData) {
        const balanceElement = document.getElementById('total-balance');
        const changeElement = document.getElementById('balance-change');
        
        if (balanceElement && balanceData) {
            balanceElement.textContent = window.walletAPI.formatCurrency(balanceData.balance);
        }
        
        if (changeElement && balanceData) {
            const changeSpan = changeElement.querySelector('span');
            if (changeSpan) {
                changeSpan.textContent = window.walletAPI.formatPercentage(balanceData.change_percentage);
            }
            
            changeElement.className = `balance-change ${balanceData.change_percentage >= 0 ? 'positive' : 'negative'}`;
        }
    }

    /**
     * Update Assets
     */
    updateAssets(assets) {
        const assetsGrid = document.getElementById('assets-grid');
        if (!assetsGrid || !assets) return;
        
        assetsGrid.innerHTML = assets.map(asset => `
            <div class="asset-card" data-asset-id="${asset.id}">
                <div class="asset-icon" style="background: linear-gradient(135deg, var(--primary), var(--accent));">
                    ${asset.icon}
                </div>
                <div class="asset-details">
                    <div class="asset-name">${asset.name}</div>
                    <div class="asset-amount">${asset.amount} ${asset.symbol}</div>
                </div>
                <div class="asset-value">
                    <div class="asset-price">$${asset.value_usd.toFixed(2)}</div>
                    <div class="asset-change ${asset.change_24h >= 0 ? 'positive' : 'negative'}">
                        ${window.walletAPI.formatPercentage(asset.change_24h)}
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Update Market List
     */
    updateMarketList(marketData) {
        const marketList = document.getElementById('market-list');
        if (!marketList || !marketData) return;
        
        marketList.innerHTML = marketData.map(item => `
            <div class="market-item" data-symbol="${item.symbol}">
                <div class="market-icon">
                    ${item.symbol.substring(0, 2)}
                </div>
                <div class="market-details">
                    <div class="market-name">${item.name}</div>
                    <div class="market-symbol">${item.symbol}</div>
                </div>
                <div class="market-price">
                    <div>${window.walletAPI.formatCurrency(item.price)}</div>
                    <div class="market-change ${item.change_percentage >= 0 ? 'positive' : 'negative'}">
                        ${window.walletAPI.formatPercentage(item.change_percentage / 100)}
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Update Transaction List
     */
    updateTransactionList(transactions) {
        const transactionList = document.getElementById('transaction-list');
        if (!transactionList || !transactions) return;
        
        transactionList.innerHTML = transactions.map(tx => `
            <div class="transaction-item">
                <div class="transaction-icon ${tx.type}">
                    ${this.getTransactionIcon(tx.type)}
                </div>
                <div class="transaction-details">
                    <div class="transaction-title">${tx.description}</div>
                    <div class="transaction-date">${window.walletAPI.formatDate(tx.created_at)}</div>
                </div>
                <div class="transaction-amount ${tx.amount >= 0 ? 'positive' : 'negative'}">
                    ${tx.amount >= 0 ? '+' : ''}${window.walletAPI.formatCurrency(Math.abs(tx.amount))}
                </div>
            </div>
        `).join('');
    }

    /**
     * Get Transaction Icon
     */
    getTransactionIcon(type) {
        const icons = {
            deposit: '<i class="fas fa-arrow-down"></i>',
            withdraw: '<i class="fas fa-arrow-up"></i>',
            send: '<i class="fas fa-paper-plane"></i>',
            receive: '<i class="fas fa-arrow-down"></i>',
            exchange: '<i class="fas fa-exchange-alt"></i>'
        };
        
        return icons[type] || '<i class="fas fa-circle"></i>';
    }

    /**
     * Update Portfolio Chart
     */
    updatePortfolioChart() {
        const canvas = document.getElementById('portfolio-chart');
        if (!canvas) return;
        
        // Simple chart implementation
        // In production, you might want to use a charting library like Chart.js
        const ctx = canvas.getContext('2d');
        const width = canvas.width = canvas.offsetWidth;
        const height = canvas.height = canvas.offsetHeight;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Draw simple line chart
        this.drawSimpleChart(ctx, width, height);
    }

    /**
     * Draw Simple Chart
     */
    drawSimpleChart(ctx, width, height) {
        // Mock data points
        const dataPoints = [];
        for (let i = 0; i < 30; i++) {
            dataPoints.push(Math.random() * 100 + 50);
        }
        
        // Set line style
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Draw line
        ctx.beginPath();
        dataPoints.forEach((point, index) => {
            const x = (index / (dataPoints.length - 1)) * width;
            const y = height - (point / 150) * height;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();
        
        // Draw area under the line
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = '#3b82f6';
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    /**
     * Refresh Data
     */
    async refreshData() {
        if (this.isLoading) return;
        
        this.setLoading(true);
        this.showToast('Refreshing data...', 'info');
        
        try {
            await this.loadTabData(this.currentTab);
            this.showToast('Data refreshed successfully', 'success');
            
        } catch (error) {
            console.error('Failed to refresh data:', error);
            this.showToast('Failed to refresh data', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Start Auto Refresh
     */
    startAutoRefresh() {
        // Refresh data every 30 seconds
        this.refreshInterval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                this.refreshData();
            }
        }, 30000);
    }

    /**
     * Stop Auto Refresh
     */
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    /**
     * Set Loading State
     */
    setLoading(loading) {
        this.isLoading = loading;
        
        // Update UI to show loading state
        document.querySelectorAll('.loading-indicator').forEach(indicator => {
            indicator.style.display = loading ? 'block' : 'none';
        });
    }

    /**
     * Show Toast Notification
     */
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        if (!toast) return;
        
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.style.opacity = '1';
        toast.style.visibility = 'visible';
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.visibility = 'hidden';
        }, 3000);
    }

    /**
     * Update Back Button
     */
    updateBackButton() {
        if (this.currentTab === 'portfolio') {
            window.telegramAPI?.hideBackButton();
        } else {
            window.telegramAPI?.showBackButton();
        }
    }

    /**
     * Update Theme
     */
    updateTheme(colorScheme) {
        if (colorScheme === 'dark') {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
    }

    // Action Handlers

    async depositMoney() {
        window.telegramAPI?.hapticFeedback('impact');
        this.showToast('Opening deposit interface...', 'info');
        // Implement deposit flow
    }

    async withdrawMoney() {
        window.telegramAPI?.hapticFeedback('impact');
        this.showToast('Opening withdrawal interface...', 'info');
        // Implement withdrawal flow
    }

    async sendMoney() {
        window.telegramAPI?.hapticFeedback('impact');
        this.showToast('Opening send money interface...', 'info');
        // Implement send money flow
    }

    async receiveMoney() {
        window.telegramAPI?.hapticFeedback('impact');
        this.showToast('Generating QR code...', 'info');
        // Implement receive money flow
    }

    // Settings Handlers

    toggleNotifications(enabled) {
        console.log('Notifications toggled:', enabled);
        this.showToast(`Notifications ${enabled ? 'enabled' : 'disabled'}`, 'success');
    }

    toggleDarkMode(enabled) {
        console.log('Dark mode toggled:', enabled);
        this.updateTheme(enabled ? 'dark' : 'light');
        this.showToast(`Dark mode ${enabled ? 'enabled' : 'disabled'}`, 'success');
    }

    changeLanguage(lang) {
        console.log('Language changed to:', lang);
        
        // Update UI to show selected language
        document.querySelectorAll('.language-option').forEach(option => {
            const check = option.querySelector('.language-check');
            if (option.dataset.lang === lang) {
                check.innerHTML = '<i class="fas fa-check"></i>';
            } else {
                check.innerHTML = '';
            }
        });
        
        this.showToast('Language updated successfully', 'success');
    }

    // Cleanup
    destroy() {
        this.stopAutoRefresh();
        
        // Remove event listeners
        // (In a real app, you'd keep track of listeners to remove them)
    }
}

// Function to show/hide notification dot
function toggleNotificationDot(show) {
    const notificationDot = document.getElementById('notification-dot');
    if (notificationDot) {
        notificationDot.classList.toggle('active', show);
    }
}

// Global action functions (called from HTML)
window.depositMoney = () => window.app?.depositMoney();
window.withdrawMoney = () => window.app?.withdrawMoney();
window.sendMoney = () => window.app?.sendMoney();
window.receiveMoney = () => window.app?.receiveMoney();

window.showNotifications = () => {
    window.app?.showToast('Notifications feature coming soon!', 'info');
};

window.toggleDarkMode = () => {
    const toggle = document.getElementById('dark-mode-toggle');
    if (toggle) {
        toggle.checked = !toggle.checked;
        window.app?.toggleDarkMode(toggle.checked);
    }
};

window.exportData = () => {
    window.app?.showToast('Export feature coming soon!', 'info');
};

window.supportChat = () => {
    window.app?.showToast('Opening support chat...', 'info');
};

window.about = () => {
    window.app?.showToast('DOGLC Digital Wallet v1.0', 'info');
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new DigitalWalletApp();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        window.app?.refreshData();
    }
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    window.app?.destroy();
});

export default DigitalWalletApp;