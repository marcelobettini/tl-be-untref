// Módulo de persistencia: maneja la lectura y escritura de datos en un archivo JSON.
// Mantiene una copia en memoria que se sincroniza con el archivo después de cada operación de escritura.
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE_PATH = join(__dirname, "../data/tasks.json");


// Copia en memoria de las tareas
let tasks = [];

// Lee el archivo JSON y carga las tareas en memoria
function load() {
    try {
        const raw = readFileSync(FILE_PATH, "utf-8");
        tasks = JSON.parse(raw);

    } catch (err) {
        if (err.code !== "ENOENT") throw err;
        tasks = [];
        save(); // Si el archivo no existe, lo creamos con un array vacío
    }
}

function save() {
    writeFileSync(FILE_PATH, JSON.stringify(tasks, null, 2), "utf-8");
}

// Esto podemos discutirlo
function persist() {
    save();
    load();
}

function getAll() {
    return tasks;
}

function getById(id) {
    return tasks.find(t => t.id === id) || null;
}

function add(newTask) {
    tasks.push(newTask);
    persist();
}


load();

export { getAll, persist, getById, add };

