import {fixture as agentFixture,assert,SessionId,bounded,gate,until,text,blocks,user,call,hasText,record} from './agent-fixture.ts';
import FileSystem from '@deepseek-ai/dsh-fs-local';
import Subprocess from '@deepseek-ai/dsh-subprocess-local';
import Sandbox from '@deepseek-ai/dsh-sandbox-local';
import SandboxPolicy from '@deepseek-ai/dsh-sandbox-policy';
import NodePtcRuntime from '@deepseek-ai/dsh-ptc-runtime-node';
import PtcWorkflowEngine from '@deepseek-ai/dsh-workflow-ptc';
import * as WorkflowTool from '@deepseek-ai/dsh-tool-workflow';
import {mkdtemp,mkdir,writeFile,readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
export {assert,SessionId,bounded,gate,until,text,blocks,user,call,hasText,record,readFile,writeFile};
export const meta={name:'project-review',description:'Review a fictional project using controlled children',phases:[{title:'Inspect'},{title:'Synthesize'}]};
export async function fixture(options:{engine?:any;pending?:number;tool?:boolean;background?:boolean}={}){
 const f=await agentFixture(),workspace=await mkdtemp(resolve(process.env.H22_RUN_ROOT!,'workspace-'));
 await f.ctx.plugin(FileSystem);await f.ctx.plugin(Subprocess);await f.ctx.plugin(Sandbox);await f.ctx.plugin(SandboxPolicy,{mode:'read-only',workspaceRoot:workspace});
 const sandbox=f.ctx.sandbox as any;sandbox.internals={windowsAclRunnerEntry:process.env.H22_SANDBOX_RUNNER,rmTempDir:(_path:string)=>{throw Error('read-only fixture must not create write grants or delete temp directories');}};
 await f.ctx.plugin(NodePtcRuntime,{launch:{kind:'node-script',executable:process.execPath,bootstrapPath:process.env.H22_PTC_WORKER!},graceMs:250,maxPendingCalls:options.pending??128});
 await f.ctx.plugin(PtcWorkflowEngine,{maxConcurrentAgents:2,maxTotalAgents:8,maxItemsPerCall:16,syncTimeoutMs:500,...options.engine});
 if(options.tool)await f.ctx.plugin(WorkflowTool,{enableRunInBackground:options.background??true,maxResultChars:200});
 const workflowEvents:any[]=[],processEvents:any[]=[];
 for(const name of ['workflow/start','workflow/phase','workflow/log','workflow/agent-start','workflow/agent-end','workflow/end'] as const)f.ctx.on(name,(...args:any[])=>{workflowEvents.push({name,args:structuredClone(args)});});
 // Synchronous observation wrapper: preserve the native handle and confinement.
 const original=f.ctx.subprocess.spawn.bind(f.ctx.subprocess);
 (f.ctx.subprocess as any).spawn=(spec:any)=>{const h=original(spec),entry:any={argv:spec.argv,options:spec.options,done:false};processEvents.push(entry);void h.done.then((outcome:any)=>{entry.done=true;entry.outcome=outcome;},(error:any)=>{entry.done=true;entry.error=String(error);});return h;};
 const parent=await f.create();
 const fake={started:[] as string[],disposed:[] as string[],active:0,peak:0,before:async(_req:any)=>{},behavior:async(prompt:string,_req:any)=>({output:blocks(prompt+'=ok'),stopReason:'completed'}) as Promise<any>};
 f.ctx.subagents.registerProvider({name:'controlled',inheritsParentContext:false,capabilities:{agentOptions:true,agentPreset:false,outputSchema:true,depthLimit:false},async start(req:any){
  const label=req.prompt[0].text,id=SessionId('controlled-'+(fake.started.length+1));fake.started.push(label);fake.active++;fake.peak=Math.max(fake.peak,fake.active);
  await fake.before(req);
  const result=fake.behavior(label,req);void result.catch(()=>{});let closing:Promise<void>|undefined;
  return {id,result,dispose:()=>closing??=(async()=>{await result.catch(()=>{});fake.disposed.push(label);fake.active--;})()};
 }});
 const start=(script:string,extra:any={})=>f.ctx.workflowEngine.start({meta,script,parent,subagentProvider:'controlled',...extra});
 return {...f,parent,workspace,workflowEvents,processEvents,fake,start};
}
export async function settled(f:any,run:any){try{return await bounded(run.result,'workflow result');}finally{await bounded(run.dispose(),'workflow dispose');}}
export function assertStopped(f:any){assert.equal(f.fake.active,0);assert.ok(f.processEvents.every((p:any)=>p.done),'managed subprocesses settled');}
