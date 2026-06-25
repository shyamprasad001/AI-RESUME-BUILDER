import { checkFormatting } from '../../src/utils/formatChecker.js';

describe('formatChecker', () => {
  it('should return all zeros/defaults for empty sections', () => {
    const results = checkFormatting({});
    
    expect(results.sectionCompleteness).toBe(0);
    expect(results.contactInfo).toBe(0);
    expect(results.quantification).toBe(0);
    expect(results.actionVerbs).toBe(0);
    // length calculation: wordCount is JSON stringified length in words.
    // "{}" is 1 word, so length should be Math.max(0, Math.round((1/400)*100)) = 0
    expect(results.length).toBe(0);
    
    // formatting score: 100 - 15(summary) - 25(exp) - 10(edu) - 15(skills) = 35
    expect(results.formatting).toBe(35);
  });

  it('should calculate sectionCompleteness correctly', () => {
    const results = checkFormatting({
      summary: 'A summary',
      experience: [{}],
      education: [{}],
      skills: { technical: ['js'] },
      personalInfo: { fullName: 'John Doe' }
    });
    
    expect(results.sectionCompleteness).toBe(100);
    expect(results.formatting).toBe(100 - 5); // -5 because experience has no bullets
  });

  it('should calculate contactInfo correctly', () => {
    const results = checkFormatting({
      personalInfo: {
        fullName: 'John',
        email: 'j@example.com',
        // phone, location, linkedIn missing
      }
    });
    // 2 / 5 = 40%
    expect(results.contactInfo).toBe(40);
  });

  it('should calculate quantification and actionVerbs from bullets', () => {
    const results = checkFormatting({
      experience: [
        { bullets: ['Led a team of 5', 'Optimized performance by 20%', 'Did nothing'] },
        { } // missing bullets entirely
      ],
      projects: [
        { bullets: ['Developed an app', 'Just playing around'] },
        { }, // missing bullets entirely
        { bullets: ['   '] } // empty bullet string to cover firstWord fallback
      ]
    });
    
    // Total bullets = 6 (3 from exp, 3 from projects)
    // with numbers: 'Led a team of 5', 'Optimized performance by 20%' (2)
    // quantification = 2/6 = 33%
    expect(results.quantification).toBe(33);

    // ACTION_VERBS set includes: led, developed, optimized
    // action verbs: 'Led...', 'Optimized...', 'Developed...' (3)
    // actionVerbs = 3/6 = 50%
    expect(results.actionVerbs).toBe(50);
  });

  it('should handle length between 400 and 1200', () => {
    // Generate an object that stringifies to > 400 words
    const words = Array(500).fill('word').join(' ');
    const results = checkFormatting({ summary: words });
    
    expect(results.length).toBe(100);
  });

  it('should handle length between 200 and 400', () => {
    const words = Array(250).fill('word').join(' ');
    const results = checkFormatting({ summary: words });
    
    expect(results.length).toBe(70);
  });

  it('should handle length between 1200 and 1600', () => {
    const words = Array(1300).fill('word').join(' ');
    const results = checkFormatting({ summary: words });
    
    expect(results.length).toBe(70);
  });

  it('should handle length > 1600', () => {
    const words = Array(1800).fill('word').join(' ');
    const results = checkFormatting({ summary: words });
    
    // wordCount > 1600 -> Math.max(40, 100 - floor((wordCount-1600)/100)*10)
    // For ~1800 words, that's 100 - floor(200/100)*10 = 80
    // Exact word count depends on JSON.stringify output.
    expect(results.length).toBeLessThan(100);
    expect(results.length).toBeGreaterThanOrEqual(40);
  });

  it('should clamp length score to 40 minimum for extreme length', () => {
    const words = Array(3000).fill('word').join(' ');
    const results = checkFormatting({ summary: words });
    expect(results.length).toBe(40);
  });

  it('should apply formatting penalties correctly', () => {
    const results = checkFormatting({
      summary: '   ', // empty when trimmed -> -15
      experience: [], // empty -> -25
      education: [], // empty -> -10
      skills: { technical: [], soft: [] }, // empty -> -15
    });
    // total penalty = 65. 100 - 65 = 35.
    expect(results.formatting).toBe(35);
  });

  it('should apply penalty for experience with < 2 bullets', () => {
    const results = checkFormatting({
      experience: [
        { bullets: ['One'] }, // -5
        { bullets: ['One', 'Two'] } // ok
      ],
      summary: 'yes',
      education: [{}],
      skills: { soft: ['yes'] }
    });
    expect(results.formatting).toBe(95);
  });
});
