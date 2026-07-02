// THE ORACLE — ruta POST /generate-content.
// Feature: endpoint (F3).
// Valida el body, llama al servicio inyectado y devuelve { text, model }.
// El manejo de errores se delega al middleware errorHandler (F4) — solo llamamos
// a next(err) en caso de fallo. Nunca exponer errores del SDK directamente.

import { Router } from "express";
import { askGemini as defaultAskGemini } from "../services/gemini.service.mjs";
import { validatePrompt } from "../middlewares/validatePrompt.mjs";

/**
 * Construye el router /generate-content.
 * @param {object} [deps]
 * @param {Function} [deps.ask] - async (question) => {text, model}. Por defecto usa askGemini real.
 */
export function buildGenerateContentRouter(deps = {}) {
  const ask = deps.ask ?? defaultAskGemini;
  const router = Router();

  router.post("/generate-content", validatePrompt, async (req, res, next) => {
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

// Export por compatibilidad hacia atrás (usado por server.mjs).
export const generateContentRouter = buildGenerateContentRouter();
