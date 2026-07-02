// THE ORACLE — entry point (ESM via .mjs to avoid clashing with CommonJS files in repo root)
// Features wired:
//   F1 — scaffold: minimal Express server with /health probe.
//   F3 — endpoint: POST /generate-content (error handling added in F4).
// Future:
//   F2 (gemini service) is imported by the route, not directly here.
//   F4 (error handler) will be added as a final middleware in its own branch.

import 'dotenv/config';
import express from 'express';
import { generateContentRouter } from './src/routes/generateContent.routes.mjs';

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'the-oracle' });
});

app.use('/', generateContentRouter);

const PORT = process.env.PORT ?? 3000;
const server = app.listen(PORT, () => {
  console.log(`[the-oracle] listening on port ${PORT}`);
});

export { app, server };
