import test from 'node:test';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { ReadState } from '../../../course-content/internal/ai-browser-copilot/p2/reference/extension/src/read-client';
const root = process.env.P2_TEST_REFERENCE ?? resolve('course-content/internal/ai-browser-copilot/p2/reference');
const load = (name: string) => import(pathToFileURL(resolve(root, `extension/src/${name}.ts`)).href);
const { createCoordinator } = await load('coordinator');
const { createSessionTokens } = await load('context-tokens');
const { RequestSchema, SnapshotSchema, supportedUrl } = await load('contracts');
const { createReader } = await load('read-client');

const uuid = () => crypto.randomUUID();
const context = { windowId: 1, tabId: 3, url: 'https://example.com/' };
const extracted = { title: 'Article', url: context.url, text: 'hello', blocks: [{ id: 'b-001', kind: 'paragraph' as const, text: 'hello' }], truncated: false, scanLimited: false };
function store() {
  const data: Record<string, unknown> = {};
  return { data, async get(key: string) { return { [key]: data[key] }; }, async set(value: Record<string, unknown>) { Object.assign(data, value); }, async remove(key: string) { delete data[key]; } };
}
function fixture() {
  const storage = store(), tokens = createSessionTokens(storage);
  const state = { tab: { id: 3, windowId: 1, active: true, status: 'complete', url: context.url }, active: 3,
    doc: uuid(), injected: 0, denied: false, result: { ok: true, data: extracted } as any, hook: undefined as undefined | (() => Promise<void>) };
  const api: any = {
    runtime: { id: 'a'.repeat(32), getURL: (path: string) => `chrome-extension://${'a'.repeat(32)}/${path}` },
    tabs: { get: async () => ({ ...state.tab }), query: async () => [{ id: state.active }] },
    scripting: { executeScript: async (options: any) => {
      state.injected++; assert.equal(options.world, 'ISOLATED'); assert.deepEqual(options.target, { tabId: 3, frameIds: [0] });
      if (state.denied) throw new Error('Cannot access contents of url');
      const capture = options.func.name === 'extractPage', doc = state.doc;
      if (capture && state.hook) await state.hook();
      return [{ frameId: 0, documentId: doc, result: capture ? state.result : { url: state.tab.url, contentType: 'text/html' } }];
    } },
  };
  const sender = { id: api.runtime.id, url: api.runtime.getURL('sidepanel.html') };
  return { storage, tokens, state, api, sender, handle: createCoordinator(api, tokens, 100), request: () => ({ v: 1, type: 'CAPTURE', requestId: uuid(), context: { ...context } }) };
}
function snapshot() { return { ...extracted, context: { ...context }, snapshotId: uuid(), contextToken: uuid(), documentId: uuid(), contentHash: 'a'.repeat(64), capturedAt: new Date().toISOString() }; }
function deferred<T>() { let resolve!: (value: T) => void; const promise = new Promise<T>(r => { resolve = r; }); return { promise, resolve }; }

test('contracts reject extra keys, wrong version, executable payload and inconsistent text', () => {
  const f = fixture();
  for (const bad of [{ ...f.request(), code: 'eval()' }, { ...f.request(), v: 2 }, { ...f.request(), type: 'DELETE_ALL' }, { ...f.request(), requestId: 'bad' }]) assert.equal(RequestSchema.safeParse(bad).success, false);
  assert.equal(SnapshotSchema.safeParse({ ...snapshot(), text: 'different' }).success, false);
  assert.equal(SnapshotSchema.safeParse({ ...snapshot(), text: 'x'.repeat(6001) }).success, false);
});
test('URL policy rejects chrome/file/pdf schemes and Chrome Web Store', () => {
  for (const url of ['chrome://version', 'file:///a.html', 'data:text/html,a', 'https://chromewebstore.google.com/detail/a', 'https://chrome.google.com/webstore/detail/a']) assert.equal(supportedUrl(url), false);
  assert.equal(supportedUrl(context.url), true);
});
test('capture then CHECK_CONTEXT: strict response, true document and anonymous session data', async () => {
  const f = fixture(), response = await f.handle(f.request(), f.sender);
  assert.equal(response.ok, true); if (!response.ok) return;
  const value = SnapshotSchema.parse(response.data);
  assert.equal(value.documentId, f.state.doc); assert.match(value.contentHash, /^[a-f0-9]{64}$/);
  const check = await f.handle({ ...f.request(), type: 'CHECK_CONTEXT', contextToken: value.contextToken, documentId: value.documentId }, f.sender);
  assert.deepEqual(check.ok && check.data, { current: true });
  assert.deepEqual(Object.values(f.storage.data), [value.contextToken]);
});
for (const [label, modify] of [
  ['wrong extension', (s: any) => ({ ...s, id: 'b'.repeat(32) })],
  ['extension tab', (s: any) => ({ ...s, tab: { id: 7 } })],
  ['wrong entry', (s: any) => ({ ...s, url: s.url + '?forged=1' })],
] as const) test(`sender rejection: ${label}, no injection or storage`, async () => {
  const f = fixture(), r = await f.handle(f.request(), modify(f.sender));
  assert.equal(!r.ok && r.error.code, 'BAD_MESSAGE'); assert.equal(f.state.injected, 0); assert.deepEqual(f.storage.data, {});
});
for (const [label, mutate] of [
  ['active tab', (f: any) => { f.state.active = 99; }],
  ['window', (f: any) => { f.state.tab.windowId = 2; }],
  ['URL', (f: any) => { f.state.tab.url = 'https://iana.org/'; }],
  ['loading', (f: any) => { f.state.tab.status = 'loading'; }],
] as const) test(`context rejection: ${label}`, async () => {
  const f = fixture(); mutate(f); const r = await f.handle(f.request(), f.sender);
  assert.equal(!r.ok && r.error.code, 'TAB_CHANGED'); assert.equal(f.state.injected, 0);
});
test('unauthorized injection is rejected, never successful empty text', async () => {
  const f = fixture(); f.state.denied = true; const r = await f.handle(f.request(), f.sender);
  assert.equal(!r.ok && r.error.code, 'NEEDS_PERMISSION');
});
test('empty and unsupported extraction return distinct controlled failures', async () => {
  for (const code of ['NO_CONTENT', 'UNSUPPORTED_PAGE']) {
    const f = fixture(); f.state.result = { ok: false, code }; const r = await f.handle(f.request(), f.sender);
    assert.equal(!r.ok && r.error.code, code);
  }
});
test('same URL generation invalidation while injection is pending rejects old result', async () => {
  const f = fixture(), gate = deferred<void>();
  f.state.hook = () => gate.promise; const pending = f.handle(f.request(), f.sender);
  while (!f.state.injected) await new Promise(r => setTimeout(r, 0));
  await f.tokens.invalidate(3); gate.resolve();
  const r = await pending; assert.equal(!r.ok && r.error.code, 'TAB_CHANGED');
});
test('documentId catches same-URL replacement even when URL and token are unchanged', async () => {
  const f = fixture(); f.state.hook = async () => { f.state.doc = uuid(); };
  const r = await f.handle(f.request(), f.sender); assert.equal(!r.ok && r.error.code, 'TAB_CHANGED');
});
test('coordinator timeout returns and late injection cannot produce another response', async () => {
  const f = fixture(), gate = deferred<void>(); f.state.hook = () => gate.promise;
  const handle = createCoordinator(f.api, f.tokens, 8), r = await handle(f.request(), f.sender);
  assert.equal(!r.ok && r.error.code, 'TIMEOUT'); gate.resolve();
});
test('tokens survive reconstructed worker, serialize writes, clean closed tabs', async () => {
  const s = store(), a = createSessionTokens(s), lease = a.lease(3), initial = await lease.ready;
  const b = createSessionTokens(s); assert.equal(await b.lease(3).ready, initial);
  const p1 = a.invalidate(3), p2 = a.invalidate(3); assert.equal(a.isCurrent(3, lease), false);
  await Promise.all([p1, p2]); assert.equal(await a.lease(3).ready, s.data['context:v1:3']);
  await a.release(3); assert.deepEqual(s.data, {});
});
test('storage rejection does not poison subsequent leases', async () => {
  const s = store(); let reject = true;
  const tokens = createSessionTokens({ ...s, async get(key) { if (reject) throw new Error('unavailable'); return s.get(key); } });
  await assert.rejects(tokens.lease(3).ready); reject = false;
  assert.match(await tokens.lease(3).ready, /^[a-f0-9-]{36}$/);
});
test('client commits only validated CAPTURE + CHECK and removes old body on error', async () => {
  const values: ReadState[] = []; let denied = false; const body = snapshot();
  const reader = createReader({ context: async () => context, send: async request => denied
    ? { v: 1, ok: false, requestId: request.requestId, error: { code: 'NEEDS_PERMISSION', message: '拒绝' } }
    : { v: 1, ok: true, requestId: request.requestId, data: request.type === 'CAPTURE' ? body : { current: true } } }, s => values.push(s));
  await reader.read(); assert.equal(values.at(-1)?.snapshot?.snapshotId, body.snapshotId);
  denied = true; await reader.read(); assert.equal(values.at(-1)?.status, 'error'); assert.equal(values.at(-1)?.snapshot, undefined);
});
test('late client success and late error cannot overwrite a newer page', async () => {
  for (const fail of [false, true]) {
    const values: ReadState[] = [], gate = deferred<any>(), body = snapshot(); let count = 0, oldRequestId = '';
    const reader = createReader({ context: async () => context, send: async request => {
      if (++count === 1) { oldRequestId = request.requestId; return gate.promise; }
      return { v: 1, ok: true, requestId: request.requestId, data: request.type === 'CAPTURE' ? body : { current: true } };
    } }, s => values.push(s));
    const pending = reader.read(); await new Promise(r => setTimeout(r, 0)); reader.invalidate(); await reader.read();
    const final = values.at(-1); gate.resolve(fail ? { v: 1, ok: false, requestId: oldRequestId, error: { code: 'TIMEOUT', message: '旧请求超时' } } : { v: 1, ok: true, requestId: oldRequestId, data: snapshot() }); await pending;
    assert.equal(values.at(-1), final); assert.equal(final?.status, 'success');
  }
});
test('client rejects malformed response and mismatched correlation IDs', async () => {
  for (const mode of ['malformed','wrong-id','wrong-type']) {
    const states: ReadState[] = [];
    const reader = createReader({ context: async () => context, send: async request => mode === 'malformed'
      ? { ok: true } : { v: 1, ok: true, requestId: mode === 'wrong-id' ? uuid() : request.requestId, data: { current: true } } }, state => states.push(state));
    await reader.read(); assert.equal(states.at(-1)?.status, 'error'); assert.equal(states.at(-1)?.snapshot, undefined);
  }
});
test('final context check catches a URL change during CHECK_CONTEXT response', async () => {
  let current = { ...context }; const states: ReadState[] = [];
  const reader = createReader({ context: async () => current, send: async request => {
    if (request.type === 'CHECK_CONTEXT') current = { ...current, url: 'https://example.com/other' };
    return { v: 1, ok: true, requestId: request.requestId, data: request.type === 'CAPTURE' ? snapshot() : { current: true } };
  } }, state => states.push(state));
  await reader.read(); assert.match(states.at(-1)!.message, /TAB_CHANGED/); assert.equal(states.at(-1)?.snapshot, undefined);
});
test('closed tab and unavailable session storage have separate actionable errors', async () => {
  const f = fixture(); f.api.tabs.get = async () => { throw new Error('No tab'); };
  let r = await f.handle(f.request(), f.sender); assert.equal(!r.ok && r.error.code, 'TAB_CHANGED');
  const broken = createSessionTokens({ ...store(), async get() { throw new Error('No store'); } });
  r = await createCoordinator(f.api, broken)(f.request(), f.sender); assert.equal(!r.ok && r.error.code, 'CONTEXT_UNAVAILABLE');
});
test('stalled backend context lookup is bounded', async () => {
  const f = fixture(); f.api.tabs.get = () => new Promise(() => {});
  const r = await createCoordinator(f.api, f.tokens, 8)(f.request(), f.sender);
  assert.equal(!r.ok && r.error.code, 'TIMEOUT');
});
test('late context resolution after client timeout starts no new CAPTURE', async () => {
  const gate = deferred<typeof context>(), states: ReadState[] = []; let sends = 0;
  const reader = createReader({ context: () => gate.promise, send: async request => {
    sends++; return { v: 1, ok: true, requestId: request.requestId, data: request.type === 'CAPTURE' ? snapshot() : { current: true } };
  } }, state => states.push(state), 8);
  await reader.read(); assert.match(states.at(-1)!.message, /TIMEOUT/);
  gate.resolve(context); await new Promise(r => setTimeout(r, 4));
  assert.equal(sends, 0); assert.equal(states.at(-1)?.status, 'error');
});
test('context lookup resolving after invalidation starts no CAPTURE', async () => {
  const gate = deferred<typeof context>(); let sends = 0;
  const reader = createReader({ context: () => gate.promise, send: async () => { sends++; return {}; } }, () => {});
  const pending = reader.read(); reader.invalidate(); gate.resolve(context); await pending;
  assert.equal(sends, 0);
});
test('backend context lookup resolving after timeout starts no injection', async () => {
  const f = fixture(), gate = deferred<any>(); f.api.tabs.get = () => gate.promise;
  const result = await createCoordinator(f.api, f.tokens, 8)(f.request(), f.sender);
  assert.equal(!result.ok && result.error.code, 'TIMEOUT');
  gate.resolve(f.state.tab); await new Promise(r => setTimeout(r, 4));
  assert.equal(f.state.injected, 0);
});
test('injection completing after timeout starts no later probe', async () => {
  const f = fixture(), gate = deferred<void>(); f.state.hook = () => gate.promise;
  const result = await createCoordinator(f.api, f.tokens, 8)(f.request(), f.sender);
  assert.equal(!result.ok && result.error.code, 'TIMEOUT'); assert.equal(f.state.injected, 1);
  gate.resolve(); await new Promise(r => setTimeout(r, 4)); assert.equal(f.state.injected, 1);
});
test('client handles stalled context and send timeout; next attempt recovers', async () => {
  for (const stall of ['context', 'send']) {
    let blocked = true; const states: ReadState[] = [], body = snapshot();
    const reader = createReader({ context: async () => blocked && stall === 'context' ? new Promise(() => {}) : context,
      send: async request => blocked ? new Promise(() => {}) : { v: 1, ok: true, requestId: request.requestId, data: request.type === 'CAPTURE' ? body : { current: true } } }, s => states.push(s), 8);
    await reader.read(); assert.match(states.at(-1)!.message, /TIMEOUT/); assert.equal(states.at(-1)?.snapshot, undefined);
    blocked = false; await reader.read(); assert.equal(states.at(-1)?.status, 'success');
  }
});
