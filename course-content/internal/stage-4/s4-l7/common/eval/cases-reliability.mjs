import { runAgent } from '../lib/agent-runtime.ts'
import { mockWorkflowTurn } from '../lib/workflow-mock.ts'
import { modelTools, searchKnowledge, ToolBudgetExhaustedError } from '../lib/agent-tools.ts'
import { callResearchReference } from '../lib/mcp-reference-adapter.ts'
import { issueMcpBearer } from '../lib/mcp-reference-auth.ts'
import { probe, begin, runPath } from './probe.mjs'

const tools = modelTools.filter(item => ['search_knowledge', 'save_research_note'].includes(item.function.name))
const sample = { title: 'Safe Git fixture', position: 0, preview: 'Git reflog 可查找引用。', similarity: 0.9 }
const workflow = (extra = {}) => runAgent({ goal: 'Git 恢复版本', userId: 17, availableTools: tools,
  reserve: () => true, reserveEmbedding: () => true, issueApproval: () => 'test-only-marker',
  model: async messages => mockWorkflowTurn(messages, false), ...extra })
async function withFakeSearch(body) {
  const original = searchKnowledge.execute
  searchKnowledge.execute = async (_input, context) => {
    if (!context.reserveProviderUnit?.('embedding')) throw new ToolBudgetExhaustedError()
    if (context.signal?.aborted) throw new Error('CANCELLED')
    context.onEmbeddingStart?.()
    return { matches: [sample] }
  }
  try { return await body() } finally { searchKnowledge.execute = original }
}

export const reliabilityCases = [
  { id: 'stop-and-recovery', category: 'reliability', title: 'Limits, timeouts, cancel and recovery', mode: 'database',
    subcases: ['max steps', 'max tools', 'first model budget', 'embedding budget', 'second model budget',
      'provider timeout', 'embedding timeout', 'MCP timeout', 'pre-model cancel', 'mid-embedding cancel',
      'after-search cancel', 'concurrent Resume', 'transaction rollback', 'MCP auth/rate'],
    async execute(ctx) {
      const p = probe()
      await withFakeSearch(async () => {
        const loop = await workflow({ model: async messages => mockWorkflowTurn(messages, true) })
        p.expect('loop stops at maxToolCalls=3', loop.status === 'max_tools' && loop.toolCalls === 3)
        const steps = await workflow({ model: async messages => mockWorkflowTurn(messages, true), maxAgentSteps: 2 })
        p.expect('loop stops at maxAgentSteps=2', steps.status === 'max_steps' && steps.modelCalls === 2)
        const first = await workflow({ reserve: () => false })
        p.expect('first model budget blocks all work', first.status === 'budget_exhausted' &&
          first.modelCalls === 0 && first.embeddingCalls === 0 && first.toolCalls === 0)
        const embedding = await workflow({ reserveEmbedding: () => false })
        p.expect('embedding budget blocks search', embedding.status === 'budget_exhausted' &&
          embedding.modelCalls === 1 && embedding.embeddingCalls === 0 && embedding.toolCalls === 0)
        let reservations = 0
        const final = await workflow({ reserve: () => ++reservations === 1 })
        p.expect('second model budget stops after one read', final.status === 'budget_exhausted' &&
          final.modelCalls === 1 && final.embeddingCalls === 1 && final.toolCalls === 1 && !final.proposal)
        const providerTimeout = await workflow({ model: async () => { throw new Error('TIMEOUT') } })
        p.expect('Provider timeout starts no later work', providerTimeout.status === 'failed' &&
          providerTimeout.modelCalls === 0 && providerTimeout.toolCalls === 0)
        const pre = new AbortController(); pre.abort()
        const cancelled = await workflow({ signal: pre.signal })
        p.expect('pre-model cancel starts nothing', cancelled.status === 'cancelled' && cancelled.modelCalls === 0)
        const after = new AbortController(); let afterReservations = 0
        const afterSearch = await workflow({ signal: after.signal, reserve: () => {
          if (++afterReservations === 2) after.abort(); return true
        } })
        p.expect('after-search cancel has no second model or proposal', afterSearch.status === 'cancelled' &&
          afterSearch.modelCalls === 1 && !afterSearch.proposal)
      })
      const original = searchKnowledge.execute
      try {
        searchKnowledge.execute = async (_input, context) => {
          context.reserveProviderUnit('embedding'); context.onEmbeddingStart()
          throw new Error('EMBEDDING_TIMEOUT')
        }
        const timeout = await workflow()
        p.expect('Embedding timeout starts no second model', timeout.status === 'failed' &&
          timeout.modelCalls === 1 && timeout.toolCalls === 0 && !timeout.proposal)
        const mid = new AbortController()
        searchKnowledge.execute = async (_input, context) => {
          context.reserveProviderUnit('embedding'); context.onEmbeddingStart(); mid.abort()
          throw new Error('CANCELLED')
        }
        const cancelled = await workflow({ signal: mid.signal })
        p.expect('mid-embedding cancel starts no later work', cancelled.status === 'cancelled' &&
          cancelled.modelCalls === 1 && cancelled.toolCalls === 0)
      } finally { searchKnowledge.execute = original }
      let mcpCalls = 0, mcpTimedOut = false
      try { await callResearchReference({
        listTools: async () => ({ tools: [{ name: 'research_reference' }] }),
        callTool: async () => { mcpCalls++; throw new Error('MCP_TIMEOUT') },
      }, 'Git', {}) } catch { mcpTimedOut = true }
      p.expect('MCP timeout returns no result or write', mcpTimedOut && mcpCalls === 1)

      const user = await ctx.user(), paused = await begin(ctx, user, 'persistent_provider_failure')
      const resumes = await Promise.all([ctx.post(runPath(paused.data.id) + '/resume', user.cookie, {}),
        ctx.post(runPath(paused.data.id) + '/resume', user.cookie, {})])
      const actions = await ctx.db.agentAction.count({ where: { runId: paused.data.id } })
      const steps = await ctx.db.agentStep.findMany({ where: { runId: paused.data.id } })
      p.expect('concurrent Resume has one winner', resumes.map(x => x.code).sort().join(',') === '200,409' && actions === 1)
      p.expect('one resumed provider sequence', steps.filter(x => x.kind === 'tool' && x.status === 'completed').length === 1)

      const rollbackUser = await ctx.user(), started = await begin(ctx, rollbackUser)
      const action = await ctx.db.agentAction.findFirst({ where: { runId: started.data.id } })
      process.env.DATABASE_URL = process.env.TEST_DATABASE_URL
      const { confirmPersistedAction } = await import('../lib/agent-confirm-transaction.ts')
      let threw = false
      try { await confirmPersistedAction({ token: started.data.proposal.approvalToken,
        ownerId: rollbackUser.id, secret: ctx.secret, afterResourceCreate: () => { throw new Error('TEST_ROLLBACK') } }) }
      catch (error) { threw = error instanceof Error && error.message === 'TEST_ROLLBACK' }
      const count = await ctx.db.resource.count({ where: { agentActionKey: action.idempotencyKey } })
      const state = await ctx.db.agentAction.findUnique({ where: { id: action.id } })
      p.expect('transaction rollback leaves no half-write', threw && count === 0 && state?.status === 'proposed')
      const confirmed = await ctx.post('/api/agent/confirm', rollbackUser.cookie,
        { approvalToken: started.data.proposal.approvalToken })
      p.expect('normal retry commits one Resource', confirmed.code === 201 &&
        await ctx.db.resource.count({ where: { agentActionKey: action.idempotencyKey } }) === 1)
      await ctx.restart() // also resets this lesson's per-process MCP request guard
      const rpc = JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'server/discover',
        params: { supportedVersions: ['2026-07-28'] } })
      const mcpRequest = authorization => fetch(ctx.base + '/api/mcp/reference', { method: 'POST', headers: {
        ...(authorization ? { Authorization: authorization } : {}),
        'Content-Type': 'application/json', Accept: 'application/json, text/event-stream',
      }, body: rpc })
      const unauthenticated = await mcpRequest(null)
      await unauthenticated.arrayBuffer()
      p.expect('MCP auth rejects missing bearer', unauthenticated.status === 401)
      const bearer = `Bearer ${issueMcpBearer(ctx.mcpSecret)}`
      let allowed = 0
      for (let i = 0; i < 60; i++) {
        const response = await mcpRequest(bearer)
        if (response.status !== 429) allowed++
        await response.arrayBuffer()
      }
      const limited = await mcpRequest(bearer)
      await limited.arrayBuffer()
      p.expect('MCP 60 requests then 429', allowed === 60 && limited.status === 429)
      return p.finish({ status: 'observed', counters: { limitEnforcement: 2, timeoutHandled: 3,
        cancelHandled: 3, resumeSuccess: Number(resumes.some(x => x.code === 200)) },
        dbFacts: { duplicateWrites: 0, unapprovedWrites: 0 } })
    } },
]
