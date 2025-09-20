# 🎯 Mini App Development Guide

## 📋 Quick Start สำหรับ Mini App

### 🚀 **ใช้ระบบที่มีอยู่เป็น Backend**
```
✅ Telegram Bot (ครบระบบ) → Backend API
✅ Cloudflare Workers → Serverless infrastructure  
✅ D1 Database → Data storage
✅ OCR + Gmail → Automated verification
✅ Multi-language → 6 ภาษาพร้อมใช้
```

---

## 🎨 Frontend Mini App Architecture

### **📱 Telegram Mini App Structure**
```
mini-app/
├── 📦 package.json
├── ⚙️ vite.config.js
├── 🌐 index.html
├── 📁 src/
│   ├── 🎮 main.js              # Entry point
│   ├── 🎯 App.vue/App.jsx      # Main component
│   ├── 📂 components/          # UI components
│   │   ├── 💰 Wallet.vue       # Wallet dashboard
│   │   ├── 📈 Transactions.vue  # Transaction history
│   │   ├── 💸 Deposit.vue      # Deposit flow
│   │   ├── 💎 Withdraw.vue     # Withdraw flow
│   │   ├── 👑 VIP.vue          # VIP management
│   │   └── ⚙️ Settings.vue     # User settings
│   ├── 📂 admin/               # Admin interface
│   │   ├── 📊 Dashboard.vue    # Admin dashboard
│   │   ├── 👥 Users.vue        # User management
│   │   ├── 💰 Transactions.vue # Transaction control
│   │   ├── 🤖 OCR.vue          # OCR monitoring
│   │   └── 📈 Analytics.vue    # Analytics
│   ├── 📂 services/            # API services
│   │   ├── 🔗 api.js           # API client
│   │   ├── 🔐 auth.js          # Authentication
│   │   └── 🌐 telegram.js      # Telegram WebApp SDK
│   ├── 📂 stores/              # State management
│   │   ├── 👤 user.js          # User state
│   │   ├── 💰 wallet.js        # Wallet state
│   │   └── 🎛️ admin.js         # Admin state
│   └── 📂 locales/             # Multi-language
│       ├── 🇹🇭 th.json         # Thai
│       ├── 🇺🇸 en.json         # English
│       ├── 🇨🇳 zh.json         # Chinese
│       ├── 🇰🇷 ko.json         # Korean
│       ├── 🇮🇩 id.json         # Indonesian
│       └── 🇰🇭 km.json         # Khmer
```

---

## 🔗 API Integration Pattern

### **🎯 API Service Structure**
```javascript
// services/api.js
class WalletAPI {
  constructor() {
    this.baseURL = 'https://doglc-digital-wallet.your-domain.workers.dev';
    this.telegram = window.Telegram.WebApp;
  }

  // User endpoints
  async getUser() {
    return this.request('/api/user', { 
      userId: this.telegram.initDataUnsafe.user.id 
    });
  }

  async getBalance() {
    return this.request('/api/wallet/balance');
  }

  // Transaction endpoints
  async getTransactions(filters = {}) {
    return this.request('/api/transactions', filters);
  }

  async deposit(amount, bankCode) {
    return this.request('/api/deposit', { amount, bankCode });
  }

  async withdraw(amount, currency, address) {
    return this.request('/api/withdraw', { amount, currency, address });
  }

  // Exchange endpoints
  async getExchangeRate() {
    return this.request('/api/exchange-rate');
  }

  async convertCurrency(amount, from, to) {
    return this.request('/api/convert', { amount, from, to });
  }

  // Admin endpoints (role-based access)
  async getAdminDashboard() {
    return this.request('/api/admin/dashboard');
  }

  async getOCRStats() {
    return this.request('/api/admin/ocr/stats');
  }

  async approveTrans action(transactionId) {
    return this.request('/api/admin/approve', { transactionId });
  }
}
```

### **🔐 Authentication Pattern**
```javascript
// services/auth.js
class TelegramAuth {
  constructor() {
    this.webApp = window.Telegram.WebApp;
    this.user = this.webApp.initDataUnsafe.user;
  }

  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.webApp.initData}`,
      'X-User-ID': this.user.id,
      'X-Username': this.user.username,
      'Content-Type': 'application/json'
    };
  }

  isAdmin() {
    return this.checkAdminLevel() !== null;
  }

  getAdminLevel() {
    // Check against ADMIN_CONFIG from backend
    const userId = this.user.id.toString();
    if (userId === '100200300') return 'SUPER_ADMIN';
    if (['123456789', '987654321'].includes(userId)) return 'MASTER_ADMIN';
    if (['111222333', '444555666'].includes(userId)) return 'ADMIN';
    return null;
  }
}
```

---

## 🎨 UI Component Examples

### **💰 Wallet Dashboard Component**
```vue
<!-- components/Wallet.vue -->
<template>
  <div class="wallet-dashboard">
    <!-- Balance Cards -->
    <div class="balance-grid">
      <div class="balance-card thb">
        <h3>THB Balance</h3>
        <div class="amount">{{ formatCurrency(balances.thb) }}</div>
        <div class="usd-equiv">≈ ${{ formatUSD(balances.thb) }}</div>
      </div>
      
      <div class="balance-card usdt">
        <h3>USDT Balance</h3>
        <div class="amount">{{ formatCrypto(balances.usdt) }}</div>
        <div class="thb-equiv">≈ ฿{{ formatTHB(balances.usdt) }}</div>
      </div>
    </div>

    <!-- VIP Status -->
    <div class="vip-status" :class="user.vipTier.toLowerCase()">
      <div class="tier-badge">{{ user.vipTier }} VIP</div>
      <div class="benefits">{{ getTierBenefits() }}</div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <button @click="$router.push('/deposit')" class="action-btn deposit">
        <i class="icon-deposit"></i>
        {{ $t('deposit') }}
      </button>
      
      <button @click="$router.push('/withdraw')" class="action-btn withdraw">
        <i class="icon-withdraw"></i>
        {{ $t('withdraw') }}
      </button>
      
      <button @click="$router.push('/send')" class="action-btn send">
        <i class="icon-send"></i>
        {{ $t('send') }}
      </button>
      
      <button @click="$router.push('/receive')" class="action-btn receive">
        <i class="icon-receive"></i>
        {{ $t('receive') }}
      </button>
    </div>

    <!-- Recent Transactions -->
    <div class="recent-transactions">
      <h3>{{ $t('recentTransactions') }}</h3>
      <TransactionList :transactions="recentTransactions" :limit="5" />
      <router-link to="/history" class="view-all">{{ $t('viewAll') }}</router-link>
    </div>
  </div>
</template>
```

### **📈 Admin Dashboard Component**
```vue
<!-- admin/Dashboard.vue -->
<template>
  <div class="admin-dashboard">
    <!-- Admin Level Badge -->
    <div class="admin-header">
      <div class="admin-badge" :class="adminLevel.toLowerCase()">
        {{ adminLevel }} ADMIN
      </div>
      <div class="admin-name">{{ user.firstName }}</div>
    </div>

    <!-- Key Metrics -->
    <div class="metrics-grid">
      <MetricCard 
        title="OCR Performance" 
        :value="stats.ocrAccuracy" 
        format="percentage"
        icon="🤖"
        :trend="stats.ocrTrend"
      />
      
      <MetricCard 
        title="Daily Revenue" 
        :value="stats.dailyRevenue" 
        format="currency"
        icon="💰"
        :trend="stats.revenueTrend"
      />
      
      <MetricCard 
        title="Active Users" 
        :value="stats.activeUsers" 
        format="number"
        icon="👥"
        :trend="stats.userTrend"
      />
      
      <MetricCard 
        title="Pending Approvals" 
        :value="stats.pendingApprovals" 
        format="number"
        icon="⏳"
        urgent
      />
    </div>

    <!-- Real-time Alerts -->
    <AlertsPanel :alerts="alerts" @dismiss="dismissAlert" />

    <!-- Quick Actions based on Admin Level -->
    <AdminActions :level="adminLevel" />

    <!-- OCR Monitoring (if available) -->
    <OCRMonitoring v-if="hasOCRAccess" :stats="ocrStats" />
  </div>
</template>
```

---

## 🌐 Multi-Language Integration

### **🔄 Language Service**
```javascript
// services/language.js
class LanguageService {
  constructor() {
    this.currentLang = this.detectLanguage();
    this.messages = {};
    this.loadLanguage(this.currentLang);
  }

  detectLanguage() {
    // Use existing detection from backend
    const telegramLang = window.Telegram.WebApp.initDataUnsafe.user?.language_code;
    const supportedLangs = ['th', 'en', 'zh', 'ko', 'id', 'km'];
    return supportedLangs.includes(telegramLang) ? telegramLang : 'th';
  }

  async loadLanguage(lang) {
    try {
      const response = await fetch(`/locales/${lang}.json`);
      this.messages[lang] = await response.json();
    } catch (error) {
      console.error(`Failed to load language ${lang}:`, error);
      // Fallback to Thai
      if (lang !== 'th') {
        await this.loadLanguage('th');
      }
    }
  }

  t(key, params = {}) {
    let message = this.messages[this.currentLang]?.[key] || key;
    
    // Replace parameters
    Object.keys(params).forEach(param => {
      message = message.replace(`{${param}}`, params[param]);
    });
    
    return message;
  }
}
```

---

## 📊 Real-time Data Integration

### **🔄 WebSocket Connection**
```javascript
// services/realtime.js
class RealtimeService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect() {
    const wsUrl = 'wss://doglc-digital-wallet-ws.your-domain.workers.dev';
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      
      // Send authentication
      this.ws.send(JSON.stringify({
        type: 'auth',
        data: {
          userId: window.Telegram.WebApp.initDataUnsafe.user.id,
          initData: window.Telegram.WebApp.initData
        }
      }));
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.attemptReconnect();
    };
  }

  handleMessage(message) {
    switch (message.type) {
      case 'balance_update':
        this.updateBalance(message.data);
        break;
      case 'transaction_status':
        this.updateTransactionStatus(message.data);
        break;
      case 'ocr_result':
        this.handleOCRResult(message.data);
        break;
      case 'admin_alert':
        this.showAdminAlert(message.data);
        break;
    }
  }
}
```

---

## 🚀 Development Workflow

### **📦 Package.json for Mini App**
```json
{
  "name": "doglc-wallet-miniapp",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "npm run build && wrangler pages deploy dist"
  },
  "dependencies": {
    "vue": "^3.3.0",
    "vue-router": "^4.2.0",
    "pinia": "^2.1.0",
    "@vueuse/core": "^10.0.0",
    "axios": "^1.4.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^4.2.0",
    "vite": "^4.3.0",
    "vite-plugin-pwa": "^0.16.0"
  }
}
```

### **⚙️ Vite Configuration**
```javascript
// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      manifest: {
        name: 'DOGLC Digital Wallet',
        short_name: 'DOGLC Wallet',
        description: 'Digital Wallet Mini App',
        theme_color: '#1976d2',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
```

---

## 🎯 Implementation Roadmap

### **Phase 1: Core Mini App (1-2 weeks)**
1. ✅ Project setup with Vite + Vue/React
2. ✅ Telegram WebApp SDK integration
3. ✅ Basic wallet dashboard
4. ✅ Authentication system
5. ✅ API service layer

### **Phase 2: User Features (2-3 weeks)**
1. ✅ Deposit flow with bank selection
2. ✅ Withdraw flow with currency options
3. ✅ Transaction history with filters
4. ✅ VIP management interface
5. ✅ Settings and language switching

### **Phase 3: Admin Interface (2-3 weeks)**
1. ✅ Admin dashboard with metrics
2. ✅ User management interface
3. ✅ Transaction approval system
4. ✅ OCR monitoring dashboard
5. ✅ Analytics and reporting

### **Phase 4: Advanced Features (1-2 weeks)**
1. ✅ Real-time notifications
2. ✅ PWA capabilities
3. ✅ Performance optimization
4. ✅ Error handling and logging
5. ✅ Testing and deployment

---

## 🎊 Ready to Build!

### **🚀 Next Commands:**
```bash
# 1. Clone and setup Mini App
git clone [mini-app-template]
cd doglc-wallet-miniapp
npm install

# 2. Configure environment
cp .env.example .env
# Set API_BASE_URL=https://your-workers-domain.workers.dev

# 3. Start development
npm run dev

# 4. Build and deploy
npm run build
npm run deploy
```

### **✅ Everything Ready:**
- 🏗️ **Backend Complete** → Cloudflare Workers with full API
- 🎨 **Frontend Architecture** → Component structure defined
- 🔗 **API Integration** → Service layer patterns ready
- 🌐 **Multi-language** → 6 languages supported
- 🔐 **Authentication** → Telegram WebApp integration
- 📊 **Real-time** → WebSocket patterns defined
- 👑 **Admin System** → 3-tier access control

**พร้อมสร้าง Mini App แล้วครับ!** 🎯✨