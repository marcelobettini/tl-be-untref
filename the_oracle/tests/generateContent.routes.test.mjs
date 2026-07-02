// THE ORACLE — tests de integración de /generate-content.
// Usa node:test (nativo) + supertest. Mockea el servicio vía DI (sin loader hooks).

import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import request from "supertest";
import { buildGenerateContentRouter } from "../src/routes/generateContent.routes.mjs";
import { AppError } from "../src/errors/AppError.mjs";
import { DEFAULT_MODEL, PROMPT_MAX_LENGTH } from "../src/config.mjs";

// --- Fixtures de prueba ---------------------------------------------------

function buildApp(ask) {
  const app = express();
  app.use(express.json());
  app.use("/", buildGenerateContentRouter({ ask }));
  return app;
}

function okService(text = "mocked answer", model = DEFAULT_MODEL) {
  return async () => ({ text, model });
}

function failingService(statusCode, kind, safeMessage) {
  return async () => {
    throw new AppError({ statusCode, safeMessage, kind });
  };
}

// --- Tests -----------------------------------------------------------------

test("POST /generate-content returns 200 with { text, model } on success", async () => {
  const app = buildApp(okService("hello world", DEFAULT_MODEL));
  const res = await request(app)
    .post("/generate-content")
    .send({ question: "hi" });
  assert.equal(res.status, 200);
  assert.equal(res.body.text, "hello world");
  assert.equal(res.body.model, DEFAULT_MODEL);
});

test("POST /generate-content returns 400 when body is missing", async () => {
  const app = buildApp(okService());
  const res = await request(app)
    .post("/generate-content")
    .set("Content-Type", "application/json")
    .send("");
  assert.equal(res.status, 400);
});

test("POST /generate-content returns 400 when question is missing", async () => {
  const app = buildApp(okService());
  const res = await request(app).post("/generate-content").send({});
  assert.equal(res.status, 400);
});

test("POST /generate-content returns 400 when question is empty", async () => {
  const app = buildApp(okService());
  const res = await request(app)
    .post("/generate-content")
    .send({ question: "" });
  assert.equal(res.status, 400);
});

test("POST /generate-content returns 400 when question is not a string", async () => {
  const app = buildApp(okService());
  const res = await request(app)
    .post("/generate-content")
    .send({ question: 123 });
  assert.equal(res.status, 400);
});

test("POST /generate-content returns 400 when question exceeds max length", async () => {
  const app = buildApp(okService());
  const res = await request(app)
    .post("/generate-content")
    .send({ question: "x".repeat(PROMPT_MAX_LENGTH + 1) });
  assert.equal(res.status, 400);
});

test("POST /generate-content propagates AppError from service via next(err)", async () => {
  // En F4 el errorHandler renderizará esto. Aquí verificamos que el error
  // se reenvía (el manejador por defecto de Express lo convierte a 500 en
  // ausencia de un manejador custom). Sin errorHandler registrado, Express devuelve
  // 500 — pero el stack/cause sigue dentro del ciclo de vida de la petición.
  const app = buildApp(
    failingService(
      502,
      "gemini",
      "Upstream AI service is currently unavailable",
    ),
  );
  const res = await request(app)
    .post("/generate-content")
    .send({ question: "hi" });
  // F3 aún no registra errorHandler, así que entra el manejador por defecto de Express.
  // Solo comprobamos que la petición NO responde 200.
  assert.notEqual(res.status, 200);
});
