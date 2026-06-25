import { jest } from '@jest/globals';

const mockInvoke = jest.fn();

jest.unstable_mockModule('@langchain/google-genai', () => ({
  ChatGoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    invoke: mockInvoke
  }))
}));

jest.unstable_mockModule('@langchain/langgraph/prebuilt', () => ({
  createReactAgent: jest.fn().mockImplementation(() => ({
    invoke: mockInvoke
  }))
}));

jest.unstable_mockModule('../../src/config/agent.tools.js', () => ({
  createAgentTools: jest.fn().mockReturnValue(['mockTool1', 'mockTool2'])
}));

const agentService = await import('../../src/services/agent.service.js');
const { createReactAgent } = await import('@langchain/langgraph/prebuilt');

describe('Agent Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('runInterviewAgent', () => {
    it('should format history and return string response', async () => {
      mockInvoke.mockResolvedValue({
        messages: [
          { content: 'Final agent answer' }
        ]
      });

      const data = {
        resumeId: '123',
        targetRole: 'Dev',
        jobDescription: 'JD',
        message: 'Hello',
        conversationHistory: [
          { role: 'user', content: 'Hi' },
          { role: 'assistant', content: 'Hello there' },
          { role: 'user', content: 'Hello' } // should be skipped since it matches current message
        ]
      };

      const result = await agentService.runInterviewAgent(data);

      expect(mockInvoke).toHaveBeenCalled();
      const callArgs = mockInvoke.mock.calls[0][0];
      
      expect(callArgs.messages).toHaveLength(3); // Hi, Hello there, Hello
      expect(callArgs.messages[0]).toEqual({ role: 'user', content: 'Hi' });
      expect(callArgs.messages[1]).toEqual({ role: 'assistant', content: 'Hello there' });
      expect(callArgs.messages[2]).toEqual({ role: 'user', content: 'Hello' });

      expect(result).toEqual({
        message: 'Final agent answer',
        extractedData: null,
        isComplete: false
      });
    });

    it('should handle empty history and fallback message content', async () => {
      mockInvoke.mockResolvedValue({
        messages: [
          { content: { type: 'complex_object' } } // not a string
        ]
      });

      const data = {
        message: 'New chat',
      };

      const result = await agentService.runInterviewAgent(data);

      expect(mockInvoke).toHaveBeenCalled();
      const callArgs = mockInvoke.mock.calls[0][0];
      expect(callArgs.messages).toHaveLength(1);
      expect(callArgs.messages[0]).toEqual({ role: 'user', content: 'New chat' });

      expect(result.message).toBe('I can help you with your resume. What would you like to work on?');
    });

    it('should return extractedData if context was mutated', async () => {
      // We simulate context mutation by making mockInvoke a function that modifies a closure or we just mock the return.
      // Wait, context is created inside runInterviewAgent, passed to createAgentTools.
      // Since createAgentTools is mocked, it doesn't do anything with context.
      // However, to test `context.lastExtractedData !== null`, we need to somehow mutate context.lastExtractedData inside invoke.
      // Since context is not exposed, we might not be able to easily mutate it from the mock unless we intercept createAgentTools.
      
      const { createAgentTools } = await import('../../src/config/agent.tools.js');
      createAgentTools.mockImplementationOnce((ctx) => {
        ctx.lastExtractedData = { some: 'data' }; // Simulate tool mutating context
        return ['mockTool'];
      });

      mockInvoke.mockResolvedValueOnce({
        messages: [{ content: 'Done' }]
      });

      const result = await agentService.runInterviewAgent({ message: 'save' });

      expect(result.extractedData).toEqual({ some: 'data' });
      expect(result.isComplete).toBe(true);
    });
  });
});
