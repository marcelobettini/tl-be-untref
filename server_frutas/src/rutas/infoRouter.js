import { Router } from "express";
const router = Router();
const API_PREFIX = "/api/v1"; // O podrías importarlo si lo exportas desde un archivo de configuración

router.get("/", (req, res) => {
  res.json({
    name: "Frutas API",
    version: "0.0.1",
    endpoints: {
      [`GET    ${API_PREFIX}/frutas`]:
        "Lista todas las frutas (filtra con ?color=rojo|verde|amarillo o ?search=keyword)",
      [`GET    ${API_PREFIX}/frutas/:id`]: "Recupera una fruta por su id",
      [`GET    ${API_PREFIX}/frutas/name/:name`]:
        "Buscar y retorna frutas que contengan el nombre o parte del nombre informado como parámetro",
      [`GET    ${API_PREFIX}/frutas/price/:price`]:
        "Buscar y retorna frutas quetengan el precio informado o un precio superior a este",
      [`POST   ${API_PREFIX}/frutas`]: "Crea una nueva fruta",
      [`PATCH  ${API_PREFIX}/frutas/:id`]: "Actualiza una fruta parcialmente",
      [`PUT    ${API_PREFIX}/frutas/:id`]: "Actualiza una fruta",
      [`DELETE ${API_PREFIX}/frutas/:id`]: "Elimina una fruta",
    },
  });
});

export default router;
