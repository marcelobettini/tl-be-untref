import client from "../services/data.js";
import { ObjectId } from "mongodb";

const frutas = () => client.db().collection("frutas");

export async function getAllFrutas() {
  return await frutas().find({}).toArray();
}

export async function getFrutaById(id) {
  return await frutas().findOne({ id: parseInt(id, 10) });
}

/**
 * Busca frutas por nombre.
 * Soporta expresiones regulares simples enviadas como string.
 * Ejemplos de 'name':
 * - "^Man" (Empieza con Man)
 * - "roja$" (Termina con roja)
 * - "az" (Contiene az)
 * - ".*" (Cualquier nombre)
 *
 * Ejemplos de uso:
 * http://localhost:3005/api/v1/frutas/name/^Man -> Debería traerte Manzanas.
 * http://localhost:3005/api/v1/frutas/name/roja$ -> Debería traerte las que terminan en roja.
 */
export async function getFrutasByName(name) {
  return await frutas()
    .find({ nombre: { $regex: new RegExp(name, "i") } })
    .toArray();
}

export async function getFrutasByPrice(price) {
  return await frutas()
    .find({ importe: { $gte: parseFloat(price) } })
    .toArray();
}

export async function createFruta(frutaData) {
  const result = await frutas().insertOne(frutaData);
  return result.insertedId;
}

export async function updateFruta(id, frutaData) {
  // Eliminamos el _id si viene en el body para evitar errores de MongoDB
  const { _id, ...dataToUpdate } = frutaData;
  return await frutas().updateOne(
    { _id: new ObjectId(id) },
    { $set: dataToUpdate },
  );
}

export async function deleteFruta(id) {
  return await frutas().deleteOne({ _id: new ObjectId(id) });
}
