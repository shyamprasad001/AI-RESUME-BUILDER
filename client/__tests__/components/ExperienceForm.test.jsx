import { render, screen, fireEvent } from '@testing-library/react';
import { jest } from '@jest/globals';
import ExperienceForm from '../../src/components/ExperienceForm/index.jsx';
import { ResumeContext } from '../../src/context/ResumeContext.jsx';

describe('ExperienceForm', () => {
  const mockUpdateSection = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithContext = (experience = []) => {
    return render(
      <ResumeContext.Provider value={{
        resume: { _id: '123', sections: { experience } },
        updateSection: mockUpdateSection
      }}>
        <ExperienceForm />
      </ResumeContext.Provider>
    );
  };

  it('renders empty state initially', () => {
    renderWithContext([]);
    expect(screen.getByText(/No experience entries yet/i)).toBeInTheDocument();
  });

  it('renders existing entries', () => {
    const experience = [
      { _id: '1', company: 'Google', role: 'SWE', startDate: '2020-09', endDate: '2024-05', current: false, bullets: ['Did things'] }
    ];
    renderWithContext(experience);
    
    expect(screen.getByPlaceholderText('Company name')).toHaveValue('Google');
    expect(screen.getByPlaceholderText('Job title')).toHaveValue('SWE');
    expect(screen.getByRole('checkbox', { name: /Currently working here/i })).not.toBeChecked();
    // BulletPointEditor will render the bullets
    expect(screen.getByPlaceholderText(/Describe an achievement/i)).toHaveValue('Did things');
  });

  it('adds a new entry', () => {
    renderWithContext([]);
    
    const addButton = screen.getByRole('button', { name: /Add Experience/i });
    fireEvent.click(addButton);
    
    expect(mockUpdateSection).toHaveBeenCalledWith('experience', expect.arrayContaining([
      expect.objectContaining({ company: '', role: '', bullets: [] })
    ]));
  });

  it('updates an entry', () => {
    const experience = [{ _id: '1', company: 'Google' }];
    renderWithContext(experience);
    
    const input = screen.getByPlaceholderText('Company name');
    fireEvent.change(input, { target: { value: 'Meta' } });
    
    expect(mockUpdateSection).toHaveBeenCalledWith('experience', [
      { _id: '1', company: 'Meta' }
    ]);
  });

  it('deletes an entry', () => {
    const experience = [{ _id: '1', company: 'Google' }];
    renderWithContext(experience);
    
    // Grab all buttons and find the trash one. The first button is "Add Experience".
    // The second button is the "Delete" icon for the entry.
    const allButtons = screen.getAllByRole('button');
    // Button 0: Add Experience, Button 1: Delete Entry, Button 2: Bullet Improve, Button 3: Bullet Delete, Button 4: Add Bullet
    fireEvent.click(allButtons[1]);
    
    expect(mockUpdateSection).toHaveBeenCalledWith('experience', []);
  });

  it('toggles current checkbox', () => {
    const experience = [{ _id: '1', company: 'Google', current: false }];
    renderWithContext(experience);
    
    const checkbox = screen.getByRole('checkbox', { name: /Currently working here/i });
    fireEvent.click(checkbox);
    
    expect(mockUpdateSection).toHaveBeenCalledWith('experience', [
      { _id: '1', company: 'Google', current: true }
    ]);
  });
});
