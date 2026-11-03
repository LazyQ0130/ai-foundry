import {assert,backend,freshRoot,header,SessionId,user} from './support.ts';
export async function bufferPractice(){
 const root=await freshRoot('buffer'),f=await backend(root),h=header('buffered');
 try{
  const w=await f.store.create(h);await w.flush(); // 先有一个真实空磁盘产物。
  const s=f.ctx.sessions.create(h.id,{meta:{createdAt:0}});
  const original=(f.store as any).persistBatch.bind(f.store);let failing=true,calls=0;
  // 仅本次实例的存储边界注入故障，官方方法与磁盘原语不改。
  (f.store as any).persistBatch=async(...args:any[])=>{calls++;if(failing)throw Error('controlled persistence failure');return original(...args);};
  s.append('user/message',user('缓冲里的消息'),{surfaceOp:'append'});
  assert.equal(s.seq,1);assert.equal((await w.read()).events.length,0); // 明确flush之前，事件尚在write-behind。
  await assert.rejects(f.ctx.sessions.flush(s),/controlled persistence failure/);
  assert.equal(s.seq,1);assert.equal((await w.read()).events.length,0);
  failing=false;assert.equal(await f.ctx.sessions.flush(s),true);
  assert.equal((await w.read()).events.length,1);assert.equal(calls,2);
  s.append('user/message',user('close也必须排空'),{surfaceOp:'append'});await w.close();
  const r=await f.store.open(h.id,'read');const read=await r.read();assert.equal(read.events.length,2);
  s.append('user/message',user('已无写句柄，不能假定存储'),{surfaceOp:'append'});
  const flushWithoutWriter=await f.ctx.sessions.flush(s);assert.equal(flushWithoutWriter,true);
  assert.equal((await r.read()).events.length,2);assert.equal(s.seq,3);await r.close();
  return {root,events:read.events,failedFlush:'observed and retained',retryFlush:'PASS',closeDrained:true,flushWithoutWriter,
   memoryEventsAfterWriterClosed:3,storedEventsAfterWriterClosed:2,storageFault:'instance method injection; not physical disk fsync failure',artifacts:'retained for review'};
 }finally{await f.close();}
}
