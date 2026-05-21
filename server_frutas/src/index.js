import express from "express";
import frutasRouter from "./rutas/frutasRouter.js";
import healthRouter from "./routes/health.js";
import infoRouter from "./routes/info.js"; // Importar el nuevo router
import { connectDB } from "./services/data.js";
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
// Cualquier petición que empiece con /api/v1/frutas dásela al frutasRouter
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

// Iniciar el servidor y conectar a la base de datos antes de aceptar conexiones
async function main() {
  await connectDB();
  const server = app.listen(PORT, () => {
    console.log({
      status: 200,
      message: `Server running on http://localhost:${PORT}`,
    });
  });

  server.on("error", (err) => {
    console.error({
      status: 500,
      error: "Internal Server Error",
      details: err.message,
    });
    process.exit(1);
  });
}

main().catch((err) => {
  console.error({
    status: 500,
    error: "Failed to start application",
    details: err.message,
  });
  process.exit(1);
});
