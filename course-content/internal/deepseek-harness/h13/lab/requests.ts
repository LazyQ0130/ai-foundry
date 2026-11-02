import assert from 'node:assert/strict';
import SessionStore, { SessionId } from '@deepseek-ai/dsh-session';
import { Context, harness, ScriptedAdapter, sumTool, callChunks, textChunks, send, names } from './support.ts';
export type RequestCase = 'success' | 'false' | 'retry' | 'remove' | 'replace' | 'restrict';
export async function requestsPractice(kind: RequestCase = 'success') {
  const responses = kind === 'retry'
    ? [[{ type: 'finish', reason: { kind: 'error', failure: { code: 'SERVER', message: '受控首尝试失败' } } }], callChunks(), textChunks('总和 12，共 3 项。')]
    : [callChunks(), textChunks('固定总结')];
  const adapter = new ScriptedAdapter(responses), h = await harness(adapter);
  let checks = 0, bodies = 0, enabled = kind !== 'false', modelAtWhen: unknown;
  const admissions: any[] = [], loopRequests: any[] = [], sets: any[] = [];
  const replay = new Context(), requestPrefixes: any[] = [];
  await replay.plugin(SessionStore);
  try {
    const agent = await h.create('h13-' + kind);
    const definition = sumTool('calculate_sum', () => bodies++);
    const stop = h.ctx.tools.register(definition, { when: input => {
      checks++; modelAtWhen = input.modelSelection; return enabled && input.modelSelection.model === 'scripted';
    } });
    const registered = names(h.ctx.tools.definitions(agent));
    // 真实 Prompt 回调收到 Loop 的 toolSet。只记录，不伪造 Session 事件。
    h.ctx.systemPrompt.section({ name: 'admission-observer', order: 1,
      text: ({ scope, toolSet }: any) => { sets.push(toolSet); admissions.push(names(h.ctx.tools.schemas(scope, toolSet))); return ''; } });
    h.ctx.on('llm/stream', async function* (options: any, next: any) {
      const prefix = agent.session.snapshotEvents();
      const rebuilt = replay.sessions.prepare(SessionId('rebuild-' + kind + '-' + requestPrefixes.length), { seed: prefix });
      const header = rebuilt.requestHeader()!;
      assert.deepEqual(rebuilt.deriveMessages(), options.messages);
      for (const [key, value] of Object.entries(header.config)) assert.deepEqual(options[key], value);
      assert.deepEqual(header.tools ?? [], options.tools ?? []);
      assert.deepEqual(rebuilt.toolHistory(), options.toolHistory);
      requestPrefixes.push({ throughSeq: prefix.at(-1)?.seq, events: prefix,
        reconstruction: 'PASS messages/config/tools/toolHistory from second real Session' });
      loopRequests.push(structuredClone({ ...options, signal: undefined })); yield* next();
    });
    if (kind === 'retry') h.ctx.on('agent/request-error', async () => { enabled = false; return { kind: 'retry' }; });
    // 第一次模型请求已经取得声明后，受控替身在发出 ToolCallBlock 前撤销或改变可见性。
    const first = adapter.responses[0];
    if (['remove', 'replace', 'restrict'].includes(kind)) adapter.responses[0] = options => {
      if (kind === 'restrict') agent.ctx.tools.restrict({ deny: ['calculate_sum'] });
      else { stop(); if (kind === 'replace') h.ctx.tools.register(definition, { when: () => true }); }
      return (async function* () { for (const chunk of first as any[]) yield chunk; })();
    };
    await send(agent);
    const facts = h.trace.filter(e => e.channel === 'fact').map(e => e.event);
    const calls = facts.filter(e => e.type === 'tool/call'), results = facts.filter(e => e.type === 'tool/result');
    return { kind, registered, inspectionAfter: names(h.ctx.tools.schemas(agent)), admissions, checks, bodies, modelAtWhen,
      requests: adapter.requests.map(r => structuredClone({ ...r, signal: undefined })), loopRequests, requestPrefixes,
      calls, results, facts, errors: h.trace.filter(e => e.channel === 'error'),
      released: sets.map(s => names(h.ctx.tools.schemas(agent, s))) };
  } finally { await replay.fiber.dispose(); await h.close(); }
}
