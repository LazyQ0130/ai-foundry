// 官方真实服务；替代的只有模型响应、工具内容与明确的故障门。
import { Context } from '@deepseek-ai/cordis';
import AgentRegistry from '@deepseek-ai/dsh-agent';
import AgentLoop from '@deepseek-ai/dsh-agent-loop';
import LlmRuntime, { LlmAdapter, createUserMessage, ToolCallId, ReasoningEffortId } from '@deepseek-ai/dsh-llm';
import type { GenerateOptions, StreamChunk } from '@deepseek-ai/dsh-llm';
import SessionStore, { SessionId } from '@deepseek-ai/dsh-session';
import SessionProjectionRegistry from '@deepseek-ai/dsh-session-projection';
import SystemPrompt from '@deepseek-ai/dsh-system-prompt';
import ToolRuntime from '@deepseek-ai/dsh-tools';
import * as NativeToolExecutor from '@deepseek-ai/dsh-tool-executor-native';
import { defineContentToolFixture } from '@deepseek-ai/dsh-tool-testkit';
export { Context, LlmRuntime, LlmAdapter, ToolCallId, ReasoningEffortId };
export * from '@deepseek-ai/dsh-llm';
export const gate = () => Promise.withResolvers<void>();
export async function collect<T>(stream: AsyncIterable<T>): Promise<T[]> { const out: T[] = []; for await (const v of stream) out.push(v); return out; }
export async function* sequence<T>(items: readonly T[]): AsyncGenerator<T> { for (const v of items) { await Promise.resolve(); yield v; } }
export const textOf = (m: any) => m.content?.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('') ?? '';
export function textChunks(text = '项目是一个固定演示。'): StreamChunk[] {
  return [{ type: 'block-start', index: 0, blockType: 'text' },
    ...[text.slice(0, 3), text.slice(3, 7), text.slice(7)].map(text => ({ type: 'text-delta' as const, index: 0, text })),
    { type: 'block-end', index: 0, block: { type: 'text', text } },
    { type: 'usage', usage: { inputTokens: 10, outputTokens: 4 } }, { type: 'finish', reason: { kind: 'stop' } }];
}
export function toolChunks(): StreamChunk[] {
  return [{ type: 'block-start', index: 0, blockType: 'tool-call' },
    { type: 'tool-call-delta', index: 0, id: ToolCallId('read-1'), name: 'read_fixture', argumentsDelta: '{"path":' },
    { type: 'tool-call-delta', index: 0, id: ToolCallId('read-1'), argumentsDelta: '"README.md"}' },
    { type: 'block-end', index: 0, block: { type: 'tool-call', id: ToolCallId('read-1'), name: 'read_fixture', arguments: '{"path":"README.md"}' } },
    { type: 'usage', usage: { inputTokens: 12, outputTokens: 5 } }, { type: 'finish', reason: { kind: 'tool-calls' } }];
}
export type Response = StreamChunk[] | ((options: GenerateOptions) => AsyncIterable<StreamChunk>);
export class ScriptedAdapter extends LlmAdapter {
  readonly requests: GenerateOptions[] = [];
  constructor(readonly responses: Response[]) { super(); }
  override async resolveModel(provider: string, model: string) {
    return { provider, id: model, name: model, defaultMaxTokens: 128, context: { contextWindow: 4096 } };
  }
  stream(options: GenerateOptions): AsyncIterable<StreamChunk> {
    this.requests.push(options);
    const response = this.responses.shift();
    if (response === undefined) throw new Error('fixture response exhausted');
    return typeof response === 'function' ? response(options) : sequence(response);
  }
}
export async function runtime<T>(work: (ctx: Context) => T | Promise<T>): Promise<T> {
  const ctx = new Context(); try { await ctx.plugin(LlmRuntime); return await work(ctx); } finally { await ctx.fiber.dispose(); }
}
export async function harness(adapter: LlmAdapter) {
  const ctx = new Context(), handles: any[] = [], trace: any[] = [];
  for (const p of [LlmRuntime, SessionStore, SessionProjectionRegistry]) await ctx.plugin(p as any);
  await ctx.plugin(SystemPrompt, { includeHarnessIdentity: false, personaPrefix: '你是代码助手。' });
  for (const p of [ToolRuntime, NativeToolExecutor, AgentRegistry]) await ctx.plugin(p as any);
  await ctx.plugin(AgentLoop, { agents: [] }); ctx.llm.registerAdapter(['fixture'], adapter);
  ctx.on('session/event', (session, event) => { trace.push({ channel: 'fact', sessionId: session.id, event: structuredClone(event) }); });
  ctx.on('agent/assistant-stream', ({ agent, frame }) => { trace.push({ channel: 'live', agentId: agent.id, frame: structuredClone(frame) }); });
  ctx.on('agent/error', ({ error }) => { trace.push({ channel: 'error', error: String(error), members: error instanceof AggregateError ? error.errors.map(String) : [] }); });
  async function create(id: string) { const h = await ctx.agents.create({ sessionId: SessionId(id), agentOptions: { provider: 'fixture', model: 'scripted' } }); handles.push(h); return h.agent; }
  return { ctx, trace, create, async close() { for (const h of handles) await h.dispose(); await ctx.fiber.dispose(); } };
}
export async function send(agent: any, text = '请读取 README，并简要介绍这个项目。') {
  agent.followup(createUserMessage({ content: [{ type: 'text', text }], source: { kind: 'user' } })); await agent.whenIdle();
}
export function registerRead(ctx: Context, trace: any[]) {
  return ctx.tools.register(defineContentToolFixture({ name: 'read_fixture', description: '只返回代码内固定README，不读取文件', parameters: { path: { type: 'string' } },
    async execute(_args: any, _context: any) { trace.push({ channel: 'tool-body', result: 'README: 固定演示项目' }); return [{ type: 'text', text: 'README: 固定演示项目' }]; } }));
}
