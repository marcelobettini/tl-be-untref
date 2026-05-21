// Implementa la abstraccion del acceso a datos, en este caso MongoDB, para que el resto de la app no dependa de detalles de la base de datos y sea fácil de cambiar o mockear para tests.
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const client = new MongoClient(MONGODB_URI);

export default client;
