import {fixture,history,componentAgent,open,assert,user,SessionId,signal,imageRef} from './support.ts';
import {offloadOldestImages} from '@deepseek-ai/dsh-compaction-image-offload/src/image-offload.ts';
import {projectOffloadedImages,offloadedImageText,LlmError} from '@deepseek-ai/dsh-llm';
import Commands from '@deepseek-ai/dsh-commands';
import * as CommandCompact from '@deepseek-ai/dsh-command-compact';
export async function imageOccurrences(){
 const f=await fixture();try{
  const s=history(f.ctx,'images'),first=s.append('user/message',user('',[{type:'image',attachment:imageRef()},{type:'image',attachment:imageRef()}]),{surfaceOp:'append'}),second=s.append('user/message',user('',[{type:'image',attachment:imageRef()}]),{surfaceOp:'append'});
  const nodes=[...s.surface.nodes];assert.equal(offloadOldestImages(s,nodes,1),true);assert.equal(offloadOldestImages(s,nodes,1),true);
  const decisions=f.facts.get(s.id)!.filter(e=>e.type==='image/offload');assert.deepEqual(decisions.map(e=>e.data.targets),[[{seq:first.seq,imageIndexes:[0]}],[{seq:first.seq,imageIndexes:[1]}]]);
  assert.deepEqual(s.surface.nodes,nodes);assert.equal((s.deriveMessages().at(-1)!.content[0] as any).offloaded,undefined);
  const projected=projectOffloadedImages(s.deriveMessages(),ref=>offloadedImageText(ref));assert.ok(JSON.stringify(projected).includes('image omitted to fit request image limits'));
  assert.equal((first.data.content[0] as any).offloaded,undefined);assert.throws(()=>s.append('image/offload',{targets:[{seq:first.seq,imageIndexes:[0]}]}),/offload|already/);
  const c=new AbortController();c.abort(Error('stop'));
  assert.throws(()=>f.ctx.waterfall('compaction/summary-error',{session:s,sourceEventSeqs:[second.seq],error:new LlmError('images','IMAGE_OFFLOAD_REQUIRED',{offloadImages:1}),signal:c.signal},()=>false),/stop/);
  open(s);let n=0;const original=f.adapter.stream.bind(f.adapter);
  f.adapter.stream=async function*(options:any){if(options.purpose==='compaction'&&n++===0)throw new LlmError('images','IMAGE_OFFLOAD_REQUIRED',{offloadImages:1});yield* original(options);};
  const result=await f.compact.compactRegion(s.surface.nodes[1],second.seq,componentAgent(s),signal());
  assert.ok(result);assert.equal(f.facts.get(s.id)!.filter(e=>e.type==='image/offload').length,3);
  assert.equal(f.facts.get(s.id)!.filter(e=>e.type==='compaction/start').length,1);
  return {events:f.facts.get(s.id),projected,summaryAttempts:n};
 }finally{await f.close();}
}
export async function humanCommand(){
 const f=await fixture({loop:true});let h:any;try{
  await f.ctx.plugin(Commands);await f.ctx.plugin(CommandCompact);
  const seed=history(f.ctx,'command-seed');h=await f.ctx.agents.create({sessionId:SessionId('command-agent'),seed:f.facts.get(seed.id)!,agentOptions:{provider:'fixture',model:'large'}});
  const before=f.adapter.ordinary,answer=await f.ctx.commands.execute(h.agent,'/compact',[],signal());assert.equal(answer!.result.kind,'success');assert.ok(answer!.result.sourceEventSeq!==undefined);assert.equal(f.adapter.ordinary,before);
  const events=f.facts.get(h.agent.id)!,run=events.find(e=>e.type==='command/run'),done=events.find(e=>e.type==='command/done');assert.equal(done.data.commandId,run.data.commandId);assert.equal(done.data.sourceEventSeq,events.find(e=>e.type==='compaction/summary').seq);
  const bad=await f.ctx.commands.execute(h.agent,'/compact now',[],signal());assert.equal(bad!.result.kind,'error');assert.ok(bad!.result.text.includes('no arguments'));
  assert.ok(!h.agent.session.surface.nodes.includes(run.seq));assert.ok(!h.agent.session.surface.nodes.includes(done.seq));return {answer,bad,events,ordinaryRequests:before};
 }finally{await h?.dispose();await f.close();}
}
export async function manualPersistenceFailure(){
 const f=await fixture({loop:true});let h:any;try{
  const seed=history(f.ctx,'save-failure-seed');h=await f.ctx.agents.create({sessionId:SessionId('save-failure'),seed:f.facts.get(seed.id)!,agentOptions:{provider:'fixture',model:'large'}});
  f.ctx.on('session/flush',async()=>{throw Error('checkpoint unavailable');});
  await assert.rejects(f.compact.compactNow(h.agent,signal()),(e:any)=>e.code==='persistence');const events=f.facts.get(h.agent.id)!;assert.equal(events.at(-1).type,'compaction/end');assert.ok(h.agent.session.deriveMessages().some(m=>JSON.stringify(m).includes('<compacted-summary>')));return {events};
 }finally{await h?.dispose();await f.close();}
}
