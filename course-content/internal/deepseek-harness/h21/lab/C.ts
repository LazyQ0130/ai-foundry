import {fixture,assert,text,gate,until,bounded,user,hasText,SessionId,SessionSeq,record} from './support.ts';
export async function practiceC(empty=false){
 const pg=gate(),cg=gate(),f=await fixture();let ordinary:any;
 try{
  const p=await f.create();
  if(!empty){f.adapter.scripts.set('parent',[text('COMPLETED_PARENT')]);p.followup(user('closed turn'));await bounded(p.whenIdle());}
  const prefix=[...f.events(p)];let parentEntered=false;
  f.adapter.scripts.set('parent',[async function*(){parentEntered=true;yield {type:'text-delta',index:0,text:'CURRENT_PARTIAL'};await pg.promise;yield {type:'finish',reason:{kind:'stop'}};}]);
  p.followup(user('CURRENT_OPEN_INPUT'));await until(()=>parentEntered);
  const openInput=f.events(p).findLast(e=>e.type==='user/message'&&hasText([e],'CURRENT_OPEN_INPUT'))!;
  ordinary=f.ctx.sessions.fork(p.session,SessionSeq(openInput.seq),SessionId('ordinary-fork'));
  assert.equal(ordinary.header.parentSession,undefined);assert.ok(hasText(ordinary.deriveMessages(),'CURRENT_OPEN_INPUT'));
  const childReply=async function*(){await cg.promise;yield*text('CHILD_OWN_ANSWER');};
  // Keep the fork on the inherited request route; this exercise isolates history,
  // and does not claim to verify changing a seeded child's model selection.
  if(empty)f.adapter.scripts.set('child',[childReply]);else f.adapter.scripts.get('parent')!.push(childReply);
  const a=await f.start(p,'fork',{agentOptions:{model:empty?'child':'parent'}});const child=f.ctx.agents.get(a.childId)!;
  const inherited=child.session.inheritedEventCount;
  assert.equal(inherited,prefix.length);assert.equal(hasText(f.events(child),'CURRENT_OPEN_INPUT'),false);
  // Inherited events are observed through the production point-read, not emitted anew.
  using observation=await f.ctx.sessionQuery.observeSession(child.id);
  assert.deepEqual(observation.events.slice(0,inherited),prefix);
  assert.equal(empty?child.session.header.isSeeded===false:child.session.header.isSeeded===true,true);
  pg.release();await bounded(p.whenIdle());
  assert.equal(hasText(f.events(child),'CURRENT_PARTIAL'),false);
  cg.release();const result=await bounded(a.result);const stored=await f.stored(child.id);
  await record('fork-diagnostic-'+empty,{result,options:child.options,requests:f.adapter.requests,errors:f.errors,stored});
  assert.deepEqual(stored.events.slice(0,inherited),prefix);assert.ok(hasText(stored.events.slice(inherited),'CHILD_OWN_ANSWER'));
  const catalog=await f.ctx.subagents.listChildren(p.id);assert.ok(catalog.some(x=>x.id===child.id));assert.ok(!catalog.some(x=>x.id===ordinary.id));
  return {empty,prefix,inherited,openInput,child:stored,ordinary:{header:ordinary.header,messages:ordinary.deriveMessages()},catalog,result,parent:f.events(p),lifecycle:f.lifecycle};
 }finally{pg.release();cg.release();await f.close();}
}
