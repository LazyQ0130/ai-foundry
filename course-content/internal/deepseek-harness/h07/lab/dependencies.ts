import { Service, type Context } from '@deepseek-ai/cordis';
import { inContext, stateName } from './support.ts';
declare module '@deepseek-ai/cordis' { interface Context { h07Probe: ProbeService } }
export class ProbeService extends Service {
  constructor(ctx: Context, private label: string) { super(ctx, 'h07Probe'); }
  read() { return this.label; }
}
export async function dependenciesExample() {
  return inContext(async ctx => {
    const trace: string[] = [], phases: string[] = [];
    let runs = 0, cleanups = 0, events = 0;
    const consumer = await ctx.plugin({ name: 'h07-consumer', inject: ['h07Probe'], apply(inner: Context) {
      const value = inner.h07Probe.read(); runs++; trace.push('加载:' + value);
      inner.on('h07/pulse', () => { events++; trace.push('事件:' + value); });
      inner.effect(() => () => { cleanups++; trace.push('清理:' + value); });
    } });
    const uid = consumer.uid;
    phases.push(stateName(consumer.state));
    const first = await ctx.plugin(ProbeService, 'v1'); await consumer.await();
    phases.push(stateName(consumer.state)); ctx.emit('h07/pulse');
    await first.dispose(); await consumer.await();
    phases.push(stateName(consumer.state)); ctx.emit('h07/pulse'); // 缺依赖时旧监听器已撤销。
    const second = await ctx.plugin(ProbeService, 'v2'); await consumer.await();
    phases.push(stateName(consumer.state)); ctx.emit('h07/pulse');
    const sameUid = consumer.uid === uid;
    await consumer.dispose(); phases.push(stateName(consumer.state));
    await second.dispose();
    return { phases, trace, runs, cleanups, events, sameUid };
  });
}
