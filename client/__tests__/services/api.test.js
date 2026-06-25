import { jest } from '@jest/globals';
import API from '../../src/services/api.js';

describe('api.js fetch wrapper', () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    delete global.fetch;
  });

  it('should make GET request with correct headers', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });
    localStorage.setItem('token', 'testtoken');

    const result = await API.get('/test');

    expect(result.success).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/test', {
      headers: {
        'Authorization': 'Bearer testtoken',
        'Content-Type': 'application/json'
      }
    });
  });

  it('should make POST request with JSON body', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1 })
    });

    const result = await API.post('/test', { name: 'Alice' });

    expect(result.id).toBe(1);
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/test', {
      method: 'POST',
      body: JSON.stringify({ name: 'Alice' }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  });

  it('should make POST request with FormData (no Content-Type set)', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ uploaded: true })
    });

    const formData = new FormData();
    formData.append('file', new Blob(['test'], { type: 'text/plain' }));

    await API.post('/upload', formData);

    const callArgs = global.fetch.mock.calls[0][1];
    expect(callArgs.body).toBe(formData);
    // Content-Type should NOT be set so browser sets multipart boundary
    expect(callArgs.headers['Content-Type']).toBeUndefined();
  });

  it('should make PUT request', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ updated: true })
    });

    await API.put('/test/1', { updatedName: 'Bob' });

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/test/1', expect.objectContaining({
      method: 'PUT',
      body: JSON.stringify({ updatedName: 'Bob' })
    }));
  });

  it('should make DELETE request', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ deleted: true })
    });

    await API.delete('/test/1');

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/test/1', expect.objectContaining({
      method: 'DELETE'
    }));
  });

  it('should throw error when response is not ok', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ message: 'Bad Request' })
    });

    await expect(API.get('/fail')).rejects.toThrow('Bad Request');
  });

  it('should throw default error when message is missing', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({})
    });

    await expect(API.get('/fail2')).rejects.toThrow('Request failed');
  });
});
