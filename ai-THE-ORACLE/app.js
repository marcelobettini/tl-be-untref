import express from "express";
import { loadEnvFile } from "node:process";
import { generateContentFromGemini } from "./services/geminiService.js";

const app = express();
const PORT = process.env.PORT || 3000;

// MIDDLEWARE
loadEnvFile();
app.use(express.json());

// ENDPOINT
app.post("/create-content", async (req, res) => {
    try {
        const { prompt } = req.body;

        console.clear();
        console.log(prompt);

        if (!prompt.trim()) {
            return res.status(400).json({
                error: "El campo 'prompt' es obligatorio",
            });
        }

        const result = await generateContentFromGemini(prompt);
        console.log(result);

        return res.status(result.status).json({
            success: true,
            status: result.status,
            data: result.data,
        });

    } catch (error) { // ⚠️ Ocultamos el error real
        console.error("Internal server error:", error);

        return res.status(500).json({
            success: false,
            message: "Error interno del servidor",
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 THE ORACLE running on port ${PORT}`);
});