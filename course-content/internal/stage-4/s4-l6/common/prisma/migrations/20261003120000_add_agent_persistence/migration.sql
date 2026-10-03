ALTER TABLE "Resource" ADD COLUMN "agentActionKey" TEXT;
CREATE UNIQUE INDEX "Resource_agentActionKey_key" ON "Resource"("agentActionKey");

CREATE TABLE "AgentRun" (
  "id" TEXT NOT NULL,
  "ownerId" INTEGER NOT NULL,
  "goal" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'running',
  "currentStep" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AgentRun_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AgentRun_ownerId_createdAt_idx" ON "AgentRun"("ownerId", "createdAt");
CREATE INDEX "AgentRun_ownerId_status_idx" ON "AgentRun"("ownerId", "status");
ALTER TABLE "AgentRun" ADD CONSTRAINT "AgentRun_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "AgentStep" (
  "id" TEXT NOT NULL,
  "runId" TEXT NOT NULL,
  "position" INTEGER NOT NULL,
  "kind" TEXT NOT NULL,
  "toolName" TEXT,
  "inputSummary" TEXT,
  "outputSummary" TEXT,
  "status" TEXT NOT NULL,
  "latencyMs" INTEGER,
  "usage" INTEGER,
  "errorCategory" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AgentStep_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AgentStep_runId_position_key" ON "AgentStep"("runId", "position");
ALTER TABLE "AgentStep" ADD CONSTRAINT "AgentStep_runId_fkey" FOREIGN KEY ("runId") REFERENCES "AgentRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "AgentAction" (
  "id" TEXT NOT NULL,
  "runId" TEXT NOT NULL,
  "stepId" TEXT NOT NULL,
  "toolName" TEXT NOT NULL,
  "canonicalArgs" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'proposed',
  "idempotencyKey" TEXT NOT NULL,
  "approvedAt" TIMESTAMP(3),
  "executedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AgentAction_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AgentAction_stepId_key" ON "AgentAction"("stepId");
CREATE UNIQUE INDEX "AgentAction_idempotencyKey_key" ON "AgentAction"("idempotencyKey");
CREATE INDEX "AgentAction_runId_idx" ON "AgentAction"("runId");
ALTER TABLE "AgentAction" ADD CONSTRAINT "AgentAction_runId_fkey" FOREIGN KEY ("runId") REFERENCES "AgentRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AgentAction" ADD CONSTRAINT "AgentAction_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "AgentStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;
