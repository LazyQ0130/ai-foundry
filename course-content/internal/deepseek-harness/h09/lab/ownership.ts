import assert from 'node:assert/strict';
import { harness, consumer, SessionId } from './support.ts';
export async function ownershipExample() {
  const { ctx } = await harness();
  try {
    const { owner, ownerCtx } = await consumer(ctx);
    const parent = await ctx.agents.create({ sessionId: SessionId('parent-live') });
    const h = await ownerCtx.agents.create({ sessionId: SessionId('child-live'), parentAgent: parent.agent,
      meta: { parentSession: SessionId('different-history') } });
    const queried = ctx.agents.get(h.agent.id)!;
    const before = { bareHasDispose: 'dispose' in queried, handleHasDispose: typeof h.dispose === 'function',
      runtimeChild: ctx.agents.isOwnedBy(h.agent.id, parent.agent), historyParent: h.agent.session.header.parentSession };
    await h.dispose();
    const replacement = await ctx.agents.create({ sessionId: h.agent.id });
    await h.dispose(); // 陈旧Handle不能清除后来复用同ID的新生命周期。
    assert.equal(ctx.agents.get(replacement.agent.id), replacement.agent);
    await owner.dispose(); // 旧消费者结束也不能影响新实例。
    assert.equal(ctx.agents.get(replacement.agent.id), replacement.agent);
    await replacement.dispose(); await parent.dispose();
    return { ...before, staleDisposePreservedReplacement: true };
  } finally { await ctx.fiber.dispose(); }
}
