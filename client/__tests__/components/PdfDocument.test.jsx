import { render } from '@testing-library/react';
import { jest } from '@jest/globals';

// Mock @react-pdf/renderer
jest.unstable_mockModule('@react-pdf/renderer', () => ({
  Document: ({ children }) => <div data-testid="pdf-document">{children}</div>,
  Page: ({ children }) => <div data-testid="pdf-page">{children}</div>,
}));

// Mock pdf templates
jest.unstable_mockModule('../../src/components/pdf-templates/ClassicPdf.jsx', () => ({ default: () => <div data-testid="mock-classic-pdf" /> }));
jest.unstable_mockModule('../../src/components/pdf-templates/ModernPdf.jsx', () => ({ default: () => <div data-testid="mock-modern-pdf" /> }));
jest.unstable_mockModule('../../src/components/pdf-templates/CreativePdf.jsx', () => ({ default: () => <div data-testid="mock-creative-pdf" /> }));
jest.unstable_mockModule('../../src/components/pdf-templates/MinimalPdf.jsx', () => ({ default: () => <div data-testid="mock-minimal-pdf" /> }));
jest.unstable_mockModule('../../src/components/pdf-templates/ExecutivePdf.jsx', () => ({ default: () => <div data-testid="mock-executive-pdf" /> }));

describe('PdfDocument', () => {
  let PdfDocument;

  beforeAll(async () => {
    PdfDocument = (await import('../../src/components/PdfDocument/index.jsx')).default;
  });
  const getResume = (templateId = 'classic') => ({
    _id: '123',
    templateId,
    title: 'My PDF',
    targetRole: 'SWE',
    sections: {
      personalInfo: { fullName: 'John Doe' }
    }
  });

  it('renders ClassicPdf by default or unknown', () => {
    const { getByTestId } = render(<PdfDocument resume={getResume('unknown')} />);
    expect(getByTestId('pdf-document')).toBeInTheDocument();
    expect(getByTestId('pdf-page')).toBeInTheDocument();
    expect(getByTestId('mock-classic-pdf')).toBeInTheDocument();
  });

  it('renders ModernPdf', () => {
    const { getByTestId } = render(<PdfDocument resume={getResume('modern')} />);
    expect(getByTestId('mock-modern-pdf')).toBeInTheDocument();
  });

  it('renders CreativePdf', () => {
    const { getByTestId } = render(<PdfDocument resume={getResume('creative')} />);
    expect(getByTestId('mock-creative-pdf')).toBeInTheDocument();
  });

  it('renders MinimalPdf', () => {
    const { getByTestId } = render(<PdfDocument resume={getResume('minimal')} />);
    expect(getByTestId('mock-minimal-pdf')).toBeInTheDocument();
  });

  it('renders ExecutivePdf', () => {
    const { getByTestId } = render(<PdfDocument resume={getResume('executive')} />);
    expect(getByTestId('mock-executive-pdf')).toBeInTheDocument();
  });
});
