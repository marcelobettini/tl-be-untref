import { ObjectId } from "mongodb";
import { getDB } from "../db/mongoClient.js";

// El driver nativo no tiene capa de transformación como Mongoose: _id nunca se renombra solo.

// Helper to validate ObjectId strings
function isValidObjectId(id) {
  return ObjectId.isValid(id);
}
function fmt({ _id, ...rest }) {
  return { id: _id.toString(), ...rest };
}

function col() {
  return getDB().collection("tareas");
}

export async function getAll({ completed, search } = {}) {
  const query = {};
  if (completed !== undefined) query.completed = completed;
  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(escaped, "i");
    query.$or = [{ title: re }, { description: re }];
  }
  return col().find(query).map(fmt).toArray();
}

export async function getById(id) {
  if (!isValidObjectId(id)) {
    return null;
  }
  const doc = await col().findOne({ _id: new ObjectId(id) });
  return doc ? fmt(doc) : null;
}

export async function add(fields) {
  // No ID validation needed here as MongoDB generates it
  // for new documents.

  const { insertedId } = await col().insertOne({ ...fields });
  return { id: insertedId.toString(), ...fields };
}

export async function update(id, fields) {
  if (!isValidObjectId(id)) {
    return null;
  }
  const doc = await col().findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: fields },
    { returnDocument: "after" },
  );
  return doc ? fmt(doc) : null;
}

export async function remove(id) {
  if (!isValidObjectId(id)) {
    return false;
  }
  const { deletedCount } = await col().deleteOne({ _id: new ObjectId(id) });
  return deletedCount === 1;
}

export async function toggle(id) {
  if (!isValidObjectId(id)) {
    return null;
  }
  const doc = await col().findOneAndUpdate(
    { _id: new ObjectId(id) },
    [
      {
        $set: {
          completed: { $not: ["$completed"] },
          updatedAt: new Date().toISOString(),
        },
      },
    ],
    { returnDocument: "after" },
  );
  return doc ? fmt(doc) : null;
}
