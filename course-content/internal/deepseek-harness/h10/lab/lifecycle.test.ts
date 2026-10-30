import { test } from 'node:test';
import assert from 'node:assert/strict';
import { setImmediate } from 'node:timers/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Context } from '@deepseek-ai/cordis';
import SessionStore, { SessionId } from '@deepseek-ai/dsh-session';
import SessionProjectionRegistry from '@deepseek-ai/dsh-session-projection';
import { agentEvents } from '@deepseek-ai/dsh-agent';
import { execution, type Case } from './execution.ts';
import { routing, duringRun } from './routing.ts';
import { cancellation, type CancelCase } from './branches.ts';
import { verifyTrace } from './trace-answer.ts';
import { harness, gate, message, snapshot, textOf, MockAdapter, textResponse, toolCallResponse, maxTokensResponse, LlmError } from './support.ts';
const load = (p: string) => import(pathToFileURL(resolve(process.env.HARNESS_SOURCE_CACHE!, p)).href);
const { ReactLoopInbox, inboxProjectionDefinition } = await load('packages/core/agent-loop/src/inbox.ts');
const { AssistantStreamAttempt } = await load('packages/core/agent-loop/src/assistant-stream.ts');
async function inboxFixture() {
  const ctx = new Context(); await ctx.plugin(SessionStore); await ctx.plugin(SessionProjectionRegistry);
  const projection = await ctx.sessionProjections.register(inboxProjectionDefinition);
  const session = ctx.sessions.create(SessionId('component'));
  const subject = { id: session.id, session } as any, trace: any[] = [];
  ctx.on('session/event', (_s, e) => { trace.push(['fact', e]); });
  ctx.on('agent/inbox/claimed', e => { trace.push(['claimed', textOf(e.message)]); });
  return { ctx, session, trace, inbox: new ReactLoopInbox(() => projection.stateOf(session), session, agentEvents(ctx, subject)) };
}
test('C01 actual Inbox claims all next-step then one next-turn, before live claimed notification', async () => {
  const f = await inboxFixture();
  try {
    f.inbox.append('next-step', message('I')); f.inbox.append('next-step', message('S'));
    f.inbox.append('next-turn', message('F1')); f.inbox.append('next-turn', message('F2'));
    assert.deepEqual(f.inbox.claim('next-turn', 1).map(textOf), ['I', 'S', 'F1']);
    assert.deepEqual(f.inbox.nextTurn.map(textOf), ['F2']); assert.deepEqual(f.inbox.nextStep, []);
    assert.equal(f.session.snapshotEvents().some((e: any) => e.type === 'user/message'), false);
    const lastFacts = f.trace.filter(e => e[0] === 'fact').slice(-2);
    assert.deepEqual(lastFacts.map(e => e[1].data.target), ['next-step', 'next-turn']);
    assert.ok(lastFacts.every(e => e[1].data.outcome === undefined));
    assert.deepEqual(f.trace.slice(-3).map(e => e[0]), ['claimed', 'claimed', 'claimed']);
  } finally { await f.ctx.fiber.dispose(); }
});
test('C02 actual Inbox rejects duplicate identity across lists without adding a fact', async () => {
  const f = await inboxFixture();
  try { const m = message('one'); f.inbox.append('next-turn', m); const n = f.session.seq;
    assert.throws(() => f.inbox.append('next-step', m), /already pending/); assert.equal(f.session.seq, n);
  } finally { await f.ctx.fiber.dispose(); }
});
test('C03 actual Inbox clear records canceled next-step before next-turn', async () => {
  const f = await inboxFixture();
  try { f.inbox.append('next-turn', message('F')); f.inbox.append('next-step', message('I')); f.inbox.clear();
    assert.deepEqual(f.session.snapshotEvents().slice(-2).map((e: any) => [e.data.target, e.data.outcome]), [['next-step', 'canceled'], ['next-turn', 'canceled']]);
    assert.equal(f.inbox.hasPending, false);
  } finally { await f.ctx.fiber.dispose(); }
});
test('C04 actual stream component publishes chunks before settlement, committed end after Session append', async () => {
  const f = await inboxFixture();
  try {
    let revision = 0; const frames: any[] = [];
    const a = new AssistantStreamAttempt(f.session.id, 1, () => ++revision, 1, 1, (frame: any) => {
      if (frame.type === 'end') assert.equal(f.session.snapshotEvents().at(-1)!.seq, frame.outcome.seq); frames.push(frame);
    });
    a.start(); for (const c of textResponse('片段')) a.push(c);
    assert.equal(f.session.snapshotEvents().some(e => e.type === 'assistant/message' || e.type === 'assistant/attempt'), false);
    a.settle('assistant/attempt', () => f.session.append('assistant/attempt', { turn: 1, step: 1, stream: a.stream }).seq);
    assert.equal(frames.at(-1).outcome.eventType, 'assistant/attempt');
  } finally { await f.ctx.fiber.dispose(); }
});
const expected: Record<Case, [number, number, number, string]> = {
  direct: [1, 1, 0, 'completed'], 'one-tool': [2, 2, 1, 'completed'], multi: [3, 3, 2, 'completed'],
  'two-tools': [2, 2, 2, 'completed'], reject: [0, 0, 0, 'blocked'], empty: [0, 0, 0, 'completed'],
  retry: [1, 2, 0, 'completed'], terminal: [1, 1, 0, 'error'], 'tool-error': [2, 2, 1, 'completed'], 'max-tokens': [1, 1, 0, 'max-tokens'],
};
for (const kind of Object.keys(expected) as Case[]) test('D01-' + kind + ' real Loop boundary counts and endings', async () => {
  const r = await execution(kind), [steps, attempts, tools, end] = expected[kind];
  assert.equal(r.summary.steps.length, steps); assert.equal(r.summary.attempts, attempts); assert.equal(r.summary.toolCalls, tools);
  assert.deepEqual(r.summary.turns, [1]); assert.deepEqual(r.summary.ends, [end]); assert.equal(r.summary.status, 'idle');
  assert.equal(r.events.filter((e: any) => e.type === 'step/end').length, steps);
  if (kind === 'tool-error') {
    const result = r.events.find((e: any) => e.type === 'tool/result');
    assert.equal(result.data.message.isError, true); assert.match(JSON.stringify(result.data), /FIXTURE_READ_FAILED/);
  }
});
test('D02 three-Step task reads prior tool results in later frozen requests', async () => {
  const r = await execution('multi');
  const answer = { turns: [1], steps: [[1,1],[1,2],[1,3]], attempts: 3, toolCalls: 2, toolPositions: [['read-1',1,1],['read-2',1,2]], ends: ['completed'] };
  verifyTrace(r, answer);
  assert.throws(() => verifyTrace(r, { ...answer, toolPositions: [['read-1',1,2],['read-2',1,2]] }));
  assert.equal(r.requests[0].some((m: any) => m.role === 'tool'), false);
  assert.equal(r.requests[1].filter((m: any) => m.role === 'tool').length, 1);
  assert.equal(r.requests[2].filter((m: any) => m.role === 'tool').length, 2);
  assert.match(r.requests[2].filter((m: any) => m.role === 'tool').map((m: any) => m.text).join(' '), /README夹具.*测试夹具/s);
  const order = r.events.filter((e: any) => ['turn/start','step/start','assistant/message','tool/call','tool/result','step/end','turn/end'].includes(e.type)).map((e: any) => e.type);
  assert.deepEqual(order, ['turn/start','step/start','assistant/message','tool/call','tool/result','step/end','step/start','assistant/message','tool/call','tool/result','step/end','step/start','assistant/message','step/end','turn/end']);
});
test('D03 A verifies real trace annotations and rejects Attempt-as-Step answer', async () => {
  const r = await execution('retry'); verifyTrace(r, { turns: [1], steps: [[1,1]], attempts: 2, toolCalls: 0, toolPositions: [], ends: ['completed'] });
  assert.throws(() => verifyTrace(r, { turns: [1], steps: [[1,1],[1,2]], attempts: 2, toolCalls: 0, toolPositions: [], ends: ['completed'] }));
  assert.equal(r.events.filter((e: any) => e.type === 'user/message' && e.data.source.kind === 'user').length, 1);
  assert.equal(r.events.filter((e: any) => e.type === 'assistant/attempt').length, 1);
});
test('D04 actual maintenance is publicly idle; queued claims I,S,F1 then F2 over two Turns', async () => {
  const r = await routing(); assert.deepEqual(r.beforeWake, { status: 'idle', phase: 'maintenance', requests: 0 });
  assert.deepEqual(r.summary.turns, [1,2]); assert.deepEqual(r.summary.steps, [[1,1],[2,1]]);
  assert.deepEqual(r.trace.filter((e: any) => e.type === 'agent/inbox/claimed').map((e: any) => e.data.text), ['I：只补上下文','S：调整方向','F1：普通任务','F2：下一轮任务']);
});
for (const kind of ['steer','followup','inject'] as const) test('D05-' + kind + ' routing during running follows correct boundary', async () => {
  const r = await duringRun(kind);
  assert.deepEqual(r.summary.steps, kind === 'followup' ? [[1,1],[2,1]] : [[1,1],[1,2]]);
  assert.equal(r.summary.attempts, 2);
});
for (const kind of ['pre-step','request','stream','keep-inbox','drop-inbox'] as CancelCase[]) test('D06-' + kind + ' cancellation at a controlled boundary', async () => {
  const r = await cancellation(kind);
  assert.deepEqual(r.summary.ends, ['aborted']); assert.equal(r.summary.steps.length, kind === 'pre-step' ? 0 : 1);
  assert.equal(r.summary.attempts, kind === 'stream' ? 1 : 0);
  if (kind !== 'stream') assert.equal(r.events.some((e: any) => e.type === 'system/message' || e.type === 'user/message'), false);
  else assert.ok(r.events.some((e: any) => e.type === 'assistant/message' && e.data.interrupted === true));
  if (kind === 'keep-inbox') assert.deepEqual(r.afterCancel, { nextTurn: 1, nextStep: 1 });
  if (kind === 'drop-inbox') assert.deepEqual(r.afterCancel, { nextTurn: 0, nextStep: 0 });
});
test('D07 inject while truly idle parks input and performs no turn until a waking call', async () => {
  const adapter = new MockAdapter([textResponse('ok')]), h = await harness(adapter, 'idle-inject');
  try { h.agent.inject(message('context')); await setImmediate(); assert.equal(adapter.requests.length, 0);
    assert.equal(h.agent.session.snapshotEvents().some(e => e.type === 'turn/start'), false);
    h.agent.steer(message('wake')); await h.agent.whenIdle(); assert.equal(adapter.requests.length, 1);
  } finally { await h.close(); }
});
test('D08 rejected first pre-step leaves claimed input removed but later next-turn still pending', async () => {
  const adapter = new MockAdapter([]), h = await harness(adapter, 'reject-pending'); const release = gate();
  try {
    const work = h.agent.runMaintenance(async () => { await release.promise; });
    h.agent.followup(message('first')); h.agent.followup(message('second'));
    h.ctx.on('agent/pre-step', async () => ({ kind: 'reject' })); release.resolve(); await work; await h.agent.whenIdle();
    assert.equal(h.agent.inbox.nextTurn.length, 1); assert.equal(textOf(h.agent.inbox.nextTurn[0]), 'second');
    assert.equal(h.agent.session.snapshotEvents().some(e => e.type === 'user/message'), false);
  } finally { release.resolve(); await h.close(); }
});
test('D09 retry repeats request only, not assembly/pre-step/admitted user', async () => {
  const adapter = new MockAdapter([() => { throw new LlmError('busy','RATE_LIMIT'); }, textResponse('ok')]), h = await harness(adapter, 'retry-counts');
  try { let pre = 0, assembly = 0, req = 0;
    h.ctx.on('agent/pre-step', async (_e, next) => { pre++; return next(); });
    h.ctx.on('system-prompt/assemble', async (_assembly: any, _context: any, next: any) => { assembly++; return next(); });
    h.ctx.on('agent/request', async (_e, next) => { req++; return next(); });
    h.ctx.on('agent/request-error', async () => ({ kind: 'retry' }));
    h.agent.followup(message('one')); await h.agent.whenIdle();
    assert.deepEqual([pre,assembly,req,adapter.requests.length], [1,1,2,2]);
  } finally { await h.close(); }
});
test('D10 request middleware failure is terminal, not automatically sent to request-error recovery', async () => {
  const adapter = new MockAdapter([textResponse('unused')]), h = await harness(adapter, 'middleware-error');
  try { let recovery = 0; h.ctx.on('agent/request', () => { throw Error('fixture middleware'); });
    h.ctx.on('agent/request-error', async () => { recovery++; return { kind: 'retry' }; });
    h.agent.followup(message('go')); await h.agent.whenIdle();
    assert.equal(recovery,0); assert.equal(adapter.requests.length,0); assert.deepEqual(snapshot(h,adapter).summary.ends,['error']);
  } finally { await h.close(); }
});
test('D11 stopping listener steering is rechecked; max-tokens stays sticky across later completed Step', async () => {
  const adapter = new MockAdapter([maxTokensResponse('cut'),textResponse('done')]), h = await harness(adapter,'sticky');
  try { let n=0; h.ctx.on('agent/turn-stopping', () => { if(n++===0) h.agent.steer(message('more')); });
    h.agent.followup(message('go')); await h.agent.whenIdle();
    assert.deepEqual(snapshot(h,adapter).summary.steps, [[1,1],[1,2]]); assert.deepEqual(snapshot(h,adapter).summary.ends,['max-tokens']);
  } finally { await h.close(); }
});
test('D12 model choice is captured per proposed Step, later select applies to next Step', async () => {
  const adapter=new MockAdapter([textResponse('one'),textResponse('two')]),h=await harness(adapter,'selection');
  try { let changed=false; h.ctx.on('agent/request', async(_e,next)=>{if(!changed){changed=true;h.agent.model.select({provider:'fixture',model:'later'});h.agent.steer(message('next'));}return next();});
    h.agent.followup(message('go'));await h.agent.whenIdle();assert.deepEqual(adapter.requests.map(r=>r.model),['scripted','later']);
  } finally {await h.close();}
});
