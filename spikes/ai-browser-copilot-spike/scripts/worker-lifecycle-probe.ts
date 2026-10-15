// Test-only extension: REAL Chrome storage and worker stop/restart, fixture tab/scripting adapters.
// No native toolbar action or activeTab grant is simulated or claimed by this probe.
import { chromium } from 'playwright-core';
import { build } from 'esbuild';
import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root=process.cwd();
const output=resolve(process.env.EVIDENCE_DIR ?? `docs/artifacts/worker-lifecycle-fix/probe-${Date.now()}`);
const profile=resolve('.runtime/lifecycle-'+Date.now());
await mkdir(output,{recursive:true});await mkdir(profile,{recursive:true});
const child=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new',`--user-data-dir=${profile}`,'--remote-debugging-port=0','--remote-debugging-address=127.0.0.1','--enable-unsafe-extension-debugging','--no-first-run','--no-default-browser-check','about:blank'],{stdio:'ignore',windowsHide:true});
let browser:Awaited<ReturnType<typeof chromium.connectOverCDP>>|undefined;
try {
  let port='';for(let i=0;i<80;i++){try{port=(await readFile(resolve(profile,'DevToolsActivePort'),'utf8')).split('\n')[0];if(port)break;}catch{}await new Promise(r=>setTimeout(r,100));}
  if(!port)throw Error('Chrome did not start');
  browser=await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
  const browserCdp=await browser.newBrowserCDPSession();const context=browser.contexts()[0];
  const results:Array<Record<string,unknown>>=[];
  for(const variant of ['before','after']) {
    const extension=resolve(profile,variant);await mkdir(extension);
    const source=await readFile(resolve(variant==='before'?'docs/artifacts/worker-lifecycle-fix/coordinator-before-fix.ts':'extension/src/coordinator.ts'),'utf8');
    await build({stdin:{contents:`
      import {createCoordinator} from 'coordinator-under-test';
      const instance=crypto.randomUUID();
      const tab={id:70001,windowId:700,url:'https://controlled-fixture.invalid/',active:true};
      const adapter={runtime:chrome.runtime,storage:chrome.storage,
        tabs:{get:async()=>({...tab}),query:async()=>[{...tab}]},
        scripting:{executeScript:async()=>[{frameId:0,result:{url:tab.url,title:'lifecycle fixture',text:'Controlled fixture, not a captured user page.',truncated:false}}]},
        sidePanel:{open:async()=>{}}};
      const coordinator=createCoordinator(adapter);
      chrome.runtime.onMessage.addListener((msg,_sender,respond)=>{
        const sender={id:chrome.runtime.id,url:chrome.runtime.getURL('sidepanel.html')};
        const request={v:1,type:msg.cmd==='capture'?'CAPTURE':'CHECK_CONTEXT',requestId:crypto.randomUUID(),context:{tabId:tab.id,url:tab.url}};
        if(msg.cmd!=='capture')request.contextToken=msg.token;
        if(msg.cmd==='invalidate')coordinator.invalidate(tab.id,tab.windowId);
        coordinator.handle(request,sender).then(result=>respond({instance,result}));return true;
      });
    `,resolveDir:root,loader:'ts'},bundle:true,platform:'browser',format:'iife',outfile:resolve(extension,'background.js'),plugins:[{name:'fixture-coordinator',setup(b){
      b.onResolve({filter:/^coordinator-under-test$/},()=>({path:'coordinator',namespace:'fixture'}));
      b.onLoad({filter:/.*/,namespace:'fixture'},()=>({contents:source,loader:'ts',resolveDir:resolve(root,'extension/src')}));
    }}]});
    await writeFile(resolve(extension,'manifest.json'),JSON.stringify({manifest_version:3,name:`Phase0 worker lifecycle ${variant} FIXTURE ONLY`,version:'0.0.0',permissions:['storage'],background:{service_worker:'background.js'}}));
    await writeFile(resolve(extension,'probe.html'),'<title>Controlled lifecycle fixture</title>');
    const installed=await browserCdp.send('Extensions.loadUnpacked',{path:extension});
    const page=await context.newPage();await page.goto(`chrome-extension://${installed.id}/probe.html`);
    const pageCdp=await context.newCDPSession(page);const versions=new Map<string,{versionId:string;scriptURL:string;runningStatus:string}>();
    pageCdp.on('ServiceWorker.workerVersionUpdated',event=>{for(const v of event.versions)versions.set(v.versionId,v);});
    await pageCdp.send('ServiceWorker.enable');
    const command=(cmd:string,token?:string)=>page.evaluate(({cmd,token})=>chrome.runtime.sendMessage({cmd,token}),{cmd,token});
    const first=await command('capture');
    if(!first.result.ok)throw Error('Fixture capture failed');
    const token=first.result.data.contextToken;
    async function stop() {
      let running;
      for(let i=0;i<100;i++){running=[...versions.values()].find(v=>v.scriptURL===`chrome-extension://${installed.id}/background.js`&&v.runningStatus==='running');if(running)break;await new Promise(r=>setTimeout(r,30));}
      if(!running)throw Error('Worker running version was not observed');
      await pageCdp.send('ServiceWorker.stopWorker',{versionId:running.versionId});
    }
    await stop();const second=await command('check',token);
    if(first.instance===second.instance)throw Error('Worker did not actually restart');
    const invalidated=await command('invalidate',token);await stop();const third=await command('check',token);
    if(second.instance===third.instance)throw Error('Second worker did not actually restart');
    const valid=variant==='before'?second.result.ok===false:second.result.ok===true;
    if(!valid||invalidated.result.ok!==false||third.result.ok!==false)throw Error(`Unexpected ${variant} result`);
    results.push({variant,extensionId:installed.id,initialInstance:first.instance,restartedInstance:second.instance,secondRestartedInstance:third.instance,unchangedPageAfterRestart:second.result,afterNavigation:invalidated.result,afterNavigationAndRestart:third.result});
    await page.close();
  }
  const report={status:'PASS',time:new Date().toISOString(),browser:browser.version(),scope:'Real native Chrome worker termination/restart and storage.session, with deterministic tab/scripting adapters in a separate fixture extension. Not native user capture, toolbar authorization or Panel Mock acceptance.',results};
  await writeFile(resolve(output,'chrome-lifecycle-probe.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
} finally {
  if(browser){try{await(await browser.newBrowserCDPSession()).send('Browser.close');}catch{}await browser.close().catch(()=>{});}
  if(child.exitCode===null)child.kill();
  // Keep profiles and fixture bundles; never delete directories recursively.
}
