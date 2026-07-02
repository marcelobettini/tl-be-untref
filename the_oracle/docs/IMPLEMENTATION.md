# 📋 Bitácora de implementación — the_oracle

> Un párrafo por feature para poder retomar el trabajo
> desde cualquier punto sin perder el hilo.

## Setup — feat/the-oracle-scaffold

Express server con `GET /health`. Decisión clave: usar `.mjs` en vez de
`"type": "module"` global en el `package.json` raíz, porque el repo padre
tiene archivos CommonJS (`cookies/`, `server01/`, `server03/`) que se
romperían. Aislamiento ESM sin tocar el resto del repo.
Se agregó `@google/generative-ai` y scripts `start:oracle` / `test:oracle`.

## F2 — feat/the-oracle-gemini-service

`AppError` tipado (statusCode, safeMessage, cause via ES2022).
`askGemini(prompt, deps?)` con inyección de dependencias para tests
(sin loader hooks). Decisión híbrida: el service lanza AppError 502 con
la `cause` del SDK original adjuntada, y el errorHandler (F4) refina
el statusCode mirando keywords / .status del SDK.
5/5 tests pasando con `node:test` nativo.

## F3 — feat/the-oracle-endpoint

`POST /generate-content` con `validatePrompt` middleware (zod-style manual
para evitar dependencia extra). Body: `{ question: string, 1..1000 chars }`.
`buildGenerateContentRouter(deps)` exportado para DI en tests.
7/7 tests integración con supertest. Smoke test con dummy key reveló
que el SDK filtra `API_KEY_INVALID` en `errorDetails` (JSON string) — F4
lo caza con regex.

## F4 — feat/the-oracle-error-handler

Middleware final con mapeo fino de 9 status codes (400/401/403/404/408/429/
500/502/503). Precedencia: `errorDetails[].reason` (Google RPC) > keyword
en `cause.message` > `cause.status` (HTTP upstream) > AppError.statusCode.
**La reason semántica siempre gana sobre el HTTP status** — descubierto
porque Gemini upstream devuelve 400 cuando API key es inválida, no 401.
Contrato de no-leak: `safeMessage` SIEMPRE viene de tabla genérica por
statusCode, nunca del service. 12/12 tests, smoke test confirmó que
dummy key → 401 con body limpio (sin `API_KEY_INVALID` ni `googleapis.com`).

## F5 — feat/the-oracle-docs

`the_oracle/README.md` con setup, env vars, API reference, project layout,
test instructions, design notes (ESM isolation, typed AppError, reason-over-
HTTP precedence), git graph de las features. Idioma: español.

## F6 — feat/postman-collection

`the_oracle/postman/the_oracle.postman_collection.json` (Postman v2.1)
con 7 requests cubriendo los 9 estados HTTP y asserts de no-leak en cada
uno. Environment con `GEMINI_API_KEY` (tipo secret) y `baseUrl`.
README con instrucciones de import y comandos newman CLI.
6/6 casos verificados con curl antes de commitear.

## fix/dotenv-path-explicit

`dotenv/config` default a `process.cwd()`, que es la raíz del repo cuando
se corre `npm run start:oracle` desde ahí. Pero el `.env` real está en
`the_oracle/.env`. Fix: anclar el path a la ubicación del `server.mjs`
vía `import.meta.url`. Ahora el comando funciona igual desde cualquier CWD.

## fix/model-default-2.0-flash

`gemini-1.5-flash` ya no está disponible en la API v1beta (404 NOT_FOUND).
Upgrade a `gemini-2.0-flash` (que es lo que usa el proyecto hermano
`history-api/` en este mismo repo).

## fix/model-default-gemini-flash-latest

`gemini-2.0-flash` da 429 con `limit: 0` en el free tier de la key de Pablo.
Listando los 50 modelos disponibles, `gemini-flash-latest` (alias al
mejor Flash) SÍ está y NO está rate-limited. Cambio del default al alias.
Verificado end-to-end con key real: `{"text":"Four","model":"gemini-flash-latest"}`.

## refactor/centralize-config

Default del modelo, puerto, y max prompt length estaban hardcodeados
en 5+ archivos. Centralizado en `src/config.mjs` con named exports
(`DEFAULT_MODEL`, `DEFAULT_PORT`, `PROMPT_MAX_LENGTH`). Service, middlewares,
tests y `server.mjs` ahora importan desde ahí. Cambio de valor = 1 línea.

## docs/translate-readme-to-spanish

README principal y el de Postman traducidos al español (consistencia
con el resto del proyecto: commits, comentarios, IDEA.md). Lo que queda
en inglés: nombres de campos de API, status HTTP estándar, scripts de
tests Postman, mensajes de error REST — convenciones universales.

## fix/intro-js-add-package-json

Defensa preventiva. `intro-js/` no tenía `package.json` propio y sus
archivos ya usan `import` (ESM). Si alguien futuro pone `"type": "module"`
en la raíz, `intro-js/` queda bien; si pone `"type": "commonjs"` se
rompe. Solución: package.json mínimo en `intro-js/` con `type: module`
y `private: true`. Sin tocar los archivos del profesor.

## chore/cleanup-copilot-commit

Limpieza post-Copilot. Copilot tradujo comentarios pero también cambió
comillas simples → dobles en todo el código, commiteó `.hermes/PLAN.md`
(meta-trabajo) y commiteó directo sobre `ejercicios` sin respetar el
workflow de 1 feature = 1 rama + merge --no-ff. Acciones: revert comillas
a simple, sacar `.hermes/PLAN.md` (y gitignorear `.hermes/`), cherry-pick
la traducción de Copilot en una rama nueva, merge --no-ff limpio, force-push
con `--force-with-lease`. `IDEA.md` se mantiene commiteado (referencia
valiosa para estudio).

## Estado al cierre

✅ 12 features/fixes/refactors mergeados con --no-ff a `ejercicios`.
✅ 24/24 tests automatizados con `npm run test:oracle`.
✅ End-to-end verificado con key real: 200 OK con `{ text, model }`.
✅ Push a `origin` (fork del usuario). `upstream` (repo del profesor) intacto.
✅ Config centralizada en `src/config.mjs`.
✅ Workflow de git documentado en esta bitácora.

## Política de mantenimiento

- **Por feature cerrada**: la IA propone el diff de 1 párrafo a esta bitácora.
- **Por Pablo**: aprueba o ajusta (1 minuto).
- **Por commit**: la entrada se commitea junto con el merge de la feature.
- **Por proyecto nuevo**: crear `docs/IMPLEMENTATION.md` siguiendo este formato.
