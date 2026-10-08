import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { currentSession, unauthorized, unavailable } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { workspaceForUser } from '@/lib/workspace'

export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest, context: { params: Promise<{ runId: string }> }) {
  try {
    const session = await currentSession(request)
    if (!session) return unauthorized()
    const parsed = z.coerce.number().int().positive().safeParse((await context.params).runId)
    if (!parsed.success) return NextResponse.json({ error: '运行不存在。' }, { status: 404 })
    const workspace = await workspaceForUser(session.userId)
    if (!workspace) return unavailable()
    const run = await prisma.researchRun.findFirst({ where: { id: parsed.data, task: { workspaceId: workspace.id } },
      include: { citations: { orderBy: { position: 'asc' } }, steps: { orderBy: { position: 'asc' } },
        task: { select: { id: true, title: true, query: true } } } })
    if (!run) return NextResponse.json({ error: '运行不存在。' }, { status: 404 })
    const ids = run.citations.flatMap(item => item.documentId ? [item.documentId] : [])
    const live = await prisma.knowledgeDocument.findMany({ where: { id: { in: ids }, workspaceId: workspace.id }, select: { id: true } })
    const available = new Set(live.map(item => item.id))
    return NextResponse.json({ run: { id: run.id, task: run.task, status: run.status,
      sourcePolicy: run.sourcePolicy, stopReason: run.stopReason, errorCode: run.errorCode, brief: run.brief, report: run.report,
      cancelRequestedAt: run.cancelRequestedAt, createdAt: run.createdAt, completedAt: run.completedAt },
      steps: run.steps.map(item => ({ position: item.position, kind: item.kind, status: item.status,
        toolName: item.toolName, inputSummary: item.inputSummary, outputSummary: item.outputSummary,
        latencyMs: item.latencyMs, errorCode: item.errorCode, startedAt: item.startedAt, completedAt: item.completedAt })),
      actionId: (await prisma.researchAction.findUnique({ where: { runId: run.id }, select: { id: true } }))?.id ?? null,
      citations: run.citations.map(item => ({ position: item.position, citationKey: item.citationKey,
        sourceType: item.sourceType, externalId: item.externalId, sourceUrl: item.sourceUrl,
        publishedYear: item.publishedYear, sourceVersion: item.sourceVersion, supportLevel: item.supportLevel, title: item.title, excerpt: item.excerpt,
        page: item.page, startOffset: item.startOffset, endOffset: item.endOffset,
        sourceContentHash: item.sourceContentHash, sourceIndexingVersion: item.sourceIndexingVersion,
        sourceAvailable: !!item.documentId && available.has(item.documentId), documentId: item.documentId })) },
      { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('读取研究报告失败：', error instanceof Error ? error.name : 'unknown')
    return unavailable()
  }
}
