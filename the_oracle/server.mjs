// THE ORACLE — punto de entrada (ESM vía .mjs para evitar conflicto con archivos CommonJS en la raíz del repo)
// Funcionalidades activadas:
//   F1 — scaffold: servidor Express mínimo con sonda /health.
//   F2 — servicio gemini (consumido por la ruta, no directamente aquí).
//   F3 — endpoint: POST /generate-content.
//   F4 — manejador de errores: mapea AppError a respuestas HTTP seguras (sin filtrar SDK).

// Carga .env desde the_oracle/ explícitamente. dotenv/config usa process.cwd() por defecto,
// que es la raíz del repo cuando se ejecuta 'npm run start:oracle', pero el .env real
// para esta funcionalidad vive dentro de the_oracle/, así que anclamos la ruta a la
// ubicación de este archivo vía import.meta.url. De este modo el mismo comando funciona
// si lo ejecutas desde la raíz del repo, desde the_oracle/ o con ruta absoluta.
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

// errorHandler DEBE registrarse al final (la firma de 4 argumentos de Express lo activa).
app.use(errorHandler);

const PORT = process.env.PORT ?? DEFAULT_PORT;
const server = app.listen(PORT, () => {
  console.log(`[the-oracle] listening on port ${PORT}`);
});

export { app, server };
