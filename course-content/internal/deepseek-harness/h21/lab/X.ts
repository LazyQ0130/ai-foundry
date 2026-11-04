import {fixture,assert,text,call,gate,until,bounded,user,hasText,blocks} from './support.ts';
import {practiceC} from './C.ts';
export async function integrated(){
 const g=gate(),f=await fixture({control:true});
 try{
  let parentRequests=0,childRequests=0,child:any;
  const parent=await f.create('parent',async(inner:any)=>{f.tool('parent_only',async()=>'architecture fixture',inner);});
  f.ctx.on('agent/created',({agent})=>{if(agent.id!==parent.id){child=agent;f.tool('child_only',async()=>'test-count=3',agent.ctx);}});
  // Each route is a deterministic Mock script. No real model reasons about the fixture.
  // An explicitly configured child route uses a separate Mock script.
  const Delegate=await import('@deepseek-ai/dsh-tool-subagent');
  await f.ctx.plugin(Delegate,{provider:'spawn',toolName:'inspect_subagent',agentOptions:{model:'child'}});
  const firstParent=async function*(options:any){parentRequests++;if(!hasText(options.messages,'started subagent'))yield*call('inspect_subagent',{description:'inspect test suite',prompt:'Use child_only on fictional tests; report test-count=3 via send_message.'});else yield*text('Parent integrated the delegated evidence.');};
  f.adapter.scripts.set('parent',Array(12).fill(firstParent));
  f.adapter.scripts.set('child',[
   async function*(){childRequests++;await g.promise;yield*call('child_only');},
   call('send_message',{agent_id:parent.id,message:'test-count=3; fixture only'}),text('CHILD_CLOSING'),text('FOLLOWUP_REPLY'),
  ]);
  parent.followup(user('Analyze architecture and test coverage of the fictional project.'));
  await until(()=>childRequests===1);await bounded(parent.whenIdle());
  const toolResult=f.events(parent).find(e=>e.type==='tool/result'&&hasText([e],'started subagent'));
  assert.ok(toolResult);assert.equal(child.status,'running');assert.equal(hasText(f.events(parent),'test-count=3; fixture only'),false);
  assert.equal(f.ctx.tools.get('parent_only',child),undefined);assert.equal(f.ctx.tools.get('child_only',parent),undefined);
  const visibleTools={parent:f.ctx.tools.schemas(parent).map(x=>x.name),child:f.ctx.tools.schemas(child).map(x=>x.name)};
  const firstId=child.id;g.release();await bounded(f.ctx.subagents.waitForChildren(parent));await bounded(parent.whenIdle());
  assert.ok(f.events(parent).some(e=>e.type==='user/message'&&e.data.source.kind==='agent-message'));
  const notice=f.events(parent).find(e=>e.type==='user/message'&&e.data.source.kind==='subagent-settled');assert.ok(notice);
  assert.ok(hasText([notice],'closing message is omitted'));assert.equal(hasText([notice],'CHILD_CLOSING'),false);
  const childBefore=await f.stored(firstId);assert.equal(f.ctx.agents.get(firstId),undefined);
  const receipt=await f.exec(parent,'send_message',{agent_id:firstId,message:'Continue: explain the fixture limit.'});
  await bounded(f.ctx.subagents.waitForChildren(parent));await bounded(parent.whenIdle());
  const childAfter=await f.stored(firstId);assert.ok(hasText(childAfter.events,'FOLLOWUP_REPLY'));
  assert.deepEqual(childAfter.events.slice(0,childBefore.events.length),childBefore.events);
  await f.ctx.sessions.flush(parent.session);
  const children=await f.ctx.subagents.listChildren(parent.id),registry=f.ctx.agents.list().map(a=>({id:a.id,status:a.status}));
  assert.equal(children.length,1);assert.deepEqual(registry,[{id:parent.id,status:'idle'}]);
  return {toolResult,receipt,visibleTools,parentRequests,childRequests,parent:f.events(parent),childBefore,childAfter,lifecycle:f.lifecycle,children,registry,requests:f.adapter.requests,root:f.root,comparison:await practiceC(false)};
 }finally{g.release();await f.close();}
}
