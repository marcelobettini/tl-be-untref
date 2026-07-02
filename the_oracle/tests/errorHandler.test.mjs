// THE ORACLE — errorHandler unit tests.
// Verifies the 8 mapping paths and the no-leak guarantee.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import request from 'supertest';
import { errorHandler } from '../src/middlewares/errorHandler.mjs';
import { AppError } from '../src/errors/AppError.mjs';

// --- Test fixtures ---------------------------------------------------------

function buildApp(throwingHandler) {
  const app = express();
  app.use(express.json());
  app.get('/throw', throwingHandler);
  app.use(errorHandler);
  return app;
}

function makeSdkError({ reason, status, statusText, message } = {}) {
  // Mirrors the real SDK's error shape. The errorDetails are a JSON STRING in
  // the actual fetch path (we saw it in the manual smoke test of F3).
  const err = new Error(message ?? `[GoogleGenerativeAI Error]: ${reason}`);
  err.name = 'GoogleGenerativeAIFetchError';
  if (status !== undefined) err.status = status;
  if (statusText) err.statusText = statusText;
  if (reason) {
    err.errorDetails = JSON.stringify([
      { '@type': 'type.googleapis.com/google.rpc.ErrorInfo', reason, domain: 'googleapis.com' },
    ]);
  }
  return err;
}

// --- Tests -----------------------------------------------------------------

test('errorHandler renders 400 validation with safe message', async () => {
  const app = buildApp((_req, _res, next) => {
    next(new AppError({ statusCode: 400, safeMessage: 'Bad request', kind: 'validation' }));
  });
  const res = await request(app).get('/throw');
  assert.equal(res.status, 400);
  assert.deepEqual(res.body, { error: { status: 400, message: 'Bad request' } });
});

test('errorHandler refines 401 when SDK cause has API_KEY_INVALID in errorDetails', async () => {
  const app = buildApp((_req, _res, next) => {
    const sdkErr = makeSdkError({ reason: 'API_KEY_INVALID' });
    next(new AppError({
      statusCode: 502,
      safeMessage: 'Upstream service unavailable',
      internalMessage: 'Gemini call failed',
      kind: 'gemini',
    }, sdkErr));
  });
  const res = await request(app).get('/throw');
  assert.equal(res.status, 401);
  assert.equal(res.body.error.message, 'Unauthorized');
  // Leak check: the response must not contain any SDK field.
  const bodyStr = JSON.stringify(res.body);
  assert.doesNotMatch(bodyStr, /API_KEY_INVALID/);
  assert.doesNotMatch(bodyStr, /googleapis\.com/);
  assert.doesNotMatch(bodyStr, /type\.googleapis\.com/);
});

test('errorHandler refines 429 when SDK cause has RESOURCE_EXHAUSTED', async () => {
  const app = buildApp((_req, _res, next) => {
    const sdkErr = makeSdkError({ reason: 'RESOURCE_EXHAUSTED' });
    next(new AppError({ statusCode: 502, safeMessage: 'x', kind: 'gemini' }, sdkErr));
  });
  const res = await request(app).get('/throw');
  assert.equal(res.status, 429);
  assert.equal(res.body.error.message, 'Too many requests');
  assert.doesNotMatch(JSON.stringify(res.body), /RESOURCE_EXHAUSTED/);
});

test('errorHandler refines 408 when SDK cause has DEADLINE_EXCEEDED', async () => {
  const app = buildApp((_req, _res, next) => {
    const sdkErr = makeSdkError({ reason: 'DEADLINE_EXCEEDED' });
    next(new AppError({ statusCode: 502, safeMessage: 'x', kind: 'gemini' }, sdkErr));
  });
  const res = await request(app).get('/throw');
  assert.equal(res.status, 408);
  assert.equal(res.body.error.message, 'Request timeout');
});

test('errorHandler refines 503 when SDK cause has UNAVAILABLE', async () => {
  const app = buildApp((_req, _res, next) => {
    const sdkErr = makeSdkError({ reason: 'UNAVAILABLE' });
    next(new AppError({ statusCode: 502, safeMessage: 'x', kind: 'gemini' }, sdkErr));
  });
  const res = await request(app).get('/throw');
  assert.equal(res.status, 503);
});

test('errorHandler refines 403 when SDK cause has PERMISSION_DENIED', async () => {
  const app = buildApp((_req, _res, next) => {
    const sdkErr = makeSdkError({ reason: 'PERMISSION_DENIED' });
    next(new AppError({ statusCode: 502, safeMessage: 'x', kind: 'gemini' }, sdkErr));
  });
  const res = await request(app).get('/throw');
  assert.equal(res.status, 403);
});

test('errorHandler refines 404 when SDK cause has NOT_FOUND', async () => {
  const app = buildApp((_req, _res, next) => {
    const sdkErr = makeSdkError({ reason: 'NOT_FOUND' });
    next(new AppError({ statusCode: 502, safeMessage: 'x', kind: 'gemini' }, sdkErr));
  });
  const res = await request(app).get('/throw');
  assert.equal(res.status, 404);
});

test('errorHandler uses cause.status when SDK provides upstream HTTP code', async () => {
  // Some SDK errors have status (HTTP) but no structured reason. Trust the
  // HTTP code when it's a known Gemini-style status.
  const app = buildApp((_req, _res, next) => {
    const sdkErr = makeSdkError({ status: 429 });
    next(new AppError({ statusCode: 502, safeMessage: 'x', kind: 'gemini' }, sdkErr));
  });
  const res = await request(app).get('/throw');
  assert.equal(res.status, 429);
  assert.doesNotMatch(JSON.stringify(res.body), /\[GoogleGenerativeAI Error\]/);
});

test('errorHandler falls back to 502 when gemini cause is empty', async () => {
  const app = buildApp((_req, _res, next) => {
    next(new AppError({ statusCode: 502, safeMessage: 'x', kind: 'gemini' }));
  });
  const res = await request(app).get('/throw');
  assert.equal(res.status, 502);
  assert.equal(res.body.error.message, 'Upstream service unavailable');
});

test('errorHandler maps unknown errors to 500 without leaking', async () => {
  const app = buildApp((_req, _res, next) => {
    next(new Error('SECRET INTERNAL: db connection string was postgres://user:pass@host'));
  });
  const res = await request(app).get('/throw');
  assert.equal(res.status, 500);
  assert.equal(res.body.error.message, 'Internal server error');
  // CRITICAL: the secret string must not appear anywhere in the response.
  assert.doesNotMatch(JSON.stringify(res.body), /SECRET INTERNAL/);
  assert.doesNotMatch(JSON.stringify(res.body), /postgres/);
  assert.doesNotMatch(JSON.stringify(res.body), /pass/);
});

test('errorHandler maps unknown errors without AppError wrapper to 500', async () => {
  const app = buildApp((_req, _res, next) => {
    next(new TypeError('boom'));
  });
  const res = await request(app).get('/throw');
  assert.equal(res.status, 500);
  assert.doesNotMatch(JSON.stringify(res.body), /boom/);
});

test('errorHandler: semantic reason wins over upstream HTTP status (API_KEY_INVALID with status 400 -> 401)', async () => {
  // This is the real-world case: when GEMINI_API_KEY is invalid, the SDK
  // surfaces an HTTP 400 from the upstream (because Google validates the key
  // and returns Bad Request) AND a structured reason API_KEY_INVALID. The
  // semantic reason MUST win so the client sees 401 (Unauthorized), not 400.
  const app = buildApp((_req, _res, next) => {
    const sdkErr = makeSdkError({ reason: 'API_KEY_INVALID', status: 400 });
    next(new AppError({ statusCode: 502, safeMessage: 'x', kind: 'gemini' }, sdkErr));
  });
  const res = await request(app).get('/throw');
  assert.equal(res.status, 401);
  assert.equal(res.body.error.message, 'Unauthorized');
  // No SDK fields leaked.
  const bodyStr = JSON.stringify(res.body);
  assert.doesNotMatch(bodyStr, /API_KEY_INVALID/);
  assert.doesNotMatch(bodyStr, /googleapis\.com/);
});
