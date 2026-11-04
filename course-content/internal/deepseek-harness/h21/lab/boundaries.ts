import {fixture,assert,blocks,text,gate,until,bounded,SessionId} from './support.ts';
export const C_CASES=['tool-registration','external-cleanup','teardown-failure','startup-abort','parent-replaced'] as const;
export async function componentBoundary(mode:string){
 const f=await fixture({delegate:true,disk:mode!=='parent-replaced'}),g=gate(),runResult=Promise.withResolvers<any>();
 try{
  const parent=await f.create();
  if(mode==='tool-registration'){
   assert.ok(f.ctx.tools.get('subagent',parent));await f.spawnFiber.dispose();assert.equal(f.ctx.tools.get('subagent',parent),undefined);
   assert.ok(f.ctx.subagents.getProvider('fork'));return {toolRemoved:true,otherProvider:'fork'};
  }
  let disposed=0,started=false,controller:AbortSignal|undefined;
  f.ctx.subagents.registerProvider({name:'handle-fixture',inheritsParentContext:false,capabilities:{agentOptions:false,agentPreset:false,outputSchema:false,depthLimit:false},async start(request:any){
   started=true;controller=request.signal;
   if(mode==='startup-abort'){
    await new Promise<void>(resolve=>request.signal.addEventListener('abort',()=>resolve(),{once:true}));disposed++;request.signal.throwIfAborted();
   }
   return {id:SessionId('external-fixture'),result:runResult.promise,async dispose(){disposed++;await g.promise;if(mode==='teardown-failure')throw Error('controlled release failure');}};
  }});
  const c=new AbortController();
  const starting=f.ctx.subagents.startActivation({provider:'handle-fixture',label:'fake execution handle',request:{parent,prompt:blocks('constant fixture')},signal:c.signal,delivery:mode==='parent-replaced'?'parent':'caller'});
  if(mode==='startup-abort'){
   await until(()=>started);c.abort();await assert.rejects(starting);assert.equal(disposed,1);assert.equal(f.lifecycle.length,0);
   return {startupCancelled:true,partialCleanup:disposed,externalProcess:false};
  }
  const activation=await starting;f.owned.add(activation);
  await assert.rejects(f.ctx.subagents.sendMessage(parent,activation.childId,blocks('unsupported'),{signal:new AbortController().signal}),{code:'NOT_CONTINUABLE'});
  c.abort();assert.equal(controller!.aborted,false);
  if(mode==='parent-replaced'){
   // Closing only the H09 parent handle is distinct from scoped descendant drain.
   // It leaves this independent managed handle until the manager settles it.
   // Exact original parent is unavailable; result cannot be addressed to another instance.
   await f.release(parent);const replacement=await f.create('parent');assert.notEqual(replacement,parent);
  }
  runResult.resolve({output:blocks('captured result'),stopReason:'completed'});
  let settled=false;const outcome=activation.result.then(v=>{settled=true;return v;});await until(()=>disposed===1);assert.equal(settled,false);
  g.release();const result=await bounded(outcome);assert.deepEqual(result.output,blocks('captured result'));
  if(mode==='teardown-failure'){
   await assert.rejects(activation.dispose(),/controlled release failure/);f.owned.delete(activation);
   assert.equal(f.lifecycle.at(-1).stopReason,'error');assert.equal(result.stopReason,'completed');
  }else{await activation.dispose();assert.equal(disposed,1);}
  if(mode==='parent-replaced'){assert.equal(f.adapter.requests.length,0);assert.equal(f.events(parent).filter(e=>e.type==='user/message'&&e.data.source.kind==='subagent-settled').length,0);}
  return {mode,result,lifecycle:f.lifecycle,disposed,resultWaitedForCleanup:true,externalProcess:false};
 }finally{runResult.resolve({output:[],stopReason:'aborted'});g.release();await f.close();}
}
export async function persistedDiscovery(){
 const f=await fixture();let root:string|undefined,id:any,childId:any,stored:any;
 try{const parent=await f.create();id=parent.id;f.adapter.scripts.set('child',[text('saved child')]);const a=await f.start(parent);childId=a.childId;await bounded(a.result);await f.ctx.sessions.flush(parent.session);root=f.root;stored=await f.stored(childId);}finally{await f.close();}
 const next=await fixture({root});
 try{
  assert.equal(next.ctx.agents.list().length,0);
  const children=await next.ctx.subagents.listChildren(id),tree=await next.ctx.subagents.listDescendants(id);
  assert.equal(children[0].id,childId);assert.equal(tree[0].activity,'inactive');assert.equal(next.ctx.agents.list().length,0);assert.equal(next.adapter.requests.length,0);
  const reread=await next.stored(childId);assert.deepEqual(reread.events,stored.events);
  return {root,children,tree,agents:[],modelCalls:0,newContext:true,stored:reread};
 }finally{await next.close();}
}
