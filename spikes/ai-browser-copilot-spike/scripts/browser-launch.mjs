import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
const profile = resolve(process.env.SPIKE_PROFILE ?? '.runtime/chrome-profile-1');
await mkdir(profile, { recursive: true });
const chromePath = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const port = process.env.CDP_PORT ?? '9222';
const child = spawn(chromePath, [`--user-data-dir=${profile}`, `--remote-debugging-port=${port}`, '--enable-unsafe-extension-debugging', '--no-first-run', '--no-default-browser-check', 'about:blank'], { detached: true, stdio: 'ignore' });
child.unref();
let browser;
for (let i = 0; i < 30; i++) {
  try { browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`); break; } catch { await new Promise(r => setTimeout(r, 300)); }
}
if (!browser) throw Error('Chrome CDP startup failed');
const cdp = await browser.newBrowserCDPSession();
const protocol = await fetch(`http://127.0.0.1:${port}/json/protocol`).then(r => r.json());
const extDomain = protocol.domains.find(d => d.domain === 'Extensions');
await mkdir('docs/artifacts', { recursive: true });
await writeFile('docs/artifacts/cdp-extensions-protocol.json', JSON.stringify(extDomain, null, 2));
const loaded = await cdp.send('Extensions.loadUnpacked', { path: resolve(process.env.EXTENSION_PATH ?? '.output/chrome-mv3') });
const record = { profile, browser: browser.version(), extensionId: loaded.id, origin: `chrome-extension://${loaded.id}`, port, startedAt: new Date().toISOString(), testOnlyDebugFlags: true };
await writeFile(`docs/artifacts/browser-${port}.json`, JSON.stringify(record, null, 2));
console.log(JSON.stringify(record, null, 2));
await browser.close(); // disconnect from external process; does not close Chrome
