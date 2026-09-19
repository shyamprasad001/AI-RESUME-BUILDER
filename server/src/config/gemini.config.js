import OpenAI from 'openai';
import logger from '../utils/logger.js';

const MODEL_NAME = "nvidia/nemotron-3-ultra-550b-a55b";

const timeoutMs = parseInt(
  process.env.AI_API_TIMEOUT || '60000',
  10
);

let openai = null;
const getOpenAIClient = () => {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.NVIDIA_API_KEY ? process.env.NVIDIA_API_KEY.trim() : '',
      baseURL: 'https://integrate.api.nvidia.com/v1',
      timeout: timeoutMs,
    });
  }
  return openai;
};

/**
 * generateContent — calls NVIDIA API using OpenAI SDK and handles transient errors
 */
const generateContent = async (prompt) => {
  if (!process.env.NVIDIA_API_KEY) {
    throw new Error("NVIDIA_API_KEY is not set in environment variables. Please add it to your .env file and restart the server.");
  }

  if (!prompt || typeof prompt !== 'string') {
    throw new Error("A valid prompt is required.");
  }

  const client = getOpenAIClient();

  try {
    const completion = await client.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      top_p: 0.95,
      max_tokens: 16384,
      chat_template_kwargs: {
        enable_thinking: true
      },
      stream: false
    });

    const content = completion.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content returned from NVIDIA Nemotron API");
    }

    return content;

  } catch (error) {
    logger.error(
      {
        error: error.message,
        status: error.status,
        model: MODEL_NAME
      },
      "[NVIDIA Nemotron] API Error"
    );

    throw new Error(
      `NVIDIA Nemotron API failed: ${error.message}`
    );
  }
};

export { MODEL_NAME, generateContent };
