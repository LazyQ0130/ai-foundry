import { NextRequest, NextResponse } from 'next/server'
import { currentSession, rejectCrossOriginWrite, unauthorized, unavailable } from '@/lib/auth'
import { processKnowledgeDocument } from '@/lib/knowledge-indexer'
import { safeErrors } from '@/lib/knowledge-core'
import { workspaceForUser } from '@/lib/workspace'

export const dynamic = 'force-dynamic'
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const rejected = rejectCrossOriginWrite(request)
  if (rejected) return rejected
  try {
    const session = await currentSession(request)
    if (!session) return unauthorized()
    const workspace = await workspaceForUser(session.userId)
    if (!workspace) return unavailable()
    const result = await processKnowledgeDocument((await context.params).id, workspace.id)
    if (result.outcome === 'missing') return NextResponse.json({ error: '资料不存在。' }, { status: 404 })
    if (result.outcome === 'conflict') return NextResponse.json({ error: '资料已就绪或正在处理。' }, { status: 409 })
    if (result.outcome === 'failed') return NextResponse.json({ status: 'FAILED', errorCode: result.errorCode,
      error: safeErrors[result.errorCode] ?? '资料处理失败，可以重试。' }, { status: 422 })
    return NextResponse.json({ status: 'READY', chunkCount: result.chunkCount }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('资料处理失败：', error instanceof Error ? error.name : 'unknown')
    return unavailable()
  }
}
