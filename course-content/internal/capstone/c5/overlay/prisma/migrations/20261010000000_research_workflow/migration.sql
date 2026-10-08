ALTER TYPE "ResearchRunStatus" ADD VALUE 'CANCELLED';

CREATE TYPE "ResearchStepKind" AS ENUM ('BRIEF', 'MODEL', 'TOOL', 'REPORT');
CREATE TYPE "ResearchStepStatus" AS ENUM ('RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

ALTER TABLE "ResearchRun" ADD COLUMN "brief" JSONB;
ALTER TABLE "ResearchRun" ADD COLUMN "cancelRequestedAt" TIMESTAMP(3);

CREATE TABLE "ResearchStep" (
  "id" SERIAL NOT NULL,
  "runId" INTEGER NOT NULL,
  "position" INTEGER NOT NULL,
  "kind" "ResearchStepKind" NOT NULL,
  "status" "ResearchStepStatus" NOT NULL DEFAULT 'RUNNING',
  "toolName" TEXT,
  "inputSummary" TEXT,
  "outputSummary" TEXT,
  "latencyMs" INTEGER,
  "usage" JSONB,
  "errorCode" TEXT,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ResearchStep_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ResearchStep_position_check" CHECK ("position" > 0),
  CONSTRAINT "ResearchStep_latency_check" CHECK ("latencyMs" IS NULL OR "latencyMs" >= 0)
);

CREATE UNIQUE INDEX "ResearchStep_runId_position_key" ON "ResearchStep"("runId", "position");
CREATE INDEX "ResearchStep_runId_createdAt_idx" ON "ResearchStep"("runId", "createdAt");
ALTER TABLE "ResearchStep" ADD CONSTRAINT "ResearchStep_runId_fkey" FOREIGN KEY ("runId") REFERENCES "ResearchRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
