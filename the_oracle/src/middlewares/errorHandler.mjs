// THE ORACLE — middleware global de manejo de errores.
// Feature: error-handler (F4).
// Mapea AppError a respuestas HTTP seguras. Refina el 502 por defecto del servicio
// gemini inspeccionando el error del SDK adjunto en `cause`.
//
// IMPORTANTE (según IDEA.md punto 7): la respuesta NO DEBE filtrar ningún campo del SDK
// de Gemini (status, statusText, errorDetails, code, stack, message). Solo el
// statusCode refinado y un safeMessage genérico llegan al cliente.
//
// Mapeo (orden de prioridad):
//   1. Si cause.status es un código Gemini 401, 403, 404, 408, 429, 503, 502 ->
//      usar ese mismo status. (El SDK devuelve aquí el código HTTP upstream.)
//   2. Si cause.errorDetails contiene un campo "reason" (estilo Google RPC),
//      mapear palabras clave a nuestros códigos:
//        API_KEY_INVALID          -> 401
//        PERMISSION_DENIED        -> 403
//        NOT_FOUND                -> 404
//        DEADLINE_EXCEEDED        -> 408
//        RESOURCE_EXHAUSTED       -> 429
//        UNAVAILABLE              -> 503
//        INTERNAL / UNKNOWN       -> 500
//   3. Fallback al AppError.statusCode establecido por el servicio (502 para gemini).

import { AppError } from "../errors/AppError.mjs";

const REASON_MAP = {
  API_KEY_INVALID: 401,
  PERMISSION_DENIED: 403,
  NOT_FOUND: 404,
  DEADLINE_EXCEEDED: 408,
  RESOURCE_EXHAUSTED: 429,
  UNAVAILABLE: 503,
  INTERNAL: 500,
  UNKNOWN: 500,
};

const SAFE_MESSAGES = {
  400: "Bad request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not found",
  408: "Request timeout",
  429: "Too many requests",
  500: "Internal server error",
  502: "Upstream service unavailable",
  503: "Service temporarily unavailable",
};

const SAFE_KINDS = {
  validation: 400,
  config: 500,
  gemini: 502,
};

function pickSafeMessage(statusCode) {
  return SAFE_MESSAGES[statusCode] ?? "Internal server error";
}

/**
 * Analiza errorDetails del SDK, que puede ser una cadena JSON (cuando se envía
 * por la capa HTTP) o ya un array. Devuelve un array de objetos {reason,...}
 * o [] si no es parseable.
 */
function parseErrorDetails(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function extractReason(cause) {
  if (!cause) return null;
  const details = parseErrorDetails(cause.errorDetails);
  for (const d of details) {
    if (d && typeof d === "object" && d.reason) return String(d.reason);
  }
  return null;
}

function extractKeywordReason(cause) {
  // El SDK prefija el mensaje con "[GoogleGenerativeAI Error]:". Buscamos
  // las palabras clave de reason en el propio mensaje, ya que el cause también
  // puede exponer un error plano en errores no relacionados con fetch.
  if (!cause || typeof cause.message !== "string") return null;
  const msg = cause.message;
  for (const reason of Object.keys(REASON_MAP)) {
    if (msg.includes(reason)) return reason;
  }
  return null;
}

/**
 * Refina un AppError genérico de gemini inspeccionando su cause.
 * Devuelve el statusCode refinado.
 *
 * Orden de precedencia (la razón semántica vence al código HTTP bruto):
 *   1. Reason de Google RPC en errorDetails (API_KEY_INVALID, etc.) — son
 *      semánticas y sobrescriben cualquier código HTTP que el upstream haya devuelto.
 *   2. Coincidencia por palabra clave en cause.message (cubre errores del SDK que
 *      muestran la reason como texto plano en vez de errorDetails estructurados).
 *   3. Código HTTP upstream desde el SDK (cause.status), sólo cuando no se encontró
 *      una reason semántica Y el status es uno que sabemos mapear.
 *   4. Fallback al statusCode propio del AppError.
 */
function refineFromGeminiCause(appErr) {
  const cause = appErr.cause;
  if (!cause) {
    return appErr.statusCode;
  }

  const reason = extractReason(cause) ?? extractKeywordReason(cause);
  if (reason && REASON_MAP[reason] !== undefined) {
    return REASON_MAP[reason];
  }

  if (typeof cause.status === "number" && SAFE_MESSAGES[cause.status]) {
    return cause.status;
  }

  return appErr.statusCode;
}

/**
 * Middleware de manejo de errores de Express (firma de 4 argumentos).
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  const timestamp = new Date().toISOString();

  // Mapear a un AppError normalizado.
  let appErr;
  if (err instanceof AppError) {
    appErr = err;
  } else {
    // Error desconocido -> 500, sin filtración.
    appErr = new AppError(
      {
        statusCode: 500,
        safeMessage: "Internal server error",
        internalMessage: err?.message ?? "unknown",
        kind: "app",
      },
      err,
    );
  }

  // Refinar errores de gemini usando su cause.
  // Para errores no-gemini, mapear kind -> status por defecto cuando AppError no tiene
  // statusCode explícito. El safeMessage SIEMPRE se selecciona de SAFE_MESSAGES
  // basado en el statusCode final — nunca propagamos el safeMessage provisto por el servicio
  // al cliente. Este es el contrato de no-filtrado.
  let statusCode;
  if (appErr.kind === "gemini") {
    statusCode = refineFromGeminiCause(appErr);
  } else {
    statusCode = appErr.statusCode || SAFE_KINDS[appErr.kind] || 500;
  }
  const safeMessage = pickSafeMessage(statusCode);

  // Registro interno: detalle completo. NUNCA devuelto al cliente.
  console.error(
    JSON.stringify({
      timestamp,
      level: "error",
      kind: appErr.kind,
      statusCode,
      path: req.path,
      method: req.method,
      internalMessage: appErr.internalMessage,
      cause: appErr.cause
        ? {
            name: appErr.cause.name,
            message: appErr.cause.message,
            status: appErr.cause.status,
          }
        : undefined,
    }),
  );

  // Respuesta externa: SOLO status refinado + mensaje genérico. Sin campos del SDK.
  res.status(statusCode).json({
    error: { status: statusCode, message: safeMessage },
  });
}
