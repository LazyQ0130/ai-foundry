import assert from 'node:assert/strict';
import {test} from 'node:test';
import {approvalPractice,approvalPolicyPractice} from './approval.ts';
import {pipelinePractice} from './pipeline.ts';
import {sandboxPractice} from './sandbox.ts';
import {filesystemPractice} from './filesystem.ts';
import {components,carrier,ToolCallId,audit} from './support.ts';
import {setApprovalPolicy} from '@deepseek-ai/dsh-user-approval';
const approvals={allow:'allowed-once',reject:'rejected','cancel-answer':'cancelled',unavailable:'unavailable',missing:'unavailable','throw-sync':'unavailable','throw-async':'unavailable',invalid:'unavailable',delegate:'unavailable',never:'rejected','pre-abort':'cancelled',late:'cancelled'} as const;
for(const [kind,expected] of Object.entries(approvals))test('C approval '+kind,async()=>{
 const r=await approvalPractice(kind as any);assert.equal(r.outcome,expected);assert.equal(r.grant,expected==='allowed-once');
 const pair=r.audit.filter(e=>e.type==='approval/asked'||e.type==='approval/decided');
 assert.deepEqual(pair.map(e=>e.type),['approval/asked','approval/decided']);
 assert.equal(pair[0].data.id,pair[1].data.id);assert.equal(pair[0].data.callId,'call-'+kind);
 assert.notEqual(pair[0].data.id,pair[0].data.callId);
 assert.ok(r.audit.every(e=>!('surfaceOp' in e)));
 for(const t of r.trace.filter(t=>t.stage==='answerer'))assert.equal(t.hasRequestId,false);
 if(['never','pre-abort'].includes(kind))assert.equal(r.answers,0);
 if(kind==='late'){assert.equal(r.trace[1].outcome,'cancelled');assert.equal(r.trace[2].stage,'late-answer');assert.equal(r.audit[1].data.outcome,'cancelled');}
});
for(const kind of ['idle','closed'] as const)test('C approval rejects '+kind,async()=>{
 const r=await approvalPractice(kind);assert.match(r.error!,/outside an open turn/);assert.equal(r.audit.length,0);assert.equal(r.grant,false);
});
test('C approval audit commit failure cannot return grant',async()=>{
 const r=await approvalPractice('audit-fail');assert.match(r.error!,/audit commit failure/);assert.equal(r.grant,false);assert.deepEqual(r.audit.map(e=>e.type),['approval/asked']);
});
test('C approval per-session policy and runtime context are not transcript',async()=>{
 const r=await approvalPolicyPractice();assert.equal(r.a,'never');assert.equal(r.b,'ask');assert.equal(r.override,'never');
 assert.ok(r.contexts.some(c=>c.name==='approval:policy'&&c.text.includes('disabled')));assert.equal(r.messages.length,0);
});
test('C allowed-once is not a cached grant for a repeated callId',async()=>{
 const h=await components({tools:false});try{
  const agent=carrier(h.ctx,'repeated');let n=0;
  h.ctx.on('approval/request',async()=>++n===1?'allowed-once':'rejected');
  const req={agent,toolName:'fixture',callId:ToolCallId('same-call')};
  assert.equal(await h.ctx.approval.request(req),'allowed-once');assert.equal(await h.ctx.approval.request(req),'rejected');
  const events=audit(agent.session);assert.equal(n,2);assert.equal(events.length,4);assert.notEqual(events[0].data.id,events[2].data.id);
  console.log('repeated-approval-audit '+JSON.stringify(events));
 }finally{await h.close();}
});
test('C deployment never, cancelled signal, and session ask precedence',async()=>{
 const h=await components({tools:false,approvalConfig:{policy:'never'}});try{
  const agent=carrier(h.ctx,'never-default');let n=0;
  h.ctx.on('approval/request',async()=>{n++;return 'allowed-once';},true);
  const req={agent,toolName:'fixture'};assert.equal(await h.ctx.approval.request(req),'rejected');assert.equal(n,0);
  assert.equal(await h.ctx.approval.request({...req,signal:AbortSignal.abort()}),'cancelled');assert.equal(n,0);
  setApprovalPolicy(agent.session,'ask');assert.equal(await h.ctx.approval.request(req),'allowed-once');assert.equal(n,1);
 }finally{await h.close();}
});
for(const kind of ['allow','deny','ask-allow','ask-reject','ask-missing','guard','override-deny','override-guard','approved-guard','cancel-approval','pre-abort'] as const)test('D pipeline '+kind,async()=>{
 const r=await pipelinePractice(kind),allowed=['allow','ask-allow','override-deny'].includes(kind);
 assert.equal(r.bodies,allowed?1:0);assert.equal(!!r.result.isError,!allowed);
 if(allowed)assert.equal(r.result.value,5);
 if(kind==='approved-guard'){assert.equal(r.audit[1].data.outcome,'allowed-once');assert.ok(r.trace.findIndex(t=>t.stage==='approval-answer')<r.trace.findIndex(t=>t.stage==='guard'));}
 if(kind==='override-guard'){assert.ok(r.trace.some(t=>t.stage==='outer-return'&&t.to==='allow'));assert.ok(r.trace.some(t=>t.stage==='guard'));}
 if(kind==='cancel-approval')assert.equal(r.audit[1].data.outcome,'cancelled');
 if(kind==='pre-abort')assert.equal(r.audit.length,0);
});
test('D SandboxPolicy + Session + Approval + simulated local provider',async()=>{
 const r=await sandboxPractice();assert.equal(r.initial.mode,'read-only');assert.equal(r.sessionA.mode,'workspace-write');assert.equal(r.sessionB.mode,'read-only');
 assert.equal(r.once.mode,'workspace-write');assert.equal(r.after.mode,'read-only');assert.equal(r.replay.mode,'workspace-write');
 assert.notEqual(r.sessionA.workspaceRoot,r.sessionB.workspaceRoot);assert.ok(r.contexts.some(c=>c.name==='sandbox:policy'));
 assert.equal(r.invalidRoot.code,'SANDBOX_INVALID_ROOT');assert.ok(r.roots.length===2&&r.allWritable.length>=2);
 assert.equal(r.reports[0].code,'SANDBOX_UNAVAILABLE');assert.equal(r.reports[1].enforcement,'full');assert.equal(r.reports[2].enforcement,'partial');assert.equal(r.reports[3].enforcement,'partial');
 assert.equal(r.reports[2].strictConsumer,'would-refuse');assert.ok(r.malformed&&r.narrower&&r.missingApprover);
 assert.equal(r.bEvents.filter(e=>e.type==='sandbox/mode').length,0);assert.equal(r.audit[1].data.outcome,'allowed-once');
});
test('D real local filesystem + fence + observations across lifecycle',async()=>{
 const r=await filesystemPractice(),at=(label:string)=>r.trace.find(x=>x.label===label);
 assert.equal(at('create-unseen').value.operation,'create');assert.equal(at('direct-read-no-observation').code,'FS_NOT_OBSERVED');
 assert.equal(at('normal-edit').value.after,'mode=new\n');assert.equal(at('unseen-session-edit').code,'FS_NOT_OBSERVED');
 assert.equal(at('stale-edit').code,'FS_STALE_VERSION');assert.equal(at('refresh-edit').value.after,'mode=fresh\n');
 assert.equal(at('restored-same-id').code,'FS_NOT_OBSERVED');assert.equal(at('read-only-denied').code,'FS_SANDBOX_DENIED');
 assert.equal(at('missing-edit').code,'FS_NOT_FOUND');assert.equal(at('guarded-create-after-missing').value.operation,'create');
 assert.equal(at('same-create-cannot-overwrite').code,'FS_NOT_OBSERVED');assert.equal(at('plugin-unloaded').guardIsUndefined,true);
 assert.equal(at('unloaded-still-read-only').code,'FS_SANDBOX_DENIED');assert.equal(at('remount-lost-state').code,'FS_NOT_OBSERVED');
 assert.equal(r.finalContent,'mode=unguarded\n');assert.equal(r.fileRemoved,true);
});
