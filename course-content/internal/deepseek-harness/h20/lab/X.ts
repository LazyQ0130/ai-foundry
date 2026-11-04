import {fixture,assert,user,text,call,normal,failed,until,gate,SessionId,summary,visible} from './support.ts';
export async function integrated(){
 const g=gate(),f=await fixture({disk:true,policy:normal()});let effects=0,snapshot:any,original:any,started=false,copyRoot:string|undefined;
 try{
  f.tool('write-fixture',async()=>{effects++;started=true;await g.promise;return 'memory resource created';});f.tool('read-fixture',async()=>String(effects));
  const a=await f.create('reliability-task');f.adapter.entries=[failed('RATE_LIMIT',{status:429}),call(['write-fixture','read-fixture']),text('unused')];a.followup(user('read fixture, execute controlled test and explain failure'));
  await until(()=>f.events(a).some(e=>e.type==='llm/retry'));assert.equal(f.events(a).filter(e=>e.type==='llm/retry-started').length,0);f.clock.advance(500);await until(()=>started);
  assert.equal(effects,1);assert.equal(await f.ctx.sessions.flush(a.session),true);const r=await f.ctx.sessionPersistence.open(a.id,'read');try{snapshot={header:r.header,...await r.read()};}finally{await r.close();}
  // Persist an exact open-turn prefix into a NEW fixture. This models a crash
  // point; it does not kill a process or mutilate an existing physical file.
  a.cancel({kind:'user'});let idle=false;const p=a.whenIdle().then(()=>{idle=true;});await Promise.resolve();assert.equal(idle,false);g.release();await p;original={...summary(f,a),pressure:f.ctx.tokenMeter.measure(a.session).totalTokens};
  assert.equal(f.adapter.requests.length,2);assert.equal(f.events(a).filter(e=>e.type==='turn/end').at(-1).data.reason.kind,'aborted');assert.equal(effects,1);
 }finally{g.release();await f.close();}
  const copy=await fixture({disk:true,retry:false});copyRoot=copy.root;
  try{const writer=await copy.ctx.sessionPersistence.create({...snapshot.header,id:SessionId('interrupted-copy')});try{await writer.append(snapshot.events);await writer.flush();}finally{await writer.close();}}finally{await copy.close();}
 const restored=await fixture({disk:true,root:copyRoot,policy:normal()});let h:any;
 try{
  h=await restored.ctx.agents.resume({resumeSessionId:SessionId('interrupted-copy'),agentOptions:{provider:'fixture',model:'large'}});const a=h.agent;await restored.ctx.sessions.flush(a.session);const reader=await restored.ctx.sessionPersistence.open(a.id,'read');let restoredLog:any[];try{restoredLog=(await reader.read()).events;}finally{await reader.close();}assert.deepEqual(restoredLog.slice(0,snapshot.events.length),snapshot.events);const closers=restoredLog.slice(snapshot.events.length);
  assert.equal(restored.adapter.requests.length,0);assert.equal(effects,1);assert.deepEqual(closers.filter(e=>e.type==='tool/result').map(e=>e.data.error.code),['TOOL_OUTCOME_UNKNOWN','TOOL_NOT_STARTED']);
  restored.adapter.entries=[text('External fixture shows operation already happened; reconcile without repeating.')];a.followup(user('external state checked: memory resource count is one'));await restored.clock.idle(a);
  assert.equal(restored.adapter.requests.length,1);assert.equal(effects,1);assert.ok(visible(restored.adapter.requests[0].messages).includes('outcome is unknown'));
  assert.equal(await restored.ctx.sessions.flush(a.session),true);
  return {sourceRoot:f.root,copyRoot,snapshot,original,restoredLog,closers,recovered:summary(restored,a),effects,crashSimulation:'exact logical committed prefix copied to a fresh JSONL fixture; no actual process crash',restoration:'same process, new context + backend; real agents.resume',budget:'500 virtual ms; one generic retry; no external Provider'};
 }finally{await h?.dispose();await restored.close();}
}
