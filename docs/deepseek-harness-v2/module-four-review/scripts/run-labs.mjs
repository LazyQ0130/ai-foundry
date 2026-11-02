import assert from 'node:assert/strict';
import {readFile,writeFile,mkdtemp,readdir,copyFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const root=fileURLToPath(new URL('../',import.meta.url)),repo=resolve(root,'../../..'),ev=resolve(root,'evidence');
const source=process.env.HARNESS_SOURCE_CACHE??'C:/Users/QYF/.codex/research/harness-v2-source/deepseek-harness-f3803c96974ad4a94195fb97e5c637e9c2a3afe3';
const sha=b=>createHash('sha256').update(b).digest('hex');
const lock=JSON.parse(await readFile(resolve(repo,'docs/deepseek-harness-v2/h16/evidence/source-lock.json'),'utf8'));
for(const f of lock.files)assert.equal(sha(await readFile(resolve(source,f.path))),f.sha256,f.path);
const upstream=await readFile(resolve(source,'pnpm-lock.yaml'),'utf8');
const deps=['h04','h09','module-four','h16'];
const depLocks=[];
for(const d of deps){const path=`C:/Users/QYF/.codex/research/${d}-probe-deps/package-lock.json`;const raw=await readFile(path,'utf8'); const l=JSON.parse(raw);for(const [n,p]of Object.entries(l.packages))if(n)assert.ok(upstream.includes(p.integrity),n);depLocks.push({path,sha256:sha(raw),packages:l.packages});}
await writeFile(resolve(ev,'dependencies.json'),JSON.stringify(depLocks,null,2)+'\n');
const results=[];
for(const [h,testFile,expected]of [['h13','registry.test.ts',37],['h14','pipeline.test.ts',45],['h15','safety.test.ts',31],['h16','ecosystem.test.ts',23],['cross','cross.test.ts',3]]){
 const lab=h==='cross'?resolve(root,'lab'):resolve(repo,`course-content/internal/deepseek-harness/${h}/lab`);
 const scratch=await mkdtemp(resolve(tmpdir(),`aifoundry-m4-${h}-`));const programs=[];
 if(h==='cross')for(const name of ['bootstrap.mjs','support.ts']){const origin=resolve(repo,'course-content/internal/deepseek-harness/h16/lab',name);const data=await readFile(origin);await copyFile(origin,resolve(scratch,name));programs.push({name,origin,sha256:sha(data),reuse:'Unmodified H16 helper; no additional scenario count'});}
 for(const name of await readdir(lab)){const data=await readFile(resolve(lab,name));programs.push({name,sha256:sha(data)});await copyFile(resolve(lab,name),resolve(scratch,name));}
 await writeFile(resolve(scratch,'package.json'),'{"type":"module","private":true}\n');
 await writeFile(resolve(scratch,'tsconfig.json'),JSON.stringify({extends:resolve(source,'tsconfig.base.json')}));
 const env=Object.fromEntries(['SystemRoot','WINDIR','TEMP','TMP','PATH','PATHEXT'].filter(k=>process.env[k]!==undefined).map(k=>[k,process.env[k]]));
 Object.assign(env,{HARNESS_SOURCE_CACHE:source,DSH_HOME:resolve(scratch,'fixture-home'),H16_FIXTURE_ONLY:'true',AUDIT_EVIDENCE:ev});
 for(const p of ['H13','H14','H15','H16'])Object.assign(env,{[p+'_DEPS_ANCHOR']:'C:/Users/QYF/.codex/research/h04-probe-deps/node_modules/commander/index.js',[p+'_ZOD_ANCHOR']:'C:/Users/QYF/.codex/research/h09-probe-deps/node_modules/zod/index.js',[p+'_FS_DEPS_ANCHOR']:'C:/Users/QYF/.codex/research/module-four-probe-deps/node_modules/chokidar/index.js',[p+'_ECO_DEPS_ANCHOR']:'C:/Users/QYF/.codex/research/h16-probe-deps/package.json'});
 const args=[resolve(repo,'node_modules/tsx/dist/cli.mjs'),'--tsconfig',resolve(scratch,'tsconfig.json'),'--import',pathToFileURL(resolve(scratch,'bootstrap.mjs')).href,'--test','--test-reporter=tap',testFile];
 const started=new Date().toISOString();const r=spawnSync(process.execPath,args,{cwd:scratch,env,encoding:'utf8',timeout:90000});
 const result={lesson:h,started,node:process.version,platform:process.platform,executable:process.execPath,args,scratch,programs,env,exit:r.status,error:r.error?.message,stdout:r.stdout,stderr:r.stderr};
 await writeFile(resolve(ev,`run-${Date.now()}-${h}.json`),JSON.stringify(result,null,2)+'\n');
 await writeFile(resolve(ev,`${h}-tests.tap`),r.stdout+r.stderr);
 assert.equal(r.status,0,`${h} failed: ${r.stdout}\n${r.stderr}`);
 const count=Number(/# tests (\d+)/.exec(r.stdout)?.[1]);assert.equal(count,expected);assert.match(r.stdout,/# fail 0/);
 results.push({lesson:h,tests:count,pass:count,fail:0,scratch,programs});console.log(`${h}: ${count} PASS`);
}
await writeFile(resolve(ev,'lab-results.json'),JSON.stringify({status:'PASS',commit:lock.commit,sourceFilesChecked:lock.files.length,results,legacyReportedTests:136,newCrossTests:3,meaning:'Execution items, not independent safety scenarios; D reuses H16 SDK stdio evidence. E/native sandbox/network/HTTP not run.'},null,2)+'\n');
