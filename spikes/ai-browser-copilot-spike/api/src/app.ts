import express from 'express';
import { SummaryRequest, SummaryResponse } from '../../shared/contracts';
import { mock, type SummaryProvider } from './provider/mock';

export function createApp(origin: string, provider: SummaryProvider = mock) {
  if (!/^chrome-extension:\/\/[a-p]{32}$/.test(origin)) throw new Error('Set EXTENSION_ORIGIN to the exact chrome-extension://ID shown in the panel.');
  const app = express();
  app.disable('x-powered-by');
  let windowStart = Date.now(), count = 0;
  app.use((req, res, next) => {
    if (![`127.0.0.1:${req.socket.localPort}`, `localhost:${req.socket.localPort}`].includes(req.headers.host ?? '')) return void res.status(403).json({ code: 'BAD_HOST' });
    res.setHeader('Cache-Control', 'no-store');
    if (req.method === 'GET' && req.path === '/health') return next();
    if (req.headers.origin !== origin) return void res.status(403).json({ code: 'ORIGIN_DENIED' });
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    if (req.method === 'OPTIONS') {
      const requestedHeaders = String(req.headers['access-control-request-headers'] ?? '').toLowerCase().split(',').map(h => h.trim()).filter(Boolean);
      if (req.headers['access-control-request-method'] !== 'POST' || requestedHeaders.some(h => h !== 'content-type')) return void res.status(403).json({code:'PREFLIGHT_DENIED'});
      res.setHeader('Access-Control-Allow-Methods', 'POST');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      return void res.sendStatus(204);
    }
    if (req.path === '/api/ai/summary' && req.method !== 'POST') return void res.setHeader('Allow','POST').status(405).json({code:'METHOD_NOT_ALLOWED'});
    if (req.path === '/api/ai/summary' && !req.is('application/json')) return void res.status(415).json({code:'JSON_REQUIRED'});
    if (Date.now() - windowStart > 60000) { windowStart = Date.now(); count = 0; }
    if (++count > 30) return void res.status(429).json({ code: 'RATE_LIMIT' });
    next();
  });
  app.use(express.json({ limit: '64kb', type: 'application/json' }));
  app.get('/health', (_req, res) => res.json({ ok: true, provider: 'mock', phase: 0 }));
  app.post('/api/ai/summary', async (req, res) => {
    const input = SummaryRequest.safeParse(req.body);
    if (!input.success) return void res.status(400).json({ code: 'INVALID_INPUT' });
    const controller = new AbortController();
    const disconnected = () => controller.abort();
    res.once('close', disconnected);
    let timer: ReturnType<typeof setTimeout>;
    try {
      const output = await Promise.race([
        provider.summarize(input.data, controller.signal),
        new Promise<never>((_, reject) => { timer = setTimeout(() => { controller.abort(); reject(new Error('TIMEOUT')); }, 1800); }),
      ]);
      const valid = SummaryResponse.safeParse(output);
      if (!valid.success || valid.data.requestId !== input.data.requestId || valid.data.snapshotId !== input.data.snapshot.snapshotId) return void res.status(502).json({ code: 'INVALID_PROVIDER_RESPONSE' });
      res.json(valid.data);
    } catch (error) { if (!res.destroyed) res.status(controller.signal.aborted ? 504 : 502).json({ code: controller.signal.aborted ? 'PROVIDER_TIMEOUT' : 'PROVIDER_ERROR' }); }
    finally { clearTimeout(timer!); res.removeListener('close', disconnected); }
  });
  app.use((err: { type?: string }, _req: express.Request, res: express.Response, _next: express.NextFunction) => { res.status(err.type === 'entity.too.large' ? 413 : 400).json({ code: err.type === 'entity.too.large' ? 'BODY_TOO_LARGE' : 'BAD_JSON' }); });
  return app;
}
