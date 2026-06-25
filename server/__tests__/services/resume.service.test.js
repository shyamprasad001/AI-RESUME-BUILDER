import { jest } from '@jest/globals';

const mockResumeCreate = jest.fn();
const mockResumeFind = jest.fn();
const mockResumeFindOne = jest.fn();
const mockResumeFindOneAndUpdate = jest.fn();
const mockResumeFindOneAndDelete = jest.fn();

jest.unstable_mockModule('../../src/models/Resume.model.js', () => ({
  default: {
    create: mockResumeCreate,
    find: mockResumeFind,
    findOne: mockResumeFindOne,
    findOneAndUpdate: mockResumeFindOneAndUpdate,
    findOneAndDelete: mockResumeFindOneAndDelete,
  },
}));

jest.unstable_mockModule('../../src/utils/normalizeCertifications.js', () => ({
  default: jest.fn((certs) => certs || []),
}));

const resumeService = await import('../../src/services/resume.service.js');
const normalizeCertifications = (await import('../../src/utils/normalizeCertifications.js')).default;
const mongoose = (await import('mongoose')).default;

describe('Resume Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createResume', () => {
    it('should create resume with default values', async () => {
      const mockResult = { _id: 'resume123' };
      mockResumeCreate.mockResolvedValue(mockResult);

      const result = await resumeService.createResume('user123');
      expect(mockResumeCreate).toHaveBeenCalledWith({
        userId: 'user123',
        title: 'Untitled Resume',
        templateId: 'classic',
        targetRole: '',
      });
      expect(result).toEqual(mockResult);
    });

    it('should create resume with provided values', async () => {
      const mockResult = { _id: 'resume123' };
      mockResumeCreate.mockResolvedValue(mockResult);

      const data = { title: 'Custom', templateId: 'modern', targetRole: 'Dev' };
      const result = await resumeService.createResume('user123', data);
      expect(mockResumeCreate).toHaveBeenCalledWith({
        userId: 'user123',
        ...data,
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('getResumesByUser', () => {
    it('should return sorted resumes', async () => {
      const mockSort = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockResolvedValue(['resume1']);
      mockResumeFind.mockReturnValue({ sort: mockSort, select: mockSelect });

      const result = await resumeService.getResumesByUser('user123');
      expect(mockResumeFind).toHaveBeenCalledWith({ userId: 'user123' });
      expect(mockSort).toHaveBeenCalledWith({ updatedAt: -1 });
      expect(mockSelect).toHaveBeenCalledWith('-__v');
      expect(result).toEqual(['resume1']);
    });
  });

  describe('getResumeById', () => {
    it('should throw 404 if not found', async () => {
      const mockSelect = jest.fn().mockResolvedValue(null);
      mockResumeFindOne.mockReturnValue({ select: mockSelect });

      await expect(resumeService.getResumeById('resume123', 'user123')).rejects.toThrow('Resume not found.');
    });

    it('should return resume if found', async () => {
      const mockSelect = jest.fn().mockResolvedValue({ _id: 'resume123' });
      mockResumeFindOne.mockReturnValue({ select: mockSelect });

      const result = await resumeService.getResumeById('resume123', 'user123');
      expect(result).toEqual({ _id: 'resume123' });
    });
  });

  describe('updateResume', () => {
    it('should sanitize sections and update resume', async () => {
      mockResumeFindOneAndUpdate.mockResolvedValue({ _id: 'resume123' });
      
      const updateData = {
        title: 'New',
        sections: {
          experience: [{ _id: 'invalid-id', title: 'Dev' }, { _id: new mongoose.Types.ObjectId().toString(), title: 'Lead', description: ['Line 1', 'Line 2'] }],
          education: 'not-an-array' // should be ignored by sanitizer
        }
      };

      await resumeService.updateResume('resume123', 'user123', updateData);
      
      expect(mockResumeFindOneAndUpdate).toHaveBeenCalled();
      const callArgs = mockResumeFindOneAndUpdate.mock.calls[0][1].$set;
      expect(callArgs.title).toBe('New');
      // The invalid ID should be stripped, the valid ID kept
      expect(callArgs.sections.experience[0]._id).toBeUndefined();
      expect(callArgs.sections.experience[1]._id).toBeDefined();
      expect(callArgs.sections.experience[1].description).toBe('Line 1 Line 2');
    });

    it('should handle null sections without crashing', async () => {
      mockResumeFindOneAndUpdate.mockResolvedValue({ _id: 'resume123' });
      const updateData = { sections: null };
      await resumeService.updateResume('resume123', 'user123', updateData);
      expect(mockResumeFindOneAndUpdate).toHaveBeenCalled();
    });

    it('should throw 404 if resume not found during update', async () => {
      mockResumeFindOneAndUpdate.mockResolvedValue(null);
      await expect(resumeService.updateResume('resume123', 'user123', {})).rejects.toThrow('Resume not found.');
    });
  });

  describe('updateSection', () => {
    it('should normalize certifications', async () => {
      mockResumeFindOneAndUpdate.mockResolvedValue({ _id: 'resume123' });
      normalizeCertifications.mockReturnValue(['Normalized']);
      
      await resumeService.updateSection('resume123', 'user123', 'certifications', 'raw cert');
      
      expect(normalizeCertifications).toHaveBeenCalledWith('raw cert');
      expect(mockResumeFindOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'resume123', userId: 'user123' },
        { $set: { 'sections.certifications': ['Normalized'] } },
        { returnDocument: 'after' }
      );
    });

    it('should sanitize array fields (projects with description array) and keep valid _ids', async () => {
      mockResumeFindOneAndUpdate.mockResolvedValue({ _id: 'resume123' });
      const validId = new mongoose.Types.ObjectId().toString();
      const sectionData = [
        { _id: 'invalid', title: 'Proj1', description: ['A', 'B'] },
        { _id: validId, title: 'Proj2', description: ['C'] },
        { title: 'Proj3', description: 'String desc' }, // string description branch
        { title: 'Proj4' } // missing description branch
      ];
      
      await resumeService.updateSection('resume123', 'user123', 'projects', sectionData);
      
      const callArgs = mockResumeFindOneAndUpdate.mock.calls[0][1].$set['sections.projects'];
      expect(callArgs[0]._id).toBeUndefined();
      expect(callArgs[0].description).toBe('A B');
      expect(callArgs[1]._id).toBe(validId);
      expect(callArgs[1].description).toBe('C');
      expect(callArgs[2].description).toBe('String desc');
      expect(callArgs[3].description).toBeUndefined();
    });

    it('should handle non-array fields safely', async () => {
      mockResumeFindOneAndUpdate.mockResolvedValue({ _id: 'resume123' });
      
      await resumeService.updateSection('resume123', 'user123', 'summary', 'My Summary');
      
      expect(mockResumeFindOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'resume123', userId: 'user123' },
        { $set: { 'sections.summary': 'My Summary' } },
        { returnDocument: 'after' }
      );
    });

    it('should throw 404 if not found', async () => {
      mockResumeFindOneAndUpdate.mockResolvedValue(null);
      await expect(resumeService.updateSection('resume123', 'user123', 'summary', 'A')).rejects.toThrow('Resume not found.');
    });
  });

  describe('updateTemplate', () => {
    it('should update template', async () => {
      mockResumeFindOneAndUpdate.mockResolvedValue({ _id: 'resume123' });
      await resumeService.updateTemplate('resume123', 'user123', 'modern');
      expect(mockResumeFindOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'resume123', userId: 'user123' },
        { $set: { templateId: 'modern' } },
        { returnDocument: 'after' }
      );
    });

    it('should throw 404 if not found', async () => {
      mockResumeFindOneAndUpdate.mockResolvedValue(null);
      await expect(resumeService.updateTemplate('resume123', 'user123', 'modern')).rejects.toThrow('Resume not found.');
    });
  });

  describe('createFromUpload', () => {
    it('should sanitize and create from upload', async () => {
      mockResumeCreate.mockResolvedValue({ _id: 'resume123' });
      const parsedSections = { summary: 'Sum', experience: [{ _id: 'invalid' }] };
      
      await resumeService.createFromUpload('user123', parsedSections, 'Custom Title');
      
      const callArgs = mockResumeCreate.mock.calls[0][0];
      expect(callArgs.title).toBe('Custom Title');
      expect(callArgs.sections.summary).toBe('Sum');
      expect(callArgs.sections.experience[0]._id).toBeUndefined();
    });

    it('should handle missing sections (undefined fallback)', async () => {
      mockResumeCreate.mockResolvedValue({ _id: 'resume123' });
      await resumeService.createFromUpload('user123', undefined); // testing default
      const callArgs = mockResumeCreate.mock.calls[0][0];
      expect(callArgs.title).toBe('Uploaded Resume');
    });

    it('should handle falsey parsedSections (bypass sanitizeSections bypass)', async () => {
      mockResumeCreate.mockResolvedValue({ _id: 'resume123' });
      await resumeService.createFromUpload('user123', false); // testing false bypassing ?? {}
      const callArgs = mockResumeCreate.mock.calls[0][0];
      expect(callArgs.sections).toBe(false);
    });
  });

  describe('deleteResume', () => {
    it('should delete resume', async () => {
      mockResumeFindOneAndDelete.mockResolvedValue({ _id: 'resume123' });
      await resumeService.deleteResume('resume123', 'user123');
      expect(mockResumeFindOneAndDelete).toHaveBeenCalledWith({ _id: 'resume123', userId: 'user123' });
    });

    it('should throw 404 if not found', async () => {
      mockResumeFindOneAndDelete.mockResolvedValue(null);
      await expect(resumeService.deleteResume('resume123', 'user123')).rejects.toThrow('Resume not found.');
    });
  });
});
