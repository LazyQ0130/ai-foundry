import assert from 'node:assert/strict';
import {readFile,writeFile,mkdtemp,readdir,copyFile,mkdir,stat,symlink} from 'node:fs/promises';
import {tmpdir,release} from 'node:os';
import {resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {parse} from 'yaml';
const diag=fileURLToPath(new URL('../',import.meta.url)),root=resolve(diag,'..'),repo=resolve(root,'../../..');
process.on('uncaughtException',async error=>{await writeFile(resolve(diag,`evidence/runner-failure-${Date.now()}.json`),JSON.stringify({args:process.argv.slice(2),error:String(error),stack:error.stack},null,2)+'\n');process.exitCode=1;});
const lock=JSON.parse(await readFile(resolve(root,'evidence/source-lock.json'),'utf8'));
const source=process.env.HARNESS_SOURCE_CACHE??lock.sourceCache;
const hash=b=>createHash('sha256').update(b).digest('hex');
for(const f of lock.files)assert.equal(hash(await readFile(resolve(source,f.path))),f.sha256,f.path);
const upstream=parse(await readFile(resolve(source,'pnpm-lock.yaml'),'utf8')),dependencies=[];
const anchor=process.env.H24_DEPS_ANCHOR??'C:/Users/QYF/.codex/research/h04-probe-deps/node_modules/commander/index.js';
const zod=process.env.H24_ZOD_ANCHOR??'C:/Users/QYF/.codex/research/h09-probe-deps/node_modules/zod/index.js';
const native=process.env.H24_NATIVE_ANCHOR??'C:/Users/QYF/.codex/research/module-four-probe-deps/node_modules/koffi/index.js';
const limit=process.env.H24_LIMIT_ANCHOR??'C:/Users/QYF/.codex/research/h18-persistence-deps/node_modules/p-limit/index.js';
const ptc=process.env.H24_PTC_ANCHOR??'C:/Users/QYF/.codex/research/h22-ptc-deps/node_modules/acorn/dist/acorn.js';
const http=process.env.H24_HTTP_ANCHOR??'C:/Users/QYF/.codex/research/h24-http-deps/node_modules/undici/index.js';
const test=process.env.H24_TEST_ANCHOR??'C:/Users/QYF/.codex/research/h24-fixed-test-deps/node_modules/execa/index.js';
const wire=process.env.H24_WIRE_ANCHOR??'C:/Users/QYF/.codex/research/h23-wire-deps/node_modules/ws/index.js';
for(const entry of [anchor,zod,native,limit,ptc,wire,test,http]){
 const base=entry===ptc?resolve(entry,'../../../..'):resolve(entry,'../../..'),npm=JSON.parse(await readFile(resolve(base,'package-lock.json'),'utf8'));
 for(const [path,pkg] of Object.entries(npm.packages))if(path){
  const name=path.slice(path.lastIndexOf('node_modules/')+13),pinned=upstream.packages[name+'@'+pkg.version];
  const forensic=process.env.H24_P1_FORENSIC==='1'&&entry===test&&({'pretty-ms':'9.3.1','pure-rand':'8.4.2','yoctocolors':'2.2.0'})[name]===pkg.version;
  if(forensic){const archive=JSON.parse(await readFile(resolve(diag,'evidence/dependency-cache-forensics.json'),'utf8')).entries.find(e=>e.package.name===name&&e.package.version===pkg.version);assert.equal(pkg.integrity,archive.integrity,name);}
  else{assert.ok(pinned,`${name}@${pkg.version} absent from fixed upstream`);assert.equal(pkg.integrity,pinned.resolution.integrity,name);}
  let installed=false;try{assert.equal(JSON.parse(await readFile(resolve(base,path,'package.json'),'utf8')).version,pkg.version);installed=true;}catch(e){if(e.code!=='ENOENT'||!pkg.optional)throw e;}
  dependencies.push({name,version:pkg.version,integrity:pkg.integrity,installed});
 }
}
const anchors={anchor,zod,native,limit,ptc,wire,test,http};
await writeFile(resolve(diag,`evidence/dependencies-${Date.now()}-${process.pid}.json`),JSON.stringify({status:process.env.H24_P1_FORENSIC==='1'?'FORENSIC_CANDIDATE_NOT_OFFICIAL_PIN':'PASS',method:'all package entries against fixed pnpm; explicitly reconstructed three off-pin versions use verified cached tarball integrity only in forensic diagnostic',anchors,packages:dependencies},null,2)+'\n');
const scratch=await mkdtemp(resolve(tmpdir(),'aifoundry-h24-p1-')),lab=resolve(repo,'course-content/internal/deepseek-harness/h24/lab'),programs=[];
for(const f of await readdir(lab,{recursive:true})){if(!(await stat(resolve(lab,f))).isFile())continue;await mkdir(resolve(scratch,f,'..'),{recursive:true});await copyFile(resolve(lab,f),resolve(scratch,f));programs.push({name:f,sha256:hash(await readFile(resolve(lab,f)))});}
const variant=process.env.H24_P1_EXIT??'default';
if(variant==='default')await writeFile(resolve(scratch,'sdk-plugin.ts'),`import * as SDK from '@deepseek-ai/dsh-sdk-jsonrpc-server';export const name=SDK.name,inject=SDK.inject,Config=SDK.Config,apply=SDK.apply;\n`);
if(variant==='patch'){
 const original=await readFile(resolve(source,'packages/sdk/server/src/index.ts'),'utf8');
 const changed=original.replace("{ process.exit(code) }","{ process.exitCode = code; input.pause() }");assert.notEqual(changed,original);
 const overlay=changed.replaceAll("'./server.ts'",JSON.stringify(pathToFileURL(resolve(source,'packages/sdk/server/src/server.ts')).href));
 await writeFile(resolve(scratch,'sdk-patched.ts'),overlay);await writeFile(resolve(scratch,'sdk-plugin.ts'),`export * from './sdk-patched.ts';\n`);
}
if(variant==='default'||variant==='patch'){
 const support=await readFile(resolve(scratch,'support.ts'),'utf8'),needle="name:pathToFileURL(resolve(here,'sdk-plugin.ts')).href";
 assert.ok(support.includes(needle));await writeFile(resolve(scratch,'support.ts'),support.replace(needle,variant==='default'?"name:fixed('packages/sdk/server/src/index.ts')":"name:pathToFileURL(resolve(here,'sdk-patched.ts')).href"));
}
await writeFile(resolve(scratch,'package.json'),'{"private":true,"type":"module"}\n');
await writeFile(resolve(scratch,'tsconfig.json'),JSON.stringify({extends:resolve(source,'tsconfig.base.json')}));
await mkdir(resolve(scratch,'node_modules'));
await symlink(resolve(native,'..'),resolve(scratch,'node_modules/koffi'),'junction');
const tsxResolver=process.env.H24_P1_LOADER==='pinned'?createRequire(pathToFileURL(test)):createRequire(import.meta.url);
const tsxApi=tsxResolver.resolve('tsx/esm/api'),tsxCli=resolve(tsxApi,'../../../../dist/cli.mjs');
const worker=resolve(scratch,'app-entry.mjs');
const observation=process.env.H24_P1_OBSERVE==='1'?`await import(${JSON.stringify(pathToFileURL(resolve(diag,'scripts/observe-exit.mjs')).href)});`:'';
const environmentAudit=process.env.H24_P1_ENV_AUDIT==='1'?`import {writeFileSync} from 'node:fs';import {resolve as resolveAudit} from 'node:path';writeFileSync(resolveAudit(process.env.H24_WORLD,'child-startup.json'),JSON.stringify({pid:process.pid,argv:process.argv,execArgv:process.execArgv,cwd:process.cwd(),environmentNames:Object.keys(process.env).sort()},null,2));`:'';
await writeFile(resolve(scratch,'sdk-entry.mjs'),`${environmentAudit}import {register} from ${JSON.stringify(pathToFileURL(tsxApi).href)};register({tsconfig:${JSON.stringify(resolve(scratch,'tsconfig.json'))}});await import(${JSON.stringify(pathToFileURL(resolve(scratch,'bootstrap.mjs')).href)});${observation}await import(${JSON.stringify(pathToFileURL(resolve(scratch,'app-driver.ts')).href)});`);
await writeFile(worker,`await import(${JSON.stringify(pathToFileURL(resolve(scratch,'bootstrap.mjs')).href)});await import(${JSON.stringify(pathToFileURL(resolve(scratch,'app-driver.ts')).href)});`);
const env=Object.fromEntries(['SystemRoot','WINDIR','TEMP','TMP','PATH','PATHEXT'].filter(k=>process.env[k]!==undefined).map(k=>[k,process.env[k]]));
Object.assign(env,{HARNESS_SOURCE_CACHE:source,H24_DEPS_ANCHOR:anchor,H24_ZOD_ANCHOR:zod,H24_NATIVE_ANCHOR:native,H24_LIMIT_ANCHOR:limit,H24_PTC_ANCHOR:ptc,H24_WIRE_ANCHOR:wire,H24_TEST_ANCHOR:test,H24_HTTP_ANCHOR:http,H24_RUN_ROOT:scratch,H24_APP_ENTRY:worker,H24_TSX_CLI:resolve(repo,'node_modules/tsx/dist/cli.mjs'),DSH_HOME:resolve(scratch,'fixture-home')});
const selected=process.argv[2];
if(selected==='http-only')await copyFile(resolve(diag,'scripts/http-only.ts'),resolve(scratch,'p1-http-only.ts'));
const originalClientObserver=await readFile(resolve(scratch,'C.ts'),'utf8');await writeFile(resolve(scratch,'C.ts'),originalClientObserver.replace('trace:()=>({pid:child.pid','trace:()=>({spawnfile:child.spawnfile,spawnargs:child.spawnargs,pid:child.pid'));
if(selected==='lifecycle'){
 await copyFile(resolve(diag,'scripts/lifecycle.ts'),resolve(scratch,'p1-lifecycle.ts'));
 const driver=await readFile(resolve(scratch,'app-driver.ts'),'utf8');
 const replacement="if(sdk){const {watch,writeFileSync}=await import('node:fs');const stop=()=>ctx.fiber.dispose().then(()=>{writeFileSync(resolve(root,'p1-root-dispose-done'),'done');process.stdin.pause();process.exitCode=0;},(error:any)=>{writeFileSync(resolve(root,'p1-root-dispose-error'),String(error.stack??error));process.exitCode=1;});const watcher=watch(root,(_event,file)=>{if(file==='dispose.request'){void stop();}});ctx.effect(()=>()=>watcher.close());process.stdin.on('end',()=>{void stop();});}";
 assert.ok(driver.includes("if(sdk){process.stdin.on('end',()=>{void ctx.fiber.dispose();});}"));
 await writeFile(resolve(scratch,'app-driver.ts'),driver.replace("if(sdk){process.stdin.on('end',()=>{void ctx.fiber.dispose();});}",replacement));
}
const args=selected==='http-only'?['p1-http-only.ts']:selected==='lifecycle'?['p1-lifecycle.ts',...process.argv.slice(3)]:selected?['demo.ts',...process.argv.slice(2)]:['--test','--test-reporter=tap','acceptance.test.ts'];
const actualPrograms=[];for(const name of await readdir(scratch))if(name.endsWith('.ts')||name.endsWith('.mjs'))actualPrograms.push({name,sha256:hash(await readFile(resolve(scratch,name)))});
const actualTsxCli=process.env.H24_P1_LOADER==='pinned'?resolve(test,'../../tsx/dist/cli.mjs'):resolve(repo,'node_modules/tsx/dist/cli.mjs');
const r=spawnSync(process.execPath,[actualTsxCli,'--tsconfig',resolve(scratch,'tsconfig.json'),'--import',pathToFileURL(resolve(scratch,'bootstrap.mjs')).href,...args],{cwd:scratch,env,encoding:'utf8',timeout:60000,maxBuffer:15*1024*1024});
const result={variant,anchors,actualPrograms,environmentAudit:!!environmentAudit,forensicCandidate:process.env.H24_P1_FORENSIC==='1',exitHook:variant==='hook',observerEnabled:!!observation,loader:process.env.H24_P1_LOADER??'original-root',tsxApi,actualTsxCli,node:process.version,nodeExecutable:process.execPath,envNames:Object.keys(env).sort(),mode:'source',cwd:scratch,args,scratch,programs,exit:r.status,stdout:r.stdout,stderr:r.stderr,error:r.error?String(r.error):null};
result.exitObservations=[];for(const name of await readdir(scratch))if(name.startsWith('world-')){try{result.exitObservations.push(JSON.parse(await readFile(resolve(scratch,name,'p1-exit-observation.json'),'utf8')))}catch(e){if(e.code!=='ENOENT')throw e;}}
result.childStartup=[];for(const name of await readdir(scratch))if(name.startsWith('world-')){try{result.childStartup.push(JSON.parse(await readFile(resolve(scratch,name,'child-startup.json'),'utf8')))}catch(e){if(e.code!=='ENOENT')throw e;}}
const rawRun=`run-${Date.now()}-${process.pid}-${selected??'tests'}.json`;
await writeFile(resolve(diag,`evidence/${rawRun}`),JSON.stringify(result,null,2)+'\n');
await writeFile(resolve(diag,`evidence/lab-${selected??'tests'}.txt`),(r.stdout+r.stderr).replaceAll('\r\n','\n').trimEnd()+'\n');
const traces={};for(const f of await readdir(scratch))if(f.startsWith('trace-')&&f.endsWith('.json'))traces[f]=JSON.parse(await readFile(resolve(scratch,f),'utf8'));
if(!selected)await writeFile(resolve(diag,`evidence/behavior-traces-${Date.now()}.json`),JSON.stringify(traces,null,2)+'\n');
await writeFile(resolve(diag,`evidence/traces-${Date.now()}-${process.pid}.json`),JSON.stringify({rawRun,traces},null,2)+'\n');
console.log(JSON.stringify({runnerExit:r.status,variant,scratch,rawRun,traces:Object.keys(traces)}));
if(!selected&&r.status===0){
 const passed=Number(r.stdout.match(/^# pass (\d+)/m)?.[1]);assert.ok(passed>0);const levels={C:(r.stdout.match(/^# Subtest: C /gm)??[]).length,D:(r.stdout.match(/^# Subtest: D /gm)??[]).length};assert.equal(levels.C+levels.D,passed);
 await writeFile(resolve(diag,`evidence/lab-results-${variant}-${Date.now()}.json`),JSON.stringify({status:'PASS',tests:passed,levels,platform:process.platform,release:release(),node:process.version,scratch,programs,rawRun,scope:'named original/hook/patched source variant only, not complete application'},null,2)+'\n');
}
console.log(`Observed ${selected??'tests'} runner exit=${r.status}; this is diagnostic output, not an acceptance PASS.`);
