import { jest } from '@jest/globals';

const mockSign = jest.fn();
const mockVerify = jest.fn();

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    sign: mockSign,
    verify: mockVerify,
  },
}));

const { generateToken, verifyToken } = await import('../../src/utils/jwt.utils.js');

describe('jwt.utils', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, JWT_SECRET: 'testsecret' };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('generateToken', () => {
    it('should generate a token with user payload', () => {
      mockSign.mockReturnValue('mocktoken');
      const user = { _id: '123', email: 'test@example.com' };
      
      const token = generateToken(user);
      
      expect(token).toBe('mocktoken');
      expect(mockSign).toHaveBeenCalledWith(
        { id: '123', email: 'test@example.com' },
        'testsecret',
        { expiresIn: '7d' } // default fallback
      );
    });

    it('should use JWT_EXPIRES_IN from env if provided', () => {
      process.env.JWT_EXPIRES_IN = '1d';
      mockSign.mockReturnValue('mocktoken');
      const user = { _id: '123', email: 'test@example.com' };
      
      generateToken(user);
      
      expect(mockSign).toHaveBeenCalledWith(
        expect.any(Object),
        'testsecret',
        { expiresIn: '1d' }
      );
    });
  });

  describe('verifyToken', () => {
    it('should verify a token', () => {
      mockVerify.mockReturnValue({ id: '123' });
      const decoded = verifyToken('mocktoken');
      
      expect(decoded).toEqual({ id: '123' });
      expect(mockVerify).toHaveBeenCalledWith('mocktoken', 'testsecret');
    });
  });
});
