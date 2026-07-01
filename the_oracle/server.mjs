// THE ORACLE — entry point (ESM via .mjs to avoid clashing with CommonJS files in repo root)
// Feature: scaffold (F1) — minimal Express server with /health probe.
// Future features: F2 gemini service, F3 /generate-content endpoint, F4 error handler.

import 'dotenv/config';
import express from 'express';

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'the-oracle' });
});

const PORT = process.env.PORT ?? 3000;
const server = app.listen(PORT, () => {
  console.log(`[the-oracle] listening on port ${PORT}`);
});

export { app, server };
