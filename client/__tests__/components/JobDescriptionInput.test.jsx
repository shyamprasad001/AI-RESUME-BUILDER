import { render, screen, fireEvent } from '@testing-library/react';
import { jest } from '@jest/globals';
import JobDescriptionInput from '../../src/components/JobDescriptionInput/index.jsx';

describe('JobDescriptionInput', () => {
  it('renders correctly', () => {
    render(<JobDescriptionInput value="" onChange={jest.fn()} onAnalyze={jest.fn()} isLoading={false} />);
    expect(screen.getByPlaceholderText(/Paste the full job description/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Analyze Match/i })).toBeInTheDocument();
  });

  it('calls onChange when typing', () => {
    const mockOnChange = jest.fn();
    render(<JobDescriptionInput value="" onChange={mockOnChange} onAnalyze={jest.fn()} isLoading={false} />);
    
    const textarea = screen.getByPlaceholderText(/Paste the full job description/i);
    fireEvent.change(textarea, { target: { value: 'New JD' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('New JD');
  });

  it('disables button when value is empty', () => {
    render(<JobDescriptionInput value="   " onChange={jest.fn()} onAnalyze={jest.fn()} isLoading={false} />);
    
    const button = screen.getByRole('button', { name: /Analyze Match/i });
    expect(button).toBeDisabled();
  });

  it('disables button and shows loading state when isLoading is true', () => {
    render(<JobDescriptionInput value="Valid JD" onChange={jest.fn()} onAnalyze={jest.fn()} isLoading={true} />);
    
    const button = screen.getByRole('button', { name: /Analyzing.../i });
    expect(button).toBeDisabled();
  });

  it('calls onAnalyze when button is clicked', () => {
    const mockOnAnalyze = jest.fn();
    render(<JobDescriptionInput value="Valid JD" onChange={jest.fn()} onAnalyze={mockOnAnalyze} isLoading={false} />);
    
    const button = screen.getByRole('button', { name: /Analyze Match/i });
    expect(button).not.toBeDisabled();
    
    fireEvent.click(button);
    expect(mockOnAnalyze).toHaveBeenCalledTimes(1);
  });
});
