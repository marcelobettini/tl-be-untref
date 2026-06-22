import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';
import { buildSystemPrompt, isOffTopic } from './topicGuard.service.js';

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

export const ask = async ({ question }) => {
  const start = Date.now();

  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Gemini request timed out')), env.GEMINI_TIMEOUT_MS)
    );

    const responsePromise = ai.models.generateContent({
      model: env.GEMINI_MODEL,
      contents: question,
      config: { systemInstruction: buildSystemPrompt() },
    });

    const response = await Promise.race([responsePromise, timeoutPromise]);
    const answer = response.text;
    const latency = Date.now() - start;

    if (isOffTopic(answer)) {
      console.log({ latency, result: 'off-topic' });
      return { offTopic: true };
    }

    console.log({ latency, result: 'on-topic' });
    return { answer };
  } catch (err) {
    let message = err.message || 'LLM service unavailable.';
    try { message = JSON.parse(err.message).error?.message ?? message; } catch {}
    console.error({ latency: Date.now() - start, result: 'error', status: err.status, error: message });
    const error = new Error(message);
    error.status = err.status || 503;
    throw error;
  }
};
