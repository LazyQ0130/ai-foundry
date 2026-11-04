import {fixture,assert,user,text,call,normal,failed,summary,pump,until,gate,visible} from './support.ts';
export const B_CASES=['before-request','stream-prefix','stream-empty','backoff','tool-business','tool-policy','tool-before','tool-after','parallel','inbox-clear','inbox-keep','handle-dispose','plugin-dispose','delegated'];
export async function practiceB(kind='stream-prefix'){
 const g=gate();let entered=false,bodies:string[]=[],effect=0,downstream=false;
 const f=await fixture({policy:kind==='delegated'?{mode:'always'}:normal(),downstream:kind==='delegated'?async()=>{downstream=true;await g.promise;return {kind:'retry'};}:undefined});
 try{
  const a=await f.create();const safeStream=async function*(o:any){entered=true;if(kind!=='stream-empty'){yield {type:'text-delta',index:0,text:'SAFE_PREFIX'};yield {type:'block-start',index:1,blockType:'tool-call'};yield {type:'tool-call-delta',index:1,id:'unfinished',name:'work',argumentsDelta:'{'};}await new Promise<void>(r=>o.signal.addEventListener('abort',()=>r(),{once:true}));o.signal.throwIfAborted();};
  if(kind==='before-request'){f.ctx.on('agent/pre-step',async(_p,next)=>{a.cancel({kind:'user'});return next();});f.adapter.entries=[text()];}
  else if(['backoff','handle-dispose','plugin-dispose','delegated'].includes(kind))f.adapter.entries=[failed(),text()];
  else if(kind==='tool-business'||kind==='tool-policy'){f.tool('work',async()=>{bodies.push('work');throw Error('controlled test command exit failure');});if(kind==='tool-policy')f.ctx.on('tools/pre-execute',async()=>{throw Error('controlled policy failure');});f.adapter.entries=[call(['work']),text('tool failed; explain without retrying model')];}
  else if(kind==='tool-before'||kind==='tool-after'){
   f.tool('work',async()=>{bodies.push('work');effect++;entered=true;await g.promise;return 'effect complete';});f.adapter.entries=[call(['work']),text()];
   if(kind==='tool-before')f.ctx.on('tools/pre-execute',async(_p,next)=>{a.cancel({kind:'user'});return next();});
  }else if(kind==='parallel'){
   f.tool('first',async()=>{bodies.push('first');return 'completed first';},true);f.tool('second',async()=>{bodies.push('second');entered=true;await g.promise;return 'second drained';},true);f.tool('third',async()=>{bodies.push('third');return 'must not run';},true);
   f.ctx.on('session/event',(s,e)=>{if(s===a.session&&e.type==='tool/result'&&e.data.message.source.callId==='call-0')a.cancel({kind:'user'});});f.adapter.entries=[call(['first','second','third']),text()];
  }else f.adapter.entries=[safeStream,text('queued second'),text('third')];
  a.followup(user('active task'));if(kind.startsWith('inbox'))a.followup(user('QUEUED_SECOND'));
  if(kind==='tool-business'||kind==='tool-policy'){await f.clock.idle(a);assert.equal(f.adapter.requests.length,2);assert.equal(f.counts.recovery,0);assert.equal(f.errors.length,0);assert.equal(bodies.length,kind==='tool-business'?1:0);}
  else if(kind==='before-request'||kind==='tool-before'){await a.whenIdle();assert.equal(f.adapter.requests.length,kind==='before-request'?0:1);}
  else if(['backoff','handle-dispose','plugin-dispose'].includes(kind)){
   await until(()=>f.clock.pending===1,'scheduled retry');assert.equal(f.events(a).filter(e=>e.type==='llm/retry-started').length,0);
   if(kind==='handle-dispose')await f.handles[0].dispose();else if(kind==='plugin-dispose')await f.retryFiber.dispose();else a.cancel({kind:'user'});
   await a.whenIdle();assert.equal(f.clock.pending,0);assert.equal(f.adapter.requests.length,1);
  }else if(kind==='delegated'){
   await until(()=>downstream);let idle=false,disposed=false;const p=a.whenIdle().then(()=>{idle=true;});a.cancel({kind:'user'});const d=f.retryFiber.dispose().then(()=>{disposed=true;});await pump();assert.equal(idle,false);assert.equal(disposed,false);g.release();await p;await d;assert.equal(f.adapter.requests.length,1);assert.equal(f.clock.pending,0);
  }else{
   await until(()=>entered);if(kind==='parallel')await until(()=>f.events(a).some(e=>e.type==='tool/result'),'first result');
   else a.cancel({kind:'user'},{keepInbox:kind==='inbox-keep'});
   if(kind==='tool-after'||kind==='parallel'){let idle=false;const p=a.whenIdle().then(()=>{idle=true;});await pump();assert.equal(idle,false,'started tool must drain');g.release();await p;}
   else await a.whenIdle();
  }
  const events=f.events(a),result=events.filter(e=>e.type==='tool/result');
  if(kind==='stream-prefix'){const m=events.find(e=>e.type==='assistant/message');assert.equal(m.data.interrupted,true);assert.equal(visible([m.data.message]),'SAFE_PREFIX');assert.equal(m.data.message.content.some((b:any)=>b.type==='tool-call'),false);assert.equal(result.length,0);}
  if(kind==='stream-empty')assert.equal(events.filter(e=>e.type==='assistant/attempt').length,1);
  if(kind==='tool-business'||kind==='tool-policy')assert.equal(result[0].data.message.isError,true);
  if(kind==='tool-before'){assert.deepEqual(bodies,[]);assert.equal(result[0].data.error.code,'ABORTED_BEFORE_DISPATCH');}
  if(kind==='tool-after'){assert.equal(effect,1);assert.equal(result[0].data.error.code,'ABORTED');}
  if(kind==='parallel'){assert.deepEqual(bodies,['first','second']);assert.deepEqual(result.map(e=>e.data.message.source.callId),['call-0','call-1','call-2']);assert.equal(result[0].data.message.isError,false);assert.deepEqual(result.slice(1).map(e=>e.data.error.code),['ABORTED','ABORTED_BEFORE_DISPATCH']);}
  if(kind==='inbox-clear')assert.equal(a.inbox.nextTurn.length,0);
  if(kind==='inbox-keep'){assert.equal(a.inbox.nextTurn.length,1);assert.equal(f.adapter.requests.length,1);a.followup(user('THIRD'));await f.clock.idle(a);assert.equal(f.adapter.requests.length,3);assert.ok(visible(f.adapter.requests[1].messages).includes('QUEUED_SECOND'));}
  const ending=events.filter(e=>e.type==='turn/end')[0];assert.equal(ending.data.reason.kind,['tool-business','tool-policy'].includes(kind)?'completed':kind==='plugin-dispose'?'error':'aborted');
  return {kind,...summary(f,a),bodies,effect,quiescence:'waited for every started controlled gate; no real-time sleep'};
 }finally{g.release();await f.close();}
}
