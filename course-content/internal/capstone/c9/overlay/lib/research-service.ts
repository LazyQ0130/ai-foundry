import { serverLog } from './server-log'
import { approvedExternalQuery, externalInput, type SourcePolicy } from './external-contract'
import { searchExternalMcp } from './external-research-mcp'
import { prisma } from './prisma'
import { citationSnapshots, insufficientReport, validateGroundedReport } from './grounded-report'
import { generateReport } from './report-provider'
import { generateResearchBrief } from './research-brief-provider'
import { decideResearchAction } from './research-model'
import { MAX_PROVIDER_UNITS, RUN_DEADLINE_MS, runResearchRuntime, type RuntimeOutcome } from './research-runtime'
import { searchKnowledgeTool } from './research-tools'

const processState = globalThis as typeof globalThis & { __c5ActiveRuns?: Map<number, AbortController> }
const activeRuns = processState.__c5ActiveRuns ??= new Map<number, AbortController>()
export function abortActiveResearchRun(runId: number) { activeRuns.get(runId)?.abort() }
export type WorkflowResult = { runId: number; status: string; stopReason: string | null; errorCode: string | null }

export async function runResearchWorkflow(task: { id: number; query: string }, workspaceId: number, sourcePolicy: SourcePolicy = 'PRIVATE_ONLY'): Promise<WorkflowResult> {
  const run = await prisma.researchRun.create({ data: { taskId: task.id, sourcePolicy, status: 'RUNNING' } })
  const workflowStarted = Date.now()
  serverLog('research_started', {runId:run.id,status:'RUNNING'})
  const controller = new AbortController()
  activeRuns.set(run.id, controller)
  let timedOut = false
  const timer = setTimeout(() => { timedOut = true; controller.abort() }, RUN_DEADLINE_MS)
  const deadlineAt = Date.now() + RUN_DEADLINE_MS
  let units = 0
  let position = 0
  const started = new Map<number, number>()
  const testScenario = process.env.C5_MOCK_TEST_SCENARIOS === '1' ? task.query.match(/\[C5_TEST:([a-z_]+)\]/)?.[1] : undefined
  const unitLimit = testScenario === 'budget_exhausted' ? 1 : MAX_PROVIDER_UNITS
  const reserveUnit = () => { if (units >= unitLimit) return false; units++; return true }
  const guard = async () => {
    if (timedOut || Date.now() >= deadlineAt) throw new Error('TIMEOUT')
    if (controller.signal.aborted) throw new Error('CANCELLED')
    const current = await prisma.researchRun.findUnique({ where: { id: run.id }, select: { status: true, cancelRequestedAt: true } })
    if (!current || current.status !== 'RUNNING' || current.cancelRequestedAt) throw new Error('CANCELLED')
  }
  const startStep = async (kind: 'BRIEF' | 'MODEL' | 'TOOL' | 'REPORT', inputSummary: string, toolName?: string) => {
    const step = await prisma.researchStep.create({ data: { runId: run.id, position: ++position, kind, status: 'RUNNING',
      inputSummary: inputSummary.slice(0, 500), toolName } })
    started.set(step.id, Date.now())
    return step.id
  }
  const finishStep = async (id: number, status: 'COMPLETED' | 'FAILED' | 'CANCELLED', outputSummary?: string, errorCode?: string) => {
    await prisma.researchStep.update({ where: { id }, data: { status, outputSummary: outputSummary?.slice(0, 500),
      errorCode, latencyMs: Math.max(0, Date.now() - (started.get(id) ?? Date.now())), completedAt: new Date() } })
    serverLog('research_step_finished', {runId:run.id,step:id,status,errorCode,latencyMs:Date.now()-(started.get(id)??Date.now())})
  }
  const currentResult = async (): Promise<WorkflowResult> => {
    const current = await prisma.researchRun.findUniqueOrThrow({ where: { id: run.id } })
    serverLog('research_finished', {runId:run.id,status:current.status,errorCode:current.errorCode,latencyMs:Date.now()-workflowStarted})
    return { runId: run.id, status: current.status, stopReason: current.stopReason, errorCode: current.errorCode }
  }
  const endRun = async (status: 'COMPLETED' | 'FAILED' | 'CANCELLED', stopReason: string | null, errorCode: string | null,
    report?: ReturnType<typeof insufficientReport>): Promise<WorkflowResult> => {
    await prisma.researchRun.updateMany({ where: { id: run.id, status: 'RUNNING' }, data: {
      status, stopReason, errorCode, completedAt: new Date(), ...(report ? { report } : {}) } })
    return currentResult()
  }
  try {
    await guard()
    if (!reserveUnit()) return endRun('FAILED', 'BUDGET_EXHAUSTED', null)
    const briefStep = await startStep('BRIEF', `研究目标：${task.query.slice(0, 450)}`)
    let brief
    try {
      brief = await generateResearchBrief(task.query, controller.signal)
      await guard()
      await prisma.researchRun.update({ where: { id: run.id }, data: { brief } })
      await finishStep(briefStep, 'COMPLETED', `目标已拆为 ${brief.subquestions.length} 个子问题`)
    } catch {
      const code = timedOut ? 'TIMEOUT' : controller.signal.aborted ? 'CANCELLED' : 'BRIEF_FAILED'
      await finishStep(briefStep, code === 'CANCELLED' ? 'CANCELLED' : 'FAILED', undefined, code)
      return endRun(code === 'CANCELLED' ? 'CANCELLED' : 'FAILED', code, code === 'BRIEF_FAILED' ? code : null)
    }
    const runtime = await runResearchRuntime({
      query: task.query, brief, sourcePolicy, externalQuery: approvedExternalQuery(task.query), signal: controller.signal, deadlineAt,
      maxSteps: testScenario === 'max_steps' ? 2 : undefined,
      reserveUnit, beforeAction: guard,
      decide: (turn, observations) => decideResearchAction({ query: task.query, brief, turn, observations, sourcePolicy, signal: controller.signal }),
      search: async args => {
        if (testScenario === 'tool_error') throw new Error('TOOL_FAILED')
        return searchKnowledgeTool(args, { workspaceId, signal: controller.signal })
      },
      externalSearch: async args => {
        // Server enforces provenance of outgoing words: private observations cannot add terms.
        const { query } = externalInput.parse(args)
        if (query !== approvedExternalQuery(task.query)) throw new Error('EXTERNAL_QUERY_REJECTED')
        return searchExternalMcp({ query }, controller.signal)
      },
      startStep, completeStep: (id, summary) => finishStep(id, 'COMPLETED', summary),
      failStep: (id, code) => finishStep(id, code === 'CANCELLED' ? 'CANCELLED' : 'FAILED', undefined, code),
    })
    if (runtime.outcome === 'INSUFFICIENT_EVIDENCE')
      return endRun('COMPLETED', 'INSUFFICIENT_EVIDENCE', null, insufficientReport())
    if (runtime.outcome !== 'READY') {
      const outcome: RuntimeOutcome = runtime.outcome
      return endRun(outcome === 'CANCELLED' ? 'CANCELLED' : 'FAILED', outcome === 'FAILED' ? null : outcome,
        runtime.errorCode ?? (outcome === 'FAILED' ? 'WORKFLOW_FAILED' : null))
    }
    await guard()
    if (!reserveUnit()) return endRun('FAILED', 'BUDGET_EXHAUSTED', null)
    const reportStep = await startStep('REPORT', `使用 ${runtime.evidence.length} 条去重证据生成结构化报告`)
    try {
      const raw = await generateReport(task.query, runtime.evidence, controller.signal)
      const { report, cited } = validateGroundedReport(raw, runtime.evidence)
      await guard()
      // Lock the Run row so a concurrent cancel cannot turn a cancelled run into a completed report.
      await prisma.$transaction(async tx => {
        const locked = await tx.$queryRaw<{ status: string; cancelRequestedAt: Date | null }[]>`
          SELECT "status", "cancelRequestedAt" FROM "ResearchRun" WHERE "id" = ${run.id} FOR UPDATE`
        if (locked[0]?.status !== 'RUNNING' || locked[0]?.cancelRequestedAt) throw new Error('CANCELLED')
        if (cited.length) await tx.researchCitation.createMany({ data: citationSnapshots(cited).map(item => ({ ...item, runId: run.id })) })
        await tx.researchRun.update({ where: { id: run.id }, data: { report, status: 'COMPLETED',
          stopReason: report.answerability === 'insufficient_evidence' ? 'INSUFFICIENT_EVIDENCE' : null, completedAt: new Date() } })
      })
      await finishStep(reportStep, 'COMPLETED', `${cited.length} 条历史 Citation 已保存`)
      return currentResult()
    } catch (error) {
      const code = timedOut ? 'TIMEOUT' : controller.signal.aborted || (error instanceof Error && error.message === 'CANCELLED') ? 'CANCELLED' : 'REPORT_FAILED'
      await finishStep(reportStep, code === 'CANCELLED' ? 'CANCELLED' : 'FAILED', undefined, code)
      return endRun(code === 'CANCELLED' ? 'CANCELLED' : 'FAILED', code === 'REPORT_FAILED' ? null : code,
        code === 'REPORT_FAILED' ? code : null)
    }
  } catch (error) {
    const code = timedOut ? 'TIMEOUT' : controller.signal.aborted || (error instanceof Error && error.message === 'CANCELLED') ? 'CANCELLED' : 'WORKFLOW_FAILED'
    return endRun(code === 'CANCELLED' ? 'CANCELLED' : 'FAILED', code === 'WORKFLOW_FAILED' ? null : code,
      code === 'WORKFLOW_FAILED' ? code : null)
  } finally {
    clearTimeout(timer)
    activeRuns.delete(run.id)
  }
}
