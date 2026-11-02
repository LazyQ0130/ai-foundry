import {components,carrier,defineTool,call,gate,audit} from './support.ts';
export const pipelineCases=['allow','deny','ask-allow','ask-reject','ask-missing','guard','override-deny','override-guard','approved-guard','cancel-approval','pre-abort'] as const;
export type PipelineCase=typeof pipelineCases[number];
export async function pipelinePractice(kind:PipelineCase='allow'){
 const h=await components(),trace:any[]=[],entered=gate(),late=gate<any>(),controller=new AbortController();let bodies=0;
 try{
  const agent=carrier(h.ctx,'pipeline-'+kind);
  h.ctx.tools.register(defineTool({name:'sum_fixture',description:'仅计算两个整数之和，不访问文件或Shell',
   parameters:{a:{type:'integer',required:true},b:{type:'integer',required:true}},
   output:{schema:{type:'integer'},render:(_a,v)=>[{type:'text',text:String(v)}]},
   async execute(a){bodies++;trace.push({stage:'body'});return a.a+a.b;}}));
  if(kind.startsWith('override'))h.ctx.on('tools/pre-execute',async(_exec,next)=>{
   trace.push({stage:'outer-enter'});const d=await next();trace.push({stage:'outer-return',from:d.kind,to:'allow'});return {kind:'allow'};});
  h.ctx.on('tools/pre-execute',async(_exec,next)=>{
   trace.push({stage:'pre'});
   if(kind.startsWith('ask')||kind==='approved-guard'||kind==='cancel-approval')return {kind:'ask',reason:'本次计算需要应答'};
   if(kind==='deny'||kind.startsWith('override'))return {kind:'deny',reason:'普通拒绝'};
   return next();});
  if(kind!=='ask-missing')h.ctx.on('approval/request',async()=>{
   trace.push({stage:'approval-answer'});entered.resolve();
   if(kind==='cancel-approval'){await late.promise;return 'allowed-once';}
   return kind==='ask-reject'?'rejected':'allowed-once';});
  h.ctx.tools.guard(()=>{trace.push({stage:'guard'});return ['guard','override-guard','approved-guard'].includes(kind)?'所有者守卫拒绝':undefined;});
  h.ctx.on('tools/result',(_exec,result)=>trace.push({stage:'tools/result',result:structuredClone(result)}));
  if(kind==='pre-abort')controller.abort();
  const pending=h.ctx.tools.execute({calls:[call('sum-'+kind)],agent,signal:controller.signal});
  if(kind==='cancel-approval'){await entered.promise;controller.abort();late.resolve();}
  const batch=await pending;
  return {kind,bodies,trace,result:batch.results[0].result,audit:audit(agent.session),
   boundary:'Actual Tools/Native/Pipeline + Approval + real Session; structural Agent; no Loop or Session tool-result log sink'};
 }finally{late.resolve();await h.close();}
}
