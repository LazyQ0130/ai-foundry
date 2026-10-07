import { NextRequest, NextResponse } from 'next/server'
import { currentSession, unauthorized, unavailable } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await currentSession(request)
    if (!session) return unauthorized()
    const id = Number((await context.params).id)
    if (!Number.isSafeInteger(id) || id < 1) return NextResponse.json({ ok: false }, { status: 404 })
    const task = await prisma.researchTask.findFirst({ where: { id, workspace: { ownerId: session.userId } } })
    if (!task) return NextResponse.json({ ok: false }, { status: 404 })
    return NextResponse.json({ ok: true, task }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('读取任务失败：', error instanceof Error ? error.name : 'unknown')
    return unavailable()
  }
}
