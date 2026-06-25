import { render, screen, fireEvent } from '@testing-library/react';
import { jest } from '@jest/globals';
import VersionCard from '../../src/components/VersionCard/index.jsx';

describe('VersionCard', () => {
  const mockRestore = jest.fn();
  const mockDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders version with label', () => {
    const version = { _id: 'v1', label: 'My Best Version', versionNumber: 2, atsScore: 85, createdAt: '2023-10-01T12:00:00Z', templateId: 'modern' };
    render(<VersionCard version={version} onRestore={mockRestore} onDelete={mockDelete} />);
    
    expect(screen.getByText('My Best Version')).toBeInTheDocument();
    expect(screen.getByText('v2')).toBeInTheDocument();
    expect(screen.getByText('ATS: 85')).toBeInTheDocument();
    expect(screen.getByText('modern')).toBeInTheDocument();
  });

  it('renders version without label (fallback to version number)', () => {
    const version = { _id: 'v1', versionNumber: 1, createdAt: '2023-10-01T12:00:00Z' };
    render(<VersionCard version={version} onRestore={mockRestore} onDelete={mockDelete} />);
    
    expect(screen.getByText('Version 1')).toBeInTheDocument();
    expect(screen.getByText('v1')).toBeInTheDocument();
  });

  it('applies correct score badges', () => {
    const { rerender } = render(<VersionCard version={{ _id: 'v1', versionNumber: 1, atsScore: 85 }} onRestore={mockRestore} onDelete={mockDelete} />);
    expect(screen.getByText('ATS: 85')).toHaveClass('badge-success');

    rerender(<VersionCard version={{ _id: 'v1', versionNumber: 1, atsScore: 65 }} onRestore={mockRestore} onDelete={mockDelete} />);
    expect(screen.getByText('ATS: 65')).toHaveClass('badge-warning');

    rerender(<VersionCard version={{ _id: 'v1', versionNumber: 1, atsScore: 40 }} onRestore={mockRestore} onDelete={mockDelete} />);
    expect(screen.getByText('ATS: 40')).toHaveClass('badge-danger');
  });

  it('calls onRestore and onDelete', () => {
    const version = { _id: 'v1', versionNumber: 1 };
    render(<VersionCard version={version} onRestore={mockRestore} onDelete={mockDelete} />);
    
    fireEvent.click(screen.getByText('Restore'));
    expect(mockRestore).toHaveBeenCalledWith('v1');

    // Assume delete is the second button
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]);
    expect(mockDelete).toHaveBeenCalledWith('v1');
  });
});
