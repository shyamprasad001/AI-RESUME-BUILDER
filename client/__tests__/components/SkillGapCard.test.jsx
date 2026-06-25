import { render, screen } from '@testing-library/react';
import SkillGapCard from '../../src/components/SkillGapCard/index.jsx';

describe('SkillGapCard', () => {
  it('returns null if empty', () => {
    const { container } = render(<SkillGapCard missingSkills={[]} recommendations={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders missing skills array of strings', () => {
    render(<SkillGapCard missingSkills={['React']} recommendations={[]} />);
    
    expect(screen.getByText('Skill Gaps')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('renders missing skills array of objects', () => {
    render(<SkillGapCard missingSkills={[{ name: 'Docker', priority: 'high', suggestion: 'Learn Docker' }]} recommendations={[]} />);
    
    expect(screen.getByText('Skill Gaps')).toBeInTheDocument();
    expect(screen.getByText('Docker')).toBeInTheDocument();
    expect(screen.getByText('Docker')).toHaveClass('badge-danger');
    expect(screen.getByText('Learn Docker')).toBeInTheDocument();
  });

  it('renders priorities correctly', () => {
    const missing = [
      { name: 'HighP', priority: 'high' },
      { name: 'MedP', priority: 'medium' },
      { name: 'LowP', priority: 'low' },
      { name: 'NoneP', priority: 'none' },
    ];
    render(<SkillGapCard missingSkills={missing} recommendations={[]} />);
    
    expect(screen.getByText('HighP')).toHaveClass('badge-danger');
    expect(screen.getByText('MedP')).toHaveClass('badge-warning');
    expect(screen.getByText('LowP')).toHaveClass('badge-purple');
    expect(screen.getByText('NoneP')).toHaveClass('badge');
  });

  it('renders recommendations array of strings', () => {
    render(<SkillGapCard missingSkills={[]} recommendations={['Do this']} />);
    
    expect(screen.getByText('Recommendations')).toBeInTheDocument();
    expect(screen.getByText('Do this')).toBeInTheDocument();
  });

  it('renders recommendations array of objects', () => {
    render(<SkillGapCard missingSkills={[]} recommendations={[{ text: 'Rec 1' }, { description: 'Rec 2' }]} />);
    
    expect(screen.getByText('Recommendations')).toBeInTheDocument();
    expect(screen.getByText('Rec 1')).toBeInTheDocument();
    expect(screen.getByText('Rec 2')).toBeInTheDocument();
  });
});
