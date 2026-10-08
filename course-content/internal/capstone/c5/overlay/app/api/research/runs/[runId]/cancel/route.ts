import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { currentSession, rejectCrossOriginWrite, unauthorized, unavailable } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { abortActiveResearchRun } from '@/lib/research-service'
import { workspaceForUser } from '@/lib/workspace'

export const dynamic = 'force-dynamic'
export async function POST(request: NextRequest, context: { params: Promise<{ runId: string }> }) {
  const rejected = rejectCrossOriginWrite(request)
  if (rejected) return rejected
  try {
    const session = await currentSession(request)
    if (!session) return unauthorized()
    const parsed = z.coerce.number().int().positive().safeParse((await context.params).runId)
    if (!parsed.success) return NextResponse.json({ error: '运行不存在。' }, { status: 404 })
    const workspace = await workspaceForUser(session.userId)
    if (!workspace) return unavailable()
    const run = await prisma.researchRun.findFirst({ where: { id: parsed.data, task: { workspaceId: workspace.id } },
      select: { id: true, status: true } })
    if (!run) return NextResponse.json({ error: '运行不存在。' }, { status: 404 })
    if (run.status !== 'RUNNING') return NextResponse.json({ error: '此运行已结束。' }, { status: 409 })
    const updated = await prisma.researchRun.updateMany({ where: { id: run.id, status: 'RUNNING' }, data: {
      status: 'CANCELLED', stopReason: 'CANCELLED', cancelRequestedAt: new Date(), completedAt: new Date() } })
    if (updated.count !== 1) return NextResponse.json({ error: '此运行已结束。' }, { status: 409 })
    abortActiveResearchRun(run.id)
    return NextResponse.json({ runId: run.id, status: 'CANCELLED' }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('取消研究运行失败：', error instanceof Error ? error.name : 'unknown')
    return unavailable()
  }
}
