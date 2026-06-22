import OpenAI from 'openai';
import { env } from '../config/env.js';
import { buildSystemPrompt, isOffTopic } from './topicGuard.service.js';
const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

export const ask = async ({ question }) => {
  const start = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.OPENAI_TIMEOUT_MS);

  try {
    const response = await openai.chat.completions.create(
      {
        model: env.OPENAI_MODEL,
        messages: [
          { role: 'system', content: buildSystemPrompt() },
          { role: 'user', content: question },
        ],
      },
      { signal: controller.signal }
    );

    const answer = response.choices[0].message.content;
    const latency = Date.now() - start;

    if (isOffTopic(answer)) {
      console.log({ latency, result: 'off-topic' });
      return { offTopic: true };
    }

    console.log({ latency, result: 'on-topic' });
    return { answer };
  } catch (err) {
    console.error({ latency: Date.now() - start, result: 'error', status: err.status, error: err.message });
    const error = new Error(err.message || 'LLM service unavailable.');
    error.status = err.status || 503;
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};
