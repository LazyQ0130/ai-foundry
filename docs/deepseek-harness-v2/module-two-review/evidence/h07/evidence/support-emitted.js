import { Context, FiberState } from '@deepseek-ai/cordis';
export const stateName = (state) => new Map([
    [FiberState.PENDING, 'PENDING'], [FiberState.LOADING, 'LOADING'],
    [FiberState.ACTIVE, 'ACTIVE'], [FiberState.FAILED, 'FAILED'],
    [FiberState.UNLOADING, 'UNLOADING'], [FiberState.DISPOSED, 'DISPOSED'],
]).get(state);
export async function inContext(work) {
    const ctx = new Context();
    try {
        return await work(ctx);
    }
    finally {
        await ctx.fiber.dispose();
    }
}
// 仅替代时间来源，不替代Cordis；tick由实验主动推进，不等待墙钟。
export class ManualClock {
    callbacks = new Map();
    nextId = 0;
    setInterval(callback) { const id = ++this.nextId; this.callbacks.set(id, callback); return id; }
    clearInterval(id) { this.callbacks.delete(id); }
    tick() { for (const callback of [...this.callbacks.values()])
        callback(); }
    get pending() { return this.callbacks.size; }
}
