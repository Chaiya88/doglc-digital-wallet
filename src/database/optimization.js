/**
 * Database Optimization System for Digital Wallet
 * High-performance database operations with caching and indexing
 */

import { logSecurityEvent, SECURITY_EVENT_TYPES, SEVERITY_LEVELS } from '../utils/security-logger.js';
import { formatCurrency, formatDateTime } from '../utils/helpers.js';

/**
 * Database Configuration
 */
export const DATABASE_CONFIG = {
  // Connection Settings
  CONNECTION: {
    MAX_CONNECTIONS: 100,
    CONNECTION_TIMEOUT: 30000,
    IDLE_TIMEOUT: 300000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000
  },
  
  // Query Optimization
  QUERY: {
    DEFAULT_LIMIT: 100,
    MAX_LIMIT: 1000,
    QUERY_TIMEOUT: 30000,
    EXPLAIN_THRESHOLD: 1000, // ms
    SLOW_QUERY_THRESHOLD: 5000 // ms
  },
  
  // Cache Settings
  CACHE: {
    QUERY_CACHE_TTL: 300, // 5 minutes
    SCHEMA_CACHE_TTL: 3600, // 1 hour
    INDEX_CACHE_TTL: 1800, // 30 minutes
    MAX_CACHE_ENTRIES: 10000
  },
  
  // Index Configuration
  INDEXES: {
    AUTO_CREATE: true,
    ANALYZE_FREQUENCY: 3600000, // 1 hour
    REBUILD_THRESHOLD: 0.1 // 10% fragmentation
  },
  
  // Backup Settings
  BACKUP: {
    ENABLED: true,
    INTERVAL: 86400000, // 24 hours
    RETENTION_DAYS: 30,
    COMPRESSION: true
  }
};

/**
 * Database Schema Optimization
 */
export const OPTIMIZED_SCHEMA = {
  
  // Users table with optimizations
  users: {
    id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
    telegram_id: 'INTEGER UNIQUE NOT NULL',
    username: 'TEXT NOT NULL',
    email: 'TEXT UNIQUE',
    phone: 'TEXT',
    password_hash: 'TEXT',
    vip_tier: "TEXT DEFAULT 'BRONZE' CHECK(vip_tier IN ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'))",
    status: "TEXT DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'SUSPENDED', 'PENDING', 'BLOCKED'))",
    language: "TEXT DEFAULT 'th'",
    created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
    updated_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
    last_login: 'DATETIME',
    
    // Indexes for optimization
    indexes: [
      'CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id)',
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX IF NOT EXISTS idx_users_status ON users(status)',
      'CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_users_vip_tier ON users(vip_tier)',
      'CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login)'
    ]
  },
  
  // Balances table with partitioning strategy
  balances: {
    id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
    user_id: 'INTEGER NOT NULL',
    currency: 'TEXT NOT NULL',
    amount: 'DECIMAL(20,8) DEFAULT 0',
    locked_amount: 'DECIMAL(20,8) DEFAULT 0',
    updated_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
    
    // Constraints
    constraints: [
      'FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE',
      'UNIQUE(user_id, currency)',
      'CHECK(amount >= 0)',
      'CHECK(locked_amount >= 0)',
      'CHECK(locked_amount <= amount)'
    ],
    
    // Indexes for fast balance lookups
    indexes: [
      'CREATE INDEX IF NOT EXISTS idx_balances_user_id ON balances(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_balances_currency ON balances(currency)',
      'CREATE INDEX IF NOT EXISTS idx_balances_user_currency ON balances(user_id, currency)',
      'CREATE INDEX IF NOT EXISTS idx_balances_amount ON balances(amount)',
      'CREATE INDEX IF NOT EXISTS idx_balances_updated_at ON balances(updated_at)'
    ]
  },
  
  // Transactions table with optimization
  transactions: {
    id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
    user_id: 'INTEGER NOT NULL',
    type: "TEXT NOT NULL CHECK(type IN ('DEPOSIT', 'WITHDRAWAL', 'CONVERSION', 'TRANSFER', 'FEE'))",
    status: "TEXT DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REQUIRES_APPROVAL'))",
    amount: 'DECIMAL(20,8) NOT NULL',
    currency: 'TEXT NOT NULL',
    fee: 'DECIMAL(20,8) DEFAULT 0',
    exchange_rate: 'DECIMAL(20,8)',
    from_currency: 'TEXT',
    to_currency: 'TEXT',
    reference_id: 'TEXT UNIQUE',
    description: 'TEXT',
    metadata: 'TEXT', // JSON
    admin_notes: 'TEXT',
    approved_by: 'INTEGER',
    approved_at: 'DATETIME',
    created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
    updated_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
    completed_at: 'DATETIME',
    
    // Constraints
    constraints: [
      'FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE',
      'FOREIGN KEY (approved_by) REFERENCES users(id)',
      'CHECK(amount > 0)',
      'CHECK(fee >= 0)'
    ],
    
    // Comprehensive indexes for transaction queries
    indexes: [
      'CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type)',
      'CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status)',
      'CREATE INDEX IF NOT EXISTS idx_transactions_currency ON transactions(currency)',
      'CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_transactions_reference_id ON transactions(reference_id)',
      'CREATE INDEX IF NOT EXISTS idx_transactions_user_status ON transactions(user_id, status)',
      'CREATE INDEX IF NOT EXISTS idx_transactions_user_type ON transactions(user_id, type)',
      'CREATE INDEX IF NOT EXISTS idx_transactions_user_created ON transactions(user_id, created_at)',
      'CREATE INDEX IF NOT EXISTS idx_transactions_status_created ON transactions(status, created_at)',
      'CREATE INDEX IF NOT EXISTS idx_transactions_type_created ON transactions(type, created_at)',
      'CREATE INDEX IF NOT EXISTS idx_transactions_amount ON transactions(amount)',
      'CREATE INDEX IF NOT EXISTS idx_transactions_completed_at ON transactions(completed_at)'
    ]
  },
  
  // Admin logs for audit trail
  admin_logs: {
    id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
    admin_id: 'INTEGER NOT NULL',
    action: 'TEXT NOT NULL',
    target_type: 'TEXT', // user, transaction, system
    target_id: 'TEXT',
    old_data: 'TEXT', // JSON
    new_data: 'TEXT', // JSON
    ip_address: 'TEXT',
    user_agent: 'TEXT',
    created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
    
    // Constraints
    constraints: [
      'FOREIGN KEY (admin_id) REFERENCES users(id)'
    ],
    
    // Indexes for audit queries
    indexes: [
      'CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id)',
      'CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON admin_logs(action)',
      'CREATE INDEX IF NOT EXISTS idx_admin_logs_target ON admin_logs(target_type, target_id)',
      'CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_created ON admin_logs(admin_id, created_at)'
    ]
  },
  
  // System settings cache
  system_settings: {
    key: 'TEXT PRIMARY KEY',
    value: 'TEXT NOT NULL',
    description: 'TEXT',
    updated_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
    updated_by: 'INTEGER',
    
    // Constraints
    constraints: [
      'FOREIGN KEY (updated_by) REFERENCES users(id)'
    ],
    
    // Indexes
    indexes: [
      'CREATE INDEX IF NOT EXISTS idx_system_settings_updated_at ON system_settings(updated_at)'
    ]
  },
  
  // Exchange rates cache
  exchange_rates: {
    id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
    from_currency: 'TEXT NOT NULL',
    to_currency: 'TEXT NOT NULL',
    rate: 'DECIMAL(20,8) NOT NULL',
    source: 'TEXT NOT NULL',
    created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
    
    // Constraints
    constraints: [
      'UNIQUE(from_currency, to_currency, source, DATE(created_at))'
    ],
    
    // Indexes for rate queries
    indexes: [
      'CREATE INDEX IF NOT EXISTS idx_exchange_rates_pair ON exchange_rates(from_currency, to_currency)',
      'CREATE INDEX IF NOT EXISTS idx_exchange_rates_created_at ON exchange_rates(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_exchange_rates_source ON exchange_rates(source)'
    ]
  }
};

/**
 * Database Performance Monitor
 */
export class DatabasePerformanceMonitor {
  
  static stats = {
    queries: {
      total: 0,
      successful: 0,
      failed: 0,
      cached: 0
    },
    timing: {
      total: 0,
      average: 0,
      min: Infinity,
      max: 0,
      slowQueries: []
    },
    connections: {
      active: 0,
      idle: 0,
      waiting: 0
    }
  };
  
  /**
   * Start query monitoring
   */
  static startQuery(query, params = []) {
    const queryId = Date.now() + Math.random();
    const startTime = performance.now();
    
    this.stats.queries.total++;
    
    return {
      queryId,
      startTime,
      query,
      params,
      
      finish: (success = true, cached = false, error = null) => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Update stats
        this.stats.timing.total += duration;
        this.stats.timing.average = this.stats.timing.total / this.stats.queries.total;
        this.stats.timing.min = Math.min(this.stats.timing.min, duration);
        this.stats.timing.max = Math.max(this.stats.timing.max, duration);
        
        if (success) {
          this.stats.queries.successful++;
        } else {
          this.stats.queries.failed++;
        }
        
        if (cached) {
          this.stats.queries.cached++;
        }
        
        // Track slow queries
        if (duration > DATABASE_CONFIG.QUERY.SLOW_QUERY_THRESHOLD) {
          this.stats.timing.slowQueries.push({
            query: this.sanitizeQuery(query),
            duration,
            timestamp: new Date(),
            error
          });
          
          // Keep only last 100 slow queries
          if (this.stats.timing.slowQueries.length > 100) {
            this.stats.timing.slowQueries.shift();
          }
          
          console.warn(`Slow query detected: ${duration.toFixed(2)}ms`);
        }
        
        // Log query performance
        if (duration > DATABASE_CONFIG.QUERY.EXPLAIN_THRESHOLD) {
          this.explainQuery(query, params, duration);
        }
        
        return {
          queryId,
          duration,
          success,
          cached,
          error
        };
      }
    };
  }
  
  /**
   * Get performance statistics
   */
  static getStats() {
    const successRate = this.stats.queries.total > 0 
      ? ((this.stats.queries.successful / this.stats.queries.total) * 100).toFixed(2)
      : 0;
      
    const cacheHitRate = this.stats.queries.total > 0
      ? ((this.stats.queries.cached / this.stats.queries.total) * 100).toFixed(2)
      : 0;
    
    return {
      ...this.stats,
      successRate: `${successRate}%`,
      cacheHitRate: `${cacheHitRate}%`,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Reset statistics
   */
  static resetStats() {
    this.stats = {
      queries: {
        total: 0,
        successful: 0,
        failed: 0,
        cached: 0
      },
      timing: {
        total: 0,
        average: 0,
        min: Infinity,
        max: 0,
        slowQueries: []
      },
      connections: {
        active: 0,
        idle: 0,
        waiting: 0
      }
    };
  }
  
  /**
   * Sanitize query for logging
   */
  static sanitizeQuery(query) {
    return query
      .replace(/\s+/g, ' ')
      .substring(0, 200)
      .trim();
  }
  
  /**
   * Explain query performance
   */
  static async explainQuery(query, params, duration) {
    try {
      console.log(`Query analysis - Duration: ${duration.toFixed(2)}ms`);
      console.log(`Query: ${this.sanitizeQuery(query)}`);
      console.log(`Params:`, params);
      
      // Log for analysis
      await logSecurityEvent({
        type: SECURITY_EVENT_TYPES.SYSTEM,
        severity: SEVERITY_LEVELS.MEDIUM,
        description: 'Slow query detected',
        metadata: {
          query: this.sanitizeQuery(query),
          duration,
          params: params?.length || 0
        }
      });
      
    } catch (error) {
      console.error('Query explanation error:', error);
    }
  }
}

/**
 * Query Cache Manager
 */
export class QueryCacheManager {
  
  static cache = new Map();
  static stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    evictions: 0
  };
  
  /**
   * Get cached query result
   */
  static get(query, params = []) {
    const key = this.generateKey(query, params);
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.misses++;
      return null;
    }
    
    // Check expiration
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }
    
    this.stats.hits++;
    return item.result;
  }
  
  /**
   * Cache query result
   */
  static set(query, params = [], result, ttl = DATABASE_CONFIG.CACHE.QUERY_CACHE_TTL) {
    // Check cache size limit
    if (this.cache.size >= DATABASE_CONFIG.CACHE.MAX_CACHE_ENTRIES) {
      this.evictOldest();
    }
    
    const key = this.generateKey(query, params);
    const item = {
      result,
      expires: Date.now() + ttl * 1000,
      created: Date.now(),
      hits: 0
    };
    
    this.cache.set(key, item);
    this.stats.sets++;
  }
  
  /**
   * Invalidate cache by pattern
   */
  static invalidate(pattern) {
    const regex = new RegExp(pattern);
    let count = 0;
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }
    
    this.stats.evictions += count;
    return count;
  }
  
  /**
   * Clear all cache
   */
  static clear() {
    const size = this.cache.size;
    this.cache.clear();
    this.stats.evictions += size;
    return size;
  }
  
  /**
   * Get cache statistics
   */
  static getStats() {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total * 100).toFixed(2) : 0;
    
    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      size: this.cache.size,
      memoryUsage: this.estimateMemoryUsage()
    };
  }
  
  /**
   * Generate cache key
   */
  static generateKey(query, params) {
    const normalizedQuery = query
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
    
    const paramsHash = JSON.stringify(params);
    return `${normalizedQuery}_${paramsHash}`;
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
      this.stats.evictions++;
    }
  }
  
  /**
   * Estimate memory usage
   */
  static estimateMemoryUsage() {
    let size = 0;
    for (const [key, item] of this.cache.entries()) {
      size += key.length * 2;
      size += JSON.stringify(item.result).length * 2;
      size += 64; // overhead
    }
    return `${(size / 1024 / 1024).toFixed(2)} MB`;
  }
}

/**
 * Database Connection Pool
 */
export class DatabaseConnectionPool {
  
  constructor(config = {}) {
    this.config = {
      ...DATABASE_CONFIG.CONNECTION,
      ...config
    };
    
    this.connections = new Map();
    this.available = [];
    this.waiting = [];
    this.stats = {
      created: 0,
      destroyed: 0,
      borrowed: 0,
      returned: 0,
      timeouts: 0
    };
  }
  
  /**
   * Get database connection
   */
  async getConnection() {
    return new Promise((resolve, reject) => {
      // Check for available connection
      if (this.available.length > 0) {
        const connection = this.available.pop();
        this.stats.borrowed++;
        resolve(connection);
        return;
      }
      
      // Check if we can create new connection
      if (this.connections.size < this.config.MAX_CONNECTIONS) {
        this.createConnection()
          .then(connection => {
            this.stats.borrowed++;
            resolve(connection);
          })
          .catch(reject);
        return;
      }
      
      // Wait for available connection
      const timeout = setTimeout(() => {
        const index = this.waiting.indexOf(request);
        if (index > -1) {
          this.waiting.splice(index, 1);
        }
        this.stats.timeouts++;
        reject(new Error('Connection pool timeout'));
      }, this.config.CONNECTION_TIMEOUT);
      
      const request = { resolve, reject, timeout };
      this.waiting.push(request);
    });
  }
  
  /**
   * Return connection to pool
   */
  async returnConnection(connection) {
    try {
      // Check if connection is still valid
      if (await this.validateConnection(connection)) {
        this.available.push(connection);
        this.stats.returned++;
        
        // Serve waiting requests
        if (this.waiting.length > 0) {
          const request = this.waiting.shift();
          clearTimeout(request.timeout);
          const conn = this.available.pop();
          if (conn) {
            request.resolve(conn);
          }
        }
      } else {
        await this.destroyConnection(connection);
      }
      
    } catch (error) {
      console.error('Error returning connection:', error);
      await this.destroyConnection(connection);
    }
  }
  
  /**
   * Create new connection
   */
  async createConnection() {
    try {
      // This would create actual database connection
      const connection = {
        id: `conn_${Date.now()}_${Math.random()}`,
        created: Date.now(),
        lastUsed: Date.now(),
        isValid: true
      };
      
      this.connections.set(connection.id, connection);
      this.stats.created++;
      
      return connection;
      
    } catch (error) {
      console.error('Error creating connection:', error);
      throw error;
    }
  }
  
  /**
   * Destroy connection
   */
  async destroyConnection(connection) {
    try {
      this.connections.delete(connection.id);
      connection.isValid = false;
      this.stats.destroyed++;
      
    } catch (error) {
      console.error('Error destroying connection:', error);
    }
  }
  
  /**
   * Validate connection
   */
  async validateConnection(connection) {
    try {
      // Check if connection is too old
      const maxAge = this.config.IDLE_TIMEOUT;
      if (Date.now() - connection.lastUsed > maxAge) {
        return false;
      }
      
      return connection.isValid;
      
    } catch (error) {
      console.error('Error validating connection:', error);
      return false;
    }
  }
  
  /**
   * Get pool statistics
   */
  getStats() {
    return {
      ...this.stats,
      total: this.connections.size,
      available: this.available.length,
      waiting: this.waiting.length,
      active: this.connections.size - this.available.length
    };
  }
  
  /**
   * Close all connections
   */
  async close() {
    // Cancel waiting requests
    for (const request of this.waiting) {
      clearTimeout(request.timeout);
      request.reject(new Error('Connection pool closed'));
    }
    this.waiting.clear();
    
    // Close all connections
    for (const connection of this.connections.values()) {
      await this.destroyConnection(connection);
    }
    
    this.available.length = 0;
    this.connections.clear();
  }
}

/**
 * Database Query Builder
 */
export class QueryBuilder {
  
  constructor(table) {
    this.table = table;
    this.query = {
      select: [],
      where: [],
      joins: [],
      orderBy: [],
      groupBy: [],
      having: [],
      limit: null,
      offset: null
    };
    this.params = [];
  }
  
  /**
   * SELECT clause
   */
  select(columns = ['*']) {
    this.query.select = Array.isArray(columns) ? columns : [columns];
    return this;
  }
  
  /**
   * WHERE clause
   */
  where(column, operator, value) {
    if (arguments.length === 2) {
      value = operator;
      operator = '=';
    }
    
    this.query.where.push({
      column,
      operator,
      value,
      connector: this.query.where.length > 0 ? 'AND' : null
    });
    
    this.params.push(value);
    return this;
  }
  
  /**
   * OR WHERE clause
   */
  orWhere(column, operator, value) {
    if (arguments.length === 2) {
      value = operator;
      operator = '=';
    }
    
    this.query.where.push({
      column,
      operator,
      value,
      connector: 'OR'
    });
    
    this.params.push(value);
    return this;
  }
  
  /**
   * WHERE IN clause
   */
  whereIn(column, values) {
    const placeholders = values.map(() => '?').join(',');
    
    this.query.where.push({
      column,
      operator: 'IN',
      value: `(${placeholders})`,
      connector: this.query.where.length > 0 ? 'AND' : null,
      raw: true
    });
    
    this.params.push(...values);
    return this;
  }
  
  /**
   * JOIN clause
   */
  join(table, first, operator, second) {
    if (arguments.length === 3) {
      second = operator;
      operator = '=';
    }
    
    this.query.joins.push({
      type: 'INNER',
      table,
      first,
      operator,
      second
    });
    
    return this;
  }
  
  /**
   * LEFT JOIN clause
   */
  leftJoin(table, first, operator, second) {
    if (arguments.length === 3) {
      second = operator;
      operator = '=';
    }
    
    this.query.joins.push({
      type: 'LEFT',
      table,
      first,
      operator,
      second
    });
    
    return this;
  }
  
  /**
   * ORDER BY clause
   */
  orderBy(column, direction = 'ASC') {
    this.query.orderBy.push({ column, direction: direction.toUpperCase() });
    return this;
  }
  
  /**
   * GROUP BY clause
   */
  groupBy(columns) {
    this.query.groupBy = Array.isArray(columns) ? columns : [columns];
    return this;
  }
  
  /**
   * LIMIT clause
   */
  limit(count) {
    this.query.limit = Math.min(count, DATABASE_CONFIG.QUERY.MAX_LIMIT);
    return this;
  }
  
  /**
   * OFFSET clause
   */
  offset(count) {
    this.query.offset = count;
    return this;
  }
  
  /**
   * Build SELECT query
   */
  toSelectSQL() {
    let sql = `SELECT ${this.query.select.join(', ')} FROM ${this.table}`;
    
    // Add JOINs
    for (const join of this.query.joins) {
      sql += ` ${join.type} JOIN ${join.table} ON ${join.first} ${join.operator} ${join.second}`;
    }
    
    // Add WHERE
    if (this.query.where.length > 0) {
      sql += ' WHERE ';
      for (let i = 0; i < this.query.where.length; i++) {
        const condition = this.query.where[i];
        
        if (condition.connector && i > 0) {
          sql += ` ${condition.connector} `;
        }
        
        if (condition.raw) {
          sql += `${condition.column} ${condition.operator} ${condition.value}`;
        } else {
          sql += `${condition.column} ${condition.operator} ?`;
        }
      }
    }
    
    // Add GROUP BY
    if (this.query.groupBy.length > 0) {
      sql += ` GROUP BY ${this.query.groupBy.join(', ')}`;
    }
    
    // Add ORDER BY
    if (this.query.orderBy.length > 0) {
      const orderClauses = this.query.orderBy.map(o => `${o.column} ${o.direction}`);
      sql += ` ORDER BY ${orderClauses.join(', ')}`;
    }
    
    // Add LIMIT
    if (this.query.limit !== null) {
      sql += ` LIMIT ${this.query.limit}`;
    }
    
    // Add OFFSET
    if (this.query.offset !== null) {
      sql += ` OFFSET ${this.query.offset}`;
    }
    
    return sql;
  }
  
  /**
   * Build INSERT query
   */
  toInsertSQL(data) {
    const columns = Object.keys(data);
    const placeholders = columns.map(() => '?').join(', ');
    
    const sql = `INSERT INTO ${this.table} (${columns.join(', ')}) VALUES (${placeholders})`;
    const params = Object.values(data);
    
    return { sql, params };
  }
  
  /**
   * Build UPDATE query
   */
  toUpdateSQL(data) {
    const columns = Object.keys(data);
    const setClauses = columns.map(col => `${col} = ?`).join(', ');
    
    let sql = `UPDATE ${this.table} SET ${setClauses}`;
    let params = Object.values(data);
    
    // Add WHERE clause
    if (this.query.where.length > 0) {
      sql += ' WHERE ';
      for (let i = 0; i < this.query.where.length; i++) {
        const condition = this.query.where[i];
        
        if (condition.connector && i > 0) {
          sql += ` ${condition.connector} `;
        }
        
        sql += `${condition.column} ${condition.operator} ?`;
      }
      
      params = params.concat(this.params);
    }
    
    return { sql, params };
  }
  
  /**
   * Build DELETE query
   */
  toDeleteSQL() {
    let sql = `DELETE FROM ${this.table}`;
    
    // Add WHERE clause
    if (this.query.where.length > 0) {
      sql += ' WHERE ';
      for (let i = 0; i < this.query.where.length; i++) {
        const condition = this.query.where[i];
        
        if (condition.connector && i > 0) {
          sql += ` ${condition.connector} `;
        }
        
        sql += `${condition.column} ${condition.operator} ?`;
      }
    }
    
    return { sql: sql, params: this.params };
  }
}

/**
 * Database Migration Manager
 */
export class MigrationManager {
  
  static migrations = [];
  
  /**
   * Add migration
   */
  static addMigration(version, up, down, description = '') {
    this.migrations.push({
      version,
      up,
      down,
      description,
      timestamp: Date.now()
    });
    
    // Sort by version
    this.migrations.sort((a, b) => a.version - b.version);
  }
  
  /**
   * Run migrations
   */
  static async runMigrations(env) {
    try {
      console.log('🔄 Running database migrations...');
      
      // Get current schema version
      let currentVersion = await this.getCurrentVersion(env);
      
      for (const migration of this.migrations) {
        if (migration.version > currentVersion) {
          console.log(`Running migration ${migration.version}: ${migration.description}`);
          
          try {
            await migration.up(env);
            await this.setCurrentVersion(env, migration.version);
            currentVersion = migration.version;
            
            console.log(`✅ Migration ${migration.version} completed`);
            
          } catch (error) {
            console.error(`❌ Migration ${migration.version} failed:`, error);
            throw error;
          }
        }
      }
      
      console.log('✅ All migrations completed');
      
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  }
  
  /**
   * Rollback migrations
   */
  static async rollbackMigrations(env, targetVersion) {
    try {
      console.log(`🔄 Rolling back migrations to version ${targetVersion}...`);
      
      const currentVersion = await this.getCurrentVersion(env);
      
      for (let i = this.migrations.length - 1; i >= 0; i--) {
        const migration = this.migrations[i];
        
        if (migration.version <= currentVersion && migration.version > targetVersion) {
          console.log(`Rolling back migration ${migration.version}: ${migration.description}`);
          
          try {
            await migration.down(env);
            await this.setCurrentVersion(env, targetVersion);
            
            console.log(`✅ Migration ${migration.version} rolled back`);
            
          } catch (error) {
            console.error(`❌ Rollback ${migration.version} failed:`, error);
            throw error;
          }
        }
      }
      
      console.log('✅ Rollback completed');
      
    } catch (error) {
      console.error('Rollback error:', error);
      throw error;
    }
  }
  
  /**
   * Get current schema version
   */
  static async getCurrentVersion(env) {
    try {
      // This would query the migrations table
      return 0; // Default version
      
    } catch (error) {
      return 0; // First migration
    }
  }
  
  /**
   * Set current schema version
   */
  static async setCurrentVersion(env, version) {
    try {
      // This would update the migrations table
      console.log(`Schema version set to ${version}`);
      
    } catch (error) {
      console.error('Error setting schema version:', error);
      throw error;
    }
  }
}

export default {
  DATABASE_CONFIG,
  OPTIMIZED_SCHEMA,
  DatabasePerformanceMonitor,
  QueryCacheManager,
  DatabaseConnectionPool,
  QueryBuilder,
  MigrationManager
};