const MODEL_NAME = "tencent/hy3-preview:free";
import logger from '../utils/logger.js';
import axios from 'axios';
import axiosRetry from 'axios-retry';

// Create an Axios instance for OpenRouter
const aiClient = axios.create({
  baseURL: "https://openrouter.ai/api/v1",
});

// Configure axios-retry with exponential backoff
axiosRetry(aiClient, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay, // 100ms -> 200ms -> 400ms etc
  retryCondition: (error) => {
    // Retry on network errors or 5xx/429 status codes
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
           error.response?.status === 429 || 
           (error.response?.status >= 500 && error.response?.status <= 599);
  },
  onRetry: (retryCount, error, requestConfig) => {
    logger.warn(`[OpenRouter] Attempt ${retryCount}/3 failed. Retrying... Error: ${error.message}`);
  }
});

/**
 * generateContent — calls OpenRouter using Axios and handles transient errors
 */
const generateContent = async (prompt) => {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not set in environment variables. Please add it to your .env file and restart the server.");
  }

  // Set timeout via AbortController
  // Note: Using 60 seconds as default instead of 10s because LLMs regularly take >10s to generate responses
  const timeoutMs = parseInt(process.env.AI_API_TIMEOUT || '60000', 10);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const apiKey = process.env.OPENROUTER_API_KEY.trim();
    
    const response = await aiClient.post("/chat/completions", {
      model: MODEL_NAME,
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 8192
    }, {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.SITE_URL || "http://localhost:5000",
        "X-Title": "AI Resume Builder"
      },
      signal: controller.signal
    });

    if (!response.data.choices || response.data.choices.length === 0) {
      throw new Error("No choices in OpenRouter response");
    }
    return response.data.choices[0].message.content;
  } catch (error) {
    if (axios.isCancel(error)) {
      logger.error("[OpenRouter] Request timed out");
      throw new Error(`OpenRouter API timed out after ${timeoutMs}ms`);
    }
    logger.error({ error: error.message }, "[OpenRouter] API Error");
    throw new Error(`OpenRouter API failed: ${error.message}`);
  } finally {
    clearTimeout(timeoutId);
  }
};

export { MODEL_NAME, generateContent };
