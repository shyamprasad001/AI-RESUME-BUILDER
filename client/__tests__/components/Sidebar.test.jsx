import { render, screen, fireEvent } from '@testing-library/react';
import { jest } from '@jest/globals';

// Mock the child components to avoid rendering their heavy logic
jest.unstable_mockModule('../../src/components/SectionEditor/index.jsx', () => ({ default: () => <div data-testid="mock-section-editor" /> }));
jest.unstable_mockModule('../../src/components/ChatPanel/index.jsx', () => ({ default: () => <div data-testid="mock-chat-panel" /> }));
jest.unstable_mockModule('../../src/components/AtsScorePanel/index.jsx', () => ({ default: () => <div data-testid="mock-ats-panel" /> }));
jest.unstable_mockModule('../../src/components/TemplateSelector/index.jsx', () => ({ default: () => <div data-testid="mock-template-selector" /> }));

describe('Sidebar', () => {
  const mockSetActiveTab = jest.fn();
  let Sidebar, ResumeContext;

  beforeAll(async () => {
    Sidebar = (await import('../../src/components/Sidebar/index.jsx')).default;
    ResumeContext = (await import('../../src/context/ResumeContext.jsx')).ResumeContext;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithContext = (activeTab = 'sections') => {
    return render(
      <ResumeContext.Provider value={{ activeTab, setActiveTab: mockSetActiveTab }}>
        <Sidebar />
      </ResumeContext.Provider>
    );
  };

  it('renders all tab buttons', () => {
    renderWithContext();
    
    expect(screen.getByRole('button', { name: /Sections/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /AI Chat/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ATS/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Templates/i })).toBeInTheDocument();
  });

  it('calls setActiveTab when a tab is clicked', () => {
    renderWithContext();
    
    fireEvent.click(screen.getByRole('button', { name: /AI Chat/i }));
    
    expect(mockSetActiveTab).toHaveBeenCalledWith('ai');
  });

  it('renders SectionEditor for sections tab', () => {
    renderWithContext('sections');
    expect(screen.getByTestId('mock-section-editor')).toBeInTheDocument();
  });

  it('renders ChatPanel for ai tab', () => {
    renderWithContext('ai');
    expect(screen.getByTestId('mock-chat-panel')).toBeInTheDocument();
  });

  it('renders AtsScorePanel for ats tab', () => {
    renderWithContext('ats');
    expect(screen.getByTestId('mock-ats-panel')).toBeInTheDocument();
  });

  it('renders TemplateSelector for templates tab', () => {
    renderWithContext('templates');
    expect(screen.getByTestId('mock-template-selector')).toBeInTheDocument();
  });

  it('renders SectionEditor as default for unknown tab', () => {
    renderWithContext('unknown');
    expect(screen.getByTestId('mock-section-editor')).toBeInTheDocument();
  });
});
