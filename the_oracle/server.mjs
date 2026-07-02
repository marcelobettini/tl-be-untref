// THE ORACLE — entry point (ESM via .mjs to avoid clashing with CommonJS files in repo root)
// Features wired:
//   F1 — scaffold: minimal Express server with /health probe.
//   F2 — gemini service (consumed by route, not directly here).
//   F3 — endpoint: POST /generate-content.
//   F4 — error handler: maps AppError to safe HTTP responses (no SDK leak).

// Load .env from the_oracle/ explicitly. dotenv/config defaults to process.cwd(),
// which is the repo root when invoked via 'npm run start:oracle', but the actual
// .env for this feature lives inside the_oracle/ so we anchor the path to this
// file's location via import.meta.url. This way the same command works whether
// you run it from the repo root, from the_oracle/, or via an absolute path.
import { config as loadEnv } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
const __dirname = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: resolve(__dirname, '.env') });

import express from 'express';
import { generateContentRouter } from './src/routes/generateContent.routes.mjs';
import { errorHandler } from './src/middlewares/errorHandler.mjs';
import { DEFAULT_PORT } from './src/config.mjs';

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'the-oracle' });
});

app.use('/', generateContentRouter);

// errorHandler MUST be registered last (Express 4-arg signature is the trigger).
app.use(errorHandler);

const PORT = process.env.PORT ?? DEFAULT_PORT;
const server = app.listen(PORT, () => {
  console.log(`[the-oracle] listening on port ${PORT}`);
});

export { app, server };
