/**
 * Request Logging Middleware
 * Logs all requests with timing and response information
 */

export async function requestLogMiddleware(c, next) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID().substring(0, 8);
  const clientIP = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown';
  
  // Add request ID to context for other middleware
  c.set('requestId', requestId);
  
  console.log(`🚀 [${requestId}] ${c.req.method} ${c.req.path} - IP: ${clientIP} - Started: ${new Date().toISOString()}`);
  
  try {
    await next();
    
    const duration = Date.now() - startTime;
    const status = c.res.status || 200;
    
    // Determine log level based on status and duration
    let logLevel = '✅';
    if (status >= 500) logLevel = '❌';
    else if (status >= 400) logLevel = '⚠️';
    else if (duration > 5000) logLevel = '🐌';
    else if (duration > 2000) logLevel = '⚡';
    
    console.log(`${logLevel} [${requestId}] ${c.req.method} ${c.req.path} - ${status} - ${duration}ms - IP: ${clientIP}`);
    
    // Add response headers
    c.res.headers.set('X-Request-ID', requestId);
    c.res.headers.set('X-Response-Time', `${duration}ms`);
    
    // Log slow requests to metrics if available
    if (duration > 2000 && c.get('metricsCollector')) {
      const metricsCollector = c.get('metricsCollector');
      await metricsCollector.recordCustomMetric('slow_requests', {
        path: c.req.path,
        method: c.req.method,
        duration,
        requestId,
        timestamp: Date.now()
      });
    }
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [${requestId}] ${c.req.method} ${c.req.path} - ERROR - ${duration}ms - IP: ${clientIP}`, error);
    
    // Add error information to response
    c.res.headers.set('X-Request-ID', requestId);
    c.res.headers.set('X-Response-Time', `${duration}ms`);
    c.res.headers.set('X-Error', 'true');
    
    throw error;
  }
}