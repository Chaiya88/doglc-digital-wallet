/**
 * Simple Backend API with Security Enhancements
 * Path Traversal Protection + Rate Limiting + Security Headers
 */

// In-memory rate limiting store (for demo purposes)
const rateLimitStore = new Map();

// Security middleware function
function securityMiddleware(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  
  // Path Traversal Protection
  if (path.includes('..') || 
      path.includes('%2e%2e') || 
      path.includes('..%2f') || 
      path.includes('..\\') ||
      path.includes('%2e%2e%2f') ||
      path.includes('%5c%2e%2e') ||
      path.includes('..%5c')) {
    console.log('🚨 Path traversal attempt detected:', path);
    return new Response(JSON.stringify({
      error: 'Path traversal attempt detected',
      code: 'SECURITY_VIOLATION',
      timestamp: new Date().toISOString()
    }), { 
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Rate Limiting (50 requests per minute per IP)
  const clientIP = request.headers.get('CF-Connecting-IP') || 
                   request.headers.get('X-Forwarded-For') || 
                   'unknown';
  const rateLimitKey = `rate_limit:${clientIP}`;
  const currentTime = Math.floor(Date.now() / 1000);
  const windowDuration = 60; // 1 minute
  const maxRequests = 50;
  
  let requests = rateLimitStore.get(rateLimitKey) || [];
  
  // Filter out old requests
  requests = requests.filter(timestamp => currentTime - timestamp < windowDuration);
  
  if (requests.length >= maxRequests) {
    console.log('🚨 Rate limit exceeded for IP:', clientIP);
    return new Response(JSON.stringify({
      error: 'Rate limit exceeded',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: windowDuration,
      timestamp: new Date().toISOString()
    }), { 
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': windowDuration.toString(),
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': (currentTime + windowDuration).toString()
      }
    });
  }
  
  // Add current request
  requests.push(currentTime);
  rateLimitStore.set(rateLimitKey, requests);
  
  // Clean up old entries every 100 requests
  if (rateLimitStore.size > 100) {
    const cutoff = currentTime - windowDuration * 2;
    for (const [key, timestamps] of rateLimitStore.entries()) {
      const filtered = timestamps.filter(t => t > cutoff);
      if (filtered.length === 0) {
        rateLimitStore.delete(key);
      } else {
        rateLimitStore.set(key, filtered);
      }
    }
  }
  
  return null; // No security violation
}

// Security headers function
function addSecurityHeaders(response) {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https:;"
  );
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // Apply security middleware
    const securityCheck = securityMiddleware(request, env);
    if (securityCheck) {
      return addSecurityHeaders(securityCheck);
    }
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      const response = new Response(null, { status: 200 });
      return addSecurityHeaders(response);
    }
    
    let response;
    
    // Route handlers
    if (path === '/health' || path === '/') {
      response = new Response(JSON.stringify({
        status: 'healthy',
        service: 'doglc-simple-backend',
        version: '1.0.0-security-enhanced',
        features: [
          'path_traversal_protection',
          'rate_limiting',
          'security_headers',
          'cors_support'
        ],
        security: {
          pathTraversalProtection: true,
          rateLimiting: true,
          securityHeaders: true,
          requestCount: rateLimitStore.size
        },
        timestamp: new Date().toISOString(),
        uptime: Date.now()
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    else if (path === '/api/wallet/balance') {
      response = new Response(JSON.stringify({
        status: 'success',
        data: {
          balance: 15420.50,
          currency: 'THB',
          formatted: '฿15,420.50'
        },
        timestamp: new Date().toISOString()
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    else if (path === '/api/user/profile') {
      response = new Response(JSON.stringify({
        status: 'success',
        data: {
          id: 'user_123',
          name: 'Test User',
          email: 'test@example.com',
          role: 'premium'
        },
        timestamp: new Date().toISOString()
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    else if (path === '/api/admin/users') {
      // Test unauthorized access
      response = new Response(JSON.stringify({
        error: 'Unauthorized access',
        code: 'UNAUTHORIZED',
        message: 'Admin access required',
        timestamp: new Date().toISOString()
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    else if (path.startsWith('/api/')) {
      response = new Response(JSON.stringify({
        error: 'API endpoint not found',
        code: 'NOT_FOUND',
        path: path,
        timestamp: new Date().toISOString()
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    else {
      response = new Response(JSON.stringify({
        error: 'Not Found',
        code: 'NOT_FOUND',
        path: path,
        timestamp: new Date().toISOString()
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return addSecurityHeaders(response);
  }
};