import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from '../context/AuthContext.jsx';
import { ResumeProvider } from '../context/ResumeContext.jsx'; // Might be needed for builder components

// Custom render that wraps components in all necessary providers
const customRender = (ui, options = {}) => {
  const { 
    initialRoute = '/',
    ...renderOptions 
  } = options;

  // We can setup window.history to initialRoute if needed, but BrowserRouter handles generic mounting.
  // For deep routing tests, MemoryRouter is preferred, but BrowserRouter works for most UI tests if we aren't asserting on URL changes strictly.
  // However, since we mock API calls, auth context will dictate UI state.

  const AllTheProviders = ({ children }) => {
    return (
      <GoogleOAuthProvider clientId="test-client-id">
        <BrowserRouter>
          <AuthProvider>
            <ResumeProvider>
              {children}
            </ResumeProvider>
          </AuthProvider>
        </BrowserRouter>
      </GoogleOAuthProvider>
    );
  };

  return render(ui, { wrapper: AllTheProviders, ...renderOptions });
};

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render };
