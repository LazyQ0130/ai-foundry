// 真实服务装配改编自固定官方测试；模型只用官方MockAdapter，工具只返回固定文本。
import { Context } from '@deepseek-ai/cordis';
import AgentRegistry from '@deepseek-ai/dsh-agent';
import AgentLoop from '@deepseek-ai/dsh-agent-loop';
import LlmRuntime, { createUserMessage } from '@deepseek-ai/dsh-llm';
import SessionStore, { SessionId } from '@deepseek-ai/dsh-session';
import SessionProjectionRegistry from '@deepseek-ai/dsh-session-projection';
import SystemPrompt, { type Config } from '@deepseek-ai/dsh-system-prompt';
import ToolRuntime from '@deepseek-ai/dsh-tools';
import * as NativeToolExecutor from '@deepseek-ai/dsh-tool-executor-native';
import { defineContentToolFixture } from '@deepseek-ai/dsh-tool-testkit';
export { Context, SystemPrompt };
export { renderPrompt, renderContextSections, renderContextSnapshot, PERSONA_PREFIX_SECTION, TOOL_ORDER_REST } from '@deepseek-ai/dsh-system-prompt';
export { MockAdapter, textResponse } from './official-mock.ts';
export { LlmError } from '@deepseek-ai/dsh-llm';
export const gate = () => Promise.withResolvers<void>();
export const textOf = (m: any) => m.content?.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('') ?? '';
export const schema = (name: string) => ({ name, description: name + ' fixture', parameters: { type: 'object', properties: {} } });
export async function component<T>(work: (ctx: Context) => T | Promise<T>, config: Config = {}): Promise<T> {
  const ctx = new Context();
  try { await ctx.plugin(SystemPrompt, { includeHarnessIdentity: false, ...config }); return await work(ctx); }
  finally { await ctx.fiber.dispose(); }
}
export async function harness(adapter: any, config: Config = {}) {
  const ctx = new Context(), handles: any[] = [], trace: any[] = [];
  for (const p of [LlmRuntime, SessionStore, SessionProjectionRegistry]) await ctx.plugin(p as any);
  await ctx.plugin(SystemPrompt, { includeHarnessIdentity: false, ...config });
  for (const p of [ToolRuntime, NativeToolExecutor, AgentRegistry]) await ctx.plugin(p as any);
  await ctx.plugin(AgentLoop, { agents: [] }); ctx.llm.registerAdapter(['fixture'], adapter);
  ctx.on('session/event', (session, event) => { trace.push({ channel: 'fact', sessionId: session.id, event: structuredClone(event) }); });
  ctx.on('agent/error', ({ agent, error }) => { trace.push({ channel: 'live', agentId: agent.id, error: String(error) }); });
  async function create(id: string) { const h = await ctx.agents.create({ sessionId: SessionId(id), agentOptions: { provider: 'fixture', model: 'scripted' } }); handles.push(h); return h.agent; }
  return { ctx, trace, create, async close() { for (const h of handles) await h.dispose(); await ctx.fiber.dispose(); } };
}
export async function send(agent: any, text: string) {
  agent.followup(createUserMessage({ content: [{ type: 'text', text }], source: { kind: 'user' } })); await agent.whenIdle();
}
export function registerTextTool(ctx: Context, name: string) {
  return ctx.tools.register(defineContentToolFixture({ name, description: name + ' 固定文本工具', parameters: {}, async execute() { return [{ type: 'text', text: 'fixture only' }]; } }));
}
export function capture(agent: any, adapter: any, trace: any[]) {
  return { events: agent.session.snapshotEvents(), trace: structuredClone(trace), requests: adapter.requests.filter((r: any) => r.sessionId === agent.id).map((r: any) => ({
    keys: Object.keys(r), frozen: Object.isFrozen(r) && Object.isFrozen(r.messages) && r.messages.every((m: any) => Object.isFrozen(m)), messages: structuredClone(r.messages), tools: structuredClone(r.tools ?? []),
  })), status: agent.status };
}
