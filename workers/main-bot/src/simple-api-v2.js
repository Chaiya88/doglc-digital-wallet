import { Hono } from 'hono';
import { cors } from 'hono/cors';

// Create a simple API app
const app = new Hono();

// CORS middleware for frontend connectivity
app.use('*', cors({
    origin: ['http://127.0.0.1:8787', 'http://localhost:8787', 'https://web.telegram.org'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Telegram-Init-Data'],
    credentials: true,
}));

// Health check endpoint
app.get('/', (c) => {
    return c.json({
        status: 'OK',
        message: 'DOGLC Digital Wallet API v2.0',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        environment: c.env?.ENVIRONMENT || 'development'
    });
});

// Mock user data (in real app, this would come from database)
const mockUsers = {
    'user123': {
        id: 'user123',
        firstName: 'สมชาย',
        lastName: 'ใจดี',
        username: 'somchai_jaidee',
        balance: 125478.50,
        vipLevel: 'Gold'
    }
};

// Mock wallet data
const mockWalletData = {
    balance: 125478.50,
    currency: 'THB',
    change_percentage: 2.5,
    last_updated: new Date().toISOString()
};

const mockAssets = [
    {
        id: 'thb',
        name: 'Thai Baht',
        symbol: 'THB',
        icon: '🇹🇭',
        amount: 125478.50,
        value_usd: 3486.45,
        change_24h: 0.0
    },
    {
        id: 'btc',
        name: 'Bitcoin',
        symbol: 'BTC',
        icon: '₿',
        amount: 0.05234,
        value_usd: 3145.20,
        change_24h: 5.2
    },
    {
        id: 'eth',
        name: 'Ethereum',
        symbol: 'ETH',
        icon: 'Ξ',
        amount: 1.25891,
        value_usd: 3089.75,
        change_24h: -2.1
    },
    {
        id: 'usdt',
        name: 'Tether',
        symbol: 'USDT',
        icon: '💵',
        amount: 500.00,
        value_usd: 500.00,
        change_24h: 0.1
    }
];

const mockMarketData = [
    {
        symbol: 'BTC',
        name: 'Bitcoin',
        price: 62904.12,
        change_percentage: 2.4,
        volume_24h: 28394820000
    },
    {
        symbol: 'ETH',
        name: 'Ethereum', 
        price: 2471.80,
        change_percentage: -1.2,
        volume_24h: 15234710000
    },
    {
        symbol: 'BNB',
        name: 'Binance Coin',
        price: 589.23,
        change_percentage: 3.1,
        volume_24h: 1983475000
    },
    {
        symbol: 'ADA',
        name: 'Cardano',
        price: 0.368,
        change_percentage: -0.5,
        volume_24h: 592847000
    },
    {
        symbol: 'DOT',
        name: 'Polkadot',
        price: 4.12,
        change_percentage: 1.8,
        volume_24h: 284756000
    }
];

const mockTransactions = [
    {
        id: 'tx_20241220_001',
        type: 'deposit',
        description: 'ฝากเงินจากธนาคาร',
        amount: 5000.00,
        currency: 'THB',
        created_at: '2024-12-20T10:30:00Z',
        status: 'completed',
        bank: 'ธนาคารกสิกรไทย',
        reference: 'DEP240001'
    },
    {
        id: 'tx_20241219_002',
        type: 'withdraw',
        description: 'ถอนเงินที่ตู้ ATM',
        amount: -1200.00,
        currency: 'THB',
        created_at: '2024-12-19T15:45:00Z',
        status: 'completed',
        reference: 'WD240002'
    },
    {
        id: 'tx_20241219_003',
        type: 'send',
        description: 'โอนให้เพื่อน',
        amount: -850.50,
        currency: 'THB',
        created_at: '2024-12-19T09:15:00Z',
        status: 'completed',
        recipient: 'น้องมิ้น',
        reference: 'TF240003'
    },
    {
        id: 'tx_20241218_004',
        type: 'receive',
        description: 'รับเงินจากลูกค้า',
        amount: 2500.00,
        currency: 'THB',
        created_at: '2024-12-18T14:20:00Z',
        status: 'completed',
        sender: 'คุณสมศรี',
        reference: 'RC240004'
    },
    {
        id: 'tx_20241218_005',
        type: 'exchange',
        description: 'ซื้อ Bitcoin',
        amount: -15750.00,
        currency: 'THB',
        created_at: '2024-12-18T11:30:00Z',
        status: 'completed',
        exchange_rate: 0.0033421,
        crypto_amount: 0.05234,
        reference: 'EX240005'
    }
];

// API Routes

// Wallet endpoints
app.get('/api/wallet/balance', (c) => {
    return c.json({
        success: true,
        data: mockWalletData,
        timestamp: new Date().toISOString()
    });
});

app.get('/api/wallet/assets', (c) => {
    return c.json({
        success: true,
        data: mockAssets,
        timestamp: new Date().toISOString()
    });
});

// Market endpoints
app.get('/api/market/:category', (c) => {
    const category = c.req.param('category');
    
    // Filter market data based on category
    let filteredData = mockMarketData;
    
    if (category === 'trending') {
        filteredData = mockMarketData.filter(item => item.change_percentage > 0);
    } else if (category === 'gainers') {
        filteredData = mockMarketData.filter(item => item.change_percentage > 2);
    } else if (category === 'losers') {
        filteredData = mockMarketData.filter(item => item.change_percentage < 0);
    }
    
    return c.json({
        success: true,
        data: filteredData,
        category,
        timestamp: new Date().toISOString()
    });
});

app.get('/api/market', (c) => {
    return c.json({
        success: true,
        data: mockMarketData,
        timestamp: new Date().toISOString()
    });
});

// Transaction endpoints
app.get('/api/transactions', (c) => {
    const limit = parseInt(c.req.query('limit') || '10');
    const offset = parseInt(c.req.query('offset') || '0');
    const type = c.req.query('type');
    
    let filteredTransactions = mockTransactions;
    
    if (type) {
        filteredTransactions = mockTransactions.filter(tx => tx.type === type);
    }
    
    const paginatedTransactions = filteredTransactions.slice(offset, offset + limit);
    
    return c.json({
        success: true,
        data: paginatedTransactions,
        pagination: {
            limit,
            offset,
            total: filteredTransactions.length,
            has_more: offset + limit < filteredTransactions.length
        },
        timestamp: new Date().toISOString()
    });
});

app.get('/api/transactions/:id', (c) => {
    const id = c.req.param('id');
    const transaction = mockTransactions.find(tx => tx.id === id);
    
    if (!transaction) {
        return c.json({
            success: false,
            error: 'Transaction not found',
            error_code: 'TRANSACTION_NOT_FOUND'
        }, 404);
    }
    
    return c.json({
        success: true,
        data: transaction,
        timestamp: new Date().toISOString()
    });
});

// User endpoints
app.get('/api/user/profile', (c) => {
    // In real app, get user ID from authentication
    const userId = 'user123';
    const user = mockUsers[userId];
    
    if (!user) {
        return c.json({
            success: false,
            error: 'User not found',
            error_code: 'USER_NOT_FOUND'
        }, 404);
    }
    
    return c.json({
        success: true,
        data: user,
        timestamp: new Date().toISOString()
    });
});

// Telegram WebApp specific endpoints
app.post('/api/telegram/validate', async (c) => {
    const initData = c.req.header('X-Telegram-Init-Data');
    
    // In real app, validate Telegram init data
    // For testing, always return success
    
    return c.json({
        success: true,
        data: {
            user_id: '123456789',
            username: 'test_user',
            first_name: 'Test',
            last_name: 'User',
            is_valid: true
        },
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.onError((err, c) => {
    console.error('API Error:', err);
    
    return c.json({
        success: false,
        error: 'Internal server error',
        message: err.message,
        error_code: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
    }, 500);
});

// 404 handler
app.notFound((c) => {
    return c.json({
        success: false,
        error: 'API endpoint not found',
        error_code: 'ENDPOINT_NOT_FOUND',
        path: c.req.path,
        method: c.req.method,
        timestamp: new Date().toISOString()
    }, 404);
});

// Cloudflare Workers export
export default {
    async fetch(request, env, ctx) {
        return app.fetch(request, env, ctx);
    }
};