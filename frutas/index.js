import express from 'express';
import { MongoClient } from 'mongodb';
const app = express();
app.use(express.json());
const PORT = process.env.PORT ?? 3003;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.log("MONGO_URI no existe en archivo .env");
    process.exit(1);
}

const client = new MongoClient(MONGO_URI);
await client.connect();
const db = client.db();
const frutas = db.collection("frutas");
console.log("Conectado a la base de datos");


app.get("/frutas/nombre/:nombre", async (req, res) => {
    const regex = new RegExp(req.params.nombre, 'i');
    const result = await frutas.find({ nombre: regex }).toArray();
    if (!result.length) {
        return res.status(404).json({ mensaje: "te quedaste con hambre gato" });
    }
    res.json(result);
});
app.get("/frutas/precio/:precio", async (req, res) => {
    const price = Number(req.params.precio);
    if (isNaN(price)) {
        return res.status(400).json({ mensaje: "Le pifiaste con el número fiera" });
    }

    const result = await frutas.find({ importe: { $gte: price } }).toArray();
    if (!result.length) {
        return res.status(404).json({ mensaje: "Ninguna en ese rango de precios" });
    }
    res.json(result);
});

app.post("/frutas", async (req, res) => {
    const nuevaFruta = req.body;
    if (nuevaFruta === undefined) {
        return res.status(400).json({ mensaje: "Error en el formato de los datos" });
    }
    frutas.insertOne(nuevaFruta)
        .then(() => {
            res.status(201).json(nuevaFruta);
        })
        .catch((err => {
            res.status(500).json({ mensaje: "Error al grabar en DB." });
        }));

});

app.put("/frutas/:id", async (req, res) => {
    const { id } = req.params;
    const nuevosDatos = req.body;
    if (!nuevosDatos) {
        return res.status(400).json({ mensaje: "Error en el formato de los datos" });
    }
    frutas.updateOne({ id: Number(id) }, { $set: nuevosDatos })
        .then(() => {
            res.status(200).json(nuevosDatos);
        })
        .catch(() => {
            res.status(500).json({ mensaje: "Error al grabar en DB." });
        });


});

app.use((req, res) => {
    res.status(404).json({ message: "Comprate una brújula bro" });
});
app.listen(PORT, () => console.log(`Servidor escucha en puerto 3003`));