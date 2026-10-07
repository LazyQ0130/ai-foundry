import { NextRequest, NextResponse } from 'next/server'
import { currentSession, rejectCrossOriginWrite, unauthorized, unavailable } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { taskInput } from '@/lib/task-input'
import { workspaceForUser } from '@/lib/workspace'

export const dynamic = 'force-dynamic'
const headers = { 'Cache-Control': 'no-store' }

export async function GET(request: NextRequest) {
  try {
    const session = await currentSession(request)
    if (!session) return unauthorized()
    const workspace = await workspaceForUser(session.userId)
    if (!workspace) return unavailable()
    const tasks = await prisma.researchTask.findMany({ where: { workspaceId: workspace.id }, orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ ok: true, workspace: { id: workspace.id, name: workspace.name }, tasks }, { headers })
  } catch (error) {
    console.error('读取任务失败：', error instanceof Error ? error.name : 'unknown')
    return unavailable()
  }
}

export async function POST(request: NextRequest) {
  const rejected = rejectCrossOriginWrite(request)
  if (rejected) return rejected
  try {
    const session = await currentSession(request)
    if (!session) return unauthorized()
    const parsed = taskInput.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ ok: false, error: '请填写标题和研究问题。' }, { status: 400, headers })
    const workspace = await workspaceForUser(session.userId)
    if (!workspace) return unavailable()
    const task = await prisma.researchTask.create({ data: { workspaceId: workspace.id, ...parsed.data } })
    return NextResponse.json({ ok: true, task }, { status: 201, headers })
  } catch (error) {
    console.error('创建任务失败：', error instanceof Error ? error.name : 'unknown')
    return unavailable()
  }
}
