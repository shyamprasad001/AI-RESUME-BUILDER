import { render, screen, fireEvent } from '@testing-library/react';
import { jest } from '@jest/globals';
import ProjectsForm from '../../src/components/ProjectsForm/index.jsx';
import { ResumeContext } from '../../src/context/ResumeContext.jsx';

describe('ProjectsForm', () => {
  const mockUpdateSection = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithContext = (projects = []) => {
    return render(
      <ResumeContext.Provider value={{
        resume: { _id: '123', sections: { projects } },
        updateSection: mockUpdateSection
      }}>
        <ProjectsForm />
      </ResumeContext.Provider>
    );
  };

  it('renders empty state initially', () => {
    renderWithContext([]);
    expect(screen.getByText(/No projects yet/i)).toBeInTheDocument();
  });

  it('renders existing entries', () => {
    const projects = [
      { _id: '1', name: 'ResumeAI', description: 'Builder', technologies: ['React', 'Node'], link: 'link.com', bullets: ['Did it'] }
    ];
    renderWithContext(projects);
    
    expect(screen.getByPlaceholderText('Project name')).toHaveValue('ResumeAI');
    expect(screen.getByPlaceholderText('https://...')).toHaveValue('link.com');
    expect(screen.getByPlaceholderText('Brief project description')).toHaveValue('Builder');
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Node')).toBeInTheDocument();
  });

  it('adds a new entry', () => {
    renderWithContext([]);
    
    const addButton = screen.getByRole('button', { name: /Add Project/i });
    fireEvent.click(addButton);
    
    expect(mockUpdateSection).toHaveBeenCalledWith('projects', expect.arrayContaining([
      expect.objectContaining({ name: '', description: '', technologies: [] })
    ]));
  });

  it('updates an entry', () => {
    const projects = [{ _id: '1', name: 'App' }];
    renderWithContext(projects);
    
    const input = screen.getByPlaceholderText('Project name');
    fireEvent.change(input, { target: { value: 'New App' } });
    
    expect(mockUpdateSection).toHaveBeenCalledWith('projects', [
      { _id: '1', name: 'New App' }
    ]);
  });

  it('deletes an entry', () => {
    const projects = [{ _id: '1', name: 'App' }];
    renderWithContext(projects);
    
    // Index 1 is the delete button for the entry
    const allButtons = screen.getAllByRole('button');
    fireEvent.click(allButtons[1]);
    
    expect(mockUpdateSection).toHaveBeenCalledWith('projects', []);
  });

  it('adds a technology on Enter', () => {
    const projects = [{ _id: '1', name: 'App', technologies: ['React'] }];
    renderWithContext(projects);
    
    const techInput = screen.getByPlaceholderText('Add technology (press Enter)');
    fireEvent.change(techInput, { target: { value: 'Node' } });
    fireEvent.keyDown(techInput, { key: 'Enter', code: 'Enter' });
    
    expect(mockUpdateSection).toHaveBeenCalledWith('projects', [
      { _id: '1', name: 'App', technologies: ['React', 'Node'] }
    ]);
  });

  it('does not add empty or duplicate technology on Enter', () => {
    const projects = [{ _id: '1', name: 'App', technologies: ['React'] }];
    renderWithContext(projects);
    
    const techInput = screen.getByPlaceholderText('Add technology (press Enter)');
    
    // Empty
    fireEvent.change(techInput, { target: { value: '   ' } });
    fireEvent.keyDown(techInput, { key: 'Enter', code: 'Enter' });
    expect(mockUpdateSection).not.toHaveBeenCalled();
    
    // Duplicate
    fireEvent.change(techInput, { target: { value: 'React' } });
    fireEvent.keyDown(techInput, { key: 'Enter', code: 'Enter' });
    expect(mockUpdateSection).not.toHaveBeenCalled();
  });

  it('removes a technology', () => {
    const projects = [{ _id: '1', name: 'App', technologies: ['React', 'Node'] }];
    renderWithContext(projects);
    
    // The tag remove buttons are rendered inside the tags. They will have a HiXMark.
    // They are buttons. Let's find by class or query selector.
    const removeButtons = screen.getAllByRole('button').filter(b => b.classList.contains('tag-remove'));
    fireEvent.click(removeButtons[0]); // Remove React
    
    expect(mockUpdateSection).toHaveBeenCalledWith('projects', [
      { _id: '1', name: 'App', technologies: ['Node'] }
    ]);
  });
});
