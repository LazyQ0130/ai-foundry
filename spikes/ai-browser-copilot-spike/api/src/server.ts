import { createApp } from './app';
if (process.env.PROVIDER && process.env.PROVIDER !== 'mock') throw new Error('Phase 0 only supports Mock; live models require a separately authorized adapter.');
createApp(process.env.EXTENSION_ORIGIN ?? '').listen(8787, '127.0.0.1', () => console.log('Phase 0 Mock API listening on http://127.0.0.1:8787 (no request bodies logged)'));
