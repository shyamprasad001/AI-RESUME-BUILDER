import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../src/context/AuthContext.jsx';
import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/pages/LandingPage', () => ({ default: () => <div data-testid="landing-page">LandingPage</div> }));
jest.unstable_mockModule('../../src/pages/LoginPage', () => ({ default: () => <div data-testid="login-page">LoginPage</div> }));
jest.unstable_mockModule('../../src/pages/HomePage', () => ({ default: () => <div data-testid="home-page">HomePage</div> }));

describe('App Routing', () => {
  let AppComp;

  beforeAll(async () => {
    AppComp = (await import('../../src/App.jsx')).default;
  });

  const renderWithContext = (route, user = null, loading = false) => {
    return render(
      <AuthContext.Provider value={{ user, loading }}>
        <MemoryRouter initialEntries={[route]}>
          <AppComp />
        </MemoryRouter>
      </AuthContext.Provider>
    );
  };

  it('shows loading spinner when auth is loading', async () => {
    await act(async () => {
      renderWithContext('/', null, true);
    });
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders LandingPage for unauthenticated users at /', async () => {
    await act(async () => {
      renderWithContext('/', null, false);
    });
    expect(screen.getByTestId('landing-page')).toBeInTheDocument();
  });

  it('renders LoginPage for unauthenticated users at /login', async () => {
    await act(async () => {
      renderWithContext('/login', null, false);
    });
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  it('redirects authenticated users from / to /home', async () => {
    await act(async () => {
      renderWithContext('/', { name: 'User' }, false);
    });
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  it('redirects unauthenticated users from /home to /login', async () => {
    await act(async () => {
      renderWithContext('/home', null, false);
    });
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });
});
