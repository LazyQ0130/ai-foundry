import type { KnowledgeEvidence } from './knowledge-retrieval'
import type { ResearchBrief } from './research-brief-provider'
import type { ModelDecision, ToolObservation } from './research-model'
import { validateResearchToolCalls, ToolCallError } from './research-tools'

export const MAX_AGENT_STEPS = 4
export const MAX_TOOL_CALLS = 3
export const RUN_DEADLINE_MS = 120_000
export const MAX_PROVIDER_UNITS = 10
export type RuntimeOutcome = 'READY' | 'INSUFFICIENT_EVIDENCE' | 'MAX_STEPS' | 'MAX_TOOLS' |
  'BUDGET_EXHAUSTED' | 'TIMEOUT' | 'CANCELLED' | 'FAILED'
export type RuntimeResult = { outcome: RuntimeOutcome; evidence: KnowledgeEvidence[]; toolCalls: number; modelCalls: number; errorCode?: string }

export async function runResearchRuntime(options: {
  query: string; brief: ResearchBrief; signal: AbortSignal; deadlineAt: number
  maxSteps?: number; maxTools?: number
  reserveUnit: () => boolean
  beforeAction: () => Promise<void>
  decide: (turn: number, observations: ToolObservation[]) => Promise<ModelDecision>
  search: (args: { query: string }) => Promise<KnowledgeEvidence[]>
  startStep: (kind: 'MODEL' | 'TOOL', inputSummary: string, toolName?: string) => Promise<number>
  completeStep: (id: number, outputSummary: string) => Promise<void>
  failStep: (id: number, code: string) => Promise<void>
}): Promise<RuntimeResult> {
  const maxSteps = options.maxSteps ?? MAX_AGENT_STEPS
  const maxTools = options.maxTools ?? MAX_TOOL_CALLS
  if (!Number.isInteger(maxSteps) || maxSteps < 1 || maxSteps > MAX_AGENT_STEPS ||
      !Number.isInteger(maxTools) || maxTools < 1 || maxTools > MAX_TOOL_CALLS) throw new Error('INVALID_LIMIT')
  const evidence = new Map<string, KnowledgeEvidence>()
  const observations: ToolObservation[] = []
  let toolCalls = 0
  let modelCalls = 0
  const result = (outcome: RuntimeOutcome, errorCode?: string): RuntimeResult =>
    ({ outcome, errorCode, evidence: [...evidence.values()], toolCalls, modelCalls })
  const guard = async () => {
    if (options.signal.aborted) throw new Error('CANCELLED')
    if (Date.now() >= options.deadlineAt) throw new Error('TIMEOUT')
    await options.beforeAction()
    if (options.signal.aborted) throw new Error('CANCELLED')
  }
  for (let turn = 0; turn < maxSteps; turn++) {
    try { await guard() } catch (error) { return result(error instanceof Error && error.message === 'TIMEOUT' ? 'TIMEOUT' : 'CANCELLED') }
    if (!options.reserveUnit()) return result('BUDGET_EXHAUSTED')
    const modelStep = await options.startStep('MODEL', `研究决策 ${turn + 1}`)
    let decision: ModelDecision
    try {
      modelCalls++
      decision = await options.decide(turn, observations)
      await guard()
    } catch (error) {
      const code = error instanceof Error ? error.message : 'MODEL_FAILED'
      await options.failStep(modelStep, code === 'CANCELLED' ? 'CANCELLED' : code === 'TIMEOUT' ? 'TIMEOUT' : 'MODEL_FAILED')
      return result(code === 'CANCELLED' ? 'CANCELLED' : code === 'TIMEOUT' ? 'TIMEOUT' : 'FAILED',
        code === 'CANCELLED' ? undefined : code === 'TIMEOUT' ? 'TIMEOUT' : 'MODEL_FAILED')
    }
    if (decision.type === 'ready') {
      await options.completeStep(modelStep, '证据足够，准备综合')
      return result(evidence.size ? 'READY' : 'INSUFFICIENT_EVIDENCE')
    }
    let args: { query: string }
    try { args = validateResearchToolCalls(decision.toolCalls) }
    catch (error) {
      const code = error instanceof ToolCallError ? error.message : 'INVALID_TOOL_CALL'
      await options.failStep(modelStep, code)
      return result('FAILED', code)
    }
    await options.completeStep(modelStep, '提议只读检索；参数已通过服务端校验')
    if (toolCalls >= maxTools) return result('MAX_TOOLS')
    try { await guard() } catch (error) { return result(error instanceof Error && error.message === 'TIMEOUT' ? 'TIMEOUT' : 'CANCELLED') }
    if (!options.reserveUnit()) return result('BUDGET_EXHAUSTED')
    const toolStep = await options.startStep('TOOL', `query: ${args.query.slice(0, 300)}`, 'search_knowledge')
    try {
      toolCalls++
      const matches = await options.search(args)
      await guard()
      for (const item of matches) if (!evidence.has(item.citationKey) && evidence.size < 5) evidence.set(item.citationKey, item)
      observations.push({ query: args.query, matchCount: matches.length,
        evidence: matches.slice(0, 5).map(item => ({ citationKey: item.citationKey, title: item.title,
          content: item.content.slice(0, 500), page: item.page })) })
      await options.completeStep(toolStep, `${matches.length} 条命中；引用 ${matches.slice(0, 5).map(item => item.citationKey).join(', ')}`.slice(0, 500))
    } catch (error) {
      const code = error instanceof Error ? error.message : 'TOOL_FAILED'
      await options.failStep(toolStep, code === 'CANCELLED' ? 'CANCELLED' : code === 'TIMEOUT' ? 'TIMEOUT' : 'TOOL_FAILED')
      return result(code === 'CANCELLED' ? 'CANCELLED' : code === 'TIMEOUT' ? 'TIMEOUT' : 'FAILED',
        code === 'CANCELLED' ? undefined : code === 'TIMEOUT' ? 'TIMEOUT' : 'TOOL_FAILED')
    }
  }
  return result('MAX_STEPS')
}
