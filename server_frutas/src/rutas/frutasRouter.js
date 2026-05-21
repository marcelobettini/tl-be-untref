// defino las rutas relacionadas a frutas, delegando la logica a los controladores
// para mantener el router limpio y enfocado solo en el enrutamiento.
import express from "express";
import {
  getFrutas,
  getFrutaById,
  getFrutaByName,
  getFrutasByPrice,
  createFruta,
  updateFruta,
  updateFrutaPartially,
  deleteFruta,
} from "../controladores/frutasControlador.js";

const router = express.Router();

router.get("/", getFrutas); // Traerr todas las frutas
router.get("/:id", getFrutaById); // Traer una fruta por su id
router.get("/name/:name", getFrutaByName); // Traer frutas por nombre (con búsqueda parcial e insensible a mayúsculas)
router.get("/price/:price", getFrutasByPrice); // Traer frutas con precio mayor o igual al especificado
router.post("/", createFruta); // POST para creación de nuevas frutas
router.put("/:id", updateFruta); // PUT para actualización completa
router.patch("/:id", updateFrutaPartially); // PATCH para parcial
router.delete("/:id", deleteFruta); // DELETE para eliminar una fruta por su id

export default router;
