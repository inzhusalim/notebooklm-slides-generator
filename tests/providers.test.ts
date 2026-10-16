import test from 'node:test';
import assert from 'node:assert/strict';
import { generateDeck } from '../lib/generator';
import { generateWithLLM, GenerateInput } from '../lib/llm';
const input: GenerateInput = { topic: 'Фотосинтез', template: 'study', count: 5, apiKey: 'test-key-for-contract-only', model: 'test-model', provider: 'openai' };
const slides = generateDeck(input.topic, input.template, input.count).slides;
test('OpenAI contract: schema, non-persistence, header authentication and response parsing', async () => {
  const fetcher: typeof fetch = async (url, options) => {
    assert.equal(url, 'https://api.openai.com/v1/responses');
    assert.equal(new Headers(options?.headers).get('Authorization'), 'Bearer ' + input.apiKey);
    const body = JSON.parse(options!.body as string);
    assert.equal(body.store, false);
    assert.equal(body.text.format.type, 'json_schema');
    return Response.json({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify({ slides }) }] }] });
  };
  const deck = await generateWithLLM(input, fetcher);
  assert.equal(deck.mode, 'ai'); assert.equal(deck.slides.length, 5);
  assert.equal(JSON.stringify(deck).includes(input.apiKey), false);
});
test('Gemini contract: safe model path, key header and structured JSON response', async () => {
  const fetcher: typeof fetch = async (url, options) => {
    assert.ok(String(url).startsWith('https://generativelanguage.googleapis.com/v1beta/models/'));
    assert.equal(new Headers(options?.headers).get('x-goog-api-key'), input.apiKey);
    const body = JSON.parse(options!.body as string);
    assert.equal(body.generationConfig.responseFormat.text.mimeType, 'application/json');
    return Response.json({ candidates: [{ content: { parts: [{ text: JSON.stringify({ slides }) }] } }] });
  };
  assert.equal((await generateWithLLM({ ...input, provider: 'gemini' }, fetcher)).slides.length, 5);
});
test('provider failures and malformed content yield actionable errors', async () => {
  await assert.rejects(generateWithLLM(input, async () => new Response('', { status: 401 })), /ключ/);
  await assert.rejects(generateWithLLM(input, async () => new Response('', { status: 429 })), /лимит/);
  await assert.rejects(generateWithLLM(input, async () => Response.json({ output: [] })), /структуру/);
});
