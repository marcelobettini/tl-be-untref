// Implemetaremos un CRUD
// C = Create
// R = Read
// U = Update
// D = Delete

// Resolveremos las rutas relacionadas a frutas, delegando la logica a los controladores para mantener el router limpio y enfocado solo en el enrutamiento.

import { ObjectId } from "mongodb";
import client from "../services/data.js";

export async function getFrutas(req, res) {
  try {
    const db = client.db();
    const collection = db.collection("frutas");
    const frutas = await collection.find({}).toArray();
    res.json(frutas);
  } catch (error) {
    console.error("Error al obtener las frutas:", error);
    res.status(500).json({ status: 500, error: "Error al obtener las frutas" });
  }
}

export async function getFrutaById(req, res) {
  try {
    const { id } = req.params;
    const db = client.db();
    const collection = db.collection("frutas");
    const fruta = await collection.findOne({ _id: new ObjectId(id) });

    if (!fruta) {
      return res
        .status(404)
        .json({ status: 404, error: "Fruta no encontrada" });
    }
    res.json(fruta);
  } catch (error) {
    console.error(`Error al obtener la fruta:`, error);
    res
      .status(500)
      .json({
        status: 500,
        error: "Error al obtener la fruta, id invalido o error de servidor",
      });
  }
}

export async function getFrutaByName(req, res) {
  try {
    const { name } = req.params;
    const db = client.db();
    const collection = db.collection("frutas");
    const frutas = await collection
      .find({ nombre: { $regex: new RegExp(name, "i") } })
      .toArray();
    res.json(frutas);
  } catch (error) {
    console.error(`Error al obtener la fruta.`, error);
    res
      .status(500)
      .json({ status: 500, error: "Error al obtener la fruta por nombre" });
  }
}

export async function getFrutasByPrice(req, res) {
  try {
    const { price } = req.params;
    const db = client.db();
    const collection = db.collection("frutas");
    const frutas = await collection
      .find({ precio: { $gte: parseFloat(price) } })
      .toArray();
    res.json(frutas);
  } catch (error) {
    console.error(`Error al obtener las frutas por precio.`, error);
    res
      .status(500)
      .json({ status: 500, error: "Error al obtener las frutas por precio" });
  }
}

export async function createFruta(req, res) {
  try {
    const frutaData = req.body;
    const db = client.db();
    const collection = db.collection("frutas");
    const result = await collection.insertOne(frutaData);
    res
      .status(201)
      .json({ status: 201, message: "Fruta creada", id: result.insertedId });
  } catch (error) {
    console.error("Error al crear la fruta:", error);
    res.status(500).json({ status: 500, error: "Error al crear la fruta" });
  }
}

export async function updateFruta(req, res) {
  try {
    const { id } = req.params;
    const frutaData = req.body;
    const db = client.db();
    const collection = db.collection("frutas");
    await collection.updateOne({ _id: new ObjectId(id) }, { $set: frutaData });
    res.json({ status: 200, message: "Fruta actualizada" });
  } catch (error) {
    console.error(`Error al actualizar la fruta`, error);
    res
      .status(500)
      .json({ status: 500, error: "Error al actualizar la fruta" });
  }
}

export async function updateFrutaPartially(req, res) {
  try {
    const { id } = req.params;
    const partialData = req.body;
    const db = client.db();
    const collection = db.collection("frutas");
    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: partialData },
    );
    res.json({ message: "Fruta actualizada parcialmente" });
  } catch (error) {
    console.error(`Error al actualizar la fruta:`, error);
    res.status(500).json({ error: "Error al actualizar la fruta" });
  }
}

export async function deleteFruta(req, res) {
  try {
    const { id } = req.params;
    const db = client.db();
    const collection = db.collection("frutas");
    await collection.deleteOne({ _id: new ObjectId(id) });
    res.json({ message: "Fruta eliminada" });
  } catch (error) {
    console.error(`Error al eliminar la fruta:`, error);
    res.status(500).json({ error: "Error al eliminar la fruta" });
  }
}
