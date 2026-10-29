// H06 教学事件；真实 Cordis 运行时，虚构业务数据。名称不属于 Harness 官方 API。
import { Context } from '@deepseek-ai/cordis';
export type Request = { tool: string; allowed: boolean };
export type Reply = { ok: boolean; text: string };
declare module '@deepseek-ai/cordis' {
  interface Events {
    'course/notice'(): void | Promise<void>;
    'course/parallel'(): void | Promise<void>;
    'course/serial'(): Promise<false | number | undefined>;
    'course/bail'(): false | number | undefined;
    'course/value'(input: number, next: () => number): number;
    'course/async'(next: () => Promise<string>): Promise<string>;
    // 故意容许 undefined，便于观察漏 next/return；真实决策接口应更严格。
    'course/request'(req: Request, next: () => Promise<Reply | undefined>): Promise<Reply | undefined>;
    'course/stream'(next: () => AsyncIterable<string>): AsyncIterable<string>;
  }
}
export async function inContext<T>(work: (ctx: Context) => T | Promise<T>): Promise<T> {
  const ctx = new Context();
  try { return await work(ctx); }
  finally { await ctx.fiber.dispose(); } // 夹具收尾；资源回收机制留 H07。
}
