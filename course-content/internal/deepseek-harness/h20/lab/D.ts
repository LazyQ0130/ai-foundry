import {fixture,assert,createAssistantMessage,createToolResultMessage,ToolCallId,ToolCallRecovery,interruptedTurnClosers} from './support.ts';
export const D_CASES=['not-started','unknown','result','closed-step','idempotency'];
export async function practiceD(kind='unknown'){
 const f=await fixture({retry:false});try{
  const s=f.ctx.sessions.create(),id=ToolCallId('effect');s.append('turn/start',{turn:1});s.append('step/start',{turn:1,step:1});
  s.append('assistant/message',{turn:1,step:1,stream:[],message:createAssistantMessage({source:{provider:'fixture',model:'large'},content:[{type:'tool-call',id,name:'write-fixture',arguments:'{}'}]})},{surfaceOp:'append'});
  let effects=0;const seen=new Map<string,string>();const nonIdempotent=()=>{effects++;return 'resource-'+effects;};const idempotent=(key:string)=>{if(!seen.has(key))seen.set(key,nonIdempotent());return seen.get(key);};
  if(kind!=='not-started')s.append('tool/call',{turn:1,step:1,callId:id,name:'write-fixture',arguments:'{}'});
  if(['unknown','idempotency'].includes(kind))idempotent('operation-1');
  if(kind==='result')s.append('tool/result',{turn:1,step:1,message:createToolResultMessage({callId:id,content:[{type:'text',text:'already recorded'}],isError:false})},{surfaceOp:'append',sourceEventSeqs:[3]});
  if(kind==='closed-step')s.append('step/end',{turn:1,step:1}); // repair must not invent outcomes for a closed step
  const original=[...f.facts.get(s.id)!],recovery=new ToolCallRecovery();original.forEach(e=>recovery.observe(e));const pending=recovery.results(),closers=interruptedTurnClosers(original);
  assert.deepEqual(closers.filter(e=>e.type==='tool/result'),pending);
  const code=closers.find(e=>e.type==='tool/result')?.data.error?.code;
  if(kind==='not-started')assert.equal(code,'TOOL_NOT_STARTED');
  if(kind==='unknown'||kind==='idempotency'){assert.equal(code,'TOOL_OUTCOME_UNKNOWN');assert.equal(effects,1);assert.equal(seen.get('operation-1'),'resource-1');}
  if(kind==='result'||kind==='closed-step')assert.equal(pending.length,0);
  for(const e of closers)s.append(e.type,e.data,{...(e.surfaceOp===undefined?{}:{surfaceOp:e.surfaceOp}),...(e.sourceEventSeqs===undefined?{}:{sourceEventSeqs:e.sourceEventSeqs})});
  assert.deepEqual(f.facts.get(s.id)!.slice(0,original.length),original);assert.deepEqual(interruptedTurnClosers(f.facts.get(s.id)!),[]);
  const effectsAfterRepair=effects;if(kind==='idempotency'){const prior=idempotent('operation-1');assert.equal(prior,'resource-1');assert.equal(effects,1);nonIdempotent();assert.equal(effects,2,'naive repeat duplicates fake effect');}
  return {kind,original,closers,pending,effectsAfterRepair,effectsAfterDemonstration:effects,decision:code==='TOOL_OUTCOME_UNKNOWN'?'inspect external fixture state first; reconcile operation-1, no automatic tool replay':'decide from recorded lifecycle and tool semantics',boundary:'real repair; external world is only an in-memory teaching fixture; closed-step case is component-only'};
 }finally{await f.close();}
}
