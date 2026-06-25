import { jest } from '@jest/globals';
import * as resumeService from '../../src/services/resumeService.js';

describe('resumeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    localStorage.clear();
  });

  afterEach(() => {
    delete global.fetch;
  });

  it('createResume', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { id: 1 } }) });
    const result = await resumeService.createResume({ title: 'New' });
    expect(result).toEqual({ id: 1 });
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/resumes', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ title: 'New' })
    }));
  });

  it('createResume default data', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { id: 2 } }) });
    const result = await resumeService.createResume();
    expect(result).toEqual({ id: 2 });
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/resumes', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({})
    }));
  });

  it('getResumes', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: [{ id: 1 }] }) });
    const result = await resumeService.getResumes();
    expect(result).toEqual([{ id: 1 }]);
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/resumes', expect.any(Object));
  });

  it('getResume', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { id: 1 } }) });
    const result = await resumeService.getResume(1);
    expect(result).toEqual({ id: 1 });
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/resumes/1', expect.any(Object));
  });

  it('updateResume', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { id: 1 } }) });
    const result = await resumeService.updateResume(1, { title: 'Updated' });
    expect(result).toEqual({ id: 1 });
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/resumes/1', expect.objectContaining({
      method: 'PUT',
      body: JSON.stringify({ title: 'Updated' })
    }));
  });

  it('updateSection', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { id: 1 } }) });
    const result = await resumeService.updateSection(1, 'summary', 'My summary');
    expect(result).toEqual({ id: 1 });
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/resumes/1/sections/summary', expect.objectContaining({
      method: 'PUT',
      body: JSON.stringify({ data: 'My summary' })
    }));
  });

  it('updateTemplate', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { id: 1 } }) });
    const result = await resumeService.updateTemplate(1, 'modern');
    expect(result).toEqual({ id: 1 });
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/resumes/1/template', expect.objectContaining({
      method: 'PUT',
      body: JSON.stringify({ templateId: 'modern' })
    }));
  });

  it('deleteResume', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { success: true } }) });
    const result = await resumeService.deleteResume(1);
    expect(result).toEqual({ success: true });
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/resumes/1', expect.objectContaining({ method: 'DELETE' }));
  });

  it('saveVersion', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { id: 'v1' } }) });
    const result = await resumeService.saveVersion(1, 'v1 label');
    expect(result).toEqual({ id: 'v1' });
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/versions/1', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ label: 'v1 label' })
    }));
  });

  it('getVersions', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: [{ id: 'v1' }] }) });
    const result = await resumeService.getVersions(1);
    expect(result).toEqual([{ id: 'v1' }]);
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/versions/1', expect.any(Object));
  });

  it('restoreVersion', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { id: 1 } }) });
    const result = await resumeService.restoreVersion(1, 'v1');
    expect(result).toEqual({ id: 1 });
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/versions/1/v1/restore', expect.objectContaining({ method: 'POST' }));
  });

  it('deleteVersion', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { success: true } }) });
    const result = await resumeService.deleteVersion(1, 'v1');
    expect(result).toEqual({ success: true });
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/versions/1/v1', expect.objectContaining({ method: 'DELETE' }));
  });

  it('uploadResume', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { text: 'resume content' } }) });
    const file = new File(['dummy'], 'resume.pdf', { type: 'application/pdf' });
    const result = await resumeService.uploadResume(file);
    
    expect(result).toEqual({ text: 'resume content' });
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/resumes/upload', expect.objectContaining({
      method: 'POST',
      body: expect.any(FormData)
    }));
  });
});
