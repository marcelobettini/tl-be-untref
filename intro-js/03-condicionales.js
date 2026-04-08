// ============================================================
// TEMA 3: CONDICIONALES
// Ejecutar con: node 03-condicionales.js
// ============================================================

// ------------------------------------------------------------
// INTRODUCCIÓN
// ------------------------------------------------------------
// Los condicionales permiten ejecutar código según si una
// condición es verdadera o falsa.
//
// JavaScript evalúa condiciones como valores booleanos.
// Valores "falsy" (se evalúan como false):
//   false, 0, "", null, undefined, NaN
// Todo lo demás es "truthy" (se evalúa como true).
// ------------------------------------------------------------


// ============================================================
// SECCIÓN A — if / else if / else
// ============================================================
// ------------------------------------------------------------
// CONCEPTO: Estructura básica
// if (condición) { ... } else if (condición) { ... } else { ... }
// Solo se ejecuta el PRIMER bloque cuya condición sea verdadera.
// ------------------------------------------------------------

console.log("--- IF / ELSE IF / ELSE ---");

const temperatura = 22;


if (temperatura > 30) {
    console.log("Hace calor");
} else if (temperatura >= 20) {
    console.log("Temperatura agradable"); // ← se ejecuta este
} else if (temperatura >= 10) {
    console.log("Fresco");
} else {
    console.log("Hace frío");
}



// ============================================================
// SECCIÓN B — Operador ternario
// ============================================================

// ------------------------------------------------------------
// CONCEPTO: condición ? valorSiTrue : valorSiFalse
//
// Es una expresión (devuelve un valor), no una sentencia.
// Ideal para asignaciones simples. No reemplaza a if cuando
// la lógica tiene efectos secundarios o múltiples ramas.
// ------------------------------------------------------------

console.log("\n--- OPERADOR TERNARIO ---");
const edad = 200;
// let acceso;
// if (edad >= 18) {
//     acceso = "permitido";
// } else {
//     acceso = "denegado";
// }
const acceso = edad >= 18 ? "permitido" : "denegado";

console.log("Acceso", acceso);


// ============================================================
// Ternario anidado (Ojito, con precaución)
// ============================================================
// Los ternarios se pueden anidar, pero abusar de esto daña
// la legibilidad. Este ejercicio existe para que lo conozcas
// y sepas CUÁNDO NO usarlo.

const puntos = 75;

// ternario anidado — difícil de leer:
const calificacion = puntos >= 90 ? "A"
    : puntos >= 80 ? "B"
        : puntos >= 70 ? "C"
            : "F";

console.log("Calificación:", calificacion); // C



const today = 61;
let message = "";

switch (today) {
    case 0:
        message = "domingo";
        break;
    case 1:
        message = "lunes";
        break;
    case 2:
        message = "martes";
        break;
    case 3:
        message = "miércoles";
        break;
    case 4:
        message = "jueves";
        break;
    case 5:
        message = "viernes";
        break;
    case 6:
        message = "sábado";
        break;
    default:
        message = "Ni idea";
}
console.log("Hoy es:", message);



// ============================================================
// SECCIÓN D — Operadores lógicos: AND, OR, NOT
// ============================================================

// ------------------------------------------------------------
// CONCEPTO: &&  (AND) — ambas condiciones deben ser verdaderas
//           ||  (OR)  — al menos una condición debe ser verdadera
//           !   (NOT) — invierte el valor booleano
//
// Short-circuit evaluation (evaluación en cortocircuito):
//   &&  Si el primer operando es falsy, NO evalúa el segundo.
//   ||  Si el primer operando es truthy, NO evalúa el segundo.
//
// Esto tiene consecuencias importantes para el rendimiento
// y para patrones comunes como valores por defecto.
// ------------------------------------------------------------

console.log("\n--- OPERADORES LÓGICOS ---");

// AND (&&)
const tieneEntrada = true;
const esMayorDeEdad = true;

if (tieneEntrada && esMayorDeEdad) {
    console.log("Puede entrar"); // ← se ejecuta
}


// OR (||)
const esAdmin = false;
const esModerador = true;

if (esAdmin || esModerador) {
    console.log("Tiene permisos elevados"); // ← se ejecuta
}


// NOT (!)
const estaLogueado = false;
console.log("¿Necesita login?", !estaLogueado); // true


// ------------------------------------------------------------
// Short-circuit con || para valor por defecto
// ------------------------------------------------------------

const nombreUsuario = "Cacho";
const nombreMostrado = nombreUsuario || "Invitado"; //Falsy y Truthy values


// ------------------------------------------------------------
// Short-circuit con && para ejecución condicional
// ------------------------------------------------------------


const debug = true;
// if (debug === true) {
//     console.log("Modo debug activo 🪳");
// }

debug && console.log("Modo debug activo 🪳");


// ============================================================
// RESUMEN CONCEPTUAL
// ============================================================
// • if/else if/else → múltiples condiciones, cualquier tipo
// • ternario        → asignación simple con dos ramas
// • switch          → comparación de un valor contra casos fijos
//                     siempre con break (salvo fallthrough intencional)
// • &&  → AND: ambas verdaderas / short-circuit si primera es falsy
// • ||  → OR:  una verdadera  / short-circuit si primera es truthy
// • !   → NOT: invierte el booleano
// • Falsy: false, 0, "", null, undefined, NaN
// • Truthy: todo lo demás (incluyendo "0", [], {})
// ============================================================