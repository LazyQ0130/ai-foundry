import {fixture,history,assert,user,SessionId,textOf,signal} from './support.ts';
export const D_CASES=['below','pressure','prune-only','pre-step-failure','overflow','overflow-limit','no-progress','switch','switch-failure','failure','cancel','manual-fifo'];
export async function practiceD(kind='pressure'){
 const auto=kind!=='manual-fifo';const f=await fixture({loop:true,auto,pruner:kind==='prune-only',policy:{thresholdRatio:0.5,retainTokens:80}});let h:any;
 let releaseGate:(()=>void)|undefined;
 try{
  // Copy only events captured while the real fixture session accepted them.
  const seed=history(f.ctx,'seed-'+kind,['below','no-progress','prune-only'].includes(kind)?4:2400,kind==='no-progress'?1:3);
  const seedEvents=f.facts.get(seed.id)!;
  h=await f.ctx.agents.create({sessionId:SessionId('agent-'+kind),seed:seedEvents,agentOptions:{provider:'fixture',model:'large'}});
  const agent=h.agent;
  if(kind==='overflow'||kind==='overflow-limit'||kind==='no-progress')f.adapter.failure=kind==='overflow-limit'?'always-overflow':'overflow';
  if(kind==='switch'||kind==='switch-failure'||kind==='pressure'){
   if(kind==='pressure')f.adapter.resolveModel=async(provider:string,model:string)=>({provider,id:model,name:model,defaultMaxTokens:128,context:{contextWindow:6000}});
   else agent.model.select({provider:'fixture',model:'small'});
  }
  if(kind==='switch-failure'||kind==='pre-step-failure')f.adapter.summaryMode='throw';
  if(kind==='pre-step-failure'||kind==='prune-only')f.adapter.resolveModel=async(provider:string,model:string)=>({provider,id:model,name:model,defaultMaxTokens:128,context:{contextWindow:kind==='prune-only'?2000:6000}});
  if(kind==='failure')f.adapter.failure='server';
  if(kind==='manual-fifo'){
   let release!:()=>void;f.adapter.gate=new Promise<void>(r=>release=r);
   releaseGate=release;const p=f.compact.compactNow(agent,signal());
   agent.followup(user('FIFO_ONE'));agent.followup(user('FIFO_TWO'));agent.inject(user('outside selected span'));
   assert.equal(f.adapter.ordinary,0);await assert.rejects(async()=>f.compact.compactNow(agent,signal()),/active|idle|busy/);
   release();await p;await agent.whenIdle();const all=f.facts.get(agent.id)!;
   assert.equal(all.filter(e=>e.type==='compaction/start')[0].data.turn,null);
   const received=f.adapter.requests.filter(r=>r.purpose!=='compaction').map(r=>textOf(r.messages));
   assert.equal(received.length,2);assert.ok(received[0].includes('FIFO_ONE'));assert.ok(!received[0].includes('FIFO_TWO'));assert.ok(received[1].includes('FIFO_TWO'));assert.ok(received[0].includes('outside selected span'));
   return {kind,events:all,requests:f.adapter.requests};
  }
  if(kind==='cancel'){
   let release!:()=>void;f.adapter.gate=new Promise<void>(r=>release=r);agent.model.select({provider:'fixture',model:'small'});
   f.adapter.onSummary=()=>agent.cancel({kind:'user'});agent.followup(user('new input'));await new Promise<void>(r=>setTimeout(r,5));release();await agent.whenIdle();
   assert.equal(f.adapter.ordinary,0);assert.equal(f.facts.get(agent.id)!.at(-1).type,'turn/end');return {kind,events:f.facts.get(agent.id),requests:f.adapter.requests};
  }
  agent.followup(user(kind==='prune-only'?'RUN_TOOL':'continue current task'));await agent.whenIdle();const events=f.facts.get(agent.id)??[],summary=events.filter(e=>e.type==='compaction/summary');
  if(kind==='prune-only'){assert.equal(summary.length,0);assert.equal(events.filter(e=>e.type==='compaction/prune').length,1);assert.equal(f.bodies(),1);assert.equal(f.adapter.ordinary,2);assert.equal(f.errors.length,0);}
  if(kind==='pre-step-failure'){assert.equal(f.adapter.ordinary,1);assert.equal(summary.length,0);assert.ok(events.some(e=>e.type==='compaction/end'&&e.data.error));assert.equal(f.errors.length,0);}
  if(kind==='below'){assert.equal(summary.length,0);assert.equal(f.adapter.ordinary,1);}
  if(kind==='pressure'||kind==='overflow'||kind==='switch'){
   assert.ok(summary.length>0);const final=f.adapter.requests.filter(r=>r.purpose!=='compaction').at(-1)!;
   assert.ok(textOf(final.messages).includes('<compacted-summary>'));assert.ok(!textOf(final.messages).includes('OLD_SENTINEL'));
   if(kind!=='overflow')assert.ok(textOf(final.messages).includes('answer 3'));assert.equal(f.errors.length,0);
  }
  if(kind==='overflow'){assert.equal(f.adapter.ordinary,2);const attempt=events.findIndex(e=>e.type==='assistant/attempt'),start=events.findIndex(e=>e.type==='compaction/start'),stepEnd=events.findIndex(e=>e.type==='step/end');assert.ok(attempt<start&&start<stepEnd);}
  if(kind==='overflow-limit'){assert.equal(f.adapter.ordinary,2);assert.ok(f.errors.length>0);}
  if(kind==='no-progress'){assert.equal(f.adapter.ordinary,1);assert.equal(summary.length,0);assert.ok(f.errors.length>0);}
  if(kind==='switch'){assert.equal(summary[0].data.model,'large');assert.equal(agent.session.requestHeader().config.model,'small');}
  if(kind==='switch-failure'){assert.equal(f.adapter.ordinary,0);assert.equal(agent.session.requestHeader().config.model,'large');assert.ok(f.errors.some(e=>e.includes('Cannot switch')));}
  if(kind==='failure'){assert.equal(f.adapter.ordinary,1);assert.equal(summary.length,0);assert.ok(f.errors.length>0);}
  return {kind,seedEvents,events,requests:f.adapter.requests,errors:f.errors,finalSurface:agent.session.surface.nodes};
 }finally{releaseGate?.();await h?.dispose();await f.close();}
}
