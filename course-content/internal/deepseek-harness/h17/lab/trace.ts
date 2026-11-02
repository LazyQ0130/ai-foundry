import {taskDefinition} from './projection.ts';
import SessionProjectionRegistry from '@deepseek-ai/dsh-session-projection';
import {assert,Context,SessionStore,Session,SessionId,SessionSeq,ToolCallId,user,injected,assistant,system,createToolResultMessage,foldSurface,foldRequestHeader,rebuild,view,type SessionEvent} from './support.ts';
// 确定性、合法的组件夹具。手工消息的空 stream 表示省略 H12 细节；完整真实流见实践D。
export function tracePractice(){
 const s=Session.create(SessionId('h17-X')),events:SessionEvent[]=[];
 const append=(...args:any[])=>{const e=Reflect.apply(s.append,s,args) as SessionEvent;
  // 生成器的 UUID / time 在这里规范化为固定夹具值，再交第二个真实 Session 校验。
  const fixed=structuredClone(e) as any;fixed.time=1000+e.seq;
  const message=fixed.type==='user/message'?fixed.data:fixed.data.message;
  if(message)message.id='h17-message-'+e.seq;events.push(fixed);return e;};
 append('turn/start',{turn:1}); // 0
 append('step/start',{turn:1,step:1}); // 1
 append('system/message',{turn:1,step:1,message:system('只根据项目材料作答')},{surfaceOp:'append'}); // 2
 append('user/message',user('读取 README 并检查 tests'),{surfaceOp:'append'}); // 3
 append('request/header',{reason:'initial',header:{config:{provider:'fixture',model:'scripted'},tools:[{name:'inspect_fixture',description:'内存只读',parameters:{type:'object'}}]}}); // 4
 append('request/context',{provider:'fixture',model:'scripted',contextWindow:4096}); // 5
 const tool=assistant('');const message={...tool,content:[{type:'tool-call',id:ToolCallId('readme'),name:'inspect_fixture',arguments:'{}'}]};
 append('assistant/message',{turn:1,step:1,message,stream:[]},{surfaceOp:'append'}); // 6
 append('tool/call',{turn:1,step:1,callId:ToolCallId('readme'),name:'inspect_fixture',arguments:'{}'}); // 7
 append('tool/result',{turn:1,step:1,message:createToolResultMessage({callId:ToolCallId('readme'),content:[{type:'text',text:'src/ 实现；tests/ 测试'}],isError:false})},{surfaceOp:'append',sourceEventSeqs:[SessionSeq(7)]}); // 8
 append('step/end',{turn:1,step:1}); // 9
 append('step/start',{turn:1,step:2}); // 10
 append('assistant/attempt',{turn:1,step:2,stream:[{type:'chunk',time:1011,chunk:{type:'finish',reason:{kind:'error',failure:{code:'SERVER',message:'受控失败'}}}}]}); // 11
 append('assistant/message',{turn:1,step:2,message:assistant('项目有实现目录和测试目录'),stream:[]},{surfaceOp:'append'}); // 12
 append('step/end',{turn:1,step:2}); // 13
 append('turn/end',{turn:1,reason:{kind:'completed'}}); // 14
 append('user/message',injected('任务摘要：已检查 README 和 tests'),{surfaceOp:{op:'replace',startSeq:SessionSeq(3),endSeq:SessionSeq(3)},sourceEventSeqs:[SessionSeq(3)]}); // 15
 const rebuilt=rebuild(events),state=events.reduce(taskDefinition.apply,taskDefinition.init());
 assert.deepEqual(rebuilt.surface.nodes,[2,15,6,8,12]);assert.equal(events.length,16);
 assert.equal(rebuilt.deriveMessages().length,5);assert.equal(state.status,'completed');
 assert.equal(rebuilt.seq,17); // 额外的 session/end-seed 只属于重建实例。
 assert.deepEqual(foldSurface(events).nodes,rebuilt.surface.nodes);
 assert.deepEqual(foldRequestHeader(events),rebuilt.requestHeader());
 return {events,...view(rebuilt,events),state,sourceEventCount:16,reconstructionEventCount:rebuilt.seq,
  atRequest1:{prefixLength:6,nodes:foldSurface(events.slice(0,6)).nodes,messages:rebuild(events.slice(0,6)).deriveMessages()},
  logOnly:events.filter(e=>!e.surfaceOp).map(e=>e.seq),shadowed:[3]};
}
export async function traceRegistryPractice(){
 const x=tracePractice(),ctx=new Context();
 try{
  await ctx.plugin(SessionStore);await ctx.plugin(SessionProjectionRegistry);
  const handle=await ctx.sessionProjections.register(taskDefinition);
  const session=ctx.sessions.create(SessionId('h17-X-registry'),{seed:x.events,meta:{createdAt:0}});
  assert.deepEqual(handle.stateOf(session),x.state);
  return {...x,projectionSnapshot:ctx.sessionProjections.snapshot(session),projectionVerified:'real registry equals independent fold'};
 }finally{await ctx.fiber.dispose();}
}
