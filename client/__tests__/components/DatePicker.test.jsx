import { render, screen, fireEvent } from '@testing-library/react';
import { jest } from '@jest/globals';
import DatePicker from '../../src/components/DatePicker/index.jsx';

describe('DatePicker', () => {
  it('renders with initial value', () => {
    const mockOnChange = jest.fn();
    render(<DatePicker value="2023-05" onChange={mockOnChange} />);
    
    // There are multiple select fields, one for month, one for year.
    // Using getAllByRole to get selects.
    const selects = screen.getAllByRole('combobox');
    expect(selects[0]).toHaveValue('05'); // month
    expect(selects[1]).toHaveValue('2023'); // year
  });

  it('renders disabled state', () => {
    render(<DatePicker value="2023-05" onChange={jest.fn()} disabled={true} />);
    const selects = screen.getAllByRole('combobox');
    expect(selects[0]).toBeDisabled();
    expect(selects[1]).toBeDisabled();
  });

  it('calls onChange when month changes', () => {
    const mockOnChange = jest.fn();
    render(<DatePicker value="2023-05" onChange={mockOnChange} />);
    
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: '08' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('2023-08');
  });

  it('calls onChange when year changes', () => {
    const mockOnChange = jest.fn();
    render(<DatePicker value="2023-05" onChange={mockOnChange} />);
    
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[1], { target: { value: '2020' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('2020-05');
  });
});
