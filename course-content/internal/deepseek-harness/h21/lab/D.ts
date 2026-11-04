import {fixture,assert,text,call,gate,until,bounded,blocks,user,hasText} from './support.ts';
export const D_CASES=['messages','cold-resume','limits-tree','interrupt'] as const;
export async function practiceD(mode:string){
 const g=gate(),h=gate(),f=await fixture({control:true,capacity:mode==='limits-tree'?1:8});
 try{
  const p=await f.create();let entered=0;
  f.tool('child_probe',async()=>'probe=3');
  const pending=async function*(){entered++;await g.promise;yield*call('child_probe');};
  f.adapter.scripts.set('child',[pending,text('CHILD_REPLY')]);
  const a=await f.start(p),child=f.ctx.agents.get(a.childId)!;await until(()=>entered===1);
  if(mode==='messages'){
   const receipt=await f.exec(p,'send_message',{agent_id:child.id,message:'STEER_AT_NEXT_STEP'});
   assert.ok(receipt.messageId);assert.equal(f.events(child).filter(e=>e.type==='assistant/message').length,0);
   assert.ok(child.inbox.nextStep.some(m=>m.id===receipt.messageId));
   const outsider=await f.create('outsider');await assert.rejects(f.ctx.subagents.sendMessage(outsider,child.id,blocks('denied'),{signal:new AbortController().signal}),{code:'UNAUTHORIZED'});
   // Direct-parent relay is independently attributed and accepted while parent is idle.
   f.adapter.scripts.set('parent',[text('parent received relay')]);
   const parentReceipt=await f.ctx.subagents.sendMessage(child,p.id,blocks('CHILD_PROGRESS'),{signal:new AbortController().signal});
   assert.ok(parentReceipt);g.release();const result=await bounded(a.result);await bounded(p.whenIdle());
   assert.ok(f.adapter.requests.some(r=>r.model==='child'&&hasText(r.messages,'STEER_AT_NEXT_STEP')));
   assert.ok(f.events(p).some(e=>e.type==='user/message'&&e.data.source.kind==='agent-message'));
   return {receipt,parentReceipt,result,parent:f.events(p),child:f.events(child),requests:f.adapter.requests};
  }
  if(mode==='limits-tree'){
   await assert.rejects(f.start(p),{code:'ACTIVATION_LIMIT_REACHED'});
   await assert.rejects(f.start(child,'spawn',{maxDepth:1}),{name:'SubagentDepthError'});
   f.limits.capacity=2;
   f.adapter.scripts.set('grand',[async function*(){await h.promise;yield*text('grand done');}]);
   const b=await f.start(child,'spawn',{maxDepth:2,agentOptions:{model:'grand'}});const grand=f.ctx.agents.get(b.childId)!;
   assert.equal(grand.session.header.delegationDepth,2);
   const direct=await f.exec(p,'list_agents'),tree=await f.exec(p,'list_agents',{scope:'descendants'});
   assert.equal(direct.length,1);assert.equal(tree.length,2);assert.equal(tree[1].depth,2);
   await assert.rejects(f.ctx.subagents.sendMessage(p,grand.id,blocks('not adjacent'),{signal:new AbortController().signal}),{code:'UNAUTHORIZED'});
   assert.deepEqual(await f.exec(p,'interrupt_agent',{agent_id:child.id}),{accepted:true});
   assert.equal(grand.status,'running');
   let disposed=false;const closing=a.dispose().then(()=>{disposed=true;});await Promise.resolve();assert.equal(disposed,false);
   g.release();h.release();await bounded(closing);await bounded(b.result);
   assert.equal(f.ctx.agents.get(grand.id),undefined);assert.equal(f.ctx.agents.get(child.id),undefined);
   f.adapter.scripts.set('child',[text('slot reused')]);const next=await f.start(p);await bounded(next.result);
   return {direct,tree,capacity:2,slotReused:true,lifecycle:f.lifecycle,child:f.events(child),grand:f.events(grand)};
  }
  if(mode==='interrupt'){
   child.followup(user('PARKED_FIFO')); // Real Inbox; interrupt preserves this unclaimed queue.
   assert.deepEqual(await f.exec(p,'interrupt_agent',{agent_id:child.id}),{accepted:true});
   let idle=false;const idlePromise=child.whenIdle().then(()=>{idle=true;});await Promise.resolve();assert.equal(idle,false);
   g.release();await bounded(idlePromise);assert.ok(child.inbox.nextTurn.length>0);assert.equal(f.ctx.agents.get(child.id),child);
   f.adapter.scripts.set('child',[text('parked task done'),text('wake task done')]);
   const receipt=await f.exec(p,'send_message',{agent_id:child.id,message:'WAKE_AFTER_INTERRUPT'});
   assert.ok(receipt.messageId);const result=await bounded(a.result);
   assert.ok(hasText(f.events(child),'PARKED_FIFO'));assert.ok(hasText(f.events(child),'WAKE_AFTER_INTERRUPT'));
   return {receipt,idleBeforeGate:false,result,child:f.events(child),lifecycle:f.lifecycle};
  }
  assert.equal(mode,'cold-resume');g.release();await bounded(a.result);assert.equal(f.ctx.agents.get(child.id),undefined);
  const stored=await f.stored(child.id);assert.ok(stored.events.some(e=>e.type==='subagent/descriptor'));
  // Remove Provider registration; cold resume reconstructs from descriptor, not another fork/spawn preparation.
  await f.spawnFiber.dispose();assert.equal(f.ctx.subagents.getProvider('spawn'),undefined);
  f.adapter.scripts.set('child',[async function*(){entered++;await h.promise;yield*text('COLD_REPLY');}]);
  f.adapter.scripts.set('parent',[text('parent received cold completion')]);
  const receipt=await f.exec(p,'send_message',{agent_id:child.id,message:'COLD_FOLLOWUP'});
  const replacement=f.ctx.agents.get(child.id)!;assert.notEqual(replacement,child);assert.equal(replacement.id,child.id);
  await a.dispose();assert.equal(f.ctx.agents.get(child.id),replacement);
  assert.ok(receipt.messageId);assert.equal(hasText(f.events(child),'COLD_REPLY'),false);
  h.release();await bounded(f.ctx.subagents.waitForChildren(p));await bounded(p.whenIdle());
  const after=await f.stored(child.id);assert.deepEqual(after.events.slice(0,stored.events.length),stored.events);
  assert.ok(hasText(after.events,'COLD_REPLY'));const list=await f.exec(p,'list_agents');assert.equal(list[0].status,'inactive');
  return {receipt,list,providerRegistered:false,stored,after,lifecycle:f.lifecycle,root:f.root,scope:'same-process new Agent and writer, real JSONL; no crash or new PID'};
 }finally{g.release();h.release();await f.close();}
}
