import {z} from 'zod';
import SessionProjectionRegistry from '@deepseek-ai/dsh-session-projection';
import type {ProjectionDefinition} from '@deepseek-ai/dsh-session-projection';
import {assert,fixture} from './support.ts';
export type TaskState={status:'idle'|'running'|'completed'|'error';turn:number;finished:number};
declare module '@deepseek-ai/dsh-session-projection/types' {interface SessionProjectionMap {'h17/task':TaskState}}
const schema=z.object({status:z.enum(['idle','running','completed','error']),turn:z.number().int().nonnegative(),finished:z.number().int().nonnegative()});
export const taskDefinition={key:'h17/task',stateSchema:schema,stateVersion:1,
 init:()=>({status:'idle',turn:0,finished:0} as TaskState),
 apply:(state:TaskState,event)=>event.type==='turn/start'?{...state,status:'running' as const,turn:event.data.turn}
  :event.type==='turn/end'?{...state,status:event.data.reason.kind==='completed'?'completed' as const:'error' as const,finished:state.finished+1}:state,
 wire:{viewSchema:schema,view:(state:TaskState)=>state},
} satisfies ProjectionDefinition<'h17/task',TaskState>;
export async function projectionPractice(){
 const f=await fixture('h17-C');const {ctx,session:s}=f;
 try{
  await ctx.plugin(SessionProjectionRegistry);
  const handle=await ctx.sessionProjections.register(taskDefinition),changes:any[]=[];
  const stop=ctx.sessionProjections.onChanged((session,key,value,seq)=>changes.push({id:session.id,key,value,seq}));
  const initial=handle.stateOf(s);assert.equal(initial.status,'idle');
  s.append('step/start',{turn:1,step:1});assert.equal(handle.stateOf(s),initial);assert.equal(changes.length,0);
  s.append('turn/start',{turn:1});assert.notEqual(handle.stateOf(s),initial);
  s.append('step/end',{turn:1,step:1});assert.equal(changes.length,1);
  s.append('turn/end',{turn:1,reason:{kind:'completed'}});
  assert.equal(changes.length,2);const snap=ctx.sessionProjections.snapshot(s);
  assert.equal(snap.asOfSeq,3);assert.deepEqual(snap.values['h17/task'],{status:'completed',turn:1,finished:1});
  // register 的兼容返回值既可调用(disposer)又可 await；assert.rejects 必须接 Promise。
  await assert.rejects(Promise.resolve(ctx.sessionProjections.register({...taskDefinition,stateVersion:2})),/stateVersion/);
  const cached={ 'h17/task':{ver:1,seq:3,val:handle.stateOf(s)} };
  assert.deepEqual(ctx.sessionProjections.viewCheckpoint(cached),snap.values);
  assert.deepEqual(ctx.sessionProjections.viewCheckpoint({'h17/task':{ver:2,seq:3,val:handle.stateOf(s)}}),{});
  assert.deepEqual(ctx.sessionProjections.viewCheckpoint({'h17/task':{ver:1,seq:3,val:{status:123}}}),{});
  stop();await handle.dispose();assert.deepEqual(ctx.sessionProjections.snapshot(s).values,{});
  s.append('turn/start',{turn:2});assert.equal(handle.stateOf(s).status,'running');assert.equal(changes.length,2);
  return {initial,snapshot:snap,changes,retainedReader:handle.stateOf(s),incompatibleVersion:'rejected/skipped',malformedState:'skipped',
   limitation:'viewCheckpoint receives in-memory rows; no disk cache or restore test'};
 }finally{await f.close();}
}
