# Telegram WebApp Testing Guide

## 🤖 Bot Setup

1. **Create Bot with @BotFather**
   ```
   /newbot
   Bot Name: DOGLC Digital Wallet Test
   Username: doglc_wallet_test_bot
   ```

2. **Enable WebApp**
   ```
   /mybots
   @doglc_wallet_test_bot
   Bot Settings -> Menu Button -> Configure Menu Button
   
   Button Text: 🏦 Open Wallet
   WebApp URL: https://your-frontend-worker.workers.dev
   ```

## 🌐 Production URLs

### Frontend Worker (WebApp)
- **Staging**: `https://doglc-frontend-staging.workers.dev`
- **Production**: `https://doglc-frontend-production.workers.dev`

### Backend API Worker
- **Staging**: `https://doglc-api-v2-staging.workers.dev`
- **Production**: `https://doglc-api-v2-production.workers.dev`

## 🔧 Environment Variables

### Required for Production:
```bash
# Frontend Worker
ENVIRONMENT=production
WORKER_TYPE=frontend
MAIN_BOT_URL=https://doglc-api-v2-production.workers.dev
ALLOWED_ORIGINS=https://web.telegram.org

# Backend API Worker
ENVIRONMENT=production
WORKER_TYPE=api-v2
API_VERSION=2.0.0
TELEGRAM_BOT_TOKEN=your_bot_token_here
```

## 📱 Testing Steps

### 1. Local Testing (Completed ✅)
- Frontend Worker: http://127.0.0.1:8787
- Backend API: http://127.0.0.1:8788
- Integration Tests: Automated

### 2. Staging Deployment
```bash
# Deploy Frontend
cd workers/frontend
npx wrangler deploy --env staging

# Deploy Backend API
cd ../..
npx wrangler deploy --config wrangler-api-v2.toml --env staging
```

### 3. Production Deployment
```bash
# Deploy Frontend
cd workers/frontend
npx wrangler deploy --env production

# Deploy Backend API
cd ../..
npx wrangler deploy --config wrangler-api-v2.toml --env production
```

### 4. Telegram Testing
1. **Open Bot in Telegram**
   - Search for @doglc_wallet_test_bot
   - Start the bot
   - Tap "🏦 Open Wallet" button

2. **Test WebApp Features**
   - Portfolio display
   - Market data
   - Transaction history
   - Settings

3. **Test Telegram Integration**
   - User data from Telegram
   - Theme switching
   - Haptic feedback
   - Back button navigation

## 🧪 Test Scenarios

### WebApp Functionality
- [ ] App loads without errors
- [ ] API connectivity works
- [ ] Data displays correctly
- [ ] Navigation works
- [ ] Theme matches Telegram

### Telegram Features
- [ ] User info from Telegram
- [ ] Color scheme detection
- [ ] Haptic feedback works
- [ ] Back button functions
- [ ] WebApp close works

### Data Flow
- [ ] Real-time balance updates
- [ ] Market data refresh
- [ ] Transaction loading
- [ ] Error handling

## 🔐 Security Checklist

- [ ] HTTPS enabled for WebApp
- [ ] CORS properly configured
- [ ] Telegram init data validation
- [ ] XSS protection enabled
- [ ] Rate limiting in place

## 📊 Performance Metrics

- [ ] Load time < 3 seconds
- [ ] API response < 1 second
- [ ] Smooth animations
- [ ] No memory leaks
- [ ] Responsive design

## 🐛 Known Issues & Solutions

### Issue: CORS Errors
**Solution**: Update ALLOWED_ORIGINS in frontend worker

### Issue: WebApp doesn't load
**Solution**: Check HTTPS certificate and bot configuration

### Issue: API timeouts
**Solution**: Increase timeout values and add retry logic

## 📈 Monitoring

- **Frontend Logs**: Wrangler dashboard -> Workers -> doglc-frontend-worker
- **Backend Logs**: Wrangler dashboard -> Workers -> doglc-api-v2
- **Error Tracking**: Browser DevTools console
- **Performance**: Telegram WebApp DevTools

## 🚀 Production Readiness

### Frontend ✅
- [x] Responsive design
- [x] Error handling
- [x] Loading states
- [x] Telegram integration

### Backend ✅
- [x] API endpoints
- [x] Error responses
- [x] CORS configuration
- [x] Data validation

### Integration ✅
- [x] Frontend ↔ Backend communication
- [x] Data flow testing
- [x] Error handling
- [x] Performance optimization

## 🎯 Next Steps

1. **Deploy to Staging**: Test in real Telegram environment
2. **User Testing**: Get feedback from test users
3. **Performance Optimization**: Monitor and improve
4. **Production Deployment**: Deploy final version
5. **Monitoring Setup**: Set up alerts and dashboards