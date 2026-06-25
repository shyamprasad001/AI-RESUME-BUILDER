import { render, screen, fireEvent } from '@testing-library/react';
import { jest } from '@jest/globals';
import SkillsForm from '../../src/components/SkillsForm/index.jsx';
import { ResumeContext } from '../../src/context/ResumeContext.jsx';

describe('SkillsForm', () => {
  const mockUpdateSection = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithContext = (skills = { technical: [], soft: [], languages: [] }) => {
    return render(
      <ResumeContext.Provider value={{
        resume: { _id: '123', sections: { skills } },
        updateSection: mockUpdateSection
      }}>
        <SkillsForm />
      </ResumeContext.Provider>
    );
  };

  it('renders all categories', () => {
    renderWithContext();
    expect(screen.getByText('Technical Skills')).toBeInTheDocument();
    expect(screen.getByText('Soft Skills')).toBeInTheDocument();
    expect(screen.getByText('Languages')).toBeInTheDocument();
  });

  it('renders existing skills', () => {
    renderWithContext({ technical: ['React'], soft: ['Leadership'], languages: ['English'] });
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Leadership')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('adds a skill on enter', () => {
    renderWithContext({ technical: ['React'], soft: [], languages: [] });
    
    // There are 3 inputs, Technical is the first one
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'Node' } });
    fireEvent.keyDown(inputs[0], { key: 'Enter', code: 'Enter' });
    
    expect(mockUpdateSection).toHaveBeenCalledWith('skills', {
      technical: ['React', 'Node'], soft: [], languages: []
    });
  });

  it('removes a skill', () => {
    renderWithContext({ technical: ['React', 'Node'], soft: [], languages: [] });
    
    const removeButtons = screen.getAllByRole('button');
    fireEvent.click(removeButtons[0]); // Remove React
    
    expect(mockUpdateSection).toHaveBeenCalledWith('skills', {
      technical: ['Node'], soft: [], languages: []
    });
  });

  it('does not add empty or duplicate skill', () => {
    renderWithContext({ technical: ['React'], soft: [], languages: [] });
    
    const inputs = screen.getAllByRole('textbox');
    
    // Empty
    fireEvent.change(inputs[0], { target: { value: '   ' } });
    fireEvent.keyDown(inputs[0], { key: 'Enter', code: 'Enter' });
    
    // Duplicate
    fireEvent.change(inputs[0], { target: { value: 'React' } });
    fireEvent.keyDown(inputs[0], { key: 'Enter', code: 'Enter' });
    
    expect(mockUpdateSection).not.toHaveBeenCalled();
  });
});
