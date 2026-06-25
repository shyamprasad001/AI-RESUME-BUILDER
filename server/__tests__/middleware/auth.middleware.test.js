import { jest } from '@jest/globals';

const mockVerifyToken = jest.fn();
const mockUserFindById = jest.fn();

jest.unstable_mockModule('../../src/utils/jwt.utils.js', () => ({
  verifyToken: mockVerifyToken,
}));

jest.unstable_mockModule('../../src/models/User.model.js', () => ({
  default: {
    findById: mockUserFindById,
  },
}));

const authenticate = (await import('../../src/middleware/auth.middleware.js')).default;

describe('Auth Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should return 401 if no auth header', async () => {
    await authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Please log in to access this route.',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if auth header does not start with Bearer', async () => {
    req.headers.authorization = 'Basic token123';
    await authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', async () => {
    req.headers.authorization = 'Bearer invalidtoken';
    mockVerifyToken.mockImplementation(() => { throw new Error('Invalid token'); });
    
    await authenticate(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid or expired token. Please log in again.',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if user not found', async () => {
    req.headers.authorization = 'Bearer validtoken';
    mockVerifyToken.mockReturnValue({ id: 'user123' });
    mockUserFindById.mockResolvedValue(null);
    
    await authenticate(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'User not found. Please log in again.',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next and set req.user if valid', async () => {
    req.headers.authorization = 'Bearer validtoken';
    mockVerifyToken.mockReturnValue({ id: 'user123' });
    const mockUser = { _id: 'user123', email: 'test@example.com' };
    mockUserFindById.mockResolvedValue(mockUser);
    
    await authenticate(req, res, next);
    
    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
  });
});
