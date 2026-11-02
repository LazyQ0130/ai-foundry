import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import AgentRegistry from '@deepseek-ai/dsh-agent';
import AgentLoop from '@deepseek-ai/dsh-agent-loop';
import {LlmAdapter,createUserMessage} from '@deepseek-ai/dsh-llm';
import SessionStore from '@deepseek-ai/dsh-session';
import Approval from '@deepseek-ai/dsh-user-approval';
import {defineTool} from '@deepseek-ai/dsh-tools';
import * as ToolFs from '@deepseek-ai/dsh-tool-fs';
import * as Observation from '@deepseek-ai/dsh-fs-observation-policy';
import WebRuntime from '@deepseek-ai/dsh-web';
import * as ToolWeb from '@deepseek-ai/dsh-tool-web';
// The runner copies these two unchanged helpers from H16 and records their origin/hash.
import {base,files,Context,SessionId,block} from './support.ts';
const clean=(v:any)=>structuredClone({...v,signal:undefined});
const chunks=(items:any[])=>[...items.flatMap((block,index)=>[{type:'block-start',index,blockType:'tool-call'},{type:'block-end',index,block}]),{type:'finish',reason:{kind:'tool-calls'}}];
const noop=(name:string,run:()=>any)=>defineTool({name,description:'Controlled audit fixture; no external operation',parameters:{},output:{schema:{type:'string'},render:(_a,v)=>[{type:'text',text:v}]},async execute(){return String(await run());}});
async function runLoop(label:string,ctx:any,cwd:string,steps:((options:any)=>any|Promise<any>)[]){
 class Adapter extends LlmAdapter{
  requests:any[]=[];
  async resolveModel(provider:string,model:string){return {provider,id:model,name:model,defaultMaxTokens:128,context:{contextWindow:16000},inputModalities:['text']};}
  async *stream(options:any){this.requests.push(clean(options));const callback=steps[this.requests.length-1];if(callback){yield* chunks(await callback(options)) as any;}else{yield* [{type:'block-start',index:0,blockType:'text'},{type:'block-end',index:0,block:{type:'text',text:'audit fixture settled'}},{type:'finish',reason:{kind:'stop'}}] as any;}}
 }
 const adapter=new Adapter(),replay=new Context(),loopRequests:any[]=[],prefixes:any[]=[],observed:any[]=[],errors:any[]=[];
 await ctx.plugin(AgentRegistry);await ctx.plugin(AgentLoop,{agents:[],maxParallelToolCalls:1});ctx.llm.registerAdapter(['fixture'],adapter);await replay.plugin(SessionStore);
 const handle=await ctx.agents.create({sessionId:SessionId('m4-'+label),meta:{cwd},agentOptions:{provider:'fixture',model:'text'}}),agent=handle.agent;
 ctx.on('agent/error',(e:any)=>errors.push(String(e.error)));
 ctx.on('tools/result',(exec:any,result:any)=>observed.push({callId:exec.callId,name:exec.name,result:structuredClone(result)}));
 ctx.on('llm/stream',async function*(options:any,next:any){
  const events=agent.session.snapshotEvents(),rebuilt=replay.sessions.prepare(SessionId(label+'-replay-'+prefixes.length),{seed:events}),header=rebuilt.requestHeader()!;
  assert.deepEqual(rebuilt.deriveMessages(),options.messages);for(const [k,v]of Object.entries(header.config))assert.deepEqual(options[k],v);
  assert.deepEqual(header.tools??[],options.tools??[]);assert.deepEqual(rebuilt.toolHistory(),options.toolHistory);
  prefixes.push({events,reconstruction:'PASS messages/config/tools/toolHistory, second actual Session'});loopRequests.push(clean(options));yield* next();
 });
 try{
  agent.followup(createUserMessage({source:{kind:'user'},content:[{type:'text',text:'Use only the controlled audit fixtures.'}]}));await agent.whenIdle();
  const out={label,requests:adapter.requests,loopRequests,prefixes,observed,errors,facts:agent.session.snapshotEvents()};
  await writeFile(resolve(process.env.AUDIT_EVIDENCE!,`cross-${label}.json`),JSON.stringify(out,null,2)+'\n');assert.deepEqual(errors,[]);return out;
 }finally{await handle.dispose();await replay.fiber.dispose();}
}
const results=(r:any)=>r.facts.filter((e:any)=>e.type==='tool/result');
function verifyPairs(r:any,n:number){const calls=r.facts.filter((e:any)=>e.type==='tool/call'),rs=results(r);assert.equal(calls.length,n);assert.equal(rs.length,n);for(let i=0;i<n;i++)assert.equal(calls[i].data.callId,rs[i].data.message.toolCallId);}
test('D cross A: schema-visible, approved once, guard denies body, Session result reaches next request',async()=>{
 const h=await base();let bodies=0;const trace:string[]=[];
 try{
  await h.ctx.plugin(Approval);h.ctx.tools.register(noop('audit_sum',()=>{bodies++;return 'unreachable';}));
  h.ctx.on('tools/pre-execute',()=>{trace.push('pre ask');return {kind:'ask',reason:'one controlled action'};});
  h.ctx.on('approval/request',()=>{trace.push('allowed-once');return 'allowed-once';});
  h.ctx.tools.guard(()=>{trace.push('guard deny');return 'controlled owner denial';});
  const r=await runLoop('A',h.ctx,process.cwd(),[o=>{assert.ok(o.tools.some((t:any)=>t.name==='audit_sum'));return [block('audit_sum',{},'visible-denied')];}]);
  verifyPairs(r,1);assert.equal(bodies,0);assert.deepEqual(trace,['pre ask','allowed-once','guard deny']);assert.equal(results(r)[0].data.message.isError,true);
  assert.equal(r.requests.length,2);assert.ok(r.requests[1].messages.some((m:any)=>m.role==='tool'&&m.toolCallId==='visible-denied'&&m.isError));
  const audit=r.facts.filter((e:any)=>e.type.startsWith('approval/'));assert.equal(audit.filter((e:any)=>e.type==='approval/asked').length,1);assert.equal(audit.find((e:any)=>e.type==='approval/decided').data.outcome,'allowed-once');
  await writeFile(resolve(process.env.AUDIT_EVIDENCE!,'cross-A-body.json'),JSON.stringify({bodies,trace,audit},null,2)+'\n');
 }finally{await h.close();}
});
test('D cross B: actual File tools reject unseen/stale edits, reread recovers, complete Session pairing',async()=>{
 const h=await base(),f=await files(h.ctx);
 try{
  await writeFile(f.file,'state=initial\n');await h.ctx.plugin(Observation);await h.ctx.plugin(ToolFs,{readImage:false});
  const edit=(old_string:string,new_string:string,id:string)=>[block('edit',{file_path:'fixture.txt',old_string,new_string},id)];
  const read=(id:string)=>[block('read',{file_path:'fixture.txt'},id)];
  const r=await runLoop('B',h.ctx,f.root,[()=>edit('initial','forbidden','unseen'),()=>read('read-initial'),()=>edit('initial','one','edit-one'),()=>read('read-one'),async()=>{await writeFile(f.file,'state=external-change-longer\n');return edit('one','forbidden','stale');},()=>read('reread-external'),()=>edit('external-change-longer','recovered','edit-recovered'),()=>read('verify')]);
  verifyPairs(r,8);const at=(id:string)=>r.observed.find((e:any)=>e.callId===id).result;
  assert.equal(at('unseen').error.info.code,'FS_NOT_OBSERVED');assert.equal(at('stale').error.info.code,'FS_STALE_VERSION');
  for(const id of ['read-initial','edit-one','read-one','reread-external','edit-recovered','verify'])assert.equal(at(id).isError,false,id);
  assert.equal(await readFile(f.file,'utf8'),'state=recovered\n');assert.equal(r.requests.length,9);assert.equal(r.requests[8].messages.filter((m:any)=>m.role==='tool').length,8);
  await writeFile(resolve(process.env.AUDIT_EVIDENCE!,'cross-B-file.json'),JSON.stringify({fixture:f.root,final:'state=recovered\n',externalMutation:'node writeFile on one newly created fixture; bypasses observation, not a native Shell test'},null,2)+'\n');
 }finally{await h.close();await f.cleanup();}
});
test('D cross C: real Web Step admission changes with ready; unavailable stays registered and fails on call',async()=>{
 const h=await base();let ready=true,available=true,providerCalls=0;const state:any[]=[];
 try{
  await h.ctx.plugin(WebRuntime);h.ctx.web.registerSearchProvider({id:'offline',available:()=>available,ready:async()=>ready,async search(){providerCalls++;ready=false;return {content:'offline data',sources:[],truncated:false};}});
  await h.ctx.plugin(ToolWeb,{fetch:false});h.ctx.tools.register(noop('audit_checkpoint',()=>{ready=true;available=false;return 'provider unavailable';}));
  const names=(o:any)=>o.tools.map((t:any)=>t.name).sort();
  const r=await runLoop('C',h.ctx,process.cwd(),[o=>{state.push({ready,available,schemas:names(o)});assert.ok(names(o).includes('web_search'));return [block('web_search',{queries:['offline']},'ready-search')];},o=>{state.push({ready,available,schemas:names(o)});assert.deepEqual(names(o),['audit_checkpoint']);return [block('audit_checkpoint',{},'checkpoint')];},o=>{state.push({ready,available,schemas:names(o)});assert.ok(names(o).includes('web_search'));return [block('web_search',{queries:['offline']},'unavailable-search')];}]);
  verifyPairs(r,3);assert.equal(providerCalls,1);assert.equal(r.observed.find((e:any)=>e.callId==='unavailable-search').result.error.info.code,'WEB_PROVIDER_UNAVAILABLE');
  assert.ok(h.ctx.tools.schemas().some(t=>t.name==='web_search'));assert.equal(r.requests.length,4);
  await writeFile(resolve(process.env.AUDIT_EVIDENCE!,'cross-C-state.json'),JSON.stringify({state,providerCalls,globalRegistrationRetained:true,networkRequests:0},null,2)+'\n');
 }finally{await h.close();}
});
