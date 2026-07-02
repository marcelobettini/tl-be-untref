# THE ORACLE

Backend exercise that exposes a single endpoint backed by Google's Gemini API.

- **Stack:** Node.js (native `node:test`), Express 5, `@google/generative-ai` (official SDK).
- **Module system:** ESM, isolated in `.mjs` files so it does not collide with the CommonJS files in this repo (`cookies/`, `server01/`, etc.).
- **Branch:** `ejercicios` of `pgsonic/tl-be-untref`.

The original exercise brief lives in [`IDEA.md`](./IDEA.md).

---

## Setup

```bash
# from the repo root
npm install
cp the_oracle/.env.example .env       # then edit .env and set GEMINI_API_KEY
```

Environment variables (see `the_oracle/.env.example`):

| Variable | Default | Notes |
| --- | --- | --- |
| `GEMINI_API_KEY` | _(required)_ | Get one at https://aistudio.google.com/apikey |
| `GEMINI_MODEL` | `gemini-1.5-flash` | Any Gemini model name |
| `PORT` | `3000` | HTTP port |

---

## Run

```bash
npm run start:oracle        # starts the server
```

Then:

```bash
# health probe
curl http://127.0.0.1:3000/health
# -> {"status":"ok","service":"the-oracle"}

# ask THE ORACLE a question
curl -X POST http://127.0.0.1:3000/generate-content \
     -H 'Content-Type: application/json' \
     -d '{"question":"What is the capital of France?"}'
# -> {"text":"The capital of France is Paris.","model":"gemini-1.5-flash"}
```

---

## API

### `POST /generate-content`

**Request body** (JSON):

```json
{ "question": "string, 1..1000 chars" }
```

**200 OK** response body:

```json
{ "text": "string", "model": "string" }
```

**Error responses** (always `{ "error": { "status": <int>, "message": <string> } }`):

| Status | Meaning | Common cause |
| --- | --- | --- |
| `400` | Bad request | Body missing, `question` missing/empty/non-string/over 1000 chars |
| `401` | Unauthorized | `GEMINI_API_KEY` is invalid or revoked |
| `403` | Forbidden | API key lacks permission for the requested model |
| `404` | Not found | Model name does not exist |
| `408` | Request timeout | Gemini upstream timed out |
| `429` | Too many requests | Quota / rate limit hit |
| `500` | Internal server error | `GEMINI_API_KEY` not set; or any unexpected error |
| `502` | Upstream service unavailable | Gemini upstream returned an error with no recognized reason |
| `503` | Service temporarily unavailable | Gemini is temporarily down |

**No-leak contract:** the response body never contains Gemini SDK fields
(`API_KEY_INVALID`, `googleapis.com`, `status`, `code`, stack traces,
or any other upstream detail). The internal cause is logged server-side
for debugging, never returned to the client.

---

## Project layout

```
the_oracle/
├── IDEA.md                            # original exercise brief
├── README.md                          # this file
├── .env.example                       # env template
├── .gitignore                         # local ignores
├── server.mjs                         # entry point, wires routes + error handler
├── src/
│   ├── errors/
│   │   └── AppError.mjs               # typed error with statusCode + cause
│   ├── services/
│   │   └── gemini.service.mjs         # askGemini(prompt, deps?) async
│   ├── middlewares/
│   │   ├── validatePrompt.mjs         # body validation -> 400 on bad input
│   │   └── errorHandler.mjs           # final error -> safe HTTP response
│   └── routes/
│       └── generateContent.routes.mjs # POST /generate-content
└── tests/
    ├── gemini.service.test.mjs        # 5 unit tests
    ├── generateContent.routes.test.mjs # 7 integration tests
    └── errorHandler.test.mjs          # 12 unit tests
```

---

## Test

```bash
npm run test:oracle
```

All 24 tests run with the native `node:test` runner. Mocks use dependency
injection (no loader hooks required). Real `GEMINI_API_KEY` is **not**
needed to run the test suite.

---

## Design notes

### Why ESM in `.mjs` and not `"type": "module"` globally?
This repo has several CommonJS files (`cookies/index.js`, `server01/index.js`,
`server03/index.js`, etc.). Setting `"type": "module"` in the root
`package.json` would break them on next run. Keeping the new feature in
`.mjs` files makes the change additive and reversible.

### Why a typed `AppError` instead of throwing plain `Error`?
- Lets the service signal "this is a 400, not a 500" without leaking
  details.
- Carries the raw SDK error in `cause` (ES2022 syntax) so the error
  handler can refine the status code by inspecting upstream details
  without ever exposing them to the client.
- Distinguishes error `kind` (`validation`, `config`, `gemini`, `app`)
  for internal logging.

### Why does the error handler always pick the safeMessage from a table?
If the service or the SDK ever supplies a custom `safeMessage`, that
message is treated as internal and never returned. Only the table
mapping (`{401: 'Unauthorized', 429: 'Too many requests', ...}`) is
ever sent. This is the no-leak guarantee from IDEA.md point 7.

### Why does semantic reason beat HTTP status in the mapping?
When `GEMINI_API_KEY` is invalid, the Gemini upstream returns HTTP 400
*with* a structured `reason: API_KEY_INVALID`. Returning 400 would be
semantically wrong: the client should see "auth problem, fix your key",
not "your request was bad". The error handler prefers the structured
reason over the raw HTTP status.

---

## How this was built

The feature was developed across 5 branches, each merged into `ejercicios`
with `--no-ff` and pushed to the remote:

```
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
* 460b342 (previous commit on ejercicios)
```
