// 真实 Cordis + 官方 Loader；插件体只记录内存轨迹，不模拟框架。
import assert from 'node:assert/strict';
import { Context } from '@deepseek-ai/cordis';
import Loader from '@deepseek-ai/cordis-plugin-loader';

export async function reconfigure() {
  const ctx = new Context(), trace: string[] = [];
  let runs = 0, cleanups = 0;
  await ctx.plugin(Loader);
  ctx.loader.builtins.probe = {
    apply(inner: Context, config: { label: string }) {
      runs++; trace.push(`apply:${config.label}`);
      inner.provide('h08Probe', config.label);
      inner.effect(() => () => { cleanups++; trace.push(`clean:${config.label}`); });
    }
  };
  ctx.loader.builtins.consumer = {
    inject: ['h08Probe'],
    apply(inner: Context) {
      const label = inner.get('h08Probe');
      trace.push(`consumer:${label}`);
      inner.effect(() => () => { trace.push(`consumer-clean:${label}`); });
    }
  };
  const rows = (label: string, disabled = false) => [
    { id: 'provider', name: 'cordis:probe', disabled, config: { label } },
    { id: 'consumer', name: 'cordis:consumer' }
  ];
  const settle = async () => { await ctx.loader.await(); };
  try {
    await ctx.loader.root.update(rows('v1')); await settle();
    const entry = ctx.loader.resolve('provider'), original = entry.fiber!, consumer = ctx.loader.resolve('consumer').fiber!;
    assert.equal(original.state, 2); assert.equal(consumer.state, 2);
    await ctx.loader.root.update(rows('v1')); await settle();
    assert.equal(entry.fiber, original); assert.equal(runs, 1, '稳定 ID + 相同配置不重跑');
    await ctx.loader.root.update(rows('v2')); await settle();
    assert.equal(entry.fiber, original); assert.equal(runs, 2, '普通 config 更新重跑同一 Fiber');
    const stableUpdateSameFiber = entry.fiber === original;
    await ctx.loader.root.update(rows('v2', true)); await settle();
    assert.equal(ctx.loader.resolve('provider'), entry); assert.equal(entry.fiber!.uid, null);
    assert.equal(consumer.state, 0); assert.equal(ctx.get('h08Probe'), undefined);
    const disabled = { providerState: entry.fiber!.state, consumerState: consumer.state, configPresent: true };
    await ctx.loader.root.update(rows('v2')); await settle();
    assert.equal(ctx.loader.resolve('provider'), entry); assert.notEqual(entry.fiber, original);
    assert.equal(consumer, ctx.loader.resolve('consumer').fiber); assert.equal(consumer.state, 2);
    return { runs, cleanups, stableUpdateSameFiber, disabled,
      reenableNewFiber: entry.fiber !== original, consumerSameFiber: true, trace: [...trace] };
  } finally { await ctx.fiber.dispose(); }
}

export async function anonymousComparison(stable: boolean) {
  const ctx = new Context(); let runs = 0, cleanups = 0;
  await ctx.plugin(Loader);
  ctx.loader.builtins.noop = { apply(inner: Context) {
    runs++; inner.effect(() => () => { cleanups++; });
  } };
  // 每次读取返回全新对象；避免复用被 ensureId 写入过的同一个对象。
  const read = () => [{ ...(stable ? { id: 'stable' } : {}), name: 'cordis:noop', config: { value: 1 } }];
  try {
    await ctx.loader.root.update(read() as any); await ctx.loader.await();
    const first = Object.values(ctx.loader.store)[0], uid = first.fiber!.uid;
    await ctx.loader.root.update(read() as any); await ctx.loader.await();
    const next = Object.values(ctx.loader.store)[0];
    return { stable, runs, cleanups, sameEntry: first === next, sameUid: uid === next.fiber!.uid };
  } finally { await ctx.fiber.dispose(); }
}
