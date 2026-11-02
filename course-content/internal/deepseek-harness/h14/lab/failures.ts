import {components,infoTool,call,gate,reached,notice,ToolCallId} from './support.ts';
import {executeToolFixture} from '@deepseek-ai/dsh-tool-testkit';
export type FailureCase='unknown'|'parse'|'args'|'deny'|'pre-abort'|'body-throw'|'output'|'post-throw'|'post-abort'|'pending-abort'|'pre-pending-abort'|'scheduler'|'signal-replace'|'snapshot';
export async function failuresPractice(kind:FailureCase){
 const h=await components(),abort=new AbortController(),entered=gate(),release=gate();let bodies=0,settled=false,signalAborted=false;
 const trace:string[]=[];
 try{
  h.ctx.tools.register(infoTool('inspect_fixture',async(_a,exec)=>{bodies++;trace.push('body');
   if(['pending-abort','scheduler','signal-replace'].includes(kind)){if(kind!=='scheduler')entered.resolve();await release.promise;signalAborted=exec.signal.aborted;trace.push('body.settled');}
   if(kind==='body-throw')throw Error('业务主体失败');if(kind==='output')return {title:'x',chars:'bad'};
   exec.deferContext(notice('主体附加上下文'));return {title:'ok',chars:2};},{isConcurrencySafe:()=>true}));
  h.ctx.on('tools/pre-execute',async(_exec,next)=>{trace.push('pre');if(kind==='pre-pending-abort'){entered.resolve();await release.promise;}
   return kind==='deny'?{kind:'deny',reason:'策略拒绝'}:next();});
  h.ctx.on('tools/execute',async(exec,next)=>{trace.push('around');if(kind!=='signal-replace')return next();
   const upstream=exec.signal;exec.signal=new AbortController().signal;try{return await next();}finally{exec.signal=upstream;}});
  h.ctx.on('tools/post-execute',async(_exec,_r,next)=>{trace.push('post');if(kind==='post-throw')throw Error('后置失败');
   if(kind==='post-abort'){entered.resolve();await release.promise;}return next();});
  h.ctx.on('tools/result',(_exec,r)=>{trace.push('observe:'+(r.error?.info?.code??String(r.isError)));});
  const calls=[call('c1',kind==='unknown'?'missing':'inspect_fixture')];
  if(kind==='parse')calls[0].arguments='{broken';if(kind==='args')calls[0].arguments='{}';
  if(kind==='pre-abort')abort.abort();
  if(kind==='scheduler'){
   calls.push(call('c2','inspect_fixture'),call('c3','inspect_fixture'));
   const original=h.pipeline.prepare.bind(h.pipeline);h.pipeline.prepare=async input=>{
    if(input.callId==='c2'){entered.resolve();throw Error('受控调度 prepare 失败');}return original(input);};
  }
  const task=kind==='snapshot'?executeToolFixture(h.ctx,{name:'inspect_fixture',callId:ToolCallId('lossy'),arguments:{notJson:()=>0},signal:abort.signal})
   :h.ctx.tools.execute({calls,signal:abort.signal,maxParallelToolCalls:2});
  const observed=task.then(value=>{settled=true;return {value};},(error:any)=>{settled=true;return {error:{name:error.name,message:error.message,cause:error.cause?.message,partial:error.partial}};});
  let settledBeforeRelease:boolean|undefined;
  if(['pending-abort','post-abort','pre-pending-abort','scheduler','signal-replace'].includes(kind)){
   await reached(entered.promise,observed);if(kind!=='scheduler')abort.abort();await Promise.resolve();settledBeforeRelease=settled;release.resolve();
  }
  const outcome=await observed;
  return {kind,bodies,trace,settledBeforeRelease,signalAborted,...outcome,log:'ABSENT: no agent/log, not a Turn test'};
 }finally{release.resolve();await h.close();}
}
