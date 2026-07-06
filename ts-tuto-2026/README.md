# TypeScript para backend, para quien ya sabe JS

Tutorial práctico de TypeScript pensado para desarrolladores backend que ya
conocen JavaScript. No cubre nada de frontend/DOM/JSX. Todo el código corre
directo con `node`, aprovechando la integración nativa de **Node 24** con
TypeScript.

## Requisitos

- Node **24+** (`node --version` debe empezar con `v24` o superior).
- `npm install` ya corrido en este proyecto (instala `typescript` y
  `@types/node` como devDependencies — ver por qué en la [sección 3](#3-el-modelo-node-24-strip-vs-typecheck)).

---

## Índice

1. [Por qué TS en backend / qué cambió con Node 24](#1-por-qué-ts-en-backend--qué-cambió-con-node-24)
2. [Setup del proyecto](#2-setup-del-proyecto)
3. [El modelo Node 24: strip vs typecheck](#3-el-modelo-node-24-strip-vs-typecheck)
4. [Tipos básicos](#4-tipos-básicos)
5. [`interface` vs `type`](#5-interface-vs-type)
6. [Funciones tipadas](#6-funciones-tipadas)
7. [Union types y narrowing](#7-union-types-y-narrowing)
8. [Genéricos](#8-genéricos)
9. [Async/await tipado](#9-asyncawait-tipado)
10. [Manejo de errores](#10-manejo-de-errores)
11. [Utility types](#11-utility-types)
12. [Módulos ESM](#12-módulos-esm)
13. [Patrones de backend](#13-patrones-de-backend)

---

## 1. Por qué TS en backend / qué cambió con Node 24

En un backend, TypeScript vale sobre todo por esto:

- **Contratos explícitos**: la forma de un `Request`, una fila de base de
  datos, una respuesta de API, queda escrita y verificable.
- **Refactors seguros**: cambiás un campo y el compilador te muestra cada
  lugar que rompiste, antes de correr nada.
- **Menos `undefined is not a function` en producción**: buena parte de los
  errores de runtime en JS son errores de tipos que TS atrapa antes.

Hasta hace poco, correr TS en Node implicaba un paso extra: compilar con
`tsc` a JS y correr el JS, o usar `ts-node` para hacerlo "al vuelo". Desde
**Node 22.6** (con flag) y de forma **nativa y por defecto desde Node 24**,
Node puede ejecutar archivos `.ts` directamente:

```bash
node src/index.ts
```

Sin `ts-node`, sin paso de build, sin configurar loaders. Esto se llama
**type stripping**: Node reconoce la sintaxis de tipos y la *borra* antes de
ejecutar el JS que queda debajo. Es el cambio central que este tutorial
explota.

## 2. Setup del proyecto

Este proyecto ya tiene:

- `"type": "module"` en `package.json` → usamos ESM (`import`/`export`), el
  estándar moderno, en vez de CommonJS (`require`).
- `typescript` y `@types/node` como devDependencies.
- Un `tsconfig.json` con la configuración recomendada para este flujo (ver
  el archivo, cada opción está comentada).
- Scripts en `package.json`:
  - `npm start` → corre `node src/index.ts`.
  - `npm run typecheck` → corre `tsc --noEmit` (explicado en la sección 3).

Para probar cualquier lección de este tutorial, alcanza con:

```bash
node src/<archivo>.ts
```

## 3. El modelo Node 24: strip vs typecheck

Esta es la idea más importante del tutorial, léela con calma.

Node **borra tipos**, no los **chequea**. Es decir: `node` saca las
anotaciones de tipos del archivo y ejecuta el JavaScript que queda, **sin
validar que los tipos tengan sentido**. Si escribís un error de tipos y
corrés con `node`, el programa va a correr igual (a menos que ese error de
tipos también sea un error de JS real).

El chequeo de tipos lo hace **`tsc`**, el compilador de TypeScript, corrido
en modo "solo diagnóstico":

```bash
npx tsc --noEmit
# o, con el script ya definido:
npm run typecheck
```

`--noEmit` le dice a `tsc`: "no generes ningún JS, yo ya tengo con qué
correr (Node). Solo decime si hay errores de tipos". Este es el flujo
mental a interiorizar:

| Comando                  | Qué hace                                  |
|---------------------------|--------------------------------------------|
| `node src/archivo.ts`      | Borra tipos y ejecuta. No valida nada.     |
| `npm run typecheck`       | Valida tipos. No ejecuta nada, no genera JS.|
| Editor (VS Code)          | Valida tipos en vivo, mientras escribís.    |

En la práctica: programás con el editor abierto (te avisa en el momento),
corrés `npm run typecheck` antes de commitear o en CI, y usás `node` para
ejecutar. Tres herramientas, cada una con un trabajo.

### Por qué necesitamos `typescript` y `@types/node` si Node ya ejecuta `.ts`

Porque Node solo hace el *strip*. El chequeo de tipos, el autocompletado del
editor y saber que `process.env` existe y qué forma tiene, viene del
paquete `typescript` (el compilador) y `@types/node` (las definiciones de
tipos de las APIs de Node: `process`, `fs`, `http`, etc.). Sin
`@types/node`, `process.env.PORT` no tendría tipo.

### Sintaxis que Node NO puede borrar

El type stripping solo funciona con sintaxis **borrable**: algo que se
puede quitar sin dejar un hueco de lógica. Hay construcciones de TS clásico
que generan código real, no solo tipos, y esas **no** corren nativamente
en Node (tirarían error al ejecutar):

```ts
// ❌ enum con valores: genera un objeto en runtime, no es solo un tipo
enum Color {
  Rojo,
  Verde,
  Azul,
}

// ❌ namespace con código ejecutable
namespace Utils {
  export function suma(a: number, b: number) {
    return a + b;
  }
}

// ❌ parameter properties (azúcar de sintaxis que crea propiedades)
class Punto {
  constructor(public x: number, public y: number) {}
}
```

La opción `"erasableSyntaxOnly": true` en `tsconfig.json` (ya configurada
en este proyecto) hace que `tsc` te marque estos casos como error, para que
los detectes en el editor/typecheck antes de que fallen al correr con
`node`. Alternativas que sí funcionan:

```ts
// ✅ union de literales en vez de enum
type Color = "rojo" | "verde" | "azul";

// ✅ un objeto plano si necesitás valores en runtime
const Color = {
  Rojo: "rojo",
  Verde: "verde",
  Azul: "azul",
} as const;

// ✅ propiedades explícitas en el constructor
class Punto {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}
```

Probalo vos mismo: agregá un `enum` con valores en cualquier archivo de
`src/`, corré `npm run typecheck` (te lo marca) y después `node
src/ese-archivo.ts` (falla al ejecutar, porque Node no sabe qué hacer con
esa sintaxis).

## 4. Tipos básicos

```ts
let nombre: string = "Ada";
let edad: number = 30;
let activo: boolean = true;

let tags: string[] = ["backend", "node"];
let tags2: Array<string> = ["backend", "node"]; // equivalente

// Tupla: array de largo y tipos fijos, útil para pares/retornos múltiples
let par: [string, number] = ["puerto", 3000];

// any: apaga el chequeo de tipos. Evitalo salvo casos puntuales (datos externos sin validar).
let cualquiera: any = JSON.parse("{}");

// unknown: como any pero seguro. Te obliga a angostar el tipo antes de usarlo.
let desconocido: unknown = JSON.parse("{}");
if (typeof desconocido === "object" && desconocido !== null) {
  // acá ya podés operar con más confianza
}
```

**Regla práctica de backend**: preferí `unknown` sobre `any` para cualquier
dato que venga de afuera (body de un request, respuesta de una API externa,
`JSON.parse`). Te fuerza a validar antes de confiar.

## 5. `interface` vs `type`

Ambos describen la forma de un objeto. En backend, la diferencia rara vez
importa para el día a día; la convención más común:

```ts
// interface: para formas de objetos/contratos que podrían extenderse
interface Usuario {
  id: number;
  nombre: string;
  email: string;
}

interface UsuarioAdmin extends Usuario {
  permisos: string[];
}

// type: para lo mismo, o para uniones, alias de tipos primitivos, tuplas
type Rol = "admin" | "user" | "guest";
type Coordenada = [number, number];
type UsuarioConRol = Usuario & { rol: Rol }; // intersección, similar a extends
```

Diferencias reales que sí importan:

- `interface` se puede **reabrir** (declararla dos veces la extiende). Útil
  para tipar librerías de terceros, poco común en tu propio código.
- `type` puede representar **uniones** (`"a" | "b"`) e **intersecciones**
  (`A & B`); `interface` no puede ser una unión.

**Convención sugerida**: `interface` para formas de entidades/DTOs propias,
`type` para uniones, tuplas y combinaciones.

## 6. Funciones tipadas

```ts
// Parámetros y retorno tipados explícitamente (recomendado en funciones públicas/exportadas)
function crearUsuario(nombre: string, email: string): Usuario {
  return { id: Date.now(), nombre, email };
}

// Parámetro opcional (?) y con valor por defecto
function saludar(nombre: string, saludo: string = "Hola"): string {
  return `${saludo}, ${nombre}`;
}

function buscar(id: number, opciones?: { incluirInactivos: boolean }): void {
  const incluir = opciones?.incluirInactivos ?? false;
}

// Rest params tipados
function sumarTodos(...numeros: number[]): number {
  return numeros.reduce((acc, n) => acc + n, 0);
}

// Funciones como valores: se tipan con una "function signature"
type Comparador<T> = (a: T, b: T) => number;
const porEdad: Comparador<Usuario> = (a, b) => 0; // ejemplo
```

**Regla práctica**: anotá siempre el tipo de retorno en funciones
exportadas/públicas. Cuesta poco y evita que un cambio interno cambie sin
querer el contrato hacia afuera.

## 7. Union types y narrowing

Una unión dice "esto puede ser A o B". *Narrowing* es la técnica para que
TS "achique" la unión a un tipo concreto dentro de un `if`.

```ts
type Resultado =
  | { ok: true; datos: Usuario }
  | { ok: false; error: string };

function procesar(resultado: Resultado) {
  if (resultado.ok) {
    // acá TS sabe que resultado es { ok: true; datos: Usuario }
    console.log(resultado.datos.nombre);
  } else {
    // acá sabe que es { ok: false; error: string }
    console.error(resultado.error);
  }
}
```

Formas comunes de angostar tipos:

```ts
function formatear(valor: string | number) {
  if (typeof valor === "string") {
    return valor.toUpperCase(); // TS sabe que es string
  }
  return valor.toFixed(2); // acá ya sabe que es number
}

function tieneEmail(x: { email?: string }): x is { email: string } {
  return typeof x.email === "string";
}
```

Este patrón (`{ ok: true, ... } | { ok: false, ... }`), llamado a veces
"discriminated union", es muy usado en backend para modelar resultados de
operaciones que pueden fallar, sin usar excepciones.

## 8. Genéricos

Un genérico es una función o tipo que "recibe un tipo como parámetro". Sirve
para escribir código reutilizable sin perder precisión de tipos.

```ts
// Función genérica: T se infiere del argumento
function primero<T>(lista: T[]): T | undefined {
  return lista[0];
}

primero([1, 2, 3]); // T = number
primero(["a", "b"]); // T = string

// Interface genérica: útil para envolver respuestas de API
interface RespuestaApi<T> {
  data: T;
  error: string | null;
}

const respuesta: RespuestaApi<Usuario[]> = {
  data: [{ id: 1, nombre: "Ada", email: "ada@example.com" }],
  error: null,
};

// Restricción con extends: T debe tener al menos { id: number }
interface ConId {
  id: number;
}
function buscarPorId<T extends ConId>(items: T[], id: number): T | undefined {
  return items.find((item) => item.id === id);
}
```

Mirá `src/demo-repository.ts` para un ejemplo completo de una capa de
datos genérica reutilizable — el patrón que más aparece en backends reales.

## 9. Async/await tipado

```ts
// Promise<T>: el tipo del valor que resuelve la promesa
async function obtenerUsuario(id: number): Promise<Usuario | null> {
  // simulación de un fetch a base de datos
  await new Promise((resolve) => setTimeout(resolve, 10));
  return id === 1 ? { id: 1, nombre: "Ada", email: "ada@example.com" } : null;
}

async function main() {
  const usuario = await obtenerUsuario(1);
  if (usuario) {
    console.log(usuario.nombre);
  }
}

// Promise.all tipado: infiere una tupla de resultados
async function cargarTodo() {
  const [usuario, config] = await Promise.all([
    obtenerUsuario(1),
    Promise.resolve({ puerto: 3000 }),
  ]);
  // usuario: Usuario | null, config: { puerto: number }
}
```

No hace falta nada especial para tipar async/await: TS infiere que una
función `async` siempre devuelve una `Promise`, envolviendo el tipo que
pongas de retorno.

## 10. Manejo de errores

En TS estricto, lo que cae en un `catch` es de tipo `unknown` (no `any`
como en JS suelto), porque en teoría se puede lanzar cualquier cosa, no
solo `Error`.

```ts
async function operacionRiesgosa(): Promise<void> {
  throw new Error("algo falló");
}

async function main() {
  try {
    await operacionRiesgosa();
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("Error desconocido:", error);
    }
  }
}
```

Patrón alternativo, sin excepciones, usando el discriminated union de la
sección 7 — más explícito sobre qué funciones pueden fallar, útil en
lógica de negocio de backend:

```ts
type Resultado<T> = { ok: true; valor: T } | { ok: false; error: string };

function dividir(a: number, b: number): Resultado<number> {
  if (b === 0) return { ok: false, error: "división por cero" };
  return { ok: true, valor: a / b };
}

const resultado = dividir(10, 0);
if (!resultado.ok) {
  console.error(resultado.error);
}
```

## 11. Utility types

TypeScript trae tipos que transforman otros tipos. Los más usados en
backend:

```ts
interface Usuario {
  id: number;
  nombre: string;
  email: string;
  password: string;
}

// Partial<T>: todas las propiedades opcionales — típico en un PATCH/update
type ActualizarUsuario = Partial<Usuario>;
function actualizar(id: number, cambios: ActualizarUsuario) {}

// Pick<T, K>: te quedás solo con algunas propiedades — típico en una respuesta pública
type UsuarioPublico = Pick<Usuario, "id" | "nombre">;

// Omit<T, K>: todas las propiedades menos algunas — útil para "ocultar" el password
type UsuarioSinPassword = Omit<Usuario, "password">;

// Record<K, V>: un objeto con claves de tipo K y valores de tipo V
type Cache = Record<string, Usuario>;
const cache: Cache = {};

// Readonly<T>: todas las propiedades inmutables — útil para config cargada una vez
type ConfigInmutable = Readonly<{ puerto: number; entorno: string }>;
```

## 12. Módulos ESM

Este proyecto usa `"type": "module"` en `package.json`, así que todo es
ESM está estándar:

```ts
// archivo: src/utils.ts
export function suma(a: number, b: number): number {
  return a + b;
}

export interface Config {
  puerto: number;
}
```

```ts
// archivo: src/otro.ts
import { suma, type Config } from "./utils.ts";
//                                        ^^^^ con Node ESM + TS, se importa con extensión .ts explícita
```

Puntos a tener en cuenta:

- Con `moduleResolution: "nodenext"` (ya configurado), los imports locales
  llevan **extensión explícita** (`./utils.ts`), igual que exige Node ESM
  para JS (`./utils.js`).
- `import { type Config }` (o `import type { Config }`) marca que ese
  import es *solo de tipos*: se borra por completo al ejecutar, no genera
  ningún `require`/`import` en runtime. Ayuda a que el stripping sea
  inequívoco.
- `export default` funciona igual que en JS, pero en backend es más común
  usar exports nombrados (`export function`, `export interface`) — más
  fácil de refactorizar y de trackear con el editor.

## 13. Patrones de backend

Con todo lo anterior, así se ven los patrones más comunes al construir un
backend en TS.

### Tipar variables de entorno

Ver `src/demo-env.ts`. La idea: centralizar la lectura de `process.env` en
una única función que valida y devuelve un objeto tipado, en vez de leer
`process.env.LO_QUE_SEA` (siempre `string | undefined`) desde cualquier
lado.

### Tipar request/response (DTOs)

Aunque no uses un framework específico, el patrón es separar:

```ts
// El tipo de lo que entra (lo que mandó el cliente, sin validar todavía)
interface CrearUsuarioRequest {
  nombre: string;
  email: string;
}

// El tipo de lo que devolvés (nunca expongas campos sensibles)
type CrearUsuarioResponse = Pick<Usuario, "id" | "nombre" | "email">;

function crearUsuarioHandler(body: unknown): CrearUsuarioResponse {
  // 1. Validar `body` (con una librería como Zod, o a mano) antes de confiar en su forma.
  // 2. Recién ahí tratarlo como CrearUsuarioRequest.
  const datos = body as CrearUsuarioRequest; // simplificado para el ejemplo
  const usuario: Usuario = { id: 1, password: "hash", ...datos };
  const { password, ...publico } = usuario;
  return publico;
}
```

El punto clave: el `body` de un request **entra como `unknown`** en la
práctica (nadie garantiza su forma en runtime); tiparlo como
`CrearUsuarioRequest` sin validar es una promesa que TS no puede verificar.
En un proyecto real, esa validación la hace algo como
[Zod](https://zod.dev) u otra librería de validación en runtime — TS valida
en tiempo de compilación, no reemplaza la validación de datos externos.

### Capa de datos con genéricos

Ver `src/demo-repository.ts`: una clase `InMemoryRepository<T>` reutilizable
para cualquier entidad con `id`. El mismo patrón se traslada a un
repository real sobre una base de datos, cambiando el `Map` interno por
llamadas a un cliente SQL/NoSQL, sin cambiar la interfaz pública.

---

## Verificación rápida

```bash
node src/index.ts               # corre la lección 1 (type stripping en acción)
node src/demo-env.ts            # corre el patrón de env vars
node src/demo-repository.ts     # corre el patrón de repository genérico
npm run typecheck               # chequea tipos de todo src/, sin ejecutar ni generar JS
```
