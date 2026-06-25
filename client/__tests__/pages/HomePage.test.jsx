import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { jest } from '@jest/globals';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../src/context/AuthContext.jsx';

jest.unstable_mockModule('../../src/components/Navbar', () => ({ default: () => <nav data-testid="navbar">Navbar</nav> }));
jest.unstable_mockModule('react-hot-toast', () => ({ default: { error: jest.fn(), success: jest.fn() } }));
jest.unstable_mockModule('../../src/services/resumeService.js', () => ({
  getResumes: jest.fn(),
  createResume: jest.fn(),
  uploadResume: jest.fn(),
}));
jest.unstable_mockModule('../../src/components/templates/ClassicTemplate.jsx', () => ({ default: () => <div>ClassicTemplate</div> }));
jest.unstable_mockModule('../../src/components/templates/ModernTemplate.jsx', () => ({ default: () => <div>ModernTemplate</div> }));
jest.unstable_mockModule('../../src/components/templates/CreativeTemplate.jsx', () => ({ default: () => <div>CreativeTemplate</div> }));
jest.unstable_mockModule('../../src/components/templates/MinimalTemplate.jsx', () => ({ default: () => <div>MinimalTemplate</div> }));
jest.unstable_mockModule('../../src/components/templates/ExecutiveTemplate.jsx', () => ({ default: () => <div>ExecutiveTemplate</div> }));
jest.unstable_mockModule('../../src/components/TemplateCard', () => ({ default: () => <div>TemplateCard</div>, SAMPLE_DATA: {} }));

describe('HomePage', () => {
  let HomePageComp, resumeService, toast;

  beforeAll(async () => {
    HomePageComp = (await import('../../src/pages/HomePage/index.jsx')).default;
    resumeService = await import('../../src/services/resumeService.js');
    toast = (await import('react-hot-toast')).default;
  });
  const mockUser = { name: 'Test User' };

  const renderWithContext = (ui) => {
    return render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <MemoryRouter>{ui}</MemoryRouter>
      </AuthContext.Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders greeting and action cards', async () => {
    resumeService.getResumes.mockResolvedValueOnce([]);

    await act(async () => {
      renderWithContext(<HomePageComp />);
    });

    expect(screen.getByText('Welcome back, Test')).toBeInTheDocument();
    expect(screen.getByText('Create New Resume')).toBeInTheDocument();
    expect(screen.getByText('Improve Existing')).toBeInTheDocument();
  });

  it('fetches and displays recent resumes', async () => {
    const mockResumes = [
      { _id: '1', title: 'Resume 1', templateId: 'classic', targetRole: 'Role 1', updatedAt: '2023-01-01' },
      { _id: '2', title: 'Resume 2', templateId: 'modern', targetRole: 'Role 2', updatedAt: '2023-01-02' },
    ];
    resumeService.getResumes.mockResolvedValueOnce(mockResumes);

    await act(async () => {
      renderWithContext(<HomePageComp />);
    });

    expect(screen.getByText('Resume 1')).toBeInTheDocument();
    expect(screen.getByText('Role 1')).toBeInTheDocument();
    expect(screen.getByText('Resume 2')).toBeInTheDocument();
    expect(screen.getByText('Role 2')).toBeInTheDocument();
  });

  it('shows error toast if fetch fails', async () => {
    resumeService.getResumes.mockRejectedValueOnce(new Error('Fetch failed'));

    await act(async () => {
      renderWithContext(<HomePageComp />);
    });

    expect(toast.error).toHaveBeenCalledWith('Failed to load resumes');
  });

  it('opens and closes create modal', async () => {
    resumeService.getResumes.mockResolvedValueOnce([]);

    await act(async () => {
      renderWithContext(<HomePageComp />);
    });

    fireEvent.click(screen.getByText('Create New Resume'));
    
    // Modal opens
    const modalTitle = screen.getAllByText('Create New Resume')[1]; // Second instance is modal title
    expect(modalTitle).toBeInTheDocument();

    fireEvent.click(screen.getByText('Cancel'));
    expect(modalTitle).not.toBeInTheDocument();
  });

  it('creates a new resume', async () => {
    resumeService.getResumes.mockResolvedValueOnce([]);
    resumeService.createResume.mockResolvedValueOnce({ _id: 'new-id' });

    await act(async () => {
      renderWithContext(<HomePageComp />);
    });

    fireEvent.click(screen.getByText('Create New Resume'));
    
    fireEvent.change(screen.getByPlaceholderText('e.g., Software Engineer Resume'), { target: { value: 'My Resume' } });
    fireEvent.change(screen.getByPlaceholderText('e.g., Frontend Developer'), { target: { value: 'Dev' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Create Resume' }));
    });

    expect(resumeService.createResume).toHaveBeenCalledWith({
      title: 'My Resume',
      templateId: 'classic',
      targetRole: 'Dev'
    });
    expect(toast.success).toHaveBeenCalledWith('Resume created!');
  });

  it('opens and closes upload modal', async () => {
    resumeService.getResumes.mockResolvedValueOnce([]);

    await act(async () => {
      renderWithContext(<HomePageComp />);
    });

    fireEvent.click(screen.getByText('Improve Existing'));
    
    expect(screen.getByText('Upload Existing Resume')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Upload Existing Resume')).not.toBeInTheDocument();
  });
});
