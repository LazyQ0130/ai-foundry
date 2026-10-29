import { type Context, type Fiber } from '@deepseek-ai/cordis';
import { inContext, stateName } from './support.ts';
export async function statesExample() {
  return inContext(async ctx => {
    const states: string[] = [], trace: string[] = [];
    const entered = Promise.withResolvers<void>(), load = Promise.withResolvers<void>();
    const closing = Promise.withResolvers<void>(), closed = Promise.withResolvers<void>();
    const plugin = { name: 'h07-status', async apply(inner: Context) {
      trace.push('apply进入'); entered.resolve(); await load.promise;
      inner.effect(() => async () => { trace.push('清理开始'); closing.resolve(); await closed.promise; trace.push('清理完成'); });
    } };
    const record = (fiber: Fiber) => { if (fiber.runtime?.callback === plugin.apply) states.push(stateName(fiber.state)); };
    ctx.on('internal/plugin', fiber => { if (fiber.uid !== null) record(fiber); });
    ctx.on('internal/status', record);
    const handle = ctx.plugin(plugin);
    try {
      await entered.promise; const duringLoad = stateName(handle.state);
      load.resolve(); const fiber = await handle;
      const running = stateName(fiber.state), uid = fiber.uid;
      const disposal = handle.dispose();
      await closing.promise; const duringUnload = stateName(fiber.state);
      closed.resolve(); await disposal;
      return { states, trace, duringLoad, running, duringUnload, final: stateName(fiber.state), uidWasPresent: uid !== null, uidNow: fiber.uid };
    } finally { load.resolve(); closed.resolve(); await handle.await(); await handle.dispose(); }
  });
}
