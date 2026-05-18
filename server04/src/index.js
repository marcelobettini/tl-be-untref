// Entry point: Configuramos Express y arrancamos el server
import express from 'express';
import tasksRouter from './routes/tasks.js';
import { getDB } from './db/mongoClient.js';
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

app.get("/health", async (req, res) => {
    const timestamp = new Date().toISOString();
    try {
        await getDB().command({ ping: 1 });
    } catch {
        // 503 Service Unavailable: el server corre pero la dependencia crítica no responde
        res.status(503).json({ status: 'error', db: 'unreachable', timestamp });
    }
});
// 404 para rutas no definidas
app.use((req, res) => {
    res.status(404).json({ status: 404, error: 'Invalid Route' });
});

// Manejador global de errores (si le paso 4 params Express lo reconoce como un error handler)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ status: 500, error: 'Internal Server Error' });
});

app.listen(PORT, (err) => {
    console.log(err ? err.message : `http://localhost:${PORT}`);
});
