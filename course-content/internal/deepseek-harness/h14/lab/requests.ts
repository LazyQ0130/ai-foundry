import {harness,MockAdapter,callChunks,textChunks,call,infoTool,send,notice,gate,reached,textOf} from './support.ts';
export type LoopCase='success'|'deny'|'body-error'|'cancel'|'conclude'|'conclude-context'|'block-conclude'|'internal';
export async function requestsPractice(kind:LoopCase='success'){
 const calls=[call('readme','inspect_fixture',{input:{label:'README'}}),call('package','inspect_fixture',{input:{label:'package.json'}})];
 if(kind==='internal')calls.push(call('third','inspect_fixture'));
 const adapter=new MockAdapter([callChunks(calls),textChunks()]),h=await harness(adapter);
 const trace:string[]=[],observed:any[]=[],entered=gate(),release=gate();let bodies=0;
 try{
  const agent=await h.create('h14-'+kind);
  h.ctx.tools.register(infoTool('inspect_fixture',async(args,exec)=>{bodies++;trace.push('body:'+exec.callId);h.record('tool','body.start',{callId:exec.callId});
   if(kind==='cancel'&&exec.callId==='readme'){entered.resolve();await release.promise;trace.push('settled:readme');h.record('tool','body.settled',{callId:exec.callId});}
   if(kind==='body-error'&&exec.callId==='readme')throw Error('内存业务失败');
   if(kind!=='conclude')exec.deferContext(notice('补充:'+exec.callId));
   if(['conclude','conclude-context','block-conclude'].includes(kind))exec.concludeTurn();
   return {title:args.input.label,chars:args.input.label.length};}));
  h.ctx.on('tools/pre-execute',async(exec,next)=>{trace.push('pre:'+exec.callId);h.record('policy','pre.enter',{callId:exec.callId});return kind==='deny'&&exec.callId==='readme'?{kind:'deny',reason:'受控拒绝'}:next();});
  h.ctx.on('tools/execute',async(exec,next)=>{trace.push('around.enter:'+exec.callId);const r=await next();trace.push('around.return:'+exec.callId);return r;});
  h.ctx.on('tools/post-execute',async(exec,_r,next)=>{trace.push('post:'+exec.callId);
   return kind==='block-conclude'?{kind:'block',feedback:[{type:'text',text:'阻止成功结论'}],additionalContexts:[notice('仅保留阻止方上下文')]}:next();});
  h.ctx.on('tools/result',(exec,r)=>{trace.push('observe:'+exec.callId);observed.push({callId:exec.callId,result:r});});
  if(kind==='internal'){
   const complete=h.pipeline.complete.bind(h.pipeline);
   h.pipeline.complete=async(exec,outcome)=>{if(exec.callId==='package')throw Error('受控complete基础设施失败');return complete(exec,outcome);};
  }
  const work=send(agent);
  if(kind==='cancel'){await reached(entered.promise,work);agent.cancel({kind:'user'});release.resolve();}
  await work;
  const captured=h.capture(agent),facts=captured.facts;
  return {kind,bodies,trace,observed,...captured,summary:{calls:facts.filter(e=>e.type==='tool/call').map(e=>e.data.callId),
   results:facts.filter(e=>e.type==='tool/result').map(e=>({id:e.data.message.toolCallId,isError:e.data.message.isError,code:e.data.error?.code,content:textOf(e.data.message)})),
   steps:facts.filter(e=>e.type==='step/start').length,turnEnd:facts.filter(e=>e.type==='turn/end').at(-1)?.data.reason}};
 }finally{release.resolve();await h.close();}
}
