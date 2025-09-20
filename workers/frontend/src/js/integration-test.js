/**
 * Integration Test Script
 * ทดสอบการทำงานระหว่าง Frontend และ Backend
 */

class IntegrationTester {
    constructor() {
        this.results = [];
        this.passed = 0;
        this.failed = 0;
    }

    /**
     * Run all integration tests
     */
    async runAllTests() {
        console.log('🧪 Starting Integration Tests...');
        this.results = [];
        this.passed = 0;
        this.failed = 0;

        // Test API Connectivity
        await this.testAPIConnectivity();
        
        // Test Data Flow
        await this.testDataFlow();
        
        // Test UI Updates
        await this.testUIUpdates();
        
        // Test Error Handling
        await this.testErrorHandling();

        // Display results
        this.displayResults();
    }

    /**
     * Test API connectivity
     */
    async testAPIConnectivity() {
        console.log('🔌 Testing API Connectivity...');
        
        try {
            // Test health check
            const health = await window.walletAPI.request('/');
            this.addResult('API Health Check', health.status === 'OK', health.message);
            
            // Test wallet balance
            const balance = await window.walletAPI.getWalletBalance();
            this.addResult('Wallet Balance API', balance.success && balance.data, 
                `Balance: ${balance.data?.balance} ${balance.data?.currency}`);
            
            // Test assets
            const assets = await window.walletAPI.getWalletAssets();
            this.addResult('Wallet Assets API', assets.success && Array.isArray(assets.data), 
                `${assets.data?.length} assets loaded`);
            
            // Test market data
            const market = await window.walletAPI.getMarketData('trending');
            this.addResult('Market Data API', market.success && Array.isArray(market.data), 
                `${market.data?.length} market items loaded`);
            
            // Test transactions
            const transactions = await window.walletAPI.getTransactionHistory({ limit: 5 });
            this.addResult('Transactions API', transactions.success && Array.isArray(transactions.data), 
                `${transactions.data?.length} transactions loaded`);
                
        } catch (error) {
            this.addResult('API Connectivity', false, error.message);
        }
    }

    /**
     * Test data flow between frontend and backend
     */
    async testDataFlow() {
        console.log('🔄 Testing Data Flow...');
        
        try {
            // Test if data flows to UI elements
            const app = window.app;
            if (!app) {
                this.addResult('App Instance', false, 'App not initialized');
                return;
            }

            // Load portfolio data
            await app.loadPortfolioData();
            
            // Check if balance updated
            const balanceElement = document.getElementById('total-balance');
            const hasBalanceData = balanceElement && balanceElement.textContent !== '฿0.00';
            this.addResult('Balance Data Flow', hasBalanceData, 
                `Balance element: ${balanceElement?.textContent}`);
            
            // Check if assets updated
            const assetsGrid = document.getElementById('assets-grid');
            const hasAssetsData = assetsGrid && assetsGrid.children.length > 0;
            this.addResult('Assets Data Flow', hasAssetsData, 
                `${assetsGrid?.children.length || 0} asset cards rendered`);

        } catch (error) {
            this.addResult('Data Flow', false, error.message);
        }
    }

    /**
     * Test UI updates
     */
    async testUIUpdates() {
        console.log('🎨 Testing UI Updates...');
        
        try {
            const app = window.app;
            
            // Test tab switching
            app.switchTab('market');
            const marketTab = document.getElementById('market-tab');
            const isMarketActive = marketTab && marketTab.classList.contains('active');
            this.addResult('Tab Switching', isMarketActive, 'Market tab activated');
            
            // Load market data
            await app.loadMarketData();
            
            // Check if market list updated
            const marketList = document.getElementById('market-list');
            const hasMarketData = marketList && marketList.children.length > 0;
            this.addResult('Market UI Update', hasMarketData, 
                `${marketList?.children.length || 0} market items rendered`);
            
            // Test transaction tab
            app.switchTab('transactions');
            await app.loadTransactionData();
            
            const transactionList = document.getElementById('transaction-list');
            const hasTransactionData = transactionList && transactionList.children.length > 0;
            this.addResult('Transaction UI Update', hasTransactionData, 
                `${transactionList?.children.length || 0} transaction items rendered`);
                
            // Switch back to portfolio
            app.switchTab('portfolio');

        } catch (error) {
            this.addResult('UI Updates', false, error.message);
        }
    }

    /**
     * Test error handling
     */
    async testErrorHandling() {
        console.log('⚠️ Testing Error Handling...');
        
        try {
            // Test invalid endpoint
            try {
                await window.walletAPI.request('/invalid-endpoint');
                this.addResult('404 Error Handling', false, 'Should have thrown error');
            } catch (error) {
                this.addResult('404 Error Handling', true, 'Correctly handled 404 error');
            }
            
            // Test network timeout (simulate)
            const originalTimeout = window.walletAPI.timeout;
            window.walletAPI.timeout = 1; // 1ms timeout
            
            try {
                await window.walletAPI.getWalletBalance();
                this.addResult('Timeout Handling', false, 'Should have timed out');
            } catch (error) {
                this.addResult('Timeout Handling', error.message.includes('timeout'), 
                    'Correctly handled timeout');
            }
            
            // Restore timeout
            window.walletAPI.timeout = originalTimeout;

        } catch (error) {
            this.addResult('Error Handling', false, error.message);
        }
    }

    /**
     * Add test result
     */
    addResult(testName, passed, message) {
        this.results.push({
            name: testName,
            passed,
            message,
            timestamp: new Date().toISOString()
        });
        
        if (passed) {
            this.passed++;
            console.log(`✅ ${testName}: ${message}`);
        } else {
            this.failed++;
            console.log(`❌ ${testName}: ${message}`);
        }
    }

    /**
     * Display test results
     */
    displayResults() {
        const total = this.passed + this.failed;
        const passRate = ((this.passed / total) * 100).toFixed(1);
        
        console.log('\n📊 Integration Test Results:');
        console.log(`Total Tests: ${total}`);
        console.log(`Passed: ${this.passed}`);
        console.log(`Failed: ${this.failed}`);
        console.log(`Pass Rate: ${passRate}%`);
        
        // Show detailed results
        console.log('\n📋 Detailed Results:');
        this.results.forEach(result => {
            const icon = result.passed ? '✅' : '❌';
            console.log(`${icon} ${result.name}: ${result.message}`);
        });
        
        // Update UI if test result element exists
        const resultElement = document.getElementById('integration-test-results');
        if (resultElement) {
            resultElement.innerHTML = `
                <h3>Integration Test Results</h3>
                <p>Pass Rate: ${passRate}% (${this.passed}/${total})</p>
                <ul>
                    ${this.results.map(result => 
                        `<li class="${result.passed ? 'success' : 'error'}">
                            ${result.passed ? '✅' : '❌'} ${result.name}: ${result.message}
                        </li>`
                    ).join('')}
                </ul>
            `;
        }
        
        // Show toast notification
        if (window.app && window.app.showToast) {
            const message = `Integration Tests: ${passRate}% pass rate (${this.passed}/${total})`;
            window.app.showToast(message, passRate > 80 ? 'success' : 'warning');
        }
    }
}

// Global integration tester
window.integrationTester = new IntegrationTester();

// Auto-run tests when app is ready (with delay)
setTimeout(() => {
    if (window.app && window.walletAPI) {
        console.log('🚀 Auto-running integration tests...');
        window.integrationTester.runAllTests();
    }
}, 5000); // Wait 5 seconds after page load