// THE ORACLE — /generate-content integration tests.
// Uses node:test (native) + supertest. Mocks the service via DI (no loader hooks).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import request from 'supertest';
import { buildGenerateContentRouter } from '../src/routes/generateContent.routes.mjs';
import { AppError } from '../src/errors/AppError.mjs';

// --- Test fixtures ---------------------------------------------------------

function buildApp(ask) {
  const app = express();
  app.use(express.json());
  app.use('/', buildGenerateContentRouter({ ask }));
  return app;
}

function okService(text = 'mocked answer', model = 'gemini-1.5-flash') {
  return async () => ({ text, model });
}

function failingService(statusCode, kind, safeMessage) {
  return async () => {
    throw new AppError({ statusCode, safeMessage, kind });
  };
}

// --- Tests -----------------------------------------------------------------

test('POST /generate-content returns 200 with { text, model } on success', async () => {
  const app = buildApp(okService('hello world', 'gemini-1.5-flash'));
  const res = await request(app)
    .post('/generate-content')
    .send({ question: 'hi' });
  assert.equal(res.status, 200);
  assert.equal(res.body.text, 'hello world');
  assert.equal(res.body.model, 'gemini-1.5-flash');
});

test('POST /generate-content returns 400 when body is missing', async () => {
  const app = buildApp(okService());
  const res = await request(app)
    .post('/generate-content')
    .set('Content-Type', 'application/json')
    .send('');
  assert.equal(res.status, 400);
});

test('POST /generate-content returns 400 when question is missing', async () => {
  const app = buildApp(okService());
  const res = await request(app)
    .post('/generate-content')
    .send({});
  assert.equal(res.status, 400);
});

test('POST /generate-content returns 400 when question is empty', async () => {
  const app = buildApp(okService());
  const res = await request(app)
    .post('/generate-content')
    .send({ question: '' });
  assert.equal(res.status, 400);
});

test('POST /generate-content returns 400 when question is not a string', async () => {
  const app = buildApp(okService());
  const res = await request(app)
    .post('/generate-content')
    .send({ question: 123 });
  assert.equal(res.status, 400);
});

test('POST /generate-content returns 400 when question exceeds max length', async () => {
  const app = buildApp(okService());
  const res = await request(app)
    .post('/generate-content')
    .send({ question: 'x'.repeat(1001) });
  assert.equal(res.status, 400);
});

test('POST /generate-content propagates AppError from service via next(err)', async () => {
  // In F4 the errorHandler will render this. Here we verify the error
  // is forwarded (Express default handler converts it to 500 in absence of
  // a custom error handler). With no errorHandler wired, Express returns
  // 500 — but the stack/cause is still inside the request lifecycle.
  const app = buildApp(failingService(502, 'gemini', 'Upstream AI service is currently unavailable'));
  const res = await request(app)
    .post('/generate-content')
    .send({ question: 'hi' });
  // F3 wires no errorHandler yet, so the default Express handler kicks in.
  // We just assert that the request does NOT 200.
  assert.notEqual(res.status, 200);
});
