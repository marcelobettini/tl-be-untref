# THE ORACLE

Ejercicio de backend que expone un único endpoint respaldado por la API de Gemini de Google.

- **Stack:** Node.js (`node:test` nativo), Express 5, `@google/generative-ai` (SDK oficial).
- **Sistema de módulos:** ESM, aislado en archivos `.mjs` para no colisionar con los archivos CommonJS de este repo (`cookies/`, `server01/`, etc.).
- **Rama de trabajo:** `ejercicios` de `pgsonic/tl-be-untref`.

El enunciado original del ejercicio está en [`IDEA.md`](./IDEA.md).

---

## Instalación

```bash
# desde la raíz del repo
npm install
cp the_oracle/.env.example .env       # después editá .env y poné tu GEMINI_API_KEY
```

Variables de entorno (ver `the_oracle/.env.example`):

| Variable | Default | Notas |
| --- | --- | --- |
| `GEMINI_API_KEY` | _(obligatoria)_ | Conseguila en https://aistudio.google.com/apikey |
| `GEMINI_MODEL` | `gemini-flash-latest` | Cualquier nombre de modelo Gemini |
| `PORT` | `3000` | Puerto HTTP |

---

## Ejecución

```bash
npm run start:oracle        # arranca el server
```

Después:

```bash
# health probe
curl http://127.0.0.1:3000/health
# -> {"status":"ok","service":"the-oracle"}

# preguntale algo a THE ORACLE
curl -X POST http://127.0.0.1:3000/generate-content \
     -H 'Content-Type: application/json' \
     -d '{"question":"¿Cuál es la capital de Francia?"}'
# -> {"text":"La capital de Francia es París.","model":"gemini-flash-latest"}
```

---

## API

### `POST /generate-content`

**Cuerpo del request** (JSON):

```json
{ "question": "string, 1..1000 caracteres" }
```

**Cuerpo de la respuesta 200 OK**:

```json
{ "text": "string", "model": "string" }
```

**Respuestas de error** (siempre `{ "error": { "status": <int>, "message": <string> } }`):

| Status | Significado | Causa común |
| --- | --- | --- |
| `400` | Bad request | Cuerpo faltante, `question` faltante/vacía/no-string/mayor a 1000 caracteres |
| `401` | Unauthorized | `GEMINI_API_KEY` inválida o revocada |
| `403` | Forbidden | La API key no tiene permiso para el modelo pedido |
| `404` | Not found | El nombre del modelo no existe |
| `408` | Request timeout | Timeout del upstream de Gemini |
| `429` | Too many requests | Cuota o rate limit alcanzado |
| `500` | Internal server error | `GEMINI_API_KEY` no está configurada; o cualquier error inesperado |
| `502` | Upstream service unavailable | El upstream de Gemini devolvió un error sin `reason` reconocida |
| `503` | Service temporarily unavailable | Gemini está temporalmente caído |

**Contrato de no-leak:** el cuerpo de la respuesta nunca contiene campos del SDK de Gemini
(`API_KEY_INVALID`, `googleapis.com`, `status`, `code`, stack traces,
ni ningún otro detalle del upstream). La causa interna se loguea server-side
para debugging, nunca se devuelve al cliente.

---

## Estructura del proyecto

```
the_oracle/
├── IDEA.md                            # enunciado original del ejercicio
├── README.md                          # este archivo
├── .env.example                       # template de variables de entorno
├── .gitignore                         # ignores locales
├── server.mjs                         # entry point, conecta rutas + error handler
├── src/
│   ├── config.mjs                     # constantes centralizadas (DEFAULT_MODEL, etc.)
│   ├── errors/
│   │   └── AppError.mjs               # error tipado con statusCode + cause
│   ├── services/
│   │   └── gemini.service.mjs         # askGemini(prompt, deps?) async
│   ├── middlewares/
│   │   ├── validatePrompt.mjs         # validación del body -> 400 si está mal
│   │   └── errorHandler.mjs           # error final -> respuesta HTTP segura
│   └── routes/
│       └── generateContent.routes.mjs # POST /generate-content
└── tests/
    ├── gemini.service.test.mjs        # 5 tests unitarios
    ├── generateContent.routes.test.mjs # 7 tests de integración
    └── errorHandler.test.mjs          # 12 tests unitarios
```

---

## Tests

```bash
npm run test:oracle
```

Los 24 tests corren con el runner nativo `node:test`. Los mocks usan inyección
de dependencias (no hacen falta loader hooks). **No se necesita** una `GEMINI_API_KEY`
real para correr la suite de tests.

---

## Notas de diseño

### ¿Por qué ESM en `.mjs` y no `"type": "module"` global?
Este repo tiene varios archivos CommonJS (`cookies/index.js`, `server01/index.js`,
`server03/index.js`, etc.). Poner `"type": "module"` en el `package.json` raíz
los rompería en la próxima corrida. Mantener el feature nuevo en archivos
`.mjs` hace que el cambio sea aditivo y reversible.

### ¿Por qué un `AppError` tipado en lugar de tirar `Error` plain?
- Permite al service señalizar "esto es un 400, no un 500" sin leakear detalles.
- Carga el error crudo del SDK en `cause` (sintaxis ES2022), así el error
  handler puede refinar el status code inspeccionando los detalles del upstream
  sin exponerlos jamás al cliente.
- Distingue el `kind` del error (`validation`, `config`, `gemini`, `app`)
  para el logging interno.

### ¿Por qué el error handler siempre toma el safeMessage de una tabla?
Si el service o el SDK proveen un `safeMessage` custom, ese mensaje se trata
como interno y nunca se devuelve. Solo se envía la tabla de mapeo
(`{401: 'Unauthorized', 429: 'Too many requests', ...}`). Esta es la garantía
de no-leak del punto 7 de IDEA.md.

### ¿Por qué la `reason` semántica le gana al HTTP status en el mapeo?
Cuando `GEMINI_API_KEY` es inválida, el upstream de Gemini devuelve HTTP 400
*con* una `reason: API_KEY_INVALID` estructurada. Devolver 400 sería
semánticamente incorrecto: el cliente debería ver "problema de auth, arreglá tu key",
no "tu request estaba mal". El error handler prioriza la `reason` estructurada
sobre el HTTP status crudo.

---

## Cómo se construyó

El feature se desarrolló a través de 5 branches originales, cada uno mergeado a
`ejercicios` con `--no-ff` y pusheado al remoto. Después se agregaron fixes
(upgrade de modelo, fix de `dotenv` para el path del `.env`) y un refactor
(centralización de la config en `src/config.mjs`):

```
*   108ea7f Merge refactor/centralize-config into ejercicios
|\
| * b7bf067 refactor(the-oracle): centralize config in src/config.mjs
|/
*   b19bbaf fix(the-oracle): change default model to gemini-flash-latest
*   3571ff0 Merge fix/model-default-2.0-flash into ejercicios
|\
| * 15431d0 fix(the-oracle): load .env from the_oracle/ explicitly via __dirname
| * 2865973 fix(the-oracle): upgrade default model from gemini-1.5-flash to gemini-2.0-flash
|/
*   dbdf38f Merge feat/postman-collection into ejercicios
|\
| * ccd3b92 feat(the-oracle): add Postman collection for endpoint testing
|/
*   6e8948f Merge feat/the-oracle-docs into ejercicios
|\
| * 7651cc8 docs(the-oracle): add README with setup, API reference, design notes
|/
*   984fc62 Merge feat/the-oracle-error-handler into ejercicios
|\
| * 364001d feat(the-oracle): error handler with no-leak Gemini error mapping
|/
*   5bf8aa2 Merge feat/the-oracle-endpoint into ejercicios
|\
| * bbe0518 feat(the-oracle): POST /generate-content endpoint with validation
|/
*   a95fd43 Merge feat/the-oracle-gemini-service into ejercicios
|\
| * 1c7ff87 feat(the-oracle): gemini service with typed AppError
|/
*   d77264d Merge feat/the-oracle-scaffold into ejercicios
|\
| * c830462 feat(the-oracle): scaffold Express server with /health probe
|/
* 460b342 (commit previo en ejercicios)
```
