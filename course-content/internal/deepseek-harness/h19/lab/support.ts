import assert from 'node:assert/strict';
import {Context} from '@deepseek-ai/cordis';
import SessionStore,{Session,SessionId,canonicalHeader} from '@deepseek-ai/dsh-session';
import LlmRuntime,{LlmAdapter,createUserMessage,createSystemMessage,createAssistantMessage,createToolResultMessage,ToolCallId} from '@deepseek-ai/dsh-llm';
import SessionProjectionRegistry from '@deepseek-ai/dsh-session-projection';
import TokenMeter from '@deepseek-ai/dsh-token-meter';
import Basic from '@deepseek-ai/dsh-compaction-basic';
import Pruner from '@deepseek-ai/dsh-compaction-tool-result-pruner';
import * as Offload from '@deepseek-ai/dsh-compaction-image-offload';
import AgentRegistry from '@deepseek-ai/dsh-agent';
import AgentLoop from '@deepseek-ai/dsh-agent-loop';
import SystemPrompt from '@deepseek-ai/dsh-system-prompt';
import ToolsService,{defineTool} from '@deepseek-ai/dsh-tools';
import {NativeToolExecutor} from '@deepseek-ai/dsh-tool-executor-native';
import * as Jsonl from '@deepseek-ai/dsh-session-persistence-jsonl';
import {mkdtemp} from 'node:fs/promises';
import {resolve} from 'node:path';
export {assert,Session,SessionId,canonicalHeader,createAssistantMessage,createSystemMessage,createToolResultMessage,ToolCallId,Basic};
export const signal=()=>new AbortController().signal;
export const user=(text:string,content?:any[])=>createUserMessage({source:{kind:'user'},content:content??[{type:'text',text}]});
export const blocks=(text:string,finish:any={kind:'stop'})=>[{type:'text-delta',index:0,text},{type:'finish',reason:finish}];
export const textOf=(messages:any[])=>messages.flatMap(m=>m.content).filter(b=>b.type==='text').map(b=>b.text).join('\n');
export class Adapter extends LlmAdapter{
 requests:any[]=[]; summaries:any[]=[]; ordinary=0;
 summary='Goal: inspect fixture. Next: continue safely.';
 summaryMode='ok'; failure=''; gate?:Promise<void>; onSummary?:()=>void;
 async resolveModel(provider:string,model:string){return {provider,id:model,name:model,defaultMaxTokens:128,context:{contextWindow:model==='small'?2000:100000}};}
 override imageRequestPricing(_provider:string,model:string){return {priceImages:(images:any[])=>images.map(image=>({visualTokens:image.offloaded?0:model==='vision-big'?2000:100,text:image.offloaded?'omitted image':'image handle'}))};}
 async *stream(options:any):AsyncGenerator<any>{
  const captured=structuredClone({...options,signal:undefined});this.requests.push(captured);
  if(options.purpose==='compaction'){
   this.summaries.push(captured);this.onSummary?.();if(this.gate)await this.gate;options.signal?.throwIfAborted();
   if(this.summaryMode==='throw')throw Error('controlled summary failure');
   if(this.summaryMode==='image'){yield {type:'block-start',index:0,blockType:'image'};yield {type:'block-end',index:0,block:{type:'image',attachment:imageRef()}};}
   else if(this.summaryMode==='rich'){
    yield {type:'block-start',index:0,blockType:'reasoning'};yield {type:'block-end',index:0,block:{type:'reasoning',text:'private thought'}};
    yield {type:'block-start',index:1,blockType:'tool-call'};yield {type:'block-end',index:1,block:{type:'tool-call',id:ToolCallId('never-run'),name:'work',arguments:'{}'}};
    yield {type:'text-delta',index:2,text:this.summary};
   }else yield {type:'text-delta',index:0,text:this.summaryMode==='empty'?'':this.summary};
   yield {type:'finish',reason:{kind:this.summaryMode==='max'?'max-tokens':'stop'}};return;
  }
  this.ordinary++;
  if(this.failure==='always-overflow'||(this.failure==='overflow'&&this.ordinary===1)){
   yield {type:'finish',reason:{kind:'error',failure:{message:'controlled context overflow',code:'CONTEXT_WINDOW_EXCEEDED'}}};return;
  }
  if(this.failure==='server'){yield {type:'finish',reason:{kind:'error',failure:{message:'controlled failure',code:'SERVER'}}};return;}
  if(textOf([options.messages.at(-1)]).includes('RUN_TOOL')){
   yield {type:'block-start',index:0,blockType:'tool-call'};
   yield {type:'block-end',index:0,block:{type:'tool-call',id:ToolCallId('work-'+this.ordinary),name:'work',arguments:'{}'}};
   yield {type:'finish',reason:{kind:'tool-calls'}};return;
  }
  yield* blocks('fixture answer');
 }
}
export const imageRef=()=>({attachmentId:'sha256:'+ 'ab'.repeat(32),mediaType:'image/png',bytes:32,width:10,height:10,name:'fixture.png'});
export async function fixture(options:{loop?:boolean;disk?:boolean;auto?:boolean;policy?:any;pruner?:boolean}={}){
 const ctx=new Context();await ctx.plugin(SessionStore);const facts=new Map<string,any[]>();
 ctx.on('session/event',(s,e)=>{const a=facts.get(s.id)??[];a.push(e);facts.set(s.id,a);});
 let root:string|undefined;
 if(options.disk){assert.ok(process.env.H19_RUN_ROOT);root=await mkdtemp(resolve(process.env.H19_RUN_ROOT!,'h19-jsonl-'));await ctx.plugin(Jsonl,{root,compression:'none'});}
 await ctx.plugin(LlmRuntime);await ctx.plugin(SessionProjectionRegistry);await ctx.plugin(TokenMeter);
 const adapter=new Adapter();ctx.llm.registerAdapter(['fixture'],adapter);
 if(options.pruner)await ctx.plugin(Pruner,{thresholdChars:200,headChars:60,tailChars:60});
 await ctx.plugin(AgentRegistry);await ctx.plugin(Offload);
 await ctx.plugin(Basic,{auto:options.auto??false,headroomTokens:0,maxTokens:256,retainTokens:80,...options.policy});const compact=ctx.compaction;
 const errors:any[]=[];let bodies=0;
 if(options.loop){
  await ctx.plugin(SystemPrompt,{includeHarnessIdentity:false,personaPrefix:'Use only fixture material.'});
  await ctx.plugin(ToolsService);ctx.tools.setExecutor(new NativeToolExecutor(ctx));
  ctx.tools.register(defineTool({name:'work',description:'Read an in-memory fixture; no filesystem or network',parameters:{},output:{schema:{type:'string'},render:(_a,v)=>[{type:'text',text:v}]},async execute(){bodies++;return 'HEAD '+ 'tool body '.repeat(600)+' TAIL';}}));
  await ctx.plugin(AgentLoop,{agents:[]});ctx.on('agent/error',e=>errors.push(String(e.error)));
 }
 return {ctx,adapter,compact,facts,errors,root,bodies:()=>bodies,close:()=>ctx.fiber.dispose()};
}
// Legitimate component history; fixture appends are recorded as they commit.
export function history(ctx:any,id='history',length=2400,turns=3){
 const s=ctx.sessions.create(SessionId(id));
 for(let t=1;t<=turns;t++){
  s.append('turn/start',{turn:t});s.append('step/start',{turn:t,step:1});
  if(t===1){s.append('system/message',{turn:t,step:1,message:createSystemMessage('Use fixture facts.')},{surfaceOp:'append'});s.append('request/header',{header:canonicalHeader({config:{provider:'fixture',model:'large'}}),reason:'initial'});}
  s.append('user/message',user((t===1?'OLD_SENTINEL ':'RECENT_'+t+' ')+ 'x'.repeat(length)),{surfaceOp:'append'});
  s.append('assistant/message',{turn:t,step:1,message:createAssistantMessage({source:{provider:'fixture',model:'large'},content:[{type:'text',text:'answer '+t+' '+ 'y'.repeat(length)}]}),stream:[]},{surfaceOp:'append'});
  s.append('step/end',{turn:t,step:1});s.append('turn/end',{turn:t,reason:{kind:'completed'}});
 }
 return s;
}
export const componentAgent=(s:any)=>({session:s,options:{provider:'fixture',model:'large'}} as any);
export const open=(s:any)=>s.append('turn/start',{turn:4});
export function appendTool(s:any,text:string,content?:any[]){
 const turn=4,step=1,id=ToolCallId('fixture-tool');open(s);s.append('step/start',{turn,step});
 s.append('assistant/message',{turn,step,stream:[],message:createAssistantMessage({source:{provider:'fixture',model:'large'},content:[{type:'tool-call',id,name:'work',arguments:'{}'}]})},{surfaceOp:'append'});
 const call=s.append('tool/call',{turn,step,callId:id,name:'work',arguments:'{}'});
 return s.append('tool/result',{turn,step,message:createToolResultMessage({callId:id,content:content??[{type:'text',text}],isError:false})},{surfaceOp:'append',sourceEventSeqs:[call.seq]});
}
