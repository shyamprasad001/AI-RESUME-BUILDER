import { render, screen, fireEvent } from '@testing-library/react';
import { jest } from '@jest/globals';
import BulletDiffView from '../../src/components/BulletDiffView/index.jsx';

describe('BulletDiffView', () => {
  it('renders original and improved text', () => {
    render(
      <BulletDiffView 
        original="Did stuff" 
        improved="Successfully managed multiple deliverables." 
        onAccept={jest.fn()} 
        onReject={jest.fn()} 
      />
    );
    
    expect(screen.getByText('Original')).toBeInTheDocument();
    expect(screen.getByText('Did stuff')).toBeInTheDocument();
    expect(screen.getByText('Improved')).toBeInTheDocument();
    expect(screen.getByText('Successfully managed multiple deliverables.')).toBeInTheDocument();
  });

  it('calls onAccept when accept button is clicked', () => {
    const mockAccept = jest.fn();
    render(
      <BulletDiffView 
        original="A" 
        improved="B" 
        onAccept={mockAccept} 
        onReject={jest.fn()} 
      />
    );
    
    fireEvent.click(screen.getByRole('button', { name: /Accept/i }));
    expect(mockAccept).toHaveBeenCalledTimes(1);
  });

  it('calls onReject when reject button is clicked', () => {
    const mockReject = jest.fn();
    render(
      <BulletDiffView 
        original="A" 
        improved="B" 
        onAccept={jest.fn()} 
        onReject={mockReject} 
      />
    );
    
    fireEvent.click(screen.getByRole('button', { name: /Reject/i }));
    expect(mockReject).toHaveBeenCalledTimes(1);
  });
});
