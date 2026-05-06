// Router de tareas: define la estructura de endpoints del CRUD
import { Router } from "express";
const router = Router();

// GET /api/v1/tasks
router.get('/', (req, res) => {
    res.json({ message: "Se listarán todas las tareas. Soportará filtros (?completed=true|false o ?search=keyword)" });
});

// GET /api/v1/tasks/:id
router.get("/:id", (req, res) => {
    const { id } = req.params;
    res.json({ message: `Se mostrará la tarea con el id ${id}` });
});

// POST /api/v1/tasks
router.post("/", (req, res) => {
    console.log(req.body);
    res.status(200).json({
        message: "Se creará una tarea con los datos del body",
        data: req.body
    });
});

// PATCH /api/v1/tasks/:id
router.patch("/:id", (req, res) => {
    const { id } = req.params;
    res.json({
        message: `Se actualizará parcialmente la tarea con id ${id}`,
        data: req.body
    });
});

// PATCH /api/v1/tasks/:id/toggle
// Invierte el campo completed (true -> false, false -> true). No necesitamos el body
router.patch("/:id/toggle", (req, res) => {
    const { id } = req.params;
    res.json({
        message: `Se cambiará el campo completed al valor contrario para la tarea con id ${id}`,

    });
});

router.delete("/:id", (req, res) => {
    const { id } = req.params;
    res.json({ message: `Se eliminará la tarea con id ${id}` });
});



export default router;