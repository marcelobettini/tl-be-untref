/**
 * Los controladores se encargan de la comunicación con el cliente (HTTP).
 * Delegan la persistencia de datos al Modelo.
 */
import * as frutaModel from "../modelos/frutasModelo.js";

export async function getFrutas(req, res) {
  try {
    const frutas = await frutaModel.getAllFrutas();
    res.json(frutas);
  } catch (error) {
    console.error("Error al obtener las frutas:", error);
    res.status(500).json({ status: 500, error: "Error al obtener las frutas" });
  }
}

export async function getFrutaById(req, res) {
  try {
    const { id } = req.params;
    const fruta = await frutaModel.getFrutaById(id);

    if (!fruta) {
      return res
        .status(404)
        .json({ status: 404, error: "Fruta no encontrada" });
    }
    res.json(fruta);
  } catch (error) {
    console.error(`Error al obtener la fruta:`, error);
    res.status(500).json({
      status: 500,
      error: "Error al obtener la fruta, id invalido o error de servidor",
    });
  }
}

export async function getFrutaByName(req, res) {
  try {
    const { name } = req.params;
    const frutas = await frutaModel.getFrutasByName(name);
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
    const frutas = await frutaModel.getFrutasByPrice(price);
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
    const insertedId = await frutaModel.createFruta(frutaData);
    res
      .status(201)
      .json({ status: 201, message: "Fruta creada", id: insertedId });
  } catch (error) {
    console.error("Error al crear la fruta:", error);
    res.status(500).json({ status: 500, error: "Error al crear la fruta" });
  }
}

export async function updateFruta(req, res) {
  try {
    const { id } = req.params;
    const frutaData = req.body;
    await frutaModel.updateFruta(id, frutaData);
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
    await frutaModel.updateFruta(id, partialData);
    res.json({ message: "Fruta actualizada parcialmente" });
  } catch (error) {
    console.error(`Error al actualizar la fruta:`, error);
    res.status(500).json({ error: "Error al actualizar la fruta" });
  }
}

export async function deleteFruta(req, res) {
  try {
    const { id } = req.params;
    await frutaModel.deleteFruta(id);
    res.json({ message: "Fruta eliminada" });
  } catch (error) {
    console.error(`Error al eliminar la fruta:`, error);
    res.status(500).json({ error: "Error al eliminar la fruta" });
  }
}
