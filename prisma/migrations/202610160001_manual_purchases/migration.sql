CREATE TYPE "PurchaseStatus" AS ENUM ('DRAFT', 'PENDING', 'NEEDS_INFO', 'APPROVED');
CREATE TYPE "PaymentMethod" AS ENUM ('ALIPAY', 'WECHAT');
CREATE TABLE "Purchase" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "planId" TEXT NOT NULL,
  "planName" TEXT NOT NULL, "price" INTEGER NOT NULL, "paymentRemark" TEXT NOT NULL,
  "status" "PurchaseStatus" NOT NULL DEFAULT 'DRAFT', "paymentMethod" "PaymentMethod",
  "transactionId" TEXT NOT NULL DEFAULT '', "note" TEXT NOT NULL DEFAULT '',
  "reviewNote" TEXT NOT NULL DEFAULT '', "reviewedById" TEXT, "reviewedAt" TIMESTAMP(3),
  "submittedAt" TIMESTAMP(3), "version" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Purchase_price_check" CHECK ("price" >= 0),
  CONSTRAINT "Purchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Purchase_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "Purchase_userId_createdAt_idx" ON "Purchase"("userId", "createdAt");
CREATE INDEX "Purchase_status_submittedAt_idx" ON "Purchase"("status", "submittedAt");
-- A draft, pending submission, or request for more information is the same application.
CREATE UNIQUE INDEX "Purchase_one_open_plan" ON "Purchase"("userId", "planId") WHERE "status" <> 'APPROVED';
CREATE TABLE "PurchaseProof" (
  "purchaseId" TEXT NOT NULL, "data" BYTEA NOT NULL, "version" TEXT NOT NULL,
  CONSTRAINT "PurchaseProof_pkey" PRIMARY KEY ("purchaseId"),
  CONSTRAINT "PurchaseProof_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
