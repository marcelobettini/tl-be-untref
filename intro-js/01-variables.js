// ============================================================
// TEMA 1: VARIABLES — var, let, const
// Ejecutar con: node 01-variables.js
// ============================================================

// ------------------------------------------------------------
// INTRODUCCIÓN
// ------------------------------------------------------------
// En JavaScript existen tres formas de declarar variables.
// La diferencia no es solo sintáctica: cambia su comportamiento
// en memoria, reasignación y scope (lo vamos a ver enseguida, en el archivo 02).
//
//  | Keyword | Reasignable | Redeclarable | Scope    | Hoisting        |
//  |---------|-------------|--------------|----------|-----------------|
//  | var     | ✅          | ✅           | función  | sí (como undef) |
//  | let     | ✅          | ❌           | bloque   | sí (TDZ*)       |
//  | const   | ❌          | ❌           | bloque   | sí (TDZ*)       |
//
// *TDZ = Temporal Dead Zone: la variable existe pero no se puede
//  usar hasta que el intérprete llega a la línea de declaración.
// ------------------------------------------------------------

console.log("--- hoisting con var ---");
console.log("La ciudad es:", city); //undefined - No lanza error por el Hoisting
var city = "Trenque Lauquen";
console.log("La ciudad es:", city); // Trenque Lauquen

// ------------------------------------------------------------
// CONCEPTO: var se puede redeclarar sin error
// ------------------------------------------------------------
var temp = 20;
var temp = 30; // redeclaración es válida con var
console.log(temp); // 30


// ============================================================
// SECCIÓN B — let
// ============================================================

// ------------------------------------------------------------
// CONCEPTO: let no se puede redeclarar en el mismo scope
// ------------------------------------------------------------

console.log("\n--- let ---");
let firstName = "Laura";
firstName = "Romy"; // Reasignación está ok
console.log(firstName); // Romy
// let firstName = "pepe"; // Lanzaría Syntax Error ->  Identifier 'firstName' has already been declared


// ------------------------------------------------------------
// CONCEPTO: TDZ (Temporal Dead Zone) con let
// ------------------------------------------------------------
// A diferencia de var, acceder a una variable let antes de su
// declaración lanza ReferenceError, no devuelve undefined.
// El bloque siguiente está comentado a propósito.
// console.log(counter); //ReferenceError: Cannot access 'counter' before initialization
// let counter = 100;

// ============================================================
// SECCIÓN C — const
// ============================================================

// ------------------------------------------------------------
// CONCEPTO: const requiere valor inicial y no se puede reasignar
// ------------------------------------------------------------

console.log("\n--- const ---");
const PI = 3.141592;
console.log("PI value is:", PI);
// PI = 4; //TypeError: Assignment to constant variable.

// ============================================================
// RESUMEN CONCEPTUAL
// ============================================================
// • Usá const por defecto.
// • Usá let cuando necesitás reasignar.
// • Evitá var en código moderno: su scope de función y su
//   permisividad (redeclaración, hoisting silencioso) generan
//   bugs difíciles de rastrear.
// ============================================================
