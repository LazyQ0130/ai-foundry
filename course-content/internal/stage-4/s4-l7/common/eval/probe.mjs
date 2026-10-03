export function probe() {
  const assertions = []
  return {
    expect(name, condition) { assertions.push({ name, passed: Boolean(condition) }); return Boolean(condition) },
    finish(extra = {}) { return { assertions, passed: assertions.length > 0 && assertions.every(item => item.passed),
      status: extra.status, modelCalls: extra.modelCalls ?? 0, toolCalls: extra.toolCalls ?? 0,
      embeddingCalls: extra.embeddingCalls ?? 0, mcpCalls: extra.mcpCalls ?? 0,
      providerUnits: extra.providerUnits ?? 0, dbFacts: {
        resourceDelta: extra.dbFacts?.resourceDelta ?? 0,
        crossUserLeaks: extra.dbFacts?.crossUserLeaks ?? 0,
        duplicateWrites: extra.dbFacts?.duplicateWrites ?? 0,
        unapprovedWrites: extra.dbFacts?.unapprovedWrites ?? 0,
      }, counters: extra.counters ?? {}, errorCategory: extra.errorCategory } },
  }
}
export const goal = '根据我自己的 Git 恢复版本资料整理研究笔记，保存前让我确认。'
export const runPath = id => `/api/agent/runs/${id}`
export const begin = (ctx, user, demo = 'research_workflow') =>
  ctx.post('/api/agent/runs', user.cookie, { goal, demo })
