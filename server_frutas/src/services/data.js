// Implementa la abstraccion del acceso a datos, en este caso MongoDB, para que el resto de la app no dependa de detalles de la base de datos y sea fácil de cambiar o mockear para tests.
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
const client = new MongoClient(MONGODB_URI);

export async function connectDB() {
  try {
    await client.connect();
    console.log("Conectado a MongoDB");
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error);
    process.exit(1); // Si no hay DB, la app no debería seguir corriendo
  }
}

export async function disconnectFromDatabase() {
  try {
    await client.close();
    console.log("Desconectado de MongoDB");
  } catch (error) {
    console.error("Error al desconectar de MongoDB:", error);
  }
}

export default client;
