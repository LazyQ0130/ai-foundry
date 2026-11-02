import assert from 'node:assert/strict';
import {test} from 'node:test';
import {flowPractice,type FlowCase} from './flow.ts';
import {failuresPractice,type FailureCase} from './failures.ts';
import {schedulingPractice,type ScheduleCase} from './scheduling.ts';
import {requestsPractice,type LoopCase} from './requests.ts';
import {components,infoTool,call,projectToolUpdates,ToolCallId} from './support.ts';
const stages=(r:any)=>r.trace.map((x:any)=>x.stage);
for(const kind of ['normal','deny','guard','ask','cancel','content','value','block','pre-throw','around-throw','project-throw','post-throw','final-throw','output-bad','observer-throw'] as FlowCase[])test('C-flow-'+kind,async()=>{
 const r=await flowPractice(kind),s=stages(r);assert.equal(r.observerSame,true);assert.equal(s.at(-1),'observe');
 assert.equal(r.result.isError,!['normal','observer-throw','content','value'].includes(kind));
 const obs=r.trace.at(-1);assert.equal(obs.execFrozen,true);assert.equal(obs.resultFrozen,true);assert.equal(obs.identitySet,false);
 assert.equal(r.bodies,['deny','guard','ask','cancel','pre-throw','around-throw'].includes(kind)?0:1);
 if(kind==='normal'||kind==='observer-throw')assert.deepEqual(s,['pre.enter','pre.return','guard','around.enter','body','render','meta','around.return','project','post','finalize','observe']);
 if(kind==='normal'){assert.deepEqual(r.result.value,{title:'README',chars:6});assert.equal(r.result.content[0].text,'final:project:README：6字');
  const pre=r.trace[0];assert.equal(pre.execFrozen,false);assert.equal(pre.callIdWritable,true);assert.equal(pre.argsFrozen,true);assert.equal(pre.nestedFrozen,true);}
 if(kind==='content'){assert.equal(r.result.content[0].text,'final:后置可见内容');assert.deepEqual(r.result.value,{title:'README',chars:6});assert.deepEqual(r.result.meta,{label:'README'});}
 if(kind==='value'){assert.deepEqual(r.result.value,{title:'policy',chars:6});assert.deepEqual(r.result.meta,{label:'policy'});assert.equal(s.filter((x:string)=>x==='render').length,2);assert.equal(r.result.content[0].text,'final:policy：6字');}
 if(kind==='block'){assert.equal(r.result.isError,true);assert.equal('value' in r.result,false);assert.equal('meta' in r.result,false);}
 if(['pre-throw','around-throw'].includes(kind)){assert.equal(s.includes('project'),false);assert.equal(s.includes('post'),false);}
 if(kind==='project-throw')assert.equal(s.includes('post'),false);
 if(kind==='final-throw'){assert.equal(s.filter((x:string)=>x==='finalize').length,1);assert.match(r.result.error?.message??'',/final failed/);}
 if(kind==='output-bad'){assert.equal(r.result.error?.info?.code,'INVALID_TOOL_OUTPUT');assert.equal(s.includes('render'),false);assert.ok(s.includes('post'));}
 if(kind==='cancel')assert.equal(r.result.error?.info?.code,'ABORTED_BEFORE_DISPATCH');
});
for(const kind of ['unknown','parse','args','deny','pre-abort','body-throw','output','post-throw','post-abort','pending-abort','pre-pending-abort','scheduler','signal-replace','snapshot'] as FailureCase[])test('C-failure-'+kind,async()=>{
 const r=await failuresPractice(kind) as any;
 if(kind==='scheduler'){assert.equal(r.error.name,'ToolBatchExecutionError');assert.match(r.error.cause,/prepare/);assert.equal(r.settledBeforeRelease,false);assert.ok(r.trace.includes('body.settled'));return;}
 const result=kind==='snapshot'?r.value:r.value.results[0].result;
 assert.equal(result.isError,true);
 const codes:any={unknown:'UNKNOWN_TOOL',parse:'INVALID_ARGS',args:'INVALID_ARGS','pre-abort':'ABORTED_BEFORE_DISPATCH',output:'INVALID_TOOL_OUTPUT','post-abort':'ABORTED','pending-abort':'ABORTED','pre-pending-abort':'ABORTED_BEFORE_DISPATCH','signal-replace':'ABORTED'};
 if(codes[kind])assert.equal(result.error?.info?.code,codes[kind]);
 assert.equal(r.bodies,['body-throw','output','post-throw','post-abort','pending-abort','signal-replace'].includes(kind)?1:0);
 if(['pending-abort','post-abort','pre-pending-abort','signal-replace'].includes(kind))assert.equal(r.settledBeforeRelease,false);
 if(['pending-abort','signal-replace'].includes(kind)){assert.equal(r.signalAborted,true);assert.ok(r.trace.indexOf('body.settled')<r.trace.findIndex((x:string)=>x.startsWith('observe:')));}
 if(kind==='pre-abort')assert.deepEqual(r.trace,[]);
 if(kind==='parse'||kind==='args'){assert.ok(r.trace.includes('pre'));assert.ok(r.trace.includes('around'));assert.ok(r.trace.includes('post'));}
});
test('C-policy outer waterfall may override deny; guard still denies',async()=>{
 const h=await components();let bodies=0;try{
  h.ctx.tools.register(infoTool('x',async()=>{bodies++;return{title:'x',chars:1};}));
  h.ctx.on('tools/pre-execute',async(_e,next)=>{await next();return{kind:'allow'};});
  h.ctx.on('tools/pre-execute',async()=>({kind:'deny',reason:'可扩展决策'}));
  const invoke=()=>h.ctx.tools.execute({calls:[call('p','x')],signal:new AbortController().signal});
  assert.equal((await invoke()).results[0].result.isError,false);
  h.ctx.tools.guard(()=> '最终所有者拒绝');
  h.ctx.on('tools/post-execute',async()=>({kind:'accept',value:{title:'非法复活',chars:4}}));
  const denied=(await invoke()).results[0].result;assert.equal(denied.isError,true);assert.match(denied.error?.message??'',/cannot replace the value of a failed result/);assert.equal(bodies,1);
 }finally{await h.close();}
});
test('C-snapshot detaches nested caller values and mints distinct tokens',async()=>{
 const h=await components();try{
  h.ctx.tools.register(infoTool());const args={input:{label:'README'}},signal=new AbortController().signal;
  const p=await h.pipeline.prepare({name:'inspect_fixture',callId:ToolCallId('snap'),arguments:args,signal});
  const q=await h.pipeline.prepare({name:'inspect_fixture',callId:ToolCallId('snap2'),arguments:args,signal});
  assert.equal(p.kind,'dispatch');assert.notEqual(p.exec.token,q.exec.token);assert.equal(typeof p.exec.token,'symbol');
  assert.notEqual(p.exec.arguments,args);args.input.label='CHANGED';assert.equal((p.exec.arguments as any).input.label,'README');
  assert.ok(Object.isFrozen((p.exec.arguments as any).input));
  for(const prepared of [p,q]){assert.equal(prepared.kind,'dispatch');const outcome=await h.pipeline.dispatch(prepared.exec);const r=await h.pipeline.complete(prepared.exec,outcome);assert.deepEqual((r as any).value,{title:'README',chars:6});}
 }finally{await h.close();}
});
test('C-batch rejects invalid parallel override before wrapping scheduler error',async()=>{
 const h=await components();try{for(const maxParallelToolCalls of [0,1.5])await assert.rejects(h.ctx.tools.execute({calls:[],signal:new AbortController().signal,maxParallelToolCalls}),RangeError);}finally{await h.close();}
});
for(const kind of ['parallel','limit-one','body-error','rolling','reclassify'] as ScheduleCase[])test('D-scheduling-'+kind,async()=>{
 const r=await schedulingPractice(kind),events=r.facts;
 const commits=r.trace.filter(x=>x.startsWith('commit:'));assert.deepEqual(commits,r.order.map(id=>'commit:'+id));
 assert.deepEqual(events.filter(e=>e.type==='tool/result').map(e=>e.data.message.toolCallId),r.order);
 assert.ok(r.trace.indexOf('start:C')>r.trace.indexOf('commit:B'));
 if(kind==='parallel'||kind==='body-error'){assert.ok(r.trace.indexOf('start:B')<r.trace.indexOf('end:A'));assert.ok(r.trace.indexOf('end:B')<r.trace.indexOf('end:A'));}
 if(kind==='limit-one'||kind==='reclassify')assert.ok(r.trace.indexOf('start:B')>r.trace.indexOf('commit:A'));
 if(kind==='rolling'){assert.ok(r.observedEarly.includes('start:D'));assert.ok(!r.observedEarly.includes('end:A'));assert.ok(!r.observedEarly.some(x=>x.startsWith('commit:')));}
 assert.equal(events.filter(e=>e.type==='step/start').length,2);assert.equal(r.requests.length,2);
 if(kind==='body-error')assert.equal(events.filter(e=>e.type==='tool/result')[1].data.message.isError,true);
 for(const [i,q] of r.loopRequests.entries()){const p=projectToolUpdates(q.messages,q.tools,undefined,q.toolHistory);assert.deepEqual(r.requests[i].messages,p.messages);assert.deepEqual(r.requests[i].tools,p.tools);}
});
for(const kind of ['success','deny','body-error','cancel','conclude','conclude-context','block-conclude','internal'] as LoopCase[])test('D-loop-'+kind,async()=>{
 const r=await requestsPractice(kind);assert.equal(r.summary.results.length,kind==='internal'?3:2);
 if(kind==='internal'){assert.deepEqual(r.summary.results.map(x=>x.code),[undefined,'TOOL_OUTCOME_UNKNOWN','TOOL_NOT_STARTED']);assert.equal(r.summary.turnEnd?.kind,'error');assert.equal(r.bodies,2);assert.equal(r.requests.length,1);}
 else if(kind==='cancel'){assert.equal(r.summary.turnEnd?.kind,'aborted');assert.equal(r.bodies,1);assert.equal(r.requests.length,1);assert.ok(r.trace.includes('settled:readme'));}
 else if(kind==='conclude'){assert.equal(r.requests.length,1);assert.equal(r.bodies,2);assert.equal(r.summary.turnEnd?.kind,'completed');}
 else{assert.equal(r.requests.length,2);assert.equal(r.summary.steps,2);assert.equal(r.summary.turnEnd?.kind,'completed');}
 const results=r.facts.filter(e=>e.type==='tool/result');
 for(const event of results){
  const observe=r.runtimeTrace.find(t=>t.channel==='observer'&&t.data.callId===event.data.message.toolCallId);
  const commit=r.runtimeTrace.find(t=>t.channel==='session'&&t.data.event.seq===event.seq);
  if(observe)assert.ok(observe.position<commit.position);
 }
 for(const e of results){assert.equal(Object.hasOwn(e.data.message,'value'),false);if(e.sourceEventSeqs){assert.equal(r.facts.find(f=>f.seq===e.sourceEventSeqs![0])?.type,'tool/call');}}
 if(kind==='success'){assert.equal(r.bodies,2);assert.ok(r.requests[1].messages.some(m=>m.role==='tool'));
  const user=r.facts.filter(e=>e.type==='user/message'&&e.data.source.kind==='h14-fixture');assert.equal(user.length,2);assert.ok(user[0].seq>results.at(-1)!.seq);}
 if(kind==='block-conclude'){assert.ok(r.observed.every(x=>x.result.isError));assert.ok(r.observed.every(x=>!x.result.additionalContexts?.some((m:any)=>m.content[0].text.startsWith('补充:'))));}
});
