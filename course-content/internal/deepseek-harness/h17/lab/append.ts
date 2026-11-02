import {assert,fixture,user,SessionSeq,SessionLogOffset,view} from './support.ts';
export async function appendPractice(){
 const f=await fixture('h17-A');const {session:s,events,ctx}=f;
 try{
  assert.equal(ctx.sessions.get(s.id),s);assert.equal(events.length,0); // Header 在日志之外。
  s.append('turn/start',{turn:1});
  const input=structuredClone(user('读取 README'));const event=s.append('user/message',input,{surfaceOp:'append'});
  (input.content[0] as {text:string}).text='调用方后来改写';
  assert.equal((event.data.content[0] as {text:string}).text,'读取 README');
  assert.ok(Object.isFrozen(event)&&Object.isFrozen(event.data.content));
  assert.throws(()=>{(event.data.content[0] as {text:string}).text='改日志';},TypeError);
  const before=s.deriveMessages(),nodes=[...s.surface.nodes],count=s.seq;
  const invalid=[undefined,NaN,Infinity,-0,1n,()=>0,Symbol('x'),new Date(),new Map(),[,1]];
  const cycle:any={};cycle.self=cycle;invalid.push(cycle);
  for(const bad of invalid){
   assert.throws(()=>s.append('turn/start',{turn:1,bad} as any),/JSON/);
   assert.equal(s.seq,count);assert.equal(events.length,count);
   assert.deepEqual(s.deriveMessages(),before);assert.deepEqual(s.surface.nodes,nodes);
  }
  s.append('step/start',{turn:1,step:1});
  assert.deepEqual(events.map(e=>e.seq),[0,1,2]);
  assert.equal(SessionSeq(2),2);assert.equal(SessionLogOffset(s.seq),3);
  const noBackend=await ctx.sessions.flush(s);assert.equal(noBackend,false);
  let calls=0;ctx.on('session/flush',()=>{calls++;});
  s.append('step/end',{turn:1,step:1});assert.equal(calls,0);
  assert.equal(await ctx.sessions.flush(s),true);assert.equal(calls,1);
  return {...view(s,events),rejected:invalid.length,snapshotFrozen:true,noBackend,flushCalls:calls,
   limitation:'flush listener is a counter, not a persistence backend'};
 }finally{await f.close();}
}
