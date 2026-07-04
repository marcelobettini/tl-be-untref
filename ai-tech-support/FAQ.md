# FAQ — AI Tech Support

## ¿Qué hace esta aplicación?

Es un servidor de soporte técnico conversacional. Recibe una pregunta por HTTP, se la envía al modelo de lenguaje Gemini de Google, y devuelve una respuesta breve y técnica. Cada conversación queda guardada en una base de datos para que el modelo recuerde lo que se dijo antes.

---

## Flujo completo de una solicitud

```
Cliente (curl / frontend / Postman)
        │
        │  POST /chat-support
        │  { chatId: "abc-123", userQuestion: "¿Cómo cambio un fusible?" }
        ▼
┌─────────────────────────────────────┐
│             index.js                │
│  1. Valida que userQuestion exista  │
│  2. Si no hay chatId, genera uno    │
│     nuevo con randomUUID()          │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│          db/database.js             │
│  getFormattedHistory(chatId)        │
│  Busca en MongoDB todos los turnos  │
│  anteriores de esa conversación y   │
│  los convierte al formato que       │
│  entiende Gemini                    │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│         prompt/aiConfig.js          │
│  + index.js                         │
│  Arma el mensaje completo:          │
│   - instrucción del sistema         │
│   - historial anterior              │
│   - nueva pregunta del usuario      │
│  Lo envía a gemini-2.5-flash-lite   │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│          db/database.js             │
│  saveChatTurn(chatId, pregunta,     │
│               respuesta)            │
│  Guarda el turno nuevo en MongoDB   │
└────────────┬────────────────────────┘
             │
             ▼
        Respuesta HTTP 200
        { success: true, chatId: "abc-123", data: "1. Apagá el tablero..." }
```

---

## Preguntas frecuentes

### Sobre el proyecto en general

**¿Qué tecnologías usa el proyecto?**
- **Node.js** — entorno que permite ejecutar JavaScript en el servidor.
- **Express** — librería que facilita crear servidores HTTP en Node.js.
- **MongoDB** — base de datos NoSQL donde se guarda el historial de conversaciones.
- **@google/genai** — SDK oficial de Google para usar la API de Gemini desde JavaScript.

---

**¿Por qué el proyecto usa `"type": "module"` en el package.json?**
Habilita la sintaxis moderna de JavaScript (`import`/`export`) en lugar de la sintaxis antigua (`require`). Es la forma estándar actual de escribir módulos en Node.js.

---

**¿Cómo se arranca el servidor?**
```bash
npm run dev
```
El flag `--watch` hace que Node.js reinicie el servidor automáticamente cada vez que guardás un archivo, sin necesidad de detenerlo manualmente. El flag `--env-file=.env` carga las variables de entorno desde el archivo `.env`.

---

### Sobre el archivo `.env`

**¿Por qué hay un `.env` y un `env.modelo`?**
`.env` contiene los valores reales (claves de API, credenciales de base de datos) y **nunca debe subirse a Git**. `env.modelo` es una plantilla sin valores reales que sí se puede compartir, para que cualquier desarrollador sepa qué variables necesita definir.

---

**¿Qué variable necesito configurar para conectarme a Gemini?**
`GEMINI_API_KEY`. Se obtiene desde [Google AI Studio](https://aistudio.google.com/). El archivo `env.modelo` la llama `GOOGLE_API_KEY` por error histórico; el código usa `GEMINI_API_KEY`.

---

**¿Qué es `MONGODB_CS`?**
Es el *connection string* de MongoDB Atlas: una URL que contiene el usuario, contraseña y dirección del servidor de base de datos. El formato es:
```
mongodb+srv://usuario:contraseña@cluster.mongodb.net/
```

---

### Sobre el endpoint

**¿Cómo se usa el endpoint?**
```bash
# Primera vez (sin chatId)
curl -X POST http://localhost:3000/chat-support \
  -H "Content-Type: application/json" \
  -d '{"userQuestion": "cómo cambio un fusible"}'

# Respuesta:
# { "success": true, "chatId": "550e8400-e29b-...", "data": "1. Apagá el tablero..." }

# Continuación de la misma conversación
curl -X POST http://localhost:3000/chat-support \
  -H "Content-Type: application/json" \
  -d '{"chatId": "550e8400-e29b-...", "userQuestion": "y si no tengo fusibles de repuesto?"}'
```

---

**¿Qué es el `chatId`?**
Es un identificador de conversación. Funciona como el "número de hilo" de un chat: todos los mensajes que compartan el mismo `chatId` forman parte de la misma conversación y el modelo tiene acceso a ese historial.

Si no enviás un `chatId`, el servidor genera uno automáticamente y lo devuelve en la respuesta. Guardalo para usarlo en los turnos siguientes.

---

**¿Qué pasa si mando el mismo `chatId` dos veces?**
El servidor lee todo el historial previo de esa conversación antes de llamar a Gemini, por lo que el modelo "recuerda" los turnos anteriores y puede dar respuestas contextuales.

---

### Sobre Gemini y la instrucción del sistema

**¿Qué es la "instrucción del sistema" (`systemInstruction`)?**
Es un texto que se le da al modelo *antes* de cualquier mensaje del usuario para definir su comportamiento. En este proyecto le indica a Gemini que actúe como un manual técnico: respuestas directas, sin saludos, sin frases de cortesía, estilo imperativo.

---

**¿Por qué el modelo a veces da respuestas muy cortas?**
La variable `MAX_OUTPUT_TOKENS` (por defecto `300`) limita la longitud de cada respuesta. Podés aumentarla en el `.env` si necesitás respuestas más largas.

---

**¿Qué controla `TEMPERATURE`?**
La "temperatura" es un número entre `0` y `1` que regula qué tan creativa o determinista es la respuesta del modelo. Un valor de `0.1` (el default del proyecto) hace que las respuestas sean casi siempre iguales ante la misma pregunta, lo cual es ideal para soporte técnico donde se busca consistencia.

---

### Sobre la base de datos

**¿Dónde se guarda el historial?**
En MongoDB Atlas, en la base de datos `AIChat`, colección `soporte_history_detail`. Cada documento tiene esta forma:
```json
{
  "chatId": "550e8400-e29b-41d4-a716-446655440000",
  "datetime": 1777682305598,
  "userQuestion": "cómo cambio un fusible",
  "chatResponse": "1. Apagá el tablero eléctrico..."
}
```

---

**¿Por qué el historial se recupera ordenado por `datetime: 1`?**
El `1` indica orden ascendente (del más viejo al más nuevo). Es importante que el historial esté en orden cronológico porque así el modelo entiende la conversación correctamente: primero lo que se dijo antes, último lo más reciente.

---

**¿La conexión a MongoDB se abre una vez o en cada request?**
Una sola vez. La función `connectDB()` guarda la conexión en una variable (`db`) y la reutiliza en llamadas posteriores. Esto evita abrir y cerrar miles de conexiones innecesarias.
