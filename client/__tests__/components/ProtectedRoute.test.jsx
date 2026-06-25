import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../../src/components/ProtectedRoute/index.jsx';
import { AuthContext } from '../../src/context/AuthContext.jsx';

describe('ProtectedRoute', () => {
  const renderWithContext = (user, loading) => {
    return render(
      <MemoryRouter initialEntries={['/protected']}>
        <AuthContext.Provider value={{ user, loading }}>
          <Routes>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route 
              path="/protected" 
              element={
                <ProtectedRoute>
                  <div>Protected Content</div>
                </ProtectedRoute>
              } 
            />
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>
    );
  };

  it('renders loading state when loading is true', () => {
    renderWithContext(null, true);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('redirects to login when user is null and not loading', () => {
    renderWithContext(null, false);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children when user is authenticated and not loading', () => {
    renderWithContext({ name: 'User' }, false);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });
});
