/**
 * Authentication Middleware
 * Handles authentication for admin endpoints
 */

export async function authMiddleware(c, next) {
  const authHeader = c.req.header('authorization');
  
  if (!authHeader) {
    return c.json({ error: 'Authorization header required' }, 401);
  }

  const token = authHeader.replace('Bearer ', '');
  
  // Check if it's the orchestrator API key
  if (token === c.env.ORCHESTRATOR_API_KEY) {
    await next();
    return;
  }

  // For development, allow a simple token
  if (c.env.ENVIRONMENT === 'development' && token === 'dev-token') {
    await next();
    return;
  }

  // Could add JWT verification here for more sophisticated auth
  try {
    // Placeholder for JWT verification
    // const decoded = jwt.verify(token, c.env.JWT_SECRET);
    // c.user = decoded;
    
    return c.json({ error: 'Invalid authentication token' }, 401);
  } catch (error) {
    return c.json({ error: 'Authentication failed' }, 401);
  }
}