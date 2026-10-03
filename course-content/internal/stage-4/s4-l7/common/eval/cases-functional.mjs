import { probe, goal, begin, runPath } from './probe.mjs'

export const functionalCases = [
  { id: 'direct-answer', category: 'functional', title: 'Direct answer', mode: 'deterministic', subcases: ['direct'],
    async execute(ctx) {
      const p = probe(), user = await ctx.user(), before = await ctx.resourceCount(user.id)
      const response = await ctx.post('/api/agent/run', user.cookie, { goal: 'Git', demo: 'direct' })
      p.expect('completed', response.data.status === 'completed')
      p.expect('one model, zero tools', response.data.modelCalls === 1 && response.data.toolCalls === 0)
      p.expect('nonempty answer', typeof response.data.answer === 'string' && response.data.answer.length > 0)
      const delta = await ctx.resourceCount(user.id) - before
      p.expect('no Resource write', delta === 0)
      return p.finish({ ...response.data, dbFacts: { resourceDelta: delta } })
    } },
  { id: 'read-only-tool', category: 'functional', title: 'Echo read tool', mode: 'deterministic', subcases: ['echo execution', 'no write'],
    async execute(ctx) {
      const p = probe(), user = await ctx.user(), before = await ctx.resourceCount(user.id)
      const response = await ctx.post('/api/agent/run', user.cookie, { goal: 'Git', demo: 'tool' })
      p.expect('completed', response.data.status === 'completed')
      p.expect('two models, one read tool', response.data.modelCalls === 2 && response.data.toolCalls === 1)
      const delta = await ctx.resourceCount(user.id) - before
      p.expect('no Resource write', delta === 0)
      return p.finish({ ...response.data, dbFacts: { resourceDelta: delta } })
    } },
  { id: 'private-knowledge', category: 'functional', title: 'Own knowledge search', mode: 'database', subcases: ['owner result', 'safe summary'],
    async execute(ctx) {
      const p = probe(), user = await ctx.user()
      await ctx.seed(user.id, 'Alice Git fixture', 'Git reflog 可以找回旧引用。')
      const response = await ctx.post('/api/agent/run', user.cookie, { goal: 'Git 恢复版本', demo: 'knowledge_search' })
      const matches = response.data.searchMatches ?? []
      p.expect('completed search', response.data.status === 'completed' && response.data.toolCalls === 1)
      p.expect('own document returned', matches.some(item => item.title === 'Alice Git fixture'))
      p.expect('only safe result fields', matches.every(item => Object.keys(item).sort().join(',') === 'position,preview,similarity,title'))
      return p.finish({ ...response.data })
    } },
  { id: 'mcp-read', category: 'functional', title: 'MCP read reference', mode: 'stub', subcases: ['modern transport', 'safe output', 'no write'],
    async execute(ctx) {
      const p = probe(), user = await ctx.user(), before = await ctx.resourceCount(user.id)
      const response = await ctx.post('/api/agent/run', user.cookie, { goal: 'RAG', demo: 'mcp_reference' })
      p.expect('completed MCP read', response.data.status === 'completed' && response.data.mcpCalls === 1)
      p.expect('safe reference shape', response.data.mcpReference?.referenceId?.startsWith('ref-') &&
        Object.keys(response.data.mcpReference).sort().join(',') === 'referenceId,summary,topic')
      const delta = await ctx.resourceCount(user.id) - before
      p.expect('no Resource write', delta === 0)
      return p.finish({ ...response.data, dbFacts: { resourceDelta: delta } })
    } },
  { id: 'persisted-workflow', category: 'functional', title: 'Search to persistent proposal', mode: 'database',
    subcases: ['ordered steps', 'waiting action', 'zero write'], async execute(ctx) {
      const p = probe(), user = await ctx.user()
      await ctx.seed(user.id, 'Own Git evidence', 'Git reflog 记录引用移动。')
      const before = await ctx.resourceCount(user.id), response = await begin(ctx, user)
      const run = response.data
      p.expect('created waiting Run', response.code === 201 && run.status === 'waiting_approval')
      p.expect('ordered model/tool/model/approval', run.timeline?.map(item => item.kind).join('/') === 'model/tool/model/approval')
      const action = run.id ? await ctx.db.agentAction.findFirst({ where: { runId: run.id } }) : null
      p.expect('one proposed Action', action?.status === 'proposed')
      const delta = await ctx.resourceCount(user.id) - before
      p.expect('zero write before approval', delta === 0)
      return p.finish({ status: run.status, modelCalls: 2, toolCalls: 1, embeddingCalls: 1,
        dbFacts: { resourceDelta: delta, unapprovedWrites: Math.max(0, delta) } })
    } },
  { id: 'approved-exact-write', category: 'functional', title: 'Approved exact write', mode: 'database',
    subcases: ['exact title', 'exact content', 'action executed', 'run complete'], async execute(ctx) {
      const p = probe(), user = await ctx.user(), start = await begin(ctx, user)
      const before = await ctx.resourceCount(user.id)
      const confirmed = await ctx.post('/api/agent/confirm', user.cookie,
        { approvalToken: start.data.proposal?.approvalToken })
      const action = await ctx.db.agentAction.findFirst({ where: { runId: start.data.id } })
      const run = await ctx.db.agentRun.findUnique({ where: { id: start.data.id } })
      const delta = await ctx.resourceCount(user.id) - before
      p.expect('confirmed once', confirmed.code === 201 && delta === 1)
      p.expect('exact signed title/content', confirmed.data.saved?.title === start.data.proposal?.title &&
        confirmed.data.saved?.desc === start.data.proposal?.content)
      p.expect('Action executed, Run completed', action?.status === 'executed' && run?.status === 'completed')
      p.expect('zero model on Confirm', confirmed.data.modelCalls === 0)
      return p.finish({ status: run?.status, dbFacts: { resourceDelta: delta, duplicateWrites: Math.max(0, delta - 1) } })
    } },
  { id: 'restart-recovery', category: 'reliability', title: 'Waiting proposal survives restart', mode: 'database',
    subcases: ['same Run', 'same proposal', 'fresh token'], async execute(ctx) {
      const p = probe(), user = await ctx.user(), started = await begin(ctx, user)
      await ctx.restart()
      const restored = await ctx.get(runPath(started.data.id), user.cookie)
      p.expect('same waiting Run after restart', restored.code === 200 && restored.data.id === started.data.id &&
        restored.data.status === 'waiting_approval')
      p.expect('proposal restored', restored.data.proposal?.title === started.data.proposal?.title)
      p.expect('fresh V2 token', restored.data.proposal?.approvalToken !== started.data.proposal?.approvalToken)
      return p.finish({ status: restored.data.status })
    } },
  { id: 'paused-resume', category: 'reliability', title: 'Paused Run resumes from safe checkpoint', mode: 'database',
    subcases: ['recoverable pause', 'resume', 'no premature write'], async execute(ctx) {
      const p = probe(), user = await ctx.user(), before = await ctx.resourceCount(user.id)
      const paused = await begin(ctx, user, 'persistent_provider_failure')
      p.expect('paused with failed Step', paused.data.status === 'paused' &&
        paused.data.timeline?.some(step => step.errorCategory === 'UPSTREAM'))
      const resumed = await ctx.post(runPath(paused.data.id) + '/resume', user.cookie, {})
      p.expect('resume reaches waiting', resumed.code === 200 && resumed.data.status === 'waiting_approval')
      const delta = await ctx.resourceCount(user.id) - before
      p.expect('no write before approval', delta === 0)
      return p.finish({ status: resumed.data.status, dbFacts: { resourceDelta: delta, unapprovedWrites: Math.max(0, delta) },
        counters: { resumeSuccess: Number(resumed.code === 200) } })
    } },
]
