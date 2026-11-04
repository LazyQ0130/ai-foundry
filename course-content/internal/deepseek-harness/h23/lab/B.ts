import {assert,bounded,gate,until,text,blocks,SessionId,record} from './support.ts';
import {webFixture} from './web-fixture.ts';
export async function webReview(){
 const f=await webFixture();try{
  f.adapter.scripts.set('parent',[text('REVIEW modules=3; covered=2/3')]);
  const created=await f.call('create',{sessionId:'web-review',cwd:process.env.H23_RUN_ROOT});assert.equal(created.ok,true,JSON.stringify(created));
  const abort=new AbortController(),stream=f.client.connection.rpc.open!('/api','session/follow',{args:{request:{address:{kind:'session',sessionId:'web-review'}}}},abort.signal)[Symbol.asyncIterator]();
  const snapshot=await bounded(stream.next());assert.equal(snapshot.value.type,'snapshot');
  const receipt=await f.call('prompt',{requestId:'h23-input',sessionId:'web-review',mode:'queue',content:blocks('Inspect fictional facts')});assert.equal(receipt.ok,true,JSON.stringify(receipt));
  const agent=f.ctx.agents.get(SessionId('web-review'))!;await bounded(agent.whenIdle());
  const frames:any[]=[];while(!frames.some(x=>x.type==='event'&&x.event.type==='turn/end')){const n=await bounded(stream.next());assert.equal(n.done,false);frames.push(n.value);}
  abort.abort();await stream.return?.();await f.ctx.parallel('session/flush',agent.session);
  const stored=await f.stored(agent.id);const result={created,receipt,snapshot,frames,events:f.events(agent),stored:stored.events,requests:f.adapter.requests,wire:f.wire,root:f.root,transport:'real Client RPC envelope + real Gateway + SessionController; author in-process fetch/stream carrier, no HTTP socket or browser'};
  await record('B-web-review',result);return result;
 }finally{await f.close();}
}
export const cases:[string,()=>Promise<void>][]=[
 ['C B6 actual Session client stream rebaselines on a revision gap',async()=>{
  const {pathToFileURL}=await import('node:url'),{resolve}=await import('node:path');const source=process.env.HARNESS_SOURCE_CACHE!;
  const {SessionEventStream}=await import(pathToFileURL(resolve(source,'packages/api/session-controller/src/client/transport.ts')).href);
  const {RemoteStream}=await import('@deepseek-ai/dsh-api-gateway/client');const {SESSION_FORMAT_VERSION}=await import('@deepseek-ai/dsh-session');
  let follows=0,pages=0;const published:any[]=[],errors:string[]=[];
  const snapshot=(revision:number)=>({type:'snapshot',header:{version:SESSION_FORMAT_VERSION,id:'revision-fixture',createdAt:0},cursor:0,records:[{type:'event',event:{type:'turn/start',seq:0,time:0,data:{turn:1}}}],hasMore:false,assistantStream:{revision}});
  const connection={generation:{getSnapshot:()=>({id:1,host:{home:'fixture'}}),subscribe:()=>()=>{}}};
  const remote={session:{follow:(_request:any,signal:AbortSignal)=>({async *[Symbol.asyncIterator](){const n=++follows;yield snapshot(n===1?0:3);if(n===1){yield {type:'assistant-stream',frame:{type:'start',attemptId:'attempt',revision:1,startedAfterSeq:0,turn:1,step:1}};yield {type:'assistant-stream',frame:{type:'chunk',attemptId:'attempt',revision:3,index:0,time:1,chunk:{type:'text-delta',index:0,text:'gap'}}};}else if(!signal.aborted)await new Promise<void>(r=>signal.addEventListener('abort',()=>r(),{once:true}));}}),page:()=>{pages++;throw Error('not needed');}},$stream:(options:any)=>new RemoteStream(connection,options)};
  const stream=new SessionEventStream(remote as any,{kind:'session',sessionId:'revision-fixture'} as any,{publish:c=>published.push(c),carrierFailed:e=>errors.push(e.message),failed:e=>{throw e;}});
  try{await stream.open({});await until(()=>follows===2&&published.filter(p=>p.type==='replace').length===2);assert.deepEqual(published.map(p=>p.type),['replace','assistant-stream','replace']);assert.match(errors[0],/skipped revision 2/);assert.equal(pages,0);await record('B6',{follows,pages,published,errors,limit:'real client stream classes, controlled decoded Remote source; not a physical WebSocket'});}finally{await stream.dispose();}
 }],
 ['D B1 real Client RPC, Gateway, SessionController and model history',async()=>{await webReview();}],
 ['C B2 Gateway named inputs and non-owner access refuse before model work',async()=>{
  const f=await webFixture();try{const malformed=await f.client.connection.rpc.call('/api','session/create',{args:{}}),conflict=await f.call('create',{cwd:process.env.H23_RUN_ROOT,workspaceId:'missing'});assert.equal(malformed.ok,false);assert.equal(conflict.ok,false);
   f.ctx.remoteAccess.registerPolicy('h23-guest' as any,{bindings:()=>[]} as any);let error:any;try{await f.ctx.typertGateway.invoke({peer:f.peer(undefined,{kind:'h23-guest'}),namespace:'session',method:'create',args:{request:{}}});assert.fail('guest must be refused');}catch(e:any){error={name:e.name,code:e.code,message:e.message};assert.equal(e.code,'remote-access/denied');}assert.equal(f.adapter.requests.length,0);assert.equal(f.ctx.agents.list().length,0);await record('B2',{malformed,conflict,error,wire:f.wire,limit:'controlled authenticated Peer; no browser cookie or Origin security audit'});
  }finally{await f.close();}
 }],
 ['D B3 Web cancel receipt is followed by actual model and Turn quiescence',async()=>{
  const f=await webFixture(),entered=gate();try{f.adapter.scripts.set('parent',[async function*(options:any){entered.release();if(!options.signal.aborted)await new Promise<void>(r=>options.signal.addEventListener('abort',()=>r(),{once:true}));options.signal.throwIfAborted();}]);await f.call('create',{sessionId:'cancel-web',cwd:process.env.H23_RUN_ROOT});await f.call('prompt',{sessionId:'cancel-web',requestId:'cancel-input',mode:'queue',content:blocks('HOLD')});await bounded(entered.promise);const receipt=await f.call('cancel',{sessionId:'cancel-web'});assert.deepEqual(receipt,{ok:true,value:{accepted:true}});const agent=f.ctx.agents.get(SessionId('cancel-web'))!;await bounded(agent.whenIdle());assert.ok(f.events(agent).some((e:any)=>e.type==='turn/end'&&e.data.reason.kind==='aborted'));await record('B3',{receipt,events:f.events(agent),requests:f.adapter.requests});}finally{await f.close();}
 }],
 ['C B4 Connection generations drain old sources before replacement',async()=>{
  const f=await webFixture(),hold=gate();let starts=0,active=0,peak=0,oldSignal:AbortSignal|undefined,oldReady:any;try{
   f.client.connection.registerGenerationSource(async(signal,ready)=>{const n=++starts;active++;peak=Math.max(peak,active);if(n===1){oldSignal=signal;oldReady=ready;}ready({home:'fixture-'+n});await new Promise<void>(r=>{if(signal.aborted)r();else signal.addEventListener('abort',()=>r(),{once:true});});if(n===1)await hold.promise;active--;});
   const states:any[]=[],loop=f.client.connection.start({onStateChange:s=>states.push(s)});await until(()=>f.client.connection.generation.getSnapshot()?.id===1);f.client.connection.reconnect();await until(()=>oldSignal!.aborted);assert.equal(starts,1);oldReady({home:'stale'});assert.notEqual(f.client.connection.generation.getSnapshot()?.host.home,'stale');hold.release();await until(()=>f.client.connection.generation.getSnapshot()?.id===2);assert.equal(peak,1);const generation=f.client.connection.generation.getSnapshot();loop.stop();await until(()=>active===0);await record('B4',{states,generation,starts,peak,oldSourceAborted:true,transport:'controlled generation source; not a browser socket'});
  }finally{hold.release();await f.close();}
 }],
 ['D B5 history repull in a new Context reads JSONL without activating Agent',async()=>{
  const a=await webFixture();let root:string|undefined;try{a.adapter.scripts.set('parent',[text('REVIEW modules=3; covered=2/3')]);await a.call('create',{sessionId:'cold-web',cwd:process.env.H23_RUN_ROOT});await a.call('prompt',{sessionId:'cold-web',requestId:'cold-input',mode:'queue',content:blocks('fictional')});await bounded(a.ctx.agents.get(SessionId('cold-web'))!.whenIdle());root=a.root;}finally{await a.close();}
  const b=await webFixture({root});try{const page=await b.call('page',{address:{kind:'session',sessionId:'cold-web'}});assert.equal(page.ok,true,JSON.stringify(page));assert.ok(JSON.stringify(page).includes('modules=3'));assert.equal(b.ctx.agents.list().length,0);assert.equal(b.adapter.requests.length,0);await record('B5',{root,page,agents:0,modelRequests:0,transport:b.wire,limit:'same process new Context and real JSONL read; no UI reload or physical crash'});}finally{await b.close();}
 }],
];
