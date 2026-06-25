import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/services/resume.service.js', () => ({
  createResume: jest.fn(),
  getResumesByUser: jest.fn(),
  getResumeById: jest.fn(),
  updateResume: jest.fn(),
  updateSection: jest.fn(),
  updateTemplate: jest.fn(),
  deleteResume: jest.fn(),
  createFromUpload: jest.fn(),
}));

jest.unstable_mockModule('../../src/services/ai.service.js', () => ({
  parseResume: jest.fn(),
}));

jest.unstable_mockModule('../../src/utils/resumeParser.js', () => ({
  default: jest.fn(),
}));

jest.unstable_mockModule('../../src/utils/logger.js', () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

const resumeController = await import('../../src/controllers/resume.controller.js');
const resumeService = await import('../../src/services/resume.service.js');
const aiService = await import('../../src/services/ai.service.js');
const resumeParser = await import('../../src/utils/resumeParser.js');
const logger = await import('../../src/utils/logger.js');

describe('Resume Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      user: { _id: 'user123' },
      body: {},
      params: {},
      file: null,
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('createResume', () => {
    it('should create resume and return 201', async () => {
      mockReq.body = { title: 'Software Engineer' };
      const mockResult = { _id: 'resume123', title: 'Software Engineer' };
      resumeService.createResume.mockResolvedValue(mockResult);

      await resumeController.createResume(mockReq, mockRes, mockNext);
      expect(resumeService.createResume).toHaveBeenCalledWith('user123', mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: mockResult });
    });

    it('should pass error to next() on failure', async () => {
      const error = new Error('Database error');
      resumeService.createResume.mockRejectedValue(error);

      await resumeController.createResume(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getResumes', () => {
    it('should return list of resumes', async () => {
      const mockResult = [{ _id: 'resume123' }];
      resumeService.getResumesByUser.mockResolvedValue(mockResult);

      await resumeController.getResumes(mockReq, mockRes, mockNext);
      expect(resumeService.getResumesByUser).toHaveBeenCalledWith('user123');
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: mockResult });
    });

    it('should pass error to next() on failure', async () => {
      const error = new Error('Database error');
      resumeService.getResumesByUser.mockRejectedValue(error);

      await resumeController.getResumes(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getResume', () => {
    it('should return single resume', async () => {
      mockReq.params.id = 'resume123';
      const mockResult = { _id: 'resume123' };
      resumeService.getResumeById.mockResolvedValue(mockResult);

      await resumeController.getResume(mockReq, mockRes, mockNext);
      expect(resumeService.getResumeById).toHaveBeenCalledWith('resume123', 'user123');
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: mockResult });
    });

    it('should return specific status if error has statusCode', async () => {
      mockReq.params.id = 'resume123';
      const error = new Error('Not found');
      error.statusCode = 404;
      resumeService.getResumeById.mockRejectedValue(error);

      await resumeController.getResume(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'Not found' });
    });

    it('should pass error to next() if no statusCode', async () => {
      mockReq.params.id = 'resume123';
      const error = new Error('Database error');
      resumeService.getResumeById.mockRejectedValue(error);

      await resumeController.getResume(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('updateResume', () => {
    it('should update resume', async () => {
      mockReq.params.id = 'resume123';
      mockReq.body = { title: 'Updated Title' };
      const mockResult = { _id: 'resume123', title: 'Updated Title' };
      resumeService.updateResume.mockResolvedValue(mockResult);

      await resumeController.updateResume(mockReq, mockRes, mockNext);
      expect(resumeService.updateResume).toHaveBeenCalledWith('resume123', 'user123', mockReq.body);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: mockResult });
    });

    it('should return specific status if error has statusCode', async () => {
      mockReq.params.id = 'resume123';
      const error = new Error('Not found');
      error.statusCode = 404;
      resumeService.updateResume.mockRejectedValue(error);

      await resumeController.updateResume(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'Not found' });
    });

    it('should pass error to next() if no statusCode', async () => {
      mockReq.params.id = 'resume123';
      const error = new Error('Database error');
      resumeService.updateResume.mockRejectedValue(error);

      await resumeController.updateResume(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('updateSection', () => {
    it('should return 400 if section is invalid', async () => {
      mockReq.params = { id: 'resume123', section: 'invalidSection' };
      await resumeController.updateSection(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'Invalid section: invalidSection' });
    });

    it('should update section successfully', async () => {
      mockReq.params = { id: 'resume123', section: 'experience' };
      mockReq.body = { data: [{ title: 'Developer' }] };
      const mockResult = { _id: 'resume123', experience: [{ title: 'Developer' }] };
      resumeService.updateSection.mockResolvedValue(mockResult);

      await resumeController.updateSection(mockReq, mockRes, mockNext);
      expect(resumeService.updateSection).toHaveBeenCalledWith('resume123', 'user123', 'experience', mockReq.body.data);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: mockResult });
    });

    it('should return specific status if error has statusCode', async () => {
      mockReq.params = { id: 'resume123', section: 'experience' };
      const error = new Error('Not found');
      error.statusCode = 404;
      resumeService.updateSection.mockRejectedValue(error);

      await resumeController.updateSection(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should pass error to next() if no statusCode', async () => {
      mockReq.params = { id: 'resume123', section: 'experience' };
      const error = new Error('Database error');
      resumeService.updateSection.mockRejectedValue(error);

      await resumeController.updateSection(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('updateTemplate', () => {
    it('should return 400 if template is invalid', async () => {
      mockReq.params = { id: 'resume123' };
      mockReq.body = { templateId: 'invalidTemplate' };
      await resumeController.updateTemplate(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'Invalid template: invalidTemplate' });
    });

    it('should update template successfully', async () => {
      mockReq.params = { id: 'resume123' };
      mockReq.body = { templateId: 'modern' };
      const mockResult = { _id: 'resume123', template: 'modern' };
      resumeService.updateTemplate.mockResolvedValue(mockResult);

      await resumeController.updateTemplate(mockReq, mockRes, mockNext);
      expect(resumeService.updateTemplate).toHaveBeenCalledWith('resume123', 'user123', 'modern');
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: mockResult });
    });

    it('should return specific status if error has statusCode', async () => {
      mockReq.params = { id: 'resume123' };
      mockReq.body = { templateId: 'modern' };
      const error = new Error('Not found');
      error.statusCode = 404;
      resumeService.updateTemplate.mockRejectedValue(error);

      await resumeController.updateTemplate(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should pass error to next() if no statusCode', async () => {
      mockReq.params = { id: 'resume123' };
      mockReq.body = { templateId: 'modern' };
      const error = new Error('Database error');
      resumeService.updateTemplate.mockRejectedValue(error);

      await resumeController.updateTemplate(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteResume', () => {
    it('should delete resume successfully', async () => {
      mockReq.params.id = 'resume123';
      resumeService.deleteResume.mockResolvedValue({});

      await resumeController.deleteResume(mockReq, mockRes, mockNext);
      expect(resumeService.deleteResume).toHaveBeenCalledWith('resume123', 'user123');
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: { message: 'Resume deleted successfully' } });
    });

    it('should return specific status if error has statusCode', async () => {
      mockReq.params.id = 'resume123';
      const error = new Error('Not found');
      error.statusCode = 404;
      resumeService.deleteResume.mockRejectedValue(error);

      await resumeController.deleteResume(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should pass error to next() if no statusCode', async () => {
      mockReq.params.id = 'resume123';
      const error = new Error('Database error');
      resumeService.deleteResume.mockRejectedValue(error);

      await resumeController.deleteResume(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('uploadResume', () => {
    it('should return 400 if no file is uploaded', async () => {
      await resumeController.uploadResume(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'No PDF file uploaded.' });
    });

    it('should return 400 if extracted text is too short or empty', async () => {
      mockReq.file = { buffer: Buffer.from('mockpdf') };
      resumeParser.default.mockResolvedValue('short text');
      
      await resumeController.uploadResume(mockReq, mockRes, mockNext);
      expect(resumeParser.default).toHaveBeenCalledWith(mockReq.file.buffer);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'Could not extract text from PDF. Please try a different file.' });
    });

    it('should return 422 if AI fails to parse', async () => {
      mockReq.file = { buffer: Buffer.from('mockpdf') };
      const longText = 'A'.repeat(60);
      resumeParser.default.mockResolvedValue(longText);
      aiService.parseResume.mockResolvedValue({ error: true, raw: 'some error' });

      await resumeController.uploadResume(mockReq, mockRes, mockNext);
      expect(aiService.parseResume).toHaveBeenCalledWith({ resumeText: longText });
      expect(logger.default.error).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(422);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'Could not parse resume content with AI. Please try again or build your resume manually.' });
    });

    it('should return 422 if AI fails to parse and handle missing raw data', async () => {
      mockReq.file = { buffer: Buffer.from('mockpdf') };
      const longText = 'A'.repeat(60);
      resumeParser.default.mockResolvedValue(longText);
      // parsedSections is null
      aiService.parseResume.mockResolvedValue(null);

      await resumeController.uploadResume(mockReq, mockRes, mockNext);
      expect(logger.default.error).toHaveBeenCalledWith({ raw: 'no output' }, '[uploadResume] AI parse failed.');
      expect(mockRes.status).toHaveBeenCalledWith(422);
    });

    it('should upload resume successfully', async () => {
      mockReq.file = { buffer: Buffer.from('mockpdf') };
      const longText = 'A'.repeat(60);
      resumeParser.default.mockResolvedValue(longText);
      const parsedSections = { personalInfo: { firstName: 'John' } };
      aiService.parseResume.mockResolvedValue(parsedSections);
      
      const mockResult = { _id: 'resume123' };
      resumeService.createFromUpload.mockResolvedValue(mockResult);

      await resumeController.uploadResume(mockReq, mockRes, mockNext);
      expect(resumeService.createFromUpload).toHaveBeenCalledWith('user123', parsedSections);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: mockResult });
    });

    it('should pass error to next() on unexpected failure', async () => {
      mockReq.file = { buffer: Buffer.from('mockpdf') };
      const error = new Error('Extraction error');
      resumeParser.default.mockRejectedValue(error);

      await resumeController.uploadResume(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
