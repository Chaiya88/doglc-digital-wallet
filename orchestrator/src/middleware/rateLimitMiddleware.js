/**
 * Rate Limiting Middleware
 * Prevents abuse of orchestrator endpoints
 */

export async function rateLimitMiddleware(c, next) {
  const clientIP = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown';
  const endpoint = c.req.path;
  const key = `rate_limit:${clientIP}:${endpoint}`;
  
  try {
    // Get current request count
    const current = await c.env.ORCHESTRATOR_KV?.get(key);
    const requestCount = current ? parseInt(current) : 0;
    
    // Define rate limits per endpoint type
    const limits = {
      '/health': { requests: 60, window: 60 }, // 60 requests per minute
      '/metrics': { requests: 30, window: 60 }, // 30 requests per minute
      '/admin': { requests: 10, window: 60 }, // 10 requests per minute for admin
      'default': { requests: 100, window: 60 } // 100 requests per minute default
    };
    
    // Determine applicable limit
    let limit = limits.default;
    for (const [path, pathLimit] of Object.entries(limits)) {
      if (endpoint.startsWith(path)) {
        limit = pathLimit;
        break;
      }
    }
    
    // Check if limit exceeded
    if (requestCount >= limit.requests) {
      return c.json({
        error: 'Rate limit exceeded',
        message: `Too many requests. Limit: ${limit.requests} per ${limit.window} seconds`,
        retryAfter: limit.window
      }, 429);
    }
    
    // Increment counter
    if (c.env.ORCHESTRATOR_KV) {
      await c.env.ORCHESTRATOR_KV.put(key, (requestCount + 1).toString(), {
        expirationTtl: limit.window
      });
    }
    
    // Add rate limit headers
    c.res.headers.set('X-RateLimit-Limit', limit.requests.toString());
    c.res.headers.set('X-RateLimit-Remaining', (limit.requests - requestCount - 1).toString());
    c.res.headers.set('X-RateLimit-Reset', (Date.now() + (limit.window * 1000)).toString());
    
    await next();
  } catch (error) {
    console.error('Rate limiting error:', error);
    // Continue on rate limiting errors
    await next();
  }
}