import assert from 'node:assert/strict';
import { mkdtemp,writeFile,unlink,stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve,dirname,basename,relative,isAbsolute } from 'node:path';
import SandboxedFileSystem from '@deepseek-ai/dsh-fs-sandbox';
import * as Observation from '@deepseek-ai/dsh-fs-observation-policy';
import { components,carrier,Session } from './support.ts';
export async function filesystemPractice(){
 const fixture=await mkdtemp(resolve(tmpdir(),'aifoundry-h15-files-')),file=resolve(fixture,'fixture.cfg');
 const h=await components({tools:false,policy:{mode:'workspace-write',workspaceRoot:fixture}}),trace:any[]=[],retained:string[]=[];
 let stageFile:string|undefined;
 const inside=(p:string)=>{const r=relative(fixture,resolve(p));assert.ok(r!==''&&!r.startsWith('..')&&!isAbsolute(r),'fixture containment');};
 const exists=async(p:string)=>{try{await stat(p);return true;}catch(e:any){if(e.code==='ENOENT')return false;throw e;}};
 const code=async(label:string,fn:()=>any)=>{try{const value=await fn();trace.push({label,value});return value;}catch(e:any){trace.push({label,code:e.code,message:e.message});return e.code;}};
 try{
  await h.ctx.plugin(SandboxedFileSystem,{cwd:fixture});
  // 官方原子发布实现原封不动；只替换清理钩子，禁止上游默认递归 rm。
  // 每次只删除一个经过 containment 与名称核验的明确临时文件；留下空目录。
  (h.ctx.fs as SandboxedFileSystem).internals={
   inspectTemp({stagingDir,tempPath}){inside(tempPath);assert.equal(dirname(tempPath),stagingDir);assert.equal(basename(tempPath),'fixture.cfg.tmp');stageFile=tempPath;},
   async removeStagingDir(dir){inside(dir);assert.ok(stageFile&&dirname(stageFile)===dir);if(await exists(stageFile))await unlink(stageFile);retained.push(dir);stageFile=undefined;},
  };
  const policy=await h.ctx.plugin(Observation),a=carrier(h.ctx,'fs-a'),actor={agent:a},target=await h.ctx.fs.resolve(file);
  const mode=h.ctx.sandboxPolicy.resolve({session:a.session});
  const wi=(who:any=actor)=>h.ctx.waterfall('fs/write-intent',target,who,()=>undefined);
  const ei=(who:any=actor)=>h.ctx.waterfall('fs/edit-intent',target,who,()=>undefined);
  const observe=async()=>{
   const info=await h.ctx.fs.stat(target);if(!info){h.ctx.emit('fs/observed',target,{kind:'absent'},actor);trace.push({label:'observe-missing',code:'FS_NOT_FOUND'});return;}
   const content=await h.ctx.fs.readText(target);h.ctx.emit('fs/observed',target,{kind:'present',version:info.version},actor);trace.push({label:'observe',content,version:info.version});
  };
  const edit=async(oldString:string,newString:string,who:any=actor)=>h.ctx.fs.editText(target,{oldString,newString,replaceAll:false},await ei(who),undefined,mode);
  await code('create-unseen',async()=>h.ctx.fs.writeText(target,'mode=old\n',await wi(),undefined,mode));
  await h.ctx.fs.readText(target);await code('direct-read-no-observation',()=>ei());
  await observe();await code('normal-edit',()=>edit('old','new'));await observe();
  await code('unseen-session-edit',()=>edit('new','no',{agent:carrier(h.ctx,'fs-unseen')}));
  await writeFile(file,'mode=external-longer\n');trace.push({label:'external-fixture-write'});
  await code('stale-edit',()=>edit('new','bad'));
  await observe();await code('refresh-edit',()=>edit('external-longer','fresh'));await observe();
  const restored=Session.create(a.session.id,a.session.snapshotEvents(),a.session.header);
  await code('restored-same-id',()=>ei({agent:{session:restored}}));
  await code('read-only-denied',()=>h.ctx.fs.writeText(target,'forbidden',undefined,undefined,{...mode,mode:'read-only'}));
  inside(file);await unlink(file);await observe();await code('missing-edit',()=>ei());
  await code('guarded-create-after-missing',async()=>h.ctx.fs.writeText(target,'mode=recreated\n',await wi(),undefined,mode));
  await code('same-create-cannot-overwrite',async()=>h.ctx.fs.writeText(target,'bad',await wi(),undefined,mode));
  await observe();await policy.dispose();
  const unguarded=await ei();trace.push({label:'plugin-unloaded',guardIsUndefined:unguarded===undefined});
  await code('unguarded-current-edit',()=>edit('recreated','unguarded'));
  // 观察策略卸载后，fs-sandbox 的 read-only 围栏仍存在。
  await code('unloaded-still-read-only',()=>h.ctx.fs.editText(target,{oldString:'unguarded',newString:'bad',replaceAll:false},undefined,undefined,{...mode,mode:'read-only'}));
  const finalContent=await h.ctx.fs.readText(target);
  await h.ctx.plugin(Observation);await code('remount-lost-state',()=>ei());
  inside(file);await unlink(file);
  return {fixture,file,host:process.platform,trace,finalContent,fileRemoved:!(await exists(file)),retainedDirectories:[fixture,...retained],
   scope:'Actual local storage + fs-sandbox + observation + Session; explicit fixture consumer emits official events; no model-facing tool-fs, no OS process sandbox',
   nativeFilePublication:process.platform==='win32'?'Actual Koffi DACL copy / ReplaceFileW, no platform override':'Actual host rename/link',
   limits:'No concurrent symlink/hostile race, no atomic-CAS proof against arbitrary external writers; no recursive cleanup; empty directories retained'};
 }finally{
  // 一次仅一个明确夹具文件；不扫描目录、不过滤后批量删除。
  inside(file);if(await exists(file))await unlink(file);
  await h.close();
 }
}
