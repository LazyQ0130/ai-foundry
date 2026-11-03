import {appendFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {assert,backend,freshRoot,header,events,SessionSeq,readFile,interruptedTurnClosers,removeOne} from './support.ts';
export async function semanticCase(kind:'closed'|'open'|'not-started'|'unknown'){
 const root=await freshRoot('C-'+kind),h=header('h18-C-'+kind),original=events(kind),first=await backend(root);
 try{const w=await first.store.create(h);await w.append(original);await w.flush();await w.close();}finally{await first.close();}
 const f=await backend(root);let path='';
 try{
  const w=await f.store.open(h.id,'write'),read=await w.read();assert.deepEqual(read.events,original);
  const closers=interruptedTurnClosers(read.events);await w.append(closers);
  assert.deepEqual((await w.read()).events,[...original,...closers]);assert.deepEqual(interruptedTurnClosers([...original,...closers]),[]);
  assert.deepEqual((await w.read()).events.slice(0,original.length),original);
  if(kind==='closed')assert.equal(closers.length,0);
  else{assert.equal(closers.at(-1)!.type,'turn/end');assert.deepEqual((closers.at(-1) as any).data.reason,{kind:'interrupted'});}
  const result=closers.find(e=>e.type==='tool/result');
  if(kind==='not-started')assert.equal((result as any).data.error.code,'TOOL_NOT_STARTED');
  if(kind==='unknown'){assert.equal((result as any).data.error.code,'TOOL_OUTCOME_UNKNOWN');assert.deepEqual(result!.sourceEventSeqs,[4]);}
  const continued={type:'turn/start' as const,seq:SessionSeq(original.length+closers.length),time:2000,data:{turn:2}};
  await w.append([continued]);await w.flush();path=(await f.store.stat(h.id))!.location!.path;await w.close();
  return {root,kind,original,closers,continued,toolExecutions:0,removedFile:await removeOne(root,path)};
 }finally{await f.close();}
}
export async function recoveryPractice(){
 return {closed:await semanticCase('closed'),open:await semanticCase('open'),notStarted:await semanticCase('not-started'),unknown:await semanticCase('unknown'),boundary:'real JSONL + real interruptedTurnClosers; actual AgentLoop resume tested separately'};
}
export async function physicalTail(compression:'none'|'zstd'='none'){
 const root=await freshRoot('C-tail-'+compression),h=header('physical-tail'),original=events(),f=await backend(root,compression);
 let path='';
 try{const w=await f.store.create(h);await w.append(original);await w.close();path=(await f.store.stat(h.id))!.location!.path;}finally{await f.close();}
 const prefix=await readFile(path);
 const recovered={type:'turn/start' as const,seq:SessionSeq(5),time:2000,data:{turn:2}};
 let torn:Buffer;
 if(compression==='none')torn=Buffer.from('{"type":"turn/start","seq":');
 else{
  const z=await import(pathToFileURL(resolve(process.env.HARNESS_SOURCE_CACHE!,'packages/session/session-persistence-jsonl/src/zstd.ts')).href);
  const frame=await z.compressZstdFrame(JSON.stringify(recovered)+'\n');torn=frame.subarray(0,-1);
  assert.equal(z.scanZstdFrames(torn).tornStart,0);
 }
 await appendFile(path,torn);const damaged=await readFile(path),next=await backend(root,compression);
 try{
  const r=await next.store.open(h.id,'read'),loaded=await r.read();
  const expected=compression==='none'?original:[...original,recovered];
  assert.deepEqual(loaded.events,expected);assert.deepEqual(await readFile(path),damaged);await r.close();
  const w=await next.store.open(h.id,'write');assert.deepEqual(await readFile(path),damaged);
  const added=compression==='none'?recovered:{type:'turn/end' as const,seq:SessionSeq(6),time:2001,data:{turn:2,reason:{kind:'interrupted' as const}}};
  await w.append([added]);await w.flush();assert.deepEqual((await w.read()).events,[...expected,added]);await w.close();
  const repaired=await readFile(path);assert.deepEqual(repaired.subarray(0,prefix.length),prefix);
  return {root,compression,prefixBytes:prefix.length,tornBytes:torn.length,original,loaded:loaded.events,added,validPrefixBytesUnchanged:true,readDidNotRepair:true,removedFile:await removeOne(root,path)};
 }finally{await next.close();}
}
