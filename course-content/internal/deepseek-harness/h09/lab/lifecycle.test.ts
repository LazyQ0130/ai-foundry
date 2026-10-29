import { test } from 'node:test';
import assert from 'node:assert/strict';
import { setImmediate } from 'node:timers/promises';
import { registryOnly, harness, consumer, SessionId, gate, agentEvents, createUserMessage } from './support.ts';
import { registryExample } from './registry.ts';
import { ownershipExample } from './ownership.ts';
import { failureExample, type FailureCase } from './failures.ts';
import { LlmAdapter } from '@deepseek-ai/dsh-llm';

test('C01 Registry without factory rejects both creation operations', async () => {
  const ctx = await registryOnly();
  try {
    await assert.rejects(ctx.agents.create({ sessionId: SessionId('none') }), /no agent factory/);
    await assert.rejects(ctx.agents.resume({ resumeSessionId: SessionId('none') }), /no agent factory/);
  } finally { await ctx.fiber.dispose(); }
});
test('C02 real Registry delegates caller fiber, rejects duplicate factory and releases slot', async () => {
  const ctx = await registryOnly();
  try {
    const { owner, ownerCtx } = await consumer(ctx);
    let received: unknown;
    const result = { agent: {} as never, async dispose() {} };
    const factory = { async createAgent(c: unknown) { received = c; return result; }, async resume(c: unknown) { received = c; return result; } };
    const off = ctx.agents.setFactory(factory);
    assert.throws(() => ctx.agents.setFactory(factory), /already registered/);
    assert.equal(await ownerCtx.agents.create({ sessionId: SessionId('delegated') }), result);
    assert.equal((received as any).fiber === ownerCtx.fiber, true);
    assert.equal(await ownerCtx.agents.resume({ resumeSessionId: SessionId('delegated') }), result);
    assert.equal((received as any).fiber === ownerCtx.fiber, true);
    off(); await assert.rejects(ctx.agents.create({ sessionId: SessionId('after') }), /no agent factory/);
    await owner.dispose();
  } finally { await ctx.fiber.dispose(); }
});
test('C03 real entry identity and advanced detach reject mismatch, collision and stale teardown', async () => {
  const ctx = await registryOnly();
  try {
    // 结构Agent替身，仅测Registry；不声称驱动器、SessionStore或作用域已经运行。
    const id = SessionId('entry'), a = { id, session: { id } } as never;
    assert.throws(() => ctx.agents.enter({ id, session: { id: SessionId('other') } } as never, undefined), /does not match/);
    const off = ctx.agents.enter(a, undefined);
    assert.throws(() => ctx.agents.enter(a, undefined), /already registered/);
    await ctx.agents.announce(a, 'startup'); off();
    const b = { id, session: { id } } as never, newOff = ctx.agents.enter(b, undefined);
    off(); assert.equal(ctx.agents.get(id), b); newOff();
  } finally { await ctx.fiber.dispose(); }
});
test('D01 A uses real Loop: queries, roots, snapshots and collisions', async () => {
  assert.deepEqual(await registryExample(), { sameReference: true, active: ['reader-A', 'writer-B', 'tester-C'], roots: ['reader-A', 'writer-B'], missing: true, emptyLookup: true });
});
test('D02 B: public Agent lacks dispose; stale Handle and former caller cannot delete replacement', async () => {
  assert.deepEqual(await ownershipExample(), { bareHasDispose: false, handleHasDispose: true, runtimeChild: true, historyParent: 'different-history', staleDisposePreservedReplacement: true });
});
const expected: Record<FailureCase, string[]> = {
  setup: ['session/created', 'setup', 'scope-clean', 'session/disposed'],
  commit: ['session/created', 'setup', 'commit', 'scope-clean', 'session/disposed'],
  'session-listener': ['session/created', 'session/disposed'],
  'agent-listener': ['session/created', 'setup', 'commit', 'agent/created', 'scope-clean', 'agent/disposed', 'session/disposed'],
  cancel: ['session/created', 'setup', 'scope-clean', 'session/disposed'],
  normal: ['session/created', 'setup', 'commit', 'agent/created', 'later-listener', 'scope-clean', 'agent/disposed', 'session/disposed'],
};
for (const kind of Object.keys(expected) as FailureCase[]) test('D03-' + kind + ' initialization/cleanup path', async () => {
  const r = await failureExample(kind);
  assert.deepEqual(r.trace, expected[kind]); assert.equal(r.cleanups, kind === 'session-listener' ? 0 : 1);
  assert.equal(r.agentAbsent, true); assert.equal(r.sessionAbsent, true);
});
test('D04 setup sees live writable Session and unpublished Agent; created sees committed scoped registrations', async () => {
  const { ctx } = await harness();
  try {
    const trace: string[] = [], id = SessionId('publish'); let count = 0;
    ctx.on('session/created', s => { assert.equal(ctx.sessions.get(id), s); assert.equal(ctx.agents.get(id), undefined); trace.push('session'); });
    ctx.on('agent/created', ({ agent }) => {
      assert.equal(ctx.agents.get(id), agent); trace.push('agent');
      agentEvents(ctx, agent).emit('agent/status', { status: 'idle' }); assert.equal(count, 1);
    });
    const h = await ctx.agents.create({ sessionId: id, setup(agentCtx, agent) {
      trace.push('setup'); assert.equal(ctx.sessions.get(id), agent.session); assert.equal(ctx.agents.get(id), undefined);
      agent.model.select({ provider: 'fixture', model: 'never-called' });
      agentCtx.on('agent/status', () => { count++; });
      return { commit() { trace.push('commit'); } };
    } });
    trace.push('returned'); assert.deepEqual(trace, ['session', 'setup', 'commit', 'agent', 'returned']);
    await h.dispose(); agentEvents(ctx, h.agent).emit('agent/status', { status: 'idle' }); assert.equal(count, 1);
    assert.throws(() => h.agent.ctx.on('agent/status', () => {}), /inactive context/);
  } finally { await ctx.fiber.dispose(); }
});
test('D05 serial listener barrier holds create; failed creation preserves queued input without starting model', async () => {
  const { ctx } = await harness(); const entered = gate(), release = gate();
  try {
    let observed: any, resolved = false, later = false;
    ctx.on('agent/created', async ({ agent }) => {
      observed = agent;
      agent.followup(createUserMessage({ content: [{ type: 'text', text: 'fixture' }], source: { kind: 'user' } }));
      entered.resolve(); await release.promise; throw Error('fixture veto');
    });
    ctx.on('agent/created', () => { later = true; });
    const p = ctx.agents.create({ sessionId: SessionId('held') }).then(() => { resolved = true; });
    const rejected = assert.rejects(p, /fixture veto/);
    await entered.promise; await setImmediate();
    assert.equal(resolved, false); assert.equal(observed.inbox.nextTurn.length, 1);
    assert.equal(observed.session.snapshotEvents().some((e: any) => e.type === 'turn/start'), false);
    release.resolve(); await rejected;
    assert.equal(later, false); assert.equal(observed.inbox.nextTurn.length, 1);
    assert.deepEqual(ctx.agents.list(), []); assert.deepEqual(ctx.sessions.list(), []);
  } finally { release.resolve(); await ctx.fiber.dispose(); }
});
test('D06 owner unload during async creation listener waits for listener and scope before detaching', async () => {
  const { ctx } = await harness(); const entered = gate(), release = gate();
  try {
    const { owner, ownerCtx } = await consumer(ctx); const id = SessionId('owner-setup'), trace: string[] = [];
    ctx.on('agent/created', async () => { entered.resolve(); await release.promise; assert.ok(ctx.agents.get(id)); assert.ok(ctx.sessions.get(id)); trace.push('listener-end'); });
    ctx.on('agent/disposed', () => { trace.push('agent'); }); ctx.on('session/disposed', () => { trace.push('session'); });
    const p = ownerCtx.agents.create({ sessionId: id, setup(c) { c.effect(() => () => { trace.push('scope'); }); } });
    const rejected = assert.rejects(p, /owner disposed/); await entered.promise;
    let done = false; const disposing = owner.dispose().then(() => { done = true; }); await setImmediate();
    assert.equal(done, false); assert.ok(ctx.agents.get(id)); release.resolve(); await rejected; await disposing;
    assert.deepEqual(trace, ['listener-end', 'scope', 'agent', 'session']);
  } finally { release.resolve(); await ctx.fiber.dispose(); }
});
for (const mode of ['handle', 'owner', 'factory'] as const) test('D07-' + mode + ' stops and drains real maintenance before scope/registries', async () => {
  const { ctx, loop, disk } = await harness(true); const release = gate(), aborted = gate();
  try {
    const { owner, ownerCtx } = await consumer(ctx), trace: string[] = [];
    const h = await ownerCtx.agents.create({ sessionId: SessionId('drain-' + mode), setup(c) { c.effect(() => () => { trace.push('scope'); }); } });
    ctx.on('agent/disposed', ({ agent }) => { assert.equal(ctx.agents.get(agent.id), undefined); assert.ok(ctx.sessions.get(agent.id)); assert.ok(disk!.trace.includes('close:' + agent.id)); trace.push('agent'); });
    ctx.on('session/disposed', () => { trace.push('session'); });
    const work = h.agent.runMaintenance(async signal => { signal.addEventListener('abort', () => aborted.resolve(), { once: true }); await release.promise; trace.push('work-end'); });
    let done = false;
    const dispose = (mode === 'handle' ? h.dispose() : mode === 'owner' ? owner.dispose() : loop.dispose()).then(() => { done = true; });
    await aborted.promise; const joining = h.dispose(); await setImmediate();
    assert.equal(done, false); assert.ok(ctx.agents.get(h.agent.id)); assert.deepEqual(trace, []);
    release.resolve(); await work; await Promise.all([dispose, joining]);
    assert.deepEqual(trace, ['work-end', 'scope', 'agent', 'session']);
  } finally { release.resolve(); await ctx.fiber.dispose(); }
});
test('D08 explicit parentAgent, caller, historical parent and object identity are independent', async () => {
  const { ctx } = await harness();
  try {
    const { owner, ownerCtx } = await consumer(ctx), p = await ctx.agents.create({ sessionId: SessionId('p') });
    const c = await ownerCtx.agents.create({ sessionId: SessionId('c'), parentAgent: p.agent, meta: { parentSession: SessionId('history-only') } });
    const root = await ownerCtx.agents.create({ sessionId: SessionId('fork-root'), meta: { parentSession: p.agent.id } });
    assert.equal(ctx.agents.isOwnedBy(c.agent.id, p.agent), true);
    assert.equal(ctx.agents.isOwnedBy(c.agent.id, { ...p.agent } as never), false);
    assert.ok(ctx.agents.roots().includes(root.agent));
    await p.dispose(); assert.equal(ctx.agents.get(c.agent.id), c.agent); // 仅parentAgent字段不建立级联释放协议。
    await owner.dispose(); assert.equal(ctx.agents.get(c.agent.id), undefined); assert.equal(ctx.agents.get(root.agent.id), undefined);
  } finally { await ctx.fiber.dispose(); }
});
test('D09 real resume rejects absent backend; pre-aborted create announces nothing', async () => {
  const { ctx } = await harness();
  try {
    await assert.rejects(ctx.agents.resume({ resumeSessionId: SessionId('absent') }), /persistence is not configured/);
    let notices = 0; ctx.on('session/created', () => { notices++; });
    const a = new AbortController(); a.abort(Error('pre-aborted'));
    await assert.rejects(ctx.agents.create({ sessionId: SessionId('aborted'), signal: a.signal }), /pre-aborted/);
    assert.equal(notices, 0); assert.deepEqual(ctx.sessions.list(), []);
  } finally { await ctx.fiber.dispose(); }
});
test('D10 real resume reconstructs new objects through memory backend fixture; dispose retains stored facts', async () => {
  const { ctx, disk } = await harness(true);
  try {
    const id = SessionId('resume-fixture'), first = await ctx.agents.create({ sessionId: id, setup(_c, agent) { agent.model.select({ provider: 'fixture', model: 'unused' }); } });
    const originalSession = first.agent.session; await first.dispose();
    assert.equal(ctx.sessions.get(id), undefined);
    const saved = structuredClone(disk!.records.get(id)!.events);
    assert.ok(saved.some(e => e.type === 'model/selection'));
    await assert.rejects(ctx.agents.create({ sessionId: id }), /fixture stored identity exists/);
    const second = await ctx.agents.resume({ resumeSessionId: id });
    assert.notEqual(second.agent, first.agent); assert.notEqual(second.agent.session, originalSession);
    assert.equal(second.agent.id, id); assert.equal(second.agent.model.current()!.model, 'unused');
    await second.dispose();
    const restored = disk!.records.get(id)!.events;
    assert.deepEqual(restored.slice(0, saved.length), saved);
    assert.deepEqual(restored.slice(saved.length).map(e => [e.seq, e.type]), [[saved.length, 'session/end-seed']]);
  } finally { await ctx.fiber.dispose(); }
});
test('D11 teardown attempts registry cleanup after write-close failure and preserves rejection', async () => {
  const { ctx, disk } = await harness(true);
  try {
    const h = await ctx.agents.create({ sessionId: SessionId('close-failure') }); disk!.failClose();
    await assert.rejects(h.dispose(), /fixture close failed/);
    assert.equal(ctx.agents.get(h.agent.id), undefined); assert.equal(ctx.sessions.get(h.agent.id), undefined);
    await assert.rejects(h.dispose(), /fixture close failed/);
  } finally { await ctx.fiber.dispose(); }
});
test('D12 queued wake starts only after serial creation listeners; pre-step rejects before any model call', async () => {
  const { ctx } = await harness(); const entered = gate(), release = gate();
  try {
    let calls = 0; const trace: string[] = [];
    // 只替代模型元信息；stream若被调用就失败，不产生网络请求。
    class NeverStream extends LlmAdapter {
      async resolveModel(provider: string, model: string) { return { provider, id: model, name: model }; }
      async *stream(): AsyncIterable<never> { calls++; throw Error('unexpected model call'); }
    }
    ctx.llm.registerAdapter(['fixture'], new NeverStream());
    ctx.on('agent/pre-step', async () => ({ kind: 'reject' }));
    ctx.on('session/event', (_s, e) => { if (e.type === 'turn/start') trace.push('turn'); });
    ctx.on('agent/created', async ({ agent }) => {
      trace.push('listener-start'); agent.followup(createUserMessage({ content: [{ type: 'text', text: 'fixture' }], source: { kind: 'user' } }));
      entered.resolve(); await release.promise; trace.push('listener-end');
    });
    const p = ctx.agents.create({ sessionId: SessionId('release-wake'), agentOptions: { provider: 'fixture', model: 'never' } });
    await entered.promise; await setImmediate(); assert.deepEqual(trace, ['listener-start']);
    release.resolve(); const h = await p; await h.agent.whenIdle();
    assert.deepEqual(trace, ['listener-start', 'listener-end', 'turn']); assert.equal(calls, 0); await h.dispose();
  } finally { release.resolve(); await ctx.fiber.dispose(); }
});
test('D13 aborting the creation signal after success does not dispose the live Agent', async () => {
  const { ctx } = await harness();
  try {
    const a = new AbortController(), h = await ctx.agents.create({ sessionId: SessionId('after-ready'), signal: a.signal });
    a.abort(Error('too late for creation cancellation')); await setImmediate();
    assert.equal(ctx.agents.get(h.agent.id), h.agent); await h.dispose();
  } finally { await ctx.fiber.dispose(); }
});
test('D14 concurrent same-id preparation publishes one lifecycle and preserves winner', async () => {
  const { ctx } = await harness();
  try {
    const id = SessionId('concurrent'), results = await Promise.allSettled([
      ctx.agents.create({ sessionId: id }), ctx.agents.create({ sessionId: id }),
    ]);
    assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
    const loser = results.find(r => r.status === 'rejected');
    assert.ok(loser && loser.status === 'rejected'); assert.match(String(loser.reason), /already exists|already registered/);
    const winner = results.find(r => r.status === 'fulfilled')!;
    assert.equal(winner.status, 'fulfilled'); if (winner.status !== 'fulfilled') throw Error('no winner');
    assert.equal(ctx.agents.get(id), winner.value.agent); assert.equal(ctx.sessions.get(id), winner.value.agent.session);
    await winner.value.dispose(); assert.equal(ctx.agents.get(id), undefined);
  } finally { await ctx.fiber.dispose(); }
});
