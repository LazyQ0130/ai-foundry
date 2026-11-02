import assert from 'node:assert/strict';import{readFile,writeFile,readdir}from'node:fs/promises';import{resolve}from'node:path';import{fileURLToPath}from'node:url';import{spawnSync}from'node:child_process';
const root=fileURLToPath(new URL('../',import.meta.url)),ev=resolve(root,'evidence'),repo=resolve(root,'../../..');const summary=[];
for(const h of ['h13','h14','h15','h16']){
 const name=(await readdir(ev)).filter(n=>/^run-\d+/.test(n)&&n.endsWith('-'+h+'.json')).sort().at(-1);const previous=JSON.parse(await readFile(resolve(ev,name),'utf8'));
 for(const kind of (['h15','h16'].includes(h)?['demo','negative']:['negative'])){
  const args=[...previous.args.slice(0,-3),kind==='demo'?'demo.ts':'negative-answer.ts'];
  const r=spawnSync(previous.executable,args,{cwd:previous.scratch,env:previous.env,encoding:'utf8',timeout:90000});
  const raw={lesson:h,kind,args,executable:previous.executable,scratch:previous.scratch,programs:previous.programs,exit:r.status,stdout:r.stdout,stderr:r.stderr,error:r.error?.message};
  await writeFile(resolve(ev,`aux-${Date.now()}-${h}-${kind}.json`),JSON.stringify(raw,null,2)+'\n');
  if(kind==='demo')assert.equal(r.status,0,h);else {assert.equal(r.status,1,h+' expected controlled failure');assert.match(r.stderr,/AssertionError/);}summary.push({lesson:h,kind,exit:r.status,status:kind==='demo'?'PASS':'EXPECTED_FAILURE'});
 }
}
const source='C:/Users/QYF/.codex/research/harness-v2-source/deepseek-harness-f3803c96974ad4a94195fb97e5c637e9c2a3afe3';const upstream=await readFile(resolve(source,'pnpm-lock.yaml'),'utf8');
const check=async(path)=>{const lock=JSON.parse(await readFile(path,'utf8'));for(const[name,p]of Object.entries(lock.packages))if(name)assert.ok(p.integrity&&upstream.includes(p.integrity),name+' differs from fixed source');};
let oldRejected=false;try{await check('C:/Users/QYF/.codex/research/h15-probe-deps/package-lock.json');}catch(e){oldRejected=true;summary.push({kind:'dependency old cache',status:'EXPECTED_FAILURE',error:String(e)});}assert.ok(oldRejected);
await check('C:/Users/QYF/.codex/research/module-four-probe-deps/package-lock.json');
for(const h of ['h15','h16'])assert.match(await readFile(resolve(repo,`docs/deepseek-harness-v2/${h}/scripts/run-labs.mjs`),'utf8'),/Object\.entries\(fsLock.packages\)/);
summary.push({kind:'dependency pinned tree and two corrected runner guards',status:'PASS'});await writeFile(resolve(ev,'aux-results.json'),JSON.stringify(summary,null,2)+'\n');console.log(JSON.stringify(summary));
