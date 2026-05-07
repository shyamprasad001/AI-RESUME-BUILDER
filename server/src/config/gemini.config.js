import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL_NAME = "gemini-2.5-flash";

// Transient HTTP status codes that are safe to retry
const RETRYABLE_CODES = [429, 503, 502, 504];
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1500; // 1.5s → 3s → 6s

/** Returns true if the error message contains a retryable HTTP status code. */
const isRetryable = (message = "") =>
  RETRYABLE_CODES.some((code) => message.includes(String(code)));

/** Sleep helper */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const MODELS = [MODEL_NAME, "gemini-1.5-flash", "gemini-2.5-flash-lite"];

/**
 * generateContent — calls Gemini and retries on transient 503 / 429 errors.
 * Now includes model fallback if quota is exhausted.
 */
const generateContent = async (prompt) => {
  let lastError;

  for (const modelId of MODELS) {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: modelId,
          contents: prompt,
          config: {
            maxOutputTokens: 8192,
            temperature: 0.2,
          }
        });
        return response.text;
      } catch (error) {
        lastError = error;
        const msg = error.message || "";

        // If it's a quota error (429), check if we should try next model or retry
        if (msg.includes("429")) {
          // If we have more models to try, move to next model immediately
          if (MODELS.indexOf(modelId) < MODELS.length - 1) {
            console.warn(`[Gemini] Model ${modelId} exhausted. Falling back to next model...`);
            break; // Break inner retry loop to try next model
          }
        }

        if (isRetryable(msg) && attempt < MAX_RETRIES) {
          // Check for a specific retry delay in the error message (e.g. "retry in 51s")
          let delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
          const match = msg.match(/retry in ([\d.]+)s/);
          if (match) {
            delay = Math.max(delay, parseFloat(match[1]) * 1000 + 500);
          }

          console.warn(
            `[Gemini] Attempt ${attempt}/${MAX_RETRIES} (${modelId}) failed. ` +
              `Retrying in ${Math.round(delay)}ms…`,
          );
          await sleep(delay);
          continue;
        }

        // If not retryable or final model/attempt, throw
        if (MODELS.indexOf(modelId) === MODELS.length - 1) {
          console.error("[Gemini] Critical API Error:", msg);
          throw new Error(`Gemini API failed after all fallbacks: ${msg}`);
        }
        break; // Try next model
      }
    }
  }

  throw new Error(`Gemini API failed: ${lastError?.message}`);
};

export { ai, MODEL_NAME, generateContent };
