// THE ORACLE — servicio Gemini.
// Feature: gemini-service (F2).
// Función async que llama a la API de Gemini y devuelve la respuesta.
// Lanza AppError — status por defecto 502 (upstream). El middleware errorHandler
// (F4) refina el statusCode inspeccionando el error del SDK en `cause`.
//
// El SDK @google/generative-ai expone errores tipados:
//   - GoogleGenerativeAIError (base)
//   - GoogleGenerativeAIFetchError (network / HTTP upstream) — tiene .status, .statusText, .errorDetails
//   - GoogleGenerativeAIRequestInputError (petición inválida del cliente)
//   - GoogleGenerativeAIResponseError (modelo rechazó / bloqueo de seguridad)
// El .message va prefijado con "[GoogleGenerativeAI Error]: <reason>".

import { GoogleGenerativeAI } from "@google/generative-ai";
import { AppError } from "../errors/AppError.mjs";
import { DEFAULT_MODEL } from "../config.mjs";

function buildDefaultModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new AppError({
      statusCode: 500,
      safeMessage: "Internal server error",
      internalMessage:
        "[the-oracle] GEMINI_API_KEY is not set in the environment",
      kind: "config",
    });
  }
  const modelName = process.env.GEMINI_MODEL ?? DEFAULT_MODEL;
  const client = new GoogleGenerativeAI(apiKey);
  return { model: client.getGenerativeModel({ model: modelName }), modelName };
}

/**
 * Pregunta a Gemini y devuelve { text, model }.
 * En caso de fallo lanza AppError con statusCode 502 (upstream) por defecto;
 * el middleware errorHandler (F4) lo refina inspeccionando `cause`.
 * @param {string} prompt
 * @param {object} [deps] - Inyección de dependencias para tests.
 * @param {object} [deps.model] - Modelo generativo preconstruido (evita crear cliente desde env).
 * @param {string} [deps.modelName] - Nombre a reportar en la respuesta.
 * @returns {Promise<{text: string, model: string}>}
 */
export async function askGemini(prompt, deps = {}) {
  if (typeof prompt !== "string" || prompt.trim() === "") {
    throw new AppError({
      statusCode: 400,
      safeMessage: "Prompt must be a non-empty string",
      internalMessage: "askGemini received an invalid prompt",
      kind: "validation",
    });
  }

  let model, modelName;
  if (deps.model) {
    model = deps.model;
    modelName = deps.modelName ?? DEFAULT_MODEL;
  } else {
    const built = buildDefaultModel();
    model = built.model;
    modelName = built.modelName;
  }

  try {
    const result = await model.generateContent(prompt);
    const text = result?.response?.text?.() ?? "";
    return { text, model: modelName };
  } catch (rawErr) {
    // AppError a nivel servicio: 502 "falla upstream" por defecto. El middleware
    // errorHandler (F4) lee `cause` (el error bruto del SDK) y refina el statusCode
    // a 401/403/404/408/429/503 basándose en palabras clave / .status del SDK.
    throw new AppError(
      {
        statusCode: 502,
        safeMessage: "Upstream AI service is currently unavailable",
        internalMessage: `Gemini call failed: ${rawErr?.message ?? "unknown"}`,
        kind: "gemini",
      },
      rawErr,
    );
  }
}
