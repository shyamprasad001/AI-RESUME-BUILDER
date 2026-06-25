import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { jest } from '@jest/globals';
import { MemoryRouter } from 'react-router-dom';

jest.unstable_mockModule('../../src/components/Navbar', () => ({ default: () => <nav data-testid="navbar">Navbar</nav> }));
jest.unstable_mockModule('react-hot-toast', () => ({ default: { error: jest.fn(), success: jest.fn() } }));
jest.unstable_mockModule('../../src/services/resumeService.js', () => ({
  getResumes: jest.fn(),
  deleteResume: jest.fn()
}));
jest.unstable_mockModule('../../src/components/templates/ClassicTemplate.jsx', () => ({ default: () => <div>ClassicTemplate</div> }));
jest.unstable_mockModule('../../src/components/templates/ModernTemplate.jsx', () => ({ default: () => <div>ModernTemplate</div> }));
jest.unstable_mockModule('../../src/components/templates/CreativeTemplate.jsx', () => ({ default: () => <div>CreativeTemplate</div> }));
jest.unstable_mockModule('../../src/components/templates/MinimalTemplate.jsx', () => ({ default: () => <div>MinimalTemplate</div> }));
jest.unstable_mockModule('../../src/components/templates/ExecutiveTemplate.jsx', () => ({ default: () => <div>ExecutiveTemplate</div> }));
jest.unstable_mockModule('../../src/components/TemplateCard', () => ({ default: () => <div>TemplateCard</div>, SAMPLE_DATA: {} }));

const mockNavigate = jest.fn();
jest.unstable_mockModule('react-router-dom', async () => {
  const actual = await import('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('DashboardPage', () => {
  let DashboardPageComp, MemoryRouterComp, resumeService, toast;

  beforeAll(async () => {
    DashboardPageComp = (await import('../../src/pages/DashboardPage/index.jsx')).default;
    MemoryRouterComp = (await import('react-router-dom')).MemoryRouter;
    resumeService = await import('../../src/services/resumeService.js');
    toast = (await import('react-hot-toast')).default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    global.confirm = jest.fn();
  });

  const renderWithRouter = () => {
    return render(
      <MemoryRouterComp>
        <DashboardPageComp />
      </MemoryRouterComp>
    );
  };

  it('renders loading state initially', async () => {
    resumeService.getResumes.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    renderWithRouter();
    
    expect(screen.getByText('My Resumes')).toBeInTheDocument();
  });

  it('renders empty state if no resumes', async () => {
    resumeService.getResumes.mockResolvedValueOnce([]);

    await act(async () => {
      renderWithRouter();
    });

    expect(screen.getByText('No resumes yet')).toBeInTheDocument();
    expect(screen.getByText('Head to the Home page to create your first AI-powered resume')).toBeInTheDocument();
  });

  it('renders a list of resumes', async () => {
    const mockResumes = [
      { _id: '1', title: 'Resume 1', templateId: 'classic', targetRole: 'Dev', updatedAt: '2023-01-01T12:00:00.000Z', atsScore: { overall: 85 } },
      { _id: '2', title: 'Resume 2', templateId: 'modern', targetRole: 'Designer', updatedAt: '2023-01-02T12:00:00.000Z', atsScore: { overall: 65 } },
      { _id: '3', title: 'Resume 3', templateId: 'unknown', targetRole: '', updatedAt: '2023-01-03T12:00:00.000Z', atsScore: { overall: 40 } },
    ];
    resumeService.getResumes.mockResolvedValueOnce(mockResumes);

    await act(async () => {
      renderWithRouter();
    });

    expect(screen.getByText('Resume 1')).toBeInTheDocument();
    expect(screen.getByText('Dev')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();

    expect(screen.getByText('Resume 2')).toBeInTheDocument();
    expect(screen.getByText('Designer')).toBeInTheDocument();
    expect(screen.getByText('65')).toBeInTheDocument();
    
    expect(screen.getByText('Resume 3')).toBeInTheDocument();
    expect(screen.getByText('40')).toBeInTheDocument();
  });

  it('shows error toast on fetch failure', async () => {
    resumeService.getResumes.mockRejectedValueOnce(new Error('Fetch error'));

    await act(async () => {
      renderWithRouter();
    });

    expect(toast.error).toHaveBeenCalledWith('Failed to load resumes');
  });

  it('handles resume click navigation', async () => {
    const mockResumes = [
      { _id: '1', title: 'Resume 1', templateId: 'classic', updatedAt: '2023-01-01' },
    ];
    resumeService.getResumes.mockResolvedValueOnce(mockResumes);

    await act(async () => {
      renderWithRouter();
    });

    fireEvent.click(screen.getByText('Resume 1'));
    expect(mockNavigate).toHaveBeenCalledWith('/builder/1');
  });

  it('handles delete with confirmation', async () => {
    const mockResumes = [
      { _id: '1', title: 'Resume 1', templateId: 'classic', updatedAt: '2023-01-01' },
    ];
    resumeService.getResumes.mockResolvedValueOnce(mockResumes);
    resumeService.deleteResume.mockResolvedValueOnce({});
    global.confirm.mockReturnValueOnce(true);

    await act(async () => {
      renderWithRouter();
    });

    // We can find the delete button by closest parent or index. Since there's one resume, it's the only button.
    const deleteBtn = screen.getByRole('button');
    
    await act(async () => {
      fireEvent.click(deleteBtn);
    });

    expect(global.confirm).toHaveBeenCalledWith('Delete this resume? This cannot be undone.');
    expect(resumeService.deleteResume).toHaveBeenCalledWith('1');
    expect(toast.success).toHaveBeenCalledWith('Resume deleted');
    expect(screen.queryByText('Resume 1')).not.toBeInTheDocument();
  });

  it('cancels delete if not confirmed', async () => {
    const mockResumes = [
      { _id: '1', title: 'Resume 1', templateId: 'classic', updatedAt: '2023-01-01' },
    ];
    resumeService.getResumes.mockResolvedValueOnce(mockResumes);
    global.confirm.mockReturnValueOnce(false);

    await act(async () => {
      renderWithRouter();
    });

    const deleteBtn = screen.getByRole('button');
    
    await act(async () => {
      fireEvent.click(deleteBtn);
    });

    expect(global.confirm).toHaveBeenCalled();
    expect(resumeService.deleteResume).not.toHaveBeenCalled();
    expect(screen.getByText('Resume 1')).toBeInTheDocument();
  });

  it('handles delete failure', async () => {
    const mockResumes = [
      { _id: '1', title: 'Resume 1', templateId: 'classic', updatedAt: '2023-01-01' },
    ];
    resumeService.getResumes.mockResolvedValueOnce(mockResumes);
    resumeService.deleteResume.mockRejectedValueOnce(new Error('Delete error'));
    global.confirm.mockReturnValueOnce(true);

    await act(async () => {
      renderWithRouter();
    });

    const deleteBtn = screen.getByRole('button');
    
    await act(async () => {
      fireEvent.click(deleteBtn);
    });

    expect(toast.error).toHaveBeenCalledWith('Failed to delete');
    expect(screen.getByText('Resume 1')).toBeInTheDocument();
  });
});
