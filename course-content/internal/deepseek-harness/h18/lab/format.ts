import {writeFile,readdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {SessionFormatUnsupportedError,SessionPersistenceCorruptionError} from '@deepseek-ai/dsh-session-persistence';
import {assert,backend,freshRoot,header,events,SessionSeq,ensureParent,readFile,removeOne} from './support.ts';
async function helpers(){return import(pathToFileURL(resolve(process.env.HARNESS_SOURCE_CACHE!,'packages/session/session-persistence-jsonl/src/format.ts')).href);}
export async function formatCase(kind:'future'|'corrupt'|'ignorable'|'required'|'historical'){
 const root=await freshRoot('format-'+kind),h=header('format-'+kind),fmt=await helpers();
 const version=kind==='future'?99:kind==='historical'?3:4;
 const path=fmt.generationLogPath(root,undefined,h.id,version,'none');await ensureParent(path);
 const log:any[]=events();
 if(kind==='corrupt')log[1]={...log[1],seq:SessionSeq(42)};
 if(kind==='ignorable'||kind==='required')log.push({type:'h18/unknown',seq:5,time:2000,data:{value:1},...kind==='ignorable'?{ignorable:true}:{}});
 const physical={...fmt.toHeaderLine(h),version};
 const bytes=Buffer.from([physical,...log].map(row=>JSON.stringify(row)).join('\n')+'\n');
 await writeFile(path,bytes,{flag:'wx'});const beforeFiles=await readdir(dirname(path)),f=await backend(root);
 let result:any;
 try{
  if(kind==='future'||kind==='required'){
   await assert.rejects(f.store.open(h.id,'read'),SessionFormatUnsupportedError);
   await assert.rejects(f.store.open(h.id,'write'),SessionFormatUnsupportedError);result={rejected:'SessionFormatUnsupportedError'};
  }else if(kind==='corrupt'){
   await assert.rejects(f.store.open(h.id,'read'),SessionPersistenceCorruptionError);result={rejected:'SessionPersistenceCorruptionError'};
  }else{
   const r=await f.store.open(h.id,'read');const read=await r.read();
   assert.equal(r.header.version,4);assert.deepEqual(await readFile(path),bytes);await r.close();
   assert.deepEqual(await readdir(dirname(path)),beforeFiles);
   if(kind==='ignorable')assert.equal(read.events.at(-1)!.type,'h18/unknown');
   result={logicalVersion:4,sourceVersion:version,events:read.events,readOnlyNoSuccessor:true};
  }
  assert.deepEqual(await readFile(path),bytes);
  return {root,kind,path,...result,sourceUnchanged:true,writeMigration:'NOT_RUN (read-only migration here; write path is static evidence)',removedFile:await removeOne(root,path)};
 }finally{await f.close();}
}
export async function formatPractice(){return {future:await formatCase('future'),corrupt:await formatCase('corrupt'),ignorable:await formatCase('ignorable'),required:await formatCase('required'),historical:await formatCase('historical')};}
