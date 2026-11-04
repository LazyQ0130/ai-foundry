import {fixture,history,componentAgent,open,appendTool,assert,user,signal,Basic} from './support.ts';
import {CompactionId,toolPairingBalancedBefore} from '@deepseek-ai/dsh-compaction';
import {selectCompactableRange} from '@deepseek-ai/dsh-compaction-basic/src/region.ts';
import {resolveConfig,resolveTargetPolicy,resolveCompactSpec} from '@deepseek-ai/dsh-compaction-basic/src/config.ts';
export const C_CASES=['success','noop','unbalanced','below','failure','nonshrinking','max','image','rich','cancel','active','changed','partial-commit','end-failed','stale','policy'];
export async function practiceC(kind='success'){
 const f=await fixture();try{
  const s=history(f.ctx,'C-'+kind),a=componentAgent(s);open(s);const log=f.facts.get(s.id)!;const before=[...log],nodes=[...s.surface.nodes];
  const range=selectCompactableRange(s,f.ctx.tokenMeter.measure(s),80)!;assert.ok(range);
  const run=()=>f.compact.compactRegion(range.start,range.end,a,signal());
  if(kind==='policy'){
   const config=resolveConfig({headroomTokens:2000,maxTokens:512,retainRatio:0.16});const policy=resolveTargetPolicy(config,{provider:'fixture',model:'large'});
   const spec=resolveCompactSpec(policy,10000,1000);assert.equal(spec.thresholdTokens,7000);assert.equal(spec.retainTokens,1440);
   assert.throws(()=>resolveCompactSpec(resolveTargetPolicy(resolveConfig(),{provider:'fixture',model:'small'}),1000,128));
   assert.throws(()=>resolveConfig({retainRatio:0.2,retainTokens:10}));return {threshold:7000,retain:1440};
  }
  if(kind==='noop'){const single=f.ctx.sessions.create();single.append('user/message',user('x'.repeat(3000)),{surfaceOp:'append'});assert.equal(selectCompactableRange(single,f.ctx.tokenMeter.measure(single),0),null);return {noWrite:true};}
  if(kind==='below'){assert.equal(await f.compact.compactIfNeeded(a,'pressure',signal()),null);assert.equal(log.length,before.length);return {noWrite:true};}
  if(kind==='unbalanced'){
   // Finish previous open turn, then a tool unit; cutting before its result is unsafe.
   s.append('turn/end',{turn:4,reason:{kind:'completed'}});const t=appendTool(s,'result');assert.equal(toolPairingBalancedBefore(s,t.seq),false);
   await assert.rejects(f.compact.compactRegion(t.seq,t.seq,a),/balanced/);return {rejectedBeforeResult:true};
  }
  if(kind==='active'){s.append('compaction/start',{compactionId:CompactionId('active'),turn:4});const n=log.length;await assert.rejects(run(),/active|progress|busy/);assert.equal(log.length,n);return {busy:true};}
  if(kind==='stale'){s.append('compaction/start',{compactionId:CompactionId('old'),turn:4});s.append('session/end-seed',{});}
  if(kind==='failure')f.adapter.summaryMode='throw';
  if(kind==='nonshrinking')f.adapter.summary='z'.repeat(40000);
  if(kind==='max'||kind==='image'||kind==='rich')f.adapter.summaryMode=kind;
  if(kind==='cancel'){const c=new AbortController();f.adapter.onSummary=()=>c.abort(Error('request cancelled'));await assert.rejects(f.compact.compactRegion(range.start,range.end,a,c.signal),/cancelled/);}
  else {
   if(kind==='changed')f.adapter.onSummary=()=>s.append('user/message',user('external injection'),{surfaceOp:'append'});
   if(kind==='partial-commit'||kind==='end-failed'){
    const original=s.append.bind(s);s.append=((type:any,...args:any[])=>{
     if(kind==='partial-commit'&&type==='user/message')throw Error('replacement rejected');
     if(kind==='end-failed'&&type==='compaction/end')throw Error('end rejected');
     return (original as any)(type,...args);
    }) as any;
   }
   if(['failure','nonshrinking','max','image','changed','partial-commit','end-failed'].includes(kind))await assert.rejects(run());
   else {const result=await run();assert.ok(result.summarySeq>result.startSeq);assert.deepEqual(log.slice(-4).map(e=>e.type),['compaction/start','compaction/summary','user/message','compaction/end']);const replace=log.at(-2)!;assert.deepEqual(replace.sourceEventSeqs,[result.startSeq,result.summarySeq,...result.shadowedSeqs]);assert.ok(s.deriveMessages().some(m=>JSON.stringify(m).includes('<compacted-summary>')));assert.equal(s.surface.nodes[0],nodes[0]);if(kind==='rich'){assert.equal(log.at(-3).data.rawOutput.length,3);assert.equal(result.summary.length,1);}}
  }
  assert.deepEqual(log.slice(0,before.length),before);
  if(['failure','nonshrinking','max','image','cancel','changed'].includes(kind)){assert.equal(log.at(-1).type,'compaction/end');assert.ok(log.at(-1).data.error);assert.ok(!log.slice(before.length).some(e=>e.type==='compaction/summary'));}
  if(kind==='partial-commit'){assert.equal(log.at(-2).type,'compaction/summary');assert.deepEqual(s.surface.nodes,nodes);}
  if(kind==='end-failed'){assert.ok(log.some(e=>e.type==='compaction/summary'));assert.equal(log.at(-1).type,'user/message');const current=selectCompactableRange(s,f.ctx.tokenMeter.measure(s),0)!;await assert.rejects(f.compact.compactRegion(current.start,current.end,a),/active|progress|busy/);}
  return {kind,priorCount:before.length,events:log,surface:s.surface.nodes,requests:f.adapter.requests};
 }finally{await f.close();}
}
