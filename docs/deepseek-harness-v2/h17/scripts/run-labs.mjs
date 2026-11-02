import assert from 'node:assert/strict';
import {readFile,writeFile,mkdtemp,readdir,copyFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
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
const anchor=process.env.H17_DEPS_ANCHOR??'C:/Users/QYF/.codex/research/h04-probe-deps/node_modules/commander/index.js';
const zod=process.env.H17_ZOD_ANCHOR??'C:/Users/QYF/.codex/research/h09-probe-deps/node_modules/zod/index.js';
for(const entry of [anchor,zod]){
 const base=resolve(entry,'../../..'),npm=JSON.parse(await readFile(resolve(base,'package-lock.json'),'utf8'));
 for(const [path,pkg] of Object.entries(npm.packages))if(path){
  const name=path.slice(path.lastIndexOf('node_modules/')+13),pinned=upstream.packages[name+'@'+pkg.version];
  assert.ok(pinned,`${name}@${pkg.version} absent from fixed upstream`);assert.equal(pkg.integrity,pinned.resolution.integrity,name);
  let installed=false;try{assert.equal(JSON.parse(await readFile(resolve(base,path,'package.json'),'utf8')).version,pkg.version);installed=true;}catch(e){if(e.code!=='ENOENT'||!pkg.optional)throw e;}
  dependencies.push({name,version:pkg.version,integrity:pkg.integrity,installed});
 }
}
await writeFile(resolve(root,'evidence/dependencies.json'),JSON.stringify({status:'PASS',method:'every direct/transitive package name+version+integrity against fixed pnpm package entry',packages:dependencies},null,2)+'\n');
const scratch=await mkdtemp(resolve(tmpdir(),'aifoundry-h17-lab-')),lab=resolve(repo,'course-content/internal/deepseek-harness/h17/lab'),programs=[];
for(const f of await readdir(lab)){await copyFile(resolve(lab,f),resolve(scratch,f));programs.push({name:f,sha256:hash(await readFile(resolve(lab,f)))});}
await writeFile(resolve(scratch,'package.json'),'{"private":true,"type":"module"}\n');
await writeFile(resolve(scratch,'tsconfig.json'),JSON.stringify({extends:resolve(source,'tsconfig.base.json')}));
const env=Object.fromEntries(['SystemRoot','WINDIR','TEMP','TMP','PATH','PATHEXT'].filter(k=>process.env[k]!==undefined).map(k=>[k,process.env[k]]));
Object.assign(env,{HARNESS_SOURCE_CACHE:source,H17_DEPS_ANCHOR:anchor,H17_ZOD_ANCHOR:zod,DSH_HOME:resolve(scratch,'fixture-home')});
const selected=process.argv[2];if(selected)assert.ok(['A','B','C','D','D_failure','D_rejected','X'].includes(selected),'choose A/B/C/D/D_failure/D_rejected/X');
const results={};
const commands=selected?[[`practice-${selected}`,['demo.ts',selected]]]:[['tests',['--test','--test-reporter=tap','session.test.ts']],['demo',['demo.ts']],['negative',['negative-answer.ts']]];
for(const [name,args] of commands){
 const r=spawnSync(process.execPath,[resolve(repo,'node_modules/tsx/dist/cli.mjs'),'--tsconfig',resolve(scratch,'tsconfig.json'),'--import',pathToFileURL(resolve(scratch,'bootstrap.mjs')).href,...args],{cwd:scratch,env,encoding:'utf8',timeout:60000,maxBuffer:10*1024*1024});
 const result={args,scratch,programs,exit:r.status,stdout:r.stdout,stderr:r.stderr,error:r.error?String(r.error):null};results[name]=result;
 await writeFile(resolve(root,`evidence/run-${Date.now()}-${name}.json`),JSON.stringify(result,null,2)+'\n');
 await writeFile(resolve(root,`evidence/lab-${name}.txt`),(r.stdout+r.stderr).replaceAll('\r\n','\n').replace(/[ \t]+$/gm,'').trimEnd()+'\n');
 if(name==='negative'){assert.equal(r.status,1);assert.match(r.stdout+r.stderr,/每条日志都是一条模型消息/);}else assert.equal(r.status,0,`${name}: see preserved raw run`);
}
if(selected){console.log(`PASS practice ${selected}; see evidence/lab-practice-${selected}.txt`);process.exit(0);}
const output=Object.fromEntries(results.demo.stdout.trim().split('\n').map(line=>{const i=line.indexOf(' ');return [line.slice(0,i),JSON.parse(line.slice(i+1))];}));
await writeFile(resolve(root,'evidence/practice-output.json'),JSON.stringify(output,null,2)+'\n');
await writeFile(resolve(root,'evidence/trace-fixture.json'),JSON.stringify(output.X.events,null,2)+'\n');
const count=Number(/# tests (\d+)/.exec(results.tests.stdout)?.[1]);assert.equal(count,20);assert.match(results.tests.stdout,/# fail 0/);
await writeFile(resolve(root,'evidence/lab-results.json'),JSON.stringify({status:'PASS',tests:count,levels:{C:17,D:3},semantics:'20 TAP items; each practice contains several assertions, not 20 unique scenarios',negativeExpectedFailure:true,commit:lock.commit,programs,sourceFiles:lock.files.length,dependencies:dependencies.length,limitations:['memory sessions','scripted adapter and constant tool','no real persistence/restore/fork','no full Harness E','no learner study']},null,2)+'\n');
console.log('PASS 20 tests (C17/D3), demo and expected failing answer; raw runs preserved');
