import {fixture,assert,settled,assertStopped,record} from './support.ts';
export const cases:[string,()=>Promise<void>][]=[
 ['C A1 real engine: meta, args, top-level await and JSON result',async()=>{
  const f=await fixture();try{const run=f.start('return {review:await agent("README fixture"),count:args.count}',{args:{count:3}});const result=await settled(f,run);
   assert.deepEqual(result,{value:{review:'README fixture=ok',count:3},stopReason:'completed',agentsStarted:1});assertStopped(f);
   await record('A1',{result,events:f.workflowEvents,processes:f.processEvents});
  }finally{await f.close();}
 }],
 ['C A2 pre-publication validation: meta, parse, provider, cap',async()=>{
  const f=await fixture();try{
   for(const [script,extra,code] of [['return 1',{meta:{name:'missing-description'}},'META_INVALID'],['const x: number = 1; return x',{},'SCRIPT_PARSE'],['export const meta = {};',{},'SCRIPT_PARSE'],['return 1',{subagentProvider:'missing'},'AGENT_START'],['return 1',{maxTotalAgents:9},'INVALID_ARGUMENT']] as any[])assert.throws(()=>f.start(script,extra),(e:any)=>e.code===code);
   assert.equal(f.workflowEvents.length,0);assert.equal(f.processEvents.length,0);await record('A2',{events:f.workflowEvents,spawned:0});
  }finally{await f.close();}
 }],
 ['C A3 result resolves on script/JSON errors; undefined becomes null',async()=>{
  const f=await fixture();try{const out=[];
   for(const script of ['return undefined','return {nested:undefined}','return 1n','throw new Error("fixture script failed")'])out.push(await settled(f,f.start(script)));
   assert.equal(out[0].stopReason,'completed');assert.equal(out[0].value,null);for(const r of out.slice(1)){assert.equal(r.stopReason,'error');assert.equal(r.value,null);assert.ok(r.error);}
   assert.match(out[1].error!,/plain JSON/);assertStopped(f);await record('A3',out);
  }finally{await f.close();}
 }],
 ['C A4 args clone is not lossless JSON validation',async()=>{
  const f=await fixture();try{assert.throws(()=>f.start('return args',{args:()=>1}));const result=await settled(f,f.start('return args',{args:new Map([['a',1]])}));
   assert.equal(result.stopReason,'error');assertStopped(f);await record('A4',result);
  }finally{await f.close();}
 }],
];
