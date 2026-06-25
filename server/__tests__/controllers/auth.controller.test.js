import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/services/auth.service.js', () => ({
  register: jest.fn(),
  emailLogin: jest.fn(),
  googleLogin: jest.fn(),
  getUserProfile: jest.fn(),
}));

const { registerUser, loginUser, googleAuth, getMe, logout } = await import('../../src/controllers/auth.controller.js');
const authService = await import('../../src/services/auth.service.js');


describe('Auth Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      body: {},
      user: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should return 400 if name, email, or password are missing', async () => {
      mockReq.body = { email: 'test@example.com' }; // Missing name and password
      await registerUser(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'Name, email, and password are required.' });
    });

    it('should return 400 if password is less than 6 characters', async () => {
      mockReq.body = { name: 'Test', email: 'test@example.com', password: '123' };
      await registerUser(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'Password must be at least 6 characters.' });
    });

    it('should register successfully and return 201', async () => {
      mockReq.body = { name: 'Test', email: 'test@example.com', password: 'password123' };
      const mockResult = { token: 'token123', user: { id: 1 } };
      authService.register.mockResolvedValue(mockResult);

      await registerUser(mockReq, mockRes, mockNext);
      expect(authService.register).toHaveBeenCalledWith('Test', 'test@example.com', 'password123');
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: mockResult });
    });

    it('should return specific status if error has statusCode', async () => {
      mockReq.body = { name: 'Test', email: 'test@example.com', password: 'password123' };
      const error = new Error('Email already exists');
      error.statusCode = 409;
      authService.register.mockRejectedValue(error);

      await registerUser(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'Email already exists' });
    });

    it('should pass error to next() if no statusCode', async () => {
      mockReq.body = { name: 'Test', email: 'test@example.com', password: 'password123' };
      const error = new Error('Database Error');
      authService.register.mockRejectedValue(error);

      await registerUser(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('loginUser', () => {
    it('should return 400 if email or password are missing', async () => {
      mockReq.body = { email: 'test@example.com' };
      await loginUser(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'Email and password are required.' });
    });

    it('should login successfully and return 200', async () => {
      mockReq.body = { email: 'test@example.com', password: 'password123' };
      const mockResult = { token: 'token123', user: { id: 1 } };
      authService.emailLogin.mockResolvedValue(mockResult);

      await loginUser(mockReq, mockRes, mockNext);
      expect(authService.emailLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: mockResult });
    });

    it('should return specific status if error has statusCode', async () => {
      mockReq.body = { email: 'test@example.com', password: 'password123' };
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      authService.emailLogin.mockRejectedValue(error);

      await loginUser(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'Invalid credentials' });
    });

    it('should pass error to next() if no statusCode', async () => {
      mockReq.body = { email: 'test@example.com', password: 'password123' };
      const error = new Error('Database Error');
      authService.emailLogin.mockRejectedValue(error);

      await loginUser(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('googleAuth', () => {
    it('should return 400 if credential is missing', async () => {
      mockReq.body = {};
      await googleAuth(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'Google credential is required.' });
    });

    it('should authenticate successfully and return 200', async () => {
      mockReq.body = { credential: 'google_token' };
      const mockResult = { token: 'token123', user: { id: 1 } };
      authService.googleLogin.mockResolvedValue(mockResult);

      await googleAuth(mockReq, mockRes, mockNext);
      expect(authService.googleLogin).toHaveBeenCalledWith('google_token');
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: mockResult });
    });

    it('should pass error to next() on failure', async () => {
      mockReq.body = { credential: 'google_token' };
      const error = new Error('Google Auth Failed');
      authService.googleLogin.mockRejectedValue(error);

      await googleAuth(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getMe', () => {
    it('should fetch user profile successfully', async () => {
      mockReq.user = { _id: 'user123' };
      const mockUser = { id: 'user123', name: 'Test User' };
      authService.getUserProfile.mockResolvedValue(mockUser);

      await getMe(mockReq, mockRes, mockNext);
      expect(authService.getUserProfile).toHaveBeenCalledWith('user123');
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: mockUser });
    });

    it('should pass error to next() on failure', async () => {
      mockReq.user = { _id: 'user123' };
      const error = new Error('User not found');
      authService.getUserProfile.mockRejectedValue(error);

      await getMe(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('logout', () => {
    it('should return success message', async () => {
      await logout(mockReq, mockRes, mockNext);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: { message: 'Logged out successfully' } });
    });

    it('should pass error to next() on unexpected failure', async () => {
      // Mock res.json to throw to simulate an unexpected error
      mockRes.json.mockImplementation(() => { throw new Error('Unexpected'); });
      await logout(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
