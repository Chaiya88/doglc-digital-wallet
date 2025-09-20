# Copilot Instructions for doglc-digital-wallet

## Project Overview
Digital wallet Telegram Bot with Thai language support, built for Cloudflare Workers deployment. This project combines fintech functionality with Thai localization for a seamless user experience.

## Project Structure
```
doglc-digital-wallet/
├── src/
│   ├── index.js              # Cloudflare Workers entry point (Telegraf bot)
│   ├── handlers/             # Telegram command handlers
│   │   ├── start.js         # Welcome & main menu
│   │   ├── wallet.js        # Wallet management
│   │   └── help.js          # Help system
│   ├── locales/             # Thai language messages
│   │   └── th.js           # All user-facing text in Thai
│   └── utils/              # Helper functions
│       └── helpers.js      # Currency, validation, security utils
├── scripts/
│   └── deploy.js           # Automated deployment script
├── wrangler.toml           # Cloudflare Workers configuration
├── package.json            # Node.js dependencies (Telegraf, CF types)
└── .env.example           # Environment template
```

## Tech Stack & Architecture
- **Runtime**: Cloudflare Workers (serverless, global edge)
- **Bot Framework**: Telegraf.js (modern Telegram Bot API wrapper)
- **Language**: JavaScript ES6+ with import/export modules
- **Deployment**: Wrangler CLI with staging/production environments
- **Storage**: Designed for Cloudflare KV (key-value storage)

## Development Patterns

### Thai Localization
- ALL user-facing messages are in `src/locales/` with 6 language files (th.js, en.js, zh.js, km.js, ko.js, id.js)
- Use emoji prefixes for visual clarity (🎉, 💰, ❌, etc.)
- Currency formatting uses Thai Baht (THB) with proper number formatting
- Date/time displays use Thai Buddhist calendar format
- Multi-language support via `src/locales/index.js` helper functions

### Bot Command Structure
```javascript
// Standard handler pattern
export async function handleCommand(ctx) {
  try {
    // Rate limiting check
    // Input validation
    // Business logic
    // Response with inline keyboard
  } catch (error) {
    await ctx.reply(messages.errorOccurred);
  }
}
```

### Inline Keyboards
- Use Thai labels with emoji for all buttons
- Follow consistent button layout patterns
- Always include navigation options (back to main menu)

### Security & Validation
- Rate limiting per user via `checkRateLimit()` utility
- Input sanitization with `sanitizeInput()`
- Amount validation for financial transactions
- Environment variables for sensitive data (never commit tokens)

## Key Conventions

### File Naming
- Commands: `src/handlers/{commandName}.js`
- Utilities: descriptive function names in `src/utils/helpers.js`
- All exports use ES6 `export`/`import` syntax

### Error Handling
- Always wrap async handlers in try/catch
- Use Thai error messages from locales
- Log errors to console but show user-friendly messages
- Graceful degradation for external API failures

### Cloudflare Workers Specifics
- Entry point MUST export default object with `fetch()` method
- Use `env` parameter for environment variables
- Handle both GET (health check) and POST (webhook) requests
- Response objects must be proper `Response()` instances

## Development Workflow
1. `npm run dev` - Local development with Wrangler
2. `npm run deploy` - Deploy to staging environment
3. `npm run deploy -- --prod` - Deploy to production

## External Dependencies
- Telegram Bot setup via @BotFather
- Cloudflare account with Workers subscription
- Environment variables for bot token and webhook URL

## Financial Domain Knowledge
- Support for Thai Baht currency formatting
- Transaction ID generation for audit trails
- Basic wallet address simulation (extendable for real blockchain)
- Rate limiting to prevent abuse of financial operations

## Contributing Guidelines
- Maintain Thai language consistency
- Follow existing handler patterns
- Test thoroughly in Telegram before deploying
- Update environment examples when adding new config