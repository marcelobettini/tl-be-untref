// IMPORTS
import express from "express"
import { loadEnvFile } from "node:process" // ENV FILE LOADER NATIVO DE NODEJS
import { generateContentFromGemini } from "./services/geminiService.js"

// VARIABLES Y CONSTANTES
const app = express()
const PORT = process.env.PORT || 3000

// MIDDLEWARE
loadEnvFile()   
app.use(express.json())

// API
app.post("/ask-questions", async (req, res)=> {
    try {
        const { prompt } = req.body

        if (!prompt.trim()) {
            return res.status(400).json({ error: "El campo 'prompt' es obligatorio", })
        }
        
        const result = await generateContentFromGemini(prompt.trim())

        return res.status(result.status).json({
            success: true,
            status: result.status,
            data: result.data.text,
        })

    } catch (error) { // ⚠️ Ocultamos el error real
        console.error("Internal server error:", error)

        return res.status(500).json({
            success: false,
            message: "Error del servidor. Intenta nuevamente en unos segundos.",
        })
    }
})

// EJECUTAR
app.listen(PORT, () => console.log(`🚀 PROMPT ENGINEERING is running on port ${PORT}`) )