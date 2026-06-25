import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import SummaryForm from '../../src/components/SummaryForm/index.jsx';
import { ResumeContext } from '../../src/context/ResumeContext.jsx';
import toast from 'react-hot-toast';

describe('SummaryForm', () => {
  const mockUpdateSection = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    jest.spyOn(toast, 'success').mockImplementation(() => {});
    jest.spyOn(toast, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    delete global.fetch;
    jest.restoreAllMocks();
  });

  const renderWithContext = (summary = '', resumeId = '123') => {
    return render(
      <ResumeContext.Provider value={{
        resume: { _id: resumeId, sections: { summary } },
        updateSection: mockUpdateSection
      }}>
        <SummaryForm />
      </ResumeContext.Provider>
    );
  };

  it('renders correctly and shows word count', () => {
    renderWithContext('This is a test summary');
    
    expect(screen.getByPlaceholderText(/professional summary/i)).toHaveValue('This is a test summary');
    expect(screen.getByText('5 words')).toBeInTheDocument();
  });

  it('calls updateSection when changed', () => {
    renderWithContext('Test');
    const textarea = screen.getByPlaceholderText(/professional summary/i);
    fireEvent.change(textarea, { target: { value: 'Test summary' } });
    
    expect(mockUpdateSection).toHaveBeenCalledWith('summary', 'Test summary');
  });

  it('generates summary and updates section', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { summary: 'Generated summary from AI' } })
    });
    
    renderWithContext('');
    fireEvent.click(screen.getByRole('button', { name: /AI Generate/i }));
    
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/ai/generate-summary',
      expect.objectContaining({ method: 'POST', body: expect.stringContaining('123') })
    );
    
    await waitFor(() => {
      expect(mockUpdateSection).toHaveBeenCalledWith('summary', 'Generated summary from AI');
      expect(toast.success).toHaveBeenCalledWith('Summary generated!');
    });
  });

  it('shows error toast on generation failure', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) });
    
    renderWithContext('');
    const button = screen.getByRole('button', { name: /AI Generate/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to generate summary');
      expect(button).not.toBeDisabled();
    });
  });
});
