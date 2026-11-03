import {SessionAlreadyExistsError,SessionAlreadyOwnedError,SessionReadOnlyError,SessionHandleClosedError} from '@deepseek-ai/dsh-session-persistence';
import {assert,backend,freshRoot,header,events,SessionId,removeOne} from './support.ts';
export async function handlePractice(){
 const root=await freshRoot('A'),f=await backend(root),h=header('h18-A'),log=events();
 try{
  const writer=await f.store.create(h),pending=await f.store.stat(h.id);
  assert.ok(pending);assert.equal(pending.location,undefined);assert.equal((await f.store.list()).length,1);
  const reader=await f.store.open(h.id,'read');assert.deepEqual((await reader.read()).events,[]);
  await assert.rejects(f.store.create(h),SessionAlreadyExistsError);
  await assert.rejects(f.store.open(h.id,'write'),SessionAlreadyOwnedError);
  await assert.rejects(reader.append(log),SessionReadOnlyError);await assert.rejects(reader.flush(),SessionReadOnlyError);
  await writer.append(log.slice(0,3));assert.deepEqual((await reader.read()).events,log.slice(0,3));
  await assert.rejects(writer.append(log.slice(4)),/seq|contiguous/i);
  assert.equal((await writer.read()).events.length,3);
  await writer.append(log.slice(3));await writer.flush();
  assert.deepEqual((await reader.read(1,2)).events,log.slice(1,3));assert.deepEqual((await reader.read(99)).events,[]);
  const location=(await f.store.stat(h.id))!.location!.path;
  const close=writer.close();assert.equal(writer.close(),close);await close;
  await assert.rejects(writer.read(),SessionHandleClosedError);await assert.rejects(writer.append([]),SessionHandleClosedError);
  await assert.rejects(writer.flush(),SessionHandleClosedError);
  const next=await f.store.open(h.id,'write');assert.deepEqual((await next.read()).events,log);await next.close();await reader.close();
  await f.close();const removed=await removeOne(root,location);
  return {root,backend:'real JSONL none',pendingVisible:true,events:log,closedErrors:3,singleWriter:'same instance',removedFile:removed,emptyDirectories:'retained'};
 }finally{await f.close();}
}
