import {fixture,assert,settled,record,readFile} from './support.ts';
import GoalService from '@deepseek-ai/dsh-goal';
import Storage from '@deepseek-ai/dsh-storage';
import {DomainFacility} from '@deepseek-ai/dsh-storage-domain';
import {JsonStorageBackend} from '@deepseek-ai/dsh-storage-json';
import ScheduleService from '@deepseek-ai/dsh-schedule';
import {mkdtemp} from 'node:fs/promises';
import {resolve} from 'node:path';
export const cases:[string,()=>Promise<void>][]=[
 ['C boundary missing confinement fails closed without spawning',async()=>{
  const f=await fixture();try{Object.defineProperty(f.ctx.ptcRuntime,'sandboxMode',{get:()=>undefined});const result=await settled(f,f.start('return 1'));assert.equal(result.stopReason,'error');assert.equal(f.processEvents.length,0);await record('confinement',{result,processes:f.processEvents});}finally{await f.close();}
 }],
 ['C boundary Goal revision, pause and disarm differ from durable phase',async()=>{
  const f=await fixture();try{await f.ctx.plugin(GoalService);const created=f.ctx.goals.create(f.parent,{objective:'Review fictional fixture',maxGoalRounds:2});assert.equal(created.activation,'armed');const paused=f.ctx.goals.pause(f.parent,created);assert.equal(paused.phase,'paused');assert.throws(()=>f.ctx.goals.resume(f.parent,created));const resumed=f.ctx.goals.resume(f.parent,paused),disarmed=f.ctx.goals.disarm(f.parent)!;assert.equal(disarmed.phase,'active');assert.equal(disarmed.activation,'disarmed');assert.equal(disarmed.revision,resumed.revision);assert.equal(f.adapter.requests.length,0);await record('goal',{created,paused,resumed,disarmed,events:f.events(f.parent),limit:'service and Session transitions; Goal round driver not mounted'});}finally{await f.close();}
 }],
 ['C boundary Schedule persists a future trigger independently of WorkflowRun',async()=>{
  const root=await mkdtemp(resolve(process.env.H22_RUN_ROOT!,'schedule-'));const observations=[];let id:string|undefined;
  for(let i=0;i<2;i++){const f=await fixture();let facility:any,backend:any;try{
   await f.ctx.plugin(Storage);backend=new JsonStorageBackend(root);f.ctx.storage.backend.register('fixture',backend);facility=new DomainFacility(f.ctx,{backend:'fixture'});const unmount=f.ctx.storage.mount('domain',facility);f.ctx.provide('storageDomain',facility);f.ctx.effect(()=>async()=>{await facility.closeAll();unmount();await backend.close();});await f.ctx.plugin(ScheduleService,{});
   if(i===0){await assert.rejects(f.ctx.schedule.create(f.parent.id,{title:'fixture',prompt:'fictional',at:'2099-01-01T00:00:00Z',every_seconds:86400}));const task=await f.ctx.schedule.create(f.parent.id,{title:'Future fixture',prompt:'Review fictional fixture only',at:'2099-01-01T00:00:00Z'});id=task.id;}
   const tasks=await f.ctx.schedule.list({sessionId:f.parent.id});assert.equal(tasks.length,1);assert.equal(tasks[0].id,id);assert.equal(f.adapter.requests.length,0);assert.equal(f.workflowEvents.length,0);observations.push(tasks);
  }finally{await f.close();}}
  await record('schedule',{root,observations,bytes:await readFile(resolve(root,'schedule.json'),'utf8'),limit:'new Context + real JSON readback of future trigger; no due delivery or application restart test'});
 }],
];
