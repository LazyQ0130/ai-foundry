import { inContext } from './support.ts';

// snippet:emit:start
export async function emitExample() {
  return inContext(async ctx => {
    const trace: string[] = [], gate = Promise.withResolvers<void>();
    let finished!: Promise<void>;
    ctx.on('course/notice', () => {
      trace.push('日志开始');
      finished = gate.promise.then(() => { trace.push('日志完成'); });
      return finished;
    });
    ctx.on('course/notice', () => { trace.push('统计'); });
    const value = ctx.emit('course/notice');
    trace.push('发布者继续');
    const before = [...trace];
    gate.resolve(); await finished; // 实验自己等；emit 没有等。
    return { before, after: trace, returned: String(value) };
  });
}
// snippet:emit:end

// snippet:parallel:start
export async function parallelExample() {
  return inContext(async ctx => {
    const trace: string[] = [];
    const a = Promise.withResolvers<void>(), b = Promise.withResolvers<void>();
    const bDone = Promise.withResolvers<void>();
    ctx.on('course/parallel', async () => { trace.push('A开始'); await a.promise; trace.push('A完成'); });
    ctx.on('course/parallel', async () => { trace.push('B开始'); await b.promise; trace.push('B完成'); bDone.resolve(); });
    const task = ctx.parallel('course/parallel');
    trace.push('发布者等待');
    b.resolve(); await bDone.promise; // 固定让 B 先完成，不猜定时器速度。
    a.resolve(); const value = await task;
    trace.push('发布者完成');
    return { trace, returned: String(value) };
  });
}
// snippet:parallel:end

// snippet:serial:start
export async function serialExample() {
  return inContext(async ctx => {
    const trace: string[] = [];
    ctx.on('course/serial', async () => { trace.push('A开始'); await Promise.resolve(); trace.push('A完成'); return false; });
    ctx.on('course/serial', async () => { trace.push('B'); return 0; });
    ctx.on('course/serial', async () => { trace.push('C'); return undefined; });
    const value = await ctx.serial('course/serial');
    return { trace, value };
  });
}
// snippet:serial:end

// snippet:bail:start
export async function bailExample() {
  return inContext(ctx => {
    const trace: string[] = [];
    ctx.on('course/bail', () => { trace.push('A'); return false; });
    ctx.on('course/bail', () => { trace.push('B'); return 0; });
    ctx.on('course/bail', () => { trace.push('C'); return undefined; });
    const value = ctx.bail('course/bail');
    return { trace, value };
  });
}
// snippet:bail:end

// snippet:waterfall:start
export async function waterfallExample() {
  return inContext(ctx => {
    const trace: string[] = [];
    ctx.on('course/value', (_input, next) => {
      trace.push('A进入'); const x = next(); trace.push(`A得到${x}`); return x + 1;
    });
    ctx.on('course/value', (_input, next) => {
      trace.push('B进入'); const y = next(); trace.push(`B得到${y}`); return y * 10;
    });
    const value = ctx.waterfall('course/value', 2, () => { trace.push('主体=2'); return 2; });
    return { trace, value };
  });
}
// snippet:waterfall:end
