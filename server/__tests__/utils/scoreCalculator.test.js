import { calculateOverallScore, getScoreCategory } from '../../src/utils/scoreCalculator.js';

describe('scoreCalculator', () => {
  describe('calculateOverallScore', () => {
    it('should return 0 if metrics are empty', () => {
      expect(calculateOverallScore({})).toBe(0);
    });

    it('should calculate weighted score correctly with numbers', () => {
      const metrics = {
        keywordMatch: 100, // weight: 0.2
        bulletQuality: 100, // weight: 0.15
        formatting: 100, // weight: 0.1
        sectionCompleteness: 100, // weight: 0.1
        summaryStrength: 100, // weight: 0.1
        skillCoverage: 100, // weight: 0.1
        quantification: 100, // weight: 0.1
        actionVerbs: 100, // weight: 0.05
        length: 100, // weight: 0.05
        contactInfo: 100, // weight: 0.05
      };
      // Total weight sum is 1.0, so 100 * 1.0 = 100
      expect(calculateOverallScore(metrics)).toBe(100);
    });

    it('should extract score from objects', () => {
      const metrics = {
        keywordMatch: { score: 50 },
        bulletQuality: { score: 50 },
        formatting: 50,
      };
      // 50 * 0.2 + 50 * 0.15 + 50 * 0.1 = 10 + 7.5 + 5 = 22.5 => rounded to 23
      expect(calculateOverallScore(metrics)).toBe(23);
    });

    it('should handle objects without score property', () => {
      const metrics = {
        keywordMatch: { notScore: 50 },
      };
      expect(calculateOverallScore(metrics)).toBe(0);
    });
  });

  describe('getScoreCategory', () => {
    it('should return strong for score >= 80', () => {
      expect(getScoreCategory(80)).toBe('strong');
      expect(getScoreCategory(100)).toBe('strong');
    });

    it('should return good for score >= 60 and < 80', () => {
      expect(getScoreCategory(60)).toBe('good');
      expect(getScoreCategory(79)).toBe('good');
    });

    it('should return needs-work for score >= 40 and < 60', () => {
      expect(getScoreCategory(40)).toBe('needs-work');
      expect(getScoreCategory(59)).toBe('needs-work');
    });

    it('should return weak for score < 40', () => {
      expect(getScoreCategory(39)).toBe('weak');
      expect(getScoreCategory(0)).toBe('weak');
    });
  });
});
