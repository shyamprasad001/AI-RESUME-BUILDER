import { jest } from '@jest/globals';
import * as authService from '../../src/services/authService.js';

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    localStorage.clear();
  });

  afterEach(() => {
    delete global.fetch;
  });

  it('register', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { user: 'Alice' } }) });
    const result = await authService.register('Alice', 'alice@test.com', 'pw');
    expect(result).toEqual({ user: 'Alice' });
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/auth/register', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ name: 'Alice', email: 'alice@test.com', password: 'pw' })
    }));
  });

  it('emailLogin', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { user: 'Alice' } }) });
    const result = await authService.emailLogin('alice@test.com', 'pw');
    expect(result).toEqual({ user: 'Alice' });
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/auth/login', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ email: 'alice@test.com', password: 'pw' })
    }));
  });

  it('googleLogin', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { user: 'Alice' } }) });
    const result = await authService.googleLogin('cred');
    expect(result).toEqual({ user: 'Alice' });
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/auth/google', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ credential: 'cred' })
    }));
  });

  it('getMe', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { user: 'Alice' } }) });
    const result = await authService.getMe();
    expect(result).toEqual({ user: 'Alice' });
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/auth/me', expect.any(Object));
  });

  it('logout', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) });
    const result = await authService.logout();
    expect(result).toEqual({ success: true });
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/auth/logout', expect.objectContaining({ method: 'POST' }));
  });
});
