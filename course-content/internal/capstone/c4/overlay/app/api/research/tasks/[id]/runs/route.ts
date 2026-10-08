import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { currentSession, rejectCrossOriginWrite, unauthorized, unavailable } from '@/lib/auth'
import { citationSnapshots, insufficientReport, validateGroundedReport } from '@/lib/grounded-report'
import { retrieveKnowledgeEvidence } from '@/lib/knowledge-retrieval'
import { prisma } from '@/lib/prisma'
import { generateReport, ReportProviderError } from '@/lib/report-provider'
import { workspaceForUser } from '@/lib/workspace'

export const dynamic = 'force-dynamic'
const headers = { 'Cache-Control': 'no-store' }
const idSchema = z.coerce.number().int().positive()

async function ownedTask(request: NextRequest, rawId: string) {
  const session = await currentSession(request)
  if (!session) return { error: unauthorized() }
  const parsed = idSchema.safeParse(rawId)
  if (!parsed.success) return { error: NextResponse.json({ error: '任务不存在。' }, { status: 404, headers }) }
  const workspace = await workspaceForUser(session.userId)
  if (!workspace) return { error: unavailable() }
  const task = await prisma.researchTask.findFirst({ where: { id: parsed.data, workspaceId: workspace.id } })
  if (!task) return { error: NextResponse.json({ error: '任务不存在。' }, { status: 404, headers }) }
  return { task, workspace }
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const owned = await ownedTask(request, (await context.params).id)
    if (owned.error) return owned.error
    const runs = await prisma.researchRun.findMany({ where: { taskId: owned.task!.id },
      select: { id: true, status: true, stopReason: true, errorCode: true, createdAt: true, completedAt: true },
      orderBy: { createdAt: 'desc' }, take: 20 })
    return NextResponse.json({ task: owned.task, runs }, { headers })
  } catch (error) {
    console.error('读取研究运行失败：', error instanceof Error ? error.name : 'unknown')
    return unavailable()
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const rejected = rejectCrossOriginWrite(request)
  if (rejected) return rejected
  let runId: number | undefined
  try {
    const owned = await ownedTask(request, (await context.params).id)
    if (owned.error) return owned.error
    let body: unknown = {}
    const text = await request.text()
    if (text.length > 100) return NextResponse.json({ error: '不接受客户端运行参数。' }, { status: 400, headers })
    if (text) { try { body = JSON.parse(text) } catch { return NextResponse.json({ error: '请求格式无效。' }, { status: 400, headers }) } }
    if (!z.object({}).strict().safeParse(body).success) return NextResponse.json({ error: '不接受客户端运行参数。' }, { status: 400, headers })
    const run = await prisma.researchRun.create({ data: { taskId: owned.task!.id, status: 'RUNNING' } })
    runId = run.id
    const evidence = await retrieveKnowledgeEvidence({ workspaceId: owned.workspace!.id, query: owned.task!.query })
    if (!evidence.length) {
      const completed = await prisma.researchRun.update({ where: { id: runId }, data: {
        status: 'COMPLETED', stopReason: 'INSUFFICIENT_EVIDENCE', report: insufficientReport(), completedAt: new Date() } })
      return NextResponse.json({ runId: completed.id, status: completed.status, stopReason: completed.stopReason }, { status: 201, headers })
    }
    const raw = await generateReport(owned.task!.query, evidence)
    const { report, cited } = validateGroundedReport(raw, evidence)
    await prisma.$transaction(async tx => {
      if (cited.length) await tx.researchCitation.createMany({ data: citationSnapshots(cited).map(item => ({ ...item, runId: runId! })) })
      await tx.researchRun.update({ where: { id: runId }, data: {
        status: 'COMPLETED', stopReason: report.answerability === 'insufficient_evidence' ? 'INSUFFICIENT_EVIDENCE' : null,
        report, completedAt: new Date() } })
    })
    return NextResponse.json({ runId, status: 'COMPLETED', stopReason: report.answerability === 'insufficient_evidence' ? 'INSUFFICIENT_EVIDENCE' : null }, { status: 201, headers })
  } catch (error) {
    if (runId) {
      const errorCode = error instanceof ReportProviderError ? 'REPORT_PROVIDER_FAILED' : 'REPORT_VALIDATION_FAILED'
      try { await prisma.researchRun.update({ where: { id: runId }, data: { status: 'FAILED', errorCode, completedAt: new Date() } }) }
      catch { console.error('运行失败状态写入失败') }
      return NextResponse.json({ runId, status: 'FAILED', errorCode, error: '报告未通过验证或生成失败。' }, { status: 502, headers })
    }
    console.error('创建研究运行失败：', error instanceof Error ? error.name : 'unknown')
    return unavailable()
  }
}
