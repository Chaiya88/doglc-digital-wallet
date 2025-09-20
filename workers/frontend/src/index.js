/**
 * Cloudflare Worker for Frontend Static Files
 * Serves the Digital Wallet Mini App Frontend
 */

import { Hono } from 'hono';
import { serveStatic } from 'hono/cloudflare-workers';
import { cors } from 'hono/cors';

const app = new Hono();

// CORS configuration
app.use('/*', cors({
  origin: ['https://web.telegram.org', 'https://telegram.org', 'http://localhost:*'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Telegram-User'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Security headers middleware
app.use('/*', async (c, next) => {
  await next();
  
  // Add security headers
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'SAMEORIGIN');
  c.header('X-XSS-Protection', '1; mode=block');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header('Content-Security-Policy', 
    "default-src 'self' https://telegram.org https://web.telegram.org; " +
    "script-src 'self' 'unsafe-inline' https://telegram.org; " +
    "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; " +
    "font-src 'self' https://cdnjs.cloudflare.com; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://api.telegram.org https://*.workers.dev;"
  );
});

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'doglc-frontend-worker',
    version: '1.0.0'
  });
});

// Main HTML file
app.get('/', async (c) => {
  try {
    const html = await getStaticFile('index.html');
    return c.html(html);
  } catch (error) {
    console.error('Error serving index.html:', error);
    return c.html(getErrorHTML('Failed to load application'), 500);
  }
});

// Static file serving
app.get('/styles/*', async (c) => {
  const path = c.req.path.replace('/styles/', '');
  try {
    const file = await getStaticFile(`styles/${path}`);
    const mimeType = getMimeType(path);
    return new Response(file, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000'
      }
    });
  } catch (error) {
    return c.notFound();
  }
});

app.get('/js/*', async (c) => {
  const path = c.req.path.replace('/js/', '');
  try {
    const file = await getStaticFile(`js/${path}`);
    return new Response(file, {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=31536000'
      }
    });
  } catch (error) {
    return c.notFound();
  }
});

// API proxy endpoints (optional - for future use)
app.get('/api/*', async (c) => {
  const apiUrl = c.env.API_BASE_URL || 'https://api.doglc.workers.dev';
  const path = c.req.path.replace('/api', '');
  
  try {
    const response = await fetch(`${apiUrl}${path}`, {
      method: c.req.method,
      headers: c.req.headers,
      body: c.req.body
    });
    
    return new Response(response.body, {
      status: response.status,
      headers: response.headers
    });
  } catch (error) {
    return c.json({ error: 'API request failed' }, 500);
  }
});

// 404 handler
app.notFound((c) => {
  return c.html(getErrorHTML('Page not found'), 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Worker error:', err);
  return c.html(getErrorHTML('Internal server error'), 500);
});

/**
 * Get static file content
 */
async function getStaticFile(path) {
  // In a real deployment, these would be stored in KV or R2
  // For now, we'll inline the content or use imports
  
  const staticFiles = {
    'index.html': getIndexHTML(),
    'styles/app.css': getAppCSS(),
    'js/telegram-api.js': getTelegramAPIJS(),
    'js/wallet-api.js': getWalletAPIJS(),
    'js/app.js': getAppJS()
  };
  
  const content = staticFiles[path];
  if (!content) {
    throw new Error(`File not found: ${path}`);
  }
  
  return content;
}

/**
 * Get MIME type for file extension
 */
function getMimeType(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const mimeTypes = {
    'html': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',
    'json': 'application/json',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'ico': 'image/x-icon',
    'ttf': 'font/ttf',
    'woff': 'font/woff',
    'woff2': 'font/woff2'
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Get index.html content
 */
function getIndexHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Doglc Digital Wallet - Premium</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    <link rel="stylesheet" href="./styles/app.css">
</head>
<body>
    <div class="app-container">
        <div class="header">
            <div class="user-info">
                <div class="user-avatar" id="user-avatar">U</div>
                <div>
                    <div class="user-name" id="user-name">Guest User</div>
                    <div class="user-role" id="user-role">Standard Member</div>
                </div>
            </div>
            <div class="header-actions">
                <button class="icon-button" onclick="showNotifications()">
                    <i class="fas fa-bell"></i>
                    <span class="notification-dot" id="notification-dot" style="display: none;"></span>
                </button>
                <button class="icon-button" onclick="toggleDarkMode()">
                    <i class="fas fa-moon" id="theme-icon"></i>
                </button>
            </div>
        </div>

        <div class="tabs">
            <div class="tab active" data-tab="portfolio">Portfolio</div>
            <div class="tab" data-tab="market">Market</div>
            <div class="tab" data-tab="transactions">History</div>
            <div class="tab" data-tab="settings">Settings</div>
        </div>

        <div id="portfolio-tab" class="tab-content active">
            <div class="card">
                <div class="balance-container">
                    <div class="balance-label">Total Balance</div>
                    <div class="balance-amount" id="total-balance">฿0.00</div>
                    <div class="balance-change positive" id="balance-change">
                        <i class="fas fa-arrow-up"></i>
                        <span>+0.00%</span>
                    </div>
                </div>
            </div>

            <div class="action-buttons">
                <div class="action-button" onclick="depositMoney()">
                    <div class="action-icon"><i class="fas fa-plus"></i></div>
                    <div class="action-label">Deposit</div>
                </div>
                <div class="action-button" onclick="withdrawMoney()">
                    <div class="action-icon"><i class="fas fa-minus"></i></div>
                    <div class="action-label">Withdraw</div>
                </div>
                <div class="action-button" onclick="sendMoney()">
                    <div class="action-icon"><i class="fas fa-paper-plane"></i></div>
                    <div class="action-label">Send</div>
                </div>
                <div class="action-button" onclick="receiveMoney()">
                    <div class="action-icon"><i class="fas fa-qrcode"></i></div>
                    <div class="action-label">Receive</div>
                </div>
            </div>

            <div class="card">
                <div class="card-title">
                    <i class="fas fa-wallet"></i>
                    My Assets
                </div>
                <div class="assets-grid" id="assets-grid">
                    <!-- Assets will be loaded dynamically -->
                </div>
            </div>

            <div class="card">
                <div class="card-title">
                    <i class="fas fa-chart-line"></i>
                    Portfolio Performance
                </div>
                <div class="chart-container">
                    <canvas id="portfolio-chart" class="chart"></canvas>
                </div>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value" id="daily-change">+0.00%</div>
                        <div class="stat-label">24h Change</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="weekly-change">+0.00%</div>
                        <div class="stat-label">7d Change</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="monthly-change">+0.00%</div>
                        <div class="stat-label">30d Change</div>
                    </div>
                </div>
            </div>
        </div>

        <div id="market-tab" class="tab-content">
            <div class="card">
                <div class="card-title">
                    <i class="fas fa-chart-bar"></i>
                    Market Overview
                </div>
                <div class="market-tabs">
                    <div class="market-tab active" data-market="trending">Trending</div>
                    <div class="market-tab" data-market="gainers">Gainers</div>
                    <div class="market-tab" data-market="losers">Losers</div>
                    <div class="market-tab" data-market="volume">Volume</div>
                </div>
                <div class="market-list" id="market-list">
                    <!-- Market data will be loaded dynamically -->
                </div>
            </div>
        </div>

        <div id="transactions-tab" class="tab-content">
            <div class="card">
                <div class="card-title">
                    <i class="fas fa-history"></i>
                    Transaction History
                </div>
                <div class="transaction-list" id="transaction-list">
                    <!-- Transactions will be loaded dynamically -->
                </div>
            </div>
        </div>

        <div id="settings-tab" class="tab-content">
            <div class="card">
                <div class="card-title">
                    <i class="fas fa-user-circle"></i>
                    Profile Settings
                </div>
                <div class="settings-item">
                    <div class="settings-label">Notifications</div>
                    <label class="switch">
                        <input type="checkbox" id="notifications-toggle" checked>
                        <span class="slider"></span>
                    </label>
                </div>
                <div class="settings-item">
                    <div class="settings-label">Dark Mode</div>
                    <label class="switch">
                        <input type="checkbox" id="dark-mode-toggle">
                        <span class="slider"></span>
                    </label>
                </div>
            </div>

            <div class="card">
                <div class="card-title">
                    <i class="fas fa-language"></i>
                    Language Settings
                </div>
                <div class="language-option" data-lang="th">
                    <div class="language-flag">🇹🇭</div>
                    <div class="language-name">ภาษาไทย</div>
                    <div class="language-check"><i class="fas fa-check"></i></div>
                </div>
                <div class="language-option" data-lang="en">
                    <div class="language-flag">🇺🇸</div>
                    <div class="language-name">English</div>
                    <div class="language-check"></div>
                </div>
                <div class="language-option" data-lang="zh">
                    <div class="language-flag">🇨🇳</div>
                    <div class="language-name">中文</div>
                    <div class="language-check"></div>
                </div>
            </div>

            <div class="card">
                <div class="card-title">
                    <i class="fas fa-shield-alt"></i>
                    Security
                </div>
                <div class="security-status">
                    <div class="security-icon">
                        <i class="fas fa-lock"></i>
                    </div>
                    <div class="security-details">
                        <div class="security-label">Account Security</div>
                        <div class="security-description">Your account is secured with 2FA</div>
                    </div>
                    <div class="security-action">
                        <button class="icon-button">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-title">
                    <i class="fas fa-cogs"></i>
                    Quick Actions
                </div>
                <div class="quick-actions">
                    <div class="quick-action" onclick="exportData()">
                        <div class="quick-action-icon"><i class="fas fa-download"></i></div>
                        <div class="quick-action-label">Export Data</div>
                    </div>
                    <div class="quick-action" onclick="supportChat()">
                        <div class="quick-action-icon"><i class="fas fa-headset"></i></div>
                        <div class="quick-action-label">Support</div>
                    </div>
                    <div class="quick-action" onclick="about()">
                        <div class="quick-action-icon"><i class="fas fa-info-circle"></i></div>
                        <div class="quick-action-label">About</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="bottom-nav">
            <div class="nav-item active" data-tab="portfolio">
                <div class="nav-icon"><i class="fas fa-home"></i></div>
                <div class="nav-label">Home</div>
            </div>
            <div class="nav-item" data-tab="market">
                <div class="nav-icon"><i class="fas fa-chart-line"></i></div>
                <div class="nav-label">Market</div>
            </div>
            <div class="nav-item" data-tab="transactions">
                <div class="nav-icon"><i class="fas fa-exchange-alt"></i></div>
                <div class="nav-label">History</div>
            </div>
            <div class="nav-item" data-tab="settings">
                <div class="nav-icon"><i class="fas fa-cog"></i></div>
                <div class="nav-label">Settings</div>
            </div>
        </div>
    </div>

    <!-- Toast notification -->
    <div id="toast" class="toast"></div>

    <!-- Scripts -->
    <script src="./js/telegram-api.js" type="module"></script>
    <script src="./js/wallet-api.js" type="module"></script>
    <script src="./js/app.js" type="module"></script>
</body>
</html>`;
}

/**
 * Get app.css content (placeholder - would be loaded from file in production)
 */
function getAppCSS() {
  // This would contain the CSS content
  // For brevity, returning a comment - in production, load from file or KV
  return `/* CSS content would be loaded from the actual file */`;
}

/**
 * Get JavaScript file content (placeholder)
 */
function getTelegramAPIJS() {
  return `/* Telegram API JS content would be loaded from the actual file */`;
}

function getWalletAPIJS() {
  return `/* Wallet API JS content would be loaded from the actual file */`;
}

function getAppJS() {
  return `/* App JS content would be loaded from the actual file */`;
}

/**
 * Get error HTML
 */
function getErrorHTML(message) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error - DOGLC Digital Wallet</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
            box-sizing: border-box;
        }
        .error-container {
            text-align: center;
            max-width: 400px;
        }
        .error-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
        }
        .error-title {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
            font-weight: 600;
        }
        .error-message {
            color: #94a3b8;
            margin-bottom: 2rem;
        }
        .retry-button {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 1rem;
            cursor: pointer;
            transition: background 0.2s;
        }
        .retry-button:hover {
            background: #2563eb;
        }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="error-icon">⚠️</div>
        <div class="error-title">Oops! Something went wrong</div>
        <div class="error-message">${message}</div>
        <button class="retry-button" onclick="window.location.reload()">
            Try Again
        </button>
    </div>
</body>
</html>`;
}

export default app;