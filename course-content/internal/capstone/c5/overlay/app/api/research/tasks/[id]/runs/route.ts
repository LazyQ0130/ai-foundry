import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { currentSession, rejectCrossOriginWrite, unauthorized, unavailable } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { runResearchWorkflow } from '@/lib/research-service'
import { workspaceForUser } from '@/lib/workspace'

export const dynamic = 'force-dynamic'
const headers = { 'Cache-Control': 'no-store' }
async function ownedTask(request: NextRequest, rawId: string) {
  const session = await currentSession(request)
  if (!session) return { error: unauthorized() }
  const parsed = z.coerce.number().int().positive().safeParse(rawId)
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
      select: { id: true, status: true, stopReason: true, errorCode: true, createdAt: true, completedAt: true,
        _count: { select: { steps: true } } }, orderBy: { createdAt: 'desc' }, take: 20 })
    return NextResponse.json({ task: owned.task, runs }, { headers })
  } catch (error) {
    console.error('读取研究运行失败：', error instanceof Error ? error.name : 'unknown')
    return unavailable()
  }
}
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const rejected = rejectCrossOriginWrite(request)
  if (rejected) return rejected
  try {
    const owned = await ownedTask(request, (await context.params).id)
    if (owned.error) return owned.error
    const text = await request.text()
    if (text.length > 100) return NextResponse.json({ error: '不接受客户端运行参数。' }, { status: 400, headers })
    let body: unknown = {}
    if (text) { try { body = JSON.parse(text) } catch { return NextResponse.json({ error: '请求格式无效。' }, { status: 400, headers }) } }
    if (!z.object({}).strict().safeParse(body).success) return NextResponse.json({ error: '不接受客户端运行参数。' }, { status: 400, headers })
    const result = await runResearchWorkflow(owned.task!, owned.workspace!.id)
    return NextResponse.json(result, { status: result.status === 'FAILED' ? 502 : 201, headers })
  } catch (error) {
    console.error('创建研究运行失败：', error instanceof Error ? error.name : 'unknown')
    return unavailable()
  }
}
