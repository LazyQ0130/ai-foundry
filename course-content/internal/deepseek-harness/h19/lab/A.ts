import {fixture,assert,user,createSystemMessage,createAssistantMessage,canonicalHeader,signal,imageRef,appendTool} from './support.ts';
import {AssistantStreamAccumulator,projectFilesToText} from '@deepseek-ai/dsh-llm';
export async function practiceA(){
 const f=await fixture();try{
  const s=f.ctx.sessions.create();const meter=f.ctx.tokenMeter;
  assert.equal(meter.measure(s).baseline.kind,'none');assert.equal(meter.measure(s).totalTokens,0);
  s.append('system/message',{turn:1,step:1,message:createSystemMessage('abcd')},{surfaceOp:'append'});
  const old=s.append('user/message',user('abcd'),{surfaceOp:'append'});
  assert.equal(meter.measure(s).totalTokens,14); // system 5 + user 9
  const tools=[{name:'read',description:'read',parameters:{type:'object' as const}}];
  const h=canonicalHeader({config:{provider:'fixture',model:'large'},tools});
  s.append('request/header',{header:h,reason:'initial'});
  const schemaPrice=Math.ceil(JSON.stringify(tools).length/4)+4;
  assert.equal(meter.measure(s).totalTokens,14+schemaPrice);
  s.append('user/message',user('q'.repeat(16)),{surfaceOp:'append'});
  const before=meter.measure(s);assert.equal(before.totalTokens,26+schemaPrice);
  s.append('user/message',user('z'),{surfaceOp:{op:'replace',startSeq:old.seq,endSeq:old.seq},sourceEventSeqs:[old.seq]});
  assert.equal(meter.measure(s).nodes.length,3);assert.equal(before.nodes.length,3);assert.ok(Object.isFrozen(before.nodes));
  // Successful request anchor uses the actual embedded compact stream, not an empty invented stream.
  s.append('turn/start',{turn:1});s.append('step/start',{turn:1,step:1});
  const acc=new AssistantStreamAccumulator();const usage={inputTokens:1000,outputTokens:50,cacheReadTokens:100,cacheWriteTokens:20,reasoningTokens:10};
  const chunks:any[]=[{type:'text-delta',index:0,text:'done'},{type:'usage',usage},{type:'finish',reason:{kind:'stop'}}];
  chunks.forEach((chunk,time)=>acc.push({time,chunk}));
  s.append('assistant/message',{turn:1,step:1,message:createAssistantMessage({source:{provider:'fixture',model:'large'},content:[{type:'text',text:'done'}]}),stream:[...acc.snapshot()],usage},{surfaceOp:'append'});
  s.append('step/end',{turn:1,step:1});s.append('turn/end',{turn:1,reason:{kind:'completed'}});
  const anchored=meter.measure(s);assert.equal(anchored.baseline.kind,'usage');assert.equal(anchored.totalTokens,1170);assert.equal(anchored.surfaceDeltaTokens,0);
  s.append('user/message',user('abcd'),{surfaceOp:'append'});assert.equal(meter.measure(s).totalTokens,1179);
  const changed=meter.measure(s,canonicalHeader({...h,config:{...h.config,temperature:0.5}}));assert.equal(changed.baseline.kind,'estimated');
  const tiny=f.ctx.sessions.create();tiny.append('step/start',{turn:1,step:1});tiny.append('request/header',{header:h,reason:'initial'});
  tiny.append('assistant/message',{turn:1,step:1,message:createAssistantMessage({source:{provider:'fixture',model:'large'},content:[{type:'text',text:'answer'}]}),stream:[],usage:{inputTokens:1,outputTokens:1}},{surfaceOp:'append'});
  assert.equal(meter.measure(tiny).baseline.kind,'estimated');
  const images=f.ctx.sessions.create();const img=images.append('user/message',user('',[{type:'image',attachment:imageRef()}]),{surfaceOp:'append'});
  const price=(model:string)=>meter.measure(images,canonicalHeader({config:{provider:'fixture',model}}));
  const small=price('vision-small'),large=price('vision-big');assert.equal(large.surfaceTokens-small.surfaceTokens,1900);assert.equal(large.nodes[0].heuristicTokens,small.nodes[0].heuristicTokens);
  images.append('image/offload',{targets:[{seq:img.seq,imageIndexes:[0]}]});const omitted=price('vision-big');assert.ok(omitted.surfaceTokens<large.surfaceTokens);assert.equal(omitted.nodes[0].heuristicTokens,large.nodes[0].heuristicTokens);
  const files=f.ctx.sessions.create(),ref:any={attachmentId:'sha256:'+'cd'.repeat(32),name:'fixture.txt',bytes:12345};const file=user('',[{type:'file',attachment:ref}]);files.append('user/message',file,{surfaceOp:'append'});
  assert.equal(meter.measure(files).surfaceTokens,meter.estimateMessage(projectFilesToText([file],()=>undefined)[0]));
  const toolSession=f.ctx.sessions.create(),tool=appendTool(toolSession,'abcd'),toolMeasurement=meter.measure(toolSession);
  assert.equal(toolMeasurement.nodes.find(n=>n.seq===tool.seq)!.tokens,9);assert.equal(toolMeasurement.nodes.length,2); // assistant proposal + tool result; tool/call is log-only
  return {numeric:{system:5,user:9,schemaPrice,before:before.totalTokens},anchored,afterUser:1179,changed,images:{small,large,omitted},contextPressure:meter.contextPressure(s),breakdown:f.ctx.sessionProjections.snapshot(s).values.contextBreakdown,toolResult:{measurement:toolMeasurement,events:f.facts.get(toolSession.id)},events:f.facts.get(s.id)};
 }finally{await f.close();}
}
