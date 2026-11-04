import {fixture,assert,text,gate,until,bounded,user,hasText} from './support.ts';
export const B_CASES=['spawn','child-failure','post-accept-abort'] as const;
export async function practiceB(mode:string){
 const g=gate(),f=await fixture();
 try{
  const parent=await f.create('parent',async(inner:any)=>{f.tool('parent_only',async()=>'parent secret',inner);});
  f.adapter.scripts.set('parent',[text('PARENT_PRIVATE_HISTORY')]);parent.followup(user('parent context'));await bounded(parent.whenIdle());
  let entered=false;
  f.adapter.scripts.set('child',[async function*(){entered=true;await g.promise;if(mode==='child-failure')throw Error('controlled child transport failure');yield*text('test-count=3');}]);
  const c=new AbortController();const a=await f.start(parent,'spawn',{signal:c.signal});const child=f.ctx.agents.get(a.childId)!;
  await until(()=>entered);assert.notEqual(child.id,parent.id);assert.equal(child.session.inheritedEventCount,0);
  assert.equal(f.ctx.agents.isOwnedBy(child.id,parent),true);assert.equal(f.ctx.tools.get('parent_only',child),undefined);
  assert.equal(hasText(f.events(child),'PARENT_PRIVATE_HISTORY'),false);assert.ok(hasText(f.events(child),'Inspect fictional tests'));
  assert.notEqual(child.ctx,parent.ctx);assert.equal(parent.status,'idle');assert.equal(child.status,'running');
  if(mode==='post-accept-abort'){c.abort();assert.equal(child.status,'running');}
  g.release();const result=await bounded(a.result);await a.dispose();
  assert.equal(result.stopReason,mode==='child-failure'?'error':'completed');assert.equal(f.ctx.agents.get(child.id),undefined);
  return {mode,parentId:parent.id,childId:child.id,inherited:child.session.inheritedEventCount,parentTools:f.ctx.tools.schemas(parent).map((x:any)=>x.name),result,lifecycle:f.lifecycle,parent:f.events(parent),child:f.events(child),requests:f.adapter.requests,errors:f.errors};
 }finally{g.release();await f.close();}
}
