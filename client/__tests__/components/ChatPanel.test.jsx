import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import ChatPanel from '../../src/components/ChatPanel/index.jsx';
import { ResumeContext } from '../../src/context/ResumeContext.jsx';
import toast from 'react-hot-toast';

// Mock the scrollIntoView which doesn't exist in JSDOM
window.HTMLElement.prototype.scrollIntoView = jest.fn();

describe('ChatPanel', () => {
  const mockUpdateSection = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    jest.spyOn(toast, 'success').mockImplementation(() => {});
    jest.spyOn(toast, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    delete global.fetch;
    jest.restoreAllMocks();
  });

  const renderWithContext = (resumeId = '123') => {
    return render(
      <ResumeContext.Provider value={{
        resume: { _id: resumeId },
        updateSection: mockUpdateSection
      }}>
        <ChatPanel />
      </ResumeContext.Provider>
    );
  };

  it('loads and displays chat history', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi' }
      ]})
    });
    
    renderWithContext();
    
    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument();
      expect(screen.getByText('Hi')).toBeInTheDocument();
    });
  });

  it('displays quick actions if no history', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: [] }) });
    
    renderWithContext();
    
    await waitFor(() => {
      expect(screen.getByText('AI Resume Assistant')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Build my experience/i })).toBeInTheDocument();
    });
  });

  it('sends a message and updates UI', async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: [] }) }) // history
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: { message: 'Response from AI' } }) }); // chat
    
    renderWithContext();
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Ask the AI assistant/i)).toBeInTheDocument();
    });
    
    const input = screen.getByPlaceholderText(/Ask the AI assistant/i);
    fireEvent.change(input, { target: { value: 'Test message' } });
    
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false });
    
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/ai/chat',
      expect.objectContaining({ method: 'POST' })
    );
    expect(screen.getByText('Test message')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Response from AI')).toBeInTheDocument();
    });
  });

  it('handles apply data', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [
        { role: 'assistant', content: 'Here is data', extractedData: { summary: 'New summary' } }
      ]})
    });
    
    renderWithContext();
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Apply to resume/i })).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByRole('button', { name: /Apply to resume/i }));
    
    expect(mockUpdateSection).toHaveBeenCalledWith('summary', 'New summary');
    expect(toast.success).toHaveBeenCalledWith('Applied to resume!');
  });
  
  it('sends message via quick action', async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: { message: 'Done' } }) });
    
    renderWithContext();
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Build my experience/i })).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByRole('button', { name: /Build my experience/i }));
    
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/ai/chat',
      expect.objectContaining({ method: 'POST' })
    );
  });
});
