import { render, screen } from '@testing-library/react';
import ProgressBar from '../../src/components/ProgressBar/index.jsx';

describe('ProgressBar', () => {
  it('renders percentage correctly', () => {
    const { container } = render(<ProgressBar percentage={40} />);
    expect(screen.getByText('40%')).toBeInTheDocument();
    
    // Check width
    const fill = container.querySelector('.progress-fill');
    expect(fill).toHaveStyle('width: 40%');
  });

  it('applies purple class for < 50%', () => {
    const { container } = render(<ProgressBar percentage={40} />);
    const fill = container.querySelector('.progress-fill');
    expect(fill).toHaveClass('progress-fill-purple');
  });

  it('applies amber class for >= 50% and < 80%', () => {
    const { container } = render(<ProgressBar percentage={75} />);
    const fill = container.querySelector('.progress-fill');
    expect(fill).toHaveClass('progress-fill-amber');
  });

  it('applies green class for >= 80%', () => {
    const { container } = render(<ProgressBar percentage={85} />);
    const fill = container.querySelector('.progress-fill');
    expect(fill).toHaveClass('progress-fill-green');
  });
});
