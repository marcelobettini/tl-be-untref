# Protocolo de evaluación de modelos fallback para Hermes

> **Status:** Draft v1 — 2026-07-06
> **Owner:** Pablo + Hermes (asistente del perfil `techsupport`)
> **Aplicabilidad:** universal — todos los proyectos donde Hermes corra con `ollama-launch` como provider y Ollama Pro como plan de pago.

---

## Contexto

Hermes en este host (Windows, perfil `techsupport`) usa como modelo primario `minimax-m3:cloud` corriendo contra `ollama.com` (no local — ver `~/.hermes/profiles/techsupport/memories/MEMORY.md`). El plan de Ollama Pro es el más chico de pago, lo que implica:

- Rate limits reales en el tier free de ollama.com (latencias 10–26s observadas, posibles 429).
- Sin un `fallback_model` configurado en `~/.hermes/config.yaml` (líneas 678–680 comentadas), cuando el primario se cae o rate-limita, **el agente no responde hasta que se levante el primario**.
- Pablo está aprendiendo a usar git/Hermes en simultáneo con el desarrollo de la materia. Necesita una guía operativa, no un esclavo, y eso exige que el fallback preserve calidad de razonamiento, no solo "que responda algo".

**Lo que este documento es:** un protocolo estructurado para elegir el modelo fallback con criterio, no a ojo. Las preguntas están diseñadas para que la comparación sea comparable entre candidatos.

**Lo que este documento NO es:** un veredicto. Pablo ejecuta el protocolo, anota resultados, y la decisión final la toma él en base a evidencia cruda (no en base a assurance verbal de Hermes).

---

## Diagnóstico

### Estado actual de `config.yaml` (post-sesión 2026-07-06)

| Setting | Valor | Notas |
|---|---|---|
| `model.default` | `minimax-m3:cloud` | Primario, contra ollama.com |
| `fallback_providers` | `[]` | Vacío. Sin failover. |
| `fallback_model` | (comentado) | Plantilla disponible, sin uso real. |
| Streaming | `enabled: true` | Aplicado en esta sesión. |
| `clarify_timeout` | `3600` | Aplicado en esta sesión. |
| `session_reset.idle_minutes` | `4320` | Aplicado en esta sesión. |

### Candidatos viables (estado de evaluación 2026-07-06)

| Modelo | Tamaño | Modo | Estado | Por qué candidato |
|---|---|---|---|---|
| `gemma4:31b-cloud` | 31B | Cloud (ollama.com) | No probado por Pablo aún | El más capaz de los disponibles. Razonamiento profundo esperado. |
| `llama3.1:8b` | 8B | Local | Experiencias mixtas | Baseline de comparación — Pablo ya tiene datos cualitativos. |
| `qwen2.5-coder:7b` | 7B | Local | No usable vía Hermes (contexto 32K < 64K mínimo de Hermes) | Si se evalúa, debe ser vía Ollama directo, no vía Hermes. |
| `qwen-coder-64k:latest` | (variable) | Local | Pablo reportó que sigue cargando 32K pese al nombre | Descartado: el modelo no respeta su contexto declarado. |
| `hermes3:latest` | 8B-70B | Local | Resultados "tirando a malos" según Pablo | Sospecha: VRAM ajustada limita contexto y capacidades. Descartado como fallback de uso diario, candidato a verificar si la causa es modelo o entorno. |

### Candidatos descartados y por qué

- **`qwen-coder-64k:latest`**: el nombre sugiere 64K de contexto, la realidad es 32K. Si miente en el spec básico, no es confiable para un fallback. Descartado.
- **`qwen2.5-coder:7b` como fallback vía Hermes**: incompatible con el requisito mínimo de 64K de contexto de Hermes. **Puede** evaluarse fuera de Hermes (Ollama CLI directo) como referencia de "qué tan bueno es un code-tuned de 7B" para tener un dato de comparación, pero no entra al config de fallback.

### Candidatos finalistas para evaluar

Tres modelos, tres puntos del espacio de decisión:

1. **`gemma4:31b-cloud`** — capacidad máxima, nube, costoso en inferencia.
2. **`llama3.1:8b`** — generalista balanceado, local, rápido.
3. **Un code-tuned local** (a definir por Pablo — sugerencia: `qwen2.5-coder:7b` evaluado vía Ollama directo, no vía Hermes) — code-specialist, referencia de comparación.

Si Pablo decide evaluar un cuarto modelo (ej. `hermes3` en una máquina con más VRAM, o un modelo gated distinto), se agrega al set. No se quita ninguno de los tres sin evidencia.

---

## Decisiones

### D1 — Protocolo ciego, no comparativo abierto

**Por qué:** la comparación "abierta" (probar cada modelo por separado, en sesiones distintas, con prompts distintos) introduce variables que no se controlan: estado de contexto, hora del día, mood del operador. El protocolo ciego fija el mismo prompt para todos y compara respuestas sin saber qué modelo las emitió (o sabiendo, pero manteniendo la comparación estricta en contenido, no en feeling).

**Implicancia:** las preguntas del protocolo son **idénticas palabra por palabra** para cada modelo. Lo que cambia es el modelo, no el input.

### D2 — Set de preguntas por categoría, no por "tarea típica"

**Por qué:** si el set es "tareas típicas de Pablo", se cubre lo que Pablo ya sabe hacer (Node/Express, backend chico). Pero el **fallback** se va a activar cuando el primario cae, que puede ser en cualquier momento — incluida una tarea pesada. El set tiene que cubrir el rango de cosas que el agente puede llegar a recibir.

**Decisión:** el set cubre seis categorías:

1. **Programación procedural** — escribir una función con casos borde.
2. **Programación con dependencias externas** — usar una librería, manejar errores.
3. **Arquitectura y diseño de software** — elegir entre dos abordajes con trade-offs reales.
4. **Razonamiento lógico/complejo** — un problema donde la respuesta obvia es incorrecta.
5. **Explicación técnica con público mixto** — explicar algo técnico a alguien que no lo es.
6. **Funcionamiento agentivo y skills de Hermes** — pedirle al modelo que razone sobre su propio sistema, no solo sobre código externo.

**Por qué estas seis:** cubren el espacio (código, diseño, razonamiento, comunicación, meta-cognición). Cualquier modelo que se desempeñe bien en las seis es un fallback robusto. Cualquier modelo que falle en alguna se anota con el fallo específico.

### D3 — Tres preguntas por categoría, dieciocho en total

**Por qué tres:** una sola pregunta por categoría es anécdota. Cinco es fatiga. Tres es suficiente para distinguir "le va bien" de "le va mal" sin convertir la evaluación en un proyecto en sí.

**Tiempo estimado total:** ~30–45 min si Pablo hace las preguntas en serie y anota en una grilla simple.

### D4 — Evaluación cualitativa con rúbrica explícita, no scoring numérico

**Por qué:** scoring 1–5 es tentador pero engañoso. Lo que Pablo necesita saber es "este modelo me sirve como fallback **porque**...", no "le puse 7.8". La rúbrica explícita (correcto/incorrecto, completo/incompleto, idiomático/torpe, explica-tradeoffs/no-los-explica) le da a Pablo el vocabulario para defender la decisión ante un tercero o ante sí mismo en tres meses.

**Implicancia:** Pablo llena una grilla de Sí/No/Parcial para cada pregunta de cada modelo, más una nota libre de máximo 50 palabras por respuesta.

### D5 — Modelo de fallback: el que mejor cumpla "razonamiento + código + comunicación"

**Por qué:** un fallback que programa bien pero explica mal es un fallback que Pablo no entiende. Un fallback que explica bien pero programa mal es un fallback que Pablo no puede usar. Los tres ejes pesan.

**Tie-breaker:** en caso de empate técnico, gana el **más rápido** (latencia medida). Un fallback lento es medio fallback.

### D6 — Configuración: un solo fallback en `fallback_model`, no cadena

**Por qué:** el config de Hermes soporta un único `fallback_model` (no una lista encadenada). Si Pablo quiere redundancia de N niveles, eso es feature request a Hermes, no algo que configuremos. Por ahora, **un solo fallback bien elegido**.

**Implicancia:** la terna evaluada se reduce a "el ganador". Los otros dos se quedan como referencia anotada en la grilla, no se descartan sin más — pueden ser útiles si el ganador falla en producción.

### D7 — Costo de inferencia: el dato, no la corazonada

**Por qué:** Pablo está en Ollama Pro (tier más chico de pago). Cada modelo cloud consume créditos. `gemma4:31b-cloud` no cuesta lo mismo que algo más chico. El protocolo debe registrar tiempo de respuesta por pregunta para que Pablo pueda estimar costo real.

**Implicancia:** agregar a la grilla: tiempo en segundos por respuesta (aproximado, medido con cronómetro humano; no hace falta precisión sub-segundo).

---

## Implementaciones

### I1 — Set de preguntas (idénticas para los tres modelos)

> **Nota para Pablo:** copiá las preguntas tal cual. Si querés reformularlas, eso es otra evaluación. Mezclar preguntas reformuladas con originales introduce ruido.

#### Categoría 1: Programación procedural

**P1.1.** Escribí una función en JavaScript llamada `parsePort` que reciba un string (ej. `"3001"`, `"abc"`, `""`, `"  8080  "`) y devuelva un entero válido entre 1 y 65535, o `null` si el input es inválido. Mostrá al menos tres casos de prueba.

#### Categoría 2: Programación con dependencias externas

**P1.2.** En un proyecto Node.js con Express 4 y la librería `pg` para PostgreSQL, escribí un endpoint `GET /users/:id` que devuelva el usuario o un 404 con cuerpo JSON consistente con el resto de la API. ¿Qué errores específicos de `pg` deberías capturar, y por qué?

#### Categoría 3: Arquitectura y diseño

**P1.3.** Tenés una API REST que hoy responde en ~80ms con PostgreSQL. Un feature nuevo requiere joins de 4 tablas con filtros opcionales. Discutí dos abordajes posibles (ej. view materializada vs. endpoint desnormalizado vs. cache de query). Para cada uno, listá pros, contras, y la condición bajo la cual lo elegirías.

#### Categoría 4: Razonamiento lógico/complejo

**P1.4.** Un sistema de auth con JWT usa access tokens de 15 min y refresh tokens de 7 días. Un usuario reporta que a los 14 minutos de usar la app, "se desloguea solo". El access token dice `exp: now+15m` y se ve correcto. ¿Cuáles son **tres** hipótesis plausibles para el síntoma, ordenadas de más probable a menos probable, y qué verificarías en cada caso?

#### Categoría 5: Explicación técnica con público mixto

**P1.5.** Un compañero de equipo que sabe HTML/CSS pero nunca tocó backend te pregunta: "¿qué es un middleware en Express?". Explicá en no más de 100 palabras, usando un ejemplo concreto de una API que valide tokens.

#### Categoría 6: Funcionamiento agentivo y skills de Hermes

**P1.6.** Estás corriendo Hermes con un proyecto Node.js abierto. Llamás a la herramienta `search_files` con un patrón glob y no devuelve resultados, aunque sabés que el archivo existe. Listá **cuatro** causas posibles y para cada una decí qué comando o acción usarías para confirmarla o descartarla.

### I2 — Grilla de evaluación (plantilla vacía)

```
Modelo: ___________________________
Fecha: ____________________________

Categoría 1 — Programación procedural
  P1.1 ¿Código correcto?              [ ] Sí  [ ] No  [ ] Parcial
  P1.1 ¿Casos de prueba presentes?     [ ] Sí  [ ] No  [ ] Parcial
  P1.1 ¿Maneja borde ("", " 8080 ")?   [ ] Sí  [ ] No  [ ] Parcial
  P1.1 Tiempo (seg): ____  Nota (≤50 palabras): ________________________

Categoría 2 — Programación con dependencias externas
  P1.2 ¿Endpoint funcional?            [ ] Sí  [ ] No  [ ] Parcial
  P1.2 ¿Maneja errores de pg?          [ ] Sí  [ ] No  [ ] Parcial
  P1.2 ¿Justifica elecciones?          [ ] Sí  [ ] No  [ ] Parcial
  P1.2 Tiempo (seg): ____  Nota: ________________________________________

Categoría 3 — Arquitectura y diseño
  P1.3 ¿Propone 2+ abordajes?          [ ] Sí  [ ] No  [ ] Parcial
  P1.3 ¿Lista pros/contras?            [ ] Sí  [ ] No  [ ] Parcial
  P1.3 ¿Discute condiciones de elección? [ ] Sí  [ ] No  [ ] Parcial
  P1.3 Tiempo (seg): ____  Nota: ________________________________________

Categoría 4 — Razonamiento lógico/complejo
  P1.4 ¿Tres hipótesis?                [ ] Sí  [ ] No  [ ] Parcial
  P1.4 ¿Ordenadas por plausibilidad?   [ ] Sí  [ ] No  [ ] Parcial
  P1.4 ¿Verificaciones concretas?      [ ] Sí  [ ] No  [ ] Parcial
  P1.4 Tiempo (seg): ____  Nota: ________________________________________

Categoría 5 — Explicación técnica
  P1.5 ≤100 palabras?                  [ ] Sí  [ ] No  [ ] Parcial
  P1.5 ¿Ejemplo concreto?              [ ] Sí  [ ] No  [ ] Parcial
  P1.5 ¿Público no-técnico lo entiende?[ ] Sí  [ ] No  [ ] Parcial
  P1.5 Tiempo (seg): ____  Nota: ________________________________________

Categoría 6 — Funcionamiento agentivo
  P1.6 ¿Cuatro causas?                 [ ] Sí  [ ] No  [ ] Parcial
  P1.6 ¿Verificaciones ejecutables?    [ ] Sí  [ ] No  [ ] Parcial
  P1.6 ¿Conoce herramientas reales?    [ ] Sí  [ ] No  [ ] Parcial
  P1.6 Tiempo (seg): ____  Nota: ________________________________________

Resumen:
  Total Sí: ____ / 18
  Total Parcial: ____ / 18
  Total No: ____ / 18
  Tiempo total: ____ segundos
  Impresión general (≤100 palabras): ___________________________________
```

### I3 — Procedimiento de ejecución

1. **Para cada modelo candidato** (gemma4:31b-cloud, llama3.1:8b, qwen2.5-coder:7b vía Ollama directo):
   - Abrir sesión nueva del cliente (Ollama CLI, `ollama run <modelo>`, **no** vía Hermes, para evitar overhead de system prompt).
   - Pegar la pregunta **tal cual** sin contexto adicional.
   - Cronometrar desde Enter hasta fin de respuesta.
   - Pegar la respuesta en un fichero por modelo (`eval-results/{modelo}/P1.N.md`).
   - Llenar la grilla del modelo en `eval-results/{modelo}/grilla.md`.
2. **Comparar grillas** — la decisión se toma sobre la grilla, no sobre la impresión.
3. **Anotar el ganador en `config.yaml`** descomentando `fallback_model` con `provider` y `model` correctos.
4. **Commit + push + merge** siguiendo P1 (rama `docs/fallback-eval-protocol-results` o similar, merge a `ejercicios`).

### I4 — Estructura de ficheros en el repo (post-evaluación)

```
tl-be-untref/
└── docs/
    ├── PROTOCOL-fallback-model-eval.md       ← este documento
    └── eval-results/
        ├── gemma4-31b-cloud/
        │   ├── P1.1.md
        │   ├── P1.2.md
        │   ├── ... (P1.3 a P1.6)
        │   └── grilla.md
        ├── llama3.1-8b/
        │   └── ... (mismo set)
        └── qwen2.5-coder-7b/
            └── ... (mismo set)
```

---

## Verificación

Cómo saber que el protocolo se ejecutó bien:

- [ ] Las 18 preguntas están respondidas (6 categorías × 3 preguntas) por cada uno de los 3 modelos. **No** se saltean preguntas.
- [ ] Las preguntas se pegaron **idénticas** para los tres modelos. Diff palabra por palabra = vacío.
- [ ] Los tiempos están registrados. No hace falta precisión sub-segundo, pero sí el orden de magnitud.
- [ ] La grilla de cada modelo está llena. No se saltean casilleros.
- [ ] La decisión final ("este es el ganador") está en `config.yaml` con `fallback_model` descomentado y valores reales, no plantilla.
- [ ] Hay un commit por modelo evaluado + un commit de "config final" + un merge `--no-ff` a `ejercicios`.

---

## Pitfalls

### P1 — Sesgo de modelo conocido

**Riesgo:** Pablo ya probó `llama3.1:8b` y tiene una impresión formada. Si evalúa `gemma4:31b-cloud` con esa impresión en la cabeza, el rigor de la grilla se pierde.

**Mitigación:** la grilla es **Sí/No/Parcial**, no "1-5". Forzar el vocabulario discreto reduce el espacio para que la impresión previa module la nota.

### P2 — Pregunta contaminada por contexto previo

**Riesgo:** si Pablo pega la pregunta después de una conversación donde el modelo ya demostró algo, la respuesta se beneficia de ese contexto.

**Mitigación:** sesión **limpia** por modelo, sin conversación previa. `ollama run <modelo>` y pegar la pregunta como primer mensaje.

### P3 — El "modelo bueno" no es el "modelo para Pablo"

**Riesgo:** un modelo puede ser objetivamente más capaz en las seis categorías y aun así no ser el mejor fallback **para Pablo**, porque su estilo de explicación no conecta con cómo Pablo aprende.

**Mitigación:** la nota libre de ≤100 palabras por respuesta captura el "feeling" sin contaminar la grilla. Si dos modelos empatan en la grilla, la nota desempata. Si uno gana la grilla pero la nota dice "no me convence", Pablo decide conscientemente que descarta la grilla y abre otra ronda de evaluación.

### P4 — Costo de inferencia sorpresa en Ollama Pro

**Riesgo:** `gemma4:31b-cloud` puede consumir más créditos de los esperados. Si Pablo se queda sin créditos a mitad de la evaluación, los datos quedan incompletos.

**Mitigación:** empezar la evaluación por `llama3.1:8b` (local, sin costo) y `qwen2.5-coder:7b` (local, sin costo). Solo al final, cuando la grilla de los locales esté completa, evaluar `gemma4:31b-cloud` con la conciencia clara del saldo de Ollama Pro.

### P5 — El fallback se elige, pero nunca se testea "en vivo"

**Riesgo:** Pablo configura el fallback, lo da por bueno, y nunca verifica que cuando el primario cae el agente realmente cambia al fallback.

**Mitigación:** después de configurar, **provocar** la caída del primario (ej. cambiar `model.default` a uno que no exista temporalmente, o tirar el servidor de Ollama) y verificar que Hermes responde con el fallback. Anotar el resultado en `docs/eval-results/fallback-in-vivo-test.md`.

---

## Pendientes

- [ ] Pablo ejecuta el protocolo. Sin prisa, sin pausa con scheduler.
- [ ] Decisión final registrada en `config.yaml` con datos reales.
- [ ] Test "en vivo" del fallback (ver P5 arriba).
- [ ] Si el ganador es `gemma4:31b-cloud`: estimar costo mensual en base al patrón de uso real (no teórico) y registrar.
- [ ] Revisar este documento en 3 meses: ¿las preguntas siguen siendo representativas? ¿Apareció un nuevo candidato?

---

## Referencias

- `~/.hermes/profiles/techsupport/memories/USER.md` — políticas P1/P2/P3 (este protocolo las aplica).
- `~/.hermes/profiles/techsupport/memories/MEMORY.md` — hechos del host (modelo, provider, ripgrep).
- `~/.hermes/config.yaml` líneas 678–680 — plantilla de `fallback_model`.
- `~/.hermes/hermes-agent/AGENTS.md` — guía de contribución de Hermes (referencia sobre dónde van timeouts y feature flags: `config.yaml`, no `.env`).
- `C:\Users\pgson\Documents\Programacion\tl-be-untref\CHANGELOG` (cuando exista) — para anotar cuándo se hizo cada corrida de evaluación.
