/**
 * Enhanced XSS Protection Module
 * Comprehensive protection against Cross-Site Scripting attacks
 */

/**
 * Content Security Policy configuration
 */
export const CSP_CONFIG = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", 'https://api.telegram.org'],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'https:', 'blob:'],
  'font-src': ["'self'", 'https:', 'data:'],
  'connect-src': ["'self'", 'https://api.telegram.org', 'https://api.cloudflare.com'],
  'media-src': ["'self'"],
  'object-src': ["'none'"],
  'child-src': ["'none'"],
  'worker-src': ["'self'"],
  'frame-ancestors': ["'none'"],
  'form-action': ["'self'"],
  'base-uri': ["'self'"],
  'manifest-src': ["'self'"]
};

/**
 * XSS Protection Headers
 */
export const XSS_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

/**
 * Enhanced XSS Protection Class
 */
export class XSSProtection {
  constructor() {
    this.htmlEntities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;'
    };
    
    this.dangerousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
      /<link\b[^>]*>/gi,
      /<meta\b[^>]*>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /data:text\/html/gi,
      /on\w+\s*=/gi
    ];
  }

  /**
   * Sanitize HTML content
   */
  sanitizeHtml(input) {
    if (typeof input !== 'string') {
      return input;
    }

    // Remove dangerous patterns
    let sanitized = input;
    this.dangerousPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    // Escape HTML entities
    sanitized = sanitized.replace(/[&<>"'`=\/]/g, (match) => {
      return this.htmlEntities[match];
    });

    return sanitized;
  }

  /**
   * Sanitize for use in HTML attributes
   */
  sanitizeAttribute(input) {
    if (typeof input !== 'string') {
      return input;
    }

    // More aggressive sanitization for attributes
    return input.replace(/[^\w\s-_\.]/g, '');
  }

  /**
   * Sanitize for use in URLs
   */
  sanitizeUrl(input) {
    if (typeof input !== 'string') {
      return input;
    }

    // Allow only safe URL schemes
    const allowedSchemes = ['http:', 'https:', 'mailto:', 'tel:'];
    const url = input.toLowerCase().trim();
    
    // Check if URL has a scheme
    if (url.includes(':')) {
      const scheme = url.split(':')[0] + ':';
      if (!allowedSchemes.includes(scheme)) {
        return '#'; // Return safe fallback
      }
    }

    // Remove dangerous characters
    return input.replace(/[<>\"']/g, '');
  }

  /**
   * Sanitize JSON data
   */
  sanitizeJson(input) {
    if (typeof input === 'string') {
      return this.sanitizeHtml(input);
    } else if (Array.isArray(input)) {
      return input.map(item => this.sanitizeJson(item));
    } else if (typeof input === 'object' && input !== null) {
      const sanitized = {};
      for (const [key, value] of Object.entries(input)) {
        const sanitizedKey = this.sanitizeAttribute(key);
        sanitized[sanitizedKey] = this.sanitizeJson(value);
      }
      return sanitized;
    }
    return input;
  }

  /**
   * Validate and sanitize Telegram bot input
   */
  sanitizeTelegramInput(ctx) {
    if (!ctx) return ctx;

    // Sanitize message text
    if (ctx.message?.text) {
      ctx.message.text = this.sanitizeHtml(ctx.message.text);
    }

    // Sanitize callback query data
    if (ctx.callbackQuery?.data) {
      ctx.callbackQuery.data = this.sanitizeAttribute(ctx.callbackQuery.data);
    }

    // Sanitize inline query
    if (ctx.inlineQuery?.query) {
      ctx.inlineQuery.query = this.sanitizeHtml(ctx.inlineQuery.query);
    }

    // Sanitize user data
    if (ctx.from) {
      ctx.from.first_name = this.sanitizeHtml(ctx.from.first_name || '');
      ctx.from.last_name = this.sanitizeHtml(ctx.from.last_name || '');
      ctx.from.username = this.sanitizeAttribute(ctx.from.username || '');
    }

    return ctx;
  }

  /**
   * Generate Content Security Policy header
   */
  generateCSPHeader() {
    const cspDirectives = Object.entries(CSP_CONFIG)
      .map(([directive, values]) => `${directive} ${values.join(' ')}`)
      .join('; ');
    
    return cspDirectives;
  }

  /**
   * Apply XSS protection headers to response
   */
  applyXSSHeaders(response) {
    const headers = new Headers(response.headers);
    
    // Add CSP header
    headers.set('Content-Security-Policy', this.generateCSPHeader());
    
    // Add XSS protection headers
    Object.entries(XSS_HEADERS).forEach(([header, value]) => {
      headers.set(header, value);
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: headers
    });
  }

  /**
   * Validate input against XSS patterns
   */
  validateInput(input) {
    if (typeof input !== 'string') {
      return { valid: true, input };
    }

    const violations = [];
    
    // Check for dangerous patterns
    this.dangerousPatterns.forEach((pattern, index) => {
      if (pattern.test(input)) {
        violations.push({
          pattern: pattern.toString(),
          type: 'dangerous_html',
          index
        });
      }
    });

    if (violations.length > 0) {
      return {
        valid: false,
        violations,
        sanitized: this.sanitizeHtml(input)
      };
    }

    return { valid: true, input };
  }

  /**
   * Create secure response with XSS protection
   */
  createSecureResponse(data, options = {}) {
    const {
      status = 200,
      headers = {},
      sanitizeOutput = true
    } = options;

    // Sanitize output data if requested
    const responseData = sanitizeOutput ? this.sanitizeJson(data) : data;
    
    // Create response with security headers
    const response = new Response(JSON.stringify(responseData), {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    });

    // Apply XSS protection headers
    return this.applyXSSHeaders(response);
  }

  /**
   * Log XSS attempt
   */
  async logXSSAttempt(attempt, env) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: 'XSS_ATTEMPT',
      attempt: {
        input: attempt.input?.substring(0, 1000), // Limit log size
        violations: attempt.violations,
        userAgent: attempt.userAgent,
        ip: attempt.ip,
        userId: attempt.userId
      },
      severity: 'HIGH'
    };

    if (env.SECURITY_LOG_KV) {
      await env.SECURITY_LOG_KV.put(
        `xss_attempt_${Date.now()}`,
        JSON.stringify(logEntry),
        { expirationTtl: 86400 * 30 } // Keep for 30 days
      );
    }

    console.warn('XSS attempt detected:', logEntry);
  }

  /**
   * Middleware for Telegram bot XSS protection
   */
  createTelegramMiddleware(env) {
    return async (ctx, next) => {
      try {
        // Sanitize incoming data
        ctx = this.sanitizeTelegramInput(ctx);
        
        // Validate critical inputs
        const criticalInputs = [
          ctx.message?.text,
          ctx.callbackQuery?.data,
          ctx.inlineQuery?.query
        ].filter(Boolean);

        for (const input of criticalInputs) {
          const validation = this.validateInput(input);
          if (!validation.valid) {
            // Log XSS attempt
            await this.logXSSAttempt({
              input,
              violations: validation.violations,
              userId: ctx.from?.id,
              userAgent: 'Telegram Bot',
              ip: 'unknown'
            }, env);

            // Block the request
            await ctx.reply('❌ ข้อมูลที่ส่งมาไม่ปลอดภัย กรุณาลองใหม่ / Unsafe input detected');
            return;
          }
        }

        // Add XSS protection methods to context
        ctx.xss = {
          sanitize: this.sanitizeHtml.bind(this),
          sanitizeAttribute: this.sanitizeAttribute.bind(this),
          sanitizeUrl: this.sanitizeUrl.bind(this),
          createSecureResponse: this.createSecureResponse.bind(this)
        };

        await next();
      } catch (error) {
        console.error('XSS Protection middleware error:', error);
        await next();
      }
    };
  }
}

/**
 * Enhanced input sanitization for Telegram
 */
export function enhancedSanitizeInput(input) {
  const xssProtection = new XSSProtection();
  return xssProtection.sanitizeHtml(input);
}

/**
 * Create XSS protection instance
 */
export function createXSSProtection() {
  return new XSSProtection();
}

/**
 * Apply security headers to all responses
 */
export function createSecurityHeadersMiddleware() {
  const xssProtection = new XSSProtection();
  
  return (request, response) => {
    return xssProtection.applyXSSHeaders(response);
  };
}