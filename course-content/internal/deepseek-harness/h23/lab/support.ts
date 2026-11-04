import {fixture as agentFixture,assert,SessionId,bounded,gate,until,text,blocks,user,hasText,record} from './agent-fixture.ts';
import {DeepSeekHarness,HarnessClient} from '@deepseek-ai/dsh-sdk-client';
import {mkdtemp,readFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
export {agentFixture,assert,SessionId,bounded,gate,until,text,blocks,user,hasText,record,readFile,mkdir,resolve,DeepSeekHarness,HarnessClient};
export async function sdkHome(){return mkdtemp(resolve(process.env.H23_RUN_ROOT!,'sdk-home-'));}
export function sdkOptions(home:string){
 const keys=['SystemRoot','WINDIR','TEMP','TMP','PATH','PATHEXT','HARNESS_SOURCE_CACHE','H23_DEPS_ANCHOR','H23_ZOD_ANCHOR','H23_NATIVE_ANCHOR','H23_LIMIT_ANCHOR','H23_PTC_ANCHOR','H23_WIRE_ANCHOR','H23_RUN_ROOT'];
 const env=Object.fromEntries(keys.filter(k=>process.env[k]!==undefined).map(k=>[k,process.env[k]]));
 return {dshBin:process.env.H23_SDK_RUNTIME!,profile:'sdk-minimal',dshHome:home,processCwd:process.env.H23_RUN_ROOT!,cwd:process.env.H23_RUN_ROOT!,provider:'fixture',model:'parent',env,shutdownTimeoutMs:3000,requestTimeoutMs:10000};
}
export function observe(client:any){
 client.start();const child=client.child;assert.ok(child?.pid);let stdout='',stderr='';const stdin:string[]=[];
 child.stdout.on('data',(s:any)=>{stdout+=s.toString();});child.stderr.on('data',(s:any)=>{stderr+=s.toString();});
 const write=child.stdin.write.bind(child.stdin);child.stdin.write=(data:any,...rest:any[])=>{stdin.push(data.toString());return write(data,...rest);};
 return {pid:child.pid,trace:()=>({pid:child.pid,exitCode:child.exitCode,signalCode:child.signalCode,stdout,stderr,stdin,frames:stdout.slice(0,stdout.lastIndexOf('\n')+1).split(/\r?\n/).filter(Boolean).map(s=>JSON.parse(s))}),child};
}
export async function runtimeTrace(home:string){return JSON.parse(await readFile(resolve(home,'runtime-trace.json'),'utf8'));}
export async function persisted(home:string,id:string){const f=await agentFixture({root:resolve(home,'sessions')});try{return await f.stored(SessionId(id));}finally{await f.close();}}
