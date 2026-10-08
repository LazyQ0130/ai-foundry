CREATE TYPE "ResearchRunStatus" AS ENUM ('RUNNING', 'COMPLETED', 'FAILED');

CREATE TABLE "ResearchRun" (
  "id" SERIAL NOT NULL,
  "taskId" INTEGER NOT NULL,
  "status" "ResearchRunStatus" NOT NULL DEFAULT 'RUNNING',
  "stopReason" TEXT,
  "report" JSONB,
  "errorCode" TEXT,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ResearchRun_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ResearchCitation" (
  "id" SERIAL NOT NULL,
  "runId" INTEGER NOT NULL,
  "position" INTEGER NOT NULL,
  "citationKey" TEXT NOT NULL,
  "sourceType" TEXT NOT NULL DEFAULT 'KNOWLEDGE',
  "documentId" TEXT,
  "chunkId" INTEGER,
  "title" TEXT NOT NULL,
  "excerpt" TEXT NOT NULL,
  "page" INTEGER,
  "startOffset" INTEGER,
  "endOffset" INTEGER,
  "sourceContentHash" TEXT,
  "sourceIndexingVersion" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ResearchCitation_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ResearchCitation_position_check" CHECK ("position" > 0),
  CONSTRAINT "ResearchCitation_source_check" CHECK ("sourceType" = 'KNOWLEDGE')
);

CREATE INDEX "ResearchRun_taskId_createdAt_idx" ON "ResearchRun"("taskId", "createdAt");
CREATE UNIQUE INDEX "ResearchCitation_runId_citationKey_key" ON "ResearchCitation"("runId", "citationKey");
CREATE UNIQUE INDEX "ResearchCitation_runId_position_key" ON "ResearchCitation"("runId", "position");
ALTER TABLE "ResearchRun" ADD CONSTRAINT "ResearchRun_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "ResearchTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ResearchCitation" ADD CONSTRAINT "ResearchCitation_runId_fkey" FOREIGN KEY ("runId") REFERENCES "ResearchRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
