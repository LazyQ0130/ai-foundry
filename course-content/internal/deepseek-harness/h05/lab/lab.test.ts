import test from 'node:test';
import assert from 'node:assert/strict';
import { Context, FiberState, Service } from '@deepseek-ai/cordis';
import * as greeter from './greeter.ts';
import * as consumer from './consumer.ts';
import { assemble, NoteAgent } from './a-reference.ts';

test('A：更换模型与日志提供方，消费者代码保持相同', async () => {
  const a: string[] = [], b: string[] = [];
  assert.equal(await assemble('A', a).summarize('公开资料'), 'A：公开资料');
  assert.equal(await assemble('B', b).summarize('公开资料'), 'B：公开资料');
  assert.deepEqual(a, ['完成：A：公开资料']);
  assert.deepEqual(b, ['完成：B：公开资料']);
});
test('A：模型失败时不记成功日志，失败向调用方传播', async () => {
  const logs: string[] = [];
  const agent = new NoteAgent({ async complete() { throw Error('MODEL_FAILED'); } }, { write(s) { logs.push(s); } });
  await assert.rejects(agent.summarize('fixture'), /MODEL_FAILED/);
  assert.deepEqual(logs, []);
});

async function providerReady(ctx: Context) {
  await ctx.plugin(greeter);
  for (const f of ctx.registry.get(greeter.GreeterService)!.fibers) await f.await();
}
for (const order of ['provider-first', 'consumer-first']) {
  test(`B：真实 Cordis ${order}，greet 恰好调用一次`, async t => {
    const ctx = new Context(), output: string[] = [];
    const spy = t.mock.method(console, 'log', (s: string) => { output.push(s); });
    try {
      if (order === 'provider-first') await providerReady(ctx);
      const f = ctx.plugin(consumer);
      await f;
      if (order === 'consumer-first') {
        assert.equal(f.state, FiberState.PENDING);
        assert.deepEqual(output, []);
        await providerReady(ctx);
        await f;
      }
      assert.equal(f.state, FiberState.ACTIVE);
      assert.deepEqual(output, ['Hello, world!']);
    } finally { await ctx.fiber.dispose(); spy.mock.restore(); }
  });
}
test('B：只有类型/模块导入，无运行时注册，消费者 PENDING 且无输出', async t => {
  const ctx = new Context(), output: string[] = [];
  const spy = t.mock.method(console, 'log', (s: string) => { output.push(s); });
  try {
    // greeter.ts 已被导入；其 declare module 与 class 定义都不会挂载服务。
    const f = ctx.plugin(consumer); await f;
    assert.equal(f.state, FiberState.PENDING);
    assert.equal(ctx.get('greeter'), undefined);
    assert.deepEqual(output, []);
  } finally { await ctx.fiber.dispose(); spy.mock.restore(); }
});
test('B：遗漏 inject，即使服务存在，独立兄弟插件的属性访问也失败', async () => {
  const ctx = new Context();
  try {
    await providerReady(ctx);
    const f = ctx.plugin({ apply(inner: Context) { inner.greeter.greet('world'); } });
    await assert.rejects(f.await(), /cannot get property "greeter" without inject/);
    assert.equal(f.state, FiberState.FAILED);
  } finally { await ctx.fiber.dispose(); }
});
test('B：替换实现保持 greet 契约，同一消费者无需修改', async t => {
  const ctx = new Context(), output: string[] = [];
  const spy = t.mock.method(console, 'log', (s: string) => { output.push(s); });
  class ChineseGreeter extends Service {
    constructor(inner: Context) { super(inner, 'greeter'); }
    greet(who: string) { return `你好，${who}！`; }
  }
  try {
    await ctx.plugin(ChineseGreeter);
    await ctx.plugin(consumer);
    assert.deepEqual(output, ['你好，world！']);
  } finally { await ctx.fiber.dispose(); spy.mock.restore(); }
});
test('B：提供方尚在异步初始化，消费者仍不提前执行', async () => {
  const ctx = new Context();
  const gate = Promise.withResolvers<void>();
  let calls = 0;
  const f = ctx.plugin({ inject: ['greeter'], apply(inner: Context) { assert.equal(inner.greeter.greet('x'), 'ready:x'); calls++; } });
  const p = ctx.plugin({ async apply(inner: Context) {
    inner.provide('greeter', { greet: (s: string) => `ready:${s}` });
    await gate.promise;
  } });
  try {
    await f;
    assert.equal(f.state, FiberState.PENDING); assert.equal(calls, 0);
    assert.equal(ctx.get('greeter'), undefined);
    gate.resolve(); await p; await f;
    assert.equal(calls, 1); assert.equal(f.state, FiberState.ACTIVE);
  } finally { gate.resolve(); await ctx.fiber.dispose(); }
});
test('B：同一作用域重复注册会失败；不能靠再次挂载覆盖实现', async () => {
  const ctx = new Context();
  try {
    await ctx.plugin(greeter.GreeterService);
    class Duplicate extends Service { constructor(inner: Context) { super(inner, 'greeter'); } }
    const duplicate = ctx.plugin(Duplicate);
    await assert.rejects(duplicate.await(), /has been registered/);
  } finally { await ctx.fiber.dispose(); }
});
