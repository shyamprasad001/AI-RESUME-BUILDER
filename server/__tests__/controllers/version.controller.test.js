import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/services/version.service.js', () => ({
  saveVersion: jest.fn(),
  getVersions: jest.fn(),
  getVersionById: jest.fn(),
  restoreVersion: jest.fn(),
  deleteVersion: jest.fn(),
}));

const versionController = await import('../../src/controllers/version.controller.js');
const versionService = await import('../../src/services/version.service.js');

describe('Version Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      user: { _id: 'user123' },
      body: {},
      params: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('saveVersion', () => {
    it('should save version and return 201', async () => {
      mockReq.params.resumeId = 'resume123';
      mockReq.body.label = 'V1';
      const mockResult = { _id: 'version123' };
      versionService.saveVersion.mockResolvedValue(mockResult);

      await versionController.saveVersion(mockReq, mockRes, mockNext);
      expect(versionService.saveVersion).toHaveBeenCalledWith('resume123', 'user123', 'V1');
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: mockResult });
    });

    it('should return specific status if error has statusCode', async () => {
      const error = new Error('Not found');
      error.statusCode = 404;
      versionService.saveVersion.mockRejectedValue(error);

      await versionController.saveVersion(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'Not found' });
    });

    it('should pass error to next() on failure', async () => {
      const error = new Error('Database error');
      versionService.saveVersion.mockRejectedValue(error);

      await versionController.saveVersion(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getVersions', () => {
    it('should return list of versions', async () => {
      mockReq.params.resumeId = 'resume123';
      const mockResult = [{ _id: 'version123' }];
      versionService.getVersions.mockResolvedValue(mockResult);

      await versionController.getVersions(mockReq, mockRes, mockNext);
      expect(versionService.getVersions).toHaveBeenCalledWith('resume123', 'user123');
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: mockResult });
    });

    it('should pass error to next() on failure', async () => {
      const error = new Error('Database error');
      versionService.getVersions.mockRejectedValue(error);

      await versionController.getVersions(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getVersion', () => {
    it('should return single version', async () => {
      mockReq.params.resumeId = 'resume123';
      mockReq.params.versionId = 'version123';
      const mockResult = { _id: 'version123' };
      versionService.getVersionById.mockResolvedValue(mockResult);

      await versionController.getVersion(mockReq, mockRes, mockNext);
      expect(versionService.getVersionById).toHaveBeenCalledWith('resume123', 'version123', 'user123');
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: mockResult });
    });

    it('should return specific status if error has statusCode', async () => {
      const error = new Error('Not found');
      error.statusCode = 404;
      versionService.getVersionById.mockRejectedValue(error);

      await versionController.getVersion(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should pass error to next() if no statusCode', async () => {
      const error = new Error('Database error');
      versionService.getVersionById.mockRejectedValue(error);

      await versionController.getVersion(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('restoreVersion', () => {
    it('should restore version', async () => {
      mockReq.params.resumeId = 'resume123';
      mockReq.params.versionId = 'version123';
      const mockResult = { _id: 'resume123' };
      versionService.restoreVersion.mockResolvedValue(mockResult);

      await versionController.restoreVersion(mockReq, mockRes, mockNext);
      expect(versionService.restoreVersion).toHaveBeenCalledWith('resume123', 'version123', 'user123');
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: mockResult });
    });

    it('should return specific status if error has statusCode', async () => {
      const error = new Error('Not found');
      error.statusCode = 404;
      versionService.restoreVersion.mockRejectedValue(error);

      await versionController.restoreVersion(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should pass error to next() if no statusCode', async () => {
      const error = new Error('Database error');
      versionService.restoreVersion.mockRejectedValue(error);

      await versionController.restoreVersion(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteVersion', () => {
    it('should delete version', async () => {
      mockReq.params.resumeId = 'resume123';
      mockReq.params.versionId = 'version123';
      versionService.deleteVersion.mockResolvedValue({});

      await versionController.deleteVersion(mockReq, mockRes, mockNext);
      expect(versionService.deleteVersion).toHaveBeenCalledWith('resume123', 'version123', 'user123');
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: { message: 'Version deleted successfully' } });
    });

    it('should return specific status if error has statusCode', async () => {
      const error = new Error('Not found');
      error.statusCode = 404;
      versionService.deleteVersion.mockRejectedValue(error);

      await versionController.deleteVersion(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should pass error to next() if no statusCode', async () => {
      const error = new Error('Database error');
      versionService.deleteVersion.mockRejectedValue(error);

      await versionController.deleteVersion(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
