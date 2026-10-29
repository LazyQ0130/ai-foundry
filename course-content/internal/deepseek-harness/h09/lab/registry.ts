import assert from 'node:assert/strict';
import { harness, SessionId } from './support.ts';
export async function registryExample() {
  const { ctx } = await harness();
  try {
    const a = await ctx.agents.create({ sessionId: SessionId('reader-A') });
    const b = await ctx.agents.create({ sessionId: SessionId('writer-B') });
    const c = await ctx.agents.create({ sessionId: SessionId('tester-C'), parentAgent: a.agent });
    assert.equal(ctx.agents.get(a.agent.id), a.agent);
    const list = ctx.agents.list(); list.length = 0;
    const result = { sameReference: ctx.agents.get(a.agent.id) === a.agent,
      active: ctx.agents.list().map(x => x.id), roots: ctx.agents.roots().map(x => x.id),
      missing: ctx.agents.get(SessionId('missing')) === undefined,
      emptyLookup: ctx.agents.get(SessionId('')) === undefined };
    await assert.rejects(ctx.agents.create({ sessionId: a.agent.id }), /already exists/);
    await c.dispose(); await b.dispose(); await a.dispose();
    return result;
  } finally { await ctx.fiber.dispose(); }
}
