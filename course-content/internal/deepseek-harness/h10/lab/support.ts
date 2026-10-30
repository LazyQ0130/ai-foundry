// 改编固定官方scope-lifecycle/request-error的最小装配；无磁盘后端、文件或Shell工具。
import { Context } from '@deepseek-ai/cordis';
import AgentRegistry from '@deepseek-ai/dsh-agent';
import AgentLoop from '@deepseek-ai/dsh-agent-loop';
import LlmRuntime, { createUserMessage } from '@deepseek-ai/dsh-llm';
import SessionStore, { SessionId } from '@deepseek-ai/dsh-session';
import SessionProjectionRegistry from '@deepseek-ai/dsh-session-projection';
import SystemPrompt from '@deepseek-ai/dsh-system-prompt';
import ToolRuntime from '@deepseek-ai/dsh-tools';
import * as NativeToolExecutor from '@deepseek-ai/dsh-tool-executor-native';
export { MockAdapter, textResponse, toolCallResponse, maxTokensResponse } from './official-mock.ts';
export { LlmError } from '@deepseek-ai/dsh-llm';
export const gate = () => Promise.withResolvers<void>();
export const message = (text: string) => createUserMessage({ content: [{ type: 'text', text }], source: { kind: 'user' } });
export const textOf = (m: any) => m.content?.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('') ?? '';
export async function harness(adapter: any, id = 'h10') {
  const ctx = new Context();
  for (const plugin of [LlmRuntime, SessionStore, SessionProjectionRegistry, SystemPrompt, ToolRuntime, NativeToolExecutor, AgentRegistry]) await ctx.plugin(plugin as any);
  await ctx.plugin(AgentLoop, { agents: [] });
  ctx.llm.registerAdapter(['fixture'], adapter);
  const handle = await ctx.agents.create({ sessionId: SessionId(id), agentOptions: { provider: 'fixture', model: 'scripted' } });
  const trace: any[] = [];
  const record = (channel: string, type: string, data: any) => trace.push({ order: trace.length, channel, type, data });
  ctx.on('session/event', (session, event) => { if (session === handle.agent.session) record('fact', event.type, structuredClone(event)); });
  ctx.on('agent/status', ({ status }) => { record('live', 'agent/status', status); });
  ctx.on('agent/assistant-stream', ({ frame }) => { record('live', 'agent/assistant-stream', structuredClone(frame)); });
  ctx.on('agent/inbox/claimed', ({ message, turn }) => { record('live', 'agent/inbox/claimed', { id: message.id, text: textOf(message), turn }); });
  ctx.on('agent/error', ({ turn, step, error }) => { record('live', 'agent/error', { turn, step, error: String(error) }); });
  return { ctx, handle, agent: handle.agent, trace, async close() { await handle.dispose(); await ctx.fiber.dispose(); } };
}
export function snapshot(h: any, adapter: any) {
  const events = h.agent.session.snapshotEvents();
  const of = (type: string) => events.filter((e: any) => e.type === type);
  return { summary: { turns: of('turn/start').map((e: any) => e.data.turn),
    steps: of('step/start').map((e: any) => [e.data.turn, e.data.step]), attempts: adapter.requests.length,
    toolCalls: of('tool/call').length, toolResults: of('tool/result').length,
    ends: of('turn/end').map((e: any) => e.data.reason.kind), status: h.agent.status },
    events, trace: structuredClone(h.trace), requests: adapter.requests.map((r: any) => r.messages.map((m: any) => ({ role: m.role, text: textOf(m), content: structuredClone(m.content) }))) };
}
