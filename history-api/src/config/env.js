const required = (key) => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
};

const VALID_PROVIDERS = ['openai', 'gemini'];
const provider = process.env.LLM_PROVIDER || 'openai';
if (!VALID_PROVIDERS.includes(provider)) {
  throw new Error(`Invalid LLM_PROVIDER: "${provider}". Valid values: ${VALID_PROVIDERS.join(', ')}`);
}

export const env = {
  PORT: process.env.PORT || '3000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  LLM_PROVIDER: provider,
  OPENAI_API_KEY: provider === 'openai' ? required('OPENAI_API_KEY') : process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  OPENAI_TIMEOUT_MS: Number(process.env.OPENAI_TIMEOUT_MS) || 30000,
  GEMINI_API_KEY: provider === 'gemini' ? required('GEMINI_API_KEY') : process.env.GEMINI_API_KEY,
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  GEMINI_TIMEOUT_MS: Number(process.env.GEMINI_TIMEOUT_MS) || 30000,
  TOPIC: process.env.TOPIC || 'Historia de Argentina',
};
