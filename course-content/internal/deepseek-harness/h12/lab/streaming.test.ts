import test from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { BlockAssembler, AssistantStreamAccumulator, expandAssistantStream, assembleAssistantStream, LlmAdapter, ScriptedAdapter, LlmError, ReasoningEffortId, ToolCallId, createAssistantMessage, createToolResultMessage, runtime, collect, sequence, textChunks, toolChunks, gate, type StreamChunk } from './support.ts';
import { iterablePractice } from './iterable.ts';
import { assemblyPractice } from './assembly.ts';
import { runtimePractice } from './runtime.ts';
import { settlementPractice, type Scenario } from './settlement.ts';
const opts = (provider = 'fixture') => ({ provider, model: 'm', messages: [] });
const fold = (chunks: StreamChunk[]) => { const a = new BlockAssembler(); chunks.forEach(c => a.push(c)); return a; };
const code = (wanted: string) => (e: any) => e.code === wanted;
test('A01 minimal AsyncIterable yields one accumulated state per piece', async () => { assert.deepEqual(await iterablePractice(), ['请','请读','请读README']); });
test('C01 segmented text progresses without premature completion; absent finish defaults to stop', () => {
  const a = new BlockAssembler(); a.push({ type:'text-delta',index:0,text:'读' }); assert.deepEqual(a.blocks(),[{type:'text',text:'读'}]);
  assert.deepEqual(a.finish,{kind:'stop'}); assert.equal(a.usage,undefined); a.push({type:'text-delta',index:0,text:'README'}); assert.equal((a.blocks()[0] as any).text,'读README');
});
test('C02 interleaved indexes retain first-seen order, reasoning and raw tool JSON separately', () => {
  const r=assemblyPractice(); assert.deepEqual(r.blocks.map(b=>b.type),['text','reasoning','tool-call']);
  assert.equal((r.blocks[0] as any).text,'先读README'); assert.equal((r.blocks[2] as any).arguments,'{"path":"README.md"}');
  assert.deepEqual(r.usage,{inputTokens:10,outputTokens:6}); assert.deepEqual(r.finish,{kind:'tool-calls'}); assert.equal(r.states.length,r.chunks.length);
});
test('C03 first block-end is authoritative and ignores later deltas and re-close', () => {
  const a=fold([{type:'text-delta',index:3,text:'delta'}, {type:'block-end',index:3,block:{type:'text',text:'authoritative'}},
    {type:'text-delta',index:3,text:'late'}, {type:'block-end',index:3,block:{type:'text',text:'wrong'}}]);
  assert.deepEqual(a.blocks(),[{type:'text',text:'authoritative'}]);
});
test('C04 max-tokens drops every tool including closed valid JSON and aligns replay metadata', () => {
  const r=assemblyPractice('max-tokens'); assert.deepEqual(r.blocks.map(b=>b.type),['text','reasoning']); assert.deepEqual(r.replay?.blocks,['text-meta','reason-meta']);
  const a=fold([...toolChunks().slice(0,4),{type:'finish',reason:{kind:'max-tokens'}}]); assert.deepEqual(a.blocks(),[]);
});
test('C05 interrupted prefix keeps nonblank open/closed text and reasoning, omits every tool', () => {
  const a=fold([{type:'text-delta',index:9,text:' \n'}, {type:'reasoning-delta',index:4,text:'thinking'}, ...toolChunks().slice(0,4), {type:'text-delta',index:2,text:'partial'}]);
  assert.deepEqual(a.interruptedBlocks(),[{type:'reasoning',text:'thinking'},{type:'text',text:'partial'}]);
});
test('C06 incomplete unknown block fails normal assembly but interrupted prefix omits it', () => {
  const a=fold([{type:'block-start',index:0,blockType:'future'} as any]); assert.throws(()=>a.blocks(),/incomplete block/); assert.deepEqual(a.interruptedBlocks(),[]);
});
test('C07 misaligned replay entries discard metadata without discarding content', () => {
  const a=fold([{type:'text-delta',index:0,text:'x'}, {type:'finish',reason:{kind:'stop'},replayState:{response:{},blocks:[]}}]); assert.equal(a.replayState,undefined); assert.equal(a.blocks().length,1);
});
test('C08 message and tool result are distinct frozen identified role values', () => {
  const content:any[]=[{type:'tool-call',id:ToolCallId('t'),name:'read',arguments:'{ "n": 1 }'}];
  const m=createAssistantMessage({content,source:{provider:'p',model:'m'}}); content[0].arguments='changed';
  const result=createToolResultMessage({callId:ToolCallId('t'),content:[{type:'text',text:'ok'}],isError:false});
  assert.equal((m.content[0] as any).arguments,'{ "n": 1 }'); assert.equal(result.role,'tool'); assert.equal(result.toolCallId,'t'); assert.notEqual(m.id,result.id); assert.ok(Object.isFrozen(m.content[0]));
});
test('C09 compact runs preserve original delta boundaries/timestamps and equal expanded assembly', () => {
  const input=[{time:100,chunk:{type:'text-delta',index:0,text:'a'}},{time:105,chunk:{type:'text-delta',index:0,text:'b'}},{time:103,chunk:{type:'text-delta',index:0,text:'c'}}] as any;
  const a=new AssistantStreamAccumulator(); input.forEach((c:any)=>a.push(c)); const compact=a.snapshot();
  assert.equal(compact.length,1); assert.deepEqual((compact[0] as any).dt,[5,-2]); assert.deepEqual(expandAssistantStream(compact),input); assert.equal((assembleAssistantStream(compact).blocks()[0] as any).text,'abc');
});
test('C10 compact snapshots detach chunks and earlier snapshots from later pushes', () => {
  const usage={inputTokens:3,outputTokens:2},a=new AssistantStreamAccumulator(); a.push({time:1,chunk:{type:'usage',usage}}); const first=a.snapshot(); usage.inputTokens=90;
  a.push({time:2,chunk:{type:'text-delta',index:0,text:'later'}}); assert.equal(first.length,1); assert.equal((expandAssistantStream(first)[0].chunk as any).usage.inputTokens,3); assert.ok(Object.isFrozen(first));
});
for(const [label,record] of [['dt length',{type:'text-chunks',time0:0,index:0,dt:[],texts:['a','b']}],['index',{type:'text-chunks',time0:0,index:-1,dt:[],texts:['a']}],['keys',{type:'text-chunks',time0:0,index:0,dt:[],texts:['a'],extra:true}]] as const)
test('C11 strict durable expansion rejects '+label,()=>{ assert.throws(()=>expandAssistantStream([record] as any),TypeError); });
test('C12 provider routes register atomically and disposal is precise',async()=>runtime(async ctx=>{
  const a=new ScriptedAdapter([]),d=ctx.llm.registerAdapter(['p'],a); assert.throws(()=>ctx.llm.registerAdapter(['q','p'],a),code('DUPLICATE_ADAPTER'));
  assert.deepEqual(ctx.llm.listProviders().map(p=>p.id),['p']); d.replace(['q']); assert.deepEqual(ctx.llm.listProviders().map(p=>p.id),['q']); d(); assert.deepEqual(ctx.llm.listProviders(),[]);
}));
test('C13 advisory catalog can be empty while an exact model routes; defaults and waterfall execute',async()=>{
  const r=await runtimePractice(); assert.deepEqual(r.catalog,[]); assert.equal(r.config.model,'not-in-catalog'); assert.equal(r.config.maxTokens,128); assert.equal(r.config.reasoningEffort,'low');
  assert.deepEqual(r.defaults,{reasoningEffort:true,maxTokens:true}); assert.deepEqual(r.order,['before','after','before','after','before','after']); assert.equal(r.calls,2); assert.match(r.reuse,/only be dispatched once/);
  assert.deepEqual((r.failed.at(-1) as any).reason.failure,{message:'夹具限流',code:'RATE_LIMIT',status:429,providerRetryAfterMs:250}); assert.equal((r.missing.at(-1) as any).reason.failure.code,'NO_ADAPTER');
});
test('C14 prepare rejects absent route while direct stream normalizes absence',async()=>runtime(async ctx=>{
  await assert.rejects(ctx.llm.prepareCall(opts('missing')),code('NO_ADAPTER')); assert.equal((await collect(ctx.llm.stream(opts('missing')))).length,1);
}));
test('C15 malformed exact model defaults and unsupported effort fail before dispatch',async()=>runtime(async ctx=>{
  class Bad extends ScriptedAdapter { override async resolveModel(p:string,m:string) { return {...await super.resolveModel(p,m),defaultMaxTokens:0}; } }
  const a=new Bad([]);ctx.llm.registerAdapter(['fixture'],a);await assert.rejects(ctx.llm.prepareCall(opts()),code('INVALID_MODEL_MAX_TOKENS'));assert.equal(a.requests.length,0);
}));
test('C16 prepared config detached/frozen; mismatch does not consume valid dispatch, reuse does',async()=>runtime(async ctx=>{
  const a=new ScriptedAdapter([textChunks()]);ctx.llm.registerAdapter(['fixture'],a);const p=await ctx.llm.prepareCall({...opts(),stop:['END']});assert.ok(Object.isFrozen(p.config.stop));
  assert.throws(()=>p.stream({...p.config,model:'other',messages:[]}),code('INVALID_PREPARED_CALL'));await collect(p.stream({...p.config,messages:[]}));assert.throws(()=>p.stream({...p.config,messages:[]}),code('INVALID_PREPARED_CALL'));
}));
test('C17 post-handle config drift is caught at lazy final dispatch',async()=>runtime(async ctx=>{
  const a=new ScriptedAdapter([]);ctx.llm.registerAdapter(['fixture'],a);const p=await ctx.llm.prepareCall(opts()),o={...p.config,messages:[]};const s=p.stream(o);o.model='changed';
  const chunks=await collect(s);assert.equal((chunks.at(-1) as any).reason.failure.code,'INVALID_PREPARED_CALL');assert.equal(a.requests.length,0);
}));
test('C18 prepare keeps old registration after route replacement; next call uses new adapter',async()=>runtime(async ctx=>{
  const a=new ScriptedAdapter([textChunks('old')]),b=new ScriptedAdapter([textChunks('new')]),d=ctx.llm.registerAdapter(['fixture'],a),p=await ctx.llm.prepareCall(opts());d();ctx.llm.registerAdapter(['fixture'],b);
  await collect(p.stream({...p.config,messages:[]}));await collect(ctx.llm.stream(opts()));assert.equal(a.requests.length,1);assert.equal(b.requests.length,1);
}));
test('C19 adapter override binds its own changing settings generation',async()=>runtime(async ctx=>{
  class Dynamic extends LlmAdapter { version='v1'; override async prepareCall(p:string,m:string) { const v=this.version;return {model:{provider:p,id:m,name:m},stream:()=>sequence(textChunks(v))}; } stream(){throw Error('unbound');} }
  const a=new Dynamic();ctx.llm.registerAdapter(['fixture'],a);const p=await ctx.llm.prepareCall(opts());a.version='v2';const got=fold(await collect(p.stream({...p.config,messages:[]})));assert.equal((got.blocks()[0] as any).text,'v1');
}));
test('C20 cancellation during exact-model lookup rejects preparation before dispatch',async()=>runtime(async ctx=>{
  const entered=gate(),release=gate(),abort=new AbortController();class Slow extends ScriptedAdapter {override async resolveModel(p:string,m:string) {entered.resolve();await release.promise;return super.resolveModel(p,m);} }
  const a=new Slow([]);ctx.llm.registerAdapter(['fixture'],a);const pending=ctx.llm.prepareCall(opts(),abort.signal);await entered.promise;abort.abort();release.resolve();await assert.rejects(pending);assert.equal(a.requests.length,0);
}));
for(const boundary of ['dispatch','iterator','iteration'] as const)test('C21 adapter '+boundary+' exception becomes terminal structured failure',async()=>runtime(async ctx=>{
  class Bad extends LlmAdapter {stream():AsyncIterable<StreamChunk>{if(boundary==='dispatch')throw new LlmError('broken','TRANSPORT');if(boundary==='iterator')return {[Symbol.asyncIterator](){throw new LlmError('broken','TRANSPORT');}};
    return (async function*(){yield {type:'text-delta',index:0,text:'partial'} as StreamChunk;throw new LlmError('broken','TRANSPORT',{status:503,providerRetryAfterMs:300,requestId:'fixture-request' as any});})();} }
  ctx.llm.registerAdapter(['fixture'],new Bad());const chunks=await collect(ctx.llm.stream(opts()));assert.equal((chunks.at(-1) as any).reason.failure.code,'TRANSPORT');assert.equal(chunks.filter(c=>c.type==='finish').length,1);
  if(boundary==='iteration')assert.deepEqual((chunks.at(-1) as any).reason.failure,{message:'broken',code:'TRANSPORT',status:503,providerRetryAfterMs:300,requestId:'fixture-request'});
}));
test('C22 plain Error remains UNKNOWN while aborted signal changes terminal kind only',async()=>runtime(async ctx=>{
  const a=new ScriptedAdapter([()=>{throw Error('SDK code text is not taxonomy');}]);ctx.llm.registerAdapter(['fixture'],a);const abort=new AbortController();abort.abort();const chunks=await collect(ctx.llm.stream({...opts(),signal:abort.signal}));assert.equal((chunks.at(-1) as any).reason.kind,'aborted');assert.equal((chunks.at(-1) as any).reason.failure.code,'UNKNOWN');
}));
test('C23 middleware failures remain thrown, not adapter error finish',async()=>runtime(async ctx=>{
  ctx.on('llm/stream',async function*(){throw Error('middleware');});await assert.rejects(collect(ctx.llm.stream(opts())),/middleware/);
}));
test('C24 waterfall short-circuit need not reach adapter lookup',async()=>runtime(async ctx=>{
  ctx.on('llm/stream',async function*(){yield* sequence(textChunks('short'));});assert.equal(fold(await collect(ctx.llm.stream(opts('absent')))).blocks().length,1);
}));
test('C25 raw malformed adapter ordering is not automatically validated by Runtime',async()=>runtime(async ctx=>{
  const bad:StreamChunk[]=[{type:'finish',reason:{kind:'stop'}},{type:'usage',usage:{inputTokens:1,outputTokens:1}}];ctx.llm.registerAdapter(['fixture'],new ScriptedAdapter([bad,[]]));assert.deepEqual(await collect(ctx.llm.stream(opts())),bad);assert.deepEqual(await collect(ctx.llm.stream(opts())),[]);
}));
test('C26 replay passes only to adapter instance currently owning the historical route',async()=>runtime(async ctx=>{
  const a=new ScriptedAdapter([textChunks()]),b=new ScriptedAdapter([textChunks()]);ctx.llm.registerAdapter(['fixture','same'],a);ctx.llm.registerAdapter(['other'],b);
  const m=createAssistantMessage({content:[{type:'text',text:'old'}],source:{provider:'same',model:'m',replayState:{response:{private:true}}}});
  await collect(ctx.llm.stream({...opts(),messages:[m]}));await collect(ctx.llm.stream({...opts('other'),messages:[m]}));assert.ok((a.requests[0].messages[0] as any).source.replayState);assert.equal((b.requests[0].messages[0] as any).source.replayState,undefined);assert.ok(m.source.replayState);
}));
const translator=async()=>import(pathToFileURL(resolve(process.env.HARNESS_SOURCE_CACHE!,'packages/llm/llm-deepseek/src/translate.ts')).href);
const wire=()=>[{type:'message_start',message:{usage:{input_tokens:2}}},{type:'content_block_start',index:5,content_block:{type:'text',text:''}},{type:'content_block_delta',index:5,delta:{type:'text_delta',text:'hello'}},{type:'content_block_stop',index:5},{type:'message_delta',delta:{stop_reason:'end_turn'},usage:{output_tokens:3}},{type:'message_stop'}];
test('C27 official DeepSeek translator maps native events to usage-before-finish and normalized index',async()=>{
  const {translate}=await translator();const chunks:StreamChunk[]=await collect(translate(sequence(wire()),'model'));assert.equal(chunks.at(-2)?.type,'usage');assert.equal(chunks.at(-1)?.type,'finish');assert.equal((chunks[0] as any).index,0);assert.equal((fold(chunks).blocks()[0] as any).text,'hello');
});
test('C28 official DeepSeek translator rejects stream without terminal message_stop',async()=>{
  const {translate}=await translator();await assert.rejects(collect(translate(sequence(wire().slice(0,-1)),'m')),code('STREAM_CLOSED'));
});
test('C29 configure sees frozen proposal before defaults, keeps captured route, and failures reject preparation',async()=>runtime(async ctx=>{
  const a=new ScriptedAdapter([textChunks()]);ctx.llm.registerAdapter(['fixture'],a);let seen=0;
  const p=await ctx.llm.prepareCall(opts(),undefined,(controls,model)=>{seen++;assert.ok(Object.isFrozen(controls));assert.ok(Object.isFrozen(model));assert.equal(controls.maxTokens,undefined);assert.equal(model.defaultMaxTokens,128);return {...controls,maxTokens:16,provider:'forged',model:'forged'} as any;});
  assert.equal(seen,1);assert.equal(p.config.provider,'fixture');assert.equal(p.config.model,'m');assert.equal(p.config.maxTokens,16);assert.deepEqual(p.adapterDefaults,{});
  await collect(p.stream({...p.config,messages:[]}));await assert.rejects(ctx.llm.prepareCall(opts(),undefined,()=>{throw Error('bad configure');}),/bad configure/);assert.equal(a.requests.length,1);
}));
const scenarios:Scenario[]=['success','failure','throw','cancel-empty','cancel-partial','cancel-reasoning','cancel-tools','max-tokens','write-failure','attempt-write-failure','assembly-failure','middleware-failure','retry','in-band-aborted','tool-chain'];
for(const kind of scenarios)test('D-'+kind+' real Loop/Session settlement and live framing',async()=>{
  const r=await settlementPractice(kind),facts=r.events as any[],messages=facts.filter(e=>e.type==='assistant/message'),attempts=facts.filter(e=>e.type==='assistant/attempt'),frames=r.trace.filter(t=>t.channel==='live').map(t=>t.frame),ends=frames.filter(f=>f.type==='end');
  assert.equal(frames[0].type,'start');assert.deepEqual(frames.map(f=>f.revision),frames.map((_,i)=>i+1));assert.ok(!facts.some(e=>e.type==='assistant/chunk'));
  for(const end of ends){if(end.outcome.kind!=='committed')continue;const fact=facts.find(e=>e.seq===end.outcome.seq);assert.equal(fact?.type,end.outcome.eventType);
    const chunks=frames.filter(f=>f.attemptId===end.attemptId&&f.type==='chunk');assert.deepEqual(chunks.map(f=>f.index),chunks.map((_,i)=>i));assert.equal(end.index,chunks.length);
    assert.deepEqual(expandAssistantStream(fact.data.stream).map(t=>t.chunk),chunks.map(f=>f.chunk));
    const fi=r.trace.findIndex(t=>t.channel==='fact'&&t.event.seq===fact.seq);
    const endIndex=r.trace.findIndex(t=>t.channel==='live'&&t.frame.type==='end'&&t.frame.attemptId===end.attemptId);assert.ok(fi<endIndex);
  }
  const turn=facts.findLast(e=>e.type==='turn/end').data.reason.kind;
  const bodies=r.trace.filter(t=>t.channel==='tool-body');
  if(kind==='success'){assert.equal(messages.length,1);assert.equal(attempts.length,0);assert.equal(turn,'completed');}
  if(['failure','throw','middleware-failure','in-band-aborted'].includes(kind)){assert.equal(messages.length,0);assert.equal(attempts.length,1);assert.equal(turn,'error');assert.equal(r.messages.filter((m:any)=>m.role==='assistant').length,0);}
  if(kind==='middleware-failure')assert.equal(r.requests.length,0);
  if(kind.startsWith('cancel-')){assert.equal(turn,'aborted');if(['cancel-partial','cancel-reasoning'].includes(kind)){assert.equal(messages.length,1);assert.equal(messages[0].data.interrupted,true);assert.ok(messages[0].data.message.content.every((b:any)=>['text','reasoning'].includes(b.type)));}else{assert.equal(messages.length,0);assert.equal(attempts.length,1);} }
  if(kind==='max-tokens'){assert.equal(turn,'max-tokens');assert.equal(messages.length,1);assert.ok(messages[0].data.message.content.every((b:any)=>b.type!=='tool-call'));}
  if(['write-failure','attempt-write-failure','assembly-failure'].includes(kind)){assert.equal(messages.length+attempts.length,0);assert.equal(ends.at(-1).outcome.kind,'abandoned');assert.equal(turn,'error');}
  if(kind==='retry'){assert.equal(r.requests.length,2);assert.equal(messages.length,1);assert.equal(attempts.length,1);assert.equal(facts.filter(e=>e.type==='step/start').length,1);assert.equal(facts.filter(e=>e.type==='user/message'&&e.data.source.kind==='user').length,1);assert.notEqual(ends[0].attemptId,ends[1].attemptId);}
  if(kind==='tool-chain'){assert.equal(r.requests.length,2);assert.equal(messages.length,2);assert.equal(facts.filter(e=>e.type==='step/start').length,2);assert.equal(bodies.length,1);const result=facts.find(e=>e.type==='tool/result');assert.ok(result);assert.ok(r.requests[1].messages.some((m:any)=>m.role==='tool'&&m.toolCallId==='read-1'));assert.ok(!r.requests[0].messages.some((m:any)=>m.role==='tool'));assert.ok(r.requests.every(r=>r.frozen));const commit=r.trace.findIndex(t=>t.channel==='fact'&&t.event.type==='assistant/message');assert.ok(commit<r.trace.findIndex(t=>t.channel==='tool-body'));}
  else assert.equal(bodies.length,0);
});
