import { render, screen, fireEvent } from '@testing-library/react';
import { jest } from '@jest/globals';
import ChatInput from '../../src/components/ChatInput/index.jsx';

describe('ChatInput', () => {
  it('renders correctly', () => {
    render(<ChatInput onSend={jest.fn()} isLoading={false} />);
    expect(screen.getByPlaceholderText(/Ask the AI assistant/i)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('calls onSend when button is clicked', () => {
    const mockOnSend = jest.fn();
    render(<ChatInput onSend={mockOnSend} isLoading={false} />);
    
    const input = screen.getByPlaceholderText(/Ask the AI assistant/i);
    fireEvent.change(input, { target: { value: 'Hello' } });
    
    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();
    
    fireEvent.click(button);
    expect(mockOnSend).toHaveBeenCalledWith('Hello');
  });

  it('calls onSend on Enter key', () => {
    const mockOnSend = jest.fn();
    render(<ChatInput onSend={mockOnSend} isLoading={false} />);
    
    const input = screen.getByPlaceholderText(/Ask the AI assistant/i);
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false });
    
    expect(mockOnSend).toHaveBeenCalledWith('Hello');
  });

  it('does not call onSend on Shift+Enter', () => {
    const mockOnSend = jest.fn();
    render(<ChatInput onSend={mockOnSend} isLoading={false} />);
    
    const input = screen.getByPlaceholderText(/Ask the AI assistant/i);
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });
    
    expect(mockOnSend).not.toHaveBeenCalled();
  });

  it('is disabled while loading', () => {
    render(<ChatInput onSend={jest.fn()} isLoading={true} />);
    
    const input = screen.getByPlaceholderText(/Ask the AI assistant/i);
    expect(input).toBeDisabled();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('does not send empty text', () => {
    const mockOnSend = jest.fn();
    render(<ChatInput onSend={mockOnSend} isLoading={false} />);
    
    const input = screen.getByPlaceholderText(/Ask the AI assistant/i);
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(screen.getByRole('button'));
    
    expect(mockOnSend).not.toHaveBeenCalled();
  });
});
