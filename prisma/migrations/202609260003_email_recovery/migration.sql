ALTER TABLE "User" ADD COLUMN "email" TEXT,
  ADD COLUMN "emailVerifiedAt" TIMESTAMP(3),
  ADD COLUMN "acceptedTermsAt" TIMESTAMP(3),
  ADD COLUMN "termsVersion" TEXT;
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE TABLE "EmailChallenge" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "scope" TEXT NOT NULL,
  "userId" TEXT,
  "email" TEXT NOT NULL,
  "previousEmail" TEXT,
  "purpose" TEXT NOT NULL,
  "passwordVersion" TEXT NOT NULL,
  "codeHash" TEXT NOT NULL,
  "oldCodeHash" TEXT,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "delivered" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "consumedAt" TIMESTAMP(3)
);
CREATE INDEX "EmailChallenge_scope_createdAt_idx" ON "EmailChallenge"("scope", "createdAt");
CREATE INDEX "EmailChallenge_email_createdAt_idx" ON "EmailChallenge"("email", "createdAt");
