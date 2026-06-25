import { render, screen, fireEvent } from '@testing-library/react';
import AtsChecklistItem from '../../src/components/AtsChecklistItem/index.jsx';

describe('AtsChecklistItem', () => {
  it('renders label, score, and weight', () => {
    render(<AtsChecklistItem label="Formatting" score={85} weight="20%" />);
    expect(screen.getByText('Formatting')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('20%')).toBeInTheDocument();
  });

  it('renders correctly without fix', () => {
    const { container } = render(<AtsChecklistItem label="Formatting" score={85} weight="20%" />);
    // No chevron should be rendered
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });

  it('expands fix on click', () => {
    render(<AtsChecklistItem label="Formatting" score={85} weight="20%" fix="Add more spacing" />);
    
    expect(screen.queryByText('Add more spacing')).not.toBeInTheDocument();
    
    // Click the row to expand
    fireEvent.click(screen.getByText('Formatting'));
    
    expect(screen.getByText('Add more spacing')).toBeInTheDocument();
    
    // Click again to collapse
    fireEvent.click(screen.getByText('Formatting'));
    
    expect(screen.queryByText('Add more spacing')).not.toBeInTheDocument();
  });

  it('uses default score 0 if score is not a number', () => {
    render(<AtsChecklistItem label="Formatting" score="high" weight="20%" />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('applies correct colors based on score thresholds', () => {
    const { rerender, container } = render(<AtsChecklistItem label="High" score={80} weight="20%" />);
    expect(screen.getByText('80')).toHaveStyle({ color: 'var(--brand-active)' });
    
    rerender(<AtsChecklistItem label="Medium" score={60} weight="20%" />);
    expect(screen.getByText('60')).toHaveStyle({ color: 'var(--brand)' });
    
    rerender(<AtsChecklistItem label="Low" score={59} weight="20%" />);
    expect(screen.getByText('59')).toHaveStyle({ color: 'var(--error)' });
  });
});
