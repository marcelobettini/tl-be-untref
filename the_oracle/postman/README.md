# Colección de Postman — THE ORACLE

Este directorio contiene una colección de Postman que ejercita cada camino
de error del endpoint `/generate-content` y la garantía de no-leak del
middleware `errorHandler`.

## Archivos

- `the_oracle.postman_collection.json` — la colección (7 requests).
- `the_oracle.postman_environment.json` — environment con `baseUrl` y `GEMINI_API_KEY`.

## Importar en Postman

1. Abrí Postman.
2. **File > Import** → arrastrá ambos archivos JSON.
3. La colección "THE ORACLE" y el environment "THE ORACLE (local)" van a aparecer en la barra lateral.
4. Arriba a la derecha de Postman, seleccioná el environment **"THE ORACLE (local)"** del dropdown.
5. Cliqueá el ícono del ojo al lado del dropdown → editá `GEMINI_API_KEY`:
   - Dejala vacía (o poné `dummy`) para correr los casos de error.
   - Poné una key real para también ejercitar el caso de éxito.

## Arrancá el server primero

```bash
# desde la raíz del repo
npm run start:oracle
```

Para el test "Invalid API key" (caso 7) el server DEBE estar arrancado con
una `GEMINI_API_KEY` inválida para que el upstream devuelva 400 con la
`reason` `API_KEY_INVALID`:

```bash
GEMINI_API_KEY=dummy npm run start:oracle
```

La colección espera al server en `http://127.0.0.1:3000` (coincide con
`baseUrl` en el environment).

## Correr la colección

- **GUI:** abrí la colección, cliqueá "Run", después "Run THE ORACLE".
- **CLI (newman):** instalá con `npm install -g newman`, después:
  ```bash
  newman run the_oracle/postman/the_oracle.postman_collection.json \
           --env the_oracle/postman/the_oracle.postman_environment.json
  ```

## Qué testea cada request

| # | Request | Status esperado | Valida |
| --- | --- | --- | --- |
| 1 | `GET /health` | 200 | Servicio vivo, sin leak del SDK |
| 2 | `POST /generate-content` válido | 200 (o skip) | Happy path: `{ text, model }` |
| 3 | `POST /generate-content` cuerpo vacío `{}` | 400 | Falta `question` |
| 4 | `POST /generate-content` `question: ""` | 400 | `question` vacía |
| 5 | `POST /generate-content` `question: 12345` | 400 | `question` no-string (sin leak del valor) |
| 6 | `POST /generate-content` `question` de 1001 chars | 400 | Validación de longitud (sin leak del largo) |
| 7 | `POST /generate-content` cuerpo válido, key inválida | 401 | Reason → 401 (no 400), sin leak del SDK |

## Contrato de no-leak

Cada request asegura que el cuerpo de la respuesta NO contiene ninguno de:
- `API_KEY_INVALID`, `PERMISSION_DENIED`, `RESOURCE_EXHAUSTED`,
  `DEADLINE_EXCEEDED`, `UNAVAILABLE`, `NOT_FOUND`
- `GoogleGenerativeAI`, `googleapis`, `generativelanguage`
- Detalles internos (constantes de longitud, nombres de funciones de validación)

Esta es la garantía del punto 7 de IDEA.md.
