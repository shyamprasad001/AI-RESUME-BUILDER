import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { jest } from '@jest/globals';
import { MemoryRouter } from 'react-router-dom';

jest.unstable_mockModule('../../src/components/Navbar', () => ({ default: () => <nav data-testid="navbar">Navbar</nav> }));
jest.unstable_mockModule('react-hot-toast', () => ({ default: { error: jest.fn(), success: jest.fn() } }));
jest.unstable_mockModule('../../src/services/resumeService.js', () => ({
  createResume: jest.fn(),
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

describe('TemplatesPage', () => {
  let TemplatesPageComp, MemoryRouterComp, resumeService, toast;

  beforeAll(async () => {
    TemplatesPageComp = (await import('../../src/pages/TemplatesPage/index.jsx')).default;
    MemoryRouterComp = (await import('react-router-dom')).MemoryRouter;
    resumeService = await import('../../src/services/resumeService.js');
    toast = (await import('react-hot-toast')).default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithRouter = () => {
    return render(
      <MemoryRouterComp>
        <TemplatesPageComp />
      </MemoryRouterComp>
    );
  };

  it('renders all templates and popular badges', () => {
    renderWithRouter();
    expect(screen.getByText('Template Gallery')).toBeInTheDocument();
    
    // Check if popular badges are rendered
    const popularBadges = screen.getAllByText('Popular');
    expect(popularBadges.length).toBeGreaterThan(0);
    
    // Check if templates are rendered
    expect(screen.getByText('Classic Professional')).toBeInTheDocument();
    expect(screen.getByText('Modern Minimalist')).toBeInTheDocument();
  });

  it('opens and closes preview modal', () => {
    renderWithRouter();
    
    // Open preview for Classic Professional
    fireEvent.click(screen.getByText('Classic Professional'));
    
    expect(screen.getByText('Use This Template')).toBeInTheDocument();
    
    // Close preview (using the close button which has no text, so we find it by role or we can just click the overlay)
    // The overlay is the first child of the body usually, or we can find the close button.
    const closeBtn = screen.getByRole('button', { name: '' }); 
    // Wait, let's find the overlay by clicking it
    const overlay = document.querySelector('.modal-overlay');
    fireEvent.click(overlay);

    expect(screen.queryByText('Use This Template')).not.toBeInTheDocument();
  });

  it('opens create modal from preview', () => {
    renderWithRouter();
    
    fireEvent.click(screen.getByText('Classic Professional'));
    fireEvent.click(screen.getByText('Use This Template'));
    
    expect(screen.getByText('Create Resume')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g., Software Engineer Resume')).toBeInTheDocument();
    
    // Close create modal
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Create Resume')).not.toBeInTheDocument();
  });

  it('creates a resume', async () => {
    resumeService.createResume.mockResolvedValueOnce({ _id: 'new-id' });

    renderWithRouter();
    
    fireEvent.click(screen.getByText('Classic Professional'));
    fireEvent.click(screen.getByText('Use This Template'));
    
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
    expect(mockNavigate).toHaveBeenCalledWith('/builder/new-id');
  });

  it('handles create resume failure', async () => {
    resumeService.createResume.mockRejectedValueOnce(new Error('Failed'));

    renderWithRouter();
    
    fireEvent.click(screen.getByText('Classic Professional'));
    fireEvent.click(screen.getByText('Use This Template'));
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Create Resume' }));
    });

    expect(toast.error).toHaveBeenCalledWith('Failed to create resume');
  });
});
