import { jest } from '@jest/globals';
import { render, screen, act, waitFor } from '@testing-library/react';
import React, { useContext } from 'react';
import { AuthContext, AuthProvider } from '../../src/context/AuthContext';

const TestComponent = () => {
  const { user, loading, login, logout } = useContext(AuthContext);

  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading...' : 'Loaded'}</div>
      <div data-testid="user">{user ? user.name : 'No User'}</div>
      <button onClick={() => login('mocktoken', { name: 'Test User' })}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    delete global.fetch;
  });

  it('should initialize with loading false if no token is present', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('Loaded');
    });
    
    expect(screen.getByTestId('user').textContent).toBe('No User');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should fetch user and set loading false if token is present', async () => {
    localStorage.setItem('token', 'existingtoken');
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { name: 'Fetched User' } })
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('Loaded');
    });

    expect(screen.getByTestId('user').textContent).toBe('Fetched User');
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/me'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer existingtoken'
        })
      })
    );
  });

  it('should clear token and set loading false if getMe fails', async () => {
    localStorage.setItem('token', 'badtoken');
    
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Invalid token' })
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('Loaded');
    });

    expect(screen.getByTestId('user').textContent).toBe('No User');
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('should login and set token and user data', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('Loaded');
    });

    act(() => {
      screen.getByText('Login').click();
    });

    expect(localStorage.getItem('token')).toBe('mocktoken');
    expect(screen.getByTestId('user').textContent).toBe('Test User');
  });

  it('should logout and clear token and user data', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('Loaded');
    });

    act(() => {
      screen.getByText('Login').click();
    });
    expect(screen.getByTestId('user').textContent).toBe('Test User');

    act(() => {
      screen.getByText('Logout').click();
    });

    expect(localStorage.getItem('token')).toBeNull();
    expect(screen.getByTestId('user').textContent).toBe('No User');
  });
});
