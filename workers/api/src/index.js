/**
 * DOGLC API Worker
 * RESTful API endpoints for the digital wallet system
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS headers
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight requests
    if (method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    // Health check endpoint
    if (path === '/api/health' || path === '/health') {
      return Response.json({ 
        status: 'ok', 
        service: 'doglc-api-worker',
        version: '1.0.0',
        endpoints: [
          '/api/health',
          '/api/wallet',
          '/api/transactions',
          '/api/market'
        ],
        timestamp: new Date().toISOString()
      }, { headers });
    }

    // API routes
    if (path.startsWith('/api/')) {
      switch (path) {
        case '/api/wallet':
          return handleWalletAPI(request, env);
        case '/api/transactions':
          return handleTransactionsAPI(request, env);
        case '/api/market':
          return handleMarketAPI(request, env);
        default:
          return Response.json({ error: 'API endpoint not found' }, { status: 404, headers });
      }
    }

    // Default response
    return Response.json({ 
      message: 'DOGLC API Worker',
      documentation: '/api/health'
    }, { headers });
  }
};

async function handleWalletAPI(request, env) {
  return Response.json({ 
    message: 'Wallet API endpoint',
    available: true 
  });
}

async function handleTransactionsAPI(request, env) {
  return Response.json({ 
    message: 'Transactions API endpoint',
    available: true 
  });
}

async function handleMarketAPI(request, env) {
  return Response.json({ 
    message: 'Market API endpoint',
    available: true 
  });
}