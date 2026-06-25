import { render, screen, fireEvent } from '@testing-library/react';
import { jest } from '@jest/globals';
import TemplateSelector from '../../src/components/TemplateSelector/index.jsx';
import { ResumeContext } from '../../src/context/ResumeContext.jsx';
import TEMPLATES from '../../src/constants/templates.js';

describe('TemplateSelector', () => {
  const mockUpdateTemplate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithContext = (templateId = 'classic') => {
    return render(
      <ResumeContext.Provider value={{ resume: { templateId }, updateTemplate: mockUpdateTemplate }}>
        <TemplateSelector />
      </ResumeContext.Provider>
    );
  };

  it('renders title and description', () => {
    renderWithContext();
    expect(screen.getByText('Choose a Template')).toBeInTheDocument();
    expect(screen.getByText(/Select a design that fits your target industry/)).toBeInTheDocument();
  });

  it('renders all templates from TEMPLATES constant', () => {
    renderWithContext();
    TEMPLATES.forEach(template => {
      expect(screen.getByText(template.name)).toBeInTheDocument();
    });
  });

  it('passes isActive=true to the currently selected template', () => {
    const { container } = renderWithContext('modern');
    // modern should have template-page-selected class
    // We can find all buttons and check which one contains modern's name and has the class
    const modernButton = screen.getByText('Modern Tech').closest('button');
    expect(modernButton.querySelector('.template-page-selected')).toBeInTheDocument();
    
    const classicButton = screen.getByText('Classic Professional').closest('button');
    expect(classicButton.querySelector('.template-page-selected')).not.toBeInTheDocument();
  });

  it('calls updateTemplate when a template is clicked', () => {
    renderWithContext();
    const creativeButton = screen.getByText('Creative Bold').closest('button');
    fireEvent.click(creativeButton);
    expect(mockUpdateTemplate).toHaveBeenCalledWith('creative');
  });
});
