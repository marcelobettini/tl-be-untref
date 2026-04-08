// ============================================================
// TEMA 4: FUNCIONES
// Ejecutar con: node 04-funciones.js
// ============================================================

// ------------------------------------------------------------
// INTRODUCCIÓN
// ------------------------------------------------------------
// Las funciones son bloques de código reutilizables.
// En JavaScript, las funciones son ciudadanos de primera clase
// (first-class citizens): se pueden asignar a variables,
// pasar como argumentos y retornar desde otras funciones.
//
// Existen tres formas principales de definir una función:
//   1. Declaración de función  (function declaration)
//   2. Expresión de función    (function expression / anónima)
//   3. Función flecha          (arrow function)
//
// NO son intercambiables al 100%: difieren en hoisting y en
// cómo tratan "this" y "arguments". Lo veremos en detalle.
// ------------------------------------------------------------


// ============================================================
// SECCIÓN A — Declaración de función (Function Declaration)
// ============================================================

// ------------------------------------------------------------
// CONCEPTO: Se declara con la palabra clave "function" seguida
// de un nombre. Es la forma más clásica.
//
// HOISTING: las declaraciones de función se "elevan" completas
// (nombre + cuerpo) al inicio de su scope. Esto significa que
// se pueden llamar ANTES de donde aparecen en el código.
// ------------------------------------------------------------

console.log("--- DECLARACIÓN DE FUNCIÓN ---");

// Llamada ANTES de la declaración — funciona por hoisting:
console.log(saludar("Martín")); // "Hola, Martín!"

function saludar(nombre) {
    return `Hola ${nombre}!`;
}

// Llamada normal DESPUÉS de la declaración:
console.log(saludar("Elena")); // "Hola, Elena!"


// ============================================================;
// SECCIÓN B — Función anónima (Function Expression)
// ============================================================

// ------------------------------------------------------------
// CONCEPTO: Una función sin nombre asignada a una variable.
// La variable contiene la referencia a la función.
//
// DIFERENCIA CLAVE con declaración:
// NO tiene hoisting completo. La variable se eleva (como
// cualquier var/let/const), pero su valor (la función) NO.
// Llamarla antes de su asignación lanza TypeError o ReferenceError.
// ------------------------------------------------------------

console.log("\n--- FUNCIÓN ANÓNIMA (EXPRESIÓN) ---");
const multiplicar = function (a, b) {
    return a * b;
};
console.log("5 x 4 =", multiplicar(5, 4)); // 20

// ------------------------------------------------------------
// Función anónima como argumento (callback)
// ------------------------------------------------------------
// Este es el uso más común de las funciones anónimas:
// pasarlas como argumento a otra función.

const numeros = [3, 1, 4, 1, 51, 9, 2, 6];

const ordenados = numeros.toSorted(function (a, b) {
    return a - b;
});

// con arrow function:
const ordenadosConArrow = numeros.toSorted((a, b) => a - b);
console.log(ordenadosConArrow);


// ============================================================
// SECCIÓN C — Función flecha (Arrow Function)
// ============================================================

// ------------------------------------------------------------
// CONCEPTO: Sintaxis más concisa introducida en ES6 (2015).
// const nombre = (parámetros) => expresión o { cuerpo }
//
// REGLAS DE SINTAXIS:
//   - Sin parámetros:        ()  => ...
//   - Un parámetro:          x   => ...   (paréntesis opcionales)
//   - Dos o más parámetros:  (x, y) => ...
//   - Cuerpo de una línea:   => expresión (return implícito)
//   - Cuerpo multilínea:     => { ...; return ...; }
//
// DIFERENCIAS IMPORTANTES vs funciones normales:
//   1. No tiene su propio "this" (lo hereda del scope circundante)
//   2. No tiene objeto "arguments"
//   3. No puede usarse como constructor (no se puede hacer new)
//   4. No tiene hoisting (igual que function expression)
// ------------------------------------------------------------

console.log("\n--- FUNCIÓN FLECHA ---");

const cuadradoA = (n) => {
    return n * n;
};
// Si se trata de un "one-liner", podemos omitir las llaves y el retorno, pues el retorno es implícito

const cuadradoAMejorado = (n) => n * n;