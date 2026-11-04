import {fixture,assert,text,blocks,bounded} from './support.ts';
export const A_CASES=['registry','capabilities','cancel-start','no-persistence','caller'] as const;
export async function practiceA(mode:string){
 const f=await fixture({disk:mode!=='no-persistence'&&mode!=='registry'});
 try{
  const p=await f.create();
  if(mode==='registry'){
   assert.deepEqual(f.ctx.subagents.list(),['spawn','fork']);
   assert.equal(f.ctx.subagents.getProvider('spawn')!.inheritsParentContext,false);
   assert.equal(f.ctx.subagents.getProvider('fork')!.inheritsParentContext,true);
   assert.throws(()=>f.ctx.subagents.registerProvider({name:'broken'} as any),{code:'UNSUPPORTED_CAPABILITY'});
   assert.throws(()=>f.ctx.subagents.registerProvider(f.ctx.subagents.getProvider('spawn')!),{code:'DUPLICATE_PROVIDER'});
   await assert.rejects(f.start(p,'missing'),{code:'NO_PROVIDER'});
   return {providers:f.ctx.subagents.list(),missing:'NO_PROVIDER',lifecycle:f.lifecycle};
  }
  if(mode==='capabilities'){
   await assert.rejects(f.start(p,'fork',{agentPreset:'independent'}),{code:'UNSUPPORTED_CAPABILITY'});
   const unregister=f.ctx.subagents.registerProvider({name:'limited',capabilities:{agentOptions:false,agentPreset:false,outputSchema:false,depthLimit:false},inheritsParentContext:false,start:async()=>{throw Error('must not reach');}});
   await assert.rejects(f.start(p,'limited'),{code:'UNSUPPORTED_CAPABILITY'});
   unregister();assert.equal(f.ctx.subagents.getProvider('limited'),undefined);
   assert.equal(f.lifecycle.length,0);return {rejectedBeforeCreation:true};
  }
  if(mode==='cancel-start'){
   const c=new AbortController();c.abort();await assert.rejects(f.start(p,'spawn',{signal:c.signal}));
   assert.deepEqual(f.ctx.agents.list().map(a=>a.id),[p.id]);assert.equal(f.lifecycle.length,0);
   return {accepted:false,registry:f.ctx.agents.list().map(a=>a.id)};
  }
  if(mode==='no-persistence'){
   await assert.rejects(f.start(p,'spawn',{delivery:'parent'}),{code:'PERSISTENCE_UNAVAILABLE'});
   f.adapter.scripts.set('child',[text('ephemeral caller result')]);
   const a=await f.start(p);const result=await bounded(a.result);assert.equal(result.stopReason,'completed');
   assert.equal(f.ctx.agents.get(a.childId),undefined);return {result,parentNotices:f.events(p).filter(e=>e.type==='user/message').length};
  }
  assert.equal(mode,'caller');f.adapter.scripts.set('child',[text('test-count=3')]);
  const a=await f.start(p);const result=await bounded(a.result);await a.dispose();
  assert.deepEqual(result.output,blocks('test-count=3'));assert.equal(f.ctx.agents.get(a.childId),undefined);
  assert.equal(f.events(p).filter(e=>e.type==='user/message').length,0);
  const children=await f.ctx.subagents.listChildren(p.id);assert.equal(children[0].id,a.childId);
  return {result,children,lifecycle:f.lifecycle,parent:f.events(p),child:f.events(a.childId)};
 }finally{await f.close();}
}
