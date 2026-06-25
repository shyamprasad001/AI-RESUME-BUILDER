import { jest } from '@jest/globals';

const mockGetPage = jest.fn();
const mockGetDocument = jest.fn().mockReturnValue({
  promise: Promise.resolve({
    numPages: 2,
    getPage: mockGetPage,
  })
});

jest.unstable_mockModule('pdfjs-dist/legacy/build/pdf.mjs', () => ({
  getDocument: mockGetDocument,
}));

describe('resumeParser', () => {
  let extractTextFromPdf;

  beforeAll(async () => {
    extractTextFromPdf = (await import('../../src/utils/resumeParser.js')).default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should extract text from a PDF buffer', async () => {
    mockGetPage.mockResolvedValueOnce({
      getTextContent: jest.fn().mockResolvedValue({
        items: [{ str: 'Hello' }, { str: 'World' }]
      })
    });
    mockGetPage.mockResolvedValueOnce({
      getTextContent: jest.fn().mockResolvedValue({
        items: [{ str: 'Page' }, { str: 'Two' }]
      })
    });

    const buffer = new ArrayBuffer(8);
    const result = await extractTextFromPdf(buffer);

    expect(mockGetDocument).toHaveBeenCalled();
    expect(mockGetPage).toHaveBeenCalledTimes(2);
    expect(mockGetPage).toHaveBeenNthCalledWith(1, 1);
    expect(mockGetPage).toHaveBeenNthCalledWith(2, 2);
    expect(result).toBe('Hello World\nPage Two');
  });
});
