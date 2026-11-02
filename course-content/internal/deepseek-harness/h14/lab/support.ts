import assert from 'node:assert/strict';
import { Context } from '@deepseek-ai/cordis';
import AgentRegistry from '@deepseek-ai/dsh-agent';
import AgentLoop from '@deepseek-ai/dsh-agent-loop';
import LlmRuntime, { LlmAdapter, createUserMessage, ToolCallId, projectToolUpdates } from '@deepseek-ai/dsh-llm';
import type { GenerateOptions, StreamChunk } from '@deepseek-ai/dsh-llm';
import SessionStore, { SessionId } from '@deepseek-ai/dsh-session';
import SessionProjectionRegistry from '@deepseek-ai/dsh-session-projection';
import SystemPrompt from '@deepseek-ai/dsh-system-prompt';
import ToolsService, { defineTool } from '@deepseek-ai/dsh-tools';
import { NativeToolExecutor } from '@deepseek-ai/dsh-tool-executor-native';
export { Context, defineTool, ToolCallId, createUserMessage, projectToolUpdates };
declare module '@deepseek-ai/dsh-llm' { interface MessageSourceMap { 'h14-fixture': { kind: 'h14-fixture' } } }
export const gate = <T = void>() => Promise.withResolvers<T>();
export const textOf = (r: any) => r.content?.filter((b: any) => b.type==='text').map((b: any) => b.text).join('') ?? '';
export const clean = (r: any) => structuredClone({ ...r, signal: undefined });
export const notice = (text: string) => createUserMessage({ content: [{type:'text',text}], source: {kind:'h14-fixture'} });
export function call(id: string, name: string, args: unknown = { input: { label: 'README' } }) {
  return { type: 'tool-call' as const, id: ToolCallId(id), name, arguments: JSON.stringify(args) };
}
export function callChunks(calls: ReturnType<typeof call>[]): StreamChunk[] {
  return [...calls.flatMap((block,index) => [
    {type:'block-start' as const,index,blockType:'tool-call' as const},
    {type:'block-end' as const,index,block},
  ]), {type:'finish',reason:{kind:'tool-calls'}}];
}
export const textChunks = (): StreamChunk[] => [{type:'block-start',index:0,blockType:'text'},
  {type:'block-end',index:0,block:{type:'text',text:'已根据内存工具结果整理简介。'}},{type:'finish',reason:{kind:'stop'}}];
export class MockAdapter extends LlmAdapter {
  readonly requests: GenerateOptions[]=[];
  observe?: (options:GenerateOptions)=>void;
  constructor(readonly responses: StreamChunk[][]) { super(); }
  async resolveModel(provider: string, model: string) { return {provider,id:model,name:model,defaultMaxTokens:128,context:{contextWindow:4096}}; }
  async *stream(options: GenerateOptions) { this.requests.push(options);this.observe?.(options);const chunks=this.responses.shift();
    if(!chunks)throw Error('fixture responses exhausted'); for(const c of chunks)yield c; }
}
// 工具只整理代码内字符串；没有文件读取能力。
export function infoTool(name='inspect_fixture', body?: (args: any, exec: any) => Promise<any>, extras: any={}) {
  return defineTool({name,description:'提取内存字符串的标签与字数，不读取文件',
    parameters:{input:{type:'object',required:true,additionalProperties:false,properties:{label:{type:'string',required:true}}}},
    output:{schema:{type:'object',additionalProperties:false,properties:{title:{type:'string',required:true},chars:{type:'integer',required:true}}},
      render: (_a,v) => [{type:'text',text:`${v.title}：${v.chars}字`}],
      presentationMeta: (_a,v) => ({label:v.title})},
    async execute(args,exec) { return body ? body(args,exec) : {title:args.input.label,chars:args.input.label.length}; }, ...extras});
}
export async function components() {
  const ctx=new Context(); await ctx.plugin(SystemPrompt); await ctx.plugin(ToolsService);
  const executor=new NativeToolExecutor(ctx); ctx.tools.setExecutor(executor);
  // 与官方 tool-calls.spec 同样，只为受控故障注入取实例私有字段；不是公开 API。
  const pipeline=executor['pipeline'];
  return {ctx,executor,pipeline,close:()=>ctx.fiber.dispose()};
}
export async function harness(adapter: MockAdapter, maxParallelToolCalls=2) {
  const ctx=new Context(), replay=new Context(), trace:any[]=[],prefixes:any[]=[],loopRequests:any[]=[];
  const record=(channel:string,type:string,data:any)=>trace.push({position:trace.length,channel,type,data:structuredClone(data)});
  const handles:any[]=[];
  for(const p of [LlmRuntime,SessionStore,SessionProjectionRegistry])await ctx.plugin(p as any);
  await replay.plugin(SessionStore); await ctx.plugin(SystemPrompt,{includeHarnessIdentity:false,personaPrefix:'整理项目资料。'});
  await ctx.plugin(ToolsService); let executor!:NativeToolExecutor;
  await ctx.plugin({inject:['tools'],apply(owner:Context){executor=new NativeToolExecutor(owner);owner.tools.setExecutor(executor);}});
  await ctx.plugin(AgentRegistry); await ctx.plugin(AgentLoop,{agents:[],maxParallelToolCalls});
  ctx.llm.registerAdapter(['fixture'],adapter);
  ctx.on('session/event',(_session,event)=>{record('session',event.type,{event});});
  ctx.on('agent/error',({error})=>{record('error','agent/error',{message:String(error)});});
  ctx.on('tools/result',(exec,result)=>{record('observer','tools/result',{callId:exec.callId,result});});
  adapter.observe=options=>{record('model','adapter.input',clean(options));};
  ctx.on('llm/stream',async function*(options,next){
    const agent=handles.find(h=>h.agent.id===options.sessionId)?.agent; assert.ok(agent);
    const events=agent.session.snapshotEvents();
    const rebuilt=replay.sessions.prepare(SessionId('prefix-'+prefixes.length),{seed:events});
    assert.deepEqual(rebuilt.deriveMessages(),options.messages);
    const header=rebuilt.requestHeader()!;
    for(const [k,v] of Object.entries(header.config))assert.deepEqual(options[k],v);
    assert.deepEqual(header.tools??[],options.tools??[]);assert.deepEqual(rebuilt.toolHistory(),options.toolHistory);
    prefixes.push({throughSeq:events.at(-1)?.seq,events,reconstruction:'PASS messages/config/tools/toolHistory'});
    loopRequests.push(clean(options));record('request','loop.input',{request:clean(options),throughSeq:events.at(-1)?.seq});yield* next();
  });
  async function create(id:string){const handle=await ctx.agents.create({sessionId:SessionId(id),agentOptions:{provider:'fixture',model:'scripted'}});handles.push(handle);return handle.agent;}
  return {ctx,trace,prefixes,loopRequests,create,record,pipeline:executor['pipeline'],
    capture(agent:any){return {facts:agent.session.snapshotEvents(),runtimeTrace:structuredClone(trace),prefixes,loopRequests,requests:adapter.requests.map(clean)};},
    async close(){for(const h of handles)await h.dispose();await replay.fiber.dispose();await ctx.fiber.dispose();}};
}
export async function send(agent:any){agent.followup(createUserMessage({content:[{type:'text',text:'整理 README 和 package.json 的内存替身。'}],source:{kind:'user'}}));await agent.whenIdle();}
export async function reached<T>(boundary:Promise<T>,work:Promise<unknown>){
  return Promise.race([boundary,work.then(()=>{throw Error('任务在到达门闩前已结束');})]);
}
