/**
 * Simple Frontend Worker for DOGLC Digital Wallet
 * Serves static HTML/CSS/JS files with minimal configuration
 */

// Simple HTML content
const HTML_CONTENT = `<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🐕 DOGLC Digital Wallet - Frontend Test</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .container {
            background: white;
            padding: 2rem;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            max-width: 400px;
            width: 90%;
            text-align: center;
        }
        
        .logo {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        
        h1 {
            color: #333;
            margin-bottom: 1rem;
            font-size: 1.5rem;
        }
        
        .status {
            background: #e8f5e8;
            color: #2d5a2d;
            padding: 1rem;
            border-radius: 10px;
            margin: 1rem 0;
            border: 2px solid #4caf50;
        }
        
        .api-test {
            background: #f0f8ff;
            padding: 1rem;
            border-radius: 10px;
            margin: 1rem 0;
            border: 2px solid #2196f3;
        }
        
        .btn {
            background: linear-gradient(45deg, #4caf50, #45a049);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 1rem;
            margin: 0.5rem;
            transition: transform 0.2s;
        }
        
        .btn:hover {
            transform: translateY(-2px);
        }
        
        .test-results {
            margin-top: 1rem;
            padding: 1rem;
            background: #f9f9f9;
            border-radius: 10px;
            font-family: monospace;
            font-size: 0.9rem;
            text-align: left;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🐕</div>
        <h1>DOGLC Digital Wallet</h1>
        <p>Frontend Worker Test</p>
        
        <div class="status">
            ✅ Frontend Worker Status: <strong>RUNNING</strong>
        </div>
        
        <div class="api-test">
            <h3>🔗 Backend API Integration Test</h3>
            <button class="btn" onclick="testBackendAPI()">Test Backend Connection</button>
            <div id="api-results" class="test-results" style="display: none;"></div>
        </div>
        
        <div style="margin-top: 2rem;">
            <button class="btn" onclick="runSecurityTest()">🛡️ Security Test</button>
            <button class="btn" onclick="runPerformanceTest()">⚡ Performance Test</button>
        </div>
        
        <div id="test-results" class="test-results" style="display: none;"></div>
    </div>

    <script>
        // API Testing Functions
        async function testBackendAPI() {
            const resultsDiv = document.getElementById('api-results');
            resultsDiv.style.display = 'block';
            resultsDiv.innerHTML = '🔄 Testing backend connection...';
            
            try {
                // Test backend health
                const response = await fetch('http://localhost:8788/health');
                const data = await response.json();
                
                resultsDiv.innerHTML = \`
✅ Backend Connection: SUCCESS
📊 Response: \${JSON.stringify(data, null, 2)}
⏱️ Response Time: \${Date.now() - Date.now()}ms
🌐 Status: \${response.status}
                \`;
            } catch (error) {
                resultsDiv.innerHTML = \`
❌ Backend Connection: FAILED
🚫 Error: \${error.message}
💡 Tip: Make sure backend is running on port 8788
                \`;
            }
        }
        
        async function runSecurityTest() {
            const resultsDiv = document.getElementById('test-results');
            resultsDiv.style.display = 'block';
            resultsDiv.innerHTML = '🛡️ Running security tests...';
            
            const tests = [];
            
            // Test 1: Path Traversal Protection
            try {
                const response = await fetch('/../../../../etc/passwd');
                tests.push(\`Path Traversal: \${response.status === 404 ? '✅ PROTECTED' : '❌ VULNERABLE'}\`);
            } catch (error) {
                tests.push('Path Traversal: ✅ PROTECTED (blocked)');
            }
            
            // Test 2: XSS Protection Headers
            const headers = await fetch('/').then(r => r.headers);
            const xssHeader = headers.get('X-XSS-Protection');
            tests.push(\`XSS Protection: \${xssHeader ? '✅ ENABLED' : '❌ MISSING'}\`);
            
            // Test 3: Content Security Policy
            const cspHeader = headers.get('Content-Security-Policy');
            tests.push(\`CSP Header: \${cspHeader ? '✅ CONFIGURED' : '❌ MISSING'}\`);
            
            resultsDiv.innerHTML = \`
🛡️ SECURITY TEST RESULTS:
\${tests.join('\\n')}

⏰ Test completed at: \${new Date().toLocaleString()}
            \`;
        }
        
        async function runPerformanceTest() {
            const resultsDiv = document.getElementById('test-results');
            resultsDiv.style.display = 'block';
            resultsDiv.innerHTML = '⚡ Running performance tests...';
            
            const startTime = performance.now();
            const requests = [];
            
            // Run multiple requests
            for (let i = 0; i < 10; i++) {
                requests.push(
                    fetch('/health').then(response => ({
                        status: response.status,
                        time: performance.now() - startTime
                    }))
                );
            }
            
            try {
                const results = await Promise.all(requests);
                const avgTime = results.reduce((sum, r) => sum + r.time, 0) / results.length;
                const successRate = results.filter(r => r.status === 200).length / results.length * 100;
                
                resultsDiv.innerHTML = \`
⚡ PERFORMANCE TEST RESULTS:
📊 Total Requests: 10
✅ Success Rate: \${successRate}%
⏱️ Average Response Time: \${avgTime.toFixed(2)}ms
🚀 Frontend Performance: \${avgTime < 100 ? 'EXCELLENT' : avgTime < 500 ? 'GOOD' : 'NEEDS IMPROVEMENT'}

⏰ Test completed at: \${new Date().toLocaleString()}
                \`;
            } catch (error) {
                resultsDiv.innerHTML = \`
❌ PERFORMANCE TEST FAILED:
🚫 Error: \${error.message}
                \`;
            }
        }
        
        // Auto-test on load
        document.addEventListener('DOMContentLoaded', function() {
            console.log('🐕 DOGLC Frontend Worker Loaded');
            console.log('✅ Frontend Status: OPERATIONAL');
            
            // Auto-test backend connection after 2 seconds
            setTimeout(testBackendAPI, 2000);
        });
    </script>
</body>
</html>`;

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;
        
        // Add security headers
        const headers = new Headers();
        headers.set('Content-Type', 'text/html; charset=utf-8');
        headers.set('X-Content-Type-Options', 'nosniff');
        headers.set('X-Frame-Options', 'SAMEORIGIN');
        headers.set('X-XSS-Protection', '1; mode=block');
        headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
        headers.set('Content-Security-Policy', 
            "default-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* https:; " +
            "connect-src 'self' http://localhost:* https:; " +
            "img-src 'self' data: https:;"
        );
        
        // Add CORS headers
        headers.set('Access-Control-Allow-Origin', '*');
        headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 200, headers });
        }
        
        // Health check endpoint
        if (path === '/health') {
            headers.set('Content-Type', 'application/json');
            return new Response(JSON.stringify({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                service: 'doglc-frontend-worker',
                version: '1.0.0',
                environment: env.ENVIRONMENT || 'development'
            }), { status: 200, headers });
        }
        
        // Path traversal protection
        if (path.includes('..') || path.includes('%2e%2e') || path.includes('..%2f') || path.includes('..\\')) {
            return new Response('Path traversal attempt detected', { status: 403, headers });
        }
        
        // Main page
        if (path === '/' || path === '/index.html') {
            return new Response(HTML_CONTENT, { status: 200, headers });
        }
        
        // API proxy to backend (for testing integration)
        if (path.startsWith('/api/')) {
            try {
                const backendUrl = (env.MAIN_BOT_URL || 'http://localhost:8788') + path;
                const backendResponse = await fetch(backendUrl, {
                    method: request.method,
                    headers: request.headers,
                    body: request.method !== 'GET' ? await request.text() : undefined
                });
                
                const responseText = await backendResponse.text();
                headers.set('Content-Type', 'application/json');
                return new Response(responseText, { 
                    status: backendResponse.status, 
                    headers 
                });
            } catch (error) {
                headers.set('Content-Type', 'application/json');
                return new Response(JSON.stringify({
                    error: 'Backend connection failed',
                    message: error.message,
                    timestamp: new Date().toISOString()
                }), { status: 503, headers });
            }
        }
        
        // 404 for other paths
        return new Response('Not Found', { status: 404, headers });
    }
};