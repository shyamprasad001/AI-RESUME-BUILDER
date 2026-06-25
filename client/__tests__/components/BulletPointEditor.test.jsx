import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import BulletPointEditor from '../../src/components/BulletPointEditor/index.jsx';
import toast from 'react-hot-toast';

describe('BulletPointEditor', () => {
  const mockOnChange = jest.fn();
  
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

  it('renders bullets', () => {
    const bullets = ['First bullet', 'Second bullet'];
    render(<BulletPointEditor bullets={bullets} onChange={mockOnChange} resumeId="123" />);
    
    const inputs = screen.getAllByPlaceholderText(/Describe an achievement/i);
    expect(inputs).toHaveLength(2);
    expect(inputs[0]).toHaveValue('First bullet');
    expect(inputs[1]).toHaveValue('Second bullet');
  });

  it('adds a bullet', () => {
    render(<BulletPointEditor bullets={['First bullet']} onChange={mockOnChange} resumeId="123" />);
    
    fireEvent.click(screen.getByRole('button', { name: /Add Bullet/i }));
    
    expect(mockOnChange).toHaveBeenCalledWith(['First bullet', '']);
  });

  it('updates a bullet', () => {
    render(<BulletPointEditor bullets={['First bullet']} onChange={mockOnChange} resumeId="123" />);
    
    const input = screen.getByPlaceholderText(/Describe an achievement/i);
    fireEvent.change(input, { target: { value: 'Updated bullet' } });
    
    expect(mockOnChange).toHaveBeenCalledWith(['Updated bullet']);
  });

  it('deletes a bullet', () => {
    render(<BulletPointEditor bullets={['First bullet', 'Second bullet']} onChange={mockOnChange} resumeId="123" />);
    
    // There are 2 improve and 2 delete buttons. Delete buttons are the second of each pair.
    // Or we can just grab all buttons and click the one corresponding to delete.
    const allButtons = screen.getAllByRole('button');
    // Index 0: Improve 1, 1: Delete 1, 2: Improve 2, 3: Delete 2, 4: Add
    fireEvent.click(allButtons[1]);
    
    expect(mockOnChange).toHaveBeenCalledWith(['Second bullet']);
  });

  it('shows error if improving empty bullet', async () => {
    render(<BulletPointEditor bullets={[' ']} onChange={mockOnChange} resumeId="123" />);
    
    const allButtons = screen.getAllByRole('button');
    fireEvent.click(allButtons[0]); // Improve first
    
    expect(toast.error).toHaveBeenCalledWith('Write a bullet point first');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('improves bullet and calls onChange', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { bullets: ['Improved bullet'] } })
    });
    
    render(<BulletPointEditor bullets={['Good bullet']} onChange={mockOnChange} resumeId="123" />);
    
    const allButtons = screen.getAllByRole('button');
    fireEvent.click(allButtons[0]); // Improve first
    
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/ai/generate-bullets',
      expect.objectContaining({ method: 'POST' })
    );
    
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(['Improved bullet']);
      expect(toast.success).toHaveBeenCalledWith('Bullet improved!');
    });
  });

  it('shows error on improve failure', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 500 });
    
    render(<BulletPointEditor bullets={['Good bullet']} onChange={mockOnChange} resumeId="123" />);
    
    const allButtons = screen.getAllByRole('button');
    fireEvent.click(allButtons[0]);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to improve bullet');
    });
  });
});
