// 改编官方 scope-lifecycle.spec.ts 的 harnessWithLoop；省去模型适配器。
import { Context } from '@deepseek-ai/cordis';
import AgentLoop from '@deepseek-ai/dsh-agent-loop';
import AgentRegistry from '@deepseek-ai/dsh-agent';
import SessionProjectionRegistry from '@deepseek-ai/dsh-session-projection';
import LlmRuntime from '@deepseek-ai/dsh-llm';
import SessionStore from '@deepseek-ai/dsh-session';
import SystemPrompt from '@deepseek-ai/dsh-system-prompt';
import ToolRuntime from '@deepseek-ai/dsh-tools';
import * as NativeToolExecutor from '@deepseek-ai/dsh-tool-executor-native';
export { SessionId } from '@deepseek-ai/dsh-session';
export { agentEvents } from '@deepseek-ai/dsh-agent';
export { createUserMessage } from '@deepseek-ai/dsh-llm';
export const gate = () => Promise.withResolvers<void>();

export async function registryOnly() {
  const ctx = new Context();
  await ctx.plugin(SessionProjectionRegistry);
  await ctx.plugin(AgentRegistry);
  return ctx;
}
export async function harness(storage = false) {
  const ctx = new Context();
  await ctx.plugin(LlmRuntime);
  await ctx.plugin(SessionStore);
  await ctx.plugin(SessionProjectionRegistry);
  await ctx.plugin(SystemPrompt);
  await ctx.plugin(ToolRuntime);
  await ctx.plugin(NativeToolExecutor); // 仅执行器，没有登记任何文件/Shell工具。
  await ctx.plugin(AgentRegistry);
  const disk = storage ? memoryStorageFixture(ctx) : undefined;
  const loop = await ctx.plugin(AgentLoop, { agents: [] });
  return { ctx, loop, disk };
}
export async function consumer(ctx: Context) {
  let ownerCtx!: Context;
  const owner = await ctx.plugin({ name: 'h09-consumer', inject: ['agents'], apply(inner: Context) { ownerCtx = inner; } });
  return { owner, ownerCtx };
}

// 仅替代持久化后端：内存、单写者、事件数组。不是官方存储、磁盘恢复或崩溃保证。
// Registry / Session / Scope / AgentLoop 均仍为官方真实实现。
export function memoryStorageFixture(ctx: Context) {
  const records = new Map<string, { header: any; events: any[]; writing: boolean }>();
  const trace: string[] = [];
  let failClose = false;
  function channel(record: { header: any; events: any[]; writing: boolean }, access: string) {
    let closed = false;
    const handle = {
      id: record.header.id, header: structuredClone(record.header), inheritedEventCount: 0, access,
      async read(offset = 0, length?: number) { return { eventState: 'detached', events: structuredClone(record.events.slice(offset, length === undefined ? undefined : offset + length)) }; },
      async append(events: readonly any[]) { for (const e of events) { if (e.seq !== record.events.length) throw Error('fixture sequence conflict'); record.events.push(structuredClone(e)); } },
      async flush() {},
      async close() { if (closed) return; closed = true; if (access === 'write') record.writing = false; trace.push('close:' + record.header.id); if (failClose) throw Error('fixture close failed'); },
      async [Symbol.asyncDispose]() { await handle.close(); },
    };
    return handle;
  }
  const backend = {
    async create(header: any) {
      if (records.has(header.id)) throw Error('fixture stored identity exists');
      const r = { header: structuredClone(header), events: [], writing: true };
      records.set(header.id, r); trace.push('create:' + header.id); return channel(r, 'write');
    },
    async open(id: string, access: string) {
      const r = records.get(id); if (!r) throw Error('fixture stored identity missing');
      if (access === 'write') { if (r.writing) throw Error('fixture already owned'); r.writing = true; }
      trace.push('open:' + id); return channel(r, access);
    },
  };
  ctx.provide('sessionPersistence', backend as never);
  ctx.on('session/event', (session, event) => {
    const r = records.get(session.id);
    if (r?.writing) { if (event.seq !== r.events.length) throw Error('fixture feed conflict'); r.events.push(structuredClone(event)); }
  });
  return { backend, records, trace, failClose() { failClose = true; } };
}
