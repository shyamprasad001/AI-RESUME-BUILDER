import { render, screen, fireEvent } from '@testing-library/react';
import { jest } from '@jest/globals';
import ChatMessage from '../../src/components/ChatMessage/index.jsx';

describe('ChatMessage', () => {
  it('renders user message correctly', () => {
    const ts = '2023-01-01T12:00:00Z';
    render(<ChatMessage role="user" content="Hello" timestamp={ts} onApply={jest.fn()} />);
    
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.queryByText('AI Assistant')).not.toBeInTheDocument();
  });

  it('renders assistant message correctly', () => {
    const ts = '2023-01-01T12:00:00Z';
    render(<ChatMessage role="assistant" content="Hi there" timestamp={ts} onApply={jest.fn()} />);
    
    expect(screen.getByText('Hi there')).toBeInTheDocument();
    expect(screen.getByText('AI Assistant')).toBeInTheDocument();
  });

  it('handles missing timestamp gracefully', () => {
    render(<ChatMessage role="user" content="Hello" timestamp={null} onApply={jest.fn()} />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('renders apply button if extracted data exists and is assistant', () => {
    const ts = '2023-01-01T12:00:00Z';
    const mockOnApply = jest.fn();
    render(<ChatMessage role="assistant" content="Hi" timestamp={ts} extractedData={{ summary: 'A' }} onApply={mockOnApply} />);
    
    const button = screen.getByRole('button', { name: /Apply to resume/i });
    expect(button).toBeInTheDocument();
    
    fireEvent.click(button);
    expect(mockOnApply).toHaveBeenCalledWith({ summary: 'A' });
  });

  it('does not render apply button for user even if extracted data exists', () => {
    const ts = '2023-01-01T12:00:00Z';
    render(<ChatMessage role="user" content="Hi" timestamp={ts} extractedData={{ summary: 'A' }} onApply={jest.fn()} />);
    
    expect(screen.queryByRole('button', { name: /Apply to resume/i })).not.toBeInTheDocument();
  });
});
