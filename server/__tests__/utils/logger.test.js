import { jest } from '@jest/globals';

const mockPino = jest.fn().mockReturnValue('mockLoggerInstance');

jest.unstable_mockModule('pino', () => ({
  default: mockPino,
}));

describe('logger', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should initialize pino with default level and pino-pretty in development', async () => {
    process.env.NODE_ENV = 'development';
    
    // Dynamically import to ensure it reads the current env vars
    const loggerModule = await import(`../../src/utils/logger.js?dev=${Date.now()}`);
    const logger = loggerModule.default;
    
    expect(logger).toBe('mockLoggerInstance');
    expect(mockPino).toHaveBeenCalledWith({
      level: 'info',
      transport: {
        target: 'pino-pretty',
        options: expect.any(Object)
      }
    });
  });

  it('should initialize pino without transport in production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.LOG_LEVEL = 'warn';
    
    const loggerModule = await import(`../../src/utils/logger.js?prod=${Date.now()}`);
    const logger = loggerModule.default;
    
    expect(logger).toBe('mockLoggerInstance');
    expect(mockPino).toHaveBeenCalledWith({
      level: 'warn',
      transport: undefined
    });
  });
});
