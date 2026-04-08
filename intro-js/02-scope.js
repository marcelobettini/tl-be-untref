// ============================================================
// TEMA 2: SCOPE (ÁMBITO DE VARIABLES)
// Ejecutar con: node 02-scope.js
// ============================================================

// ------------------------------------------------------------
// INTRODUCCIÓN
// ------------------------------------------------------------
// El scope define desde dónde es accesible una variable.
// En JavaScript existen tres niveles:
//
//  1. Global scope   → accesible desde cualquier parte del archivo
//  2. Function scope → accesible solo dentro de la función donde fue declarada
//  3. Block scope    → accesible solo dentro del bloque {} donde fue declarada
//
// El keyword que usemos (var / let / const) determina
// cuál de estos scopes aplica.
// ------------------------------------------------------------
// ============================================================
// SECCIÓN A — Scope global
// ============================================================
console.log("--- SCOPE GLOBAL ---");
let planet = "Marte"; //Variable global
function showPlanet() {
    // Esta función PUEDE leer la variable global
    console.log(planet);
}

showPlanet();

// ============================================================
// SECCIÓN B — Function scope (var)
// ============================================================

// ------------------------------------------------------------
// CONCEPTO: var vive en el scope de la función que la contiene.
// Si no hay función, vive en el scope global.
// NO respeta los bloques {} (if, for, while, etc.)
// ------------------------------------------------------------

console.log("\n function scope con var");
function exampleFuncScope() {
    var internal = "Internal Value";
    console.log("Dentro de la función:", internal);
}
exampleFuncScope();
// console.log(internal); //ReferenceError: internal is not defined

// ------------------------------------------------------------
// PROBLEMA clásico: var NO respeta bloques {}
// ------------------------------------------------------------

console.log("\n--- var y bloques {} ---");
var condition = true;

if (condition) {
    var messageVar = "creado dentro del if con var";
    let messageLet = "creado dentro del if con let";
}
console.log(messageVar); // Accesible -> var se escapó del bloque
// console.log(messageLet); //ReferenceError: messageLet is not defined



// ============================================================
// SECCIÓN C — Block scope (let y const)
// ============================================================

// ------------------------------------------------------------
// CONCEPTO: let y const están limitadas al bloque {} más cercano.
// Un bloque es cualquier par de llaves: if, for, while, funciones,
// incluso un bloque vacío { }.
// ------------------------------------------------------------

console.log("\n--- block scope con let y const ---");
{
    let insideTheBlock = "vivo en este bloque";
    const LIMIT = 20;
    // console.log("Dentro:", insideTheBlock, "- Límite:", LIMIT);
    //template literals
    console.log(`Dentro: ${insideTheBlock}. | Límite: ${LIMIT}.`);
}
// console.log(`Dentro: ${insideTheBlock}. | Límite: ${LIMIT}.`);// ReferenceError: Variables no existen, en realidad, se rompe con el primer intento de acceso

// ============================================================
// SECCIÓN D — Shadowing (sombreado -pisado- de variables)
// ============================================================

// ------------------------------------------------------------
// CONCEPTO: Shadowing ocurre cuando una variable en un scope
// interno tiene el mismo nombre que una en un scope externo.
// La variable interna "tapa" (shadea) a la externa dentro
// de ese bloque, sin modificarla.
// ------------------------------------------------------------

let coin = "ARS"; //scope externo
{
    let coin = "USD";
    console.log(coin); //USD
}
console.log(coin);//ARS

// ============================================================
// RESUMEN CONCEPTUAL
// ============================================================
// • var  → scope de función (se escapa de bloques if/for/while)
// • let  → scope de bloque {}
// • const → scope de bloque {}
// • La scope chain busca variables de adentro hacia afuera.
// • Shadowing permite reusar nombres en scopes distintos
//   sin pisar la variable del scope padre.
// ============================================================











