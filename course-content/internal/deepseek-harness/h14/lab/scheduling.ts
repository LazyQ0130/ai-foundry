import {harness,MockAdapter,callChunks,textChunks,call,infoTool,gate,reached,send} from './support.ts';
export type ScheduleCase='parallel'|'limit-one'|'body-error'|'rolling'|'reclassify';
export async function schedulingPractice(kind:ScheduleCase='parallel'){
 const order=kind==='rolling'?['A','B','D','C']:['A','B','C'];
 const adapter=new MockAdapter([callChunks(order.map(id=>call(id,id))),textChunks()]);
 const h=await harness(adapter,kind==='limit-one'?1:2),trace:string[]=[];
 const started=Object.fromEntries(order.map(id=>[id,gate()])),ended=Object.fromEntries(order.map(id=>[id,gate()]));
 const release=Object.fromEntries(order.map(id=>[id,gate()]));let bParallel=true,observedEarly:string[]=[];
 try{
  const agent=await h.create('schedule-'+kind);
  for(const id of order)h.ctx.tools.register(infoTool(id,async()=>{trace.push('start:'+id);h.record('tool','body.start',{callId:id});started[id].resolve();await release[id].promise;
   trace.push('end:'+id);h.record('tool','body.end',{callId:id});ended[id].resolve();if(kind==='body-error'&&id==='B')throw Error('B业务失败');return {title:id,chars:1};},
   {isConcurrencySafe:()=>id!=='C'&&(id!=='B'||bParallel)}));
  h.ctx.on('tools/result',(exec)=>{trace.push('observe:'+exec.callId);});
  h.ctx.on('session/event',(_s,e)=>{if(e.type==='tool/result')trace.push('commit:'+e.data.message.toolCallId);});
  if(kind==='reclassify')h.ctx.on('tools/pre-execute',async(exec,next)=>{if(exec.callId==='A')bParallel=false;return next();});
  const work=send(agent);await reached(started.A.promise,work);
  if(kind==='limit-one'||kind==='reclassify'){
   observedEarly=[...trace];release.A.resolve();await reached(started.B.promise,work);release.B.resolve();
  }else{
   await reached(started.B.promise,work);release.B.resolve();await reached(ended.B.promise,work);
   if(kind==='rolling'){await reached(started.D.promise,work);observedEarly=[...trace];release.D.resolve();await reached(ended.D.promise,work);}
   else observedEarly=[...trace];
   release.A.resolve();
  }
  await reached(started.C.promise,work);release.C.resolve();await work;
  return {kind,order,observedEarly,trace,...h.capture(agent)};
 }finally{for(const g of Object.values(release))g.resolve();await h.close();}
}
