import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import AtsScorePanel from '../../src/components/AtsScorePanel/index.jsx';
import { ResumeContext } from '../../src/context/ResumeContext.jsx';
import toast from 'react-hot-toast';

describe('AtsScorePanel', () => {
  const mockUpdateAtsScore = jest.fn();
  const mockUpdateField = jest.fn();

  const renderWithContext = (resumeContextValue) => {
    return render(
      <ResumeContext.Provider value={{
        resume: { _id: '1', jobDescription: '', ...resumeContextValue.resume },
        updateAtsScore: mockUpdateAtsScore,
        updateField: mockUpdateField
      }}>
        <AtsScorePanel />
      </ResumeContext.Provider>
    );
  };

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

  it('renders initial state with empty job description', () => {
    renderWithContext({ resume: {} });
    expect(screen.getByText(/Paste a job description above/)).toBeInTheDocument();
  });

  it('analyze button is disabled if JD is empty', () => {
    renderWithContext({ resume: {} });
    const button = screen.getByRole('button', { name: /analyze/i });
    expect(button).toBeDisabled();
  });

  it('calls API and updates score on valid analyze', async () => {
    global.fetch.mockResolvedValueOnce({ 
      ok: true, 
      json: async () => ({ data: { overall: 85, breakdown: { formatting: { score: 90 } } } }) 
    });
    
    renderWithContext({ resume: {} });
    
    const textarea = screen.getByPlaceholderText(/Paste the full job description/i);
    fireEvent.change(textarea, { target: { value: 'software engineer job' } });
    
    // Now button should be enabled
    const button = screen.getByRole('button', { name: /analyze/i });
    expect(button).not.toBeDisabled();
    fireEvent.click(button);
    
    expect(mockUpdateField).toHaveBeenCalledWith('jobDescription', 'software engineer job');
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/ai/ats-score', expect.objectContaining({ method: 'POST' }));
    
    await waitFor(() => {
      expect(mockUpdateAtsScore).toHaveBeenCalledWith({ overall: 85, breakdown: { formatting: { score: 90 } } });
      expect(toast.success).toHaveBeenCalledWith('ATS analysis complete!');
    });
  });

  it('shows error toast on API failure', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) });
    
    renderWithContext({ resume: {} });
    fireEvent.change(screen.getByPlaceholderText(/Paste the full job description/i), { target: { value: 'job' } });
    fireEvent.click(screen.getByRole('button', { name: /analyze/i }));
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to analyze resume');
    });
  });

  it('renders score details if resume has atsScore', async () => {
    const atsScore = {
      overall: 92,
      breakdown: { formatting: { score: 90, fix: 'none' } },
      missingKeywords: ['React'],
      presentKeywords: ['Node'],
      suggestions: ['Add more skills'],
      skillGaps: { missing: ['AWS'] }
    };
    
    renderWithContext({ resume: { atsScore } });
    
    expect(await screen.findByText('92')).toBeInTheDocument(); // AtsScoreCircle renders this
    // The metric breakdown loop looks at ATS_METRICS. If formatting is one, it renders the label and score.
    // We just check if some text from the missing keywords / suggestions renders
    expect(screen.getByText('Missing Keywords')).toBeInTheDocument();
    expect(screen.getByText('React')).toHaveClass('keyword-tag');
    expect(screen.getByText('Matched Keywords')).toBeInTheDocument();
    expect(screen.getByText('Node')).toHaveClass('keyword-tag-present');
    expect(screen.getByText('Suggestions')).toBeInTheDocument();
    expect(screen.getByText('Add more skills')).toBeInTheDocument();
  });
});
