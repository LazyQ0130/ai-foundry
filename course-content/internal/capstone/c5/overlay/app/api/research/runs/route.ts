import { NextRequest, NextResponse } from 'next/server'
import { currentSession, unauthorized, unavailable } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { workspaceForUser } from '@/lib/workspace'

export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  try {
    const session = await currentSession(request)
    if (!session) return unauthorized()
    const workspace = await workspaceForUser(session.userId)
    if (!workspace) return unavailable()
    const runs = await prisma.researchRun.findMany({ where: { task: { workspaceId: workspace.id } },
      select: { id: true, status: true, stopReason: true, errorCode: true, createdAt: true, completedAt: true,
        report: true, task: { select: { id: true, title: true } }, _count: { select: { steps: true } } },
      orderBy: { createdAt: 'desc' }, take: 50 })
    return NextResponse.json({ runs: runs.map(item => ({ id: item.id, task: item.task, status: item.status,
      stopReason: item.stopReason, errorCode: item.errorCode, createdAt: item.createdAt,
      completedAt: item.completedAt, stepCount: item._count.steps, reportStatus: item.report ? 'AVAILABLE' : 'NONE' })) },
      { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('读取运行列表失败：', error instanceof Error ? error.name : 'unknown')
    return unavailable()
  }
}
