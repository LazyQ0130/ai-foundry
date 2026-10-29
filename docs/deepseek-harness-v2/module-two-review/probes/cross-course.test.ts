// 新增 B 级探针：官方固定版本 Cordis；内存业务/时间源为教学夹具。
import test from 'node:test';
import assert from 'node:assert/strict';
import { Context, FiberState } from '@deepseek-ai/cordis';

async function fixture(work: (ctx: Context) => Promise<void>) {
  const ctx = new Context();
  try { await work(ctx); } finally { await ctx.fiber.dispose(); }
}

test('M2-01: initial invalid config fails; ACTIVE invalid update keeps old effective service', async () => fixture(async ctx => {
  let calls=0, cleanups=0;
  const plugin={Config:{'~standard':{version:1 as const,vendor:'module-two-audit',
    validate:(c:any)=>typeof c?.value==='number'?{value:c}:{issues:[{message:'NUMBER_REQUIRED'}]}}},
    apply(inner:Context,c:{value:number}) {calls++;inner.provide('auditValue',c.value);inner.effect(()=>()=>{cleanups++;});}};
  const invalid=ctx.plugin(plugin,{value:'bad'} as any);
  await assert.rejects(invalid.await(),/NUMBER_REQUIRED/);
  assert.equal(invalid.state,FiberState.FAILED);assert.equal(calls,0);
  await invalid.dispose();
  const running=await ctx.plugin(plugin,{value:1});
  assert.throws(()=>running.update({value:'bad'}),/NUMBER_REQUIRED/);
  assert.equal(running.state,FiberState.ACTIVE);assert.equal(running.config.value,1);
  assert.equal((running as any)._config.value,'bad');assert.equal(ctx.get('auditValue'),1);
  assert.equal(calls,1);assert.equal(cleanups,0);
  running.update({value:2});await running.await();
  assert.equal(ctx.get('auditValue'),2);assert.equal(calls,2);assert.equal(cleanups,1);
  console.log('M2-01',JSON.stringify({initial:'FAILED; apply=0',rejectedUpdate:{raw:'bad',effective:1,service:1,state:'ACTIVE',cleanups:0},corrected:{effective:2,calls,cleanups}}));
}));

test('A: consumer waits for ACTIVE provider, keeps identity across service loss/recovery', async () => fixture(async ctx => {
  const values:string[]=[], entered=Promise.withResolvers<void>(), release=Promise.withResolvers<void>();
  const consumer=await ctx.plugin({inject:['auditService'],apply(inner:Context){values.push(inner.get('auditService'));}});
  const uid=consumer.uid;assert.equal(consumer.state,FiberState.PENDING);
  const provider=ctx.plugin({async apply(inner:Context){inner.provide('auditService','v1');entered.resolve();await release.promise;}});
  try {
    await entered.promise;assert.equal(provider.state,FiberState.LOADING);
    assert.equal(ctx.get('auditService'),undefined);assert.equal(consumer.state,FiberState.PENDING);
    release.resolve();await provider;await consumer.await();assert.deepEqual(values,['v1']);
    await provider.dispose();await consumer.await();assert.equal(consumer.state,FiberState.PENDING);
    await ctx.plugin({apply(inner:Context){inner.provide('auditService','v2');}});await consumer.await();
    assert.equal(consumer.uid,uid);assert.equal(consumer.state,FiberState.ACTIVE);assert.deepEqual(values,['v1','v2']);
    console.log('A',JSON.stringify({values,sameConsumer:true,phases:['PENDING','PENDING while provider LOADING','ACTIVE','PENDING','ACTIVE']}));
  } finally {release.resolve();await provider.await();}
}));

test('Context scope: global, two isolated realms and a shared label select different values', async () => fixture(async ctx => {
  const a=ctx.isolate('auditScope'),b=ctx.isolate('auditScope'),label=Symbol('shared');
  await ctx.plugin({apply(c:Context){c.provide('auditScope','global');}});
  await a.plugin({apply(c:Context){c.provide('auditScope','A');}});
  await b.plugin({apply(c:Context){c.provide('auditScope','B');}});
  const s1=ctx.isolate('auditScope',label),s2=ctx.isolate('auditScope',label);
  await s1.plugin({apply(c:Context){c.provide('auditScope','shared');}});
  assert.deepEqual([ctx.get('auditScope'),a.get('auditScope'),b.get('auditScope'),s2.get('auditScope')],['global','A','B','shared']);
  console.log('scope',JSON.stringify({global:'global',a:'A',b:'B',sameSymbol:'shared'}));
}));

test('B: waterfall wraps result; disposal stops future listeners/effects but not in-flight work', async () => fixture(async ctx => {
  const trace:string[]=[];let ticks=0,closes=0,workEnds=0,body=0;
  const callbacks=new Set<()=>void>();const entered=Promise.withResolvers<void>(),release=Promise.withResolvers<void>();
  const plugin=await ctx.plugin({apply(inner:Context){
    (inner as any).on('audit/wf',async(next:()=>Promise<number>)=>{trace.push('L+');const x=await next();trace.push('L-');return x+1;});
    (inner as any).on('audit/wf',async(next:()=>Promise<number>)=>{trace.push('M+');const x=await next();trace.push('M-');return x*10;});
    (inner as any).on('audit/work',async()=>{entered.resolve();await release.promise;workEnds++;});
    inner.effect(()=>{const cb=()=>{ticks++;};callbacks.add(cb);return()=>{callbacks.delete(cb);closes++;};});
  }});
  const result=await (ctx as any).waterfall('audit/wf',async()=>{trace.push('body');body++;return 2;});
  assert.equal(result,21);assert.deepEqual(trace,['L+','M+','body','M-','L-']);
  for(const cb of callbacks)cb();assert.equal(ticks,1);
  const task=(ctx as any).parallel('audit/work');
  try {
    await entered.promise;await plugin.dispose();
    assert.equal(plugin.state,FiberState.DISPOSED);assert.equal(workEnds,0);assert.equal(closes,1);assert.equal(callbacks.size,0);
    await (ctx as any).parallel('audit/work');assert.equal(workEnds,0);
    release.resolve();await task;assert.equal(workEnds,1);
    const after=await (ctx as any).waterfall('audit/wf',async()=>{body++;return 2;});assert.equal(after,2);
    console.log('B',JSON.stringify({trace,result,ticks,closes,after,inFlightCompletedAfterDispose:true,body}));
  } finally {release.resolve();await task;}
}));
