import AgentRegistry from '@deepseek-ai/dsh-agent';
import AgentLoop from '@deepseek-ai/dsh-agent-loop';
import LlmRuntime,{LlmAdapter} from '@deepseek-ai/dsh-llm';
import type {GenerateOptions,StreamChunk} from '@deepseek-ai/dsh-llm';
import SessionProjectionRegistry from '@deepseek-ai/dsh-session-projection';
import SystemPrompt from '@deepseek-ai/dsh-system-prompt';
import ToolsService,{defineTool} from '@deepseek-ai/dsh-tools';
import {NativeToolExecutor} from '@deepseek-ai/dsh-tool-executor-native';
import {assert,Context,SessionStore,SessionId,ToolCallId,user,rebuild,textOf,type SessionEvent} from './support.ts';
const textChunks=(text:string):StreamChunk[]=>[{type:'text-delta',index:0,text},{type:'finish',reason:{kind:'stop'}}];
class Adapter extends LlmAdapter{
 readonly requests:any[]=[];
 constructor(readonly responses:StreamChunk[][]){super();}
 async resolveModel(provider:string,model:string){return {provider,id:model,name:model,defaultMaxTokens:128,context:{contextWindow:4096}};}
 async *stream(options:GenerateOptions){this.requests.push(structuredClone({...options,signal:undefined}));
  const response=this.responses.shift();if(!response)throw Error('fixture exhausted');yield* response;}
}
export async function agentPractice(kind:'success'|'failure'|'rejected-settlement'='success'){
 const ctx=new Context(),facts:SessionEvent[]=[],trace:any[]=[],prefixes:any[]=[];
 const record=(channel:string,data:any)=>trace.push({position:trace.length,channel,data:structuredClone(data)});
 for(const p of [LlmRuntime,SessionStore,SessionProjectionRegistry])await ctx.plugin(p as any);
 await ctx.plugin(SystemPrompt,{includeHarnessIdentity:false,personaPrefix:'只分析内存项目材料。'});
 await ctx.plugin(ToolsService);
 await ctx.plugin({inject:['tools'],apply(owner:Context){owner.tools.setExecutor(new NativeToolExecutor(owner));}});
 await ctx.plugin(AgentRegistry);await ctx.plugin(AgentLoop,{agents:[]});
 const call={type:'tool-call' as const,id:ToolCallId('readme'),name:'inspect_fixture',arguments:'{}'};
 const toolChunks:StreamChunk[]=[{type:'block-start',index:0,blockType:'tool-call'},{type:'block-end',index:0,block:call},{type:'finish',reason:{kind:'tool-calls'}}];
 const failed:StreamChunk[]=[{type:'text-delta',index:0,text:'失败草稿'},{type:'finish',reason:{kind:'error',failure:{code:'SERVER',message:'受控失败'}}}];
 const adapter=new Adapter(kind==='success'?[toolChunks,textChunks('src 放实现，tests 放测试。')]:[kind==='failure'?failed:textChunks('无法结算的回答')]);
 ctx.llm.registerAdapter(['fixture'],adapter);
 let handle:any;let bodies=0;
 ctx.on('session/event',(_s,e)=>{facts.push(e);record('session',e);});
 ctx.on('agent/assistant-stream',({frame})=>record('live',frame));
 ctx.on('tools/result',(exec,result)=>record('tools/result',{id:exec.callId,result}));
 ctx.on('agent/error',event=>record('agent/error',{error:String(event.error)}));
 ctx.on('llm/stream',async function*(options,next){
  const events=[...facts],rebuilt=rebuild(events),header=rebuilt.requestHeader()!;
  assert.deepEqual(rebuilt.deriveMessages(),options.messages);
  for(const [key,value] of Object.entries(header.config))assert.deepEqual((options as any)[key],value);
  assert.deepEqual(header.tools??[],options.tools??[]);assert.deepEqual(rebuilt.toolHistory(),options.toolHistory);
  prefixes.push({events,asOfSeq:events.at(-1)?.seq,messages:options.messages,header,toolHistory:options.toolHistory,reconstruction:'PASS'});
  record('loop-request',{asOfSeq:events.at(-1)?.seq});yield* next();
 });
 try{
  handle=await ctx.agents.create({sessionId:SessionId('h17-D-'+kind),agentOptions:{provider:'fixture',model:'scripted'}});
  ctx.tools.register(defineTool({name:'inspect_fixture',description:'返回内存目录，不接触磁盘',parameters:{},
   output:{schema:{type:'string'},render:(_args,value)=>[{type:'text',text:value}]},
   async execute(){bodies++;return 'src/ 与 tests/';}}));
  if(kind==='rejected-settlement'){
   const append=handle.agent.session.append.bind(handle.agent.session);
   // 受控实例故障，不修改官方源码；拒绝两种结算，验证实时帧不能制造日志事实。
   Object.defineProperty(handle.agent.session,'append',{value:(type:string,...args:any[])=>{
    if(type==='assistant/message'||type==='assistant/attempt')throw Error('fixture settlement rejection');
    return append(type,...args);
   }});
  }
  handle.agent.followup(user('读取 README，检查测试文件，再汇总项目结构。'));
  await handle.agent.whenIdle();
  const messages=handle.agent.session.deriveMessages();
  assert.ok(prefixes.length>=1);assert.ok(trace.some(t=>t.channel==='live'));
  if(kind==='success'){
   assert.equal(bodies,1);assert.equal(adapter.requests.length,2);
   const result=facts.find(e=>e.type==='tool/result')!;assert.equal(result.data.message.toolCallId,'readme');
   const callEvent=facts.find(e=>e.type==='tool/call')!;assert.ok(result.sourceEventSeqs?.includes(callEvent.seq));
   assert.ok(adapter.requests[1].messages.some((m:any)=>m.role==='tool'&&m.toolCallId==='readme'));
   assert.deepEqual(adapter.requests[1].messages,prefixes[1].messages);
   const notice=trace.find(t=>t.channel==='tools/result')!,committed=trace.find(t=>t.channel==='session'&&t.data.type==='tool/result')!;
   assert.ok(notice.position<committed.position);
  }else if(kind==='failure'){
   assert.equal(facts.filter(e=>e.type==='assistant/attempt').length,1);
   assert.equal(messages.filter(m=>m.role==='assistant').length,0);
  }else{
   assert.equal(facts.filter(e=>e.type.startsWith('assistant/')).length,0);
   assert.ok(trace.some(t=>t.channel==='live'&&JSON.stringify(t.data).includes('abandoned')));
  }
  return {kind,bodies,facts,nodes:[...handle.agent.session.surface.nodes],messages,prefixes,adapterRequests:adapter.requests,trace,
   texts:messages.map(textOf),persistence:'memory only; no checkpoint policy or backend'};
 }finally{if(handle)await handle.dispose();await ctx.fiber.dispose();}
}
