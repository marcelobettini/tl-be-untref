import { randomUUID } from 'node:crypto';
import express from 'express';
import { connectDB, getFormattedHistory, saveChatTurn } from './db/database.js';
import { genAI, systemInstructionText, generationConfig } from './prompt/aiConfig.js';

const app = express();
app.use(express.json());

app.post('/chat-support', async (req, res) => {
    const { userQuestion } = req.body;

    if (!userQuestion || userQuestion.trim().length === 0) {
        return res.status(400).json({ success: false, error: "La pregunta del usuario no puede estar vacía." });
    }

    const chatId = req.body.chatId ?? randomUUID();

    try {
        const history = await getFormattedHistory(chatId);

        const response = await genAI.models.generateContent({
            model: 'gemini-2.5-flash-lite',
            systemInstruction: systemInstructionText,
            generationConfig,
            contents: [
                ...history,
                { role: "user", parts: [{ text: userQuestion }] }
            ]
        });

        const chatResponse = response.text;

        await saveChatTurn(chatId, userQuestion, chatResponse);

        return res.status(200).json({
            success: true,
            chatId,
            data: chatResponse
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            error: "Error en el procesamiento",
            errorMessage: error.message
        });
    }
});

app.listen(3000, () => console.log("Servidor corriendo en puerto 3000"));