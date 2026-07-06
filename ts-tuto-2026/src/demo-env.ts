// Corré esto con: node src/demo-env.ts
// Patrón backend típico: tipar process.env para no repartir `string | undefined` por todo el código.

interface EnvConfig {
  NODE_ENV: "development" | "production" | "test";
  PORT: number;
}

// process.env.ALGO siempre es `string | undefined` en TS (@types/node lo tipa así).
// Esta función centraliza la validación y la conversión, una sola vez.
function loadEnv(): EnvConfig {
  const nodeEnv = process.env.NODE_ENV ?? "development";
  if (nodeEnv !== "development" && nodeEnv !== "production" && nodeEnv !== "test") {
    throw new Error(`NODE_ENV inválido: ${nodeEnv}`);
  }

  const port = Number(process.env.PORT ?? "3000");
  if (Number.isNaN(port)) {
    throw new Error("PORT debe ser numérico");
  }

  return { NODE_ENV: nodeEnv, PORT: port };
}

const env = loadEnv();
console.log(`Arrancando en modo "${env.NODE_ENV}" en el puerto ${env.PORT}`);

// De acá en adelante, en el resto del backend, `env.PORT` es `number` y
// `env.NODE_ENV` es la unión literal, no `string`. Nunca más undefined-checks.
