import { env } from '../config/env.js';

const TOPIC = env.TOPIC;

export const buildSystemPrompt = () =>
  `Eres un asistente experto exclusivamente en ${TOPIC}.\n` +
  `Si la pregunta del usuario NO está relacionada con ${TOPIC}, ` +
  `responde únicamente con el texto exacto: FUERA_DE_TEMA\n` +
  `No agregues ningún otro texto en ese caso.\n` +
  `Si la pregunta SÍ está relacionada con ${TOPIC}, responde de forma clara y precisa.`;

export const isOffTopic = (response) => response.trim() === 'FUERA_DE_TEMA';
