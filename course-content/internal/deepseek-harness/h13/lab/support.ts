// 官方真实服务；替代的只有模型响应、工具内容与明确的故障门。
import { Context } from '@deepseek-ai/cordis';
import AgentRegistry from '@deepseek-ai/dsh-agent';
import AgentLoop from '@deepseek-ai/dsh-agent-loop';
import LlmRuntime, { LlmAdapter, createUserMessage, ToolCallId } from '@deepseek-ai/dsh-llm';
import type { GenerateOptions, StreamChunk } from '@deepseek-ai/dsh-llm';
import SessionStore, { SessionId } from '@deepseek-ai/dsh-session';
import SessionProjectionRegistry from '@deepseek-ai/dsh-session-projection';
import SystemPrompt from '@deepseek-ai/dsh-system-prompt';
import ToolRuntime from '@deepseek-ai/dsh-tools';
import * as NativeToolExecutor from '@deepseek-ai/dsh-tool-executor-native';
import { createScope } from '@deepseek-ai/dsh-scope';
import { defineTool } from '@deepseek-ai/dsh-tools';
export { defineTool };

export { Context, ToolCallId };
export const gate = <T = void>() => Promise.withResolvers<T>();
export async function* sequence<T>(items: readonly T[]): AsyncGenerator<T> { for (const v of items) { await Promise.resolve(); yield v; } }
export const textOf = (m: any) => m.content?.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('') ?? '';
export function textChunks(text = '项目是一个固定演示。'): StreamChunk[] {
  return [{ type: 'block-start', index: 0, blockType: 'text' },
    ...[text.slice(0, 3), text.slice(3, 7), text.slice(7)].map(text => ({ type: 'text-delta' as const, index: 0, text })),
    { type: 'block-end', index: 0, block: { type: 'text', text } },
    { type: 'usage', usage: { inputTokens: 10, outputTokens: 4 } }, { type: 'finish', reason: { kind: 'stop' } }];
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
export async function send(agent: any, text = '请计算 2、4、6 的总和与数量。') {
  agent.followup(createUserMessage({ content: [{ type: 'text', text }], source: { kind: 'user' } })); await agent.whenIdle();
}
// C 级：真实 Scope 的键用结构化 Agent 载体，未创建 Loop。D 级另用 harness.create。
export async function components() {
  const ctx = new Context();
  for (const p of [SystemPrompt, ToolRuntime, NativeToolExecutor]) await ctx.plugin(p as any);
  const scopes: any[] = [];
  async function scope(id: string, parent?: object) {
    const agent = { id: SessionId(id) } as any;
    let owned: any;
    await ctx.plugin(Object.assign((inner: Context) => { owned = createScope(inner, agent, parent ? { parent } : {}); }, { inject: ['tools'] }));
    scopes.push(owned); return { agent, ctx: owned.ctx, dispose: () => owned.dispose() };
  }
  return { ctx, scope, async close() { for (const s of scopes.reverse()) await s.dispose(); await ctx.fiber.dispose(); } };
}
export function sumTool(name = 'calculate_sum', body?: () => void) {
  return defineTool({ name, description: '计算给定数字的总和与数量，不读取文件。',
    parameters: { data: { type: 'object', required: true, additionalProperties: false,
      properties: { values: { type: 'array', items: { type: 'number' }, required: true } } } },
    output: { schema: { type: 'object', additionalProperties: false,
      properties: { total: { type: 'number', required: true }, count: { type: 'integer', required: true } } },
      render: (_args, value) => [{ type: 'text', text: `总和 ${value.total}，共 ${value.count} 项。` }] },
    async execute(args) { body?.(); if (args.data.values.length === 0) throw new Error('至少提供一个数');
      return { total: args.data.values.reduce((a, b) => a + b, 0), count: args.data.values.length }; } });
}
export function scalarTool(name: string, value = name) {
  return defineTool({ name, description: '受控字符串工具', parameters: {},
    output: { schema: { type: 'string' }, render: (_a, v) => [{ type: 'text', text: v }] }, async execute() { return value; } });
}
export function callChunks(name = 'calculate_sum', args: unknown = { data: { values: [2, 4, 6] } }): StreamChunk[] {
  const block = { type: 'tool-call' as const, id: ToolCallId('sum-1'), name, arguments: JSON.stringify(args) };
  return [{ type: 'block-start', index: 0, blockType: 'tool-call' },
    { type: 'tool-call-delta', index: 0, id: block.id, name, argumentsDelta: block.arguments },
    { type: 'block-end', index: 0, block }, { type: 'finish', reason: { kind: 'tool-calls' } }];
}
export const names = (items: readonly { name: string }[]) => items.map(t => t.name).sort();
