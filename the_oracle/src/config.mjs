// THE ORACLE — configuración central.
// Feature: refactor (centralize-config).
// Fuente única de verdad para parámetros ajustables que antes estaban hardcodeados
// en varios archivos. Cambia un valor aquí una vez; servicio, middlewares, tests y docs
// permanecen sincronizados vía imports.

export const DEFAULT_MODEL = "gemini-flash-latest";
export const DEFAULT_PORT = 3000;
export const PROMPT_MAX_LENGTH = 1000;
