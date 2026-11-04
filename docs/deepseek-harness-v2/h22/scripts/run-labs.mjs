import assert from 'node:assert/strict';
import {readFile,writeFile,mkdtemp,readdir,copyFile,mkdir,symlink} from 'node:fs/promises';
import {tmpdir,release} from 'node:os';
import {resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {build} from 'esbuild';
import {parse} from 'yaml';
const root=fileURLToPath(new URL('../',import.meta.url)),repo=resolve(root,'../../..');
const lock=JSON.parse(await readFile(resolve(root,'evidence/source-lock.json'),'utf8'));
const source=process.env.HARNESS_SOURCE_CACHE??lock.sourceCache;
const hash=b=>createHash('sha256').update(b).digest('hex');
for(const f of lock.files)assert.equal(hash(await readFile(resolve(source,f.path))),f.sha256,f.path);
const upstream=parse(await readFile(resolve(source,'pnpm-lock.yaml'),'utf8')),dependencies=[];
const anchor=process.env.H22_DEPS_ANCHOR??'C:/Users/QYF/.codex/research/h04-probe-deps/node_modules/commander/index.js';
const zod=process.env.H22_ZOD_ANCHOR??'C:/Users/QYF/.codex/research/h09-probe-deps/node_modules/zod/index.js';
const native=process.env.H22_NATIVE_ANCHOR??'C:/Users/QYF/.codex/research/module-four-probe-deps/node_modules/koffi/index.js';
const limit=process.env.H22_LIMIT_ANCHOR??'C:/Users/QYF/.codex/research/h18-persistence-deps/node_modules/p-limit/index.js';
const ptc=process.env.H22_PTC_ANCHOR??'C:/Users/QYF/.codex/research/h22-ptc-deps/node_modules/acorn/dist/acorn.js';
for(const entry of [anchor,zod,native,limit,ptc]){
 const base=entry===ptc?resolve(entry,'../../../..'):resolve(entry,'../../..'),npm=JSON.parse(await readFile(resolve(base,'package-lock.json'),'utf8'));
 for(const [path,pkg] of Object.entries(npm.packages))if(path){
  const name=path.slice(path.lastIndexOf('node_modules/')+13),pinned=upstream.packages[name+'@'+pkg.version];
  assert.ok(pinned,`${name}@${pkg.version} absent from fixed upstream`);assert.equal(pkg.integrity,pinned.resolution.integrity,name);
  let installed=false;try{assert.equal(JSON.parse(await readFile(resolve(base,path,'package.json'),'utf8')).version,pkg.version);installed=true;}catch(e){if(e.code!=='ENOENT'||!pkg.optional)throw e;}
  dependencies.push({name,version:pkg.version,integrity:pkg.integrity,installed});
 }
}
await writeFile(resolve(root,'evidence/dependencies.json'),JSON.stringify({status:'PASS',method:'every direct/transitive package name+version+integrity against fixed pnpm package entry',packages:dependencies},null,2)+'\n');
const scratch=await mkdtemp(resolve(tmpdir(),'aifoundry-h22-lab-')),lab=resolve(repo,'course-content/internal/deepseek-harness/h22/lab'),programs=[];
for(const f of await readdir(lab)){await copyFile(resolve(lab,f),resolve(scratch,f));programs.push({name:f,sha256:hash(await readFile(resolve(lab,f)))});}
await writeFile(resolve(scratch,'package.json'),'{"private":true,"type":"module"}\n');
await writeFile(resolve(scratch,'tsconfig.json'),JSON.stringify({extends:resolve(source,'tsconfig.base.json')}));
await mkdir(resolve(scratch,'node_modules'));
await symlink(resolve(native,'..'),resolve(scratch,'node_modules/koffi'),'junction');
const dep=createRequire(pathToFileURL(anchor)),schemaDep=createRequire(pathToFileURL(zod)),nativeDep=createRequire(pathToFileURL(native)),limitDep=createRequire(pathToFileURL(limit)),ptcDep=createRequire(pathToFileURL(ptc));
const externalNames=['js-yaml','@eslint-community/regexpp','ajv','node-addon-require-builtin','resolve.exports','semver'];
const externals=new Map(externalNames.map(n=>[n,dep.resolve(n)]));
externals.set('zod',schemaDep.resolve('zod'));externals.set('koffi',nativeDep.resolve('koffi'));externals.set('p-limit',limitDep.resolve('p-limit'));externals.set('@js-temporal/polyfill',limitDep.resolve('@js-temporal/polyfill'));
externals.set('yaml',nativeDep.resolve('yaml'));
for(const name of ['acorn','acorn-walk','birpc'])externals.set(name,ptcDep.resolve(name));
const bundleOptions={bundle:true,platform:'node',format:'esm',target:'node24',tsconfig:resolve(source,'tsconfig.base.json'),banner:{js:'import {createRequire as fixtureCreateRequire} from "node:module";const require=fixtureCreateRequire(import.meta.url);'},plugins:[{name:'locked-fixture-deps',setup(b){b.onResolve({filter:/^[^./]|^@/},args=>{const p=externals.get(args.path);return p?{path:pathToFileURL(p).href,external:true}:undefined;});}}]};
const worker=resolve(scratch,'ptc-worker.mjs'),sandboxRunner=resolve(scratch,'windows-acl-runner.mjs');
const workerSource=`import {runNodeMain} from ${JSON.stringify(resolve(source,'packages/ptc-runtime/ptc-runtime-node/src/process.ts'))};import {openInheritedControlChannel} from ${JSON.stringify(resolve(source,'packages/subprocess/subprocess/src/control.ts'))};await runNodeMain(openInheritedControlChannel(),Number(process.argv[2]),process);`;
try{
 await build({...bundleOptions,stdin:{contents:workerSource,resolveDir:source,sourcefile:'h22-worker-entry.mjs',loader:'js'},outfile:worker});
 await build({...bundleOptions,entryPoints:[resolve(source,'packages/sandbox/sandbox-windows-acl/src/runner.ts')],outfile:sandboxRunner});
}catch(error){await writeFile(resolve(root,`evidence/build-failure-${Date.now()}.json`),JSON.stringify({scratch,error:String(error),errors:error.errors},null,2)+'\n');throw error;}
await writeFile(resolve(root,'evidence/runtime-build.json'),JSON.stringify({kind:'unchanged fixed-source process and Windows ACL runner bundled into new scratch; no execution-policy override',worker:{path:worker,sha256:hash(await readFile(worker))},sandboxRunner:{path:sandboxRunner,sha256:hash(await readFile(sandboxRunner))}},null,2)+'\n');
const env=Object.fromEntries(['SystemRoot','WINDIR','TEMP','TMP','PATH','PATHEXT'].filter(k=>process.env[k]!==undefined).map(k=>[k,process.env[k]]));
Object.assign(env,{HARNESS_SOURCE_CACHE:source,H22_DEPS_ANCHOR:anchor,H22_ZOD_ANCHOR:zod,H22_NATIVE_ANCHOR:native,H22_LIMIT_ANCHOR:limit,H22_PTC_ANCHOR:ptc,H22_RUN_ROOT:scratch,H22_PTC_WORKER:worker,H22_SANDBOX_RUNNER:sandboxRunner,H22_TSX_CLI:resolve(repo,'node_modules/tsx/dist/cli.mjs'),DSH_HOME:resolve(scratch,'fixture-home')});
const selected=process.argv[2];
const args=selected?['demo.ts',...process.argv.slice(2)]:['--test','--test-reporter=tap','workflow.test.ts'];
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
