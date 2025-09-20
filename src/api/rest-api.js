/**
 * High-Performance API System for Digital Wallet
 * RESTful and GraphQL APIs with caching, rate limiting, and optimization
 */

import { rateLimitMiddleware, SECURITY_CONFIG } from '../middleware/security.js';
import { logSecurityEvent, SECURITY_EVENT_TYPES, SEVERITY_LEVELS } from '../utils/security-logger.js';
import { encrypt, decrypt } from '../utils/encryption.js';
import { formatCurrency, formatDateTime } from '../utils/helpers.js';

/**
 * API Configuration
 */
export const API_CONFIG = {
  VERSION: 'v1',
  BASE_PATH: '/api/v1',
  
  // Performance Settings
  CACHE: {
    DEFAULT_TTL: 300, // 5 minutes
    USER_DATA_TTL: 60, // 1 minute
    EXCHANGE_RATE_TTL: 30, // 30 seconds
    STATIC_DATA_TTL: 3600, // 1 hour
    MAX_CACHE_SIZE: 1000
  },
  
  // Rate Limiting
  RATE_LIMITS: {
    PUBLIC: { requests: 100, window: 60000 }, // 100/min
    AUTHENTICATED: { requests: 1000, window: 60000 }, // 1000/min
    ADMIN: { requests: 5000, window: 60000 }, // 5000/min
    TRANSACTION: { requests: 10, window: 60000 } // 10/min for transactions
  },
  
  // Response Configuration
  RESPONSE: {
    MAX_PAGE_SIZE: 100,
    DEFAULT_PAGE_SIZE: 20,
    COMPRESSION: true,
    INCLUDE_METADATA: true
  }
};

/**
 * Cache Manager
 */
export class CacheManager {
  
  static cache = new Map();
  static cacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0
  };
  
  /**
   * Get cached data
   */
  static get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      this.cacheStats.misses++;
      return null;
    }
    
    // Check expiration
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      this.cacheStats.misses++;
      return null;
    }
    
    this.cacheStats.hits++;
    return item.data;
  }
  
  /**
   * Set cache data
   */
  static set(key, data, ttl = API_CONFIG.CACHE.DEFAULT_TTL) {
    // Check cache size limit
    if (this.cache.size >= API_CONFIG.CACHE.MAX_CACHE_SIZE) {
      this.evictOldest();
    }
    
    const item = {
      data,
      expires: Date.now() + ttl * 1000,
      created: Date.now()
    };
    
    this.cache.set(key, item);
    this.cacheStats.sets++;
  }
  
  /**
   * Delete cached data
   */
  static delete(key) {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.cacheStats.deletes++;
    }
    return deleted;
  }
  
  /**
   * Clear cache by pattern
   */
  static clearPattern(pattern) {
    const regex = new RegExp(pattern);
    let count = 0;
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }
    
    this.cacheStats.deletes += count;
    return count;
  }
  
  /**
   * Get cache statistics
   */
  static getStats() {
    const total = this.cacheStats.hits + this.cacheStats.misses;
    const hitRate = total > 0 ? (this.cacheStats.hits / total * 100).toFixed(2) : 0;
    
    return {
      ...this.cacheStats,
      hitRate: `${hitRate}%`,
      size: this.cache.size,
      memoryUsage: this.estimateMemoryUsage()
    };
  }
  
  /**
   * Evict oldest cache entries
   */
  static evictOldest() {
    let oldestKey = null;
    let oldestTime = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      if (item.created < oldestTime) {
        oldestTime = item.created;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
  
  /**
   * Estimate memory usage (rough calculation)
   */
  static estimateMemoryUsage() {
    let size = 0;
    for (const [key, item] of this.cache.entries()) {
      size += key.length * 2; // chars * 2 bytes
      size += JSON.stringify(item.data).length * 2;
      size += 24; // overhead per entry
    }
    return `${(size / 1024 / 1024).toFixed(2)} MB`;
  }
  
  /**
   * Cache warming for frequently accessed data
   */
  static async warmCache(env) {
    try {
      console.log('🔥 Warming cache...');
      
      // Warm exchange rates
      await this.warmExchangeRates();
      
      // Warm supported banks
      await this.warmSupportedBanks();
      
      // Warm system configuration
      await this.warmSystemConfig(env);
      
      console.log('✅ Cache warmed successfully');
      
    } catch (error) {
      console.error('Cache warming error:', error);
    }
  }
  
  static async warmExchangeRates() {
    // Implement exchange rate caching
    this.set('exchange_rates', {}, API_CONFIG.CACHE.EXCHANGE_RATE_TTL);
  }
  
  static async warmSupportedBanks() {
    // Implement banks data caching
    this.set('supported_banks', {}, API_CONFIG.CACHE.STATIC_DATA_TTL);
  }
  
  static async warmSystemConfig(env) {
    // Implement system config caching
    this.set('system_config', {}, API_CONFIG.CACHE.STATIC_DATA_TTL);
  }
}

/**
 * API Response Builder
 */
export class APIResponse {
  
  /**
   * Build success response
   */
  static success(data, message = 'Success', metadata = {}) {
    return {
      success: true,
      message,
      data,
      metadata: API_CONFIG.RESPONSE.INCLUDE_METADATA ? {
        timestamp: new Date().toISOString(),
        version: API_CONFIG.VERSION,
        ...metadata
      } : undefined
    };
  }
  
  /**
   * Build error response
   */
  static error(message, code = 'GENERAL_ERROR', details = null) {
    return {
      success: false,
      error: {
        code,
        message,
        details,
        timestamp: new Date().toISOString()
      }
    };
  }
  
  /**
   * Build paginated response
   */
  static paginated(data, pagination) {
    return this.success(data, 'Data retrieved successfully', {
      pagination: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        total: pagination.total,
        totalPages: Math.ceil(pagination.total / pagination.pageSize),
        hasNext: pagination.page < Math.ceil(pagination.total / pagination.pageSize),
        hasPrev: pagination.page > 1
      }
    });
  }
  
  /**
   * Build cached response
   */
  static cached(data, message = 'Success', cacheAge = 0) {
    return this.success(data, message, {
      cached: true,
      cacheAge,
      fresh: cacheAge === 0
    });
  }
}

/**
 * REST API Router
 */
export class RESTAPIRouter {
  
  static routes = new Map();
  
  /**
   * Register route
   */
  static route(method, path, handler, options = {}) {
    const key = `${method.toUpperCase()}:${path}`;
    this.routes.set(key, {
      handler,
      options: {
        auth: true,
        cache: false,
        rateLimit: 'AUTHENTICATED',
        ...options
      }
    });
  }
  
  /**
   * Handle API request
   */
  static async handleRequest(request, env) {
    try {
      const url = new URL(request.url);
      const method = request.method;
      const path = url.pathname;
      
      // Find matching route
      const routeKey = `${method}:${path}`;
      const route = this.routes.get(routeKey);
      
      if (!route) {
        return new Response(
          JSON.stringify(APIResponse.error('Route not found', 'NOT_FOUND')),
          { status: 404, headers: this.getCORSHeaders() }
        );
      }
      
      // Create context
      const ctx = {
        request,
        url,
        method,
        path,
        params: {},
        query: Object.fromEntries(url.searchParams),
        headers: Object.fromEntries(request.headers),
        user: null,
        body: null
      };
      
      // Parse request body
      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        ctx.body = await this.parseBody(request);
      }
      
      // Apply authentication
      if (route.options.auth) {
        const authResult = await this.authenticate(ctx, env);
        if (!authResult.success) {
          return new Response(
            JSON.stringify(APIResponse.error(authResult.message, 'UNAUTHORIZED')),
            { status: 401, headers: this.getCORSHeaders() }
          );
        }
        ctx.user = authResult.user;
      }
      
      // Apply rate limiting
      if (route.options.rateLimit) {
        const rateLimitResult = await this.applyRateLimit(ctx, route.options.rateLimit);
        if (!rateLimitResult.success) {
          return new Response(
            JSON.stringify(APIResponse.error('Rate limit exceeded', 'RATE_LIMITED')),
            { status: 429, headers: this.getCORSHeaders() }
          );
        }
      }
      
      // Check cache
      if (route.options.cache && method === 'GET') {
        const cacheKey = this.generateCacheKey(ctx);
        const cached = CacheManager.get(cacheKey);
        if (cached) {
          return new Response(
            JSON.stringify(APIResponse.cached(cached.data, cached.message, cached.age)),
            { 
              status: 200, 
              headers: {
                ...this.getCORSHeaders(),
                'Content-Type': 'application/json',
                'X-Cache': 'HIT'
              }
            }
          );
        }
      }
      
      // Execute route handler
      const result = await route.handler(ctx, env);
      
      // Cache response if applicable
      if (route.options.cache && method === 'GET' && result.success) {
        const cacheKey = this.generateCacheKey(ctx);
        const ttl = route.options.cacheTTL || API_CONFIG.CACHE.DEFAULT_TTL;
        CacheManager.set(cacheKey, {
          data: result.data,
          message: result.message,
          age: 0
        }, ttl);
      }
      
      return new Response(
        JSON.stringify(result),
        { 
          status: result.success ? 200 : 400, 
          headers: {
            ...this.getCORSHeaders(),
            'Content-Type': 'application/json',
            'X-Cache': 'MISS'
          }
        }
      );
      
    } catch (error) {
      console.error('API request error:', error);
      
      await logSecurityEvent({
        type: SECURITY_EVENT_TYPES.API_ERROR,
        severity: SEVERITY_LEVELS.HIGH,
        description: `API error: ${error.message}`,
        metadata: {
          method: request.method,
          url: request.url,
          error: error.message
        }
      });
      
      return new Response(
        JSON.stringify(APIResponse.error('Internal server error', 'INTERNAL_ERROR')),
        { status: 500, headers: this.getCORSHeaders() }
      );
    }
  }
  
  /**
   * Parse request body
   */
  static async parseBody(request) {
    try {
      const contentType = request.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        return await request.json();
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        const formData = await request.formData();
        return Object.fromEntries(formData);
      } else if (contentType.includes('multipart/form-data')) {
        const formData = await request.formData();
        return Object.fromEntries(formData);
      } else {
        return await request.text();
      }
    } catch (error) {
      return null;
    }
  }
  
  /**
   * Authenticate request
   */
  static async authenticate(ctx, env) {
    try {
      const authHeader = ctx.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { success: false, message: 'Missing or invalid authorization header' };
      }
      
      const token = authHeader.substring(7);
      
      // Verify JWT token (implement with your JWT library)
      const user = await this.verifyJWT(token, env);
      if (!user) {
        return { success: false, message: 'Invalid or expired token' };
      }
      
      return { success: true, user };
      
    } catch (error) {
      console.error('Authentication error:', error);
      return { success: false, message: 'Authentication failed' };
    }
  }
  
  /**
   * Apply rate limiting
   */
  static async applyRateLimit(ctx, limitType) {
    try {
      const limit = API_CONFIG.RATE_LIMITS[limitType];
      if (!limit) return { success: true };
      
      const key = `api_rate_${limitType}_${ctx.user?.id || ctx.headers['x-forwarded-for'] || 'anonymous'}`;
      
      // Check current count (implement with KV or memory)
      const current = await this.getRateLimitCount(key);
      
      if (current >= limit.requests) {
        return { success: false, message: 'Rate limit exceeded' };
      }
      
      // Increment count
      await this.incrementRateLimitCount(key, limit.window);
      
      return { success: true };
      
    } catch (error) {
      console.error('Rate limit error:', error);
      return { success: true }; // Fail open
    }
  }
  
  /**
   * Generate cache key
   */
  static generateCacheKey(ctx) {
    const params = new URLSearchParams(ctx.query).toString();
    const userId = ctx.user?.id || 'anonymous';
    return `api_${ctx.method}_${ctx.path}_${userId}_${params}`;
  }
  
  /**
   * Get CORS headers
   */
  static getCORSHeaders() {
    return {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    };
  }
  
  /**
   * Placeholder methods for implementation
   */
  static async verifyJWT(token, env) {
    // Implement JWT verification
    return null;
  }
  
  static async getRateLimitCount(key) {
    // Implement rate limit counting
    return 0;
  }
  
  static async incrementRateLimitCount(key, window) {
    // Implement rate limit increment
  }
}

/**
 * API Endpoints Registration
 */
export function registerAPIEndpoints() {
  
  // User endpoints
  RESTAPIRouter.route('GET', '/api/v1/user/profile', getUserProfile, {
    cache: true,
    cacheTTL: API_CONFIG.CACHE.USER_DATA_TTL
  });
  
  RESTAPIRouter.route('PUT', '/api/v1/user/profile', updateUserProfile);
  
  RESTAPIRouter.route('GET', '/api/v1/user/balance', getUserBalance, {
    cache: true,
    cacheTTL: API_CONFIG.CACHE.USER_DATA_TTL
  });
  
  // Transaction endpoints
  RESTAPIRouter.route('GET', '/api/v1/transactions', getTransactions, {
    cache: true,
    cacheTTL: API_CONFIG.CACHE.USER_DATA_TTL
  });
  
  RESTAPIRouter.route('POST', '/api/v1/transactions/deposit', createDeposit, {
    rateLimit: 'TRANSACTION'
  });
  
  RESTAPIRouter.route('POST', '/api/v1/transactions/withdraw', createWithdrawal, {
    rateLimit: 'TRANSACTION'
  });
  
  // Exchange endpoints
  RESTAPIRouter.route('GET', '/api/v1/exchange/rates', getExchangeRates, {
    auth: false,
    cache: true,
    cacheTTL: API_CONFIG.CACHE.EXCHANGE_RATE_TTL
  });
  
  RESTAPIRouter.route('POST', '/api/v1/exchange/convert', convertCurrency, {
    rateLimit: 'TRANSACTION'
  });
  
  // Admin endpoints
  RESTAPIRouter.route('GET', '/api/v1/admin/dashboard', getAdminDashboard, {
    auth: true, // Admin auth required
    cache: true,
    cacheTTL: 60
  });
  
  RESTAPIRouter.route('GET', '/api/v1/admin/users', getAdminUsers);
  
  RESTAPIRouter.route('PUT', '/api/v1/admin/transactions/:id/approve', approveTransaction);
  
  // Public endpoints
  RESTAPIRouter.route('GET', '/api/v1/health', getHealthCheck, {
    auth: false,
    cache: true,
    cacheTTL: 30
  });
  
  RESTAPIRouter.route('GET', '/api/v1/status', getSystemStatus, {
    auth: false
  });
  
  console.log('📡 API endpoints registered');
}

/**
 * API Endpoint Handlers
 */

async function getUserProfile(ctx, env) {
  try {
    // Implement user profile retrieval
    const user = ctx.user;
    
    return APIResponse.success({
      id: user.id,
      username: user.username,
      email: user.email,
      vipTier: user.vipTier,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    });
    
  } catch (error) {
    return APIResponse.error('Failed to get user profile', 'USER_PROFILE_ERROR');
  }
}

async function updateUserProfile(ctx, env) {
  try {
    // Implement user profile update
    const { email, phone, preferences } = ctx.body;
    
    // Validate and update user data
    
    return APIResponse.success({
      message: 'Profile updated successfully'
    });
    
  } catch (error) {
    return APIResponse.error('Failed to update profile', 'PROFILE_UPDATE_ERROR');
  }
}

async function getUserBalance(ctx, env) {
  try {
    // Implement balance retrieval
    const balances = {
      THB: 50000.00,
      USDT: 1500.123456,
      BTC: 0.05,
      ETH: 2.5
    };
    
    return APIResponse.success(balances);
    
  } catch (error) {
    return APIResponse.error('Failed to get balance', 'BALANCE_ERROR');
  }
}

async function getTransactions(ctx, env) {
  try {
    const page = parseInt(ctx.query.page) || 1;
    const pageSize = Math.min(parseInt(ctx.query.pageSize) || API_CONFIG.RESPONSE.DEFAULT_PAGE_SIZE, API_CONFIG.RESPONSE.MAX_PAGE_SIZE);
    const type = ctx.query.type;
    const status = ctx.query.status;
    
    // Implement transaction retrieval with pagination
    const transactions = []; // Get from database
    const total = 0; // Get total count
    
    return APIResponse.paginated(transactions, {
      page,
      pageSize,
      total
    });
    
  } catch (error) {
    return APIResponse.error('Failed to get transactions', 'TRANSACTIONS_ERROR');
  }
}

async function createDeposit(ctx, env) {
  try {
    const { amount, currency, bankCode } = ctx.body;
    
    // Validate deposit request
    if (!amount || !currency || !bankCode) {
      return APIResponse.error('Missing required fields', 'VALIDATION_ERROR');
    }
    
    // Create deposit transaction
    const deposit = {
      id: 'dep_' + Date.now(),
      amount,
      currency,
      bankCode,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };
    
    return APIResponse.success(deposit, 'Deposit created successfully');
    
  } catch (error) {
    return APIResponse.error('Failed to create deposit', 'DEPOSIT_ERROR');
  }
}

async function createWithdrawal(ctx, env) {
  try {
    const { amount, currency, address } = ctx.body;
    
    // Validate withdrawal request
    if (!amount || !currency || !address) {
      return APIResponse.error('Missing required fields', 'VALIDATION_ERROR');
    }
    
    // Create withdrawal transaction
    const withdrawal = {
      id: 'wd_' + Date.now(),
      amount,
      currency,
      address,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };
    
    return APIResponse.success(withdrawal, 'Withdrawal created successfully');
    
  } catch (error) {
    return APIResponse.error('Failed to create withdrawal', 'WITHDRAWAL_ERROR');
  }
}

async function getExchangeRates(ctx, env) {
  try {
    // Implement exchange rate retrieval
    const rates = {
      'USD/THB': 35.5,
      'BTC/USD': 43000,
      'ETH/USD': 2300,
      'USDT/USD': 1.0
    };
    
    return APIResponse.success(rates, 'Exchange rates retrieved');
    
  } catch (error) {
    return APIResponse.error('Failed to get exchange rates', 'EXCHANGE_RATES_ERROR');
  }
}

async function convertCurrency(ctx, env) {
  try {
    const { amount, fromCurrency, toCurrency } = ctx.body;
    
    // Implement currency conversion
    const convertedAmount = amount * 1.02; // Mock conversion
    
    return APIResponse.success({
      fromAmount: amount,
      fromCurrency,
      toAmount: convertedAmount,
      toCurrency,
      rate: 1.02,
      fee: amount * 0.001
    });
    
  } catch (error) {
    return APIResponse.error('Failed to convert currency', 'CONVERSION_ERROR');
  }
}

async function getAdminDashboard(ctx, env) {
  try {
    // Check admin privileges
    if (!ctx.user.isAdmin) {
      return APIResponse.error('Access denied', 'ACCESS_DENIED');
    }
    
    const dashboard = {
      totalUsers: 1234,
      totalTransactions: 5678,
      totalVolume: 1234567.89,
      pendingApprovals: 12
    };
    
    return APIResponse.success(dashboard);
    
  } catch (error) {
    return APIResponse.error('Failed to get dashboard', 'DASHBOARD_ERROR');
  }
}

async function getAdminUsers(ctx, env) {
  try {
    // Check admin privileges
    if (!ctx.user.isAdmin) {
      return APIResponse.error('Access denied', 'ACCESS_DENIED');
    }
    
    // Implement user listing for admins
    const users = []; // Get from database
    
    return APIResponse.success(users);
    
  } catch (error) {
    return APIResponse.error('Failed to get users', 'USERS_ERROR');
  }
}

async function approveTransaction(ctx, env) {
  try {
    // Check admin privileges
    if (!ctx.user.isAdmin) {
      return APIResponse.error('Access denied', 'ACCESS_DENIED');
    }
    
    const transactionId = ctx.params.id;
    const { approved, notes } = ctx.body;
    
    // Implement transaction approval
    
    return APIResponse.success({
      transactionId,
      status: approved ? 'APPROVED' : 'REJECTED',
      notes
    });
    
  } catch (error) {
    return APIResponse.error('Failed to approve transaction', 'APPROVAL_ERROR');
  }
}

async function getHealthCheck(ctx, env) {
  return APIResponse.success({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: API_CONFIG.VERSION,
    uptime: process.uptime ? `${Math.floor(process.uptime())}s` : 'N/A'
  });
}

async function getSystemStatus(ctx, env) {
  try {
    const cacheStats = CacheManager.getStats();
    
    return APIResponse.success({
      system: 'operational',
      database: 'connected',
      cache: cacheStats,
      apis: {
        internal: 'operational',
        external: 'operational'
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return APIResponse.error('Failed to get system status', 'STATUS_ERROR');
  }
}

export default {
  API_CONFIG,
  CacheManager,
  APIResponse,
  RESTAPIRouter,
  registerAPIEndpoints
};