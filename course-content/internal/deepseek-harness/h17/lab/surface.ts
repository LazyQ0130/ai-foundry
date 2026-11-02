import {assert,fixture,user,injected,assistant,system,createDeveloperMessage,createToolResultMessage,ToolCallId,SessionSeq,view,foldSurface,textOf} from './support.ts';
export async function surfacePractice(){
 const f=await fixture('h17-B');const {session:s,events}=f;
 try{
  s.append('system/message',{turn:1,step:1,message:system('只根据给定材料回答')},{surfaceOp:'append'}); // 0
  s.append('user/message',user('README 原文很长'),{surfaceOp:'append'}); // 1
  s.append('assistant/message',{turn:1,step:1,message:assistant('先检查文件'),stream:[]},{surfaceOp:'append'}); // 2
  s.append('assistant/attempt',{turn:1,step:1,stream:[]}); // 3，仅日志
  s.append('tool/result',{turn:1,step:1,message:createToolResultMessage({callId:ToolCallId('readme'),content:[{type:'text',text:'README 有 src 和 tests'}],isError:false})},{surfaceOp:'append'}); // 4
  s.append('developer/message',{turn:1,step:1,message:createDeveloperMessage({content:[],source:{kind:'tool-registry'}})},{surfaceOp:'append'}); // 5，空节点
  const before=view(s,events),held=s.deriveMessages();assert.equal(held.length,4);
  const replace={surfaceOp:{op:'replace' as const,startSeq:SessionSeq(1),endSeq:SessionSeq(2)},sourceEventSeqs:[SessionSeq(1),SessionSeq(2)]};
  s.append('user/message',injected('历史摘要：请求读取 README；助手准备检查'),replace); // 6
  assert.deepEqual(s.surface.nodes,[0,6,4,5]);assert.equal(s.seq,7);assert.equal(events.length,7);
  assert.equal(s.deriveMessages().length,3);assert.equal(held.length,4);
  const current=s.deriveMessages();assert.notEqual(current,s.deriveMessages());
  assert.equal(current[0],s.deriveMessages()[0]);assert.ok(Object.isFrozen(current[0]));
  current.pop();assert.equal(s.deriveMessages().length,3);
  assert.deepEqual(foldSurface(events).nodes,s.surface.nodes);
  const at=s.seq,visible=s.deriveMessages();
  const invalid=[
   {surfaceOp:{op:'replace',startSeq:1,endSeq:2},sourceEventSeqs:[1,2]}, // 已被遮蔽
   {surfaceOp:{op:'replace',startSeq:6,endSeq:4},sourceEventSeqs:[6]}, // 漏掉4
   {surfaceOp:{op:'replace',startSeq:0,endSeq:0},sourceEventSeqs:[0]}, // 破坏system头
   {surfaceOp:{op:'replace',startSeq:4,endSeq:6},sourceEventSeqs:[4,6]}, // Surface顺序颠倒
  ];
  for(const opts of invalid){assert.throws(()=>s.append('user/message',injected('错误替换'),opts as any));assert.equal(s.seq,at);assert.deepEqual(s.deriveMessages(),visible);}
  // 当前节点是[0,6,4,5]，数值6>4仍是合法的前→后位置跨度。
  s.append('user/message',injected('合并摘要与只读工具结果'),{surfaceOp:{op:'replace',startSeq:SessionSeq(6),endSeq:SessionSeq(4)},sourceEventSeqs:[SessionSeq(6),SessionSeq(4)]});
  assert.deepEqual(s.surface.nodes,[0,7,5]);
  return {before,afterFirst:{nodes:[0,6,4,5],texts:visible.map(textOf)},final:view(s,events),rejected:invalid.length,oldEventsRetained:events[1].type==='user/message'};
 }finally{await f.close();}
}
