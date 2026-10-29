import test from 'node:test';
import assert from 'node:assert/strict';
import { FiberState, type Context, type Fiber } from '@deepseek-ai/cordis';
import { inContext, stateName } from './support.ts';
import { statesExample } from './states.ts';
import { resourcesExample, asyncOrderExample } from './resources.ts';
import { dependenciesExample, ProbeService } from './dependencies.ts';

test('A真实状态：PENDING→LOADING→ACTIVE→UNLOADING→DISPOSED', async () => {
  const r = await statesExample();
  assert.deepEqual(r.states, ['PENDING','LOADING','ACTIVE','UNLOADING','DISPOSED']);
  assert.deepEqual(r.trace, ['apply进入','清理开始','清理完成']);
  assert.equal(r.duringLoad,'LOADING'); assert.equal(r.running,'ACTIVE'); assert.equal(r.duringUnload,'UNLOADING');
  assert.equal(r.final,'DISPOSED'); assert.equal(r.uidNow,null); assert.equal(r.uidWasPresent,true);
});
test('apply失败先卸载已登记资源，再FAILED；await重抛错误', async () => inContext(async ctx => {
  let clean = 0; const states: string[] = [];
  const plugin = { apply(inner: Context) { inner.effect(() => () => { clean++; }); throw Error('STARTUP'); } };
  ctx.on('internal/status', f => { if (f.runtime?.callback === plugin.apply) states.push(stateName(f.state)); });
  const handle = ctx.plugin(plugin);
  await assert.rejects(handle.await(),/STARTUP/); assert.equal(clean,1); assert.equal(handle.state,FiberState.FAILED);
  assert.deepEqual(states,['LOADING','UNLOADING','FAILED']); assert.notEqual(handle.uid,null);
  assert.ok(ctx.logger.buffer.some(m => m.type==='error' && String(m.args[0]).includes('STARTUP')));
  await handle.dispose(); assert.equal(handle.state,FiberState.DISPOSED); assert.equal(clean,1);
}));
test('配置验证失败不执行apply，清理后FAILED', async () => inContext(async ctx => {
  let called = 0;
  const plugin = { Config: { '~standard': { version: 1 as const, vendor:'h07', validate: () => ({issues:[{message:'BAD_CONFIG'}]}) } }, apply(_inner: Context, _config: unknown) { called++; } };
  const handle=ctx.plugin(plugin,{});
  await assert.rejects(handle.await(),/BAD_CONFIG/); assert.equal(called,0); assert.equal(handle.state,FiberState.FAILED);
  await handle.dispose();
}));
test('缺必需服务：await可稳定在PENDING；显式dispose可永久移除', async () => inContext(async ctx => {
  let calls=0;const f=await ctx.plugin({inject:['h07Probe'],apply(){calls++;}});
  assert.equal(f.state,FiberState.PENDING);assert.equal(calls,0);await f.dispose();assert.equal(f.state,FiberState.DISPOSED);
}));
test('同一插件定义可挂两次：共享runtime、独立Fiber/Context；返回可等待句柄', async () => inContext(async ctx => {
  const plugin={apply(){}};const a=ctx.plugin(plugin),b=ctx.plugin(plugin);
  const actual=await a;await b;
  assert.equal(actual,a.ctx.fiber);assert.notEqual(a,actual);assert.notEqual(a.uid,b.uid);assert.notEqual(a.ctx,b.ctx);
  assert.equal(a.runtime,b.runtime);assert.equal(a.runtime!.fibers.length,2);
  await a.dispose();assert.equal(b.state,FiberState.ACTIVE);assert.equal(b.runtime!.fibers.length,1);
}));
test('LOADING时dispose不强行终止apply；第一份dispose承诺等待它结束并清理', async () => inContext(async ctx => {
  const entered=Promise.withResolvers<void>(),release=Promise.withResolvers<void>();let clean=0,done=false;
  const f=ctx.plugin({async apply(inner:Context){inner.effect(()=>()=>{clean++;});entered.resolve();await release.promise;}});
  await entered.promise;const task=f.dispose();void task.then(()=>{done=true;});
  try {await Promise.resolve();assert.equal(done,false);release.resolve();await task;assert.equal(clean,1);assert.equal(f.state,FiberState.DISPOSED);}
  finally{release.resolve();await task;}
}));
test('B自动撤销监听/定时器，连接夹具关闭一次；后续分发与tick无残留', async () => {
  assert.deepEqual(await resourcesExample(),{before:{events:1,ticks:1,closes:0,pending:1,open:true},after:{events:1,ticks:1,closes:1,pending:0,open:false},state:'DISPOSED'});
});
test('受控真实Node setInterval：不等墙钟，卸载后不再tick', async t => {
  t.mock.timers.enable({apis:['setInterval']});
  await inContext(async ctx => {
    let ticks=0;
    const f=await ctx.plugin({apply(inner:Context){inner.effect(()=>{const id=setInterval(()=>ticks++,100);return()=>clearInterval(id);});}});
    t.mock.timers.tick(200);assert.equal(ticks,2);await f.dispose();t.mock.timers.tick(300);assert.equal(ticks,2);
  });
});
test('effect主体立即运行；提前调用句柄与随后卸载只清理一次', async () => inContext(async ctx => {
  let created=0,clean=0;let stop!:()=>Promise<void>;
  const f=await ctx.plugin({apply(inner:Context){stop=inner.effect(()=>{created++;return()=>{clean++;};});assert.equal(created,1);}});
  await stop();await stop();assert.equal(clean,1);await f.dispose();assert.equal(clean,1);
}));
test('公共Effect清理句柄第二次不加入在途任务；所有者卸载会加入第一次清理', async () => inContext(async ctx => {
  const started=Promise.withResolvers<void>(),release=Promise.withResolvers<void>();let stop!:()=>Promise<void>,count=0,ownerDone=false;
  const f=await ctx.plugin({apply(inner:Context){stop=inner.effect(()=>async()=>{count++;started.resolve();await release.promise;});}});
  const first=stop();await started.promise;
  const repeated=stop();assert.equal(repeated,undefined);await repeated;
  const owner=f.dispose();void owner.then(()=>{ownerDone=true;});
  try{const repeatOwner=f.dispose();assert.equal(repeatOwner,undefined);await repeatOwner;await Promise.resolve();assert.equal(ownerDone,false);assert.equal(f.state,FiberState.UNLOADING);release.resolve();await first;await owner;assert.equal(count,1);}
  finally{release.resolve();await owner;}
}));
test('不同Effect逆序启动B/A；受控让A/B完成，卸载等二者', async () => {
  assert.deepEqual(await asyncOrderExample(),{before:['B开始','A开始'],trace:['B开始','A开始','A完成','B完成'],state:'DISPOSED'});
});
test('严格清理顺序放同一Disposer：flush完成后才close', async () => inContext(async ctx => {
  const entered=Promise.withResolvers<void>(),release=Promise.withResolvers<void>();const trace:string[]=[];
  const f=await ctx.plugin({apply(inner:Context){inner.effect(()=>async()=>{trace.push('flush开始');entered.resolve();await release.promise;trace.push('flush完成');trace.push('close');});}});
  const task=f.dispose();try{await entered.promise;assert.deepEqual(trace,['flush开始']);release.resolve();await task;assert.deepEqual(trace,['flush开始','flush完成','close']);}
  finally{release.resolve();await task;}
}));
test('多个yield清理在同一Effect内串行；不可推广为独立Effect都串行', async () => inContext(async ctx => {
  const started=Promise.withResolvers<void>(),release=Promise.withResolvers<void>();const trace:string[]=[];
  const f=await ctx.plugin({apply(inner:Context){inner.effect(function*(){yield()=>{trace.push('A');};yield async()=>{trace.push('B开始');started.resolve();await release.promise;trace.push('B完成');};});}});
  const task=f.dispose();try{await started.promise;assert.deepEqual(trace,['B开始']);release.resolve();await task;assert.deepEqual(trace,['B开始','B完成','A']);}
  finally{release.resolve();await task;}
}));
test('手动清理同步throw会抛出，不自动重试', async () => inContext(async ctx => {
  let stop!:()=>Promise<void>,calls=0;
  const f=await ctx.plugin({apply(inner:Context){stop=inner.effect(()=>()=>{calls++;throw Error('MANUAL_CLEAN');});}});
  assert.throws(()=>stop(),/MANUAL_CLEAN/);await stop();await f.dispose();assert.equal(calls,1);
}));
test('手动异步清理拒绝传给首个调用方', async () => inContext(async ctx => {
  let stop!:()=>Promise<void>;
  const f=await ctx.plugin({apply(inner:Context){stop=inner.effect(()=>async()=>{throw Error('ASYNC_CLEAN');});}});
  await assert.rejects(stop(),/ASYNC_CLEAN/);await f.dispose();
}));
test('所有者卸载记录清理同步/异步错误并继续其他Effect；DISPOSED不证明外部关闭成功', async () => inContext(async ctx => {
  let good=0;const f=await ctx.plugin({apply(inner:Context){
    inner.effect(()=>()=>{good++;});inner.effect(()=>()=>{throw Error('SYNC_CLEAN');});inner.effect(()=>async()=>{throw Error('ASYNC_CLEAN');});
  }});
  await f.dispose();assert.equal(good,1);assert.equal(f.state,FiberState.DISPOSED);
  for(const text of ['SYNC_CLEAN','ASYNC_CLEAN'])assert.ok(ctx.logger.buffer.some(m=>m.type==='error'&&String(m.args[0]).includes(text)));
}));
test('Effect返回非法结构会报错；获取后没交出Disposer的资源不会凭空释放', async () => inContext(async ctx => {
  assert.throws(()=>ctx.effect(()=>42 as never),/Invalid effect/);
  let open=false;assert.throws(()=>ctx.effect(()=>{open=true;throw Error('SETUP');}),/SETUP/);
  assert.equal(open,true);open=false; // 释放本测试的内存夹具，无真实外部资源。
}));
test('父级dispose递归等子级清理；不强制父级各Effect全局串行', async () => inContext(async ctx => {
  let child!:Fiber;const started=Promise.withResolvers<void>(),release=Promise.withResolvers<void>();let done=false;
  let siblingHits=0;const sibling=await ctx.plugin({apply(inner:Context){inner.on('h07/pulse',()=>{siblingHits++;});}});
  const parent=await ctx.plugin({async apply(inner:Context){child=await inner.plugin({apply(c:Context){c.effect(()=>async()=>{started.resolve();await release.promise;});}});}});
  const task=parent.dispose();void task.then(()=>{done=true;});
  try{await started.promise;assert.equal(done,false);assert.equal(child.state,FiberState.UNLOADING);release.resolve();await task;assert.equal(child.state,FiberState.DISPOSED);assert.equal(parent.state,FiberState.DISPOSED);ctx.emit('h07/pulse');assert.equal(sibling.state,FiberState.ACTIVE);assert.equal(siblingHits,1);}
  finally{release.resolve();await task;}
}));
test('C同一Consumer随服务失去/恢复清理与重载，期间无旧事件残留', async () => {
  assert.deepEqual(await dependenciesExample(),{phases:['PENDING','ACTIVE','PENDING','ACTIVE','DISPOSED'],trace:['加载:v1','事件:v1','清理:v1','加载:v2','事件:v2','清理:v2'],runs:2,cleanups:2,events:2,sameUid:true});
});
test('显式dispose的Consumer不会因服务重现自动复活', async () => inContext(async ctx => {
  let runs=0;const c=await ctx.plugin({inject:['h07Probe'],apply(){runs++;}});const p=await ctx.plugin(ProbeService,'one');await c.await();
  await c.dispose();await p.dispose();await ctx.plugin(ProbeService,'two');assert.equal(runs,1);assert.equal(c.state,FiberState.DISPOSED);
}));
test('restart保留Fiber身份，重跑apply，监听器不重复', async () => inContext(async ctx => {
  let runs=0,hits=0,clean=0;const f=await ctx.plugin({apply(inner:Context){runs++;inner.on('h07/pulse',()=>{hits++;});inner.effect(()=>()=>{clean++;});}});const uid=f.uid;
  await f.restart();ctx.emit('h07/pulse');assert.equal(f.uid,uid);assert.equal(runs,2);assert.equal(clean,1);assert.equal(hits,1);assert.equal(f.state,FiberState.ACTIVE);
  await f.dispose();await assert.rejects(f.restart(),e=>(e as {code:string}).code==='INACTIVE_EFFECT');
}));
test('DISPOSED/UNLOADING时不得再创建Effect', async () => inContext(async ctx => {
  const started=Promise.withResolvers<void>(),release=Promise.withResolvers<void>();
  const f=await ctx.plugin({apply(inner:Context){inner.effect(()=>async()=>{started.resolve();await release.promise;});}});const task=f.dispose();
  try{await started.promise;assert.throws(()=>f.ctx.effect(()=>()=>{}),e=>(e as {code:string}).code==='INACTIVE_EFFECT');release.resolve();await task;
    assert.throws(()=>f.ctx.on('h07/pulse',()=>{}),e=>(e as {code:string}).code==='INACTIVE_EFFECT');}
  finally{release.resolve();await task;}
}));
test('移除on只影响后续分发，不自动等待或取消已经开始的异步监听', async () => inContext(async ctx => {
  const started=Promise.withResolvers<void>(),release=Promise.withResolvers<void>();let exits=0;
  const f=await ctx.plugin({apply(inner:Context){inner.on('h07/work',async()=>{started.resolve();await release.promise;exits++;});}});
  const work=ctx.parallel('h07/work');await started.promise;await f.dispose();assert.equal(exits,0);
  try{release.resolve();await work;assert.equal(exits,1);await ctx.parallel('h07/work');assert.equal(exits,1);}
  finally{release.resolve();await work;}
}));
test('异步获取先登记Effect：加载中被dispose，等setup完成后仍释放一次', async () => inContext(async ctx => {
  const started=Promise.withResolvers<void>(),release=Promise.withResolvers<void>();let closes=0,settled=false;
  const f=ctx.plugin({async apply(inner:Context){await inner.effect(async()=>{started.resolve();await release.promise;return()=>{closes++;};});}});
  await started.promise;const task=f.dispose();void task.then(()=>{settled=true;});
  try{await Promise.resolve();assert.equal(settled,false);release.resolve();await task;assert.equal(closes,1);assert.equal(f.state,FiberState.DISPOSED);}
  finally{release.resolve();await task;}
}));
