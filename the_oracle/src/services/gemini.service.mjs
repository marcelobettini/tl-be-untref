// THE ORACLE — Gemini service.
// Feature: gemini-service (F2).
// Async function that calls Gemini API and returns the answer.
// Throws AppError — default status 502 (upstream). The errorHandler middleware
// (F4) refines the statusCode by inspecting the SDK error attached in `cause`.
//
// The @google/generative-ai SDK exposes typed errors:
//   - GoogleGenerativeAIError (base)
//   - GoogleGenerativeAIFetchError (network / upstream HTTP) — has .status, .statusText, .errorDetails
//   - GoogleGenerativeAIRequestInputError (client-side invalid request)
//   - GoogleGenerativeAIResponseError (model refused / safety block)
// The .message is prefixed with "[GoogleGenerativeAI Error]: <reason>".

import { GoogleGenerativeAI } from '@google/generative-ai';
import { AppError } from '../errors/AppError.mjs';

const MODEL_DEFAULT = 'gemini-1.5-flash';

function buildDefaultModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new AppError({
      statusCode: 500,
      safeMessage: 'Internal server error',
      internalMessage: '[the-oracle] GEMINI_API_KEY is not set in the environment',
      kind: 'config',
    });
  }
  const modelName = process.env.GEMINI_MODEL ?? MODEL_DEFAULT;
  const client = new GoogleGenerativeAI(apiKey);
  return { model: client.getGenerativeModel({ model: modelName }), modelName };
}

/**
 * Ask Gemini a question and return { text, model }.
 * On failure throws AppError with statusCode 502 (upstream) by default;
 * the errorHandler middleware (F4) refines it by inspecting `cause`.
 * @param {string} prompt
 * @param {object} [deps] - Dependency injection for tests.
 * @param {object} [deps.model] - Pre-built generative model (bypasses env-based client).
 * @param {string} [deps.modelName] - Name to report in the response.
 * @returns {Promise<{text: string, model: string}>}
 */
export async function askGemini(prompt, deps = {}) {
  if (typeof prompt !== 'string' || prompt.trim() === '') {
    throw new AppError({
      statusCode: 400,
      safeMessage: 'Prompt must be a non-empty string',
      internalMessage: 'askGemini received an invalid prompt',
      kind: 'validation',
    });
  }

  let model, modelName;
  if (deps.model) {
    model = deps.model;
    modelName = deps.modelName ?? MODEL_DEFAULT;
  } else {
    const built = buildDefaultModel();
    model = built.model;
    modelName = built.modelName;
  }

  try {
    const result = await model.generateContent(prompt);
    const text = result?.response?.text?.() ?? '';
    return { text, model: modelName };
  } catch (rawErr) {
    // Service-level AppError: 502 "upstream failure" by default. The errorHandler
    // middleware (F4) reads `cause` (the raw SDK error) and refines the statusCode
    // to 401/403/404/408/429/503 based on keywords / .status from the SDK.
    throw new AppError({
      statusCode: 502,
      safeMessage: 'Upstream AI service is currently unavailable',
      internalMessage: `Gemini call failed: ${rawErr?.message ?? 'unknown'}`,
      kind: 'gemini',
    }, rawErr);
  }
}
