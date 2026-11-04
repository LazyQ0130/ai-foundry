import {fixture,assert,gate,until,settled,assertStopped,blocks,record} from './support.ts';
export const cases:[string,()=>Promise<void>][]=[
 ['C B6 Subagent capacity can reject below Workflow concurrency',async()=>{
  const f=await fixture();try{f.limits.capacity=1;f.fake.behavior=async(_p,req)=>{if(!req.signal.aborted)await new Promise<void>(r=>req.signal.addEventListener('abort',()=>r(),{once:true}));return {output:[],stopReason:'aborted'};};
   const result=await settled(f,f.start('return await parallel([()=>agent("A"),()=>agent("B")])'));assert.equal(result.stopReason,'error');assert.match(result.error!,/could not start a child/);assert.equal(f.fake.peak,1);assertStopped(f);await record('B6',{result,started:f.fake.started,disposed:f.fake.disposed,limits:{workflow:2,subagent:1}});
  }finally{await f.close();}
 }],
 ['C B7 structured output present versus absent on completed child',async()=>{
  const f=await fixture();try{f.fake.behavior=async(p)=>({output:blocks('ignored text'),stopReason:'completed',...p==='valid'?{structured:{count:3}}:{}});const result=await settled(f,f.start('return await parallel([()=>agent("valid",{schema:{type:"object",properties:{count:{type:"number"}},required:["count"]}}),()=>agent("missing",{schema:{type:"object"}})])'));assert.equal(result.stopReason,'completed');assert.deepEqual(result.value,[{count:3},null]);assertStopped(f);await record('B7',result);}finally{await f.close();}
 }],
 ['C B1 parallel starts together and collects input order',async()=>{
  const f=await fixture(),a=gate(),b=gate(),finished:string[]=[];try{
   f.fake.behavior=async(p)=>{await(p==='A'?a:b).promise;finished.push(p);return {output:blocks(p),stopReason:'completed'};};
   const run=f.start('return await parallel([()=>agent("A"),()=>agent("B")])');
   await until(()=>f.fake.started.length===2,'two active children');assert.equal(f.fake.peak,2);b.release();await until(()=>finished.includes('B'));assert.deepEqual(finished,['B']);a.release();
   const result=await settled(f,run);assert.deepEqual(result.value,['A','B']);assertStopped(f);await record('B1',{result,finished,started:f.fake.started,events:f.workflowEvents});
  }finally{a.release();b.release();await f.close();}
 }],
 ['C B2 pipeline is per-item order without a cross-stage barrier',async()=>{
  const f=await fixture(),hold=gate();try{f.fake.behavior=async(p)=>{if(p==='B1')await hold.promise;return {output:blocks(p),stopReason:'completed'};};
   const run=f.start('return await pipeline(["A","B"],(prev,item,index)=>agent(item+"1"),(prev,item,index)=>agent(item+"2:"+prev+":"+index))');
   await until(()=>f.fake.started.includes('A2:A1:0'),'A reaches second stage while B1 held');assert.ok(!f.fake.disposed.includes('B1'));hold.release();
   const result=await settled(f,run);assert.deepEqual(result.value,['A2:A1:0','B2:B1:1']);assertStopped(f);await record('B2',{result,startOrder:f.fake.started});
  }finally{hold.release();await f.close();}
 }],
 ['C B3 ordinary child failure and ordinary thunk throw become null',async()=>{
  const f=await fixture();try{f.fake.behavior=async(p)=>({output:blocks(p),stopReason:p==='bad'?'error':'completed'});
   const result=await settled(f,f.start('return {p:await parallel([()=>agent("bad"),()=>{throw Error("ordinary")}]),q:await pipeline(["drop","keep"],(prev,item)=>{if(item==="drop")throw Error("skip");return item},prev=>agent(prev))}'));
   assert.equal(result.stopReason,'completed');assert.deepEqual(result.value,{p:[null,null],q:[null,'keep']});assert.deepEqual(f.fake.started,['bad','keep']);
   const nullValue=await settled(f,f.start('return await pipeline([1],()=>null,prev=>({received:prev}))'));assert.deepEqual(nullValue.value,[{received:null}]);assertStopped(f);await record('B3',{result,nullValue});
  }finally{await f.close();}
 }],
 ['C B4 fatal options/schema and broken provider survive combinators',async()=>{
  const f=await fixture();try{const out=[];
   for(const script of ['return await parallel([()=>agent("A",{effort:"high"})])','return await pipeline([1],()=>agent("A",{schema:{type:"string"}}))'])out.push(await settled(f,f.start(script)));
   f.fake.behavior=async()=>{throw Error('broken result channel');};out.push(await settled(f,f.start('return await parallel([()=>agent("A")])')));
   for(const r of out)assert.equal(r.stopReason,'error');assert.match(out[0].error!,/deferred/);assert.match(out[1].error!,/schema/);assert.match(out[2].error!,/child agent run failed/);assertStopped(f);await record('B4',out);
  }finally{await f.close();}
 }],
 ['C B5 concurrency slots, queued total count and item cap differ',async()=>{
  const f=await fixture({engine:{maxConcurrentAgents:1,maxTotalAgents:3,maxItemsPerCall:3}}),hold=gate();try{
   f.fake.behavior=async(p)=>{if(p==='A')await hold.promise;return {output:blocks(p),stopReason:'completed'};};
   const run=f.start('return await parallel([()=>agent("A"),()=>agent("B"),()=>agent("C")])');await until(()=>f.fake.started.length===1);assert.deepEqual(f.fake.started,['A']);hold.release();
   const ok=await settled(f,run);assert.equal(ok.agentsStarted,3);assert.equal(f.fake.peak,1);
   const total=await settled(f,f.start('await agent("D");await agent("E");return await agent("F")',{maxTotalAgents:2}));assert.equal(total.stopReason,'error');assert.match(total.error!,/total agent cap/);
   const count=f.fake.started.length,item=await settled(f,f.start('return await parallel([()=>agent("must-not-start"),()=>2,()=>3,()=>4])'));assert.equal(item.stopReason,'error');assert.equal(f.fake.started.length,count);assert.match(item.error!,/per-call cap/);assertStopped(f);await record('B5',{ok,total,item,peak:f.fake.peak});
  }finally{hold.release();await f.close();}
 }],
];
