/**
 * Alert Middleware
 * Handles alerting and notification for the orchestrator
 */

export async function alertMiddleware(c, next) {
  const startTime = Date.now();
  
  try {
    await next();
    
    // Log successful requests
    const responseTime = Date.now() - startTime;
    if (responseTime > 5000) { // Log slow requests
      console.warn(`⏱️ Slow request: ${c.req.method} ${c.req.path} took ${responseTime}ms`);
    }
  } catch (error) {
    // Log and handle errors
    console.error(`❌ Request error: ${c.req.method} ${c.req.path}`, {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    // Send error response
    return c.json({
      error: 'Internal server error',
      message: 'An error occurred while processing your request',
      timestamp: new Date().toISOString(),
      requestId: c.req.header('x-request-id') || 'unknown'
    }, 500);
  }
}