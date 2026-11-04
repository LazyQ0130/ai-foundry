import {assert,sdkHome,record,resolve,mkdir} from './support.ts';
import {spawnSync} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
async function cli(mode:string,args:string[],home?:string){const result=spawnSync(process.execPath,[process.env.H23_TSX_CLI!,'--tsconfig',resolve(process.env.H23_RUN_ROOT!,'tsconfig.json'),'--import',pathToFileURL(resolve(process.env.H23_RUN_ROOT!,'bootstrap.mjs')).href,resolve(process.env.H23_RUN_ROOT!,'cli-fixture.ts'),mode,...args],{env:{...process.env,...home?{DSH_HOME:home}:{}},cwd:process.env.H23_RUN_ROOT,encoding:'utf8',timeout:10000});return {mode,args,exit:result.status,stdout:result.stdout,stderr:result.stderr,error:result.error?String(result.error):undefined};}
export const cases:[string,()=>Promise<void>][]=[
 ['C A1 actual launcher parses profiles and separates app arguments',async()=>{
  const out=[];for(const args of [['web'],['--profile','headless','fictional task'],['--profile','sdk'],['--profile','sdk-minimal'],['--profile','acp'],['web','--port','9123','--patch','belongs-to-app']]){const r=await cli('parse',args);assert.equal(r.exit,0,r.stderr);out.push({...r,value:JSON.parse(r.stdout)});}assert.deepEqual(out[5].value.args,['--port','9123','--patch','belongs-to-app']);assert.deepEqual(out[5].value.patches,[]);await record('A1',out);
 }],
 ['C A2 help/version and invalid launcher input exit in isolated processes',async()=>{
  const out=[];for(const [args,exit] of [[['--help'],0],[['--version'],0],[[],1],[['--profile','desktop'],1],[['web','--dump-config','--dump-default-config'],1],[['web','--dump-config','--port','1'],1]] as [string[],number][]){const r=await cli('parse',args);assert.equal(r.exit,exit,JSON.stringify(r));out.push(r);}await record('A2',out);
 }],
 ['C A3 real Profile load and whole-config patch composition stay in new home',async()=>{
  const home=await sdkHome(),dir=resolve(home,'profiles','h23-fixture');await mkdir(dir,{recursive:true});await writeFile(resolve(dir,'package.json'),JSON.stringify({name:'h23-fixture',private:true,dsh:{profile:{bundles:[]}}}));await writeFile(resolve(dir,'cordis.patch.yml'),'- insert:\n    - id: review\n      name: fixture-plugin\n      config:\n        model: first\n        provider: fixture\n');
  const mod=await import(pathToFileURL(resolve(process.env.HARNESS_SOURCE_CACHE!,'packages/boot/app-boot/src/profile.ts')).href);const profile=mod.loadProfileDirectory('dsh',dir,resolve(dir,'package.json'));const entries=mod.composeEntries([profile.patches,[{id:'review',config:{model:'second'}}]]);assert.equal(entries[0].config.model,'second');assert.equal(entries[0].config.provider,undefined);assert.throws(()=>mod.resolveProfileDir('../outside',home));await record('A3',{home,profile,entries});
 }],
 ['C A4 actual CLI config dump exits normally and missing profile fails startup',async()=>{
  const home=await sdkHome(),dir=resolve(home,'profiles','h23-fixture');await mkdir(dir,{recursive:true});await writeFile(resolve(dir,'package.json'),JSON.stringify({name:'h23-fixture',private:true,dsh:{profile:{bundles:[]}}}));await writeFile(resolve(dir,'cordis.patch.yml'),'[]\n');const normal=await cli('cli',['h23-fixture','--dump-config'],home),failed=await cli('cli',['definitely-missing-profile'],home);assert.equal(normal.exit,0,normal.stderr);assert.equal(failed.exit,1);assert.ok(failed.stderr||failed.stdout);await record('A4',{home,normal,failed});
 }],
];
