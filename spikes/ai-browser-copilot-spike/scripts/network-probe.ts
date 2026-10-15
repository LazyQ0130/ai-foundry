// Real Chrome networking only. No toolbar, sidePanel.open, action or selection simulation.
import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createApp } from '../api/src/app';
import type { Server } from 'node:http';
import { extractPage } from '../extension/src/extract';

const output = resolve(process.env.EVIDENCE_DIR ?? `docs/artifacts/round2/network-${Date.now()}`);
await mkdir(output, { recursive: true });
const profile = resolve('.runtime/network-' + Date.now());
await mkdir(profile, { recursive: true });
const chrome = spawn(process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless=new', `--user-data-dir=${profile}`, '--remote-debugging-port=0', '--remote-debugging-address=127.0.0.1',
  '--enable-unsafe-extension-debugging', '--no-first-run', '--no-default-browser-check', 'about:blank',
], { stdio: 'ignore', windowsHide: true });
let browser: Awaited<ReturnType<typeof chromium.connectOverCDP>> | undefined;
let server: Server | undefined;
const records: unknown[] = [];
try {
  let port = '';
  for (let i = 0; i < 60; i++) {
    try { port = (await readFile(resolve(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0].trim(); if (port) break; } catch { /* startup */ }
    await new Promise(r => setTimeout(r, 200));
  }
  if (!port) throw Error('Chrome headless startup timeout');
  browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
  const cdp = await browser.newBrowserCDPSession();
  const ctx = browser.contexts()[0];
  const source = resolve('.output/chrome-mv3');
  const installed = await cdp.send('Extensions.loadUnpacked', { path: source });
  const origin = `chrome-extension://${installed.id}`;
  const worker = ctx.serviceWorkers().find(w => w.url().startsWith(origin)) ?? await ctx.waitForEvent('serviceworker', { predicate: w => w.url().startsWith(origin), timeout: 10000 });
  // Record actual CORS headers received by the unchanged API, without request bodies.
  const app = createApp(origin);
  const requests: unknown[] = [];
  server = app.listen(8787, '127.0.0.1');
  server.prependListener('request', req => { requests.push({ method: req.method, path: req.url, origin: req.headers.origin ?? null, requestedMethod: req.headers['access-control-request-method'] ?? null, requestedHeaders: req.headers['access-control-request-headers'] ?? null }); });
  await new Promise<void>((res, rej) => { server!.once('listening', res); server!.once('error', rej); });
  const fetchFixture = async () => {
    const request = { v: 1, requestId: crypto.randomUUID(), snapshot: { tabId: 1, url: 'https://example.com/', snapshotId: crypto.randomUUID(), contextToken:crypto.randomUUID(), title: 'Headless network fixture', text: 'Controlled fixture; not captured from a webpage.', capturedAt: new Date().toISOString(), truncated: false } };
    try {
      const r = await fetch('http://127.0.0.1:8787/api/ai/summary', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(request), signal: AbortSignal.timeout(5000) });
      const body = await r.json();
      return { status: r.status, body, idsMatch: body.requestId === request.requestId && body.snapshotId === request.snapshot.snapshotId };
    } catch (e) { return { error: String(e) }; }
  };
  const value = await worker.evaluate(fetchFixture);
  records.push({ case: 'production-no-host-permissions-worker', value, requests:structuredClone(requests) });
  const page = await ctx.newPage();
  await page.goto(`${origin}/sidepanel.html`);
  requests.length = 0;
  const pageValue = await page.evaluate(fetchFixture);
  records.push({ case: 'production-no-host-permissions-extension-document', value:pageValue, requests:structuredClone(requests), limitation:'Standalone extension tab, not a native Side Panel; no UI button was clicked.' });
  await ctx.route('https://example.com/phase0-ungranted', route => route.fulfill({contentType:'text/html',body:'<title>Ungrant fixture</title><p>Controlled permission fixture</p>'}));
  // Raw constant test JS avoids tsx's nested-function __name helper in serialized browser code.
  const injection: {denied:boolean;error?:string} = await worker.evaluate(`(async () => {
    const tab=await chrome.tabs.create({url:'https://example.com/phase0-ungranted',active:false});
    try {
      for(let i=0;i<100;i++){if((await chrome.tabs.get(tab.id)).status==='complete')break;await new Promise(r=>setTimeout(r,30));}
      await chrome.scripting.executeScript({target:{tabId:tab.id},func:()=>document.title}); return {denied:false};
    } catch(e) { return {denied:/Cannot access contents|must request permission|Missing host permission/i.test(String(e)),error:String(e)}; }
    finally {await chrome.tabs.remove(tab.id);}
  })()`);
  records.push({case:'real-Chrome-no-activeTab-grant',injection,limitation:'Negative permission test only; no grant was synthesized.'});
  const fixturePage = await ctx.newPage();
  const domResults: Array<{fixture:string;status:string;length:number;truncated:boolean;title:string}> = [];
  for (const fixture of ['article-a.html','long.html','empty.html']) {
    await fixturePage.setContent(await readFile(resolve('tests/fixtures',fixture),'utf8'));
    const extracted = await fixturePage.evaluate(extractPage,6000);
    const passed = fixture==='article-a.html' ? extracted.text.includes('ALPHA_SELECTION') && !/HIDDEN_SECRET_FIXTURE|PRIVATE_FORM_VALUE|不应提取的导航/.test(extracted.text)
      : fixture==='long.html' ? extracted.truncated && extracted.text.length<=6000 && extracted.text.length>5000 : extracted.text==='';
    domResults.push({fixture,status:passed?'PASS':'FAIL',length:extracted.text.length,truncated:extracted.truncated,title:extracted.title});
  }
  records.push({case:'actual-Chrome-DOM-extractor-fixtures',results:domResults,limitation:'Direct execution on controlled DOM; not chrome.scripting authorization or native user interaction.'});
  // Probe parser support of the narrow explicit-port host pattern in the installed browser.
  const probeDir = resolve(profile, 'port-pattern-probe');
  await mkdir(probeDir);
  const manifest = JSON.parse(await readFile(resolve(source, 'manifest.json'), 'utf8'));
  manifest.name = 'Phase0 port pattern parser probe';
  manifest.host_permissions = ['http://127.0.0.1:8787/*'];
  delete manifest.side_panel; delete manifest.action;
  manifest.background = { service_worker: 'background.js' };
  await writeFile(resolve(probeDir, 'manifest.json'), JSON.stringify(manifest));
  await writeFile(resolve(probeDir, 'background.js'), 'chrome.runtime.onInstalled.addListener(() => {});');
  try { const result = await cdp.send('Extensions.loadUnpacked', { path: probeDir }); records.push({ case: 'explicit-port-manifest-parser', accepted: true, id: result.id }); }
  catch (e) { records.push({ case: 'explicit-port-manifest-parser', accepted: false, error: String(e) }); }
  const report = { timestamp: new Date().toISOString(), browser: browser.version(), profile, origin, manifestHostPermissions: [], status: 'status' in value && value.status === 200 && value.idsMatch && 'status' in pageValue && pageValue.status===200 && pageValue.idsMatch && injection.denied && domResults.every(r=>r.status==='PASS') ? 'PASS' : 'FAIL', scope: 'Actual extension networking, ungranted injection rejection, and controlled DOM extraction; NOT native Side Panel, positive activeTab, toolbar, selection or SP-08 full acceptance.', records };
  await writeFile(resolve(output, 'chrome-network-probe.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  if (report.status !== 'PASS') process.exitCode = 1;
} finally {
  if (server) { server.closeAllConnections(); await new Promise<void>(r => server!.close(() => r())); }
  if (browser) { try { await (await browser.newBrowserCDPSession()).send('Browser.close'); } catch { /* disconnected */ } await browser.close().catch(() => {}); }
  if (chrome.exitCode === null) chrome.kill();
  // Keep the isolated profile and all evidence. No recursive cleanup.
}
