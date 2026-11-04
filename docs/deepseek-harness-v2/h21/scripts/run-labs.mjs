import assert from 'node:assert/strict';
import {readFile,writeFile,mkdtemp,readdir,copyFile} from 'node:fs/promises';
import {tmpdir,release} from 'node:os';
import {resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {parse} from 'yaml';
const root=fileURLToPath(new URL('../',import.meta.url)),repo=resolve(root,'../../..');
const lock=JSON.parse(await readFile(resolve(root,'evidence/source-lock.json'),'utf8'));
const source=process.env.HARNESS_SOURCE_CACHE??lock.sourceCache;
const hash=b=>createHash('sha256').update(b).digest('hex');
for(const f of lock.files)assert.equal(hash(await readFile(resolve(source,f.path))),f.sha256,f.path);
const upstream=parse(await readFile(resolve(source,'pnpm-lock.yaml'),'utf8')),dependencies=[];
const anchor=process.env.H21_DEPS_ANCHOR??'C:/Users/QYF/.codex/research/h04-probe-deps/node_modules/commander/index.js';
const zod=process.env.H21_ZOD_ANCHOR??'C:/Users/QYF/.codex/research/h09-probe-deps/node_modules/zod/index.js';
const native=process.env.H21_NATIVE_ANCHOR??'C:/Users/QYF/.codex/research/module-four-probe-deps/node_modules/koffi/index.js';
const limit=process.env.H21_LIMIT_ANCHOR??'C:/Users/QYF/.codex/research/h18-persistence-deps/node_modules/p-limit/index.js';
for(const entry of [anchor,zod,native,limit]){
 const base=resolve(entry,'../../..'),npm=JSON.parse(await readFile(resolve(base,'package-lock.json'),'utf8'));
 for(const [path,pkg] of Object.entries(npm.packages))if(path){
  const name=path.slice(path.lastIndexOf('node_modules/')+13),pinned=upstream.packages[name+'@'+pkg.version];
  assert.ok(pinned,`${name}@${pkg.version} absent from fixed upstream`);assert.equal(pkg.integrity,pinned.resolution.integrity,name);
  let installed=false;try{assert.equal(JSON.parse(await readFile(resolve(base,path,'package.json'),'utf8')).version,pkg.version);installed=true;}catch(e){if(e.code!=='ENOENT'||!pkg.optional)throw e;}
  dependencies.push({name,version:pkg.version,integrity:pkg.integrity,installed});
 }
}
await writeFile(resolve(root,'evidence/dependencies.json'),JSON.stringify({status:'PASS',method:'every direct/transitive package name+version+integrity against fixed pnpm package entry',packages:dependencies},null,2)+'\n');
const scratch=await mkdtemp(resolve(tmpdir(),'aifoundry-h21-lab-')),lab=resolve(repo,'course-content/internal/deepseek-harness/h21/lab'),programs=[];
for(const f of await readdir(lab)){await copyFile(resolve(lab,f),resolve(scratch,f));programs.push({name:f,sha256:hash(await readFile(resolve(lab,f)))});}
await writeFile(resolve(scratch,'package.json'),'{"private":true,"type":"module"}\n');
await writeFile(resolve(scratch,'tsconfig.json'),JSON.stringify({extends:resolve(source,'tsconfig.base.json')}));
const env=Object.fromEntries(['SystemRoot','WINDIR','TEMP','TMP','PATH','PATHEXT'].filter(k=>process.env[k]!==undefined).map(k=>[k,process.env[k]]));
Object.assign(env,{HARNESS_SOURCE_CACHE:source,H21_DEPS_ANCHOR:anchor,H21_ZOD_ANCHOR:zod,H21_NATIVE_ANCHOR:native,H21_LIMIT_ANCHOR:limit,H21_RUN_ROOT:scratch,H21_TSX_CLI:resolve(repo,'node_modules/tsx/dist/cli.mjs'),DSH_HOME:resolve(scratch,'fixture-home')});
const selected=process.argv[2];
const args=selected?['demo.ts',...process.argv.slice(2)]:['--test','--test-reporter=tap','subagent.test.ts'];
const r=spawnSync(process.execPath,[resolve(repo,'node_modules/tsx/dist/cli.mjs'),'--tsconfig',resolve(scratch,'tsconfig.json'),'--import',pathToFileURL(resolve(scratch,'bootstrap.mjs')).href,...args],{cwd:scratch,env,encoding:'utf8',timeout:60000,maxBuffer:15*1024*1024});
const result={args,scratch,programs,exit:r.status,stdout:r.stdout,stderr:r.stderr,error:r.error?String(r.error):null};
const rawRun=`run-${Date.now()}-${selected??'tests'}.json`;
await writeFile(resolve(root,`evidence/${rawRun}`),JSON.stringify(result,null,2)+'\n');
await writeFile(resolve(root,`evidence/lab-${selected??'tests'}.txt`),(r.stdout+r.stderr).replaceAll('\r\n','\n').trimEnd()+'\n');
const traces={};for(const f of await readdir(scratch))if(f.startsWith('trace-')&&f.endsWith('.json'))traces[f]=JSON.parse(await readFile(resolve(scratch,f),'utf8'));
if(!selected)await writeFile(resolve(root,'evidence/behavior-traces.json'),JSON.stringify(traces,null,2)+'\n');
await writeFile(resolve(root,`evidence/traces-${Date.now()}.json`),JSON.stringify(traces,null,2)+'\n');
assert.equal(r.status,0,'see preserved raw run');
if(!selected){
 const passed=Number(r.stdout.match(/^# pass (\d+)/m)?.[1]);assert.ok(passed>0);const levels={C:(r.stdout.match(/^# Subtest: C /gm)??[]).length,D:(r.stdout.match(/^# Subtest: D /gm)??[]).length};assert.equal(levels.C+levels.D,passed);
 await writeFile(resolve(root,'evidence/lab-results.json'),JSON.stringify({status:'PASS',tests:passed,levels,platform:process.platform,release:release(),node:process.version,scratch,programs,rawRun,scope:'real components and local AgentLoop integration with mock adapter; no real Provider or complete application'},null,2)+'\n');
}
console.log(`PASS ${selected??'tests'}; scratch retained: ${scratch}`);
