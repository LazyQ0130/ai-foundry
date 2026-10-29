import { Context, FiberState } from '@deepseek-ai/cordis';
declare module '@deepseek-ai/cordis' {
  interface Events {
    'h07/pulse'(): void;
    'h07/work'(): Promise<void>;
  }
}
export const stateName = (state: number) => new Map<number, string>([
  [FiberState.PENDING, 'PENDING'], [FiberState.LOADING, 'LOADING'],
  [FiberState.ACTIVE, 'ACTIVE'], [FiberState.FAILED, 'FAILED'],
  [FiberState.UNLOADING, 'UNLOADING'], [FiberState.DISPOSED, 'DISPOSED'],
]).get(state)!;
export async function inContext<T>(work: (ctx: Context) => T | Promise<T>): Promise<T> {
  const ctx = new Context();
  try { return await work(ctx); }
  finally { await ctx.fiber.dispose(); }
}
// 仅替代时间来源，不替代Cordis；tick由实验主动推进，不等待墙钟。
export class ManualClock {
  private callbacks = new Map<number, () => void>();
  private nextId = 0;
  setInterval(callback: () => void) { const id = ++this.nextId; this.callbacks.set(id, callback); return id; }
  clearInterval(id: number) { this.callbacks.delete(id); }
  tick() { for (const callback of [...this.callbacks.values()]) callback(); }
  get pending() { return this.callbacks.size; }
}
