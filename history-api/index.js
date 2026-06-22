import { env } from './src/config/env.js';
import express from 'express';
import morgan from 'morgan';
import askRoutes from './src/routes/ask.routes.js';

const app = express();

app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());

app.use('/api/ask', askRoutes);

app.listen(env.PORT, () => console.log(`Server running on port ${env.PORT}`));
