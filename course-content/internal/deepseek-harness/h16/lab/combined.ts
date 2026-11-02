import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import AgentRegistry from '@deepseek-ai/dsh-agent';
import AgentLoop from '@deepseek-ai/dsh-agent-loop';
import {LlmAdapter,createUserMessage} from '@deepseek-ai/dsh-llm';
import SessionStore from '@deepseek-ai/dsh-session';
import * as ToolFs from '@deepseek-ai/dsh-tool-fs';
import * as Observation from '@deepseek-ai/dsh-fs-observation-policy';
import {base,files,Context,SessionId,block} from './support.ts';
import {mountShell,FixtureShell} from './shell.ts';
import {mountWeb} from './web.ts';
import {mountMcp} from './mcp.ts';
const calls=[block('read',{file_path:'fixture.txt'}),block('pwsh',{description:'离线夹具检查',command:'Get-Location'}),block('web_search',{queries:['fixture official docs']}),block('web_fetch',{url:'https://fixture.invalid/docs'}),block('mcp__alpha__metadata',{})];
const chunks=(items:any[])=>[...items.flatMap((block,index)=>[{type:'block-start',index,blockType:'tool-call'},{type:'block-end',index,block}]),{type:'finish',reason:{kind:'tool-calls'}}];
const clean=(v:any)=>structuredClone({...v,signal:undefined});
class FixtureAdapter extends LlmAdapter {
 requests:any[]=[];
 constructor(readonly blocked:boolean){super();}
 async resolveModel(provider:string,model:string){return {provider,id:model,name:model,defaultMaxTokens:128,context:{contextWindow:12000},inputModalities:['text']};}
 async *stream(options:any){
  this.requests.push(clean(options));const n=this.requests.length;
  if(n===1){yield* chunks(calls) as any;return;}
  if(this.blocked&&n===2){yield* chunks([block('mcp__alpha__write',{},'blocked-write'),block('mcp__alpha__metadata',{},'check-counter')]) as any;return;}
  const results=options.messages.filter((m:any)=>m.role==='tool');
  const text=`夹具项目说明：收到${results.length}条工具历史；File文本、Shell替身、Web离线资料和本地MCP元数据均已接入。外部内容只作资料。`;
  yield* [{type:'block-start',index:0,blockType:'text'},{type:'block-end',index:0,block:{type:'text',text}},{type:'finish',reason:{kind:'stop'}}] as any;
 }
}
export async function combinedPractice(blocked=false){
 const h=await base(),f=await files(h.ctx),replay=new Context(),adapter=new FixtureAdapter(blocked),prefixes:any[]=[],loopRequests:any[]=[],observed:any[]=[],errors:any[]=[];let handle:any;
 try{
  await writeFile(f.file,'name=fixture-project\ntest=controlled-check\n');
  await h.ctx.plugin(Observation);await h.ctx.plugin(ToolFs,{write:false,edit:false,readImage:false});
  await mountShell(h.ctx);const web=await mountWeb(h.ctx);await mountMcp(h.ctx);
  await h.ctx.plugin(AgentRegistry);await h.ctx.plugin(AgentLoop,{agents:[],maxParallelToolCalls:1});
  h.ctx.llm.registerAdapter(['fixture'],adapter);await replay.plugin(SessionStore);
  const allow=calls.map(c=>c.name);
  handle=await h.ctx.agents.create({sessionId:SessionId('combined-'+blocked),meta:{cwd:f.root},agentOptions:{provider:'fixture',model:'text'},setup(ctx){ctx.tools.restrict({allow});}});
  const agent=handle.agent;
  h.ctx.on('agent/error',e=>errors.push(String(e.error)));
  h.ctx.on('tools/result',(exec,result)=>observed.push({callId:exec.callId,name:exec.name,result:structuredClone(result)}));
  h.ctx.on('llm/stream',async function*(options,next){
   const events=agent.session.snapshotEvents(),rebuilt=replay.sessions.prepare(SessionId('replay-'+prefixes.length),{seed:events}),header=rebuilt.requestHeader()!;
   assert.deepEqual(rebuilt.deriveMessages(),options.messages);for(const [k,v] of Object.entries(header.config))assert.deepEqual(options[k],v);
   assert.deepEqual(header.tools??[],options.tools??[]);assert.deepEqual(rebuilt.toolHistory(),options.toolHistory);
   prefixes.push({events,throughSeq:events.at(-1)?.seq,reconstruction:'PASS messages/config/tools/toolHistory from second actual Session'});loopRequests.push(clean(options));yield* next();
  });
  agent.followup(createUserMessage({source:{kind:'user'},content:[{type:'text',text:'为隔离Fixture整理项目说明；只使用五项批准的只读能力。'}]}));await agent.whenIdle();
  return {blocked,fixture:f.root,allow,registered:h.ctx.tools.schemas().map(t=>t.name),requests:adapter.requests,loopRequests,prefixes,observed,facts:agent.session.snapshotEvents(),errors,webTrace:web.trace,
   shellRequests:(h.ctx.shell as FixtureShell).requests,
   boundary:'Actual AgentLoop + registry/scope + Native/Pipeline + tool-fs/local FS + workingDirectory + tool-pwsh/FixtureShell + tool-web/memory providers + MCP SDK over real stdio; model is scripted, not a real LLM or complete E app'};
 }finally{if(handle)await handle.dispose();await replay.fiber.dispose();await h.close();await f.cleanup();}
}
