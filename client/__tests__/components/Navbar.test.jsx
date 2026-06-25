import { render, screen, fireEvent } from '@testing-library/react';
import { jest } from '@jest/globals';

const mockNavigate = jest.fn();
const mockLocation = jest.fn();

jest.unstable_mockModule('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation(),
  Link: ({ children, to }) => <a href={to} data-testid="mock-link">{children}</a>,
  MemoryRouter: ({ children }) => <div data-testid="mock-router">{children}</div>,
}));

describe('Navbar', () => {
  const mockLogout = jest.fn();
  let Navbar, MemoryRouter, AuthContext;

  beforeAll(async () => {
    Navbar = (await import('../../src/components/Navbar/index.jsx')).default;
    MemoryRouter = (await import('react-router-dom')).MemoryRouter;
    AuthContext = (await import('../../src/context/AuthContext.jsx')).AuthContext;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocation.mockReturnValue({ pathname: '/home' });
  });

  const renderWithContext = (user = null, props = {}) => {
    return render(
      <MemoryRouter>
        <AuthContext.Provider value={{ user, logout: mockLogout }}>
          <Navbar {...props} />
        </AuthContext.Provider>
      </MemoryRouter>
    );
  };

  it('renders correctly for unauthenticated user', () => {
    renderWithContext(null);
    expect(screen.getByText('AI Resume Builder')).toBeInTheDocument();
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  it('renders correctly for authenticated user', () => {
    const user = { name: 'John Doe', picture: 'pic.jpg' };
    renderWithContext(user);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'John Doe' })).toBeInTheDocument();
    expect(screen.getByTitle('Logout')).toBeInTheDocument();
    
    // Links
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Templates')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders user placeholder if no picture', () => {
    const user = { name: 'Alice' };
    renderWithContext(user);
    
    expect(screen.getByText('A')).toBeInTheDocument(); // placeholder
  });

  it('calls logout and navigates on logout click', () => {
    const user = { name: 'John' };
    renderWithContext(user);
    
    fireEvent.click(screen.getByTitle('Logout'));
    
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('shows back link when showBack is true', () => {
    renderWithContext(null, { showBack: true });
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('AI Resume Builder')).not.toBeInTheDocument();
  });

  it('shows title when provided', () => {
    renderWithContext(null, { title: 'My Resume' });
    
    expect(screen.getByText('My Resume')).toBeInTheDocument();
  });
});
