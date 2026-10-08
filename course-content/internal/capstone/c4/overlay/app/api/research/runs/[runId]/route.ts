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
      include: { citations: { orderBy: { position: 'asc' } }, task: { select: { id: true, title: true, query: true } } } })
    if (!run) return NextResponse.json({ error: '运行不存在。' }, { status: 404 })
    const ids = run.citations.flatMap(item => item.documentId ? [item.documentId] : [])
    const live = await prisma.knowledgeDocument.findMany({ where: { id: { in: ids }, workspaceId: workspace.id }, select: { id: true } })
    const available = new Set(live.map(item => item.id))
    return NextResponse.json({ run: { id: run.id, task: run.task, status: run.status,
      stopReason: run.stopReason, errorCode: run.errorCode, report: run.report,
      createdAt: run.createdAt, completedAt: run.completedAt },
      citations: run.citations.map(item => ({ position: item.position, citationKey: item.citationKey,
        sourceType: item.sourceType, title: item.title, excerpt: item.excerpt,
        page: item.page, startOffset: item.startOffset, endOffset: item.endOffset,
        sourceContentHash: item.sourceContentHash, sourceIndexingVersion: item.sourceIndexingVersion,
        sourceAvailable: !!item.documentId && available.has(item.documentId), documentId: item.documentId })) },
      { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('读取研究报告失败：', error instanceof Error ? error.name : 'unknown')
    return unavailable()
  }
}
