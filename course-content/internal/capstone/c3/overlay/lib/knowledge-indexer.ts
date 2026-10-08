import { createHash, randomUUID } from 'node:crypto'
import { prisma } from './prisma'
import { embed, type Embedding } from './embedding-provider'
import { chunkPages, KnowledgeError, PROCESSING_LEASE_MS, vectorLiteral } from './knowledge-core'
import { parseFile } from './knowledge-parser'
import { deletePrivateObject, readPrivateObject, writeSealedObject } from './storage'

export async function processKnowledgeDocument(id: string, workspaceId: number) {
  const document = await prisma.knowledgeDocument.findFirst({ where: { id, workspaceId } })
  if (!document) return { outcome: 'missing' as const }
  if (document.status === 'READY') return { outcome: 'conflict' as const }
  const startedAt = new Date()
  const staleBefore = new Date(startedAt.getTime() - PROCESSING_LEASE_MS)
  const claimed = await prisma.knowledgeDocument.updateMany({
    where: { id, workspaceId, OR: [
      { status: 'PENDING_UPLOAD' }, { status: 'FAILED' },
      { status: 'PROCESSING', processingStartedAt: { lt: staleBefore } },
    ] },
    data: { status: 'PROCESSING', processingStartedAt: startedAt, errorCode: null },
  })
  if (claimed.count !== 1) return { outcome: 'conflict' as const }
  let sealedKey: string | null = null
  try {
    const bytes = await readPrivateObject(document.objectKey, document.byteSize, document.mimeType)
    const contentHash = createHash('sha256').update(bytes).digest('hex')
    const pages = await parseFile(bytes, document.originalName, document.mimeType)
    const chunks = chunkPages(pages, contentHash, document.indexingVersion)
    // External work is completed before the short database transaction.
    const embedded: Embedding[] = []
    for (const chunk of chunks) embedded.push(await embed(chunk.content, chunk.position))
    const model = embedded[0].model
    if (!embedded.every(item => item.model === model && item.dimension === 1024)) throw new KnowledgeError('EMBEDDING_FAILED')
    sealedKey = `workspaces/${workspaceId}/documents/${id}/sealed/${randomUUID()}`
    await writeSealedObject(sealedKey, bytes, document.mimeType)
    await prisma.$transaction(async tx => {
      const current = await tx.knowledgeDocument.findFirst({ where: { id, workspaceId, status: 'PROCESSING', processingStartedAt: startedAt } })
      if (!current) throw new KnowledgeError('INDEX_FAILED')
      await tx.knowledgeChunk.deleteMany({ where: { documentId: id } })
      for (let index = 0; index < chunks.length; index++) {
        const chunk = chunks[index]
        const value = embedded[index]
        const literal = vectorLiteral(value.vector)
        await tx.$executeRaw`
          INSERT INTO "KnowledgeChunk" ("documentId", "position", "page", "startOffset", "endOffset", "content", "citationKey", "embedding", "embeddingModel", "embeddingDimension", "indexingVersion")
          VALUES (${id}, ${chunk.position}, ${chunk.page}, ${chunk.startOffset}, ${chunk.endOffset}, ${chunk.content}, ${chunk.citationKey}, ${literal}::vector, ${value.model}, ${value.dimension}, ${document.indexingVersion})
        `
      }
      const updated = await tx.knowledgeDocument.updateMany({
        where: { id, workspaceId, status: 'PROCESSING', processingStartedAt: startedAt },
        data: { status: 'READY', errorCode: null, contentHash, pageCount: pages.length,
          objectKey: sealedKey!, processingStartedAt: null },
      })
      if (updated.count !== 1) throw new KnowledgeError('INDEX_FAILED')
    }, { timeout: 15_000 })
    await deletePrivateObject(document.objectKey).catch(() => {})
    return { outcome: 'ready' as const, chunkCount: chunks.length }
  } catch (error) {
    if (sealedKey) await deletePrivateObject(sealedKey).catch(() => {})
    const code = error instanceof KnowledgeError ? error.code : 'INDEX_FAILED'
    await prisma.knowledgeDocument.updateMany({ where: { id, workspaceId, status: 'PROCESSING', processingStartedAt: startedAt },
      data: { status: 'FAILED', errorCode: code, processingStartedAt: null } })
    return { outcome: 'failed' as const, errorCode: code }
  }
}
