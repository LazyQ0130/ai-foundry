import { NextRequest, NextResponse } from 'next/server'
import { currentSession, rejectCrossOriginWrite, unauthorized, unavailable } from '@/lib/auth'
import { searchInput } from '@/lib/knowledge-core'
import { retrieveKnowledgeEvidence } from '@/lib/knowledge-retrieval'
import { workspaceForUser } from '@/lib/workspace'

export const dynamic = 'force-dynamic'
export async function POST(request: NextRequest) {
  const rejected = rejectCrossOriginWrite(request)
  if (rejected) return rejected
  try {
    const session = await currentSession(request)
    if (!session) return unauthorized()
    const parsed = searchInput.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: '请输入 1～500 字的搜索问题。' }, { status: 400 })
    const workspace = await workspaceForUser(session.userId)
    if (!workspace) return unavailable()
    const evidence = await retrieveKnowledgeEvidence({ workspaceId: workspace.id, query: parsed.data.query })
    const matches = evidence.map(row => ({ chunkId: row.chunkId, documentId: row.documentId,
      title: row.title, position: row.position, page: row.page, startOffset: row.startOffset,
      endOffset: row.endOffset, citationKey: row.citationKey, preview: row.content.slice(0, 300), similarity: row.similarity }))
    return NextResponse.json({ matches, embeddingMode: process.env.AI_EMBEDDING_MODE === 'real' ? 'real' : 'mock' },
      { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('资料检索失败：', error instanceof Error ? error.name : 'unknown')
    return unavailable()
  }
}
