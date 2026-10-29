import test from 'node:test';
import assert from 'node:assert/strict';
import { isBailed } from '@deepseek-ai/cordis';
import { inContext } from './support.ts';
import { emitExample, parallelExample, serialExample, bailExample, waterfallExample } from './modes.ts';
import { runRequest } from './request.ts';
declare module '@deepseek-ai/cordis' {
  interface Events {
    'test/value'(): unknown;
    'test/wrap'(next: () => unknown): unknown;
  }
}
test('A emit：返回时异步日志没完成，实验随后自己等待', async () => {
  assert.deepEqual(await emitExample(), { before: ['日志开始', '统计', '发布者继续'], after: ['日志开始', '统计', '发布者继续', '日志完成'], returned: 'undefined' });
});
test('A parallel：两项都开始，受控让B先结束，发布者等A和B', async () => {
  assert.deepEqual(await parallelExample(), { trace: ['A开始', 'B开始', '发布者等待', 'B完成', 'A完成', '发布者完成'], returned: 'undefined' });
});
test('A serial：await后false继续，0停止', async () => {
  assert.deepEqual(await serialExample(), { trace: ['A开始', 'A完成', 'B'], value: 0 });
});
test('A bail：同步false继续，0停止', async () => {
  assert.deepEqual(await bailExample(), { trace: ['A', 'B'], value: 0 });
});
test('A waterfall：外入内出，输入2，B返回20，A返回21', async () => {
  assert.deepEqual(await waterfallExample(), { trace: ['A进入', 'B进入', '主体=2', 'B得到2', 'A得到20'], value: 21 });
});
test('无监听者：四模式返回空结果，waterfall执行默认主体', async () => inContext(async ctx => {
  assert.equal(ctx.emit('course/notice'), undefined);
  assert.equal(await ctx.parallel('course/parallel'), undefined);
  assert.equal(await ctx.serial('course/serial'), undefined);
  assert.equal(ctx.bail('course/bail'), undefined);
  assert.equal(ctx.waterfall('course/value', 2, () => 2), 2);
}));
test('waterfall不使用bail值判据：返回false且不next也会短路', async () => inContext(ctx => {
  let body = 0; ctx.on('test/wrap', () => false);
  assert.equal(ctx.waterfall('test/wrap', () => { body++; return true; }), false);
  assert.equal(body, 0);
}));
test('serial和bail实际核对10种值；只有null/false/undefined继续', async () => {
  for (const value of [null, false, undefined, 0, '', NaN, true, {}, [], 0n]) {
    for (const mode of ['serial', 'bail'] as const) await inContext(async ctx => {
      let later = 0;
      ctx.on('test/value', () => value);
      ctx.on('test/value', () => { later++; });
      const result = mode === 'serial' ? await ctx.serial('test/value') : ctx.bail('test/value');
      const stops = ![null, false, undefined].includes(value as never);
      assert.equal(isBailed(value), stops);
      assert.equal(later, stops ? 0 : 1);
      assert.ok(Object.is(result, stops ? value : undefined));
    });
  }
});
test('serial不并发启动下一个监听器', async () => inContext(async ctx => {
  const gate = Promise.withResolvers<void>(), trace: string[] = [];
  ctx.on('course/serial', async () => { trace.push('A'); await gate.promise; return false; });
  ctx.on('course/serial', async () => { trace.push('B'); return undefined; });
  const task = ctx.serial('course/serial'); assert.deepEqual(trace, ['A']);
  gate.resolve(); await task; assert.deepEqual(trace, ['A', 'B']);
}));
test('bail不会await：Promise对象本身使后续停止，即使最终兑现false', async () => inContext(async ctx => {
  const pending = Promise.resolve(false); let later = 0;
  ctx.on('test/value', () => pending); ctx.on('test/value', () => { later++; });
  const value = ctx.bail('test/value'); assert.equal(value, pending);
  assert.equal(await value, false); assert.equal(later, 0);
}));
test('emit和bail同步throw向外传播，并阻止剩余监听器', async () => {
  for (const mode of ['emit', 'bail'] as const) await inContext(ctx => {
    let later = 0;
    ctx.on('test/value', () => { throw Error('SYNC'); });
    ctx.on('test/value', () => { later++; });
    assert.throws(() => mode === 'emit' ? ctx.emit('test/value') : ctx.bail('test/value'), /SYNC/); assert.equal(later, 0);
  });
});
test('parallel：捕获同步/异步错误，仍等门闩监听器完成后AggregateError', async () => inContext(async ctx => {
  const gate = Promise.withResolvers<void>(); let done = false, settled = false;
  ctx.on('course/parallel', () => { throw Error('A'); });
  ctx.on('course/parallel', async () => { await gate.promise; done = true; });
  ctx.on('course/parallel', async () => { throw Error('C'); });
  const task = ctx.parallel('course/parallel'); void task.catch(() => { settled = true; });
  await Promise.resolve(); assert.equal(settled, false); assert.equal(done, false);
  gate.resolve();
  await assert.rejects(task, (e: AggregateError) => e instanceof AggregateError && e.errors.map(x => x.message).join(',') === 'A,C');
  assert.equal(done, true);
}));
test('serial遇同步throw或异步拒绝都会停止，不继续后续', async () => {
  for (const asyncListener of [false, true]) await inContext(async ctx => {
    let later = 0;
    ctx.on('course/serial', asyncListener ? async () => { throw Error('SERIAL'); } : () => { throw Error('SERIAL'); });
    ctx.on('course/serial', async () => { later++; return undefined; });
    await assert.rejects(ctx.serial('course/serial'), /SERIAL/); assert.equal(later, 0);
  });
});
test('waterfall三层与共享入参：C加3，B乘10，A加1=51', async () => inContext(ctx => {
  const trace: string[] = [], inputs: number[] = [];
  for (const [name, op] of [['A', (x: number) => x + 1], ['B', (x: number) => x * 10], ['C', (x: number) => x + 3]] as const) {
    ctx.on('course/value', (input, next) => { inputs.push(input); trace.push(name + '入'); const r = op(next()); trace.push(name + '出'); return r; });
  }
  const r = ctx.waterfall('course/value', 2, () => { trace.push('主体'); return 2; });
  assert.equal(r, 51); assert.deepEqual(inputs, [2, 2, 2]);
  assert.deepEqual(trace, ['A入', 'B入', 'C入', '主体', 'C出', 'B出', 'A出']);
}));
test('waterfall同步异常向外，外层能catch，默认逻辑未运行', async () => inContext(ctx => {
  let body = 0;
  ctx.on('test/wrap', next => { try { return next(); } catch { return 'caught'; } });
  ctx.on('test/wrap', () => { throw Error('INNER'); });
  assert.equal(ctx.waterfall('test/wrap', () => { body++; }), 'caught'); assert.equal(body, 0);
}));
test('waterfall异步返回Promise；await next才使try/catch捕获异步拒绝', async () => inContext(async ctx => {
  const trace: string[] = [];
  ctx.on('course/async', async next => { try { trace.push('A入'); return await next(); } catch { trace.push('A捕获'); return 'recovered'; } });
  ctx.on('course/async', async () => { await Promise.resolve(); trace.push('B失败'); throw Error('ASYNC'); });
  const result = ctx.waterfall('course/async', async () => 'unused');
  assert.ok(result instanceof Promise); assert.equal(await result, 'recovered');
  assert.deepEqual(trace, ['A入', 'B失败', 'A捕获']);
}));
test('只return next没有await：同步try/catch不会捕获Promise拒绝', async () => inContext(async ctx => {
  let caught = false;
  ctx.on('course/async', next => { try { return next(); } catch { caught = true; return Promise.resolve('wrong'); } });
  ctx.on('course/async', async () => { throw Error('ASYNC'); });
  await assert.rejects(ctx.waterfall('course/async', async () => 'unused'), /ASYNC/); assert.equal(caught, false);
}));
test('重复next无一次性保护：B一次，默认主体两次', async () => inContext(ctx => {
  let body = 0, b = 0;
  ctx.on('course/value', (_input, next) => next() + next());
  ctx.on('course/value', (_input, next) => { b++; return next(); });
  assert.equal(ctx.waterfall('course/value', 2, () => ++body), 3);
  assert.equal(b, 1); assert.equal(body, 2);
}));
test('共享next游标：B短路后，A再调用next会进入尚未消费的C', async () => inContext(ctx => {
  const trace: string[] = [];
  ctx.on('course/value', (_i, next) => next() + next());
  ctx.on('course/value', () => { trace.push('B'); return 10; });
  ctx.on('course/value', (_i, next) => { trace.push('C'); return next(); });
  assert.equal(ctx.waterfall('course/value', 2, () => 2), 12); assert.deepEqual(trace, ['B', 'C']);
}));
test('异步重复next也共享游标，不会为每次调用重建下游', async () => inContext(async ctx => {
  const gate = Promise.withResolvers<void>(); let body = 0;
  ctx.on('course/async', async next => { const a = next(), b = next(); return `${await a}+${await b}`; });
  ctx.on('course/async', async next => { await gate.promise; return next(); });
  const pending = ctx.waterfall('course/async', async () => `body${++body}`);
  assert.equal(body, 1); gate.resolve(); assert.equal(await pending, 'body2+body1'); assert.equal(body, 2);
}));
test('B正常：三个真实插件委托，主体一次，外层包装结果', async () => {
  assert.deepEqual(await runRequest('allow'), { trace: ['日志进入', '策略检查', '统计进入', '工具主体', '统计退出', '日志收到:FIXTURE'], bodyCalls: 1, result: { ok: true, text: '外层(FIXTURE)' } });
});
test('B策略拒绝：主体零次，已进入的外层仍收到拒绝结果', async () => {
  assert.deepEqual(await runRequest('deny'), { trace: ['日志进入', '策略检查', '日志收到:DENIED'], bodyCalls: 0, result: { ok: false, text: '外层(DENIED)' } });
});
test('B日志漏next：策略、统计和主体都没执行，结果为空', async () => {
  assert.deepEqual(await runRequest('lost-next'), { trace: ['日志进入'], bodyCalls: 0, result: null });
});
test('B漏return：主体实际执行一次，返回结果仍丢失', async () => {
  const r = await runRequest('lost-return'); assert.equal(r.bodyCalls, 1); assert.equal(r.result, null);
  assert.ok(r.trace.includes('工具主体')); assert.ok(r.trace.includes('日志收到:FIXTURE'));
});
test('llm式异步可迭代返回：分发取得流，不会自动迭代', async () => inContext(async ctx => {
  const trace: string[] = [];
  ctx.on('course/stream', async function* (next) { trace.push('外入'); for await (const chunk of next()) yield `包裹:${chunk}`; trace.push('外出'); });
  const stream = ctx.waterfall('course/stream', async function* () { trace.push('主体'); yield '片段'; });
  assert.deepEqual(trace, []); const values: string[] = [];
  for await (const x of stream) values.push(x);
  assert.deepEqual(values, ['包裹:片段']); assert.deepEqual(trace, ['外入', '主体', '外出']);
}));
test('prepend显式改变监听顺序；事件类型不会在运行时强制模式', async () => inContext(ctx => {
  const trace: string[] = [];
  ctx.on('course/bail', () => { trace.push('原'); return 0; });
  ctx.on('course/bail', () => { trace.push('后'); return undefined; });
  ctx.on('course/bail', () => { trace.push('前置'); return false; }, { prepend: true });
  ctx.emit('course/bail'); // 故意违背该教学事件的bail契约；库不会自动拒绝。
  assert.deepEqual(trace, ['前置', '原', '后']);
}));
test('诊断精度：本版本parallel内部给internal/dispatch报告emit标签', async () => inContext(async ctx => {
  const seen: string[] = [];
  ctx.on('internal/dispatch', (mode, name) => { if (name === 'course/parallel') seen.push(mode); });
  await ctx.parallel('course/parallel'); assert.deepEqual(seen, ['emit']);
}));
