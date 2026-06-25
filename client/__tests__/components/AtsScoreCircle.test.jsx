import { render, screen, act } from '@testing-library/react';
import { jest } from '@jest/globals';
import AtsScoreCircle from '../../src/components/AtsScoreCircle/index.jsx';

describe('AtsScoreCircle', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders and animates to score', () => {
    render(<AtsScoreCircle score={85} />);
    
    // Initially might be 0
    expect(screen.getByText('0')).toBeInTheDocument();
    
    // Fast-forward animation
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // Should be at 85
    expect(screen.getByText('85')).toBeInTheDocument();
  });

  it('shows Excellent label for score >= 80', () => {
    render(<AtsScoreCircle score={85} />);
    expect(screen.getByText('Excellent')).toBeInTheDocument();
  });

  it('shows Good label for score >= 60', () => {
    render(<AtsScoreCircle score={70} />);
    expect(screen.getByText('Good')).toBeInTheDocument();
  });

  it('shows Fair label for score >= 40', () => {
    render(<AtsScoreCircle score={50} />);
    expect(screen.getByText('Fair')).toBeInTheDocument();
  });

  it('shows Needs Work label for score < 40', () => {
    render(<AtsScoreCircle score={30} />);
    expect(screen.getByText('Needs Work')).toBeInTheDocument();
  });
});
