CREATE TABLE "CapstoneLessonProgress" (
 "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "lessonId" TEXT NOT NULL,
 "status" "ProgressStatus" NOT NULL DEFAULT 'IN_PROGRESS', "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "completedAt" TIMESTAMP(3), "lastVisitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "CapstoneLessonProgress_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "CapstoneLessonProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "CapstoneLessonProgress_userId_lessonId_key" ON "CapstoneLessonProgress"("userId", "lessonId");
CREATE INDEX "CapstoneLessonProgress_userId_lastVisitedAt_idx" ON "CapstoneLessonProgress"("userId", "lastVisitedAt");
CREATE TABLE "CapstoneCheck" (
 "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "lessonId" TEXT NOT NULL, "checkKey" TEXT NOT NULL,
 "completed" BOOLEAN NOT NULL DEFAULT false, "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "CapstoneCheck_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "CapstoneCheck_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "CapstoneCheck_userId_lessonId_checkKey_key" ON "CapstoneCheck"("userId", "lessonId", "checkKey");
