import { spawn } from 'node:child_process';
import { readFile, writeFile, unlink, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { chromium } from '../../spikes/ai-browser-copilot-spike/node_modules/playwright-core/index.mjs';

const evidence=resolve('docs/ai-browser-copilot/artifacts/p1-20261014');
const base=resolve('.runtime/p1-clean-online-20261014');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const results=[];
function wxt(role){
  const cwd=resolve(base,role);
  const child=spawn(process.execPath,[resolve(cwd,'node_modules/wxt/bin/wxt.mjs'),'--config','extension/wxt.config.ts'],{cwd,windowsHide:true,stdio:['ignore','pipe','pipe']});
  let output='';child.stdout.on('data',b=>output+=b);child.stderr.on('data',b=>output+=b);
  return {child,get output(){return output;}};
}
async function waitForDev(role,run){
  for(let i=0;i<120;i++){
    if(run.child.exitCode!==null)throw Error(run.output);
    try{const m=JSON.parse(await readFile(resolve(base,role,'.output/chrome-mv3-dev/manifest.json'),'utf8'));const r=await fetch('http://127.0.0.1:3080/@vite/client');if(r.ok)return m;}catch{}
    await sleep(100);
  }throw Error('Dev readiness timeout '+run.output);
}
async function stop(run){run.child.kill();await new Promise(r=>run.child.once('exit',r));await sleep(300);}
const occupied=await fetch('http://127.0.0.1:3080').then(()=>true,()=>false);
assert.equal(occupied,false,'Refusing to use or stop someone else’s dev service on 3080');
let active,browser,chrome;
const profile=resolve(`.runtime/p1-dev-headless-${Date.now()}`);
try{
  active=wxt('starter');const starter=await waitForDev('starter',active);
  assert.ok(starter.permissions.includes('tabs')&&starter.permissions.includes('scripting'));
  assert.ok(starter.host_permissions.some(p=>p.includes('127.0.0.1')));
  await writeFile(resolve(evidence,'starter-development-manifest.json'),JSON.stringify(starter,null,2));
  const conflict=wxt('reference');
  const code=await new Promise((r,reject)=>{const t=setTimeout(()=>{conflict.child.kill();reject(Error('Port conflict did not exit'));},15000);conflict.child.once('exit',code=>{clearTimeout(t);r(code);});});
  await writeFile(resolve(evidence,'dev-port-conflict.txt'),conflict.output);
  assert.notEqual(code,0);assert.match(conflict.output,/3080|already|use/i);
  results.push({case:'two dev services, strict port conflict',status:'PASS',exitCode:code});
  await stop(active);await writeFile(resolve(evidence,'starter-dev.txt'),active.output);active=undefined;
  active=wxt('reference');const reference=await waitForDev('reference',active);
  await writeFile(resolve(evidence,'reference-development-manifest.json'),JSON.stringify(reference,null,2));
  await mkdir(profile,{recursive:true});
  chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new',`--user-data-dir=${profile}`,'--remote-debugging-port=0','--remote-debugging-address=127.0.0.1','--enable-unsafe-extension-debugging','--no-first-run','--no-default-browser-check','about:blank'],{stdio:'ignore',windowsHide:true});
  let port;for(let i=0;i<100;i++){try{port=(await readFile(resolve(profile,'DevToolsActivePort'),'utf8')).split('\n')[0];if(port)break;}catch{}await sleep(100);}assert.ok(port);
  browser=await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
  const {id}=await(await browser.newBrowserCDPSession()).send('Extensions.loadUnpacked',{path:resolve(base,'reference/.output/chrome-mv3-dev')});
  const page=await browser.contexts()[0].newPage();await page.goto(`chrome-extension://${id}/sidepanel.html`);
  await page.getByText('这是我的阅读入口。先让侧栏稳定打开，再逐课加入阅读能力。',{exact:true}).waitFor();
  const app=resolve(base,'reference/extension/entrypoints/sidepanel/App.tsx');
  const original=await readFile(app,'utf8');
  try{
    await writeFile(app,original.replace('这是我的阅读入口。','开发更新已生效。'));
    await page.getByText('开发更新已生效。先让侧栏稳定打开，再逐课加入阅读能力。',{exact:true}).waitFor({timeout:15000});
    await page.screenshot({path:resolve(evidence,'reference-dev-update-extension-document.png'),fullPage:true});
  }finally{await writeFile(app,original);}
  await page.getByText('这是我的阅读入口。先让侧栏稳定打开，再逐课加入阅读能力。',{exact:true}).waitFor({timeout:15000});
  results.push({case:'reference dev startup, real extension document update and restore',status:'PASS',browser:browser.version(),note:'actual headless Chrome extension document, not native toolbar or Side Panel'});
  await stop(active);await writeFile(resolve(evidence,'reference-dev.txt'),active.output);active=undefined;
  const fault=resolve(base,'reference/extension/p1-error-fixture.ts');
  await writeFile(fault,"export const practiceCount: number = 'one';\n",{flag:'wx'});
  async function typecheck(){
    const child=spawn(process.execPath,[resolve(base,'reference/node_modules/typescript/bin/tsc'),'--noEmit'],{cwd:resolve(base,'reference'),windowsHide:true});
    let output='';child.stdout.on('data',b=>output+=b);child.stderr.on('data',b=>output+=b);
    const exitCode=await new Promise(r=>child.once('exit',r));return {exitCode,output};
  }
  let failure;
  try{failure=await typecheck();assert.notEqual(failure.exitCode,0);assert.match(failure.output,/TS2322/);}finally{await unlink(fault);}
  const recovered=await typecheck();assert.equal(recovered.exitCode,0);
  await writeFile(resolve(evidence,'type-error-and-recovery.json'),JSON.stringify({failure,recovered},null,2));
  results.push({case:'real TypeScript mismatch and recovery',status:'PASS',failureCode:failure.exitCode,recoveredCode:recovered.exitCode});
  results.push({case:'starter and reference dev servers independently built and served',status:'PASS',port:3080,serverHost:'127.0.0.1',devPermissions:reference.permissions,devHostPermissions:reference.host_permissions});
}catch(error){results.push({status:'FAIL',error:String(error)});process.exitCode=1;}
finally{
  if(active){await stop(active);await writeFile(resolve(evidence,'interrupted-dev.txt'),active.output);}
  if(browser){try{await(await browser.newBrowserCDPSession()).send('Browser.close');}catch{}await browser.close().catch(()=>{});}
  if(chrome&&chrome.exitCode===null)chrome.kill();
  await writeFile(resolve(evidence,'dev-and-recovery.json'),JSON.stringify({time:new Date().toISOString(),results},null,2));console.log(JSON.stringify(results,null,2));
}
