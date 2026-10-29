/** 锁定源码的参数、内存组合与隔离临时 .env 探针。不会调用 boot/runProfile。 */
import assert from 'node:assert/strict'
import {mkdtemp,mkdir,writeFile,readFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {resolve,join} from 'node:path'
import {fileURLToPath,pathToFileURL} from 'node:url'
import {spawnSync} from 'node:child_process'
import {createHash} from 'node:crypto'
import {registerHooks,createRequire} from 'node:module'
const own=fileURLToPath(import.meta.url),root=resolve(own,'../..'),repo=resolve(root,'../../..')
const worker=process.argv[2]==='--worker',source=process.argv[worker?4:2]
if(!source)throw Error('Pass locked source directory')
const commander=process.argv[worker?6:3]??process.env.HARNESS_PROBE_COMMANDER
if(!commander)throw Error('Pass isolated Commander 15.0.0 index.js path; do not install into AI Foundry')
const pinned=JSON.parse(await readFile(resolve(root,'evidence/probe-dependencies.json'),'utf8'))
const installed=JSON.parse(await readFile(resolve(commander,'../../../package-lock.json'),'utf8'))
for(const p of pinned.packages){const found=installed.packages[`node_modules/${p.name}`];assert.equal(found?.version,p.version);assert.equal(found?.integrity,p.integrity)}
const commanderMeta=JSON.parse(await readFile(resolve(commander,'../package.json'),'utf8'));assert.equal(commanderMeta.version,'15.0.0')
const dependencyResolve=createRequire(pathToFileURL(commander))
const isolatedPackages=new Set(['commander','js-yaml','@eslint-community/regexpp','ajv','node-addon-require-builtin','resolve.exports','semver'])
const isolatedEntries=new Map([...isolatedPackages].map(name=>[name,pathToFileURL(dependencyResolve.resolve(name)).href]))
registerHooks({resolve(specifier,context,nextResolve){return nextResolve(isolatedEntries.get(specifier)??specifier,context)}})
const load=(path:string)=>import(pathToFileURL(resolve(source,path)).href)
if(worker){
 const task=process.argv[3],folder=process.argv[5]
 if(task==='bad-dump'){
  const {parseDshArgs}=await load('apps/cli/src/args.ts');parseDshArgs(['web','--dump-config','--port','8080'],'0.2.2-alpha.2')
  throw Error('bad dump unexpectedly accepted')
 }
 const {loadLayeredEnv}=await load('packages/boot/app-boot/src/index.ts')
 const project=join(folder,'project')
 if(task==='precedence'){
  const snapshot=loadLayeredEnv('h04-probe',project,()=>{})
  assert.equal(snapshot.get('COURSE_INHERITED').value,'inherited')
  assert.equal(snapshot.get('COURSE_PROJECT').source,'project-env')
  assert.equal(snapshot.get('COURSE_HOME').source,'user-env')
  assert.equal(snapshot.get('COURSE_PROJECT').path,join(project,'.env'))
  process.env.COURSE_INHERITED='later'
  assert.equal(snapshot.get('COURSE_INHERITED').value,'inherited')
 }else if(task==='atomic'){
  assert.throws(()=>loadLayeredEnv('h04-probe',project,()=>{}),/only the launching environment may set/)
  assert.equal(process.env.COURSE_ATOMIC,undefined)
 }else if(task==='home-proxy'){
  const snapshot=loadLayeredEnv('h04-probe',project,()=>{})
  assert.equal(snapshot.get('HTTPS_PROXY').source,'user-env')
 }else if(task==='project-proxy'||task==='home-relocate'){
  assert.throws(()=>loadLayeredEnv('h04-probe',project,()=>{}),/only the launching environment may set/)
  assert.equal(process.env.DSH_HOME,join(folder,'home'))
 }else throw Error('unknown fixture worker')
 process.stdout.write(JSON.stringify({task,status:'PASS'})+'\n')
}else{
 const checks:any[]=[]
 const {parseDshArgs}=await load('apps/cli/src/args.ts')
 const early=parseDshArgs(['web','--patch','a.yml','--port','8080'],'0.2.2-alpha.2')
 const late=parseDshArgs(['web','--port','8080','--patch','a.yml'],'0.2.2-alpha.2')
 assert.deepEqual(early.patches,['a.yml']);assert.deepEqual(late.patches,[]);assert.deepEqual(late.args,['--port','8080','--patch','a.yml'])
 checks.push({name:'actual CLI positional boundary, early overlay and late application args',status:'PASS'})
 const {resolveProfileDir,composeEntries}=await load('packages/boot/app-boot/src/profile.ts')
 for(const bad of ['','.','..','a/b','a\\b','node_modules'])assert.throws(()=>resolveProfileDir(bad,'/fixture-home'))
 assert.ok(resolveProfileDir('web','/fixture-home').endsWith(join('profiles','web')))
 checks.push({name:'actual Profile name/path validation with explicit fixture home',status:'PASS'})
 const rows=composeEntries([[{insert:[{id:'x',name:'course-noop',config:{a:1,b:2}}]}],[{id:'x',config:{b:3}}]])
 assert.deepEqual(rows[0].config,{b:3})
 checks.push({name:'actual patch composition replaces entire config, no deep merge',status:'PASS'})
 const {Context}=await load('vendor/cordis/src/index.ts'),{provideCmdline}=await load('packages/boot/cmdline/src/index.ts')
 const ctx=new Context(),args=['--port','8080'];provideCmdline(ctx,{args,exit:()=>{}});args.push('later')
 assert.deepEqual(ctx.cmdlineArgs.get(),['--port','8080']);assert.ok(Object.isFrozen(ctx.cmdlineArgs.get()));await ctx.fiber.dispose()
 checks.push({name:'actual cmdline provider snapshots and freezes without consuming args',status:'PASS'})
 const scratch=await mkdtemp(join(tmpdir(),'aifoundry-h04-probes-'))
 const cases=[
  ['precedence','COURSE_INHERITED=project\nCOURSE_PROJECT=p\n','COURSE_INHERITED=home\nCOURSE_PROJECT=home\nCOURSE_HOME=h\n'],
  ['atomic','COURSE_ATOMIC=would-be-applied\n','NODE_OPTIONS=forbidden-fixture\n'],
  ['home-proxy','','HTTPS_PROXY=http://fixture.invalid:8080\n'],
  ['project-proxy','HTTPS_PROXY=http://fixture.invalid:8080\n',''],
  ['home-relocate','COURSE_ATOMIC=would-be-applied\n','DSH_HOME=/fixture/forbidden-relocation\n']
 ]
 for(const [task,projectEnv,homeEnv] of cases){
  const folder=join(scratch,task);await mkdir(join(folder,'project'),{recursive:true});await mkdir(join(folder,'home'),{recursive:true})
  await writeFile(join(folder,'project/.env'),projectEnv);await writeFile(join(folder,'home/.env'),homeEnv)
  // Child inherits only OS startup/temp paths, explicit test home and non-secret fixture values.
  const env:Record<string,string>={DSH_HOME:join(folder,'home'),COURSE_INHERITED:'inherited'}
  for(const name of ['SystemRoot','WINDIR','TEMP','TMP'])if(process.env[name])env[name]=process.env[name]!
  if(task==='project-proxy')env.HTTPS_PROXY='http://inherited-fixture.invalid:8080'
  const r=spawnSync(process.execPath,[resolve(repo,'node_modules/tsx/dist/cli.mjs'),'--tsconfig',resolve(source,'tsconfig.base.json'),own,'--worker',task,source,folder,commander],{env,encoding:'utf8'})
  assert.equal(r.status,0,`${task}: ${r.stderr}`);assert.equal(JSON.parse(r.stdout).status,'PASS')
  checks.push({name:`actual isolated loadLayeredEnv: ${task}`,status:'PASS'})
 }
 const bad=spawnSync(process.execPath,[resolve(repo,'node_modules/tsx/dist/cli.mjs'),'--tsconfig',resolve(source,'tsconfig.base.json'),own,'--worker','bad-dump',source,scratch,commander],{env:{SystemRoot:process.env.SystemRoot??''},encoding:'utf8'})
 assert.equal(bad.status,1);assert.match(bad.stderr,/config dumps take no app arguments/)
 checks.push({name:'actual CLI rejects dump mixed with app flags (isolated exit 1)',status:'PASS'})
 const paths=['apps/cli/src/args.ts','packages/boot/app-boot/src/index.ts','packages/boot/app-boot/src/profile.ts','packages/boot/cmdline/src/index.ts','packages/util/launch-environment/src/index.ts']
 const files=await Promise.all(paths.map(async path=>({path,sha256:createHash('sha256').update(await readFile(resolve(source,path))).digest('hex')})))
 await writeFile(resolve(root,'evidence/actual-probes.json'),JSON.stringify({commit:'f3803c96974ad4a94195fb97e5c637e9c2a3afe3',status:'PASS',scope:'10 actual-source helper probes; no boot/runProfile, model, network, user Home/credentials or package install',checks,files,dependency:{lockEntries:pinned.packages.length,name:'commander',version:commanderMeta.version,source:'pnpm-lock.yaml:546-548,22188-22190; isolated package, no install scripts',entry:commander},temporaryFixture:scratch,cleanup:'retained; no bulk deletion'},null,2)+'\n')
 console.log('PASS: 10 actual-source helper probes in memory/isolated temporary env fixtures; no application boot')
}
