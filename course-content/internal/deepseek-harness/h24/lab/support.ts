import assert from 'node:assert/strict';
import {mkdtemp,writeFile,readFile,readdir,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {runLoaderSmoke,resolveExampleLaunch,resolveExampleMode} from '@deepseek-ai/dsh-loader-smoke';
export {assert,writeFile,readFile,readdir,mkdir,resolve,pathToFileURL,runLoaderSmoke,resolveExampleLaunch,resolveExampleMode};
export const here=process.env.H24_RUN_ROOT!,source=process.env.HARNESS_SOURCE_CACHE!;
export const sha=(b:Uint8Array|string)=>createHash('sha256').update(b).digest('hex');
export const fixed=(p:string)=>pathToFileURL(resolve(source,p)).href;
export const record=async(name:string,value:unknown)=>writeFile(resolve(here,`trace-${name}.json`),JSON.stringify(value,null,2)+'\n');
export async function bounded<T>(p:PromiseLike<T>,label='operation',ms=12000):Promise<T>{let timer:any;try{return await Promise.race([p,new Promise<never>((_,reject)=>timer=setTimeout(()=>reject(Error(label+' timeout')),ms))]);}finally{clearTimeout(timer);}}
export async function until(check:()=>boolean,label:string){const end=Date.now()+10000;while(Date.now()<end){if(check())return;await new Promise<void>(r=>setImmediate(r));}throw Error(label+' not reached');}
export function gate(){let release!:()=>void;const promise=new Promise<void>(r=>release=r);return {promise,release};}
export async function world(options:{fault?:string;sdk?:boolean;resume?:string;root?:string;replay?:string;endpoint?:string}={}){
 const root=options.root??await mkdtemp(resolve(here,'world-')),workspace=resolve(root,'workspace');await mkdir(workspace,{recursive:true});
 await writeFile(resolve(workspace,'unchanged.txt'),'KEEP\n',{flag:'wx'}).catch((e:any)=>{if(e.code!=='EEXIST')throw e;});
 const profile=resolve(root,'home/profiles/h24-fixture');await mkdir(profile,{recursive:true});
 await writeFile(resolve(profile,'package.json'),JSON.stringify({name:'h24-author-fixture',private:true,dsh:{profile:{bundles:[]}}}));await writeFile(resolve(profile,'cordis.patch.yml'),'[]\n');
 const row=(id:string,path:string,config:unknown={})=>({id,name:fixed(path),config});
 const entries=[row('llm','packages/llm/llm/src/index.ts'),row('sessions','packages/core/session/src/index.ts'),row('projection','packages/session/session-projection/src/index.ts'),row('system','packages/core/system-prompt/src/index.ts',{includeHarnessIdentity:false,personaPrefix:'Use fictional fixture only.'}),row('tools','packages/core/tools/src/index.ts'),row('executor','packages/core/tool-executor-native/src/index.ts'),row('agents','packages/core/agent/src/index.ts'),row('fs','packages/fs/fs-local/src/index.ts'),row('directory','packages/session/working-directory/src/index.ts'),row('jsonl','packages/session/session-persistence-jsonl/src/index.ts',{root:resolve(root,'sessions'),compression:'none'}),{id:'fixture',name:pathToFileURL(resolve(here,'fixture-plugin.ts')).href,config:{root,workspace,fault:options.fault??'none',replay:options.replay,endpoint:options.endpoint}},row('loop','packages/core/agent-loop/src/index.ts',{agents:options.sdk?[]:[{id:'root',sessionId:'h24-root',provider:'fixture',model:'fixture',cwd:workspace,...options.resume?{sessionId:undefined,resumeSessionId:options.resume}:{}}]})];
 if(options.endpoint)entries.splice(entries.findIndex(x=>x.id==='fixture'),0,row('retry','packages/llm/llm-retry/src/index.ts'));
 if(options.fault==='missing')entries.splice(entries.findIndex(x=>x.id==='system'),1);
 if(options.fault==='bad-config')(entries.find(x=>x.id==='loop')!.config as any).agents=[{id:'bad',sessionId:'same',resumeSessionId:'same'}];
 if(options.fault==='bad-export')entries.push({id:'bad-export',name:pathToFileURL(resolve(here,'bad-export.ts')).href,config:{}});
 if(options.sdk)entries.push({id:'sdk',name:pathToFileURL(resolve(here,'sdk-plugin.ts')).href,config:{}});
 const config=resolve(profile,'cordis.yml');await writeFile(config,JSON.stringify(entries,null,2)+'\n');
 return {root,workspace,profile,config,env:{H24_PROFILE:profile,H24_WORLD:root,DSH_HOME:resolve(root,'home')}};
}
export async function smoke(w:Awaited<ReturnType<typeof world>>,expectedExitCode=0){
 const result=await runLoaderSmoke({label:'H24 real author Profile',cwd:w.root,binScript:process.env.H24_APP_ENTRY!,configPath:w.config,tsconfigPath:resolve(here,'tsconfig.json'),mode:'src',sourceImport:'tsx/esm',env:w.env,expectedExitCode,processTimeoutMs:15000});await record('last-smoke',{world:w,...result});return result;
}
export async function rawLog(root:string){const files=await readdir(resolve(root,'sessions'),{recursive:true});const p=files.filter(f=>f.endsWith('.jsonl'));assert.equal(p.length,1);return readFile(resolve(root,'sessions',p[0]),'utf8');}
