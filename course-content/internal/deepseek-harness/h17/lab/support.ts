import assert from 'node:assert/strict';
import { Context } from '@deepseek-ai/cordis';
import SessionStore, { Session, SessionId, SessionSeq, SessionLogOffset, foldSurface, foldRequestHeader, canonicalHeader } from '@deepseek-ai/dsh-session';
import type { SessionEvent } from '@deepseek-ai/dsh-session';
import { createUserMessage, createAssistantMessage, createSystemMessage, createDeveloperMessage, createToolResultMessage, ToolCallId } from '@deepseek-ai/dsh-llm';
export { assert, Context, SessionStore, Session, SessionId, SessionSeq, SessionLogOffset, foldSurface, foldRequestHeader, canonicalHeader,
  createUserMessage, createAssistantMessage, createSystemMessage, createDeveloperMessage, createToolResultMessage, ToolCallId };
export type { SessionEvent };
declare module '@deepseek-ai/dsh-llm' { interface MessageSourceMap { 'h17-fixture': {kind:'h17-fixture'} } }
export const user=(text:string)=>createUserMessage({content:[{type:'text',text}],source:{kind:'user'}});
export const injected=(text:string)=>createUserMessage({content:[{type:'text',text}],source:{kind:'h17-fixture'}});
export const assistant=(text:string)=>createAssistantMessage({content:text?[{type:'text',text}]:[],source:{provider:'fixture',model:'scripted'}});
export const system=(text:string)=>createSystemMessage(text);
export const textOf=(m:any)=>m.content.filter((b:any)=>b.type==='text').map((b:any)=>b.text).join('');
// 只订阅新建 Session 的提交源；不新增弃用同步读 API 调用，也不是磁盘后端。
export async function fixture(id:string){
 const ctx=new Context();await ctx.plugin(SessionStore);
 const events:SessionEvent[]=[];
 ctx.on('session/event',(s,e)=>{if(s.id===id)events.push(e);});
 const session=ctx.sessions.create(SessionId(id),{meta:{createdAt:0}});
 return {ctx,session,events,close:()=>ctx.fiber.dispose()};
}
export function view(session:Session,events:readonly SessionEvent[]){
 return {eventOrder:events.map(e=>({seq:e.seq,type:e.type,surfaceOp:e.surfaceOp??null})),
  nodes:[...session.surface.nodes],messages:session.deriveMessages().map(m=>({role:m.role,source:m.source,content:m.content})),
  header:session.requestHeader()??null};
}
// 只重建读模型；seed 构造会另加一个 session/end-seed 标记，不冒充原轨迹。
export function rebuild(events:readonly SessionEvent[]){return Session.create(SessionId('read-model'),events);}
