import { instrucciones } from "../systemInstructions/prompt.js"
import { GoogleGenAI } from "@google/genai"
import { loadEnvFile } from "node:process"

loadEnvFile()

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, })

export async function generateContentFromGemini(prompt) {
    try {

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", // Otros modelos: gemini-3.0-flash // gemini-3.1-flash-lite
            contents: prompt.trim(),
            config: {
                    systemInstruction: instrucciones,
            }
        })

        return {
            status: 200,
            data: {
                text: response.text,
            },
        }

    } catch (error) {
        // Log interno (para debugging)
        console.error("Gemini API error:", error)

        return {
            status: error?.status || 500,
            data: null,
        }
    }
}