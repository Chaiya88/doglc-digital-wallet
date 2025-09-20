import { Hono } from 'hono';
import { cors } from 'hono/cors';

// Create simple API server for testing
const app = new Hono();

// CORS middleware for frontend connectivity
app.use('/*', cors({
    origin: ['http://127.0.0.1:8787', 'http://localhost:8787'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
}));

// Health check endpoint
app.get('/', (c) => {
    return c.json({
        status: 'OK',
        message: 'DOGLC Main Bot API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Mock wallet API endpoints
app.get('/api/wallet/balance', (c) => {
    return c.json({
        success: true,
        data: {
            balance: 125478.50,
            currency: 'THB',
            change_percentage: 2.5,
            last_updated: new Date().toISOString()
        }
    });
});

app.get('/api/wallet/assets', (c) => {
    return c.json({
        success: true,
        data: [
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
                amount: 0.05,
                value_usd: 3145.20,
                change_24h: 5.2
            },
            {
                id: 'eth',
                name: 'Ethereum',
                symbol: 'ETH',
                icon: 'Ξ',
                amount: 1.25,
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
        ]
    });
});

app.get('/api/market/trending', (c) => {
    return c.json({
        success: true,
        data: [
            {
                symbol: 'BTC',
                name: 'Bitcoin',
                price: 62904.12,
                change_percentage: 2.4
            },
            {
                symbol: 'ETH',
                name: 'Ethereum',
                price: 2471.80,
                change_percentage: -1.2
            },
            {
                symbol: 'BNB',
                name: 'Binance Coin',
                price: 589.23,
                change_percentage: 3.1
            },
            {
                symbol: 'ADA',
                name: 'Cardano',
                price: 0.368,
                change_percentage: -0.5
            },
            {
                symbol: 'DOT',
                name: 'Polkadot',
                price: 4.12,
                change_percentage: 1.8
            }
        ]
    });
});

app.get('/api/transactions', (c) => {
    return c.json({
        success: true,
        data: [
            {
                id: 'tx001',
                type: 'deposit',
                description: 'Bank Transfer Deposit',
                amount: 5000.00,
                currency: 'THB',
                created_at: '2024-12-20T10:30:00Z',
                status: 'completed'
            },
            {
                id: 'tx002',
                type: 'withdraw',
                description: 'ATM Withdrawal',
                amount: -1200.00,
                currency: 'THB',
                created_at: '2024-12-19T15:45:00Z',
                status: 'completed'
            },
            {
                id: 'tx003',
                type: 'send',
                description: 'Send to Friend',
                amount: -850.50,
                currency: 'THB',
                created_at: '2024-12-19T09:15:00Z',
                status: 'completed'
            },
            {
                id: 'tx004',
                type: 'receive',
                description: 'Payment Received',
                amount: 2500.00,
                currency: 'THB',
                created_at: '2024-12-18T14:20:00Z',
                status: 'completed'
            },
            {
                id: 'tx005',
                type: 'exchange',
                description: 'BTC Purchase',
                amount: -15750.00,
                currency: 'THB',
                created_at: '2024-12-18T11:30:00Z',
                status: 'completed'
            }
        ]
    });
});

// Error handling
app.onError((err, c) => {
    console.error('API Error:', err);
    return c.json({
        success: false,
        error: 'Internal server error',
        message: err.message
    }, 500);
});

// 404 handler
app.notFound((c) => {
    return c.json({
        success: false,
        error: 'Not Found',
        message: 'API endpoint not found'
    }, 404);
});

export default {
    async fetch(request, env, ctx) {
        return app.fetch(request, env, ctx);
    }
};