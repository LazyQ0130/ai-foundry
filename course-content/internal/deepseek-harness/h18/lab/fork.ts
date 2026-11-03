import {createToolResultMessage} from '@deepseek-ai/dsh-llm';
import {assert,Context,SessionStore,SessionId,SessionSeq,user,createAssistantMessage,ToolCallId,type SessionEvent} from './support.ts';
export async function forkPractice(){
 const ctx=new Context();await ctx.plugin(SessionStore);const logs=new Map<string,SessionEvent[]>();
 ctx.on('session/created',s=>{logs.set(s.id,[]);});ctx.on('session/event',(s,e)=>{logs.get(s.id)!.push(e);});
 try{
  const source=ctx.sessions.create(SessionId('fork-parent'));
  source.append('turn/start',{turn:1});source.append('step/start',{turn:1,step:1});source.append('user/message',user('计算2+3'),{surfaceOp:'append'});
  source.append('assistant/message',{turn:1,step:1,stream:[],message:createAssistantMessage({source:{provider:'fixture',model:'scripted'},content:[{type:'tool-call',id:ToolCallId('sum'),name:'sum',arguments:'{"a":2,"b":3}'}]})},{surfaceOp:'append'});
  source.append('tool/call',{turn:1,step:1,callId:ToolCallId('sum'),name:'sum',arguments:'{"a":2,"b":3}'});
  source.append('tool/result',{turn:1,step:1,message:createToolResultMessage({callId:ToolCallId('sum'),isError:false,content:[{type:'text',text:'5'}]})},{surfaceOp:'append',sourceEventSeqs:[SessionSeq(4)]});
  source.append('step/end',{turn:1,step:1});source.append('step/start',{turn:1,step:2});
  source.append('assistant/message',{turn:1,step:2,stream:[],message:createAssistantMessage({source:{provider:'fixture',model:'scripted'},content:[{type:'text',text:'答案5'}]})},{surfaceOp:'append'});
  source.append('step/end',{turn:1,step:2});source.append('turn/end',{turn:1,reason:{kind:'completed'}});
  source.append('turn/start',{turn:2});source.append('step/start',{turn:2,step:1});source.append('user/message',user('换一种算法'),{surfaceOp:'append'});
  const original=[...logs.get(source.id)!];
  // seed不发session/event；用真实消息派生及继承数量验证构造，完整seed另由buildForkSeed受测。
  const child=ctx.sessions.fork(source,SessionSeq(4),SessionId('fork-child'));
  const latest=ctx.sessions.fork(source,undefined,SessionId('fork-latest'));
  const closed=ctx.sessions.fork(source,SessionSeq(10),SessionId('fork-closed'));
  assert.equal(child.inheritedEventCount,5);assert.equal(child.seq,9);
  assert.equal(latest.inheritedEventCount,14);assert.equal(latest.seq,17);assert.equal(closed.seq,12);
  const result=child.deriveMessages().find(m=>m.role==='tool')!;assert.ok(result.isError);assert.match(JSON.stringify(result),/parent session/);
  assert.equal(child.header.isSeeded,true);assert.equal(child.header.parentSession,undefined);assert.equal(child.header.origin,undefined);
  assert.deepEqual(logs.get(source.id),original);
  const beforeParent=source.deriveMessages();child.append('user/message',user('分支独有'),{surfaceOp:'append'});
  assert.deepEqual(source.deriveMessages(),beforeParent);
  const beforeChild=child.deriveMessages();source.append('user/message',user('父会话独有'),{surfaceOp:'append'});
  assert.deepEqual(child.deriveMessages(),beforeChild);
  for(const bad of [-1,0.5,source.seq])assert.throws(()=>ctx.sessions.fork(source,bad as any,SessionId('bad')));
  assert.throws(()=>ctx.sessions.fork(source,undefined,child.id),/already exists/);
  const empty=ctx.sessions.create(SessionId('empty')),emptyChild=ctx.sessions.fork(empty,undefined,SessionId('empty-child'));
  assert.equal(emptyChild.inheritedEventCount,0);assert.equal(emptyChild.seq,1);
  return {original,explicit:{boundary:4,inherited:child.inheritedEventCount,header:child.header,seqBeforeFuture:9,messages:beforeChild},
   latest:{boundary:13,inherited:latest.inheritedEventCount,seq:latest.seq},closed:{boundary:10,inherited:closed.inheritedEventCount,seq:closed.seq},
   parentSeq:source.seq,childSeq:child.seq,empty:{inherited:0,seq:emptyChild.seq},toolExecutions:0,parentUnchangedByFork:true};
 }finally{await ctx.fiber.dispose();}
}
