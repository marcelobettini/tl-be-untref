// THE ORACLE — typed application error.
// Feature: gemini-service (F2).
// Used by services to signal HTTP-mapped failures without leaking upstream codes.
// The errorHandler middleware (F4) reads statusCode, safeMessage and cause to
// build the final HTTP response.

export class AppError extends Error {
  /**
   * @param {object} opts
   * @param {number} opts.statusCode - HTTP status to expose to the client (e.g. 401, 429).
   * @param {string} opts.safeMessage - Generic message safe to send to the client.
   * @param {string} [opts.internalMessage] - Detailed message for server logs only.
   * @param {string} [opts.kind] - Tag for log filtering (e.g. 'gemini', 'validation').
   * @param {Error} [cause] - Original error wrapped by this AppError.
   */
  constructor({ statusCode, safeMessage, internalMessage, kind }, cause) {
    super(internalMessage ?? safeMessage, cause ? { cause } : undefined);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.safeMessage = safeMessage;
    this.internalMessage = internalMessage ?? safeMessage;
    this.kind = kind ?? 'app';
  }
}
