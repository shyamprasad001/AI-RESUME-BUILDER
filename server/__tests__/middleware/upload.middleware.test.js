import { jest } from '@jest/globals';

const mockMemoryStorage = jest.fn().mockReturnValue('memoryStorageInstance');
const mockMulter = jest.fn((options) => options); // return options so we can inspect
mockMulter.memoryStorage = mockMemoryStorage;

jest.unstable_mockModule('multer', () => ({
  default: mockMulter,
}));

const upload = (await import('../../src/middleware/upload.middleware.js')).default;

describe('Upload Middleware', () => {
  it('should configure multer with memory storage and 5MB limit', () => {
    // The memoryStorage function is called during module import
    expect(mockMemoryStorage).toHaveBeenCalled();
    expect(upload.storage).toBe('memoryStorageInstance');
    expect(upload.limits.fileSize).toBe(5 * 1024 * 1024);
  });

  describe('fileFilter', () => {
    it('should accept application/pdf', () => {
      const cb = jest.fn();
      const file = { mimetype: 'application/pdf' };
      
      upload.fileFilter(null, file, cb);
      
      expect(cb).toHaveBeenCalledWith(null, true);
    });

    it('should reject non-pdf files', () => {
      const cb = jest.fn();
      const file = { mimetype: 'image/jpeg' };
      
      upload.fileFilter(null, file, cb);
      
      expect(cb).toHaveBeenCalledWith(expect.any(Error), false);
      expect(cb.mock.calls[0][0].message).toBe('Only PDF files are allowed');
    });
  });
});
