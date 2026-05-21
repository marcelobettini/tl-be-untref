import express from "express";
import frutasRouter from "./routes/frutas.js";
import healthRouter from "./routes/health.js";
import infoRouter from "./routes/info.js"; // Importar el nuevo router
import { connectDB } from "./data/mongoClient.js";
const app = express();
const PORT = process.env.PORT || 3005;

// Deshabilitar el header X-Powered-By para mejorar la seguridad al no revelar que estamos usando Express.
app.disable("x-powered-by");

// Parsear el body de las request como JSON
app.use(express.json());

// Recuperar la URI de MongoDB desde las variables de entorno y mostrarla en consola
// console.log(process.env.MONGODB_URI);

// versionado de la API
const API_PREFIX = "/api/v1";

// Ruta raíz: info de la API
app.get(API_PREFIX, (req, res) => {
  res.redirect(`${API_PREFIX}/info`); // Redirigir a la nueva ruta de información
});

// Montamos el router de frutas bajo el prefijo /api/v1/frutas
app.use(`${API_PREFIX}/frutas`, frutasRouter);

// Montamos el router de health bajo el prefijo /api/v1/health
app.use(`${API_PREFIX}/health`, healthRouter);

// Montamos el router de información bajo el prefijo /api/v1/info
app.use(`${API_PREFIX}/info`, infoRouter);

// Manejador global de errores (si le paso 4 params Express lo reconoce como un error handler)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ status: 500, error: "Internal Server Error" });
});

async function main() {
  await connectDB();
  app.listen(PORT, (err) => {
    console.log(
      err ? err.message : `Server running on http://localhost:${PORT}`,
    );
  });
}

main();
