import assert from 'node:assert/strict';
import test from 'node:test';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { LlmAdapter, LlmRuntime, createUserMessage, LlmError, expandAssistantStream, ToolCallId } from '@deepseek-ai/dsh-llm';
import { Context as CordisContext } from '@deepseek-ai/cordis';
import AgentRegistry from '@deepseek-ai/dsh-agent';
import AgentLoop from '@deepseek-ai/dsh-agent-loop';
import SessionStore, { SessionId, SessionLogOffset } from '@deepseek-ai/dsh-session';
import SessionProjectionRegistry from '@deepseek-ai/dsh-session-projection';
import SystemPrompt from '@deepseek-ai/dsh-system-prompt';
import ToolRuntime from '@deepseek-ai/dsh-tools';
import * as NativeToolExecutor from '@deepseek-ai/dsh-tool-executor-native';
import { defineContentToolFixture } from '@deepseek-ai/dsh-tool-testkit';
type Mode = 'A' | 'B' | 'C-retry' | 'C-cancel' | 'C-max-tokens';
const text=(value:string)=>[{type:'text-delta',index:7,text:value},{type:'finish',reason:{kind:'stop'}}];
const tool=()=>[
 {type:'text-delta',index:7,text:'先读资料'},
 {type:'tool-call-delta',index:2,id:ToolCallId('module-read'),name:'read_fixture',argumentsDelta:'{"part":'},
 {type:'tool-call-delta',index:2,id:ToolCallId('module-read'),argumentsDelta:'"README"}'},
 {type:'block-end',index:2,block:{type:'tool-call',id:ToolCallId('module-read'),name:'read_fixture',arguments:'{"part":"README"}'}},
 {type:'finish',reason:{kind:'tool-calls'}},
];
const textOf=(m:any)=>m.content?.filter((b:any)=>b.type==='text').map((b:any)=>b.text).join('')??'';
const cleanRequest=(r:any)=>structuredClone({...r,signal:undefined});
async function scenario(mode:Mode){
 const ctx=new CordisContext(), replayCtx=new CordisContext();
 const trace:any[]=[],requests:any[]=[],loopRequests:any[]=[],assemblies:any[]=[];
 const reached=Promise.withResolvers<void>(),release=Promise.withResolvers<void>();
 let handle:any,dir='/fixture/before',tone='简洁',bodyCalls=0,assembleCount=0,preStepCount=0,requestCount=0;
 const record=(channel:string,type:string,data:any={})=>{trace.push({position:trace.length,channel,type,data:structuredClone(data)});};
 class ControlledAdapter extends LlmAdapter{
  override async prepareCall(provider:string,model:string,signal?:AbortSignal){
   record('request','adapter.prepareCall',{provider,model});
   return super.prepareCall(provider,model,signal);
  }
  override async resolveModel(provider:string,model:string){return {provider,id:model,name:model,defaultMaxTokens:96,context:{contextWindow:4096}};}
  async *stream(options:any):AsyncGenerator<any>{
   requests.push(cleanRequest(options));record('external-model','adapter.stream',cleanRequest(options));
   assert.ok(Object.isFrozen(options)&&Object.isFrozen(options.messages));
   const n=requests.length;
   if(mode==='B'&&n===2){
    assert.ok(options.messages.some((m:any)=>m.role==='tool'&&m.toolCallId==='module-read'&&textOf(m)==='README: MODULE THREE FIXTURE'));
   }
   if(mode==='C-retry'&&n===1){yield {type:'text-delta',index:7,text:'失败草稿'};throw new LlmError('controlled disconnect','TRANSPORT');}
   else if(mode==='C-cancel'){
    yield {type:'text-delta',index:7,text:'可保留前缀'};
    yield {type:'tool-call-delta',index:2,id:ToolCallId('never-run'),name:'read_fixture',argumentsDelta:'{"part":'};
    reached.resolve();await release.promise;options.signal.throwIfAborted();
   }else{
    const chunks=mode==='B'&&n===1?tool():mode==='C-max-tokens'?[...tool().slice(0,-1),{type:'finish',reason:{kind:'max-tokens'}}]:text(mode==='B'?'已根据工具结果回答':'模块任务完成');
    for(const chunk of chunks)yield chunk;
   }
  }
 }
 try{
  for(const p of [LlmRuntime,SessionStore,SessionProjectionRegistry])await ctx.plugin(p as any);
  await ctx.plugin(SystemPrompt,{includeHarnessIdentity:false});
  for(const p of [ToolRuntime,NativeToolExecutor,AgentRegistry])await ctx.plugin(p as any);
  await ctx.plugin(AgentLoop,{agents:[]});ctx.llm.registerAdapter(['fixture'],new ControlledAdapter());
  ctx.on('session/created',s=>{record('live','session/created',{id:s.id});});
  ctx.on('agent/created',({agent})=>{record('live','agent/created',{id:agent.id,registered:ctx.agents.get(agent.id)===agent});});
  ctx.on('agent/disposed',({agent})=>{record('live','agent/disposed',{id:agent.id,absent:ctx.agents.get(agent.id)===undefined});});
  ctx.on('session/disposed',s=>{record('live','session/disposed',{id:s.id});});
  ctx.on('session/event',(s,e)=>{record('fact',e.type,{sessionId:s.id,event:e});});
  ctx.on('agent/assistant-stream',({frame})=>{record('live','assistant/'+frame.type,frame);});
  ctx.on('agent/error',({error})=>{record('live','agent/error',{error:String(error)});});
  ctx.on('system-prompt/assemble',async(_p,_c,next)=>{assembleCount++;const a=await next();assemblies.push(structuredClone(a));record('control','assemble',{sections:a.sections,variables:a.variables,contexts:a.contexts,tools:a.tools});return a;});
  ctx.on('agent/pre-step',async(_p,next)=>{preStepCount++;record('control','pre-step');return next();});
  ctx.on('agent/request',async(_p,next)=>{requestCount++;dir='/fixture/after';tone='详细';record('control','agent/request');return next();});
  ctx.on('llm/stream',async function*(r,next){
   // This is the unprojected Loop boundary; it must be rebuildable from the event prefix.
   const prefix=handle.agent.session.snapshotEvents();
   const p=replayCtx.sessions.prepare(SessionId('rebuild-'+mode+'-'+loopRequests.length),{seed:prefix});
   {
    assert.deepEqual(p.deriveMessages(),r.messages);
    const header=p.requestHeader()!;
    for(const [key,value] of Object.entries(header.config))assert.deepEqual((r as any)[key],value);
    assert.deepEqual(header.tools??[],r.tools??[]);
    assert.deepEqual(p.toolHistory(),r.toolHistory);
    loopRequests.push({request:cleanRequest(r),throughSeq:prefix.at(-1)?.seq,reconstruction:'messages/config/tools/toolHistory match real Session rebuilt from prefix'});
   }
   record('request','llm/stream',cleanRequest(r));yield* next();
  });
  await replayCtx.plugin(SessionStore);
  ctx.tools.register(defineContentToolFixture({name:'read_fixture',description:'fixed constant only',parameters:{part:{type:'string'}},async execute({part}:any){
   assert.equal(part,'README');bodyCalls++;record('tool','tool-body',{part});return [{type:'text',text:'README: MODULE THREE FIXTURE'}];
  }}));
  record('control','registry.create');
  handle=await ctx.agents.create({sessionId:SessionId('m3-'+mode),agentOptions:{provider:'fixture',model:'scripted'},setup:async(agentCtx,agent)=>{
   assert.equal(ctx.sessions.get(agent.id),agent.session);assert.equal(ctx.agents.get(agent.id),undefined);
   record('control','setup',{sessionVisible:true,agentVisible:false});
   agentCtx.systemPrompt.variable('tone',()=>tone);
   agentCtx.systemPrompt.section({name:'role',order:1,text:'代码助手：{{tone}}'});
   agentCtx.systemPrompt.context({name:'directory',order:1,required:true,interpolate:false,text:()=>dir});
   return {commit(){record('control','setup.commit');}};
  }});
  record('control','create-return',{sameReference:ctx.agents.get(handle.agent.id)===handle.agent,handleDispose:typeof handle.dispose});
  if(mode==='C-retry')ctx.on('agent/request-error',async()=>{record('control','request-error/retry');return {kind:'retry' as const};});
  handle.agent.followup(createUserMessage({content:[{type:'text',text:'请概括固定README'}],source:{kind:'user'}}));
  if(mode==='C-cancel'){
   await Promise.race([reached.promise,handle.agent.whenIdle().then(()=>{throw Error('driver stopped before cancellation gate: '+JSON.stringify(trace.filter(t=>t.type==='agent/error')));})]);
   handle.agent.cancel({kind:'user'});release.resolve();
  }
  await handle.agent.whenIdle();
  const events=handle.agent.session.snapshotEvents(),messages=handle.agent.session.deriveMessages();
  const of=(type:string)=>events.filter((e:any)=>e.type===type);
  assert.equal(of('turn/start').length,1);assert.equal(of('turn/end').length,1);
  assert.equal(of('step/start').length,mode==='B'?2:1);
  assert.equal(of('step/end').length,mode==='B'?2:1);
  assert.equal(requests.length,mode==='B'||mode==='C-retry'?2:1);
  assert.equal(of('user/message').filter((e:any)=>e.data.source.kind==='user').length,1);
  assert.equal(of('turn/end')[0].data.reason.kind,mode==='C-cancel'?'aborted':mode==='C-max-tokens'?'max-tokens':'completed');
  assert.equal(bodyCalls,mode==='B'?1:0);
  assert.equal(assembleCount,mode==='B'?2:1);assert.equal(preStepCount,assembleCount);
  assert.equal(requestCount,requests.length);
  assert.equal(assemblies[0].variables.tone,'简洁');
  assert.ok(requests[0].messages.some((m:any)=>m.role==='system'&&textOf(m)==='代码助手：简洁'));
  assert.ok(requests[0].messages.some((m:any)=>m.source?.kind==='runtime-context'&&textOf(m).includes('/fixture/after')));
  if(mode==='B'){
   assert.equal(requests[0].messages.filter((m:any)=>m.role==='tool').length,0);
   assert.equal(of('tool/call')[0].data.callId,'module-read');
   assert.equal(of('tool/result')[0].data.message.toolCallId,'module-read');
   assert.ok(of('assistant/message')[0].seq<of('tool/call')[0].seq);
   assert.ok(requests[1].messages.some((m:any)=>m.role==='system'&&textOf(m)==='代码助手：详细'));
   assert.ok(requests[0].messages.some((m:any)=>m.role==='system'&&textOf(m)==='代码助手：简洁'));
  }
  if(mode==='C-retry'){
   assert.equal(of('assistant/attempt').length,1);assert.equal(of('assistant/message').length,1);
   assert.ok(!requests[1].messages.some((m:any)=>textOf(m).includes('失败草稿')));
   assert.ok(of('assistant/attempt')[0].seq<of('assistant/message')[0].seq);
  }
  if(mode==='C-cancel'){
   const e=of('assistant/message')[0];assert.equal(e.data.interrupted,true);assert.equal(textOf(e.data.message),'可保留前缀');
   assert.equal(e.data.message.content.some((b:any)=>b.type==='tool-call'),false);
  }
  if(mode==='C-max-tokens')assert.equal(of('assistant/message')[0].data.message.content.some((b:any)=>b.type==='tool-call'),false);
  const starts=trace.filter(t=>t.type==='assistant/start'),ends=trace.filter(t=>t.type==='assistant/end');
  assert.equal(starts.length,requests.length);assert.equal(ends.length,starts.length);
  for(const end of ends){
   assert.equal(end.data.outcome.kind,'committed');
   const fact=trace.find(t=>t.channel==='fact'&&t.data.event.seq===end.data.outcome.seq);
   assert.ok(fact&&fact.position<end.position);assert.equal(fact.type,end.data.outcome.eventType);
   const chunks=trace.filter(t=>t.type==='assistant/chunk'&&t.data.attemptId===end.data.attemptId);
   assert.deepEqual(expandAssistantStream(fact.data.event.data.stream).map((t:any)=>t.chunk),chunks.map(t=>t.data.chunk));
  }
  await handle.dispose();
  assert.equal(ctx.agents.get(handle.agent.id),undefined);assert.equal(ctx.sessions.get(handle.agent.id),undefined);
  assert.ok(trace.find(t=>t.type==='agent/disposed').position<trace.find(t=>t.type==='session/disposed').position);
  const report={mode,level:'D',components:['Cordis','Registry','AgentLoop factory/driver','Scope','SystemPrompt','SessionStore/Session/projections','LlmRuntime','Assembler','Accumulator','AssistantStreamAttempt','Tools/NativeExecutor'],mocks:['controlled LlmAdapter, no HTTP','fixed string tool, no filesystem'],storage:'real in-memory Session; no persistence backend',counts:{assembleCount,preStepCount,requestCount,bodyCalls},trace,events,messages,assemblies,loopRequests,adapterRequests:requests};
  await writeFile(resolve(process.env.M3_EVIDENCE!,mode+'.json'),JSON.stringify(report,null,2)+'\n');
 }catch(error){
  await writeFile(resolve(process.env.M3_EVIDENCE!,`failure-${mode}-${Date.now()}.json`),JSON.stringify({mode,error:String(error),trace,assemblies,loopRequests,adapterRequests:requests},null,2)+'\n');
  throw error;
 }finally{release.resolve();if(handle)await handle.dispose();await replayCtx.fiber.dispose();await ctx.fiber.dispose();}
}
for(const mode of ['A','B','C-retry','C-cancel','C-max-tokens'] as Mode[])test('D-M3-'+mode,()=>scenario(mode));
