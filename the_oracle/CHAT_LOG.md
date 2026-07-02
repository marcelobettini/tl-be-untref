# CHAT_LOG — the_oracle

> Documento unificado de interacciones. Cada entrada cubre desde la
> respuesta anterior hasta el prompt actual, con timestamp.
> Política: append después de CADA prompt de Pablo, antes de resolverlo.
> Si la sesión se interrumpe, el checkpoint queda persistido.
> 
> **Regla de oro: NO se comprime destructivamente. Se resume lo
> relevante, se cita lo literal cuando es necesario.**

---

## Entradas

### 2026-07-02T00:00:00Z (inicio de la sesión)
**Setup de la sesión:** Proyecto tl-be-untref, perfil the_oracle. Pablo
pidió construir THE ORACLE (backend con Express + Gemini). El primer
intento mío mezcló ia-analista con tl-be-untref por leer `.env` antes
de verificar el directorio. Pablo me corrigió: "este proyecto es
independiente de ia-analista, es un nuevo proyecto".

**Decisión:** Trabajar en `C:\Users\pgson\Documents\Programacion\tl-be-untref\the_oracle\`.
ESM aislado con `.mjs` para no romper el resto del repo (que tiene
CommonJS en `cookies/`, `server01/`, `server03/`).

### 2026-07-02T00:30:00Z
**Pablo:** "y y y y y y y" (probando si el chat seguía activo).

**Pablo:** "tengo postman instalado, puedes interactuar con él para
generar unas pruebas?"

**Decisión:** No tengo acceso CLI a Postman. Opciones: instalar newman
CLI, generar JSON de collection para import, o usar curl. Pablo eligió
"Solo collection JSON para importar".

### 2026-07-02T00:45:00Z
**Pablo:** "el .env está en la raíz del proyecto debe ser
`C:\Users\pgson\Documents\Programacion\tl-be-untref\the_oracle\`, que
es donde está el .env cualquier otra opción es incorrecta"

**Decisión:** CWD operativo del feature = `tl-be-untref/the_oracle/`.
El `.env` está ahí, no en la raíz. Esto corrigió mi suposición inicial
de que el proyecto seguía la convención de `ia-analista/`.

### 2026-07-02T01:00:00Z
**Pablo:** "2.5 flash no es el que está ya configuré"

**Pablo:** "ya configuré puedes volver a probar"

**Descubrimiento:** Listando los 50 modelos disponibles para la key de
Pablo via API directa, `gemini-2.0-flash` SÍ aparece pero su free-tier
quota está en `limit: 0` (429 permanente). `gemini-flash-latest` (alias)
funciona. Smoke test con key real devolvió:
`{"text":"Four","model":"gemini-flash-latest"}` (HTTP 200).

### 2026-07-02T01:15:00Z
**Pablo:** "tuviste que corregir ese valor en un montón de lugares.
¿Por qué no usas un acceso más centralizado y más universal? En vez
de repetirla en tantos lugares."

**Decisión:** Refactor a `src/config.mjs` con named exports
(`DEFAULT_MODEL`, `DEFAULT_PORT`, `PROMPT_MAX_LENGTH`). Service,
middlewares, tests y `server.mjs` importan desde ahí. Cambio de valor
= 1 línea.

### 2026-07-02T01:30:00Z
**Pablo:** "Una última cosa, el readme del proyecto está en inglés y
el idioma por defecto es el español"

**Decisión:** Traducir `README.md` y `postman/README.md` al español.
Lo que queda en inglés: nombres de campos de API, status HTTP,
scripts Postman, mensajes REST estándar.

### 2026-07-02T01:45:00Z
**Pablo (contextualiza el repo académico):** "el repositorio Tl-be-untref
pertenece a una materia y lo mantiene un profesor, yo estoy trabajando
en la rama ejercicios porque no puedo commitear ni hacer push al
repositorio que mantiene el profesor... hay varios proyectos que son
independientes dentro de la misma carpeta... son todos independientes,
son ejercicios para las materias"

**Decisión:** 
- `origin` = fork personal de Pablo (pgsonic/tl-be-untref) → SÍ push
- `upstream` = repo del profesor (marcelobettini/tl-be-untref) → solo tracking
- Subcarpetas (frutas/, server01/, ia-analista/, the_oracle/, etc.) son
  ejercicios independientes, NO un monorepo

### 2026-07-02T02:00:00Z
**Pablo (sobre el workflow de git):** "lo de dividir el trabajo por
branches para mergear le da una capacidad de tracking y trabajo sin
afectar el main muy deseable... permite reversiones e incorporaciones
más limpias... incorporar como forma básica de hacer las cosas... no
solo para este perfil sino para todos los perfiles"

**Decisión:** Política permanente: 1 feature = 1 rama + merge --no-ff
en TODOS los perfiles y proyectos.

### 2026-07-02T02:15:00Z
**Pablo (cuestionando mi .mjs):** "qué tipo de archivo es .mjs, por
qué se usa en vez de .js?"

**Decisión:** Le explico que `.mjs` fuerza ESM sin importar el
`package.json` de la raíz, evitando que `"type": "module"` global
rompa los archivos CommonJS del repo. El `.mjs` es inmune a la
herencia de config.

### 2026-07-02T02:30:00Z
**Pablo (defensa preventiva):** "se puede hacer un package.json para
intro-js? para mitigar este problema? ... estar a la defensiva en un
entorno de aprendizaje tampoco parece tan inadecuado"

**Decisión:** Crear `intro-js/package.json` con `type: module` y
`private: true`. Descubrí al hacerlo que intro-js/ ya es ESM (los
archivos usan import) — entonces `type: module`, no `commonjs`.

### 2026-07-02T02:45:00Z
**Pablo:** "una vez más propones de acuerdo a lo que considero más
correcto, solo una salvedad, teniendo en cuenta que el día de mañana
estas carpetas podrían desaparecer de mi máquina por diversas
cuestiones, me parece valioso conservar el enunciado en el repositorio
para saber que es lo que se debía hacer y poder estudiar como se resolvió"

**Decisión:** `IDEA.md` queda commiteado (referencia para estudio).
`.hermes/PLAN.md` se saca (es meta-trabajo, no parte del feature).

### 2026-07-02T03:00:00Z
**Pablo (tras incidente con Copilot):** "al abrir los archivos del
proyecto vi que los comentarios de la mayoría de los archivos estaban
en inglés, le pedí a copilot que los tradujera y creo que hizo además
algo con git pero no estoy seguro... puedes revisar que todo esté
correcto?"

**Diagnóstico:** Copilot mergeó directo sobre `ejercicios` (sin
`--no-ff`), cambió comillas simples → dobles, commiteó `.hermes/PLAN.md`.
Pablo aplicó regla: enmendar preservando `IDEA.md`, sacando
`.hermes/PLAN.md`, revirtiendo comillas. Force-push con
`--force-with-lease`.

### 2026-07-02T03:15:00Z
**Pablo (propone práctica de bitácora persistente):** "dado lo limitado
de tu memoria de contexto, de tanto en tanto se realizan compresiones
destructivas perdiendo información que puede resultar valiosa... creamos
una política de historia persistente creando un archivo md en cada
proyecto a ese fin"

**Decisión:** Adoptar patrón `docs/IMPLEMENTATION.md` (de ia-analista).
Pero Pablo aclara más adelante que lo que él realmente quiere es
CHAT_LOG.md (volcado literal de interacciones) para sobrevivir
interrupciones tipo F9 (definición perdida antes de ser trabajada).

### 2026-07-02T03:30:00Z
**Pablo (corrigiendo la implementación):** "creo que lo que encontraste,
si bien sirve, no es a lo que me refería... Yo me refería a un
volcado literal de interacciones unificado en un archivo incremental
donde quede TODA la historia de nuestras interacciones... la propuesta
original era documentar en cada interacción desde tu respuesta anterior
hasta el prompt actual... NO PUEDE SUCEDER BAJO NINGUNA CIRCUNSTANCIA
ES PÉRDIDA DE INFORMACIÓN RELEVANTE"

**Decisión corregida:** Crear CHAT_LOG.md (no solo IMPLEMENTATION.md).
Política: append después de CADA prompt, antes de resolverlo. Resumen
criterioso NO destructivo. Este archivo es el que previno la pérdida
de F9 en ia-analista (cuando una compresión borró su definición).

### 2026-07-02T03:35:00Z
**Pablo (regla fundamental de idioma):** "todo lo producido que no
deba forzosamente estar en inglés DEBE estar en español incluyendo
nombres de archivos, comentarios de código, documentación de proyectos,
etc."

**Decisión:** Regla permanente en perfil. Aplica a todos los proyectos
presentes y futuros.

### 2026-07-02T03:40:00Z (entrada actual)
**Estado:** CHAT_LOG.md siendo creado ahora. Política de mantenimiento
incremental establecida. Pendiente: aplicar a todos los proyectos
existentes (the_oracle, ia-analista) y futuros.

