import { render, screen } from '@testing-library/react';
import { jest } from '@jest/globals';
import { MemoryRouter } from 'react-router-dom';

jest.unstable_mockModule('../../src/components/TemplateCard', () => ({ default: () => <div>TemplateCard</div> }));

describe('LandingPage', () => {
  let LandingPageComp;

  beforeAll(async () => {
    LandingPageComp = (await import('../../src/pages/LandingPage/index.jsx')).default;
  });

  const renderWithRouter = (ui) => {
    return render(<MemoryRouter>{ui}</MemoryRouter>);
  };

  it('renders navigation bar with logo and links', () => {
    renderWithRouter(<LandingPageComp />);
    expect(screen.getAllByText('AI Resume Builder')).toHaveLength(2); // Nav and footer
    expect(screen.getAllByText('Features')).toHaveLength(2);
    expect(screen.getAllByText('How It Works').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('Templates')).toHaveLength(2);
  });

  it('renders hero section correctly', () => {
    renderWithRouter(<LandingPageComp />);
    expect(screen.getByText(/Build resumes that/i)).toBeInTheDocument();
    expect(screen.getByText('AI Agents')).toBeInTheDocument();
    expect(screen.getByText('ATS Metrics')).toBeInTheDocument();
  });

  it('renders features section', () => {
    renderWithRouter(<LandingPageComp />);
    expect(screen.getByText('AI-Powered Resume Intelligence')).toBeInTheDocument();
    expect(screen.getByText('AI Writing Agent')).toBeInTheDocument();
    expect(screen.getByText('Chat Assistant')).toBeInTheDocument();
  });

  it('renders steps in how it works section', () => {
    renderWithRouter(<LandingPageComp />);
    expect(screen.getByText('Choose a Template')).toBeInTheDocument();
    expect(screen.getByText('Add Your Details')).toBeInTheDocument();
    expect(screen.getByText('Download & Apply')).toBeInTheDocument();
  });

  it('renders template showcase', () => {
    renderWithRouter(<LandingPageComp />);
    expect(screen.getByText('Professional Templates')).toBeInTheDocument();
    expect(screen.getByText('Browse All Templates →')).toBeInTheDocument();
  });

  it('renders CTA section', () => {
    renderWithRouter(<LandingPageComp />);
    expect(screen.getByText('Ready to build your perfect resume?')).toBeInTheDocument();
    expect(screen.getByText('No credit card required')).toBeInTheDocument();
  });
});
