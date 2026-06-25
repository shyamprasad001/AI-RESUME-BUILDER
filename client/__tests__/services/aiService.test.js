import { jest } from '@jest/globals';
import * as aiService from '../../src/services/aiService.js';

describe('aiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    localStorage.clear();
  });

  afterEach(() => {
    delete global.fetch;
  });

  it('chatWithAgent', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { message: 'hello' } }) });
    const result = await aiService.chatWithAgent(1, 'hi', 'summary');
    expect(result).toEqual({ message: 'hello' });
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/ai/chat', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ resumeId: 1, message: 'hi', sectionTargeted: 'summary' })
    }));
  });

  it('chatWithAgent with default sectionTargeted', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { message: 'hello' } }) });
    const result = await aiService.chatWithAgent(1, 'hi');
    expect(result).toEqual({ message: 'hello' });
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/ai/chat', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ resumeId: 1, message: 'hi', sectionTargeted: '' })
    }));
  });

  it('generateBullets', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { bullets: ['a', 'b'] } }) });
    const result = await aiService.generateBullets({ role: 'dev' });
    expect(result).toEqual({ bullets: ['a', 'b'] });
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/ai/generate-bullets', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ role: 'dev' })
    }));
  });

  it('generateSummary', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { summary: 'good' } }) });
    const result = await aiService.generateSummary(1);
    expect(result).toEqual({ summary: 'good' });
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/ai/generate-summary', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ resumeId: 1 })
    }));
  });

  it('getAtsScore', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { score: 90 } }) });
    const result = await aiService.getAtsScore(1, 'jd text');
    expect(result).toEqual({ score: 90 });
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/ai/ats-score', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ resumeId: 1, jobDescription: 'jd text' })
    }));
  });

  it('reviewResume', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { feedback: 'needs work' } }) });
    const result = await aiService.reviewResume(1);
    expect(result).toEqual({ feedback: 'needs work' });
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/ai/review', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ resumeId: 1 })
    }));
  });

  it('matchJob', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { match: 80 } }) });
    const result = await aiService.matchJob(1, 'jd text');
    expect(result).toEqual({ match: 80 });
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/ai/match-job', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ resumeId: 1, jobDescription: 'jd text' })
    }));
  });

  it('detectSkillGaps', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { gaps: ['react'] } }) });
    const result = await aiService.detectSkillGaps(1, 'jd text');
    expect(result).toEqual({ gaps: ['react'] });
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/ai/skill-gaps', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ resumeId: 1, jobDescription: 'jd text' })
    }));
  });

  it('getChatHistory', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { history: [] } }) });
    const result = await aiService.getChatHistory(1);
    expect(result).toEqual({ history: [] });
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/ai/chat-history/1', expect.any(Object));
  });
});
