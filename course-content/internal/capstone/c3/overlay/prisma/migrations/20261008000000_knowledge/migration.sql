CREATE EXTENSION IF NOT EXISTS vector;

CREATE TYPE "DocumentStatus" AS ENUM ('PENDING_UPLOAD', 'PROCESSING', 'READY', 'FAILED');

CREATE TABLE "KnowledgeDocument" (
  "id" TEXT NOT NULL,
  "workspaceId" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "originalName" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "byteSize" INTEGER NOT NULL,
  "objectKey" TEXT NOT NULL,
  "contentHash" TEXT,
  "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING_UPLOAD',
  "errorCode" TEXT,
  "pageCount" INTEGER,
  "parserVersion" TEXT NOT NULL DEFAULT 'pdfjs-6.4.299-text-v1',
  "indexingVersion" TEXT NOT NULL DEFAULT 'chunk-800-120-v1',
  "processingStartedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "KnowledgeDocument_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "KnowledgeChunk" (
  "id" SERIAL NOT NULL,
  "documentId" TEXT NOT NULL,
  "position" INTEGER NOT NULL,
  "page" INTEGER,
  "startOffset" INTEGER NOT NULL,
  "endOffset" INTEGER NOT NULL,
  "content" TEXT NOT NULL,
  "citationKey" TEXT NOT NULL,
  "embedding" vector(1024) NOT NULL,
  "embeddingModel" TEXT NOT NULL,
  "embeddingDimension" INTEGER NOT NULL,
  "indexingVersion" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "KnowledgeChunk_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "KnowledgeChunk_locator_check" CHECK ("startOffset" >= 0 AND "endOffset" > "startOffset"),
  CONSTRAINT "KnowledgeChunk_page_check" CHECK ("page" IS NULL OR "page" > 0),
  CONSTRAINT "KnowledgeChunk_dimension_check" CHECK ("embeddingDimension" = 1024)
);

CREATE UNIQUE INDEX "KnowledgeDocument_objectKey_key" ON "KnowledgeDocument"("objectKey");
CREATE INDEX "KnowledgeDocument_workspaceId_status_createdAt_idx" ON "KnowledgeDocument"("workspaceId", "status", "createdAt");
CREATE UNIQUE INDEX "KnowledgeChunk_documentId_indexingVersion_position_key" ON "KnowledgeChunk"("documentId", "indexingVersion", "position");
CREATE INDEX "KnowledgeChunk_documentId_position_idx" ON "KnowledgeChunk"("documentId", "position");

ALTER TABLE "KnowledgeDocument" ADD CONSTRAINT "KnowledgeDocument_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "KnowledgeChunk" ADD CONSTRAINT "KnowledgeChunk_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "KnowledgeDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
