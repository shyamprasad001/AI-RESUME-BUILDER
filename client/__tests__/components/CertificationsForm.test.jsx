import { render, screen, fireEvent } from '@testing-library/react';
import { jest } from '@jest/globals';
import CertificationsForm from '../../src/components/CertificationsForm/index.jsx';
import { ResumeContext } from '../../src/context/ResumeContext.jsx';

describe('CertificationsForm', () => {
  const mockUpdateSection = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithContext = (certifications = []) => {
    return render(
      <ResumeContext.Provider value={{
        resume: { _id: '123', sections: { certifications } },
        updateSection: mockUpdateSection
      }}>
        <CertificationsForm />
      </ResumeContext.Provider>
    );
  };

  it('renders empty state initially', () => {
    renderWithContext([]);
    expect(screen.getByText(/No certifications yet/i)).toBeInTheDocument();
  });

  it('renders existing entries', () => {
    const certs = [
      { _id: '1', name: 'AWS', issuer: 'Amazon', date: '2023-01', link: 'aws.com' }
    ];
    renderWithContext(certs);
    
    expect(screen.getByPlaceholderText('AWS Solutions Architect')).toHaveValue('AWS');
    expect(screen.getByPlaceholderText('Amazon Web Services')).toHaveValue('Amazon');
    expect(screen.getByPlaceholderText('https://...')).toHaveValue('aws.com');
  });

  it('adds a new entry', () => {
    renderWithContext([]);
    
    const addButton = screen.getByRole('button', { name: /Add Certification/i });
    fireEvent.click(addButton);
    
    expect(mockUpdateSection).toHaveBeenCalledWith('certifications', expect.arrayContaining([
      expect.objectContaining({ name: '', issuer: '' })
    ]));
  });

  it('updates an entry', () => {
    const certs = [{ _id: '1', name: 'AWS' }];
    renderWithContext(certs);
    
    const input = screen.getByPlaceholderText('AWS Solutions Architect');
    fireEvent.change(input, { target: { value: 'GCP' } });
    
    expect(mockUpdateSection).toHaveBeenCalledWith('certifications', [
      { _id: '1', name: 'GCP' }
    ]);
  });

  it('deletes an entry', () => {
    const certs = [{ _id: '1', name: 'AWS' }];
    renderWithContext(certs);
    
    const allButtons = screen.getAllByRole('button');
    // 0: Add, 1: Delete
    fireEvent.click(allButtons[1]);
    
    expect(mockUpdateSection).toHaveBeenCalledWith('certifications', []);
  });
});
