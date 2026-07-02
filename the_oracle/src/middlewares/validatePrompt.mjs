// THE ORACLE — prompt validation middleware.
// Feature: endpoint (F3).
// Validates request body. On failure calls next(AppError 400) and short-circuits
// the chain. The errorHandler middleware (F4) renders it.

import { AppError } from '../errors/AppError.mjs';
import { PROMPT_MAX_LENGTH } from '../config.mjs';

const promptSchema = {
  parse(input) {
    if (!input || typeof input !== 'object') {
      throw new Error('Body must be a JSON object');
    }
    const { question } = input;
    if (typeof question !== 'string') {
      throw new Error('Field "question" is required and must be a string');
    }
    if (question.trim() === '') {
      throw new Error('Field "question" must not be empty');
    }
    if (question.length > PROMPT_MAX_LENGTH) {
      throw new Error(`Field "question" must be at most ${PROMPT_MAX_LENGTH} characters`);
    }
    return { question };
  },
};

export function validatePrompt(req, _res, next) {
  try {
    const parsed = promptSchema.parse(req.body);
    req.validated = parsed;
    next();
  } catch (err) {
    next(new AppError({
      statusCode: 400,
      safeMessage: 'Invalid request body',
      internalMessage: `validatePrompt: ${err.message}`,
      kind: 'validation',
    }));
  }
}
