import {components,infoTool,call,textOf} from './support.ts';
export type FlowCase='normal'|'deny'|'guard'|'ask'|'cancel'|'content'|'value'|'block'|'pre-throw'|'around-throw'|'project-throw'|'post-throw'|'final-throw'|'output-bad'|'observer-throw';
export async function flowPractice(kind:FlowCase='normal',raw?:string){
 const h=await components(),trace:any[]=[],log=(stage:string,data:any={})=>trace.push({stage,...data});let bodies=0,observed:any;
 try{
  const base=infoTool('inspect_fixture',async(args,exec)=>{bodies++;log('body',{args,tokenType:typeof exec.token});
   if(kind==='output-bad')return {title:'x',chars:'bad'};return {title:args.input.label,chars:args.input.label.length};});
  h.ctx.tools.register({...base,output:{...base.output,
   render(a,v){log('render',{value:v});return base.output.render(a,v);},
   presentationMeta(a,v){log('meta');return base.output.presentationMeta!(a,v);}},
   projectContent(_exec,result){log('project',{error:result.isError});if(kind==='project-throw')throw Error('project failed');return [{type:'text',text:'project:'+textOf(result)}];},
   finalizeContent(_exec,result){log('finalize',{error:result.isError});if(kind==='final-throw')throw Error('final failed');return [{type:'text',text:'final:'+textOf(result)}];}});
  h.ctx.on('tools/pre-execute',async(exec,next)=>{
   log('pre.enter',{args:exec.arguments,argsFrozen:Object.isFrozen(exec.arguments),nestedFrozen:Object.isFrozen((exec.arguments as any)?.input),execFrozen:Object.isFrozen(exec),callIdWritable:Object.getOwnPropertyDescriptor(exec,'callId')?.writable});
   if(kind==='pre-throw')throw Error('pre failed');
   if(kind==='deny')return {kind:'deny',reason:'演示拒绝'};
   if(kind==='ask')return {kind:'ask',reason:'需要审批通道'};
   if(kind==='cancel')return {kind:'cancel'};
   const d=await next();log('pre.return',{decision:d.kind});return d;
  });
  h.ctx.tools.guard(()=>{log('guard');return kind==='guard'?'所有者拒绝':undefined;});
  h.ctx.on('tools/execute',async(_exec,next)=>{log('around.enter');if(kind==='around-throw')throw Error('wrapper failed');const r=await next();log('around.return');return r;});
  h.ctx.on('tools/post-execute',async(_exec,r,next)=>{log('post',{value:(r as any).value,content:textOf(r)});
   if(kind==='post-throw')throw Error('post failed');
   if(kind==='content')return {kind:'accept',content:[{type:'text',text:'后置可见内容'}]};
   if(kind==='value')return {kind:'accept',value:{title:'policy',chars:6}};
   if(kind==='block')return {kind:'block',feedback:[{type:'text',text:'结果被阻止'}]};
   return next();});
  h.ctx.on('tools/result',(exec,r)=>{observed=r;log('observe',{execFrozen:Object.isFrozen(exec),resultFrozen:Object.isFrozen(r),contentFrozen:Object.isFrozen(r.content),identitySet:Reflect.set(exec,'callId','forbidden')});
   if(kind==='observer-throw')throw Error('observer failed');});
  const block=call('flow-1','inspect_fixture');if(raw!==undefined)block.arguments=raw;
  const batch=await h.ctx.tools.execute({calls:[block],signal:new AbortController().signal});
  return {kind,raw:block.arguments,trace,bodies,batch,result:batch.results[0].result,observerSame:observed===batch.results[0].result,log:'ABSENT: no agent/log supplied; no root Session events'};
 }finally{await h.close();}
}
