// THE ORACLE — gemini.service unit tests.
// Uses node:test (native). Mocks the generative model via dependency injection
// (the second arg of askGemini), so we don't need loader hooks or external libs.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { askGemini } from '../src/services/gemini.service.mjs';
import { AppError } from '../src/errors/AppError.mjs';

// --- Test fixtures ---------------------------------------------------------

function fakeModel(behavior) {
  return { generateContent: behavior };
}

function makeSdkError(reason, opts = {}) {
  // Mirrors the SDK's error shape: prefixed message + optional .status
  const err = new Error(`[GoogleGenerativeAI Error]: ${reason}`);
  err.name = 'GoogleGenerativeAIFetchError';
  if (opts.status !== undefined) err.status = opts.status;
  if (opts.statusText) err.statusText = opts.statusText;
  return err;
}

// --- Tests -----------------------------------------------------------------

test('askGemini returns { text, model } on success', async () => {
  const model = fakeModel(async () => ({
    response: { text: () => 'hello world' },
  }));
  const out = await askGemini('hi', { model, modelName: 'gemini-2.0-flash' });
  assert.equal(out.text, 'hello world');
  assert.equal(out.model, 'gemini-2.0-flash');
});

test('askGemini throws AppError 400 on empty prompt', async () => {
  const model = fakeModel(async () => { throw new Error('should not be called'); });
  await assert.rejects(
    () => askGemini('', { model }),
    (err) => err instanceof AppError && err.statusCode === 400 && err.kind === 'validation',
  );
});

test('askGemini throws AppError 400 on non-string prompt', async () => {
  const model = fakeModel(async () => { throw new Error('should not be called'); });
  await assert.rejects(
    () => askGemini(null, { model }),
    (err) => err.statusCode === 400 && err.kind === 'validation',
  );
});

test('askGemini wraps SDK errors in AppError 502 with cause attached', async () => {
  const sdkErr = makeSdkError('RESOURCE_EXHAUSTED', { status: 429 });
  const model = fakeModel(async () => { throw sdkErr; });
  await assert.rejects(
    () => askGemini('hi', { model }),
    (err) => {
      assert.ok(err instanceof AppError);
      assert.equal(err.statusCode, 502); // default; F4 will refine
      assert.equal(err.kind, 'gemini');
      assert.strictEqual(err.cause, sdkErr, 'must preserve cause for F4');
      assert.match(err.cause.message, /RESOURCE_EXHAUSTED/);
      return true;
    },
  );
});

test('askGemini throws AppError 500 (config) when GEMINI_API_KEY missing and no model injected', async () => {
  delete process.env.GEMINI_API_KEY;
  await assert.rejects(
    () => askGemini('hi'),
    (err) => err instanceof AppError && err.statusCode === 500 && err.kind === 'config',
  );
});
