import {fixture,assert,user,text,call,normal,failed,summary,visible,pump,until,gate,resolveRetryPolicy} from './support.ts';
export const A_CASES=['success','no-plugin','rate-limit','server','timeout','empty','adapter-aborted','auth','quota','budget','retry-after','over-cap','jitter','always','always-over-cap','downstream','downstream-error','raw-stream','middleware','partial','compaction-normal','compaction-always'];
export async function practiceA(kind='rate-limit'){
 const always=['always','always-over-cap','downstream','downstream-error','compaction-always'].includes(kind),special=kind.startsWith('compaction');
 const policy=always?{mode:'always',backoff:{initialDelayMs:500,maxDelayMs:10000,jitterRatio:0}}:kind==='budget'?undefined:normal(kind==='jitter'?6:2,kind==='jitter'?{jitterRatio:0.1}:{});
 let downstream=0;const f=await fixture({policy,retry:kind!=='no-plugin',random:()=>kind==='jitter'?1:0.5,compaction:special,downstream:kind.startsWith('downstream')?async(_p,next)=>{downstream++;if(kind==='downstream-error')throw Error('controlled policy failure');return {kind:'retry'};}:undefined});
 try{
  let bodies=0;f.tool('danger',async()=>{bodies++;return 'never on failed attempt';});
  if(kind==='success')f.adapter.entries=[text()];
  else if(['no-plugin','rate-limit','server','timeout','empty','adapter-aborted','auth','quota'].includes(kind))f.adapter.entries=[failed(kind==='server'?'SERVER':kind==='timeout'?'TIMEOUT':kind==='empty'?'EMPTY_RESPONSE':kind==='adapter-aborted'?'ABORTED':kind==='auth'?'AUTH':kind==='quota'?'QUOTA':'RATE_LIMIT'),text()];
  else if(kind==='budget'||kind==='jitter')f.adapter.entries=Array.from({length:8},()=>failed());
  else if(kind==='retry-after'||kind==='over-cap'||kind==='always-over-cap')f.adapter.entries=[failed('RATE_LIMIT',{providerRetryAfterMs:kind==='retry-after'?9000:20000}),text()];
  else if(kind==='always')f.adapter.entries=[failed('AUTH'),failed('QUOTA'),text()];
  else if(kind.startsWith('downstream'))f.adapter.entries=[failed('AUTH'),text()];
  else if(kind==='raw-stream'){
   f.adapter.entries=[failed(),text()];const chunks=[];for await(const chunk of f.ctx.llm.stream({provider:'fixture',model:'large',messages:[user('raw')]}))chunks.push(chunk);
   assert.equal(f.adapter.requests.length,1);assert.equal((chunks.at(-1) as any).reason.failure.code,'RATE_LIMIT');assert.equal(f.clock.pending,0);return {kind,chunks,requests:f.adapter.requests};
  }else if(kind==='middleware'){
   f.ctx.on('llm/stream',()=>{throw Error('plugin failed outside adapter');});f.adapter.entries=[text()];
  }else if(kind==='partial')f.adapter.entries=[async function*(){yield {type:'text-delta',index:0,text:'FAILED_PARTIAL'};yield*call(['danger']).slice(0,-1);throw failed('TRANSPORT');},text('safe answer')];
  else if(special){
   f.adapter.entries=[failed('CONTEXT_WINDOW_EXCEEDED'),text()];
  }
  const a=await f.create();if(special)a.inject(user('OLD_CONTEXT '+ 'material '.repeat(1500),'fixture-context'));a.followup(user('read fixture and explain')); await f.clock.idle(a);const out=summary(f,a),plans=out.events.filter((e:any)=>e.type==='llm/retry'),started=out.events.filter((e:any)=>e.type==='llm/retry-started');
  if(['auth','quota','adapter-aborted','over-cap','middleware','no-plugin'].includes(kind)){assert.equal(plans.length,0);assert.equal(f.errors.length,1);}
  else if(kind==='budget'){assert.equal(f.adapter.requests.length,6);assert.deepEqual(plans.map((e:any)=>e.data.retry),[1,2,3,4,5]);assert.deepEqual(f.clock.delays,[500,1000,2000,4000,8000]);assert.equal(f.errors.length,1);}
  else if(kind==='jitter'){assert.equal(f.adapter.requests.length,7);assert.deepEqual(f.clock.delays,[550,1100,2200,4400,8800,10000]);}
  else if(kind==='downstream'){assert.equal(downstream,1);assert.equal(plans.length,0);assert.equal(f.adapter.requests.length,2);}
  else if(special){assert.equal(plans.length,0);assert.equal(f.adapter.summaryCalls,1);assert.equal(out.events.filter((e:any)=>e.type==='compaction/summary').length,1);assert.equal(f.adapter.requests.filter((r:any)=>r.purpose!=='compaction').length,2);assert.equal(f.errors.length,0);}
  else{assert.equal(f.errors.length,0);assert.equal(f.adapter.requests.length,kind==='success'?1:kind==='always'?3:2);}
  assert.equal(plans.length,started.length);
  for(let n=0;n<plans.length;n++){assert.equal(plans[n].data.retryId,started[n].data.retryId);assert.ok(plans[n].seq<started[n].seq);assert.equal(plans[n].data.step,1);}
  if(kind==='retry-after')assert.deepEqual(f.clock.delays,[9000]);if(kind==='always-over-cap')assert.deepEqual(f.clock.delays,[500]);
  if(kind==='partial'){assert.equal(bodies,0);assert.equal(out.events.filter((e:any)=>e.type==='assistant/attempt').length,1);assert.ok(!visible(a.session.deriveMessages()).includes('FAILED_PARTIAL'));assert.ok(!visible(f.adapter.requests.at(-1).messages).includes('FAILED_PARTIAL'));}
  if(kind==='adapter-aborted')assert.equal(out.events.find((e:any)=>e.type==='turn/end').data.reason.kind,'error');
  if(kind==='middleware'){assert.equal(f.counts.recovery,0);assert.equal(f.adapter.requests.length,0);}
  assert.equal(f.counts.preStep,1);assert.equal(f.counts.resolveTools,1);assert.equal(f.counts.assemble,1);
  assert.equal(out.events.filter((e:any)=>e.type==='user/message'&&e.data.source.kind==='user').length,1);
  assert.equal(out.events.filter((e:any)=>e.type==='step/start').length,1);assert.equal(out.events.filter((e:any)=>e.type==='turn/start').length,1);
  assert.ok(!plans.some((e:any)=>a.session.surface.nodes.includes(e.seq)));return {kind,...out,bodies,downstream};
 }finally{await f.close();}
}
export function policyBoundary(){
 const p=resolveRetryPolicy(undefined,'fixture');assert.equal(p.mode,'normal');assert.equal(p.maxRetries,5);assert.equal(p.jitterRatio,0.1);assert.deepEqual(p.retryableCodes,['EMPTY_RESPONSE','RATE_LIMIT','SERVER','TIMEOUT','TRANSPORT']);assert.ok(Object.isFrozen(p.retryableCodes));
 assert.throws(()=>resolveRetryPolicy({mode:'normal',maxRetries:-1},'fixture'));
 assert.throws(()=>resolveRetryPolicy({mode:'normal',retryableCodes:['SERVER','SERVER']},'fixture'));
 const a=resolveRetryPolicy({mode:'always',maxRetries:-9,retryableCodes:[]} as any,'fixture');assert.equal('maxRetries' in a,false);return {p,a};
}
