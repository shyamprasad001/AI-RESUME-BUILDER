import { render, screen, fireEvent } from '@testing-library/react';
import { jest } from '@jest/globals';
import EducationForm from '../../src/components/EducationForm/index.jsx';
import { ResumeContext } from '../../src/context/ResumeContext.jsx';

describe('EducationForm', () => {
  const mockUpdateSection = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithContext = (education = []) => {
    return render(
      <ResumeContext.Provider value={{
        resume: { sections: { education } },
        updateSection: mockUpdateSection
      }}>
        <EducationForm />
      </ResumeContext.Provider>
    );
  };

  it('renders empty state initially', () => {
    renderWithContext([]);
    expect(screen.getByText(/No education entries yet/i)).toBeInTheDocument();
  });

  it('renders existing entries', () => {
    const education = [
      { _id: '1', institution: 'MIT', degree: 'B.S.', field: 'CS', startDate: '2020-09', endDate: '2024-05', gpa: '3.9' }
    ];
    renderWithContext(education);
    
    expect(screen.getByPlaceholderText('University name')).toHaveValue('MIT');
    expect(screen.getByPlaceholderText('B.S., M.S., etc.')).toHaveValue('B.S.');
    expect(screen.getByPlaceholderText('Computer Science')).toHaveValue('CS');
    expect(screen.getByPlaceholderText('3.8/4.0')).toHaveValue('3.9');
  });

  it('adds a new entry', () => {
    renderWithContext([]);
    
    const addButton = screen.getByRole('button', { name: /Add Education/i });
    fireEvent.click(addButton);
    
    expect(mockUpdateSection).toHaveBeenCalledWith('education', expect.arrayContaining([
      expect.objectContaining({ institution: '', degree: '', field: '' })
    ]));
  });

  it('updates an entry', () => {
    const education = [{ _id: '1', institution: 'MIT' }];
    renderWithContext(education);
    
    const input = screen.getByPlaceholderText('University name');
    fireEvent.change(input, { target: { value: 'Stanford' } });
    
    expect(mockUpdateSection).toHaveBeenCalledWith('education', [
      { _id: '1', institution: 'Stanford' }
    ]);
  });

  it('deletes an entry', () => {
    const education = [{ _id: '1', institution: 'MIT' }];
    renderWithContext(education);
    
    // The trash button is the only other button if there is 1 entry, but let's select by closest card or just the second button
    const deleteButton = screen.getAllByRole('button')[1]; 
    fireEvent.click(deleteButton);
    
    expect(mockUpdateSection).toHaveBeenCalledWith('education', []);
  });
});
