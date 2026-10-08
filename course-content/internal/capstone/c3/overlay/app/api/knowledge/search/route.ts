import { NextRequest, NextResponse } from 'next/server'
import { currentSession, rejectCrossOriginWrite, unauthorized, unavailable } from '@/lib/auth'
import { embed } from '@/lib/embedding-provider'
import { searchInput, vectorLiteral } from '@/lib/knowledge-core'
import { prisma } from '@/lib/prisma'
import { workspaceForUser } from '@/lib/workspace'

export const dynamic = 'force-dynamic'
type Row = { chunkId: number; documentId: string; title: string; position: number; page: number | null;
  startOffset: number; endOffset: number; content: string; citationKey: string; distance: number }
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
    const embedding = await embed(parsed.data.query)
    const literal = vectorLiteral(embedding.vector)
    const rows = await prisma.$queryRaw<Row[]>`
      SELECT c."id" AS "chunkId", d."id" AS "documentId", d."title", c."position", c."page",
             c."startOffset", c."endOffset", c."content", c."citationKey",
             (c."embedding" <=> ${literal}::vector) AS "distance"
      FROM "KnowledgeChunk" c JOIN "KnowledgeDocument" d ON d."id" = c."documentId"
      WHERE d."workspaceId" = ${workspace.id} AND d."status" = 'READY'::"DocumentStatus"
        AND c."embeddingModel" = ${embedding.model} AND c."embeddingDimension" = ${embedding.dimension}
      ORDER BY c."embedding" <=> ${literal}::vector, c."id" ASC
      LIMIT 5
    `
    const matches = rows.map(row => ({ chunkId: row.chunkId, documentId: row.documentId, title: row.title,
      position: row.position, page: row.page, startOffset: row.startOffset, endOffset: row.endOffset,
      citationKey: row.citationKey, preview: row.content.slice(0, 300), similarity: 1 - row.distance }))
    return NextResponse.json({ matches, embeddingMode: process.env.AI_EMBEDDING_MODE === 'real' ? 'real' : 'mock' },
      { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('资料检索失败：', error instanceof Error ? error.name : 'unknown')
    return unavailable()
  }
}
