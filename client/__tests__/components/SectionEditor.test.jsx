import { render, screen, fireEvent } from '@testing-library/react';
import { jest } from '@jest/globals';
import SECTION_TYPES from '../../src/constants/sectionTypes.js';

// Mock forms
jest.unstable_mockModule('../../src/components/PersonalInfoForm/index.jsx', () => ({ default: () => <div data-testid="mock-form-personalInfo" /> }));
jest.unstable_mockModule('../../src/components/SummaryForm/index.jsx', () => ({ default: () => <div data-testid="mock-form-summary" /> }));
jest.unstable_mockModule('../../src/components/ExperienceForm/index.jsx', () => ({ default: () => <div data-testid="mock-form-experience" /> }));
jest.unstable_mockModule('../../src/components/EducationForm/index.jsx', () => ({ default: () => <div data-testid="mock-form-education" /> }));
jest.unstable_mockModule('../../src/components/SkillsForm/index.jsx', () => ({ default: () => <div data-testid="mock-form-skills" /> }));
jest.unstable_mockModule('../../src/components/ProjectsForm/index.jsx', () => ({ default: () => <div data-testid="mock-form-projects" /> }));
jest.unstable_mockModule('../../src/components/CertificationsForm/index.jsx', () => ({ default: () => <div data-testid="mock-form-certifications" /> }));

describe('SectionEditor', () => {
  const mockSetActiveSection = jest.fn();
  let SectionEditor, ResumeContext;

  beforeAll(async () => {
    SectionEditor = (await import('../../src/components/SectionEditor/index.jsx')).default;
    ResumeContext = (await import('../../src/context/ResumeContext.jsx')).ResumeContext;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithContext = (activeSection = '') => {
    return render(
      <ResumeContext.Provider value={{ activeSection, setActiveSection: mockSetActiveSection }}>
        <SectionEditor />
      </ResumeContext.Provider>
    );
  };

  it('renders all section headers', () => {
    renderWithContext();
    SECTION_TYPES.forEach(({ label }) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('calls setActiveSection when header is clicked', () => {
    renderWithContext();
    
    // Using the label of the first section to find the button
    const firstSection = SECTION_TYPES[0];
    fireEvent.click(screen.getByText(firstSection.label));
    
    expect(mockSetActiveSection).toHaveBeenCalledWith(firstSection.id);
  });

  it('collapses section if already active', () => {
    const firstSection = SECTION_TYPES[0];
    renderWithContext(firstSection.id);
    
    fireEvent.click(screen.getByText(firstSection.label));
    
    expect(mockSetActiveSection).toHaveBeenCalledWith('');
  });

  it('renders appropriate form based on activeSection', () => {
    SECTION_TYPES.forEach(({ id }) => {
      const { unmount } = renderWithContext(id);
      expect(screen.getByTestId(`mock-form-${id}`)).toBeInTheDocument();
      unmount();
    });
  });
});
