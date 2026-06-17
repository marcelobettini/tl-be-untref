import { env } from '../config/env.js';

const { ask } = await import(`./${env.LLM_PROVIDER}.llm.service.js`);
export { ask };
