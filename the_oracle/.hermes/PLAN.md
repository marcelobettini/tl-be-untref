# THE ORACLE — Plan de implementación

## Contexto
- Repo: `tl-be-untref` (rama de trabajo: `ejercicios`).
- Directorio de la feature: `tl-be-untref/the_oracle/` (untracked, no es sub-repo).
- Enunciado: `tl-be-untref/the_oracle/IDEA.md` (8 puntos).
- Perfil del alumno: Express visto en clase, ya tiene `express` y `dotenv` en el `package.json` raíz.
- Stack confirmado con el usuario:
  - SDK: `@google/generative-ai` (oficial).
  - Errores: granularidad 400/401/403/404/408/429/500/502/503. Códigos Gemini NUNCA al cliente.
  - Git: una rama por feature, merge `--no-ff` a `ejercicios`, push por feature, docs al cierre.
  - Limpieza: ya hecha (carpeta huérfana `the-oracle/` eliminada, no se tocó historial).

## Convenciones del repo padre
- No pisar la rama `ejercicios` con cambios ajenos al ejercicio.
- `node_modules` y `.env` ya ignorados en `.gitignore` raíz.
- `package.json` raíz ya tiene `express` + `dotenv`. La feature agrega `@google/generative-ai` ahí mismo (no sub-`package.json`) para mantener la coherencia con el resto del repo.

## Estructura final esperada
```
tl-be-untref/
├── package.json              (modificado: +@google/generative-ai, +scripts)
├── the_oracle/
│   ├── IDEA.md               (existente, sin tocar)
│   ├── README.md             (doc del feature, al cierre)
│   ├── .env.example          (template sin secretos)
│   ├── .gitignore            (local de la feature)
│   ├── server.js             (entry point Express, puerto 3000)
│   ├── src/
│   │   ├── routes/
│   │   │   └── generateContent.routes.js
│   │   ├── services/
│   │   │   └── gemini.service.js          (función async pura)
│   │   ├── middlewares/
│   │   │   ├── errorHandler.js            (mapeo a estados REST)
│   │   │   └── validatePrompt.js          (zod, 400 si inválido)
│   │   └── errors/
│   │       └── AppError.js                (error tipado con statusCode)
│   └── tests/
│       ├── generateContent.test.js
│       └── errorMapping.test.js
```

## Breakdown por feature (1 rama = 1 feature)

### F1 — feat/the-oracle-scaffold
- Crea estructura de directorios.
- Crea `server.js` mínimo con `app.get('/health')` 200 OK.
- Crea `.env.example`, `.gitignore` local.
- Modifica `package.json` raíz: agrega `@google/generative-ai`, script `"start:oracle": "node the_oracle/server.js"`.
- `npm install` desde raíz.
- **Verificación:** `node the_oracle/server.js` arranca y `curl /health` → 200.

### F2 — feat/the-oracle-gemini-service
- `src/services/gemini.service.js`: función `async function askGemini(prompt)` que llama a `model.generateContent(prompt)`.
- Inicializa el SDK con `process.env.GEMINI_API_KEY`.
- Propaga `AppError` tipado (sin exponer código Gemini) — el mapeo fino lo hace el middleware.
- **Verificación:** test unitario con mock del SDK que valide la firma del error.

### F3 — feat/the-oracle-endpoint
- `src/routes/generateContent.routes.js`: `POST /generate-content` con body `{ question: string }`.
- `src/middlewares/validatePrompt.js`: valida con zod (no vacío, string, max 1000 chars). Si falla → 400.
- Conecta con `gemini.service.js` dentro de try/catch.
- **Verificación:** test de integración con supertest contra el endpoint.

### F4 — feat/the-oracle-error-handler
- `src/errors/AppError.js`: clase con `statusCode` y `safeMessage`.
- `src/middlewares/errorHandler.js`: middleware final que:
  - Si error tiene `statusCode` propio → lo respeta.
  - Si viene del SDK de Gemini → mapea por keyword (`API_KEY_INVALID` → 401, `PERMISSION_DENIED` → 403, `NOT_FOUND` → 404, `RESOURCE_EXHAUSTED` → 429, `DEADLINE_EXCEEDED` → 408, `UNAVAILABLE` → 503, default → 502).
  - **Nunca** expone `error.status`, `error.code`, ni stack de Gemini al cliente.
  - Loguea el error real internamente con timestamp.
- **Verificación:** test que cubre los 8 mapeos y confirma que la respuesta NUNCA contiene códigos Gemini.

### F5 — feat/the-oracle-docs (al cierre, antes del último merge)
- `the_oracle/README.md`: setup, uso, ejemplos curl, tabla de errores.
- Captura del flujo completo: `git log --oneline --graph` de las 4 features.

## Estrategia de merge
1. `feat/scaffold` → `ejercicios` (--no-ff) → push
2. `feat/gemini-service` → `ejercicios` (--no-ff) → push
3. `feat/endpoint` → `ejercicios` (--no-ff) → push
4. `feat/error-handler` → `ejercicios` (--no-ff) → push
5. `feat/docs` → `ejercicios` (--no-ff) → push final

## Variables de entorno
- `GEMINI_API_KEY` (en `.env` raíz, ignorado).
- `PORT` (default 3000).
- `GEMINI_MODEL` (default `gemini-1.5-flash` — más barato para el ejercicio, no requiere aprobación de 2.0).

## Pruebas
- Vitest o Jest nativo de Node 22. Decisión pendiente al arrancar F1.
- Cobertura mínima: 1 test por estado HTTP posible del endpoint.

## Riesgos identificados
- **API key inválida durante el desarrollo:** si no tenés una key válida, el endpoint se testea con mock del SDK. Avisame antes de F2 si tenés key propia o si vamos con mock puro.
- **`tl-be-untref` está 1 commit adelante de `origin/ejercicios`:** no toco eso. Si querés pushear mis merges, vos decidís cuándo.
- **Push remoto:** el remote del repo es el de `marcelobettini` (no es tuyo). El push lo dejo en pausa salvo que confirmes que tenés permisos o que querés fork.
