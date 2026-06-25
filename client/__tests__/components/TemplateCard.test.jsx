import { render, screen, fireEvent } from '@testing-library/react';
import { jest } from '@jest/globals';
import TemplateCard from '../../src/components/TemplateCard/index.jsx';
import TEMPLATES from '../../src/constants/templates.js';

describe('TemplateCard', () => {
  const mockSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with given template', () => {
    const template = TEMPLATES[0]; // Classic
    render(<TemplateCard template={template} isActive={false} onSelect={mockSelect} />);
    
    expect(screen.getByText(template.name)).toBeInTheDocument();
    // Real template should render sample data
    expect(screen.getByText('Alex Johnson')).toBeInTheDocument();
  });

  it('applies selected class and renders check icon when isActive is true', () => {
    const template = TEMPLATES[1]; // Modern
    const { container } = render(<TemplateCard template={template} isActive={true} onSelect={mockSelect} />);
    
    expect(container.querySelector('.template-page-selected')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    const template = TEMPLATES[2]; // Creative
    render(<TemplateCard template={template} isActive={false} onSelect={mockSelect} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(mockSelect).toHaveBeenCalledTimes(1);
  });

  it('renders ClassicTemplate if template id is unknown', () => {
    const unknownTemplate = { id: 'unknown', name: 'Unknown', colors: { text: '#000', primary: '#000' } };
    render(<TemplateCard template={unknownTemplate} isActive={false} onSelect={mockSelect} />);
    
    // Fallback is ClassicTemplate which also renders sample data
    expect(screen.getByText('Alex Johnson')).toBeInTheDocument();
  });
});
