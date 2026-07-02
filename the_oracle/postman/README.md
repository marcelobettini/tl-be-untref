# Postman collection — THE ORACLE

This directory contains a Postman collection that exercises every error path
of the `/generate-content` endpoint and the no-leak guarantee from the
`errorHandler` middleware.

## Files

- `the_oracle.postman_collection.json` — the collection (7 requests).
- `the_oracle.postman_environment.json` — environment with `baseUrl` and `GEMINI_API_KEY`.

## Import into Postman

1. Open Postman.
2. **File > Import** → drag both JSON files.
3. The collection "THE ORACLE" and the environment "THE ORACLE (local)" will appear in the sidebar.
4. Top-right of Postman, select the environment "THE ORACLE (local)" from the dropdown.
5. Click the eye icon next to the dropdown → edit `GEMINI_API_KEY`:
   - Leave it empty (or set to `dummy`) to run the failure cases.
   - Set a real key to also exercise the success case.

## Run the server first

```bash
# from the repo root
npm run start:oracle
```

For the "Invalid API key" test (case 7) the server MUST be started with an
invalid `GEMINI_API_KEY` so the upstream returns 400 with reason
`API_KEY_INVALID`:

```bash
GEMINI_API_KEY=dummy npm run start:oracle
```

The collection expects the server on `http://127.0.0.1:3000` (matches
`baseUrl` in the environment).

## Run the collection

- **GUI:** open the collection, click "Run", then "Run THE ORACLE".
- **CLI (newman):** install with `npm install -g newman`, then:
  ```bash
  newman run the_oracle/postman/the_oracle.postman_collection.json \
           --env the_oracle/postman/the_oracle.postman_environment.json
  ```

## What each request tests

| # | Request | Expected status | Validates |
| --- | --- | --- | --- |
| 1 | `GET /health` | 200 | Service alive, no SDK leak |
| 2 | `POST /generate-content` valid | 200 (or skip) | Happy path: `{ text, model }` |
| 3 | `POST /generate-content` empty body `{}` | 400 | Missing `question` |
| 4 | `POST /generate-content` `question: ""` | 400 | Empty `question` |
| 5 | `POST /generate-content` `question: 12345` | 400 | Non-string `question` (no value leak) |
| 6 | `POST /generate-content` 1001-char `question` | 400 | Length validation (no length leak) |
| 7 | `POST /generate-content` valid body, invalid key | 401 | Reason → 401 (not 400), no SDK leak |

## No-leak contract

Every request asserts that the response body does NOT contain any of:
- `API_KEY_INVALID`, `PERMISSION_DENIED`, `RESOURCE_EXHAUSTED`,
  `DEADLINE_EXCEEDED`, `UNAVAILABLE`, `NOT_FOUND`
- `GoogleGenerativeAI`, `googleapis`, `generativelanguage`
- Internal details (length constants, validation function names)

This is the IDEA.md point 7 guarantee.
