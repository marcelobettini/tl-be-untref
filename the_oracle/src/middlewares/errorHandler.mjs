// THE ORACLE — global error handler middleware.
// Feature: error-handler (F4).
// Maps AppError to safe HTTP responses. Refines the default 502 from the gemini
// service by inspecting the SDK error attached in `cause`.
//
// IMPORTANT (per IDEA.md point 7): the response MUST NOT leak any Gemini SDK
// field (status, statusText, errorDetails, code, stack, message). Only the
// refined statusCode and a generic safeMessage reach the client.
//
// Mapping (priority order):
//   1. If cause.status is a Gemini-style 401, 403, 404, 408, 429, 503, 502 ->
//      use that exact status. (The SDK returns the upstream HTTP code here.)
//   2. If cause.errorDetails contains a "reason" field (Google RPC style),
//      map keywords to our status codes:
//        API_KEY_INVALID          -> 401
//        PERMISSION_DENIED        -> 403
//        NOT_FOUND                -> 404
//        DEADLINE_EXCEEDED        -> 408
//        RESOURCE_EXHAUSTED       -> 429
//        UNAVAILABLE              -> 503
//        INTERNAL / UNKNOWN       -> 500
//   3. Fallback to the AppError.statusCode set by the service (502 for gemini).

import { AppError } from '../errors/AppError.mjs';

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
  400: 'Bad request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not found',
  408: 'Request timeout',
  429: 'Too many requests',
  500: 'Internal server error',
  502: 'Upstream service unavailable',
  503: 'Service temporarily unavailable',
};

const SAFE_KINDS = {
  validation: 400,
  config: 500,
  gemini: 502,
};

function pickSafeMessage(statusCode) {
  return SAFE_MESSAGES[statusCode] ?? 'Internal server error';
}

/**
 * Parse the SDK's errorDetails which can be either a JSON string (when sent
 * through the HTTP layer) or already an array. Returns an array of {reason,...}
 * objects, or [] if not parseable.
 */
function parseErrorDetails(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
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
    if (d && typeof d === 'object' && d.reason) return String(d.reason);
  }
  return null;
}

function extractKeywordReason(cause) {
  // The SDK prefixes the message with "[GoogleGenerativeAI Error]:". We look
  // for the reason keywords in the message itself, since the cause may also
  // surface a flat error in non-fetch errors.
  if (!cause || typeof cause.message !== 'string') return null;
  const msg = cause.message;
  for (const reason of Object.keys(REASON_MAP)) {
    if (msg.includes(reason)) return reason;
  }
  return null;
}

/**
 * Refine a generic gemini AppError by inspecting its cause.
 * Returns the refined statusCode.
 *
 * Order of precedence (semantic reason beats raw HTTP code):
 *   1. Google RPC reason in errorDetails (API_KEY_INVALID, etc.) — these are
 *      semantic and override any HTTP code the upstream happened to return.
 *   2. Keyword match in cause.message (covers SDK errors that surface the
 *      reason as plain text instead of structured errorDetails).
 *   3. Upstream HTTP status from the SDK (cause.status), only when no
 *      semantic reason was found AND the status is one we know how to map.
 *   4. Fallback to the AppError's own statusCode.
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

  if (typeof cause.status === 'number' && SAFE_MESSAGES[cause.status]) {
    return cause.status;
  }

  return appErr.statusCode;
}

/**
 * Express error-handling middleware (4-arg signature).
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  const timestamp = new Date().toISOString();

  // Map to a normalized AppError.
  let appErr;
  if (err instanceof AppError) {
    appErr = err;
  } else {
    // Unknown error -> 500, no leak.
    appErr = new AppError({
      statusCode: 500,
      safeMessage: 'Internal server error',
      internalMessage: err?.message ?? 'unknown',
      kind: 'app',
    }, err);
  }

  // Refine gemini errors using their cause.
  // For non-gemini errors, map kind -> default status when AppError has no
  // explicit statusCode. The safeMessage is ALWAYS picked from SAFE_MESSAGES
  // based on the final statusCode — we never propagate the service-supplied
  // safeMessage to the client. This is the no-leak contract.
  let statusCode;
  if (appErr.kind === 'gemini') {
    statusCode = refineFromGeminiCause(appErr);
  } else {
    statusCode = appErr.statusCode || SAFE_KINDS[appErr.kind] || 500;
  }
  const safeMessage = pickSafeMessage(statusCode);

  // Internal log: full detail. NEVER returned to the client.
  console.error(JSON.stringify({
    timestamp,
    level: 'error',
    kind: appErr.kind,
    statusCode,
    path: req.path,
    method: req.method,
    internalMessage: appErr.internalMessage,
    cause: appErr.cause
      ? { name: appErr.cause.name, message: appErr.cause.message, status: appErr.cause.status }
      : undefined,
  }));

  // External response: ONLY refined status + generic message. No SDK fields.
  res.status(statusCode).json({
    error: { status: statusCode, message: safeMessage },
  });
}
