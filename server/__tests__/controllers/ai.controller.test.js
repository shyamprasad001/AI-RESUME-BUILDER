import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/services/ai.service.js', () => ({
  chatWithInterviewAgent: jest.fn(),
  generateBullets: jest.fn(),
  generateSummary: jest.fn(),
  getAtsScore: jest.fn(),
  reviewResume: jest.fn(),
  matchJob: jest.fn(),
  detectSkillGaps: jest.fn(),
}));

const mockChatHistoryFindOne = jest.fn();
const mockChatHistoryCreate = jest.fn();
const mockChatHistoryFind = jest.fn();
const mockChatHistorySort = jest.fn();

jest.unstable_mockModule('../../src/models/ChatHistory.model.js', () => ({
  default: {
    findOne: mockChatHistoryFindOne,
    create: mockChatHistoryCreate,
    find: mockChatHistoryFind,
  },
}));

const mockResumeFindOne = jest.fn();
const mockResumeFindById = jest.fn();

jest.unstable_mockModule('../../src/models/Resume.model.js', () => ({
  default: {
    findOne: mockResumeFindOne,
    findById: mockResumeFindById,
  },
}));

const aiController = await import('../../src/controllers/ai.controller.js');
const aiService = await import('../../src/services/ai.service.js');

describe('AI Controller', () => {
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
    mockChatHistoryFind.mockReturnValue({ sort: mockChatHistorySort });
  });

  describe('chat', () => {
    it('should return 400 if resumeId or message missing', async () => {
      mockReq.body = { resumeId: '123' }; // missing message
      await aiController.chat(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'resumeId and message are required.' });
    });

    it('should create new chat history if not exists and chat', async () => {
      mockReq.body = { resumeId: '123', message: 'Hello' };
      mockChatHistoryFindOne.mockResolvedValue(null);
      const mockChatInstance = {
        messages: [],
        save: jest.fn().mockResolvedValue(true)
      };
      mockChatHistoryCreate.mockResolvedValue(mockChatInstance);
      mockResumeFindById.mockResolvedValue({ sections: {}, targetRole: 'Dev' });
      aiService.chatWithInterviewAgent.mockResolvedValue({ message: 'Hi there' });

      await aiController.chat(mockReq, mockRes, mockNext);

      expect(mockChatHistoryCreate).toHaveBeenCalled();
      expect(mockChatInstance.messages).toHaveLength(2); // user and assistant
      expect(mockChatInstance.save).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: { message: 'Hi there' } });
    });

    it('should use existing chat history and chat', async () => {
      mockReq.body = { resumeId: '123', message: 'Hello', sectionTargeted: 'skills' };
      const mockChatInstance = {
        messages: [{ role: 'assistant', content: 'prev' }],
        save: jest.fn().mockResolvedValue(true)
      };
      mockChatHistoryFindOne.mockResolvedValue(mockChatInstance);
      mockResumeFindById.mockResolvedValue(null); // testing optional chaining
      aiService.chatWithInterviewAgent.mockResolvedValue({ message: 'Hi there' });

      await aiController.chat(mockReq, mockRes, mockNext);

      expect(mockChatHistoryCreate).not.toHaveBeenCalled();
      expect(mockChatInstance.messages).toHaveLength(3);
      expect(mockChatInstance.save).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: { message: 'Hi there' } });
    });

    it('should pass error to next()', async () => {
      mockReq.body = { resumeId: '123', message: 'Hello' };
      const error = new Error('DB Error');
      mockChatHistoryFindOne.mockRejectedValue(error);

      await aiController.chat(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('generateBullets', () => {
    it('should return 400 if rawExperience missing', async () => {
      mockReq.body = {};
      await aiController.generateBullets(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'rawExperience is required.' });
    });

    it('should generate bullets with resume info if resumeId provided', async () => {
      mockReq.body = { resumeId: '123', rawExperience: 'Did stuff' };
      mockResumeFindById.mockResolvedValue({ targetRole: 'Dev' });
      aiService.generateBullets.mockResolvedValue(['bullet 1']);

      await aiController.generateBullets(mockReq, mockRes, mockNext);

      expect(mockResumeFindById).toHaveBeenCalledWith('123');
      expect(aiService.generateBullets).toHaveBeenCalledWith({
        rawExperience: 'Did stuff',
        role: '',
        company: '',
        targetRole: 'Dev',
        jobDescription: ''
      });
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: ['bullet 1'] });
    });

    it('should generate bullets without resume info', async () => {
      mockReq.body = { rawExperience: 'Did stuff', role: 'Dev', company: 'Tech' };
      aiService.generateBullets.mockResolvedValue(['bullet 1']);

      await aiController.generateBullets(mockReq, mockRes, mockNext);

      expect(mockResumeFindById).not.toHaveBeenCalled();
      expect(aiService.generateBullets).toHaveBeenCalledWith({
        rawExperience: 'Did stuff',
        role: 'Dev',
        company: 'Tech',
        targetRole: '',
        jobDescription: ''
      });
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: ['bullet 1'] });
    });

    it('should pass error to next()', async () => {
      mockReq.body = { rawExperience: 'Did stuff' };
      const error = new Error('AI error');
      aiService.generateBullets.mockRejectedValue(error);

      await aiController.generateBullets(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('generateSummary', () => {
    it('should return 400 if resumeId missing', async () => {
      mockReq.body = {};
      await aiController.generateSummary(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 if resume not found', async () => {
      mockReq.body = { resumeId: '123' };
      mockResumeFindOne.mockResolvedValue(null);

      await aiController.generateSummary(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should generate summary', async () => {
      mockReq.body = { resumeId: '123' };
      mockResumeFindOne.mockResolvedValue({ sections: {}, targetRole: 'Dev' });
      aiService.generateSummary.mockResolvedValue('Summary text');

      await aiController.generateSummary(mockReq, mockRes, mockNext);
      expect(aiService.generateSummary).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: 'Summary text' });
    });

    it('should pass error to next()', async () => {
      mockReq.body = { resumeId: '123' };
      const error = new Error('DB Error');
      mockResumeFindOne.mockRejectedValue(error);

      await aiController.generateSummary(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('atsScore', () => {
    it('should return 400 if resumeId missing', async () => {
      mockReq.body = {};
      await aiController.atsScore(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 if resume not found', async () => {
      mockReq.body = { resumeId: '123' };
      mockResumeFindOne.mockResolvedValue(null);

      await aiController.atsScore(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should calculate ats score with breakdown objects', async () => {
      mockReq.body = { resumeId: '123', jobDescription: 'New JD' };
      const mockResume = { sections: {}, save: jest.fn().mockResolvedValue(true) };
      mockResumeFindOne.mockResolvedValue(mockResume);
      
      aiService.getAtsScore.mockResolvedValue({
        overall: 80,
        breakdown: { 
          keywords: { score: 90 }, 
          format: 70,
          missingScoreObj: {}, // typeof object, but no score -> falls back to 0
          falsyVal: 0 // falsy val -> falls back to 0
        }, 
        missingKeywords: ['React'],
        suggestions: ['Add React']
      });

      await aiController.atsScore(mockReq, mockRes, mockNext);
      
      expect(mockResume.jobDescription).toBe('New JD');
      expect(mockResume.atsScore.breakdown).toEqual({ keywords: 90, format: 70, missingScoreObj: 0, falsyVal: 0 });
      expect(mockResume.save).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('should calculate ats score without breakdown', async () => {
      mockReq.body = { resumeId: '123' };
      const mockResume = { sections: {}, jobDescription: 'Old JD', save: jest.fn() };
      mockResumeFindOne.mockResolvedValue(mockResume);
      
      aiService.getAtsScore.mockResolvedValue({}); // empty result

      await aiController.atsScore(mockReq, mockRes, mockNext);
      
      expect(mockResume.atsScore.overall).toBe(0);
      expect(mockResume.atsScore.breakdown).toEqual({});
      expect(mockResume.save).toHaveBeenCalled();
    });

    it('should pass error to next()', async () => {
      mockReq.body = { resumeId: '123' };
      const error = new Error('DB Error');
      mockResumeFindOne.mockRejectedValue(error);

      await aiController.atsScore(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('review', () => {
    it('should return 400 if resumeId missing', async () => {
      mockReq.body = {};
      await aiController.review(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 if resume not found', async () => {
      mockReq.body = { resumeId: '123' };
      mockResumeFindOne.mockResolvedValue(null);

      await aiController.review(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should review resume', async () => {
      mockReq.body = { resumeId: '123' };
      mockResumeFindOne.mockResolvedValue({ sections: {}, targetRole: 'Dev' });
      aiService.reviewResume.mockResolvedValue('Review text');

      await aiController.review(mockReq, mockRes, mockNext);
      expect(aiService.reviewResume).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: 'Review text' });
    });

    it('should pass error to next()', async () => {
      mockReq.body = { resumeId: '123' };
      const error = new Error('DB Error');
      mockResumeFindOne.mockRejectedValue(error);

      await aiController.review(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('matchJob', () => {
    it('should return 400 if resumeId or jobDescription missing', async () => {
      mockReq.body = { resumeId: '123' }; // missing JD
      await aiController.matchJob(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 if resume not found', async () => {
      mockReq.body = { resumeId: '123', jobDescription: 'JD' };
      mockResumeFindOne.mockResolvedValue(null);

      await aiController.matchJob(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should match job', async () => {
      mockReq.body = { resumeId: '123', jobDescription: 'JD' };
      const mockResume = { sections: {}, save: jest.fn() };
      mockResumeFindOne.mockResolvedValue(mockResume);
      aiService.matchJob.mockResolvedValue({ score: 90 });

      await aiController.matchJob(mockReq, mockRes, mockNext);
      expect(mockResume.jobDescription).toBe('JD');
      expect(mockResume.save).toHaveBeenCalled();
      expect(aiService.matchJob).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: { score: 90 } });
    });

    it('should pass error to next()', async () => {
      mockReq.body = { resumeId: '123', jobDescription: 'JD' };
      const error = new Error('DB Error');
      mockResumeFindOne.mockRejectedValue(error);

      await aiController.matchJob(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('skillGaps', () => {
    it('should return 400 if resumeId missing', async () => {
      mockReq.body = {};
      await aiController.skillGaps(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 if resume not found', async () => {
      mockReq.body = { resumeId: '123' };
      mockResumeFindOne.mockResolvedValue(null);

      await aiController.skillGaps(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should detect skill gaps using provided job description', async () => {
      mockReq.body = { resumeId: '123', jobDescription: 'New JD' };
      mockResumeFindOne.mockResolvedValue({ sections: { skills: [] } });
      aiService.detectSkillGaps.mockResolvedValue(['missing nodejs']);

      await aiController.skillGaps(mockReq, mockRes, mockNext);
      expect(aiService.detectSkillGaps).toHaveBeenCalledWith({ skills: [], jobDescription: 'New JD' });
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: ['missing nodejs'] });
    });

    it('should detect skill gaps using saved job description', async () => {
      mockReq.body = { resumeId: '123' };
      mockResumeFindOne.mockResolvedValue({ sections: { skills: [] }, jobDescription: 'Old JD' });
      aiService.detectSkillGaps.mockResolvedValue(['missing nodejs']);

      await aiController.skillGaps(mockReq, mockRes, mockNext);
      expect(aiService.detectSkillGaps).toHaveBeenCalledWith({ skills: [], jobDescription: 'Old JD' });
    });

    it('should pass error to next()', async () => {
      mockReq.body = { resumeId: '123' };
      const error = new Error('DB Error');
      mockResumeFindOne.mockRejectedValue(error);

      await aiController.skillGaps(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getChatHistory', () => {
    it('should return chat history', async () => {
      mockReq.params = { resumeId: '123' };
      mockChatHistorySort.mockResolvedValue(['history1']);

      await aiController.getChatHistory(mockReq, mockRes, mockNext);
      expect(mockChatHistoryFind).toHaveBeenCalledWith({ resumeId: '123', userId: 'user123' });
      expect(mockChatHistorySort).toHaveBeenCalledWith({ updatedAt: -1 });
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: ['history1'] });
    });

    it('should pass error to next()', async () => {
      mockReq.params = { resumeId: '123' };
      const error = new Error('DB Error');
      mockChatHistoryFind.mockReturnValue({ sort: jest.fn().mockRejectedValue(error) });

      await aiController.getChatHistory(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
