import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {assert} from './support.ts';
export function startWorker(mode:string,root:string,id:string,compression:string){
 const args=[process.env.H18_TSX_CLI!,'--tsconfig',resolve('tsconfig.json'),'--import',new URL('./bootstrap.mjs',import.meta.url).href,fileURLToPath(new URL('./worker.ts',import.meta.url)),mode,root,id,compression];
 const child=spawn(process.execPath,args,{cwd:process.cwd(),env:process.env,windowsHide:true,stdio:['pipe','pipe','pipe']});
 let stdout='',stderr='';const first=Promise.withResolvers<any>();
 child.stdout.setEncoding('utf8');child.stderr.setEncoding('utf8');
 child.stdout.on('data',data=>{stdout+=data;const line=stdout.split('\n')[0];if(stdout.includes('\n'))try{first.resolve(JSON.parse(line));}catch(e){first.reject(e);}});
 child.stderr.on('data',data=>{stderr+=data;});
 const done=new Promise<{code:number|null;signal:string|null;stdout:string;stderr:string}>(resolve=>child.once('close',(code,signal)=>{const result={code,signal,stdout,stderr};if(!stdout.includes('\n'))first.reject(Error(JSON.stringify(result)));resolve(result);}));
 const timer=setTimeout(()=>{first.reject(Error('H18 worker timeout'));child.kill();},20000);
 done.finally(()=>clearTimeout(timer));
 return {child,first:first.promise,done,args};
}
export async function worker(mode:string,root:string,id:string,compression:string){
 const w=startWorker(mode,root,id,compression);
 try{const value=await w.first;const end=await w.done;assert.equal(end.code,0,end.stderr);return {...value,execution:end,args:w.args};}
 finally{if(w.child.exitCode===null)w.child.kill();}
}
