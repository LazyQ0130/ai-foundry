import { Context } from '@deepseek-ai/cordis';
import SessionStore, { SessionId, Session, SESSION_FORMAT_VERSION } from '@deepseek-ai/dsh-session';
import SessionProjectionRegistry from '@deepseek-ai/dsh-session-projection';
import SystemPrompt from '@deepseek-ai/dsh-system-prompt';
import ToolsService, { defineTool } from '@deepseek-ai/dsh-tools';
import { NativeToolExecutor } from '@deepseek-ai/dsh-tool-executor-native';
import { ToolCallId } from '@deepseek-ai/dsh-llm';
import ApprovalService from '@deepseek-ai/dsh-user-approval';
import SandboxPolicyService from '@deepseek-ai/dsh-sandbox-policy';
export { Context, SessionId, Session, defineTool, ToolCallId };
export const gate=<T=void>()=>Promise.withResolvers<T>();
export const textOf=(r:any)=>r.content?.filter((b:any)=>b.type==='text').map((b:any)=>b.text).join('')??'';
export const audit=(session:Session)=>session.snapshotEvents().filter(e=>e.type.startsWith('approval/'));
// 与官方 approval.spec 一致的结构性 Agent 载体；不是 AgentLoop 或完整应用。
export function carrier(ctx:Context,id='fixture',open=true,cwd?:string){
 const session=cwd===undefined?ctx.sessions.create(SessionId(id)):
  Session.create(SessionId(id),undefined,{version:SESSION_FORMAT_VERSION,id:SessionId(id),createdAt:0,isSeeded:false,cwd});
 if(open)session.append('turn/start',{turn:1});
 return {session} as any;
}
export async function components(options:{approval?:boolean;approvalConfig?:any;policy?:any;tools?:boolean}={}){
 const ctx=new Context();
 for(const p of [SessionStore,SessionProjectionRegistry,SystemPrompt])await ctx.plugin(p as any);
 if(options.approval!==false)await ctx.plugin(ApprovalService,options.approvalConfig??{});
 if(options.policy!==false)await ctx.plugin(SandboxPolicyService,options.policy??{});
 if(options.tools!==false){await ctx.plugin(ToolsService);ctx.tools.setExecutor(new NativeToolExecutor(ctx));}
 return {ctx,close:()=>ctx.fiber.dispose()};
}
export const call=(id:string)=>({type:'tool-call' as const,id:ToolCallId(id),name:'sum_fixture',arguments:'{"a":2,"b":3}'});
