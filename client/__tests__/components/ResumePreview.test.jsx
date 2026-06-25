import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';

// Mock templates
jest.unstable_mockModule('../../src/components/templates/ClassicTemplate.jsx', () => ({ default: () => <div data-testid="mock-classic" /> }));
jest.unstable_mockModule('../../src/components/templates/ModernTemplate.jsx', () => ({ default: () => <div data-testid="mock-modern" /> }));
jest.unstable_mockModule('../../src/components/templates/CreativeTemplate.jsx', () => ({ default: () => <div data-testid="mock-creative" /> }));
jest.unstable_mockModule('../../src/components/templates/MinimalTemplate.jsx', () => ({ default: () => <div data-testid="mock-minimal" /> }));
jest.unstable_mockModule('../../src/components/templates/ExecutiveTemplate.jsx', () => ({ default: () => <div data-testid="mock-executive" /> }));

// We also need to mock @react-pdf/renderer and PdfDocument for the download test.
jest.unstable_mockModule('@react-pdf/renderer', () => ({
  pdf: jest.fn().mockReturnValue({
    toBlob: jest.fn().mockResolvedValue(new Blob(['test'], { type: 'application/pdf' }))
  })
}));
jest.unstable_mockModule('../../src/components/PdfDocument/index.jsx', () => ({
  default: () => <div />
}));

describe('ResumePreview', () => {
  let ResumePreview, ResumeContext;

  beforeAll(async () => {
    ResumePreview = (await import('../../src/components/ResumePreview/index.jsx')).default;
    ResumeContext = (await import('../../src/context/ResumeContext.jsx')).ResumeContext;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    global.URL.createObjectURL = jest.fn().mockReturnValue('blob:test');
    global.URL.revokeObjectURL = jest.fn();
    
    // Mock getBoundingClientRect / clientWidth
    Object.defineProperty(window.HTMLElement.prototype, 'clientWidth', {
      value: 1000,
      configurable: true
    });
  });

  const renderWithContext = (templateId = 'classic') => {
    return render(
      <ResumeContext.Provider value={{
        resume: { _id: '123', templateId, title: 'My Resume', sections: {} }
      }}>
        <ResumePreview />
      </ResumeContext.Provider>
    );
  };

  it('renders ClassicTemplate by default', () => {
    renderWithContext('unknown');
    expect(screen.getByTestId('mock-classic')).toBeInTheDocument();
  });

  it('renders specific templates', () => {
    const { unmount } = renderWithContext('modern');
    expect(screen.getByTestId('mock-modern')).toBeInTheDocument();
    unmount();
    
    renderWithContext('creative');
    expect(screen.getByTestId('mock-creative')).toBeInTheDocument();
  });

  it('triggers PDF download', async () => {
    const clickSpy = jest.spyOn(window.HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    renderWithContext();
    
    const downloadBtn = screen.getByRole('button', { name: /Download PDF/i });
    fireEvent.click(downloadBtn);
    
    expect(screen.getByRole('button', { name: /Generating.../i })).toBeDisabled();
    
    await waitFor(() => {
      expect(clickSpy).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:test');
      expect(screen.getByRole('button', { name: /Download PDF/i })).not.toBeDisabled();
    });
    
    clickSpy.mockRestore();
  });
});
