import assert from 'node:assert/strict';
import {Context} from '@deepseek-ai/cordis';
import SessionStore,{Session,SessionId,SessionSeq,SessionLogOffset,SESSION_FORMAT_VERSION,interruptedTurnClosers} from '@deepseek-ai/dsh-session';
import type {SessionEvent,SessionHeader} from '@deepseek-ai/dsh-session';
import * as Jsonl from '@deepseek-ai/dsh-session-persistence-jsonl';
import {createUserMessage,createAssistantMessage,ToolCallId} from '@deepseek-ai/dsh-llm';
import {mkdir,mkdtemp,readFile,stat,unlink} from 'node:fs/promises';
import {resolve,relative,isAbsolute} from 'node:path';
export {assert,Context,SessionStore,Session,SessionId,SessionSeq,SessionLogOffset,SESSION_FORMAT_VERSION,interruptedTurnClosers,ToolCallId,createAssistantMessage,readFile};
export type {SessionEvent,SessionHeader};
export const user=(text:string)=>createUserMessage({source:{kind:'user'},content:[{type:'text',text}]});
export const header=(id:string):SessionHeader=>({id:SessionId(id),version:SESSION_FORMAT_VERSION,createdAt:0,isSeeded:false,delegationDepth:0});
export function events(kind:'closed'|'open'|'not-started'|'unknown'='closed'):SessionEvent[]{
 const s=Session.create(SessionId('event-maker'));const out:SessionEvent[]=[];
 const add=(...args:any[])=>{const e=Reflect.apply(s.append,s,args);const copy=structuredClone(e);copy.time=1000+copy.seq;out.push(copy);};
 add('turn/start',{turn:1});add('step/start',{turn:1,step:1});
 add('user/message',user('计算 2 + 3'),{surfaceOp:'append'});
 if(kind==='not-started'||kind==='unknown'){
  const message=createAssistantMessage({source:{provider:'fixture',model:'scripted'},content:[{type:'tool-call',id:ToolCallId('sum'),name:'sum',arguments:'{"a":2,"b":3}'}]});
  add('assistant/message',{turn:1,step:1,message,stream:[]},{surfaceOp:'append'});
  if(kind==='unknown')add('tool/call',{turn:1,step:1,callId:ToolCallId('sum'),name:'sum',arguments:'{"a":2,"b":3}'});
 }
 if(kind==='closed'){add('step/end',{turn:1,step:1});add('turn/end',{turn:1,reason:{kind:'completed'}});}
 return out;
}
export async function freshRoot(label:string){
 const base=process.env.H18_RUN_ROOT;assert.ok(base,'run through the H18 runner');
 const root=await mkdtemp(resolve(base,'h18-'+label+'-'));
 return root;
}
export async function backend(root:string,compression:'none'|'zstd'|'default'='none'){
 const ctx=new Context();await ctx.plugin(SessionStore);await ctx.plugin(Jsonl,{root,...compression==='default'?{}:{compression}});
 return {ctx,store:ctx.sessionPersistence,close:()=>ctx.fiber.dispose()};
}
export async function removeOne(root:string,path:string){
 // 只删本次已知产物这个明确文件；不枚举删除、不删除目录。
 const rel=relative(root,path);assert.ok(rel&&!rel.startsWith('..')&&!isAbsolute(rel));
 assert.ok((await stat(path)).isFile());await unlink(path);return path;
}
export const messageSummary=(s:Session)=>s.deriveMessages().map(m=>({role:m.role,content:m.content}));
export async function ensureParent(path:string){await mkdir(resolve(path,'..'),{recursive:true});}
