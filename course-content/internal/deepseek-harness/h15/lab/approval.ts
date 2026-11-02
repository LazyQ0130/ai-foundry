import { setApprovalPolicy } from '@deepseek-ai/dsh-user-approval';
import { components,carrier,gate,audit,ToolCallId } from './support.ts';
export const approvalCases=['allow','reject','cancel-answer','unavailable','missing','throw-sync','throw-async','invalid','delegate','never','pre-abort','late','idle','closed','audit-fail'] as const;
export type ApprovalCase=typeof approvalCases[number];
export async function approvalPractice(kind:ApprovalCase='allow'){
 const h=await components({tools:false}),trace:any[]=[],entered=gate(),late=gate<any>();let answers=0,grant=false;
 try{
  const agent=carrier(h.ctx,'approval-'+kind,!['idle'].includes(kind));
  if(kind==='closed')agent.session.append('turn/end',{turn:1,reason:{kind:'completed'}});
  if(kind==='never')setApprovalPolicy(agent.session,'never');
  const controller=new AbortController();if(kind==='pre-abort')controller.abort();
  if(kind!=='missing')h.ctx.on('approval/request',async(req,next)=>{
   answers++;trace.push({stage:'answerer',toolName:req.toolName,callId:req.callId,hasRequestId:'id' in req});entered.resolve();
   if(kind==='delegate')return next();
   if(kind==='throw-async')throw Error('controlled async answerer failure');
   if(kind==='late'){await late.promise;trace.push({stage:'late-answer',outcome:'allowed-once'});return 'allowed-once';}
   return ({reject:'rejected','cancel-answer':'cancelled',unavailable:'unavailable',invalid:'bad-answer'} as any)[kind]??'allowed-once';
  });
  if(kind==='throw-sync')h.ctx.on('approval/request',()=>{throw Error('controlled sync failure');},true);
  if(kind==='audit-fail'){
   // 受控故障：拦截提交之前，而不是让提交后的观察者抛错。
   const append=agent.session.append.bind(agent.session);
   agent.session.append=(type:any,...args:any[])=>{if(type==='approval/decided')throw Error('controlled audit commit failure');return append(type,...args);};
  }
  const pending=h.ctx.approval.request({agent,toolName:'sum_fixture',callId:ToolCallId('call-'+kind),reason:'批准本次常量计算',signal:controller.signal});
  if(kind==='late'){
   await entered.promise;controller.abort();
   const outcome=await pending;trace.push({stage:'settled-before-late',outcome});late.resolve();
   await new Promise(r=>setImmediate(r));
   return {kind,outcome,answers,trace,audit:audit(agent.session),grant:outcome==='allowed-once'};
  }
  try{const outcome=await pending;grant=outcome==='allowed-once';return {kind,outcome,answers,trace,audit:audit(agent.session),grant};}
  catch(error){return {kind,error:String(error),answers,trace,audit:audit(agent.session),grant};}
 }finally{late.resolve();await h.close();}
}
export async function approvalPolicyPractice(){
 const h=await components({tools:false});try{
  const a=carrier(h.ctx,'policy-a'),b=carrier(h.ctx,'policy-b');setApprovalPolicy(a.session,'never');
  const assembled=await h.ctx.systemPrompt.assemble({agent:a});
  // 固定源码将 effectivePolicy 声明为 private；文档虽推荐它，仍只作诊断。
  const effective=(session:any)=>(h.ctx.approval as any)['effectivePolicy'](session);
  return {a:effective(a.session),b:effective(b.session),diagnostic:'private effectivePolicy access; not a public stable API',
   override:h.ctx.approval.overrideOf(a.session),contexts:assembled.contexts,events:a.session.snapshotEvents(),
   messages:a.session.deriveMessages()};
 }finally{await h.close();}
}
