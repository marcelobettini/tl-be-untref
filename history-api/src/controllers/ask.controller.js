import * as llmService from '../services/llm.service.js';

export const ask = async (req, res) => {
  const { question } = req.body;
  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    return res.status(400).json({ message: 'La pregunta es requerida.' });
  }

  try {
    const result = await llmService.ask({ question: question.trim() });
    if (result.offTopic) {
      return res.json({ offTopic: true, message: 'La pregunta no corresponde al tópico configurado.' });
    }
    res.json({ answer: result.answer });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Error inesperado.' });
  }
};
