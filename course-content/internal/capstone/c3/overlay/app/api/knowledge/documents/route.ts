import { NextRequest, NextResponse } from 'next/server'
import { currentSession, unauthorized, unavailable } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { workspaceForUser } from '@/lib/workspace'
import { safeErrors } from '@/lib/knowledge-core'

export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  try {
    const session = await currentSession(request)
    if (!session) return unauthorized()
    const workspace = await workspaceForUser(session.userId)
    if (!workspace) return unavailable()
    const documents = await prisma.knowledgeDocument.findMany({ where: { workspaceId: workspace.id },
      select: { id: true, title: true, originalName: true, mimeType: true, byteSize: true, status: true,
        errorCode: true, pageCount: true, createdAt: true, updatedAt: true }, orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ documents: documents.map(document => ({ ...document,
      errorMessage: document.errorCode ? safeErrors[document.errorCode] ?? '处理失败，可以重试。' : null })) },
      { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('读取资料列表失败：', error instanceof Error ? error.name : 'unknown')
    return unavailable()
  }
}
