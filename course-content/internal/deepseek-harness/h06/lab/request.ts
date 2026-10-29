import { inContext, type Reply } from './support.ts';
import type { Context } from '@deepseek-ai/cordis';
export type Case = 'allow' | 'deny' | 'lost-next' | 'lost-return';
export async function runRequest(kind: Case) {
  return inContext(async ctx => {
    const trace: string[] = []; let bodyCalls = 0;
    await ctx.plugin({ name: 'log', apply(inner: Context) {
      inner.on('course/request', async (_req, next) => {
        trace.push('日志进入');
        if (kind === 'lost-next') return; // 错误观察者：没有委托。
        const result = await next();
        trace.push(`日志收到:${result?.text}`);
        if (kind === 'lost-return') return; // 下游已执行，但结果丢了。
        return result && { ...result, text: `外层(${result.text})` };
      });
    } });
    await ctx.plugin({ name: 'policy', apply(inner: Context) {
      inner.on('course/request', async (req, next) => {
        trace.push('策略检查');
        if (!req.allowed) return { ok: false, text: 'DENIED' };
        return next();
      });
    } });
    await ctx.plugin({ name: 'metrics', apply(inner: Context) {
      inner.on('course/request', async (_req, next) => {
        trace.push('统计进入');
        const result = await next();
        trace.push('统计退出'); return result;
      });
    } });
    const result: Reply | undefined = await ctx.waterfall('course/request',
      { tool: 'read_fixture', allowed: kind !== 'deny' }, async () => {
        bodyCalls++; trace.push('工具主体'); return { ok: true, text: 'FIXTURE' };
      });
    return { trace, bodyCalls, result: result ?? null };
  });
}
