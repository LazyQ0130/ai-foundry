import {fixture,assert,gate,until,bounded,text,call,user,hasText,meta,record} from './support.ts';
import LocalJobs from '@deepseek-ai/dsh-jobs-local';
import * as ToolJobs from '@deepseek-ai/dsh-tool-jobs';
import {integrated} from './X.ts';
export const cases:[string,()=>Promise<void>][]=[
 ['D D1 foreground parent tool, three real children, Session and next model request',async()=>{await integrated();}],
 ['D D2 tool schema, error mapping and rendered cap',async()=>{
  const f=await fixture({tool:true,background:false});try{
   f.adapter.scripts.set('parent',[call('workflow',{meta,script:'return await agent("bad",{effort:"high"})'}),text('RECOVER_AFTER_TOOL_ERROR')]);f.parent.followup(user('Run a controlled workflow.'));await bounded(f.parent.whenIdle());const first=f.events(f.parent).find((e:any)=>e.type==='tool/result');assert.equal(first.data.message.isError,true);
   const def=f.ctx.tools.get('workflow',f.parent)!;assert.equal(JSON.stringify(def.parameters).includes('run_in_background'),false);
   f.adapter.scripts.set('parent',[call('workflow',{meta,script:'return "x".repeat(300)'}),text('DONE')]);f.parent.followup(user('Return a long fixture value with workflow.'));await bounded(f.parent.whenIdle());
   const results=f.events(f.parent).filter((e:any)=>e.type==='tool/result');assert.equal(results[1].data.message.isError,false);assert.ok(hasText([results[1]],'truncated'));await record('D2',{results,requests:f.adapter.requests});
  }finally{await f.close();}
 }],
 ['D D3 background receipt, observer log, job_output and notification',async()=>{
  const f=await fixture({tool:true}),hold=gate();let entered=0;try{
   await f.ctx.plugin(LocalJobs);await f.ctx.plugin(ToolJobs,{completionDelivery:'quiet',inlineOutputBytes:0});
   f.adapter.scripts.set('child',[async function*(){entered++;await hold.promise;yield*text('BACKGROUND_REPORT');}]);
   f.adapter.scripts.set('parent',[call('workflow',{meta,script:'phase("Inspect");log("observer-only");return await agent("background",{model:"child"})',run_in_background:true}),text('BACKGROUND_ACCEPTED')]);
   f.parent.followup(user('Use a background workflow for the fictional facts.'));await bounded(f.parent.whenIdle());await until(()=>entered===1);
   const job=f.ctx.jobs.list(f.parent.id)[0];assert.equal(job.status,'running');const receipt=f.events(f.parent).find((e:any)=>e.type==='tool/result');assert.ok(hasText([receipt],job.id));
   await until(()=>hasText([f.ctx.jobs.readAt(job.id,0,f.parent.id)],'observer-only'),'progress reached observer ring');const observer=f.ctx.jobs.readAt(job.id,0,f.parent.id);assert.ok(hasText([observer],'observer-only'));
   const running=await f.exec(f.parent,'job_output',{job_id:job.id});assert.equal(hasText([running],'observer-only'),false);
   hold.release();await until(()=>f.ctx.jobs.get(job.id,f.parent.id).status==='completed','background settlement');const terminal=f.ctx.jobs.get(job.id,f.parent.id);await until(()=>f.parent.inbox.nextStep.some((m:any)=>m.source.kind==='tool-jobs'),'quiet completion notice');
   const notice=[...f.parent.inbox.nextStep];const final=await f.exec(f.parent,'job_output',{job_id:job.id});assert.ok(hasText([final],'BACKGROUND_REPORT'));const again=await f.exec(f.parent,'job_output',{job_id:job.id});assert.equal(hasText([again],'BACKGROUND_REPORT'),false);assert.equal(f.parent.inbox.nextStep.some((m:any)=>m.source.kind==='tool-jobs'),false);
   assert.equal(f.processEvents.every(p=>p.done),true);await record('D3',{receipt,observer,running,terminal,notice,final,again,events:f.workflowEvents,parent:f.events(f.parent)});
  }finally{hold.release();await f.close();}
 }],
 ['D D4 background job_kill cancels and drains its workflow',async()=>{
  const f=await fixture({tool:true}),hold=gate();let entered=0;try{await f.ctx.plugin(LocalJobs);await f.ctx.plugin(ToolJobs,{completionDelivery:'quiet',inlineOutputBytes:0});
   f.adapter.scripts.set('child',[async function*(){entered++;await hold.promise;yield*text('late result');}]);f.adapter.scripts.set('parent',[call('workflow',{meta,script:'return await agent("held",{model:"child"})',run_in_background:true}),text('ACCEPTED')]);f.parent.followup(user('Run a background workflow.'));await bounded(f.parent.whenIdle());await until(()=>entered===1);
   const job=f.ctx.jobs.list(f.parent.id)[0],kill=await f.exec(f.parent,'job_kill',{job_id:job.id});assert.equal(f.ctx.jobs.get(job.id,f.parent.id).status,'stopping');hold.release();const terminal=await bounded(f.ctx.jobs.wait(job.id,10000,f.parent.id));assert.equal(terminal.status,'killed');assert.equal(f.processEvents.every(p=>p.done),true);assert.equal(f.lifecycle.filter(e=>e.edge==='start').length,f.lifecycle.filter(e=>e.edge==='end').length);await record('D4',{kill,terminal,events:f.workflowEvents,lifecycle:f.lifecycle});
  }finally{hold.release();await f.close();}
 }],
];
