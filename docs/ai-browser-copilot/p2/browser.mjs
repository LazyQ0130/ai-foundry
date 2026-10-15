// Author-only actual Chrome integration. No synthetic toolbar/action or activeTab grant.
import { chromium } from '../../../spikes/ai-browser-copilot-spike/node_modules/playwright-core/index.mjs';
import { build } from '../../../spikes/ai-browser-copilot-spike/node_modules/esbuild/lib/main.js';
import { createFixtureServer } from '../../../course-content/internal/ai-browser-copilot/p2/reference/scripts/fixtures.mjs';
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { readFile, writeFile, mkdir, cp } from 'node:fs/promises';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';

const latestDelivery = JSON.parse(await readFile('docs/ai-browser-copilot/p2/artifacts/latest-delivery.json','utf8'));
const delivery = JSON.parse(await readFile(resolve(latestDelivery.evidence,'report.json'),'utf8'));
assert.equal(delivery.status, 'PASS');
const project = resolve(process.env.P2_PROJECT ?? delivery.validation.reference.directory);
const stamp = Date.now(), run = resolve(`.runtime/p2-chrome-${stamp}`);
const evidence = resolve(`docs/ai-browser-copilot/p2/artifacts/chrome-${stamp}`);
await mkdir(run, { recursive: true }); await mkdir(evidence, { recursive: true });
const report = { time: new Date().toISOString(), scope: 'Actual Chrome headless extension document + controlled localhost host-permission fixture. Native toolbar/activeTab grant NOT exercised.', native: 'BLOCKED', results: [] };
const fixture = createFixtureServer(); await new Promise(r => fixture.listen(0, '127.0.0.1', r));
const origin = `http://127.0.0.1:${fixture.address().port}`;
const profile = resolve(run, 'profile');
const child = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', `--user-data-dir=${profile}`, '--remote-debugging-port=0', '--remote-debugging-address=127.0.0.1', '--enable-unsafe-extension-debugging', '--no-first-run', '--no-default-browser-check', 'about:blank'], { stdio: 'ignore', windowsHide: true });
let browser, previewServer;
const sleep = ms => new Promise(r => setTimeout(r, ms));
try {
  let port;
  for (let i = 0; i < 100; i++) { try { port = (await readFile(resolve(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]; if (port) break; } catch {} await sleep(100); }
  assert.ok(port, 'Chrome startup');
  browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
  report.browser = browser.version();
  const cdp = await browser.newBrowserCDPSession(), context = browser.contexts()[0];
  const product = resolve(project, '.output/chrome-mv3');
  report.testedProductFiles = {};
  for (const [name, expected] of Object.entries(delivery.extension_packages.find(p => p.role === 'reference').file_sha256)) {
    const hash = createHash('sha256').update(await readFile(resolve(product,name))).digest('hex');
    assert.equal(hash, expected); report.testedProductFiles[name] = hash;
  }
  const starterBuilt = resolve(delivery.validation.starter.directory,'.output/chrome-mv3');
  const { id: starterId } = await cdp.send('Extensions.loadUnpacked', { path: starterBuilt });
  const starterDoc = await context.newPage(); await starterDoc.goto(`chrome-extension://${starterId}/sidepanel.html`);
  await starterDoc.getByRole('button', { name: '确认已看到侧栏', exact: true }).click();
  await starterDoc.getByRole('status').filter({ hasText: '确认成功' }).waitFor();
  assert.equal(await starterDoc.getByRole('button', { name: '读取当前网页（完成本课后启用）', exact: true }).isDisabled(), true);
  await starterDoc.screenshot({ path: resolve(evidence,'starter-completed-p1-disabled-p2.png'), fullPage: true });
  await starterDoc.close();
  report.results.push({ name: 'Clean-ZIP installed Starter: P1 React remains functional, P2 exercise deliberately disabled', status: 'PASS' });
  const manifest = JSON.parse(await readFile(resolve(product, 'manifest.json'), 'utf8'));
  assert.deepEqual([...manifest.permissions].sort(), ['activeTab', 'scripting', 'sidePanel', 'storage']);
  for (const key of ['host_permissions','content_scripts','externally_connectable']) assert.equal(manifest[key], undefined);
  assert.equal(manifest.action.default_popup, undefined);
  await writeFile(resolve(evidence, 'product-manifest.json'), JSON.stringify(manifest, null, 2));
  const { id: productId } = await cdp.send('Extensions.loadUnpacked', { path: product });
  const doc = await context.newPage(); await doc.goto(`chrome-extension://${productId}/sidepanel.html`);
  const errors = []; doc.on('pageerror', e => errors.push(String(e)));
  await doc.getByRole('button', { name: '确认已看到侧栏', exact: true }).click();
  await doc.getByRole('status').filter({ hasText: '确认成功' }).waitFor();
  await doc.getByRole('button', { name: '读取当前网页', exact: true }).click();
  await doc.getByTestId('read-status').filter({ hasText: /UNSUPPORTED_PAGE|NEEDS_PERMISSION/ }).waitFor();
  const workerFor = async id => context.serviceWorkers().find(w => w.url() === `chrome-extension://${id}/background.js`) ?? await context.waitForEvent('serviceworker', { predicate: w => w.url() === `chrome-extension://${id}/background.js`, timeout: 10000 });
  const productWorker = await workerFor(productId);
  const toolbarState = await productWorker.evaluate(async () => ({ listener: chrome.action.onClicked.hasListeners(), behavior: await chrome.sidePanel.getPanelBehavior() }));
  assert.equal(toolbarState.listener, true); assert.equal(toolbarState.behavior.openPanelOnActionClick, false);
  report.productToolbarConfiguration = toolbarState;
  const page = await context.newPage(); await page.goto(`${origin}/article-a`);
  const denied = await productWorker.evaluate(async url => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    try { await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: () => document.title }); return { unexpected: true, tab }; }
    catch (e) { return { rejected: String(e), tabId: tab.id, targetUrl: url }; }
  }, page.url());
  assert.ok(denied.rejected, 'ungranted product must not inject');
  report.results.push({ name: 'Product P1 React regression, exact minimal manifest and real ungranted injection rejection', status: 'PASS', denied });
  await doc.screenshot({ path: resolve(evidence, 'product-ungranted.png'), fullPage: true });

  // Test-only host permission is the ONLY manifest delta besides the fixture name.
  const controlled = resolve(run, 'controlled-extension'); await cp(product, controlled, { recursive: true, errorOnExist: true });
  const controlledManifest = { ...manifest, name: `${manifest.name} [AUTHOR CONTROLLED FIXTURE]`, host_permissions: ['http://127.0.0.1/*'] };
  const inheritedHashes = {};
  for (const [name, hash] of Object.entries(report.testedProductFiles)) if (name !== 'manifest.json') {
    const actual = createHash('sha256').update(await readFile(resolve(controlled,name))).digest('hex');
    assert.equal(actual, hash); inheritedHashes[name] = actual;
  }
  await writeFile(resolve(evidence,'controlled-delta.json'), JSON.stringify({changedManifestFields:['name','host_permissions'],extraFiles:['qa-open.html','qa-open.js'],productionCodeUnchanged:inheritedHashes,scope:'Only this author test fixture; not product activeTab/native toolbar evidence'},null,2));
  await writeFile(resolve(controlled, 'manifest.json'), JSON.stringify(controlledManifest, null, 2));
  await writeFile(resolve(controlled, 'qa-open.html'), '<!doctype html><button id="open">Open controlled test panel</button><script src="qa-open.js"></script>');
  await writeFile(resolve(controlled, 'qa-open.js'), `chrome.windows.getCurrent().then(win => { document.querySelector('#open').onclick = () => { chrome.sidePanel.open({windowId:win.id}).catch(console.error); }; });`);
  await writeFile(resolve(evidence, 'controlled-manifest.json'), JSON.stringify(controlledManifest, null, 2));
  const { id } = await cdp.send('Extensions.loadUnpacked', { path: controlled });
  const launcher = await context.newPage(); await launcher.goto(`chrome-extension://${id}/qa-open.html`);
  const worker = await workerFor(id);
  await launcher.getByRole('button').click();
  await sleep(300);
  const targets = await cdp.send('Target.getTargets');
  await writeFile(resolve(evidence, 'panel-targets.json'), JSON.stringify(targets, null, 2));
  const panelTarget = targets.targetInfos.find(t => t.type === 'page' && t.url === `chrome-extension://${id}/sidepanel.html`);
  assert.ok(panelTarget, 'actual side panel target exists; extension tabs are not equivalent senders');
  // Playwright excludes non-tab extension panels. Connect only to THIS isolated test target.
  const socket = new WebSocket(`ws://127.0.0.1:${port}/devtools/page/${panelTarget.targetId}`);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let seq = 0; const waiting = new Map();
  socket.onmessage = event => { const message = JSON.parse(event.data); if (message.id) { const pending = waiting.get(message.id); waiting.delete(message.id); if (message.error) pending?.reject(new Error(JSON.stringify(message.error))); else pending?.resolve(message.result); } };
  const rpc = (method, params) => new Promise((resolve, reject) => { const n = ++seq; waiting.set(n, { resolve, reject }); socket.send(JSON.stringify({ id: n, method, params })); });
  const panel = { async evaluate(fn, arg) {
    const response = await rpc('Runtime.evaluate', { expression: `(${fn.toString()})(${JSON.stringify(arg) ?? ''})`, awaitPromise: true, returnByValue: true });
    if (response.exceptionDetails) throw new Error(JSON.stringify(response.exceptionDetails)); return response.result.value;
  } };
  await page.bringToFront();
  let target = await worker.evaluate(async url => (await chrome.tabs.query({})).find(t => t.url === url), page.url());
  assert.ok(target?.id);
  const send = async (type = 'CAPTURE', extra = {}) => panel.evaluate(async ({ type, target, extra }) => {
    return chrome.runtime.sendMessage({ v: 1, type, requestId: crypto.randomUUID(), context: { tabId: target.id, windowId: target.windowId, url: target.url }, ...extra });
  }, { type, target, extra });
  const captured = await send();
  await writeFile(resolve(evidence, 'first-real-message.json'), JSON.stringify(captured, null, 2));
  assert.equal(captured.ok, true, JSON.stringify(captured));
  assert.match(captured.data.text, /ARTICLE_A/); assert.ok(!captured.data.text.includes('不应提取的导航'));
  assert.deepEqual(await send('CHECK_CONTEXT', { contextToken: captured.data.contextToken, documentId: captured.data.documentId }).then(r => r.ok && r.data), { current: true });
  report.results.push({ name: 'Real runtime message → worker → isolated frame0 extraction → response, strict sender policy', status: 'PASS', context: captured.data.context, documentId: captured.data.documentId });

  async function waitPanel(predicate, label) {
    for (let i = 0; i < 100; i++) { const value = await panel.evaluate(predicate); if (value) return value; await sleep(30); }
    throw new Error(`Panel condition timed out: ${label}`);
  }
  const readUi = async () => {
    await panel.evaluate(() => [...document.querySelectorAll('button')].find(b => b.textContent === '读取当前网页').click());
    await waitPanel(() => document.querySelector('[aria-label="网页提取结果"]')?.textContent.includes('ARTICLE_'), 'real React capture');
  };
  await readUi();
  const uiFirst = await panel.evaluate(() => document.querySelector('section').textContent);
  assert.match(uiFirst, /ARTICLE_A/); assert.ok(!uiFirst.includes('ARTICLE_B'));
  await rpc('Emulation.setDeviceMetricsOverride', { width: 390, height: 900, deviceScaleFactor: 1, mobile: false });
  assert.equal(await panel.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  const screen = await rpc('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  await writeFile(resolve(evidence, 'actual-controlled-sidepanel.png'), Buffer.from(screen.data, 'base64'));
  await page.reload();
  await waitPanel(() => !document.querySelector('section'), 'same URL refresh clears body');
  const oldAfterRefresh = await send('CHECK_CONTEXT', { contextToken: captured.data.contextToken, documentId: captured.data.documentId });
  assert.equal(oldAfterRefresh.ok, false); assert.equal(oldAfterRefresh.error.code, 'TAB_CHANGED');
  const refreshed = await send(); assert.equal(refreshed.ok, true);
  assert.notEqual(refreshed.data.documentId, captured.data.documentId);
  assert.notEqual(refreshed.data.contextToken, captured.data.contextToken);
  await readUi();
  const second = await context.newPage(); await second.goto(origin + '/article-b'); await second.bringToFront();
  await waitPanel(() => !document.querySelector('section'), 'tab switch clears body');
  const inactive = await send(); assert.equal(inactive.ok, false); assert.equal(inactive.error.code, 'TAB_CHANGED');
  target = await worker.evaluate(async url => (await chrome.tabs.query({})).find(t => t.url === url), second.url());
  await readUi();
  const secondUi = await panel.evaluate(() => document.querySelector('section').textContent);
  assert.match(secondUi, /ARTICLE_B/); assert.ok(!secondUi.includes('ARTICLE_A'));
  const beforeRestart = await send(); assert.equal(beforeRestart.ok, true);
  report.results.push({ name: 'Actual Side Panel React render, source isolation, same-URL refresh and reread', status: 'PASS', refreshOldResponse: oldAfterRefresh, tabOldResponse: inactive, viewport390NoOverflow: true });

  const pageCdp = await context.newCDPSession(launcher), versions = new Map();
  pageCdp.on('ServiceWorker.workerVersionUpdated', event => { for (const v of event.versions) versions.set(v.versionId, v); });
  await pageCdp.send('ServiceWorker.enable');
  async function stopWorker() {
    let running;
    for (let i = 0; i < 100; i++) { running = [...versions.values()].find(v => v.scriptURL === `chrome-extension://${id}/background.js` && v.runningStatus === 'running'); if (running) break; await sleep(30); }
    assert.ok(running, 'running worker version observed');
    const before = (await cdp.send('Target.getTargets')).targetInfos.find(t => t.type === 'service_worker' && t.url === `chrome-extension://${id}/background.js`)?.targetId;
    await pageCdp.send('ServiceWorker.stopWorker', { versionId: running.versionId });
    for (let i = 0; i < 100; i++) { if (!(await cdp.send('Target.getTargets')).targetInfos.some(t => t.targetId === before)) return before; await sleep(30); }
    throw new Error('worker did not stop');
  }
  const beforeInstance = await (await workerFor(id)).evaluate(() => { globalThis.__p2AuthorInstance = crypto.randomUUID(); return globalThis.__p2AuthorInstance; });
  const beforeTarget = await stopWorker();
  const restored = await send('CHECK_CONTEXT', { contextToken: beforeRestart.data.contextToken, documentId: beforeRestart.data.documentId });
  assert.equal(restored.ok, true, JSON.stringify(restored));
  const afterTarget = (await cdp.send('Target.getTargets')).targetInfos.find(t => t.type === 'service_worker' && t.url === `chrome-extension://${id}/background.js`)?.targetId;
  assert.ok(afterTarget);
  const restartedWorker = await workerFor(id);
  const afterInstance = await restartedWorker.evaluate(() => {
    const previousMarker = globalThis.__p2AuthorInstance ?? null;
    globalThis.__p2AuthorInstance = crypto.randomUUID();
    return { previousMarker, instance: globalThis.__p2AuthorInstance };
  });
  assert.equal(afterInstance.previousMarker, null, 'worker global memory was actually lost');
  assert.notEqual(afterInstance.instance, beforeInstance);
  const session = await restartedWorker.evaluate(() => chrome.storage.session.get(null));
  assert.ok(Object.keys(session).length > 0);
  assert.ok(Object.entries(session).every(([k, v]) => /^context:v1:\d+$/.test(k) && /^[a-f0-9-]{36}$/.test(v)));
  await stopWorker(); await second.reload();
  const afterStoppedRefresh = await send('CHECK_CONTEXT', { contextToken: beforeRestart.data.contextToken, documentId: beforeRestart.data.documentId });
  assert.equal(afterStoppedRefresh.ok, false); assert.equal(afterStoppedRefresh.error.code, 'TAB_CHANGED');
  report.results.push({ name: 'Actual worker termination/restart with anonymous storage.session; refresh while worker stopped', status: 'PASS', beforeTarget, afterTarget, beforeInstance, afterInstance, unchangedDocument: restored, refreshedDocument: afterStoppedRefresh, session });
  const csp = await panel.evaluate(async () => { try { await fetch('http://127.0.0.1:8787/health'); return 'UNEXPECTED_SUCCESS'; } catch { return 'CSP_BLOCKED'; } });
  assert.equal(csp, 'CSP_BLOCKED');
  report.results.push({ name: 'Actual production CSP refuses local API fetch; no P3 transport added', status: 'PASS', csp });
  await second.close(); await page.bringToFront();

  // Compile ONLY the production extractor; evaluate its serialized function in actual Chrome DOM.
  const bundled = await build({ entryPoints: [resolve(project, 'extension/src/extract.ts')], bundle: true, format: 'iife', globalName: 'P2Extractor', write: false });
  const extractor = bundled.outputFiles[0].text;
  const domResults = [];
  for (const path of ['/article-a','/privacy','/long','/scan','/inline','/empty','/not-html']) {
    await page.goto(origin + path); await page.bringToFront();
    const data = await page.evaluate(source => { const fn = new Function(`${source}; return P2Extractor.extractPage;`)(); return fn(); }, extractor);
    if (path === '/empty') assert.deepEqual(data, { ok: false, code: 'NO_CONTENT' });
    else if (path === '/not-html') assert.deepEqual(data, { ok: false, code: 'UNSUPPORTED_PAGE' });
    else {
      assert.equal(data.ok, true); assert.ok(data.data.text.length <= 6000); assert.ok(data.data.blocks.every(b => b.text.length <= 1500));
      assert.equal(data.data.text, data.data.blocks.map(b => b.text).join('\n'));
      if (path === '/privacy') { assert.match(data.data.text, /VISIBLE_OK/); assert.ok(!data.data.text.includes('SECRET_')); assert.match(data.data.text, /DELETE_ALL/); }
      if (path === '/long') { assert.equal(data.data.truncated, true); assert.ok(!data.data.text.includes('TAIL_NOT_EXPECTED')); assert.ok(!/[\uD800-\uDBFF]$/.test(data.data.text)); }
      if (path === '/scan') { assert.equal(data.data.scanLimited, true); assert.ok(!data.data.text.includes('AFTER_SCAN_LIMIT')); }
      if (path === '/inline') { assert.match(data.data.text, /Hello world/); assert.match(data.data.text, /a\n  b/); }
    }
    target = await (await workerFor(id)).evaluate(async url => (await chrome.tabs.query({})).find(t => t.url === url), page.url());
    const realCapture = await send();
    if (data.ok) { assert.equal(realCapture.ok, true, JSON.stringify(realCapture)); assert.equal(realCapture.data.text, data.data.text); }
    else { assert.equal(realCapture.ok, false); assert.equal(realCapture.error.code, data.code); }
    domResults.push({ path, status: 'PASS', result: data });
  }
  await writeFile(resolve(evidence, 'dom-extraction.json'), JSON.stringify(domResults, null, 2));
  report.results.push({ name: 'Actual DOM structure, privacy, Unicode bounds, scan limit, empty and non-HTML', status: 'PASS', fixtures: domResults.map(r => r.path) });
  const base = resolve('.runtime/p2-author-preview');
  const allowed = { '/':'index.html', '/index.html':'index.html', '/app.js':'app.js', '/style.css':'style.css', '/lesson.json':'lesson.json' };
  previewServer = createServer(async (req,res) => {
    const name = allowed[new URL(req.url,'http://127.0.0.1').pathname];
    if (!name) { res.writeHead(404).end(); return; }
    try { res.setHeader('Content-Type', name.endsWith('.js') ? 'text/javascript' : name.endsWith('.css') ? 'text/css' : name.endsWith('.json') ? 'application/json' : 'text/html; charset=utf-8'); res.end(await readFile(resolve(base,name))); }
    catch { res.writeHead(500).end(); }
  });
  await new Promise(r => previewServer.listen(0,'127.0.0.1',r));
  const previewOrigin = `http://127.0.0.1:${previewServer.address().port}`;
  await context.grantPermissions(['clipboard-read','clipboard-write'], { origin: previewOrigin });
  const article = await context.newPage(), articleErrors = [];
  article.on('pageerror',error => articleErrors.push(String(error)));
  await article.goto(previewOrigin);
  await article.getByRole('heading',{level:1}).waitFor();
  assert.equal(await article.locator('h1').count(),1);
  await article.getByRole('button',{name:'复制提示词',exact:true}).first().click();
  const copied = await article.evaluate(() => navigator.clipboard.readText());
  assert.match(copied,/请阅读当前 P2 Starter/); assert.ok(!copied.includes('```'));
  const detail = article.locator('details').first(); assert.equal(await detail.getAttribute('open'),null);
  await detail.locator('summary').click(); assert.notEqual(await detail.getAttribute('open'),null);
  const complete = article.getByRole('button',{name:'标记为完成',exact:true}); assert.equal(await complete.isDisabled(),true);
  const tasks = article.locator('button[aria-pressed]'); assert.equal(await tasks.count(),10);
  for(let i=0;i<10;i++) await tasks.nth(i).click();
  assert.equal(await complete.isEnabled(),true); await complete.click(); await article.getByRole('button',{name:'已完成本课',exact:true}).waitFor();
  for(const width of [1440,390]) {
    await article.setViewportSize({width,height:1000});
    assert.equal(await article.evaluate(() => document.documentElement.scrollWidth <= innerWidth),true, `lesson overflow ${width}`);
    await article.screenshot({path:resolve(evidence,`lesson-${width}.png`),fullPage:true});
    await article.locator('#lesson-prompt').first().screenshot({path:resolve(evidence,`prompt-${width}.png`)});
  }
  assert.deepEqual(articleErrors,[]);
  report.results.push({name:'Actual Lesson Renderer V2 private preview: 5 prompts, clipboard, foldout, 10 checklist tasks, completion and 1440/390 layout',status:'PASS',platformPersistence:'not exercised; preview state only in memory'});
  assert.deepEqual(errors, []);
  report.extensionIds = { product: productId, controlled: id };
  report.status = 'PASS within declared scope';
} catch (error) { report.status = 'FAIL'; report.error = String(error); report.stack = error.stack; process.exitCode = 1; }
finally {
  await writeFile(resolve(evidence, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ evidence, ...report }, null, 2));
  fixture.close();
  previewServer?.close();
  if (browser) { try { await (await browser.newBrowserCDPSession()).send('Browser.close'); } catch {} await browser.close().catch(() => {}); }
  if (child.exitCode === null) child.kill();
  // Profiles and failed evidence are retained. No recursive cleanup.
}
