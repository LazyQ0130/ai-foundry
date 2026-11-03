import {assert,backend,freshRoot,header,events,Session,SessionId,readFile,removeOne,messageSummary} from './support.ts';
import {worker} from './process.ts';
export async function diskPractice(compression:'none'|'zstd'='none'){
 const root=await freshRoot('B-'+compression),h=header('h18-B'),log=events();
 const first=await backend(root,compression==='zstd'?'default':'none');
 let path='';
 try{const writer=await first.store.create(h);await writer.append(log);await writer.flush();path=(await first.store.stat(h.id))!.location!.path;await writer.close();}
 finally{await first.close();}
 const bytes=await readFile(path);const second=await backend(root,compression);
 let loaded:any;
 try{
  const reader=await second.store.open(h.id,'read');loaded=await reader.read();
  assert.deepEqual(reader.header,h);assert.deepEqual(loaded.events,log);assert.equal(loaded.eventState,'shared-frozen');
  assert.ok(Object.isFrozen(loaded.events[0]));assert.notEqual((await reader.read()).events,loaded.events);
  const restored=Session.create(SessionId('reader-only'),loaded.events);
  const original=Session.create(SessionId('original-only'),log);assert.deepEqual(messageSummary(restored),messageSummary(original));
  await reader.close();
 }finally{await second.close();}
 const separate=await worker('read',root,h.id,compression);
 assert.equal(separate.ok,true);assert.notEqual(separate.pid,process.pid);assert.deepEqual(separate.events,log);assert.deepEqual(separate.header,h);
 if(compression==='none'){
  const rows=bytes.toString('utf8').trimEnd().split('\n').map(JSON.parse);
  assert.equal(rows[0].type,'session');assert.equal(rows[0].version,4);assert.equal(rows.length,log.length+1);
 }else{assert.equal(bytes.readUInt32LE(0),0xfd2fb528);assert.ok(path.endsWith('.jsonl.zstd'));}
 const removed=await removeOne(root,path);
 return {root,compression,defaultCompression:compression==='zstd',path,bytes:bytes.length,header:h,events:loaded.events,readState:loaded.eventState,
  reopened:'new backend instance in same process AND separate Node process',separate,removedFile:removed,emptyDirectories:'retained'};
}
