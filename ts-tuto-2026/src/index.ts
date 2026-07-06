// Corré esto con: node src/index.ts
// Node 24 borra los tipos en runtime y ejecuta el JS resultante. Sin ts-node, sin build.

interface Saludo {
  nombre: string;
  idioma?: "es" | "en"; // opcional, con valores restringidos
}

function saludar({ nombre, idioma = "es" }: Saludo): string {
  const mensajes: Record<"es" | "en", string> = {
    es: `Hola, ${nombre}!`,
    en: `Hello, ${nombre}!`,
  };
  return mensajes[idioma];
}

console.log(saludar({ nombre: "Marcelo" }));
console.log(saludar({ nombre: "World", idioma: "en" }));

// Probá esto: cambiá idioma a "fr" y mirá cómo tu editor (o `npm run typecheck`)
// lo marca en rojo. Pero si corrés `node src/index.ts` igual, el programa
// ejecuta sin problema: Node no chequea tipos, solo los quita.
