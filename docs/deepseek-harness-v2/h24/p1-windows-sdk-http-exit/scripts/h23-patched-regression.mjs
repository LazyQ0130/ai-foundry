import assert from 'node:assert/strict';
import {readFile,writeFile,mkdtemp,readdir,copyFile,mkdir,symlink} from 'node:fs/promises';
import {tmpdir,release} from 'node:os';
import {resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {parse} from 'yaml';
const diag=fileURLToPath(new URL('../',import.meta.url)),root=resolve(diag,'../../h23'),repo=resolve(root,'../../..');
process.on('uncaughtException',async error=>{await writeFile(resolve(diag,`evidence/runner-failure-${Date.now()}.json`),JSON.stringify({args:process.argv.slice(2),error:String(error),stack:error.stack},null,2)+'\n');process.exitCode=1;});
const lock=JSON.parse(await readFile(resolve(root,'evidence/source-lock.json'),'utf8'));
const source=process.env.HARNESS_SOURCE_CACHE??lock.sourceCache;
const hash=b=>createHash('sha256').update(b).digest('hex');
for(const f of lock.files)assert.equal(hash(await readFile(resolve(source,f.path))),f.sha256,f.path);
const upstream=parse(await readFile(resolve(source,'pnpm-lock.yaml'),'utf8')),dependencies=[];
const anchor=process.env.H23_DEPS_ANCHOR??'C:/Users/QYF/.codex/research/h04-probe-deps/node_modules/commander/index.js';
const zod=process.env.H23_ZOD_ANCHOR??'C:/Users/QYF/.codex/research/h09-probe-deps/node_modules/zod/index.js';
const native=process.env.H23_NATIVE_ANCHOR??'C:/Users/QYF/.codex/research/module-four-probe-deps/node_modules/koffi/index.js';
const limit=process.env.H23_LIMIT_ANCHOR??'C:/Users/QYF/.codex/research/h18-persistence-deps/node_modules/p-limit/index.js';
const ptc=process.env.H23_PTC_ANCHOR??'C:/Users/QYF/.codex/research/h22-ptc-deps/node_modules/acorn/dist/acorn.js';
const wire=process.env.H23_WIRE_ANCHOR??'C:/Users/QYF/.codex/research/h23-wire-deps/node_modules/ws/index.js';
for(const entry of [anchor,zod,native,limit,ptc,wire]){
 const base=entry===ptc?resolve(entry,'../../../..'):resolve(entry,'../../..'),npm=JSON.parse(await readFile(resolve(base,'package-lock.json'),'utf8'));
 for(const [path,pkg] of Object.entries(npm.packages))if(path){
  const name=path.slice(path.lastIndexOf('node_modules/')+13),pinned=upstream.packages[name+'@'+pkg.version];
  assert.ok(pinned,`${name}@${pkg.version} absent from fixed upstream`);assert.equal(pkg.integrity,pinned.resolution.integrity,name);
  let installed=false;try{assert.equal(JSON.parse(await readFile(resolve(base,path,'package.json'),'utf8')).version,pkg.version);installed=true;}catch(e){if(e.code!=='ENOENT'||!pkg.optional)throw e;}
  dependencies.push({name,version:pkg.version,integrity:pkg.integrity,installed});
 }
}
await writeFile(resolve(diag,'evidence/h23-patched-dependencies.json'),JSON.stringify({status:'PASS',method:'every direct/transitive package name+version+integrity against fixed pnpm package entry',packages:dependencies},null,2)+'\n');
const scratch=await mkdtemp(resolve(tmpdir(),'aifoundry-h23-lab-')),lab=resolve(repo,'course-content/internal/deepseek-harness/h23/lab'),programs=[];
for(const f of await readdir(lab)){await copyFile(resolve(lab,f),resolve(scratch,f));programs.push({name:f,sha256:hash(await readFile(resolve(lab,f)))});}
const sdkOriginal=await readFile(resolve(source,'packages/sdk/server/src/index.ts'),'utf8');
const sdkPatch=sdkOriginal.replace('{ process.exit(code) }','{ process.exitCode = code; input.pause() }').replaceAll("'./server.ts'",JSON.stringify(pathToFileURL(resolve(source,'packages/sdk/server/src/server.ts')).href));
await writeFile(resolve(scratch,'sdk-patched.ts'),sdkPatch);
const bootstrap=await readFile(resolve(scratch,'bootstrap.mjs'),'utf8');await writeFile(resolve(scratch,'bootstrap.mjs'),bootstrap.replace('registerHooks(',"entries.set('@deepseek-ai/dsh-sdk-jsonrpc-server',new URL('./sdk-patched.ts',import.meta.url).href);\nregisterHooks("));
await writeFile(resolve(scratch,'package.json'),'{"private":true,"type":"module"}\n');
await writeFile(resolve(scratch,'tsconfig.json'),JSON.stringify({extends:resolve(source,'tsconfig.base.json')}));
await mkdir(resolve(scratch,'node_modules'));
await symlink(resolve(native,'..'),resolve(scratch,'node_modules/koffi'),'junction');
await writeFile(resolve(scratch,'fixed-cli-args.ts'),`export * from ${JSON.stringify(pathToFileURL(resolve(source,'apps/cli/src/args.ts')).href)};`);
const worker=resolve(scratch,'sdk-runtime.mjs');
const tsxApi=createRequire(import.meta.url).resolve('tsx/esm/api');
const loaderSource=`import {register} from ${JSON.stringify(pathToFileURL(tsxApi).href)};register({tsconfig:${JSON.stringify(resolve(scratch,'tsconfig.json'))}});await import(${JSON.stringify(pathToFileURL(resolve(scratch,'bootstrap.mjs')).href)});await import(${JSON.stringify(pathToFileURL(resolve(scratch,'sdk-runtime.ts')).href)});`;
await writeFile(worker,loaderSource);
await writeFile(resolve(diag,'evidence/runtime-build.json'),JSON.stringify({kind:'source launch through existing pinned author tsx loader; unchanged fixed official SDK server modules, real isolated author Profile through AppBoot/Loader with controlled mock core in prepare; not shipped sdk-minimal profile',worker:{path:worker,sha256:hash(await readFile(worker))}},null,2)+'\n');
const env=Object.fromEntries(['SystemRoot','WINDIR','TEMP','TMP','PATH','PATHEXT'].filter(k=>process.env[k]!==undefined).map(k=>[k,process.env[k]]));
Object.assign(env,{HARNESS_SOURCE_CACHE:source,H23_DEPS_ANCHOR:anchor,H23_ZOD_ANCHOR:zod,H23_NATIVE_ANCHOR:native,H23_LIMIT_ANCHOR:limit,H23_PTC_ANCHOR:ptc,H23_WIRE_ANCHOR:wire,H23_RUN_ROOT:scratch,H23_SDK_RUNTIME:worker,H23_TSX_CLI:resolve(repo,'node_modules/tsx/dist/cli.mjs'),DSH_HOME:resolve(scratch,'fixture-home')});
const selected=process.argv[2];
const args=selected?['demo.ts',...process.argv.slice(2)]:['--test','--test-reporter=tap','clients.test.ts'];
const r=spawnSync(process.execPath,[resolve(repo,'node_modules/tsx/dist/cli.mjs'),'--tsconfig',resolve(scratch,'tsconfig.json'),'--import',pathToFileURL(resolve(scratch,'bootstrap.mjs')).href,...args],{cwd:scratch,env,encoding:'utf8',timeout:60000,maxBuffer:15*1024*1024});
const result={args,scratch,programs,exit:r.status,stdout:r.stdout,stderr:r.stderr,error:r.error?String(r.error):null};
const rawRun=`run-${Date.now()}-${selected??'tests'}.json`;
await writeFile(resolve(diag,`evidence/${rawRun}`),JSON.stringify(result,null,2)+'\n');
await writeFile(resolve(diag,`evidence/h23-patched-lab-${selected??'tests'}.txt`),(r.stdout+r.stderr).replaceAll('\r\n','\n').trimEnd()+'\n');
const traces={};for(const f of await readdir(scratch))if(f.startsWith('trace-')&&f.endsWith('.json'))traces[f]=JSON.parse(await readFile(resolve(scratch,f),'utf8'));
if(!selected)await writeFile(resolve(diag,'evidence/h23-patched-behavior-traces.json'),JSON.stringify(traces,null,2)+'\n');
await writeFile(resolve(diag,`evidence/h23-patched-traces-${Date.now()}.json`),JSON.stringify(traces,null,2)+'\n');
assert.equal(r.status,0,'see preserved raw run');
if(!selected){
 const passed=Number(r.stdout.match(/^# pass (\d+)/m)?.[1]);assert.ok(passed>0);const levels={C:(r.stdout.match(/^# Subtest: C /gm)??[]).length,D:(r.stdout.match(/^# Subtest: D /gm)??[]).length};assert.equal(levels.C+levels.D,passed);
 await writeFile(resolve(diag,'evidence/h23-patched-lab-results.json'),JSON.stringify({status:'PASS',tests:passed,levels,platform:process.platform,release:release(),node:process.version,scratch,programs,rawRun,scope:'real components and local AgentLoop integration with mock adapter; no real Provider or complete application'},null,2)+'\n');
}
console.log(`PASS ${selected??'tests'}; scratch retained: ${scratch}`);
