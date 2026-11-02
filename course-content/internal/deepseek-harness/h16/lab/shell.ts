import {ShellExecutor} from '@deepseek-ai/dsh-shell';
import * as ToolPwsh from '@deepseek-ai/dsh-tool-pwsh';
import * as ShellEnv from '@deepseek-ai/dsh-shell-env';
import LocalJobs from '@deepseek-ai/dsh-jobs-local';
import * as ToolJobs from '@deepseek-ai/dsh-tool-jobs';
import AgentRegistry from '@deepseek-ai/dsh-agent';
import {base,files,carrier,invoke,gate,until} from './support.ts';
// 教学替身位于执行器边界；命令不会交给OS执行。
export class FixtureShell extends ShellExecutor {
 requests:any[]=[];specs:any[]=[];entered=gate();mode='ok';
 resolve(request:any){this.requests.push(request);return {command:request.command,workdir:request.workdir??process.cwd(),timeoutMs:request.timeoutMs??1000,onExpiry:request.onExpiry??'kill',stdoutMaxBytes:64000,...request};}
 async execute(spec:any){
  if(spec.command!=='Get-Location')throw Error('fixture command is not allowlisted');
  this.specs.push({...spec,signal:spec.signal?{aborted:spec.signal.aborted}:undefined});this.entered.resolve();
  const output='fixture-only: project-check\n',done=gate();let status:any='completed',aborted=false;
  if(this.mode==='wait'){status='running';spec.signal?.addEventListener('abort',()=>{aborted=true;status='killed';done.resolve();},{once:true});}else done.resolve();
  const proc:any={get status(){return status;},exitCode:this.mode==='nonzero'?7:0,signal:null,done:done.promise,
   readOutput:()=>({delta:output,lossy:false}),kill(){status='killed';done.resolve();return true;},
   observed:{stdout:{readFrom:(n:number)=>({text:output.slice(n),nextOffset:output.length,lossy:false})},stderr:{readFrom:(n:number)=>({text:'',nextOffset:n,lossy:false})}},
   result:async()=>{await done.promise;return {exitCode:proc.exitCode,signal:null,timedOut:false,aborted,timeoutMs:spec.timeoutMs,stdout:{text:output,truncated:false},stderr:{text:'',truncated:false}};}};
  return proc;
 }
}
export async function mountShell(ctx:any){await ctx.plugin(ShellEnv);await ctx.plugin(FixtureShell);return ctx.plugin(ToolPwsh);}
export async function shellPractice(){
 const h=await base(),f=await files(h.ctx),agent=carrier(h.ctx,f.root,'shell');
 try{
  await h.ctx.plugin(ShellEnv);const tool=await h.ctx.plugin(ToolPwsh);const missing=h.ctx.tools.get('pwsh')===undefined;
  await h.ctx.plugin(FixtureShell);const shell=h.ctx.shell as FixtureShell;
  const schemas=h.ctx.tools.schemas(),normal=await invoke(h.ctx,'pwsh',{description:'夹具只读检查；不会执行OS命令',command:'Get-Location'},agent);
  shell.mode='nonzero';const nonzero=await invoke(h.ctx,'pwsh',{description:'夹具非零退出',command:'Get-Location'},agent);
  const withoutJobs=await invoke(h.ctx,'pwsh',{description:'无Jobs请求后台',command:'Get-Location',run_in_background:true},agent);
  shell.mode='wait';shell.entered=gate();const controller=new AbortController();
  const pending=invoke(h.ctx,'pwsh',{description:'取消夹具执行',command:'Get-Location'},agent,controller.signal);await shell.entered.promise;controller.abort();const cancelled=await pending;
  shell.mode='ok';await h.ctx.plugin(AgentRegistry);const jobs=await h.ctx.plugin(LocalJobs,{pumpPollMs:10});await h.ctx.plugin(ToolJobs);
  const withJobsSchemas=h.ctx.tools.schemas();
  const background=await invoke(h.ctx,'pwsh',{description:'夹具后台检查',command:'Get-Location',run_in_background:true});
  const id=(background as any).value?.jobId;if(!id)throw Error('fixture background job not registered');
  await until(()=>h.ctx.jobs.get(id).status==='completed'?true:undefined);
  const jobOutput=await invoke(h.ctx,'job_output',{job_id:id});await jobs.dispose();
  const afterJobsSchemas=h.ctx.tools.schemas();await tool.dispose();
  return {missingExecutor:missing,schemas,normal,nonzero,withoutJobs,cancelled,withJobsSchemas,background,jobOutput,afterJobsSchemas,afterToolDispose:h.ctx.tools.get('pwsh')!==undefined,requests:shell.requests,specs:shell.specs,
   boundary:'Real tool-pwsh/shell-env/Tools/Pipeline/working-directory/Jobs; FixtureShell replaces OS process execution, no native PowerShell or Bash run'};
 }finally{await h.close();await f.cleanup();}
}
