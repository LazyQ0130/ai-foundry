CREATE TYPE "ResearchActionStatus" AS ENUM ('PROPOSED','REJECTED','EXECUTED');
CREATE TABLE "ResearchAction" (
 "id" TEXT NOT NULL, "runId" INTEGER NOT NULL, "toolName" TEXT NOT NULL DEFAULT 'SAVE_KNOWLEDGE_NOTE',
 "canonicalArgs" TEXT NOT NULL, "version" INTEGER NOT NULL DEFAULT 1,
 "status" "ResearchActionStatus" NOT NULL DEFAULT 'PROPOSED', "idempotencyKey" TEXT NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
 "decidedAt" TIMESTAMP(3), "executedAt" TIMESTAMP(3),
 CONSTRAINT "ResearchAction_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "ResearchAction_tool_check" CHECK ("toolName" = 'SAVE_KNOWLEDGE_NOTE'),
 CONSTRAINT "ResearchAction_version_check" CHECK ("version" > 0)
);
CREATE UNIQUE INDEX "ResearchAction_runId_key" ON "ResearchAction"("runId");
CREATE UNIQUE INDEX "ResearchAction_idempotencyKey_key" ON "ResearchAction"("idempotencyKey");
ALTER TABLE "ResearchAction" ADD CONSTRAINT "ResearchAction_runId_fkey" FOREIGN KEY ("runId") REFERENCES "ResearchRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE TABLE "KnowledgeNote" (
 "id" TEXT NOT NULL, "workspaceId" INTEGER NOT NULL, "title" TEXT NOT NULL, "content" TEXT NOT NULL,
 "sourceRunId" INTEGER, "sourceActionKey" TEXT NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "KnowledgeNote_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "KnowledgeNote_sourceActionKey_key" ON "KnowledgeNote"("sourceActionKey");
CREATE INDEX "KnowledgeNote_workspaceId_createdAt_idx" ON "KnowledgeNote"("workspaceId","createdAt");
ALTER TABLE "KnowledgeNote" ADD CONSTRAINT "KnowledgeNote_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "KnowledgeNote" ADD CONSTRAINT "KnowledgeNote_sourceRunId_fkey" FOREIGN KEY ("sourceRunId") REFERENCES "ResearchRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;
