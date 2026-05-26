// Entry point: Configuramos Express y arrancamos el server
import express from 'express';
import tasksRouter from './routes/tasks.js';
import healthRouter from "./routes/health.js";
import { connectDB } from './db/mongoClient.js';
const app = express();
const PORT = process.env.PORT || 3001;
app.disable("x-powered-by");


// Parsear el body de las request como JSON
app.use(express.json());

console.log(process.env.MONGODB_URI);

//versionado de la API
//miapi.com/ -> documentación
//miapi.com/api/v1
//miapi.com/api/v2

const API_PREFIX = '/api/v1';

//Ruta raíz: info de la API

app.get(API_PREFIX, (req, res) => {
    res.json({
        name: 'Todo API',
        version: '0.0.1',
        endpoints: {
            [`GET    ${API_PREFIX}/tasks`]: 'Lista todas las tareas (filtra con ?completed=true|false o ?search=keyword)',
            [`GET    ${API_PREFIX}/tasks/:id`]: 'Obtiene una tarea por id',
            [`POST   ${API_PREFIX}/tasks`]: 'Crea una nueva tarea',
            [`PATCH  ${API_PREFIX}/tasks/:id`]: 'Actualiza una tarea parcialmente',
            [`PATCH  ${API_PREFIX}/tasks/:id/toggle`]: 'Invierte el estado completed de una tarea',
            [`DELETE ${API_PREFIX}/tasks/:id`]: 'Elimina una tarea',
        }
    });
});

// Montamos el router de tareas bajo el prefijo /api/v1/tasks
app.use(`${API_PREFIX}/tasks`, tasksRouter);

app.use("/health", healthRouter);

// 404 para rutas no definidas, trabaja en conjunto con el error handler global
app.use((req, res, next) => {
    const error = new Error(`Not Found: ${req.method} ${req.originalUrl}`);
    error.status = 404;
    next(error);
});

// Manejador global de errores (si le paso 4 params Express lo reconoce como un error handler)
app.use((err, req, res, next) => {
    const status = err.status || 500;
    console.error(err.stack);
    res.status(status).json({ status, error: err.message || 'Internal Server Error' });
});

async function main() {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`http://localhost:${PORT}`);
    });
}

main().catch(err => {
    console.log('Error al iniciar el servidor:', err);
    process.exit(1);
}
);
