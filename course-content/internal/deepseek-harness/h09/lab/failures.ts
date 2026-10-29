import assert from 'node:assert/strict';
import { harness, SessionId, gate } from './support.ts';
export type FailureCase = 'setup' | 'commit' | 'session-listener' | 'agent-listener' | 'cancel' | 'normal';
export async function failureExample(kind: FailureCase) {
  const { ctx } = await harness();
  const trace: string[] = [], id = SessionId('failure-' + kind);
  let cleanups = 0;
  const abort = new AbortController(), entered = gate(), release = gate();
  ctx.on('session/created', () => { trace.push('session/created'); if (kind === 'session-listener') throw Error('fixture session-listener'); });
  ctx.on('session/disposed', () => { trace.push('session/disposed'); });
  ctx.on('agent/created', () => { trace.push('agent/created'); if (kind === 'agent-listener') throw Error('fixture agent-listener'); });
  ctx.on('agent/created', () => { trace.push('later-listener'); });
  ctx.on('agent/disposed', () => { trace.push('agent/disposed'); });
  try {
    const creating = ctx.agents.create({ sessionId: id, signal: abort.signal, setup: async agentCtx => {
      trace.push('setup'); agentCtx.effect(() => () => { cleanups++; trace.push('scope-clean'); });
      if (kind === 'setup') throw Error('fixture setup');
      if (kind === 'cancel') { entered.resolve(); await release.promise; }
      return { commit() { trace.push('commit'); if (kind === 'commit') throw Error('fixture commit'); } };
    } });
    // 立即挂拒绝处理；取消不会让失去联系的第三方Promise神奇消失。
    const settled = creating.then(handle => ({ handle }), error => ({ error }));
    if (kind === 'cancel') { await entered.promise; abort.abort(Error('fixture cancel')); }
    const outcome = await settled;
    release.resolve(); // 让受控setup自己的异步工作退出。
    if (kind === 'normal') { assert.ok('handle' in outcome); await outcome.handle!.dispose(); }
    else { assert.ok('error' in outcome); assert.match(String(outcome.error), /fixture/); }
    return { kind, trace, cleanups, agentAbsent: ctx.agents.get(id) === undefined, sessionAbsent: ctx.sessions.get(id) === undefined };
  } finally { release.resolve(); await ctx.fiber.dispose(); }
}
