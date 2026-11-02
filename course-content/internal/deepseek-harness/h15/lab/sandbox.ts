import { mkdtemp,mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { setSandboxMode } from '@deepseek-ai/dsh-sandbox-policy';
import { LocalSandboxProvider } from '@deepseek-ai/dsh-sandbox-local';
import { workspaceWritableRoots,writableRoots,approveEscalation,validateEscalationArgs } from '@deepseek-ai/dsh-sandbox';
import { components,carrier,Session,audit,ToolCallId,Context } from './support.ts';
export async function sandboxPractice(){
 const fixture=await mkdtemp(resolve(tmpdir(),'aifoundry-h15-policy-'));
 const workspace=resolve(fixture,'workspace'),extra=resolve(fixture,'extra');await mkdir(workspace);await mkdir(extra);
 const h=await components({tools:false,policy:{workspaceRoot:fixture,additionalWritableRoots:[extra]}});
 try{
  const a=carrier(h.ctx,'sandbox-a',true,workspace),b=carrier(h.ctx,'sandbox-b',true,extra),p=h.ctx.sandboxPolicy;
  const initial=p.resolve({session:a.session});setSandboxMode(a.session,'workspace-write');
  const sessionA=p.resolve({session:a.session}),sessionB=p.resolve({session:b.session});
  h.ctx.on('approval/request',async()=> 'allowed-once');
  const mode=await approveEscalation({requestedMode:'workspace-write',effectiveMode:'read-only',justification:'仅批准夹具配置更新',subject:'operation'},
   {approver:h.ctx.approval,agent:b,callId:ToolCallId('escalate-fixture'),toolName:'fixture-write'});
  const once=p.resolve({session:b.session,mode}),after=p.resolve({session:b.session});
  // 相同 ID 的全新 Session，从真实事件重建持久模式。
  const restored=Session.create(a.session.id,a.session.snapshotEvents(),a.session.header);
  const replay=p.resolve({session:restored});
  const roots=workspaceWritableRoots(sessionA),allWritable=writableRoots(sessionA);
  let invalidRoot:any;try{workspaceWritableRoots({...sessionA,additionalWritableRoots:[resolve(fixture,'missing')]});}catch(e:any){invalidRoot={code:e.code,message:e.message};}
  const reports:any[]=[];
  // 只调用真实 provider 的选择/argv 包装算法；所有探测均被测试钩子替代，没有 spawn。
  for(const kind of ['unavailable','full','partial','windows-partial'] as const){
   const owner=new Context();
   const local=new LocalSandboxProvider(owner,{runnerCommand:[],runnerFailureSignatures:[],probeTimeoutMs:100});
   local.internals=kind==='windows-partial'?{chain:['windows-acl'],windowsAclRunnerArgs:['fixture-runner-never-executed']}:
    {chain:kind==='unavailable'?[]:['bwrap','landlock'],probeBwrap:()=>kind==='full',probeLandlock:()=> 'partial',landlockLauncher:'fixture-landlock-never-executed'};
   try{const wrapped=await local.confine(['fixture-command-never-executed'],{mode:'read-only',workspaceRoot:workspace});
    reports.push({kind,verification:'SIMULATED_PROBE_REAL_PROVIDER',...wrapped,strictConsumer:wrapped.enforcement==='full'?'would-accept':'would-refuse'});
   }catch(e:any){reports.push({kind,verification:'SIMULATED_PROBE_REAL_PROVIDER',code:e.code,message:e.message});}
   // 没有 workspace-write ACL grant，dispose 不触发目录清理。
   await owner.fiber.dispose();
  }
  let malformed:any,narrower:any,missingApprover:any;
  try{validateEscalationArgs('workspace-write',undefined);}catch(e){malformed=String(e);}
  try{await approveEscalation({requestedMode:'read-only',effectiveMode:'workspace-write',justification:'bad',subject:'operation'},{} as any);}catch(e){narrower=String(e);}
  try{await approveEscalation({requestedMode:'workspace-write',effectiveMode:'read-only',justification:'fixture',subject:'operation'},{} as any);}catch(e){missingApprover=String(e);}
  return {fixture,host:{platform:process.platform,arch:process.arch},initial,sessionA,sessionB,once,after,replay,roots,allWritable,invalidRoot,reports,
   malformed,narrower,missingApprover,audit:audit(b.session),aEvents:a.session.snapshotEvents(),bEvents:b.session.snapshotEvents(),
   contexts:(await h.ctx.systemPrompt.assemble({agent:a})).contexts,
   native:{linux:'NOT_RUN',darwin:'NOT_RUN',windowsACL:'NOT_RUN'},cleanup:'Empty fixture directories retained under no-bulk-delete instruction'};
 }finally{await h.close();}
}
