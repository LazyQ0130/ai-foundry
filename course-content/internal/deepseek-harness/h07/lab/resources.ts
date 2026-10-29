import type { Context } from '@deepseek-ai/cordis';
import { inContext, ManualClock, stateName } from './support.ts';
export async function resourcesExample() {
  return inContext(async ctx => {
    const clock = new ManualClock(), counts = { events: 0, ticks: 0, closes: 0 };
    let open = false;
    const fiber = await ctx.plugin({ name: 'h07-log', apply(inner: Context) {
      inner.on('h07/pulse', () => { counts.events++; });
      inner.effect(() => {
        const timer = clock.setInterval(() => { counts.ticks++; });
        return () => { clock.clearInterval(timer); };
      }, 'heartbeat');
      inner.effect(() => {
        open = true; // 内存连接夹具，不建立外部连接。
        return async () => { await Promise.resolve(); open = false; counts.closes++; };
      }, 'connection-fixture');
    } });
    ctx.emit('h07/pulse'); clock.tick();
    const before = { ...counts, pending: clock.pending, open };
    const firstDisposal = fiber.dispose(); await firstDisposal;
    await fiber.dispose(); // 已完成后再调用，不会重新清理。
    ctx.emit('h07/pulse'); clock.tick();
    return { before, after: { ...counts, pending: clock.pending, open }, state: stateName(fiber.state) };
  });
}
export async function asyncOrderExample() {
  return inContext(async ctx => {
    const trace: string[] = [], started = Promise.withResolvers<void>();
    const a = Promise.withResolvers<void>(), b = Promise.withResolvers<void>(); let starts = 0;
    const fiber = await ctx.plugin({ apply(inner: Context) {
      for (const [name, gate] of [['A', a], ['B', b]] as const) inner.effect(() => async () => {
        trace.push(name + '开始'); if (++starts === 2) started.resolve();
        await gate.promise; trace.push(name + '完成');
      });
    } });
    const disposal = fiber.dispose();
    try {
      await started.promise; const before = [...trace];
      a.resolve(); await a.promise; await Promise.resolve();
      b.resolve(); await disposal;
      return { before, trace, state: stateName(fiber.state) };
    } finally { a.resolve(); b.resolve(); await disposal; }
  });
}
