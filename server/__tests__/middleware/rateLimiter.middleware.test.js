import { jest } from '@jest/globals';

const mockRateLimit = jest.fn((options) => options); // Return options so we can inspect and call handler
const mockLoggerWarn = jest.fn();

jest.unstable_mockModule('express-rate-limit', () => ({
  default: mockRateLimit,
}));

jest.unstable_mockModule('../../src/utils/logger.js', () => ({
  default: {
    warn: mockLoggerWarn,
  },
}));

const { globalLimiter, strictLimiter } = await import('../../src/middleware/rateLimiter.middleware.js');

describe('Rate Limiter Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('globalLimiter', () => {
    it('should be configured with global settings', () => {
      expect(globalLimiter.windowMs).toBe(15 * 60 * 1000);
      expect(globalLimiter.max).toBe(100); // Default if env not set
      expect(globalLimiter.standardHeaders).toBe(true);
      expect(globalLimiter.legacyHeaders).toBe(false);
      expect(globalLimiter.message.message).toContain('after 15 minutes');
    });

    it('should handle rate limit exceeded with handler', () => {
      const req = { ip: '127.0.0.1', originalUrl: '/api/test' };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
      const next = jest.fn();
      const options = { statusCode: 429, message: 'Custom msg' };

      globalLimiter.handler(req, res, next, options);

      expect(mockLoggerWarn).toHaveBeenCalledWith(
        { ip: '127.0.0.1', path: '/api/test' },
        'Rate limit exceeded'
      );
      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.send).toHaveBeenCalledWith('Custom msg');
    });
  });

  describe('strictLimiter', () => {
    it('should be configured with strict settings', () => {
      expect(strictLimiter.windowMs).toBe(1 * 60 * 1000);
      expect(strictLimiter.max).toBe(5); // Default
      expect(strictLimiter.message.message).toContain('after a minute');
    });
  });
});
