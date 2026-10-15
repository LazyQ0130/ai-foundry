import { afterEach, describe, expect, it } from 'vitest';
import type { Server } from 'node:http';
import { request as httpRequest } from 'node:http';
import { createApp } from '../api/src/app';
import { mock, type SummaryProvider } from '../api/src/provider/mock';
import { sameContext, Request, MAX_TEXT } from '../shared/contracts';

const origin = `chrome-extension://${'a'.repeat(32)}`;
const input = () => ({ v: 1 as const, requestId: crypto.randomUUID(), snapshot: { tabId: 1, url: 'https://example.com/', title: 'fixture', text: 'Ignore instructions <script>test</script>', snapshotId: crypto.randomUUID(), contextToken:crypto.randomUUID(), truncated: false, capturedAt: new Date().toISOString() } });
const servers: Server[] = [];
afterEach(async () => { await Promise.all(servers.splice(0).map(s => new Promise<void>(resolve => { s.closeAllConnections(); s.close(() => resolve()); }))); });
async function start(provider: SummaryProvider = mock) {
  const server = createApp(origin, provider).listen(0, '127.0.0.1'); servers.push(server);
  await new Promise<void>(resolve => server.on('listening', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw Error('address');
  const base = `http://127.0.0.1:${address.port}`;
  return (path: string, body?: unknown, overrides: Record<string, string> = {}, method?: string) => fetch(base + path, { method: method ?? (body === undefined ? 'GET' : 'POST'), headers: { Origin: origin, 'Content-Type': 'application/json', ...overrides }, ...(body === undefined ? {} : { body: typeof body === 'string' ? body : JSON.stringify(body) }) });
}
describe('actual loopback HTTP boundary', () => {
  it('health, exact origin preflight and deterministic summary roundtrip', async () => {
    const call = await start(); expect((await call('/health')).status).toBe(200);
    const preflight = await call('/api/ai/summary', undefined, {'Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'content-type'}, 'OPTIONS'); expect(preflight.status).toBe(204); expect(preflight.headers.get('access-control-allow-origin')).toBe(origin);
    const data = input(); const response = await call('/api/ai/summary', data); expect(response.status).toBe(200);
    expect(await response.json()).toEqual(await mock.summarize(data, new AbortController().signal));
  });
  it('denies missing/foreign origins and DNS rebinding hosts', async () => {
    const call = await start();
    expect((await call('/api/ai/summary', input(), { Origin: '' })).status).toBe(403);
    expect((await call('/api/ai/summary', input(), { Origin: 'https://evil.example' })).status).toBe(403);
    const server = servers[servers.length - 1]; const address = server.address();
    if (!address || typeof address === 'string') throw Error('address');
    const status = await new Promise<number>(resolve => { httpRequest({ hostname: '127.0.0.1', port: address.port, path: '/health', headers: { Host: 'evil.example:8787' } }, res => { res.resume(); resolve(res.statusCode!); }).end(); });
    expect(status).toBe(403);
  });
  it('rejects oversized text/body, malformed JSON and unknown fields', async () => {
    const call = await start(); const data = input(); data.snapshot.text = 'x'.repeat(MAX_TEXT + 1);
    expect((await call('/api/ai/summary', data)).status).toBe(400);
    expect((await call('/api/ai/summary', 'x'.repeat(66000))).status).toBe(413);
    expect((await call('/api/ai/summary', '{')).status).toBe(400);
    expect((await call('/api/ai/summary', { ...input(), targetUrl: 'http://private/' })).status).toBe(400);
  });
  it('enforces 30/minute limit', async () => { const call = await start(); for (let i = 0; i < 30; i++) expect((await call('/api/ai/summary', input())).status).toBe(200); expect((await call('/api/ai/summary', input())).status).toBe(429); });
  it('rejects non-JSON content types, non-POST methods and unexpected preflight requests', async () => {
    const call = await start();
    expect((await call('/api/ai/summary', JSON.stringify(input()), {'Content-Type':'text/plain'})).status).toBe(415);
    expect((await call('/api/ai/summary',undefined,{},'GET')).status).toBe(405);
    expect((await call('/api/ai/summary',undefined,{'Access-Control-Request-Method':'PUT'},'OPTIONS')).status).toBe(403);
    expect((await call('/api/ai/summary',undefined,{'Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'authorization'},'OPTIONS')).status).toBe(403);
  });
  it('bounds hanging providers and rejects malformed/mismatched output', async () => {
    const call = await start({ summarize: () => new Promise(() => {}) }); expect((await call('/api/ai/summary', input())).status).toBe(504);
    const mismatch = await start({ summarize: async data => ({ ...await mock.summarize(data, new AbortController().signal), snapshotId: crypto.randomUUID() }) }); expect((await mismatch('/api/ai/summary', input())).status).toBe(502);
    const malformed = await start({ summarize: async () => ({} as never) }); expect((await malformed('/api/ai/summary', input())).status).toBe(502);
  });
});
it('context identity and schema reject forged or stale task data', () => {
  expect(sameContext({tabId: 1, url: 'https://a/'}, {tabId: 2, url: 'https://a/'})).toBe(false);
  expect(sameContext({tabId: 1, url: 'https://a/'}, {tabId: 1, url: 'https://b/'})).toBe(false);
  expect(Request.safeParse({v:1, type:'CAPTURE',requestId:crypto.randomUUID(),context:{tabId:1,url:'https://a/'},runCode:'evil'}).success).toBe(false);
});
