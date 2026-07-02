// THE ORACLE — error de aplicación tipado.
// Feature: gemini-service (F2).
// Usado por servicios para señalar fallos mapeados a HTTP sin filtrar códigos upstream.
// El middleware errorHandler (F4) lee statusCode, safeMessage y cause para
// construir la respuesta HTTP final.

export class AppError extends Error {
  /**
   * @param {object} opts
   * @param {number} opts.statusCode - Código HTTP a exponer al cliente (p. ej. 401, 429).
   * @param {string} opts.safeMessage - Mensaje genérico seguro para enviar al cliente.
   * @param {string} [opts.internalMessage] - Mensaje detallado solo para logs del servidor.
   * @param {string} [opts.kind] - Etiqueta para filtrado en logs (p. ej. 'gemini', 'validation').
   * @param {Error} [cause] - Error original envuelto por este AppError.
   */
  constructor({ statusCode, safeMessage, internalMessage, kind }, cause) {
    super(internalMessage ?? safeMessage, cause ? { cause } : undefined);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.safeMessage = safeMessage;
    this.internalMessage = internalMessage ?? safeMessage;
    this.kind = kind ?? "app";
  }
}
