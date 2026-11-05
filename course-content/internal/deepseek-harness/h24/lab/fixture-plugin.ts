// Author-owned safe boundary. Core plugins themselves are loaded by the real Loader YAML.
import type {Context} from '@deepseek-ai/cordis';
import {defineTool} from '@deepseek-ai/dsh-tools';
import {writeFile,readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
export const name='h24-safe-fixture',inject=['llm','tools','sessions','workingDirectory'];
export async function apply(ctx:Context,config:any){
 const {MockAdapter,textResponse,toolCallResponse}=await import(pathToFileURL(resolve(process.env.HARNESS_SOURCE_CACHE!,'packages/core/agent-loop/tests/mock-adapter.ts')).href);
 const calls:any[]=[],events:any[]=[],requests:any[]=[];let writes=0;let replay:any;
 const adapter=new MockAdapter(config.fault==='cancel'?['hang']:[toolCallResponse('fixture-call','write_fixture',{text:'mode=safe\n'}),textResponse('I changed config.txt to mode=safe.')]);
 if(config.replay){const {installLlmReplay}=await import('@deepseek-ai/dsh-llm-replay');replay=installLlmReplay(ctx,{file:config.replay,providers:[{id:'fixture',name:'Fixture',models:[{id:'fixture'}]}]});}
 else if(config.endpoint){
  const undici=await import('undici');const prior=undici.getGlobalDispatcher(),dispatcher=new undici.Agent({connections:1});undici.setGlobalDispatcher(dispatcher);ctx.effect(()=>async()=>{await dispatcher.close();undici.setGlobalDispatcher(prior);});
  const {DeepSeekAdapter}=await import(pathToFileURL(resolve(process.env.HARNESS_SOURCE_CACHE!,'packages/llm/llm-deepseek/src/adapter.ts')).href);
  const {resolveAdapterOptions}=await import('@deepseek-ai/dsh-llm-deepseek');
  const remote=new DeepSeekAdapter({options:()=>resolveAdapterOptions({baseURL:config.endpoint,models:[{id:'fixture'}],thinking:'disabled',reasoningEffort:'off',maxTokens:128,streamIdleTimeoutMs:1000,retryPolicy:{mode:'normal',maxRetries:1,backoff:{initialDelayMs:1,maxDelayMs:config.fault==='retry-ceiling'?1:1000,jitterRatio:0}}}),resolveAuth:async()=>({headers:{'x-api-key':'h24-local-only','connection':'close'}}),resolveUserId:()=> 'h24-fictional-user',prepareExtensions:async()=>({fields:{},accept:async()=>{}})});
  ctx.llm.registerAdapter(['fixture'],remote);
 }else ctx.llm.registerAdapter(['fixture'],adapter);
 ctx.on('llm/stream',async function*(options:any,next:any){requests.push(structuredClone({...options,signal:undefined}));if(config.fault==='cancel')await writeFile(resolve(config.root,'model-entered'),'ready');yield*next();});
 if(config.fault==='deny')ctx.tools.guard(()=> 'H24 controlled deny');
 ctx.tools.register(defineTool({name:'write_fixture',description:'Write one new fixture config file.',parameters:{text:{type:'string',enum:['mode=safe\n'],required:true}},output:{schema:{type:'object',properties:{written:{type:'boolean',required:true}},additionalProperties:false},render:(_args:any,value:any)=>[{type:'text',text:JSON.stringify(value)}]},execute:async(args:any)=>{calls.push(args);if(config.fault==='tool-error')throw Error('H24 controlled tool failure');await writeFile(resolve(config.workspace,'config.txt'),args.text);writes++;return {written:true};}}));
 ctx.on('session/event',(session,event)=>events.push({sessionId:session.id,event}));
 ctx.effect(()=>async()=>{let replayConsumption:any;try{replay?.assertConsumed();replayConsumption=replay?'complete':undefined;}catch(e){replayConsumption=String(e);}await writeFile(resolve(config.root,'runtime-trace.json'),JSON.stringify({pid:process.pid,writes,calls,requests,events,replayConsumption},null,2)+'\n');});
}
