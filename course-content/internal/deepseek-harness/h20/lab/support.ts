import assert from 'node:assert/strict';
import {Context} from '@deepseek-ai/cordis';
import SessionStore,{SessionId,Session,ToolCallRecovery,interruptedTurnClosers} from '@deepseek-ai/dsh-session';
import LlmRuntime,{LlmAdapter,LlmError,resolveRetryPolicy,createUserMessage,createAssistantMessage,createToolResultMessage,ToolCallId} from '@deepseek-ai/dsh-llm';
import SessionProjectionRegistry from '@deepseek-ai/dsh-session-projection';
import SystemPrompt from '@deepseek-ai/dsh-system-prompt';
import ToolsService,{defineTool} from '@deepseek-ai/dsh-tools';
import {NativeToolExecutor} from '@deepseek-ai/dsh-tool-executor-native';
import AgentRegistry from '@deepseek-ai/dsh-agent';
import AgentLoop from '@deepseek-ai/dsh-agent-loop';
import * as Retry from '@deepseek-ai/dsh-llm-retry';
import * as Jsonl from '@deepseek-ai/dsh-session-persistence-jsonl';
import TokenMeter from '@deepseek-ai/dsh-token-meter';
import Basic from '@deepseek-ai/dsh-compaction-basic';
import {mkdtemp,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {Clock,pump,until,gate} from './clock.ts';
export {assert,SessionId,Session,ToolCallRecovery,interruptedTurnClosers,LlmError,resolveRetryPolicy,createAssistantMessage,createToolResultMessage,ToolCallId,gate,pump,until};
export const user=(text:string,kind='user')=>createUserMessage({source:{kind},content:[{type:'text',text}]});
export const text=(value='done')=>[{type:'text-delta',index:0,text:value},{type:'finish',reason:{kind:'stop'}}];
export const call=(names:string[])=>[...names.flatMap((name,index)=>[{type:'block-start',index,blockType:'tool-call'},{type:'block-end',index,block:{type:'tool-call',id:ToolCallId('call-'+index),name,arguments:'{}'}}]),{type:'finish',reason:{kind:'tool-calls'}}];
export const visible=(messages:any[])=>messages.flatMap(m=>m.content).filter(b=>b.type==='text').map(b=>b.text).join('\n');
export class Adapter extends LlmAdapter{
 requests:any[]=[];entries:any[]=[];policy:any;summaryCalls=0;
 override providerRetryPolicy(){return this.policy;}
 async resolveModel(provider:string,model:string){return {provider,id:model,name:model,context:{contextWindow:100000},defaultMaxTokens:128};}
 async *stream(options:any):AsyncGenerator<any>{
  this.requests.push(structuredClone({...options,signal:undefined}));
  if(options.purpose==='compaction'){this.summaryCalls++;yield*text('Goal: inspect fixture. Next: verify external state.');return;}
  const entry=this.entries.shift();assert.ok(entry,'bounded adapter script exhausted');
  if(entry instanceof Error)throw entry;
  yield* typeof entry==='function'?entry(options):entry;
 }
}
export async function fixture(options:{policy?:any;retry?:boolean;random?:()=>number;disk?:boolean;root?:string;downstream?:(p:any,next:any)=>any;compaction?:boolean}={}){
 const ctx=new Context();await ctx.plugin(SessionStore);const facts=new Map<string,any[]>(),frames:any[]=[],errors:any[]=[],counts={preStep:0,prepareCall:0,resolveTools:0,assemble:0,recovery:0};
 ctx.on('session/event',(s,e)=>{const a=facts.get(s.id)??[];a.push(e);facts.set(s.id,a);});
 let root=options.root;if(options.disk){assert.ok(process.env.H20_RUN_ROOT);root??=await mkdtemp(resolve(process.env.H20_RUN_ROOT!,'h20-jsonl-'));await ctx.plugin(Jsonl,{root,compression:'none'});}
 await ctx.plugin(LlmRuntime);await ctx.plugin(SessionProjectionRegistry);await ctx.plugin(SystemPrompt,{includeHarnessIdentity:false,personaPrefix:'Use only controlled fixture facts.'});await ctx.plugin(ToolsService);ctx.tools.setExecutor(new NativeToolExecutor(ctx));await ctx.plugin(AgentRegistry);await ctx.plugin(TokenMeter);
 const adapter=new Adapter();adapter.policy=resolveRetryPolicy(options.policy,'fixture.provider.retryPolicy');ctx.llm.registerAdapter(['fixture'],adapter);
 ctx.on('agent/pre-step',async(p,next)=>{counts.preStep++;return next();});ctx.on('agent/request-error',async(p,next)=>{counts.recovery++;return next();});
 let retryFiber:any;if(options.retry!==false)retryFiber=await ctx.plugin(Object.assign(async(inner:any)=>Retry.apply(inner,{}, {random:options.random??(()=>0.5)}),{inject:Retry.inject}));
 if(options.downstream)ctx.on('agent/request-error',options.downstream);
 if(options.compaction)await ctx.plugin(Basic,{auto:true,headroomTokens:0,maxTokens:256,retainTokens:80});
 await ctx.plugin(AgentLoop,{agents:[],maxParallelToolCalls:2});ctx.on('agent/assistant-stream',p=>frames.push(structuredClone(p.frame)));ctx.on('agent/error',p=>errors.push(String(p.error)));
 for(const [service,key,counter] of [[ctx.llm,'prepareCall','prepareCall'],[ctx.tools,'resolve','resolveTools'],[ctx.systemPrompt,'assemble','assemble']] as const){const original=(service as any)[key].bind(service);(service as any)[key]=(...args:any[])=>{counts[counter]++;return original(...args);};}
 const clock=new Clock();clock.install();const handles:any[]=[];
 const create=async(id='task')=>{const h=await ctx.agents.create({sessionId:SessionId(id),agentOptions:{provider:'fixture',model:'large'}});handles.push(h);return h.agent;};
 const tool=(name:string,execute:any,parallel=false)=>ctx.tools.register(defineTool({name,description:'Safe memory fixture '+name,parameters:{},...(parallel?{isConcurrencySafe:()=>true}:{}),output:{schema:{type:'string'},render:(_a:any,v:any)=>[{type:'text',text:v}]},execute} as any));
 return {ctx,adapter,facts,frames,errors,counts,clock,root,retryFiber,create,tool,handles,events:(a:any)=>facts.get(a.id)??[],async close(){for(const h of handles)await h.dispose();await ctx.fiber.dispose();clock.restore();}};
}
export const normal=(maxRetries=2,backoff:any={})=>({mode:'normal',maxRetries,backoff:{initialDelayMs:500,maxDelayMs:10000,jitterRatio:0,...backoff}});
export const failed=(code='RATE_LIMIT',extra:any={})=>new LlmError('controlled '+code,code,extra);
export const summary=(f:any,a:any)=>({events:f.events(a),requests:f.adapter.requests,frames:f.frames,errors:f.errors,counts:f.counts,delays:f.clock.delays,virtualMs:f.clock.now,surface:a.session.surface.nodes,messages:a.session.deriveMessages()});
export async function record(name:string,value:any){await writeFile(resolve(process.env.H20_RUN_ROOT!,'trace-'+name+'.json'),JSON.stringify(value,null,2)+'\n');}
