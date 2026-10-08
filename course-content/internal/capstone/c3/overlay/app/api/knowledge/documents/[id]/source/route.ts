import { NextRequest, NextResponse } from 'next/server'
import { currentSession, unauthorized, unavailable } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { signedGet } from '@/lib/storage'
import { workspaceForUser } from '@/lib/workspace'

export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await currentSession(request)
    if (!session) return unauthorized()
    const workspace = await workspaceForUser(session.userId)
    if (!workspace) return unavailable()
    const document = await prisma.knowledgeDocument.findFirst({ where: { id: (await context.params).id, workspaceId: workspace.id } })
    if (!document) return NextResponse.json({ error: '资料不存在。' }, { status: 404 })
    return NextResponse.json({ url: await signedGet(document.objectKey), expiresIn: 300 }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('原文件访问失败：', error instanceof Error ? error.name : 'unknown')
    return unavailable()
  }
}
