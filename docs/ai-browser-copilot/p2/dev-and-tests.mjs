import { spawn } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';

const evidence=resolve(`docs/ai-browser-copilot/p2/artifacts/checks-${Date.now()}`);
await mkdir(evidence,{recursive:true});
const latest=JSON.parse(await readFile('docs/ai-browser-copilot/p2/artifacts/latest-delivery.json','utf8'));
const delivery=JSON.parse(await readFile(resolve(latest.evidence,'report.json'),'utf8'));
const report={time:new Date().toISOString(),results:[]};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function run(label,args,cwd=process.cwd(),expect=0) {
  const child=spawn(process.execPath,args,{cwd,windowsHide:true,stdio:['ignore','pipe','pipe']});
  let output='';child.stdout.on('data',b=>output+=b);child.stderr.on('data',b=>output+=b);
  const code=await new Promise((res,rej)=>{child.on('error',rej);child.once('exit',res);});
  await writeFile(resolve(evidence,`${label}.txt`),output+`\nexit_code=${code}\n`);
  assert.equal(code,expect,`${label}\n${output}`);return output;
}
let active;
try {
  await run('deterministic-tests',[resolve('spikes/ai-browser-copilot-spike/node_modules/tsx/dist/cli.mjs'),'--test','docs/ai-browser-copilot/p2/unit.test.ts']);
  report.results.push({name:'P2 deterministic tests',status:'PASS',tests:28});
  await run('existing-renderer-tests',[resolve('node_modules/tsx/dist/cli.mjs'),'--test','tests/lesson-renderer.test.ts']);
  report.results.push({name:'Existing Renderer V2 tests, no DB',status:'PASS',tests:9});
  const occupied=await fetch('http://127.0.0.1:3080/@vite/client',{signal:AbortSignal.timeout(1000)}).then(()=>true,()=>false);
  assert.equal(occupied,false,'Refusing to reuse/stop a pre-existing dev service');
  for(const role of ['starter','reference']) {
    const cwd=delivery.validation[role].directory;
    const child=spawn(process.execPath,[resolve(cwd,'node_modules/wxt/bin/wxt.mjs'),'--config','extension/wxt.config.ts'],{cwd,windowsHide:true,stdio:['ignore','pipe','pipe']});
    active=child;let output='';child.stdout.on('data',b=>output+=b);child.stderr.on('data',b=>output+=b);
    let manifest;
    try {
      for(let i=0;i<100;i++) {
        assert.equal(child.exitCode,null,'dev startup process exited');
        try {
          manifest=JSON.parse(await readFile(resolve(cwd,'.output/chrome-mv3-dev/manifest.json'),'utf8'));
          const res=await fetch('http://127.0.0.1:3080/@vite/client',{signal:AbortSignal.timeout(1000)});
          if(res.ok)break;
        }catch{}
        manifest=undefined;await sleep(100);
      }
      assert.ok(manifest,'real WXT dev server ready');
      assert.ok(manifest.host_permissions.some(h=>h.includes('127.0.0.1')));
      assert.ok(manifest.permissions.includes('activeTab')&&manifest.permissions.includes('scripting'));
      await writeFile(resolve(evidence,`${role}-dev-manifest.json`),JSON.stringify(manifest,null,2));
      report.results.push({name:`${role} independent WXT dev + HTTP`,status:'PASS',endpoint:'http://127.0.0.1:3080/@vite/client',developmentPermissions:manifest.permissions,developmentHosts:manifest.host_permissions});
    }finally {
      child.kill();await new Promise(r=>child.once('exit',r));active=undefined;await sleep(150);
      await writeFile(resolve(evidence,`${role}-dev.txt`),output);
    }
  }
  const cwd=delivery.validation.reference.directory;
  const fault=resolve(cwd,'extension/p2-intentional-type-error.ts');
  await writeFile(fault,"export const count: number = 'one';\n",{flag:'wx'});
  try {
    const failure=await run('intentional-type-failure',[resolve(cwd,'node_modules/typescript/bin/tsc'),'--noEmit'],cwd,2);
    assert.match(failure,/TS2322/);
  }finally { await writeFile(fault,'export const count: number = 1;\n'); }
  await run('type-failure-recovered',[resolve(cwd,'node_modules/typescript/bin/tsc'),'--noEmit'],cwd);
  report.results.push({name:'Real TypeScript failure and recovery in isolated validation copy',status:'PASS',failureExit:2,recoveryExit:0,sourceDeliverables:'unchanged'});
  report.status='PASS';
}catch(error){report.status='FAIL';report.error=String(error);process.exitCode=1;}
finally{
  active?.kill();await writeFile(resolve(evidence,'report.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify({evidence,...report},null,2));
}
