import {fixture,assert,gate,until,bounded,settled,assertStopped,record,writeFile,readFile} from './support.ts';
import {resolve} from 'node:path';
export const cases:[string,()=>Promise<void>][]=[
 ['C C1 cancellation drains a published child and dispose is shared',async()=>{
  const f=await fixture(),hold=gate();let run:any;try{f.fake.behavior=async()=>{await hold.promise;return {output:[],stopReason:'cancelled'};};run=f.start('return await agent("held")');
   await until(()=>f.workflowEvents.some(e=>e.name==='workflow/agent-start'));let ended=false;void run.result.then(()=>{ended=true;});run.cancel('fixture cancel');await until(()=>f.processEvents.every(p=>p.done),'managed process stopped while child held');await new Promise<void>(r=>setImmediate(r));assert.equal(ended,false);assert.equal(f.fake.active,1);
   const d1=run.dispose(),d2=run.dispose();assert.equal(d1,d2);hold.release();const result=await bounded(run.result);await bounded(d1);assert.equal(result.stopReason,'cancelled');assert.equal(f.fake.disposed.length,1);assertStopped(f);
   assert.equal(f.workflowEvents.filter(e=>e.name==='workflow/start').length,1);assert.equal(f.workflowEvents.filter(e=>e.name==='workflow/end').length,1);assert.equal(f.workflowEvents.filter(e=>e.name==='workflow/agent-end').length,1);await record('C1',{result,events:f.workflowEvents,processes:f.processEvents,disposed:f.fake.disposed});
  }finally{hold.release();if(run)await run.dispose();await f.close();}
 }],
 ['C C2 pending startup after cancel is disposed before settlement',async()=>{
  const f=await fixture(),hold=gate();let run:any;try{f.fake.before=async()=>{await hold.promise;};run=f.start('return await agent("starting")');await until(()=>f.fake.started.length===1);run.cancel();let settled=false;void run.result.then(()=>{settled=true;});await until(()=>f.processEvents.every(p=>p.done),'managed process stopped while startup held');await new Promise<void>(r=>setImmediate(r));assert.equal(settled,false);hold.release();const result=await bounded(run.result);await run.dispose();assert.equal(result.stopReason,'cancelled');assert.deepEqual(f.fake.disposed,['starting']);assertStopped(f);await record('C2',{result,disposed:f.fake.disposed,events:f.workflowEvents,settledBeforeLatePublication:false});
  }finally{hold.release();if(run)await run.dispose();await f.close();}
 }],
 ['C C3 cancel post-await infinite guest work without killing test process',async()=>{
  const f=await fixture();try{const run=f.start('await agent("ready");log("enter busy slice");await Promise.resolve();while(true){}');await until(()=>f.workflowEvents.some(e=>e.name==='workflow/log'));run.cancel('stop busy guest');const result=await settled(f,run);assert.equal(result.stopReason,'cancelled');assertStopped(f);await record('C3',{result,processes:f.processEvents});}finally{await f.close();}
 }],
 ['C C4 phase/log are observations; listener failures are isolated',async()=>{
  const f=await fixture();try{f.ctx.on('workflow/phase',()=>{throw Error('sync listener fixture');});f.ctx.on('workflow/log',async()=>{throw Error('async listener fixture');});const result=await settled(f,f.start('phase("Undeclared annotation");log("fixture progress");return await agent("A")'));
   assert.equal(result.stopReason,'completed');assert.equal(f.workflowEvents.filter(e=>e.name==='workflow/phase').length,1);assert.equal(f.workflowEvents.filter(e=>e.name==='workflow/log').length,1);assert.equal(f.events(f.parent).filter((e:any)=>e.type.startsWith('tool-workflow/')).length,0);assertStopped(f);await record('C4',{result,events:f.workflowEvents});
  }finally{await f.close();}
 }],
 ['C C5 native read-only runner rejects writes through a VM escape',async()=>{
  const f=await fixture();try{const outside=resolve(process.env.H22_RUN_ROOT!,'denial-fixture.txt');await writeFile(outside,'unchanged');const result=await settled(f,f.start('const p=globalThis.constructor.constructor("return process")();const fs=p.getBuiltinModule("node:fs");try{fs.writeFileSync(args.outside,"changed");return {denied:false}}catch(e){return {denied:true,code:e.code}}',{args:{outside}}));
   assert.equal(result.stopReason,'completed',result.error);assert.equal((result.value as any).denied,true);assert.equal(await readFile(outside,'utf8'),'unchanged');assert.ok(f.processEvents.every(p=>p.argv.includes('read-only')));assertStopped(f);await record('C5',{result,processes:f.processEvents,contents:'unchanged',limit:'one Windows ACL fixture denial; no network or universal sandbox certification'});
  }finally{await f.close();}
 }],
];
