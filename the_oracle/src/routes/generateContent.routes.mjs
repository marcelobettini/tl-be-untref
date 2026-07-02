// THE ORACLE — POST /generate-content route.
// Feature: endpoint (F3).
// Validates the body, calls the injected service, and returns { text, model }.
// Error handling is delegated to the errorHandler middleware (F4) — we only
// call next(err) on failure. Never expose SDK errors directly.

import { Router } from 'express';
import { askGemini as defaultAskGemini } from '../services/gemini.service.mjs';
import { validatePrompt } from '../middlewares/validatePrompt.mjs';

/**
 * Build the /generate-content router.
 * @param {object} [deps]
 * @param {Function} [deps.ask] - async (question) => {text, model}. Defaults to real askGemini.
 */
export function buildGenerateContentRouter(deps = {}) {
  const ask = deps.ask ?? defaultAskGemini;
  const router = Router();

  router.post('/generate-content', validatePrompt, async (req, res, next) => {
    try {
      const { question } = req.validated;
      const result = await ask(question);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });

  return router;
}

// Backwards-compatible default export (used by server.mjs).
export const generateContentRouter = buildGenerateContentRouter();
