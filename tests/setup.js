/**
 * Jest Test Setup
 * การตั้งค่าเริ่มต้นสำหรับการทดสอบ
 */

// Mock console methods for cleaner test output
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.TELEGRAM_BOT_TOKEN = 'test-bot-token';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.ENVIRONMENT = 'test';

// Setup global test utilities
global.testUtils = {
  createMockContext: () => ({
    from: { id: 12345, username: 'testuser' },
    chat: { id: 12345, type: 'private' },
    message: { message_id: 1, text: '/test' },
    reply: jest.fn(),
    editMessageText: jest.fn(),
    answerCallbackQuery: jest.fn()
  }),
  
  createMockEnvironment: () => ({
    TELEGRAM_BOT_TOKEN: 'test-token',
    JWT_SECRET: 'test-secret',
    ENVIRONMENT: 'test',
    DEBUG_MODE: 'true'
  })
};

// Setup and teardown for each test
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});