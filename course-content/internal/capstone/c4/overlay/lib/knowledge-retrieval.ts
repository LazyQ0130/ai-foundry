import { embed } from './embedding-provider'
import { vectorLiteral } from './knowledge-core'
import { prisma } from './prisma'

export type KnowledgeEvidence = {
  chunkId: number; documentId: string; title: string; position: number; page: number | null
  startOffset: number; endOffset: number; content: string; citationKey: string
  contentHash: string | null; indexingVersion: string; similarity: number
}
type Row = Omit<KnowledgeEvidence, 'similarity'> & { distance: number }

export async function retrieveKnowledgeEvidence({ workspaceId, query, limit = 5 }:
  { workspaceId: number; query: string; limit?: number }): Promise<KnowledgeEvidence[]> {
  if (!Number.isInteger(workspaceId) || workspaceId < 1 || !Number.isInteger(limit) || limit < 1 || limit > 5) throw new Error('INVALID_RETRIEVAL_INPUT')
  const embedding = await embed(query)
  const literal = vectorLiteral(embedding.vector)
  // Ownership, READY, model and dimension filters happen before Top-K ranking.
  const rows = await prisma.$queryRaw<Row[]>`
    SELECT c."id" AS "chunkId", d."id" AS "documentId", d."title", c."position", c."page",
           c."startOffset", c."endOffset", c."content", c."citationKey",
           d."contentHash", d."indexingVersion", (c."embedding" <=> ${literal}::vector) AS "distance"
    FROM "KnowledgeChunk" c JOIN "KnowledgeDocument" d ON d."id" = c."documentId"
    WHERE d."workspaceId" = ${workspaceId} AND d."status" = 'READY'::"DocumentStatus"
      AND c."embeddingModel" = ${embedding.model} AND c."embeddingDimension" = ${embedding.dimension}
    ORDER BY c."embedding" <=> ${literal}::vector, c."id" ASC
    LIMIT ${limit}
  `
  return rows.map(({ distance, ...row }) => ({ ...row, similarity: 1 - distance }))
}
