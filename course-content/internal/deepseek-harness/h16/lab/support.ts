import assert from 'node:assert/strict';
import {mkdtemp,stat,unlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,dirname,relative,isAbsolute,basename} from 'node:path';
import {Context} from '@deepseek-ai/cordis';
import SessionStore,{Session,SessionId,SESSION_FORMAT_VERSION} from '@deepseek-ai/dsh-session';
import SessionProjectionRegistry from '@deepseek-ai/dsh-session-projection';
import SystemPrompt from '@deepseek-ai/dsh-system-prompt';
import ToolsService from '@deepseek-ai/dsh-tools';
import {NativeToolExecutor} from '@deepseek-ai/dsh-tool-executor-native';
import SandboxPolicy from '@deepseek-ai/dsh-sandbox-policy';
import SandboxedFs from '@deepseek-ai/dsh-fs-sandbox';
import WorkingDirectory from '@deepseek-ai/dsh-working-directory';
import LlmRuntime,{ToolCallId} from '@deepseek-ai/dsh-llm';
export {Context,Session,SessionId,ToolCallId};
export const gate=<T=void>()=>Promise.withResolvers<T>();
export const textOf=(r:any)=>r.content?.filter((b:any)=>b.type==='text').map((b:any)=>b.text).join('')??'';
export async function exists(p:string){try{await stat(p);return true;}catch(e:any){if(e.code==='ENOENT')return false;throw e;}}
export async function until<T>(read:()=>T|undefined|Promise<T|undefined>,timeout=5000){
 const end=Date.now()+timeout;while(Date.now()<end){const value=await read();if(value!==undefined)return value;await new Promise(r=>setTimeout(r,10));}throw Error('bounded fixture condition not reached');
}
export function carrier(ctx:Context,cwd:string,id='fixture'){
 const sid=SessionId(id),session=Session.create(sid,undefined,{version:SESSION_FORMAT_VERSION,id:sid,createdAt:0,isSeeded:false,cwd});
 session.append('turn/start',{turn:1});return {id:sid,session,ctx,options:{provider:'fixture',model:'text'},inject(){throw Error('unexpected directory transition');}} as any;
}
export const block=(name:string,args:any,id=name)=>({type:'tool-call' as const,id:ToolCallId(id),name,arguments:JSON.stringify(args)});
export async function invoke(ctx:Context,name:string,args:any,agent?:any,signal=new AbortController().signal,toolSet?:any){
 const batch=await ctx.tools.execute({calls:[block(name,args)],agent,signal,toolSet});return batch.results[0].result;
}
export async function base(){
 const ctx=new Context();for(const p of [SessionStore,SessionProjectionRegistry,SystemPrompt,LlmRuntime,ToolsService])await ctx.plugin(p as any);
 ctx.tools.setExecutor(new NativeToolExecutor(ctx));return {ctx,close:()=>ctx.fiber.dispose()};
}
export async function files(ctx:Context){
 const root=await mkdtemp(resolve(tmpdir(),'aifoundry-h16-')),file=resolve(root,'fixture.txt'),retained:string[]=[];let stage:string|undefined;
 const inside=(p:string)=>{const r=relative(root,resolve(p));assert.ok(r!==''&&!r.startsWith('..')&&!isAbsolute(r));};
 await ctx.plugin(SandboxPolicy,{mode:'workspace-write',workspaceRoot:root});await ctx.plugin(SandboxedFs,{cwd:root});
 (ctx.fs as SandboxedFs).internals={
  inspectTemp({tempPath,stagingDir}){inside(tempPath);assert.equal(basename(tempPath),'fixture.txt.tmp');assert.equal(dirname(tempPath),stagingDir);stage=tempPath;},
  async removeStagingDir(dir){inside(dir);assert.ok(stage&&dirname(stage)===dir);if(await exists(stage))await unlink(stage);retained.push(dir);stage=undefined;},
 };
 await ctx.plugin(WorkingDirectory,{defaultDirectory:root});
 return {root,file,retained,async cleanup(){inside(file);if(await exists(file))await unlink(file);}};
}
