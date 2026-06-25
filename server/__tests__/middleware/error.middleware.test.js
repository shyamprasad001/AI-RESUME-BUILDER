import { jest } from '@jest/globals';

const mockLoggerError = jest.fn();

jest.unstable_mockModule('../../src/utils/logger.js', () => ({
  default: {
    error: mockLoggerError,
  },
}));

const { notFoundHandler, errorHandler } = await import('../../src/middleware/error.middleware.js');

describe('Error Middleware', () => {
  let req;
  let res;
  let next;
  
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    req = {
      method: 'GET',
      originalUrl: '/api/test',
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe('notFoundHandler', () => {
    it('should return 404 and route not found message', () => {
      notFoundHandler(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Route not found: GET /api/test',
      });
    });
  });

  describe('errorHandler', () => {
    it('should handle error with status code and message in development', () => {
      process.env.NODE_ENV = 'development';
      const error = new Error('Test Error');
      error.statusCode = 400;
      error.stack = 'stacktrace';

      errorHandler(error, req, res, next);

      expect(mockLoggerError).toHaveBeenCalled();
      const logArgs = mockLoggerError.mock.calls[0];
      expect(logArgs[0]).toEqual({ err: error, route: 'GET /api/test' });
      expect(logArgs[1]).toBe('[400] Error occurred');

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Test Error',
        stack: 'stacktrace',
      });
    });

    it('should handle error with default values in production (hide stack)', () => {
      process.env.NODE_ENV = 'production';
      const error = new Error();
      // No status code, no message provided

      errorHandler(error, req, res, next);

      expect(mockLoggerError).toHaveBeenCalled();
      const logArgs = mockLoggerError.mock.calls[0];
      expect(logArgs[0]).toEqual({ route: 'GET /api/test' });
      expect(logArgs[1]).toBe('Error: ');

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Something went wrong on the server.',
      }); // stack should not be present
    });
  });
});
