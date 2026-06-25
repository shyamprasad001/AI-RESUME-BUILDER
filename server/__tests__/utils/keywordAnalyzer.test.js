import { analyzeKeywords } from '../../src/utils/keywordAnalyzer.js';

describe('keywordAnalyzer', () => {
  it('should return 0 score and empty arrays if jobDescription is missing', () => {
    const result = analyzeKeywords('resume text', '');
    expect(result).toEqual({ score: 0, matched: [], missing: [], totalJdKeywords: 0 });
  });

  it('should extract keywords and calculate match score', () => {
    const jd = 'We need react and node.js. Also typescript.';
    const resume = 'I know react and typescript.';
    
    const result = analyzeKeywords(resume, jd);
    
    expect(result.score).toBeGreaterThan(0);
    expect(result.matched).toContain('react');
    expect(result.matched).toContain('typescript');
    expect(result.missing).toContain('node.js');
    expect(result.totalJdKeywords).toBe(4);
  });

  it('should ignore stop words and short words', () => {
    const jd = 'The and for are but not you all can had her was one our out has have been will with this that from they were said each which their about would make like just over such take than them very some into most other could also more what when your work able using used including must should well experience role team join looking based strong working knowledge understanding skills ability responsibilities requirements qualifications preferred required years plus etc minimum';
    const resume = 'the and for are but not you';
    
    const result = analyzeKeywords(resume, jd);
    
    expect(result.totalJdKeywords).toBe(0);
    expect(result.score).toBe(0);
    expect(result.matched).toEqual([]);
    expect(result.missing).toEqual([]);
  });

  it('should cap top JD keywords at 30 and missing at 15 and matched at 20', () => {
    // Generate JD with 40 unique words (only letters to match regex)
    let jd = '';
    let resume = '';
    for (let i = 0; i < 40; i++) {
      const word = 'testword' + String.fromCharCode(97 + (i % 26)) + String.fromCharCode(97 + Math.floor(i / 26));
      jd += `${word} `;
      if (i < 25) { // match first 25 words
        resume += `${word} `;
      }
    }
    
    const result = analyzeKeywords(resume, jd);
    
    expect(result.totalJdKeywords).toBe(30); // Capped at 30
    
    // Of the 30 top words (word0 to word29), 25 are matched (word0 to word24) and 5 are missing (word25 to word29)
    // The matched array is sliced to 20
    expect(result.matched.length).toBe(20);
    // The missing array is sliced to 15, but there are only 5 missing anyway
    expect(result.missing.length).toBe(5);
  });

  it('should handle text with no valid words', () => {
    // only numbers, won't match regex \b[a-z][a-z+#./-]{2,}\b
    const jd = '123 456 789';
    const resume = '123 456';
    const result = analyzeKeywords(resume, jd);
    expect(result.totalJdKeywords).toBe(0);
    expect(result.score).toBe(0);
  });
});
