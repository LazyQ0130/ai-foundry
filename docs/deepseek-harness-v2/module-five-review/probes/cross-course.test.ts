import {test} from 'node:test';
import {fixture,assert,user,text,call,failed,normal,summary,record,Session,SessionId} from './support.ts';
import Basic from '@deepseek-ai/dsh-compaction-basic';
import * as Retry from '@deepseek-ai/dsh-llm-retry';
// Uses the byte-identical H20 support/clock/bootstrap copied to an isolated root.
// Only the registration order and provider policy differ; algorithms stay upstream.
for(const order of ['retry-first','basic-first']){
 test('D order '+order+': custom normal admits overflow',async()=>{
  const f=await fixture({retry:false,policy:{...normal(1),retryableCodes:['CONTEXT_WINDOW_EXCEEDED']}});
  try{
   const retry=()=>f.ctx.plugin(Object.assign(async(inner:any)=>Retry.apply(inner,{}, {random:()=>0.5}),{inject:Retry.inject}));
   const basic=()=>f.ctx.plugin(Basic,{auto:true,headroomTokens:0,maxTokens:256,retainTokens:80,maxOverflowRetries:1});
   if(order==='retry-first'){await retry();await basic();}else{await basic();await retry();}
   const a=await f.create('order-'+order);a.inject(user('OLD '+ 'context '.repeat(1500),'fixture-context'));
   f.adapter.entries=[failed('CONTEXT_WINDOW_EXCEEDED'),text('ok')];a.followup(user('continue'));await f.clock.idle(a);
   const out=summary(f,a),plans=out.events.filter((e:any)=>e.type==='llm/retry');
   assert.equal(f.errors.length,0);assert.equal(f.adapter.requests.filter((r:any)=>r.purpose!=='compaction').length,2);
   assert.equal(plans.length,order==='retry-first'?1:0);assert.equal(f.adapter.summaryCalls,order==='basic-first'?1:0);
   await record('M5-'+order,out);
  }finally{await f.close();}
 });
}
test('D independent budgets: normal exhaustion delegates to fresh overflow recovery',async()=>{
 const f=await fixture({retry:false,policy:{...normal(1),retryableCodes:['CONTEXT_WINDOW_EXCEEDED']}});
 try{
  await f.ctx.plugin(Object.assign(async(inner:any)=>Retry.apply(inner,{}, {random:()=>0.5}),{inject:Retry.inject}));
  await f.ctx.plugin(Basic,{auto:true,headroomTokens:0,maxTokens:256,retainTokens:80,maxOverflowRetries:1});
  const a=await f.create('independent');a.inject(user('OLD '+ 'context '.repeat(1500),'fixture-context'));
  f.adapter.entries=[failed('CONTEXT_WINDOW_EXCEEDED'),failed('CONTEXT_WINDOW_EXCEEDED'),text('ok')];a.followup(user('continue'));await f.clock.idle(a);
  const out=summary(f,a);assert.equal(f.errors.length,0);assert.equal(f.adapter.requests.filter((r:any)=>r.purpose!=='compaction').length,3);
  assert.equal(out.events.filter((e:any)=>e.type==='llm/retry').length,1);assert.equal(f.adapter.summaryCalls,1);
  assert.equal(out.events.filter((e:any)=>e.type==='assistant/attempt').length,2);assert.equal(out.events.filter((e:any)=>e.type==='step/start').length,1);
  assert.equal(f.counts.preStep,1);assert.equal(f.counts.assemble,1);
  // Rebuild each request from the exact committed prefix captured at llm/stream.
  // Capturing happens below in a dedicated test, never from the final log alone.
  await record('M5-independent',out);
 }finally{await f.close();}
});
test('D retry requests reconstruct from exact event prefixes without failed fragments',async()=>{
 const f=await fixture({policy:normal(1),disk:true});const prefixes:any[]=[];
 try{
  f.ctx.on('llm/stream',async function*(options,next){
   const events=[...f.facts.values()].flat();
   const rebuilt=Session.create(SessionId('prefix-'+prefixes.length),events);
   assert.deepEqual(rebuilt.deriveMessages(),options.messages);
   const header=rebuilt.requestHeader()!;for(const [k,v] of Object.entries(header.config))assert.deepEqual((options as any)[k],v);
   assert.deepEqual(header.tools??[],options.tools??[]);assert.deepEqual(rebuilt.toolHistory(),options.toolHistory);
   prefixes.push({events,request:{...options,signal:undefined},header});yield*next();
  });
  const a=await f.create('prefix-retry');f.adapter.entries=[async function*(){yield {type:'text-delta',index:0,text:'DO_NOT_REPLAY'};throw failed('TRANSPORT');},text('ok')];a.followup(user('inspect'));
  await f.clock.idle(a);assert.equal(prefixes.length,2);assert.equal(f.errors.length,0);
  assert.equal(await f.ctx.sessions.flush(a.session),true);
  const reader=await f.ctx.sessionPersistence.open(a.id,'read');let saved:any;try{saved=await reader.read();}finally{await reader.close();}
  assert.deepEqual(saved.events,f.events(a));
  assert.ok(!JSON.stringify(prefixes[1].request.messages).includes('DO_NOT_REPLAY'));
  await record('M5-prefix',{...summary(f,a),prefixes,saved,root:f.root});
 }finally{await f.close();}
});
test('D full chain: tool history, compaction, persisted retry, new backend resume and continue',async()=>{
 const f=await fixture({disk:true,compaction:true,policy:normal(1)});let saved:any,before:any,bodies=0,compact:any;
 const prefixes:any[]=[];
 const capture=(owner:any,agent:any)=>owner.ctx.on('llm/stream',async function*(options:any,next:any){
  if(options.purpose!=='compaction'){
   const events=agent.session.snapshotEvents(),rebuilt=Session.create(SessionId('whole-prefix-'+prefixes.length),events),header=rebuilt.requestHeader()!;
   assert.deepEqual(rebuilt.deriveMessages(),options.messages);
   for(const [k,v] of Object.entries(header.config))assert.deepEqual(options[k],v);
   assert.deepEqual(header.tools??[],options.tools??[]);assert.deepEqual(rebuilt.toolHistory(),options.toolHistory);
   prefixes.push({cutoff:events.length,nodes:rebuilt.surface.nodes,request:{...options,signal:undefined},header});
  }
  yield*next();
 });
 try{
  f.tool('inspect',async()=>{bodies++;return 'TOOL_ORIGINAL '+ 'safe fixture '.repeat(500);});
  const a=await f.create('whole-agent');capture(f,a);f.adapter.entries=[call(['inspect']),text('first answer'),failed('TRANSPORT'),text('second answer')];
  a.followup(user('OLD_ORIGINAL '+ 'history '.repeat(1500)));await f.clock.idle(a);assert.equal(bodies,1);
  const prefix=[...f.events(a)];compact=await f.ctx.compaction.compactNow(a,new AbortController().signal);assert.ok(compact);
  assert.deepEqual(f.events(a).slice(0,prefix.length),prefix);
  assert.ok(!JSON.stringify(a.session.deriveMessages()).includes('TOOL_ORIGINAL'));
  a.followup(user('SECOND_TASK'));await f.clock.idle(a);assert.equal(f.errors.length,0);
  assert.equal(await f.ctx.sessions.flush(a.session),true);
  const r=await f.ctx.sessionPersistence.open(a.id,'read');try{saved={header:r.header,...await r.read()};}finally{await r.close();}
  before=summary(f,a);assert.deepEqual(saved.events,before.events);
  assert.equal(saved.events.filter((e:any)=>e.type==='llm/retry').length,1);
 }finally{await f.close();}
 const next=await fixture({disk:true,root:f.root,compaction:true,policy:normal(1)});let h:any;
 try{
  h=await next.ctx.agents.resume({resumeSessionId:saved.header.id,agentOptions:{provider:'fixture',model:'large'}});
  const a=h.agent;capture(next,a);assert.deepEqual(a.session.deriveMessages(),before.messages);assert.equal(next.adapter.requests.length,0);assert.equal(bodies,1);
  next.adapter.entries=[text('after reopen')];a.followup(user('THIRD_TASK'));await next.clock.idle(a);
  assert.deepEqual(next.errors,[]);assert.equal(next.adapter.requests.length,1);assert.ok(JSON.stringify(next.adapter.requests[0].messages).includes('<compacted-summary>'));
  assert.ok(!JSON.stringify(next.adapter.requests[0].messages).includes('OLD_ORIGINAL'));assert.equal(bodies,1);
  await next.ctx.sessions.flush(a.session);const r=await next.ctx.sessionPersistence.open(a.id,'read');let after:any;
  try{after=await r.read();}finally{await r.close();}
  assert.deepEqual(after.events.slice(0,saved.events.length),saved.events);
  assert.deepEqual(prefixes.map(p=>p.cutoff),[8,13,26,29,40]);
  assert.deepEqual(prefixes.map(p=>p.nodes),[[4,5],[4,5,8,10],[4,18,13,24],[4,18,13,24],[4,18,13,24,29,37,39]]);
  await record('M5-whole',{root:f.root,compact,saved,before,after,continued:summary(next,a),prefixes,bodies,scope:'same-process new backend; scripted adapter; memory-only tool effect; not E or a process-crash test'});
 }finally{await h?.dispose();await next.close();}
});
