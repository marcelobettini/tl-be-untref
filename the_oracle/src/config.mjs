// THE ORACLE — central configuration.
// Feature: refactor (centralize-config).
// Single source of truth for tunables that used to be hardcoded across multiple
// files. Change a value here once; service, middlewares, tests, and docs stay
// in sync via imports.

export const DEFAULT_MODEL = 'gemini-flash-latest';
export const DEFAULT_PORT = 3000;
export const PROMPT_MAX_LENGTH = 1000;
