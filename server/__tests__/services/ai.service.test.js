import { jest } from '@jest/globals';

const mockGenerateContent = jest.fn();

jest.unstable_mockModule('../../src/config/gemini.config.js', () => ({
  generateContent: mockGenerateContent,
}));

jest.unstable_mockModule('../../src/constants/prompts.js', () => ({
  bulletWriterPrompt: jest.fn().mockReturnValue('prompt'),
  summaryWriterPrompt: jest.fn().mockReturnValue('prompt'),
  atsScorerPrompt: jest.fn().mockReturnValue('prompt'),
  reviewerPrompt: jest.fn().mockReturnValue('prompt'),
  matchJobPrompt: jest.fn().mockReturnValue('prompt'),
  skillGapsPrompt: jest.fn().mockReturnValue('prompt'),
  resumeParserPrompt: jest.fn().mockReturnValue('prompt'),
}));

jest.unstable_mockModule('../../src/utils/keywordAnalyzer.js', () => ({
  analyzeKeywords: jest.fn().mockReturnValue({ score: 80 }),
}));

jest.unstable_mockModule('../../src/utils/formatChecker.js', () => ({
  checkFormatting: jest.fn().mockReturnValue({
    formatting: 70,
    sectionCompleteness: 100,
  }),
}));

jest.unstable_mockModule('../../src/utils/scoreCalculator.js', () => ({
  calculateOverallScore: jest.fn().mockReturnValue(85),
}));

jest.unstable_mockModule('../../src/services/agent.service.js', () => ({
  runInterviewAgent: jest.fn().mockResolvedValue({ message: 'agent reply' }),
}));

const aiService = await import('../../src/services/ai.service.js');
const agentService = await import('../../src/services/agent.service.js');

describe('AI Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('parseJsonResponse internal logic', () => {
    it('should parse valid JSON directly', async () => {
      mockGenerateContent.mockResolvedValue('{"success":true}');
      const result = await aiService.generateBullets({});
      expect(result).toEqual({ success: true });
    });

    it('should extract and parse ```json blocks', async () => {
      mockGenerateContent.mockResolvedValue('Some text\n```json\n{"data":1}\n```\nMore text');
      const result = await aiService.generateBullets({});
      expect(result).toEqual({ data: 1 });
    });

    it('should handle unclosed ```json blocks', async () => {
      mockGenerateContent.mockResolvedValue('Some text\n```json\n{"data":1}');
      const result = await aiService.generateBullets({});
      expect(result.error).toBe('Failed to parse AI response');
    });

    it('should extract and parse ``` blocks without language tag', async () => {
      mockGenerateContent.mockResolvedValue('Some text\n```\n{"data":2}\n```\nMore text');
      const result = await aiService.generateBullets({});
      expect(result).toEqual({ data: 2 });
    });

    it('should handle unclosed ``` blocks', async () => {
      mockGenerateContent.mockResolvedValue('Some text\n```\n{"data":2}');
      const result = await aiService.generateBullets({});
      expect(result.error).toBe('Failed to parse AI response');
    });

    it('should extract and parse curly brace blocks', async () => {
      mockGenerateContent.mockResolvedValue('Here is the json: {"nested":{"a":1}, "b": 2} Thanks.');
      const result = await aiService.generateBullets({});
      expect(result).toEqual({ nested: { a: 1 }, b: 2 });
    });

    it('should fallback if extraction is invalid JSON', async () => {
      mockGenerateContent.mockResolvedValue('```json\n{invalid\n```');
      const result = await aiService.generateBullets({});
      expect(result.error).toBe('Failed to parse AI response');
    });

    it('should fallback to error if no json structure found', async () => {
      mockGenerateContent.mockResolvedValue('Just text');
      const result = await aiService.generateBullets({});
      expect(result.error).toBe('Failed to parse AI response');
      expect(result.raw).toBe('Just text');
    });
  });

  describe('chatWithInterviewAgent', () => {
    it('should call runInterviewAgent', async () => {
      const data = { message: 'Hi' };
      const result = await aiService.chatWithInterviewAgent(data);
      expect(agentService.runInterviewAgent).toHaveBeenCalledWith(data);
      expect(result).toEqual({ message: 'agent reply' });
    });
  });

  describe('generateSummary', () => {
    it('should generate summary', async () => {
      mockGenerateContent.mockResolvedValue('{"summary":"sum text"}');
      const result = await aiService.generateSummary({});
      expect(result).toEqual({ summary: 'sum text' });
    });
  });

  describe('getAtsScore', () => {
    it('should blend algorithmic and AI scores', async () => {
      const formatChecker = (await import('../../src/utils/formatChecker.js'));
      formatChecker.checkFormatting.mockReturnValueOnce({}); // All empty to hit || 0 branches

      const keywordAnalyzer = (await import('../../src/utils/keywordAnalyzer.js'));
      keywordAnalyzer.analyzeKeywords.mockReturnValueOnce({ score: 80 });

      // Setup AI response with breakdowns
      const aiResponse = JSON.stringify({
        breakdown: {
          keywordMatch: { score: 90, note: 'Good' },
          formatting: { score: 50 }, // AI score 50, Algo score 0 -> Avg 25
          sectionCompleteness: 100, // Not an object
          quantification: { note: 'Missing score' } // Object without score, should fallback to algo score 0 -> Avg 0
        }
      });
      mockGenerateContent.mockResolvedValueOnce(aiResponse);

      const result = await aiService.getAtsScore({
        sections: { skills: ['A'] },
        jobDescription: 'JD'
      });

      expect(result.breakdown.keywordMatch.score).toBe(85); // (80 + 90) / 2
      expect(result.breakdown.formatting.score).toBe(25); // (0 + 50) / 2
      expect(result.breakdown.quantification.score).toBe(0); // (0 + 0) / 2
      expect(result.overall).toBe(85); // from mock calculateOverallScore
    });

    it('should handle missing breakdown gracefully', async () => {
      mockGenerateContent.mockResolvedValue('{"suggestions":["Add stuff"]}');
      const result = await aiService.getAtsScore({});
      expect(result.breakdown).toBeUndefined();
      expect(result.suggestions).toEqual(['Add stuff']);
    });
    
    it('should handle numeric algo score for keywordMatch (if analyzeKeywords returns number)', async () => {
      const keywordAnalyzer = (await import('../../src/utils/keywordAnalyzer.js'));
      keywordAnalyzer.analyzeKeywords.mockReturnValueOnce(90); // pure number

      const formatChecker = (await import('../../src/utils/formatChecker.js'));
      formatChecker.checkFormatting.mockReturnValueOnce({ formatting: 70 });

      const aiResponse = JSON.stringify({
        breakdown: {
          keywordMatch: { score: 70 },
        }
      });
      mockGenerateContent.mockResolvedValueOnce(aiResponse);

      const result = await aiService.getAtsScore({});
      expect(result.breakdown.keywordMatch.score).toBe(80); // (90 + 70) / 2
    });
    
    it('should handle non-object aiScore safely without null', async () => {
      const keywordAnalyzer = (await import('../../src/utils/keywordAnalyzer.js'));
      keywordAnalyzer.analyzeKeywords.mockReturnValueOnce({ score: 80 });

      const formatChecker = (await import('../../src/utils/formatChecker.js'));
      formatChecker.checkFormatting.mockReturnValueOnce({ formatting: 70 });

      const aiResponse = JSON.stringify({
        breakdown: {
          keywordMatch: 80, // Number instead of object
          formatting: 'string val', // Edge case
        }
      });
      mockGenerateContent.mockResolvedValueOnce(aiResponse);

      const result = await aiService.getAtsScore({});
      expect(result.overall).toBe(85);
    });
  });

  describe('reviewResume', () => {
    it('should return review', async () => {
      mockGenerateContent.mockResolvedValue('{"review":"good"}');
      const result = await aiService.reviewResume({});
      expect(result).toEqual({ review: 'good' });
    });
  });

  describe('matchJob', () => {
    it('should return match score', async () => {
      mockGenerateContent.mockResolvedValue('{"match":90}');
      const result = await aiService.matchJob({});
      expect(result).toEqual({ match: 90 });
    });
  });

  describe('detectSkillGaps', () => {
    it('should return gaps', async () => {
      mockGenerateContent.mockResolvedValue('{"gaps":["react"]}');
      const result = await aiService.detectSkillGaps({});
      expect(result).toEqual({ gaps: ['react'] });
    });
  });

  describe('parseResume', () => {
    it('should return parsed resume', async () => {
      mockGenerateContent.mockResolvedValue('{"skills":["Node.js"]}');
      const result = await aiService.parseResume({ resumeText: 'Has Node.js' });
      expect(result).toEqual({ skills: ['Node.js'] });
    });

    it('should handle missing resumeText gracefully', async () => {
      mockGenerateContent.mockResolvedValue('{"skills":[]}');
      const result = await aiService.parseResume({});
      expect(result).toEqual({ skills: [] });
    });
  });
});
