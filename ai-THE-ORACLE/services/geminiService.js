import { GoogleGenAI } from "@google/genai";
import { loadEnvFile } from "node:process";

loadEnvFile();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Genera contenido usando Gemini
 * @param {string} prompt
 * @returns {Promise<{status: number, data: any}>}
 */
export async function generateContentFromGemini(prompt) {
    try {

        const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            system: "Responde de manera concisa y clara. Usa emojis, saltos de línea y viñetas cuando sea necesario para que el texto sea fácil de leer. No inventes información. Si no sabes la respuesta, di 'No sé'.",
            contents: prompt,
        });

        return {
            status: 200,
            data: {
                text: response.text,
            },
        };
    } catch (error) {
        // Log interno (para debugging)
        console.error("Gemini API error:", error);

        return {
            status: error?.status || 500,
            data: null,
        };
    }
}