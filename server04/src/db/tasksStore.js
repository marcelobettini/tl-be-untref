import { getDB } from './mongoClient.js';
const COLLECTION = 'tasks';


function toTask(doc) {
    if (!doc) return null;
    const { _id, ...rest } = doc;
    return { id: _id, ...rest };
}

// Devuelve todas las tareas. Acepta filtros opcionales que se traducen en una query de MongoDB.

export async function getAll({ completed, search } = {}) {
    const query = {};
    if (completed !== undefined) {
        // req.query llega como string; lo convertimos al booleano que espera MongoDB
        query.completed = completed === 'true';
    }

    if (search) {
        const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escaped, 'i');
        query.$or = [{ title: regex }, { description: regex }];
    }
    const docs = await getDB().collection(COLLECTION).find(query).toArray();
    return docs.map(toTask);
}

// Devuelve una tarea por id, o null si no existe.
export async function getById(id) {
    const doc = await getDB().collection(COLLECTION).findOne({ _id: id });
    return toTask(doc);
}

// Inserta una tarea nueva.
// El router construye el task con campo "id"; hay que renombrarlo a "_id"
// antes de insertar para que sea la clave primaria de MongoDB.
export async function add(task) {
    const { id, ...rest } = task;
    await getDB().collection(COLLECTION).insertOne({ _id: id, ...rest });
}

// Actualiza los campos indicados y devuelve la tarea ya actualizada,
// o null si no se encontró el id.
// returnDocument: 'after' hace que MongoDB devuelva el doc con los cambios aplicados.
// En el driver v5+ findOneAndUpdate devuelve el doc directamente (sin .value).
export async function update(id, fields) {
    const doc = await getDB().collection(COLLECTION).findOneAndUpdate(
        { _id: id },
        { $set: fields },
        { returnDocument: 'after' }
    );
    return toTask(doc);
}

// Elimina una tarea por id.
// Devuelve true si se eliminó, false si no se encontró.
export async function remove(id) {
    const result = await getDB().collection(COLLECTION).deleteOne({ _id: id });
    return result.deletedCount === 1;
}

