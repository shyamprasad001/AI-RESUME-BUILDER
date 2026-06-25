import { jest } from '@jest/globals';

jest.unstable_mockModule('bcryptjs', () => ({
  default: {
    hash: jest.fn(),
    compare: jest.fn(),
  },
}));

const mockUserFindOne = jest.fn();
const mockUserCreate = jest.fn();
const mockUserFindById = jest.fn();

jest.unstable_mockModule('../../src/models/User.model.js', () => ({
  default: {
    findOne: mockUserFindOne,
    create: mockUserCreate,
    findById: mockUserFindById,
  },
}));

jest.unstable_mockModule('../../src/config/google.config.js', () => ({
  verifyGoogleToken: jest.fn(),
}));

jest.unstable_mockModule('../../src/utils/jwt.utils.js', () => ({
  generateToken: jest.fn(),
}));

const authService = await import('../../src/services/auth.service.js');
const bcrypt = (await import('bcryptjs')).default;
const User = (await import('../../src/models/User.model.js')).default;
const { verifyGoogleToken } = await import('../../src/config/google.config.js');
const { generateToken } = await import('../../src/utils/jwt.utils.js');

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should throw 409 if email already registered', async () => {
      mockUserFindOne.mockResolvedValue({ _id: 'user123' });

      await expect(authService.register('Test', 'test@example.com', 'password123')).rejects.toThrow('Email already registered.');
      expect(mockUserFindOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    });

    it('should create user and return token', async () => {
      mockUserFindOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashedPassword');
      
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        name: 'Test',
        picture: 'pic.jpg'
      };
      mockUserCreate.mockResolvedValue(mockUser);
      generateToken.mockReturnValue('mockToken');

      const result = await authService.register('Test', 'test@example.com', 'password123');

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockUserCreate).toHaveBeenCalledWith({
        name: 'Test',
        email: 'test@example.com',
        password: 'hashedPassword'
      });
      expect(generateToken).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({
        token: 'mockToken',
        user: { id: 'user123', email: 'test@example.com', name: 'Test', picture: 'pic.jpg' }
      });
    });
  });

  describe('emailLogin', () => {
    it('should throw 401 if user not found', async () => {
      mockUserFindOne.mockResolvedValue(null);
      await expect(authService.emailLogin('test@example.com', 'password123')).rejects.toThrow('Invalid email or password.');
    });

    it('should throw 401 if user has no password (oauth only)', async () => {
      mockUserFindOne.mockResolvedValue({ email: 'test@example.com' }); // no password
      await expect(authService.emailLogin('test@example.com', 'password123')).rejects.toThrow('Invalid email or password.');
    });

    it('should throw 401 if password does not match', async () => {
      mockUserFindOne.mockResolvedValue({ email: 'test@example.com', password: 'hashedPassword' });
      bcrypt.compare.mockResolvedValue(false);
      
      await expect(authService.emailLogin('test@example.com', 'password123')).rejects.toThrow('Invalid email or password.');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
    });

    it('should login successfully', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        name: 'Test',
        picture: 'pic.jpg',
        password: 'hashedPassword',
        save: jest.fn().mockResolvedValue(true)
      };
      mockUserFindOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      generateToken.mockReturnValue('mockToken');

      const result = await authService.emailLogin('test@example.com', 'password123');

      expect(mockUser.lastLogin).toBeDefined();
      expect(mockUser.save).toHaveBeenCalled();
      expect(generateToken).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({
        token: 'mockToken',
        user: { id: 'user123', email: 'test@example.com', name: 'Test', picture: 'pic.jpg' }
      });
    });
  });

  describe('googleLogin', () => {
    it('should update existing user and return token', async () => {
      const googleUser = {
        googleId: 'g123',
        email: 'google@example.com',
        name: 'Google User',
        picture: 'google.jpg'
      };
      verifyGoogleToken.mockResolvedValue(googleUser);

      const mockUser = {
        _id: 'user123',
        email: 'google@example.com',
        save: jest.fn().mockResolvedValue(true)
      };
      mockUserFindOne.mockResolvedValue(mockUser);
      generateToken.mockReturnValue('mockToken');

      const result = await authService.googleLogin('credential_token');

      expect(verifyGoogleToken).toHaveBeenCalledWith('credential_token');
      expect(mockUserFindOne).toHaveBeenCalledWith({
        $or: [{ googleId: 'g123' }, { email: 'google@example.com' }]
      });
      expect(mockUser.googleId).toBe('g123');
      expect(mockUser.name).toBe('Google User');
      expect(mockUser.picture).toBe('google.jpg');
      expect(mockUser.lastLogin).toBeDefined();
      expect(mockUser.save).toHaveBeenCalled();
      expect(generateToken).toHaveBeenCalledWith(mockUser);
      expect(result.token).toBe('mockToken');
      expect(result.user.email).toBe('google@example.com');
    });

    it('should create new user if not exists', async () => {
      const googleUser = {
        googleId: 'g123',
        email: 'google@example.com',
        name: 'Google User',
        picture: 'google.jpg'
      };
      verifyGoogleToken.mockResolvedValue(googleUser);
      mockUserFindOne.mockResolvedValue(null);

      const mockUser = {
        _id: 'user123',
        email: 'google@example.com',
        name: 'Google User',
        picture: 'google.jpg'
      };
      mockUserCreate.mockResolvedValue(mockUser);
      generateToken.mockReturnValue('mockToken');

      const result = await authService.googleLogin('credential_token');

      expect(mockUserCreate).toHaveBeenCalledWith(expect.objectContaining({
        googleId: 'g123',
        email: 'google@example.com',
        name: 'Google User',
        picture: 'google.jpg'
      }));
      expect(result.user.id).toBe('user123');
    });
  });

  describe('getUserProfile', () => {
    it('should fetch user profile', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        name: 'Test',
        picture: 'pic.jpg',
        createdAt: new Date(),
        lastLogin: new Date()
      };
      
      const mockSelect = jest.fn().mockResolvedValue(mockUser);
      mockUserFindById.mockReturnValue({ select: mockSelect });

      const result = await authService.getUserProfile('user123');

      expect(mockUserFindById).toHaveBeenCalledWith('user123');
      expect(mockSelect).toHaveBeenCalledWith('-__v -googleId');
      expect(result.id).toBe('user123');
      expect(result.email).toBe('test@example.com');
    });

    it('should throw Error if user not found', async () => {
      mockUserFindById.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

      await expect(authService.getUserProfile('user123')).rejects.toThrow('User not found');
    });
  });
});
