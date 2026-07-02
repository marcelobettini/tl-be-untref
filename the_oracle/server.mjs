// THE ORACLE — entry point (ESM via .mjs to avoid clashing with CommonJS files in repo root)
// Features wired:
//   F1 — scaffold: minimal Express server with /health probe.
//   F2 — gemini service (consumed by route, not directly here).
//   F3 — endpoint: POST /generate-content.
//   F4 — error handler: maps AppError to safe HTTP responses (no SDK leak).

import 'dotenv/config';
import express from 'express';
import { generateContentRouter } from './src/routes/generateContent.routes.mjs';
import { errorHandler } from './src/middlewares/errorHandler.mjs';

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'the-oracle' });
});

app.use('/', generateContentRouter);

// errorHandler MUST be registered last (Express 4-arg signature is the trigger).
app.use(errorHandler);

const PORT = process.env.PORT ?? 3000;
const server = app.listen(PORT, () => {
  console.log(`[the-oracle] listening on port ${PORT}`);
});

export { app, server };
