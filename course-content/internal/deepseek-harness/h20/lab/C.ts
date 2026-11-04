import {fixture,assert,user,text,call,failed,normal,summary,visible,SessionId,until} from './support.ts';
export async function practiceC(kind='recovered'){
 const f=await fixture({disk:true,policy:normal()});let saved:any,before:any,root=f.root;
 try{
  const a=await f.create('persisted-retry');f.adapter.entries=[async function*(){yield {type:'text-delta',index:0,text:'FAILED_FRAGMENT'};throw failed('TRANSPORT',{requestId:'fixture-request'});},text('RECOVERED')];
  a.followup(user('inspect fixture'));
  if(kind==='cancelled'){await until(()=>f.events(a).some(e=>e.type==='llm/retry'));a.cancel({kind:'user'});await a.whenIdle();}else await f.clock.idle(a);
  assert.equal(await f.ctx.sessions.flush(a.session),true);const r=await f.ctx.sessionPersistence.open(a.id,'read');try{saved={header:r.header,...await r.read()};}finally{await r.close();}
  before=summary(f,a);assert.ok(!visible(a.session.deriveMessages()).includes('FAILED_FRAGMENT'));
 }finally{await f.close();}
 const next=await fixture({disk:true,root,policy:normal()});let handle:any;
 try{
  const r=await next.ctx.sessionPersistence.open(saved.header.id,'read');try{assert.deepEqual(r.header,saved.header);assert.deepEqual((await r.read()).events,saved.events);}finally{await r.close();}
  handle=await next.ctx.agents.resume({resumeSessionId:saved.header.id,agentOptions:{provider:'fixture',model:'large'}});const a=handle.agent;
  assert.deepEqual(a.session.deriveMessages(),before.messages);assert.equal(next.adapter.requests.length,0);assert.equal(next.clock.pending,0);
  assert.equal(saved.events.filter((e:any)=>e.type==='assistant/attempt').length,1);assert.equal(saved.events.filter((e:any)=>e.type==='llm/retry').length,1);assert.equal(saved.events.filter((e:any)=>e.type==='llm/retry-started').length,kind==='cancelled'?0:1);
  next.adapter.entries=[text('NEW_TASK')];a.followup(user('continue after reopening'));await next.clock.idle(a);assert.equal(next.adapter.requests.length,1);assert.ok(!visible(next.adapter.requests[0].messages).includes('FAILED_FRAGMENT'));
  return {kind,root,backend:'real JSONL none',restoration:'same process, new context/backend instance',saved,before,after:summary(next,a),plannedRetryDoesNotReplay:true};
 }finally{await handle?.dispose();await next.close();}
}
