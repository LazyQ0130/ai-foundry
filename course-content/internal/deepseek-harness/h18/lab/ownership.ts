import {SessionAlreadyOwnedError,SessionPersistenceNotFoundError} from '@deepseek-ai/dsh-session-persistence';
import {assert,backend,freshRoot,header,events,removeOne} from './support.ts';
import {worker,startWorker} from './process.ts';
export async function leasePractice(){
 const root=await freshRoot('lease'),h=header('lease'),f=await backend(root);let held:any;
 try{
  const w=await f.store.create(h);await w.append(events());await w.flush();
  const path=(await f.store.stat(h.id))!.location!.path;
  const read=await worker('read',root,h.id,'none');assert.equal(read.ok,true);
  const conflict=await worker('write',root,h.id,'none');assert.equal(conflict.ok,false);assert.equal(conflict.error,'SessionAlreadyOwnedError');
  const peer=await backend(root);try{await assert.rejects(peer.store.open(h.id,'write'),SessionAlreadyOwnedError);}finally{await peer.close();}
  await w.close();const afterRelease=await worker('write',root,h.id,'none');assert.equal(afterRelease.ok,true);
  held=startWorker('hold',root,h.id,'none');const ready=await held.first;assert.equal(ready.ok,true);
  await assert.rejects(f.store.open(h.id,'write'),SessionAlreadyOwnedError);
  held.child.kill();const killed=await held.done; // 只终止本次创建且PID已记录的测试子进程。
  const recovered=await f.store.open(h.id,'write');assert.deepEqual((await recovered.read()).events,read.events);await recovered.close();
  await f.close();return {root,parentPid:process.pid,read,conflict,afterRelease,heldPid:ready.pid,killed,writeAfterHolderExit:true,
   scope:'actual Windows same logon session, separate Node processes; not POSIX/network FS/power loss',removedFile:await removeOne(root,path)};
 }finally{if(held?.child.exitCode===null)held.child.kill();await f.close();}
}
export async function emptyPractice(){
 const root=await freshRoot('empty'),h=header('empty'),f=await backend(root),other=await backend(root);
 try{
  const pending=await f.store.create(h);assert.ok(await f.store.stat(h.id));assert.equal(await other.store.stat(h.id),undefined);
  await assert.rejects(other.store.open(h.id,'read'),SessionPersistenceNotFoundError);
  await pending.close();assert.equal(await f.store.stat(h.id),undefined); // 未实体化空会话close并不偷偷建立文件。
  const w=await f.store.create(h);await w.flush();const seen=(await other.store.stat(h.id))!;assert.ok(seen.location);
  const r=await other.store.open(h.id,'read');assert.deepEqual((await r.read()).events,[]);await r.close();await w.close();
  await other.close();await f.close();
  return {root,pendingLocalOnly:true,closeUnmaterialized:'no artifact',flushMaterialized:true,header:seen.header,removedFile:await removeOne(root,seen.location!.path)};
 }finally{await other.close();await f.close();}
}
