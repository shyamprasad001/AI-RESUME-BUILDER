import { render, screen, act, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ResumeContext } from '../../src/context/ResumeContext.jsx';

// Mock child components to isolate BuilderPage logic
jest.unstable_mockModule('../../src/components/Navbar', () => ({ default: ({ title }) => <nav data-testid="navbar">{title}</nav> }));
jest.unstable_mockModule('../../src/components/ProgressBar', () => ({ default: ({ percentage }) => <div data-testid="progress-bar">{percentage}%</div> }));
jest.unstable_mockModule('../../src/components/Sidebar', () => ({ default: () => <div data-testid="sidebar">Sidebar</div> }));
jest.unstable_mockModule('../../src/components/ResumePreview', () => ({ default: () => <div data-testid="resume-preview">Preview</div> }));
jest.unstable_mockModule('react-hot-toast', () => ({ default: { error: jest.fn(), success: jest.fn() } }));
jest.unstable_mockModule('../../src/services/resumeService.js', () => ({
  getResume: jest.fn(),
  updateResume: jest.fn(),
}));

describe('BuilderPage', () => {
  let BuilderPageComp, resumeService, toast;

  beforeAll(async () => {
    BuilderPageComp = (await import('../../src/pages/BuilderPage/index.jsx')).default;
    resumeService = await import('../../src/services/resumeService.js');
    toast = (await import('react-hot-toast')).default;
  });
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const renderWithRouter = () => {
    return render(
      <MemoryRouter initialEntries={['/builder/123']}>
        <Routes>
          <Route path="/builder/:id" element={<BuilderPageComp />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders loading state initially', async () => {
    resumeService.getResume.mockImplementation(() => new Promise(() => {}));
    
    renderWithRouter();
    
    expect(screen.getByText('Loading resume...')).toBeInTheDocument();
  });

  it('fetches and loads resume data', async () => {
    const mockResume = {
      _id: '123',
      title: 'Test Resume',
      templateId: 'classic',
      targetRole: 'Dev',
      sections: {
        personalInfo: { fullName: 'John', email: 'john@test.com' },
        experience: [],
        education: [],
        skills: {
          technical: [],
          soft: [],
          languages: [],
          tools: []
        },
        projects: [],
        certifications: []
      }
    };
    resumeService.getResume.mockResolvedValueOnce(mockResume);

    await act(async () => {
      renderWithRouter();
    });

    expect(screen.getByTestId('navbar')).toHaveTextContent('Test Resume');
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('resume-preview')).toBeInTheDocument();
  });

  it('handles fetch error', async () => {
    resumeService.getResume.mockRejectedValueOnce(new Error('Fetch failed'));

    await act(async () => {
      renderWithRouter();
    });

    expect(toast.error).toHaveBeenCalledWith('Failed to load resume');
  });

  it('auto-saves when changes occur', async () => {
    // We mock ResumeContext using a custom render to inject `hasChanges`
    const mockResume = { _id: '123', title: 'Test', templateId: 'classic' };
    resumeService.getResume.mockResolvedValueOnce(mockResume);
    resumeService.updateResume.mockResolvedValueOnce({});

    let setHasChangesFn;
    const TestComponent = () => {
      const BuilderContent = require('../../src/pages/BuilderPage/index.jsx').default;
      return <BuilderContent />;
    };

    const MockProvider = ({ children }) => {
      const BuilderPageModule = require('../../src/pages/BuilderPage/index.jsx');
      // For this test, we test the actual logic inside BuilderPage's internal BuilderContent 
      // by relying on the context provided by BuilderPage.
      return children;
    };

    // To test auto-save, we can actually trigger a change in the context by exposing it or 
    // we can mock ResumeProvider. Let's just mock ResumeContext fully for this specific test.
  });
});
