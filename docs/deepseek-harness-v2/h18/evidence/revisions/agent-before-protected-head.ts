import AgentRegistry from '@deepseek-ai/dsh-agent';
import AgentLoop from '@deepseek-ai/dsh-agent-loop';
import LlmRuntime,{LlmAdapter} from '@deepseek-ai/dsh-llm';
import type {GenerateOptions,StreamChunk} from '@deepseek-ai/dsh-llm';
import SessionProjectionRegistry from '@deepseek-ai/dsh-session-projection';
import SystemPrompt from '@deepseek-ai/dsh-system-prompt';
import ToolsService,{defineTool} from '@deepseek-ai/dsh-tools';
import {NativeToolExecutor} from '@deepseek-ai/dsh-tool-executor-native';
import {buildForkSeed} from '@deepseek-ai/dsh-session';
import {assert,backend,freshRoot,header,events,SessionId,SessionSeq,user,ToolCallId,type SessionEvent} from './support.ts';
const text=(value:string):StreamChunk[]=>[{type:'text-delta',index:0,text:value},{type:'finish',reason:{kind:'stop'}}];
class Adapter extends LlmAdapter{
 readonly requests:any[]=[];
 constructor(readonly responses:StreamChunk[][]){super();}
 async resolveModel(provider:string,model:string){return {provider,id:model,name:model,defaultMaxTokens:128,context:{contextWindow:4096}};}
 async *stream(options:GenerateOptions){this.requests.push(structuredClone({...options,signal:undefined}));const response=this.responses.shift();if(!response)throw Error('fixture exhausted');yield* response;}
}
export async function agentBackend(root:string,responses:StreamChunk[][]){
 const f=await backend(root),ctx=f.ctx;const facts=new Map<string,SessionEvent[]>(),notices:any[]=[],errors:string[]=[];let bodies=0;
 await ctx.plugin(LlmRuntime);await ctx.plugin(SessionProjectionRegistry);
 await ctx.plugin(SystemPrompt,{includeHarnessIdentity:false,personaPrefix:'只使用内存计算材料。'});
 await ctx.plugin(ToolsService);await ctx.plugin({inject:['tools'],apply(owner:any){owner.tools.setExecutor(new NativeToolExecutor(owner));}});
 await ctx.plugin(AgentRegistry);await ctx.plugin(AgentLoop,{agents:[]});
 const adapter=new Adapter(responses);ctx.llm.registerAdapter(['fixture'],adapter);
 ctx.tools.register(defineTool({name:'sum',description:'纯计算，不写文件',parameters:{a:{type:'number'},b:{type:'number'}},
  output:{schema:{type:'number'},render:(_args,value)=>[{type:'text',text:String(value)}]},
  async execute({a,b}){bodies++;return a+b;}}));
 ctx.on('session/event',(s,e)=>{const list=facts.get(s.id)??[];list.push(e);facts.set(s.id,list);});
 ctx.on('agent/created',(_agent,source)=>{notices.push({source});});
 ctx.on('agent/error',e=>{errors.push(String(e.error));});
 async function stored(id:string){const r=await f.store.open(SessionId(id),'read');try{return {header:r.header,inheritedEventCount:r.inheritedEventCount,...await r.read()};}finally{await r.close();}}
 return {...f,adapter,facts,notices,errors,bodies:()=>bodies,stored};
}
export async function integratedPractice(){
 const root=await freshRoot('X'),id=SessionId('saved-task');
 const call={type:'tool-call' as const,id:ToolCallId('sum-one'),name:'sum',arguments:'{"a":2,"b":3}'};
 const chunks:StreamChunk[]=[{type:'block-start',index:0,blockType:'tool-call'},{type:'block-end',index:0,block:call},{type:'finish',reason:{kind:'tool-calls'}}];
 const first=await agentBackend(root,[chunks,text('2+3=5')]);let original:any,savedMessages:any,savedHeader:any;
 try{
  const h=await first.ctx.agents.create({sessionId:id,agentOptions:{provider:'fixture',model:'scripted'}});
  try{
   h.agent.followup(user('请用sum计算2+3'));await h.agent.whenIdle();assert.deepEqual(first.errors,[]);assert.equal(first.bodies(),1);
   assert.equal(await first.ctx.sessions.flush(h.agent.session),true);
   original=await first.stored(id);savedMessages=h.agent.session.deriveMessages();savedHeader=h.agent.session.requestHeader();
   assert.deepEqual(original.events,first.facts.get(id));assert.equal(first.adapter.requests.length,2);
  }finally{await h.dispose();}
  assert.equal(first.ctx.agents.get(id),undefined);assert.ok(await first.store.stat(id));
 }finally{await first.close();}
 const second=await agentBackend(root,[text('原会话继续'),text('分支继续')]);let parent:any,branch:any;
 try{
  parent=await second.ctx.agents.resume({resumeSessionId:id,agentOptions:{provider:'fixture',model:'scripted'}});
  assert.deepEqual(parent.agent.session.deriveMessages(),savedMessages);assert.deepEqual(parent.agent.session.requestHeader(),savedHeader);
  assert.equal(second.bodies(),0);assert.equal(second.adapter.requests.length,0); // 恢复不重新执行工具/模型。
  const resumed=await second.stored(id);assert.deepEqual(resumed.events.slice(0,original.events.length),original.events);
  assert.equal(resumed.events.length,original.events.length+1);assert.equal(resumed.events.at(-1).type,'session/end-seed');
  const boundary=original.events.find((e:SessionEvent)=>e.type==='tool/call').seq;
  const preview=second.ctx.sessions.fork(parent.agent.session,SessionSeq(boundary),SessionId('memory-fork-preview'));
  const seed=buildForkSeed(resumed.events,SessionSeq(boundary));
  // 普通sessions.fork只建内存Session。持久分支通过同一官方seed规则交给Agent工厂取得写句柄。
  branch=await second.ctx.agents.create({sessionId:SessionId('saved-branch'),seed,inheritedEventCount:preview.inheritedEventCount,
   meta:{isSeeded:true},agentOptions:{provider:'fixture',model:'scripted'}});
  assert.deepEqual(branch.agent.session.deriveMessages(),preview.deriveMessages());
  const forked=await second.stored(branch.agent.id);assert.deepEqual(forked.events.slice(0,boundary+1),original.events.slice(0,boundary+1));
  assert.equal(forked.events[boundary+1].type,'session/end-seed');assert.equal(forked.events[boundary+1].data.inherited,true);
  const result=forked.events.find((e:SessionEvent)=>e.type==='tool/result');assert.equal(result.data.error.code,'TOOL_OUTCOME_UNKNOWN');
  assert.deepEqual(forked.events.at(-1).data.reason,{kind:'forked'});
  parent.agent.followup(user('原会话专有输入'));await parent.agent.whenIdle();await second.ctx.sessions.flush(parent.agent.session);
  const parentAfter=await second.stored(id);assert.deepEqual(parentAfter.events.slice(0,resumed.events.length),resumed.events);
  branch.agent.followup(user('分支专有输入'));await branch.agent.whenIdle();await second.store.flush();
  const branchAfter=await second.stored(branch.agent.id),parentAgain=await second.stored(id);
  assert.deepEqual(parentAgain.events,parentAfter.events);assert.deepEqual(branchAfter.events.slice(0,forked.events.length),forked.events);
  assert.ok(!JSON.stringify(parentAfter.events).includes('分支专有输入'));assert.ok(!JSON.stringify(branchAfter.events).includes('原会话专有输入'));
  assert.deepEqual(second.errors,[]);assert.equal(second.bodies(),0);assert.equal(second.adapter.requests.length,2);
  return {root,original,resumed,boundary,forked,parentAfter,branchAfter,savedMessages,savedHeader,
   firstAdapterRequests:first.adapter.requests,nextAdapterRequests:second.adapter.requests,firstToolExecutions:1,replayedToolExecutions:0,
   futureIsolation:true,notices:second.notices,artifacts:'retained for review; no bulk cleanup'};
 }finally{await branch?.dispose();await parent?.dispose();await second.close();}
}
export async function resumePractice(){
 const root=await freshRoot('resume'),h=header('resume-crash'),original=events('unknown'),f=await backend(root);
 try{const w=await f.store.create(h);await w.append(original);await w.flush();await w.close();}finally{await f.close();}
 const live=await agentBackend(root,[text('恢复后新任务')]);let handle:any;
 try{
  handle=await live.ctx.agents.resume({resumeSessionId:h.id,agentOptions:{provider:'fixture',model:'scripted'}});
  const repaired=await live.stored(h.id);assert.deepEqual(repaired.events.slice(0,original.length),original);
  assert.deepEqual(repaired.events.slice(original.length).map((e:SessionEvent)=>e.type),['tool/result','step/end','turn/end','session/end-seed']);
  assert.equal(repaired.events[5].data.error.code,'TOOL_OUTCOME_UNKNOWN');assert.equal(live.bodies(),0);assert.equal(live.adapter.requests.length,0);
  await assert.rejects(live.ctx.agents.resume({resumeSessionId:h.id}),/owned/);
  handle.agent.followup(user('继续核对'));await handle.agent.whenIdle();await live.ctx.sessions.flush(handle.agent.session);
  assert.equal(live.bodies(),0);assert.deepEqual(live.errors,[]);
  const continued=await live.stored(h.id);assert.ok(continued.events.some((e:SessionEvent)=>e.type==='turn/start'&&e.data.turn===2));
  return {root,original,repaired,continued,toolExecutions:0,modelRequests:live.adapter.requests.length,artifacts:'retained for review'};
 }finally{await handle?.dispose();await live.close();}
}
