// Router de tareas: define la estructura de endpoints del CRUD
import { Router } from "express";
import { getAll, getById, add, update } from "../services/fileStore.js";
const router = Router();

// valores validos para el campo priority
const VALID_PRIORITIES = ["low", "mid", "high"];
// GET /api/v1/tasks
router.get('/', (req, res) => {
    let tasks = getAll();

    const { completed, search } = req.query;
    const isCompleted = completed === "true";
    if (completed !== undefined) {
        tasks = tasks.filter(t => t.completed === isCompleted);
    }
    if (search) {
        const keyword = search.toLowerCase();
        tasks = tasks.filter(t => t.title.toLowerCase().includes(keyword) || t.description.toLowerCase().includes(keyword));
    }
    if (tasks.length) {
        res.json(tasks);
    } else {
        res.status(404).json({ message: "No se encontraron tareas" });
    }
});

// GET /api/v1/tasks/:id
router.get("/:id", (req, res) => {
    const { id } = req.params;
    const task = getById(id);
    if (!task) {
        return res.status(404).json({ message: `No se encontró la tarea con id ${id}` });
    }
    res.json(task);
});

// POST /api/v1/tasks
router.post("/", (req, res) => {
    const { title, description = "", priority = "low" } = req.body;
    if (!title) {
        return res.status(400).json({ message: "El campo title es obligatorio" });
    }
    if (!VALID_PRIORITIES.includes(priority)) {
        return res.status(400).json({ message: `El campo priority debe ser uno de los siguientes valores: ${VALID_PRIORITIES.join(", ")}` });
    }

    const now = new Date().toISOString();
    const newTask = {
        id: crypto.randomUUID(),
        title,
        description,
        priority,
        completed: false,
        createdAt: now, //TimeStamp de creación
        updatedAt: now //TimeStamp de última actualización, inicialmente igual al de creación
    };
    add(newTask);
    res.status(201).json(newTask);
});

// PATCH /api/v1/tasks/:id
router.patch("/:id", (req, res) => {
    const { id } = req.params;
    const task = getById(id);
    if (!task) {
        return res.status(404).json({ message: `No se encontró la tarea con id ${id}` });
    }
    const { title, description, priority, completed } = req.body;
    if (priority && !VALID_PRIORITIES.includes(priority)) {
        return res.status(400).json({ message: `El campo priority debe ser uno de los siguientes valores: ${VALID_PRIORITIES.join(", ")}` });
    }
    // construir el objeto con los campos a actualizar, solo si fueron proporcionados en el body
    const updatedFields = {};
    if (title) updatedFields.title = title;
    if (description) updatedFields.description = description;
    if (priority) updatedFields.priority = priority;
    if (completed) updatedFields.completed = completed;
    updatedFields.updatedAt = new Date().toISOString(); // Actualizamos el timestamp de última actualización

    const updatedTask = update(id, updatedFields);
    res.json(updatedTask);
});

// PATCH /api/v1/tasks/:id/toggle
// Invierte el campo completed (true -> false, false -> true). No necesitamos el body
router.patch("/:id/toggle", (req, res) => {
    const { id } = req.params;
    res.json({
        message: `Se cambiará el campo completed al valor contrario para la tarea con id ${id}, y se guardará en la base de datos`,

    });
});

router.delete("/:id", (req, res) => {
    const { id } = req.params;
    const removed = remove(id);
    if (!removed) return res.status(404).json({ error: 'Task not found' }); // podríamos usar incluso getById
    res.status(204).send(); //no devolvemos nada porque el 204 No Content es un estándar para operaciones de borrado exitosas. Dice "La operación fue exitosa y no hay nada que devolver"
    res.json({ message: `Se eliminará la tarea con id ${id}, y se guardará en la base de datos` });
});



export default router;