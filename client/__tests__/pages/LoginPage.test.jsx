import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { jest } from '@jest/globals';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../../src/pages/LoginPage/index.jsx';
import { AuthContext } from '../../src/context/AuthContext.jsx';

jest.unstable_mockModule('react-hot-toast', () => ({ default: { error: jest.fn(), success: jest.fn() } }));
jest.unstable_mockModule('../../src/services/authService.js', () => ({
  register: jest.fn(),
  emailLogin: jest.fn(),
  googleLogin: jest.fn(),
}));
jest.unstable_mockModule('@react-oauth/google', () => ({
  useGoogleLogin: jest.fn(({ onSuccess, onError }) => () => {
    if (global.mockGoogleLoginError) {
      onError();
    } else {
      onSuccess({ access_token: 'mock-google-token' });
    }
  }),
}));

const mockNavigate = jest.fn();

jest.unstable_mockModule('react-router-dom', async () => {
  const actual = await import('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LoginPage', () => {
  let LoginPageComp, MemoryRouterComp, authService, toast;
  const mockLogin = jest.fn();

  beforeAll(async () => {
    LoginPageComp = (await import('../../src/pages/LoginPage/index.jsx')).default;
    MemoryRouterComp = (await import('react-router-dom')).MemoryRouter;
    authService = await import('../../src/services/authService.js');
    toast = (await import('react-hot-toast')).default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    global.mockGoogleLoginError = false;
  });

  const renderWithContext = () => {
    return render(
      <AuthContext.Provider value={{ login: mockLogin }}>
        <MemoryRouterComp>
          <LoginPageComp />
        </MemoryRouterComp>
      </AuthContext.Provider>
    );
  };

  it('renders login form by default', () => {
    renderWithContext();
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('At least 6 characters')).toBeInTheDocument();
  });

  it('toggles between login and register', () => {
    renderWithContext();
    const toggleBtn = screen.getByText('Sign Up');
    fireEvent.click(toggleBtn);

    expect(screen.getByText('Create your account')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Your full name')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Sign In'));
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
  });

  it('handles email login success', async () => {
    authService.emailLogin.mockResolvedValueOnce({ token: 'test-token', user: { name: 'User' } });

    renderWithContext();
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('At least 6 characters'), { target: { value: 'password123' } });

    fireEvent.submit(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(authService.emailLogin).toHaveBeenCalledWith('test@test.com', 'password123');
      expect(mockLogin).toHaveBeenCalledWith('test-token', { name: 'User' });
      expect(mockNavigate).toHaveBeenCalledWith('/home');
      expect(toast.success).toHaveBeenCalledWith('Welcome back!');
    });
  });

  it('handles email login failure', async () => {
    authService.emailLogin.mockRejectedValueOnce(new Error('Auth failed'));

    renderWithContext();
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('At least 6 characters'), { target: { value: 'password123' } });

    fireEvent.submit(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Authentication failed');
    });
  });

  it('handles registration success', async () => {
    authService.register.mockResolvedValueOnce({ token: 'test-token', user: { name: 'New User' } });

    renderWithContext();
    fireEvent.click(screen.getByText('Sign Up'));

    fireEvent.change(screen.getByPlaceholderText('Your full name'), { target: { value: 'New User' } });
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'new@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('At least 6 characters'), { target: { value: 'password123' } });

    fireEvent.submit(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith('New User', 'new@test.com', 'password123');
      expect(mockLogin).toHaveBeenCalledWith('test-token', { name: 'New User' });
      expect(mockNavigate).toHaveBeenCalledWith('/home');
      expect(toast.success).toHaveBeenCalledWith('Account created!');
    });
  });

  it('handles Google login success', async () => {
    authService.googleLogin.mockResolvedValueOnce({ token: 'g-token', user: { name: 'Google User' } });

    renderWithContext();
    fireEvent.click(screen.getByText('Sign in with Google'));

    await waitFor(() => {
      expect(authService.googleLogin).toHaveBeenCalledWith('mock-google-token');
      expect(mockLogin).toHaveBeenCalledWith('g-token', { name: 'Google User' });
      expect(mockNavigate).toHaveBeenCalledWith('/home');
      expect(toast.success).toHaveBeenCalledWith('Welcome!');
    });
  });

  it('handles Google login failure from API', async () => {
    authService.googleLogin.mockRejectedValueOnce(new Error('Google Auth Failed'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    renderWithContext();
    fireEvent.click(screen.getByText('Sign in with Google'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Google login failed');
    });

    consoleSpy.mockRestore();
  });

  it('handles Google login failure from hook', async () => {
    global.mockGoogleLoginError = true;
    
    renderWithContext();
    fireEvent.click(screen.getByText('Sign in with Google'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Google login failed');
    });
  });
});
