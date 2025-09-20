/**
 * CORS Middleware
 * Handles Cross-Origin Resource Sharing for orchestrator API
 */

export async function corsMiddleware(c, next) {
  // Define allowed origins based on environment
  const allowedOrigins = [
    'https://doglc-digital-wallet.pages.dev', // Production frontend
    'https://doglc-digital-wallet-staging.pages.dev', // Staging frontend
    'http://localhost:3000', // Local development
    'http://localhost:8080', // Local development alt
    'http://127.0.0.1:3000', // Local development
    'http://127.0.0.1:8080', // Local development alt
  ];
  
  const origin = c.req.header('Origin');
  const requestMethod = c.req.header('Access-Control-Request-Method');
  const requestHeaders = c.req.header('Access-Control-Request-Headers');
  
  // Handle preflight OPTIONS request
  if (c.req.method === 'OPTIONS') {
    const response = new Response(null, { status: 204 });
    
    // Set CORS headers for preflight
    if (origin && (allowedOrigins.includes(origin) || origin.includes('localhost'))) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    } else {
      response.headers.set('Access-Control-Allow-Origin', '*');
    }
    
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-API-Key');
    response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    
    return response;
  }
  
  // Continue with the request
  await next();
  
  // Set CORS headers for actual request
  if (origin && (allowedOrigins.includes(origin) || origin.includes('localhost'))) {
    c.res.headers.set('Access-Control-Allow-Origin', origin);
  } else {
    c.res.headers.set('Access-Control-Allow-Origin', '*');
  }
  
  c.res.headers.set('Access-Control-Allow-Credentials', 'true');
  c.res.headers.set('Access-Control-Expose-Headers', 'X-Request-ID, X-Response-Time, X-Rate-Limit-Remaining');
  
  // Add security headers
  c.res.headers.set('X-Content-Type-Options', 'nosniff');
  c.res.headers.set('X-Frame-Options', 'DENY');
  c.res.headers.set('X-XSS-Protection', '1; mode=block');
  c.res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
}