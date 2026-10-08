ALTER TABLE "ResearchRun" ADD COLUMN "sourcePolicy" TEXT NOT NULL DEFAULT 'PRIVATE_ONLY';
ALTER TABLE "ResearchRun" ADD CONSTRAINT "ResearchRun_sourcePolicy_check" CHECK ("sourcePolicy" IN ('PRIVATE_ONLY','PRIVATE_AND_EXTERNAL'));
ALTER TABLE "ResearchCitation" ADD COLUMN "externalId" TEXT, ADD COLUMN "sourceUrl" TEXT,
 ADD COLUMN "publishedYear" INTEGER, ADD COLUMN "sourceVersion" TEXT, ADD COLUMN "supportLevel" TEXT;
ALTER TABLE "ResearchCitation" DROP CONSTRAINT "ResearchCitation_source_check";
ALTER TABLE "ResearchCitation" ADD CONSTRAINT "ResearchCitation_source_check" CHECK (
 ("sourceType" = 'KNOWLEDGE' AND "externalId" IS NULL AND "sourceUrl" IS NULL) OR
 ("sourceType" = 'CROSSREF' AND "externalId" IS NOT NULL AND "sourceUrl" LIKE 'https://doi.org/10.%'
 AND "sourceVersion" IS NOT NULL AND "supportLevel" = 'CLAIM_EVIDENCE'
 AND "documentId" IS NULL AND "chunkId" IS NULL AND "page" IS NULL AND "startOffset" IS NULL AND "endOffset" IS NULL));
