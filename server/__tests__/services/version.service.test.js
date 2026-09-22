import { jest } from '@jest/globals';

const mockResumeFindOne = jest.fn();
const mockResumeFindOneAndUpdate = jest.fn();

jest.unstable_mockModule('../../src/models/Resume.model.js', () => ({
  default: {
    findOne: mockResumeFindOne,
    findOneAndUpdate: mockResumeFindOneAndUpdate,
  },
}));

const mockResumeVersionFindOne = jest.fn();
const mockResumeVersionCreate = jest.fn();
const mockResumeVersionFind = jest.fn();
const mockResumeVersionFindOneAndDelete = jest.fn();

jest.unstable_mockModule('../../src/models/ResumeVersion.model.js', () => ({
  default: {
    findOne: mockResumeVersionFindOne,
    create: mockResumeVersionCreate,
    find: mockResumeVersionFind,
    findOneAndDelete: mockResumeVersionFindOneAndDelete,
  },
}));

const versionService = await import('../../src/services/version.service.js');

describe('Version Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveVersion', () => {
    it('should throw 404 if resume not found', async () => {
      mockResumeFindOne.mockResolvedValue(null);
      await expect(versionService.saveVersion('resume123', 'user123', 'V1')).rejects.toThrow('Resume not found.');
    });

    it('should create version with versionNumber 1 if no previous versions', async () => {
      const mockResume = { sections: {}, templateId: 'modern', jobDescription: 'JD', atsScore: { overall: 80 } };
      mockResumeFindOne.mockResolvedValue(mockResume);
      mockResumeVersionFindOne.mockReturnValue({ sort: jest.fn().mockResolvedValue(null) }); // No previous version
      
      const mockVersion = { _id: 'v1' };
      mockResumeVersionCreate.mockResolvedValue(mockVersion);

      const result = await versionService.saveVersion('resume123', 'user123', 'V1');

      expect(mockResumeVersionCreate).toHaveBeenCalledWith({
        resumeId: 'resume123',
        userId: 'user123',
        versionNumber: 1,
        label: 'V1',
        snapshot: mockResume.sections,
        templateId: mockResume.templateId,
        atsScore: 80,
        jobDescription: mockResume.jobDescription,
      });
      expect(result).toEqual(mockVersion);
    });

    it('should create version with incremented versionNumber and fallback values', async () => {
      const mockResume = { sections: {}, templateId: 'modern' }; // no atsScore, no jobDescription
      mockResumeFindOne.mockResolvedValue(mockResume);
      mockResumeVersionFindOne.mockReturnValue({ sort: jest.fn().mockResolvedValue({ versionNumber: 5 }) }); 
      
      const mockVersion = { _id: 'v2' };
      mockResumeVersionCreate.mockResolvedValue(mockVersion);

      const result = await versionService.saveVersion('resume123', 'user123'); // no label

      expect(mockResumeVersionCreate).toHaveBeenCalledWith(expect.objectContaining({
        versionNumber: 6,
        label: 'Version 6',
        atsScore: 0,
      }));
      expect(result).toEqual(mockVersion);
    });
  });

  describe('getVersions', () => {
    it('should return sorted versions', async () => {
      const mockSort = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockResolvedValue(['v1', 'v2']);
      mockResumeVersionFind.mockReturnValue({ sort: mockSort, select: mockSelect });

      const result = await versionService.getVersions('resume123', 'user123');
      expect(mockResumeVersionFind).toHaveBeenCalledWith({ resumeId: 'resume123', userId: 'user123' });
      expect(mockSort).toHaveBeenCalledWith({ versionNumber: -1 });
      expect(mockSelect).toHaveBeenCalledWith('-__v');
      expect(result).toEqual(['v1', 'v2']);
    });
  });

  describe('getVersionById', () => {
    it('should return version', async () => {
      const mockVersion = { _id: 'v1' };
      mockResumeVersionFindOne.mockResolvedValue(mockVersion);

      const result = await versionService.getVersionById('resume123', 'v1', 'user123');
      expect(mockResumeVersionFindOne).toHaveBeenCalledWith({ _id: 'v1', resumeId: 'resume123', userId: 'user123' });
      expect(result).toEqual(mockVersion);
    });

    it('should throw 404 if version not found', async () => {
      mockResumeVersionFindOne.mockResolvedValue(null);
      await expect(versionService.getVersionById('resume123', 'v1', 'user123')).rejects.toThrow('Version not found.');
    });
  });

  describe('restoreVersion', () => {
    it('should update resume with version snapshot', async () => {
      const mockVersion = { snapshot: {}, templateId: 'harvard', jobDescription: 'JD' };
      // By mocking getVersionById internally via its module or mocking the DB call
      mockResumeVersionFindOne.mockResolvedValue(mockVersion); // used by getVersionById

      const mockResume = { _id: 'resume123' };
      mockResumeFindOneAndUpdate.mockResolvedValue(mockResume);

      const result = await versionService.restoreVersion('resume123', 'v1', 'user123');

      expect(mockResumeFindOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'resume123', userId: 'user123' },
        {
          $set: {
            sections: mockVersion.snapshot,
            templateId: mockVersion.templateId,
            jobDescription: mockVersion.jobDescription,
          }
        },
        { returnDocument: 'after' }
      );
      expect(result).toEqual(mockResume);
    });
  });

  describe('deleteVersion', () => {
    it('should delete and return version', async () => {
      const mockVersion = { _id: 'v1' };
      mockResumeVersionFindOneAndDelete.mockResolvedValue(mockVersion);

      const result = await versionService.deleteVersion('resume123', 'v1', 'user123');
      expect(mockResumeVersionFindOneAndDelete).toHaveBeenCalledWith({ _id: 'v1', resumeId: 'resume123', userId: 'user123' });
      expect(result).toEqual(mockVersion);
    });

    it('should throw 404 if version not found', async () => {
      mockResumeVersionFindOneAndDelete.mockResolvedValue(null);
      await expect(versionService.deleteVersion('resume123', 'v1', 'user123')).rejects.toThrow('Version not found.');
    });
  });
});
