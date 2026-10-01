CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE "User" (
  "id" SERIAL PRIMARY KEY,
  "username" TEXT NOT NULL UNIQUE
);
CREATE TABLE "KnowledgeDocument" (
  "id" SERIAL PRIMARY KEY,
  "ownerId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "KnowledgeDocument_ownerId_idx" ON "KnowledgeDocument"("ownerId");
CREATE TABLE "KnowledgeChunk" (
  "id" SERIAL PRIMARY KEY,
  "documentId" INTEGER NOT NULL REFERENCES "KnowledgeDocument"("id") ON DELETE CASCADE,
  "position" INTEGER NOT NULL,
  "content" TEXT NOT NULL,
  "embedding" vector(1024),
  CONSTRAINT "KnowledgeChunk_documentId_position_key" UNIQUE ("documentId", "position")
);
