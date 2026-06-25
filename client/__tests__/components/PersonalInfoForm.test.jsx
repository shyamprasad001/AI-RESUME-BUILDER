import { render, screen, fireEvent } from '@testing-library/react';
import { jest } from '@jest/globals';
import PersonalInfoForm from '../../src/components/PersonalInfoForm/index.jsx';
import { ResumeContext } from '../../src/context/ResumeContext.jsx';

describe('PersonalInfoForm', () => {
  const mockUpdateSection = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithContext = (personalInfo = {}) => {
    return render(
      <ResumeContext.Provider value={{
        resume: { sections: { personalInfo } },
        updateSection: mockUpdateSection
      }}>
        <PersonalInfoForm />
      </ResumeContext.Provider>
    );
  };

  it('renders all fields with correct initial values', () => {
    renderWithContext({ fullName: 'Alice', email: 'alice@example.com' });
    
    expect(screen.getByPlaceholderText('John Doe')).toHaveValue('Alice');
    expect(screen.getByPlaceholderText('john@example.com')).toHaveValue('alice@example.com');
    expect(screen.getByPlaceholderText('+1 (555) 123-4567')).toHaveValue('');
  });

  it('calls updateSection when a field is changed', () => {
    renderWithContext({ fullName: 'Alice', email: 'alice@example.com' });
    
    const input = screen.getByPlaceholderText('John Doe');
    fireEvent.change(input, { target: { value: 'Alice Smith' } });
    
    expect(mockUpdateSection).toHaveBeenCalledWith('personalInfo', {
      fullName: 'Alice Smith',
      email: 'alice@example.com'
    });
  });
});
