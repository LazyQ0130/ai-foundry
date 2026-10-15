// Author-only real Chrome headless integration. Never simulates a toolbar action.
import { chromium } from '../../spikes/ai-browser-copilot-spike/node_modules/playwright-core/index.mjs';
import { spawn } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { createServer } from 'node:http';
import assert from 'node:assert/strict';

const evidence=resolve('docs/ai-browser-copilot/artifacts/p1-20261014');
const profile=resolve(`.runtime/p1-headless-${Date.now()}`);
await mkdir(profile,{recursive:true});
const report={time:new Date().toISOString(),scope:'Actual installed Chrome headless + test-only CDP installation. Extension document loaded as a tab, NOT a native Side Panel. No synthetic toolbar action or activeTab grant.',nativeToolbar:'BLOCKED',results:[]};
const child=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new',`--user-data-dir=${profile}`,'--remote-debugging-port=0','--remote-debugging-address=127.0.0.1','--enable-unsafe-extension-debugging','--no-first-run','--no-default-browser-check','about:blank'],{stdio:'ignore',windowsHide:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let browser,server;
try{
  let port;
  for(let i=0;i<100;i++){try{port=(await readFile(resolve(profile,'DevToolsActivePort'),'utf8')).split('\n')[0];if(port)break;}catch{}await sleep(100);}
  assert.ok(port,'Chrome CDP startup');
  browser=await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
  report.browser=browser.version();
  const cdp=await browser.newBrowserCDPSession();
  const context=browser.contexts()[0];
  for(const role of ['starter','reference']){
    const {id}=await cdp.send('Extensions.loadUnpacked',{path:resolve('.runtime/p1-clean-online-20261014',role,'.output/chrome-mv3')});
    const page=await context.newPage();
    const errors=[];page.on('pageerror',e=>errors.push(String(e)));
    await page.goto(`chrome-extension://${id}/sidepanel.html`);
    const button=page.getByRole('button');
    if(role==='starter')assert.equal(await button.isDisabled(),true);
    else {await button.click();await page.getByRole('status').filter({hasText:'确认成功'}).waitFor();}
    let worker=context.serviceWorkers().find(w=>w.url()===`chrome-extension://${id}/background.js`);
    if(!worker)worker=await context.waitForEvent('serviceworker',{predicate:w=>w.url()===`chrome-extension://${id}/background.js`,timeout:10000});
    const state=await worker.evaluate(async()=>({listener:chrome.action.onClicked.hasListeners(),panelBehavior:await chrome.sidePanel.getPanelBehavior(),permissions:await chrome.permissions.getAll()}));
    assert.equal(state.listener,role==='reference');
    assert.equal(state.panelBehavior.openPanelOnActionClick,false);
    assert.deepEqual(state.permissions.permissions,['sidePanel']);
    for(const width of [390,520]){
      await page.setViewportSize({width,height:850});
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
      await page.screenshot({path:resolve(evidence,`${role}-extension-document-${width}.png`),fullPage:true});
    }
    assert.deepEqual(errors,[]);
    const network=await page.evaluate(async()=>{try{await fetch('http://127.0.0.1:8787/health');return 'UNEXPECTED_SUCCESS';}catch{return 'CSP_BLOCKED';}});
    assert.equal(network,'CSP_BLOCKED');
    report.results.push({role,status:'PASS',extensionId:id,react:role==='starter'?'disabled exercise placeholder':'confirmed React state after real DOM click',state,productionOutboundAttempt:network,uncaughtPageErrors:errors,nativeToolbar:'not exercised'});
    await page.close();
  }
  const base=resolve('.runtime/p1-author-preview');
  server=createServer(async(req,res)=>{try{
    const pathname=new URL(req.url,'http://127.0.0.1').pathname;
    const allowed={'/':'index.html','/index.html':'index.html','/app.js':'app.js','/style.css':'style.css','/lesson.json':'lesson.json'};
    if(!allowed[pathname]){res.writeHead(404).end();return;}
    const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json'};
    res.setHeader('Content-Type',types[extname(allowed[pathname])]);res.end(await readFile(resolve(base,allowed[pathname])));
  }catch{res.writeHead(500).end();}});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const origin=`http://127.0.0.1:${server.address().port}`;
  await context.grantPermissions(['clipboard-read','clipboard-write'],{origin});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(origin);await page.getByRole('heading',{level:1}).waitFor();
  assert.equal(await page.locator('h1').count(),1);
  await page.getByRole('button',{name:'复制提示词',exact:true}).first().click();
  const copied=await page.evaluate(()=>navigator.clipboard.readText());
  assert.match(copied,/请阅读当前 P1 Starter/);assert.ok(!copied.includes('```'));
  const detail=page.locator('details').first();assert.equal(await detail.getAttribute('open'),null);
  await detail.locator('summary').click();assert.notEqual(await detail.getAttribute('open'),null);
  const complete=page.getByRole('button',{name:'标记为完成',exact:true});assert.equal(await complete.isDisabled(),true);
  const tasks=page.locator('button[aria-pressed]');assert.equal(await tasks.count(),8);
  for(let i=0;i<8;i++)await tasks.nth(i).click();
  assert.equal(await complete.isEnabled(),true);await complete.click();await page.getByRole('button',{name:'已完成本课',exact:true}).waitFor();
  for(const width of [1440,390]){
    await page.setViewportSize({width,height:1000});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`article overflow ${width}`);
    await page.screenshot({path:resolve(evidence,`lesson-preview-${width}.png`),fullPage:true});
    await page.locator('#lesson-prompt').screenshot({path:resolve(evidence,`lesson-prompt-${width}.png`)});
  }
  assert.deepEqual(errors,[]);
  report.results.push({role:'private lesson preview',status:'PASS',realRenderer:true,realTaskCard:true,promptClipboardMatchesCode:true,deepDiveToggle:true,localChecklistComplete:true,widths:[1440,390],uncaughtErrors:errors,platformPersistence:'not exercised; author preview uses memory only'});
  report.status='PASS within declared scope';
}catch(error){report.status='FAIL';report.error=String(error);process.exitCode=1;}
finally{
  await writeFile(resolve(evidence,'chrome-headless-integration.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
  if(server)server.close();
  if(browser){try{await(await browser.newBrowserCDPSession()).send('Browser.close');}catch{}await browser.close().catch(()=>{});}
  if(child.exitCode===null)child.kill();
  // Keep all test profiles and failed artifacts. Never remove recursively.
}
