CREATE TABLE "ProductEntitlement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productKey" TEXT NOT NULL,
    "status" "EntitlementStatus" NOT NULL DEFAULT 'ACTIVE',
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "grantedByUserId" TEXT NOT NULL,
    "revokedByUserId" TEXT,
    "source" "EntitlementSource" NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "ProductEntitlement_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ProductEntitlement_userId_productKey_key" ON "ProductEntitlement"("userId", "productKey");
CREATE INDEX "ProductEntitlement_userId_status_idx" ON "ProductEntitlement"("userId", "status");
ALTER TABLE "ProductEntitlement" ADD CONSTRAINT "ProductEntitlement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProductEntitlement" ADD CONSTRAINT "ProductEntitlement_grantedByUserId_fkey" FOREIGN KEY ("grantedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProductEntitlement" ADD CONSTRAINT "ProductEntitlement_revokedByUserId_fkey" FOREIGN KEY ("revokedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
