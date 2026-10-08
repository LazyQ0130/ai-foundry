# Capstone C3 internal authoring validation

Date: 2026-10-08. Verdict: **PASS WITH CHANGES**. Internal only; not registered, unlocked or published.

## 1. C3 Verdict

The C2 Reference was extended into a private, retrievable file pipeline. Phase 2 primitives were adapted to Workspace ownership, lifecycle, stable locators, sealed originals and retry. The changes were necessary because direct PUT replay can overwrite a staging object in Garage and pdfjs needed external server packaging under Next.js.

## 2. Learning Objective

Students learn that file upload is only the first step toward a knowledge base. They design and prove private storage, honest state transitions, page-aware parsing, bounded deterministic chunks, complete vector indexing, SQL-scoped retrieval and failure recovery without generating a report.

## 3. Knowledge Lifecycle

`PENDING_UPLOAD → PROCESSING → READY / FAILED`. A 15-minute `processingStartedAt` lease rejects an active second processor and allows stale retry. Only READY enters search. Failed indexing records stable `errorCode`; empty, scanned, damaged and encrypted PDFs do not become empty READY records.

## 4. Data Model

`KnowledgeDocument` belongs to Workspace and records metadata, object key, contentHash, status/error, pageCount, parser/indexing versions and processing time. `KnowledgeChunk` belongs to Document and stores position, page, normalized-text offsets, content, citationKey, model, dimension and vector. `(documentId, indexingVersion, position)` is unique. Extracted full text is not duplicated in DB; C4 can authorize signed original access and reparse for source preview.

## 5. Private Storage

Local Garage 2.4.1 with a private S3-compatible Bucket; SDK adapter uses AWS SDK 3.1147.0. `setup-garage.mjs` configured Bucket CORS; browser PUT preflight returned 200. Signed PUT and signed GET expire after 300 seconds. Anonymous GET was denied; Alice could request source URL and Bob could not. A replayed signed PUT could overwrite the staging key, so READY uses a new server-only sealed key with verified bytes; smoke confirmed replay cannot change the READY original. Local single-node Garage is not a production promise.

## 6. Upload Flow

Browser metadata → strict initiate Route → Session/Workspace → server-generated staging key + PENDING_UPLOAD + signed PUT → direct browser upload → protected process Route → HEAD/GET and actual size/MIME/signature checks → parser/indexer → sealed source + READY. The UI shows idle/uploading/processing/ready/failed, document list, errors and retry/check actions.

## 7. Parser

pdfjs-dist 6.4.299 extracts page-aware text from real PDF bytes. MD/TXT use fatal UTF-8 decode. Unit and HTTP fixtures cover two-page PDF, empty TXT, broken PDF, scanned/no-text PDF and encrypted PDF; errors map to stable categories without returning stack traces. No OCR, DOCX or Markdown renderer.

## 8. Chunk / Locator

800-character chunks with 120 overlap; PDF chunks never cross pages. `page` is 1-based for PDF and null for MD/TXT. Offsets are JavaScript UTF-16 indices in normalized page/document text, never PDF byte offsets. `citationKey` hashes contentHash, indexingVersion, page, offsets and chunk content. Tests confirm stable keys and changes after source/version changes.

## 9. Embedding / pgvector

Focused Mock/real adapter, 1024 finite numbers, model and dimension validation. Real mode used the existing locally configured `text-embedding-v4` contract with a non-sensitive two-page fixture. PostgreSQL 17 + pgvector 0.8.6 received two formal migrations from an empty isolated DB; C3 migration creates extension and `vector(1024)`. Default tests have no Provider Key dependency.

## 10. Retrieval

`POST /api/knowledge/search` strictly accepts a 1–500-character query. Parameterized SQL joins Document/Chunk, filters server-derived Workspace, READY, matching model and dimension **before** vector ordering and `LIMIT 5`. `/knowledge/search` shows title, preview, similarity and page/offset with an explicit Mock-quality label. It does not generate natural-language answers.

## 11. Failure / Retry

The second Mock embedding was forced to fail once: Document became FAILED, zero chunks were persisted or returned. Retry generated a complete READY index with no duplicate `(documentId, indexingVersion, position)`. A fresh PROCESSING lease returned 409, a stale one completed. Parsing/embedding happens before the short DB transaction; sealed object write happens before READY. Failed transaction rolls back chunk replacement and best-effort removes the orphan sealed object.

## 12. Isolation

Alice/Bob HTTP smoke covered list, detail, process, signed GET and search. Bob received 404 or empty results for Alice resources; anonymous process/search was rejected. Upload and search reject injected workspaceId. Anonymous object GET was rejected by Garage, and cross-origin search returned 403. Tests checked API output and database chunk facts, not just hidden UI.

## 13. Student Ownership

Students choose storage rationale, states, supported formats, size/text/chunk limits, chunk parameters, locator semantics, retryable errors and SQL isolation rationale. AI can draft SDK, Prisma, parser, forms and tests. Students must inspect migration, server-generated keys, private Bucket, vector dimensions, transaction boundary and Alice/Bob results.

## 14. C3 Reference

`assemble-capstone-reference.mjs c3` assembles Bootstrap + C1 + C2 + C3 into a new `.runtime` directory. C3 adds Document/Chunk schema and migration, private storage adapter, upload/process/source/search routes, parser/chunker/embedding/indexer, Knowledge and Search Debug UI, safe fixtures and deterministic/HTTP/real opt-in smoke. Stage 4 product UI and ownerId model were not copied.

## 15. C4 Boundary

`check-capstone-c3.ts` rejects ResearchCitation/ResearchReport/ResearchRun/ResearchStep/KnowledgeNote schema and report/Agent paths. `citationKey`, page and offsets are C3 Evidence identity only. No grounded report generator or Citation Snapshot table exists.

## 16. Security / Dependency Audit

New runtime dependencies: `@aws-sdk/client-s3` 3.1147.0 and `@aws-sdk/s3-request-presigner` 3.1147.0 for private S3 signing/objects; `pdfjs-dist` 6.4.299 for page-aware PDF extraction. All three package licenses are Apache-2.0. `npm audit --omit=dev` on C3 exits 1 with 1 moderate/4 high package findings (`next`, `postcss`, `prisma`, `@prisma/config`, `deepmerge-ts`); the same five names/counts occur in the existing C2 lock. No new C3 runtime dependency adds a finding. Full `npm ci` audit reports 1 moderate/9 high, likewise inherited. Dependency remediation remains a release gate, not a reason to rewrite the course tree here.

## 17. Lesson Verification

Renderer V2 parsed the internal C3 draft. It has 7 prompts, 7 globally unique new checkKeys, required teaching blocks and the four failure exercises. C3 checker passed lifecycle/vector/ownership and C4 gates; C1/C2 checkers and locked showcase also passed.

## 18. Full Verification

Reference: `npm ci`, `npm run lint`, `npm run typecheck`, `npm test` (4/4), `npm run build`, `prisma migrate deploy`, `prisma migrate status`, mock `npm run test:db`, opt-in real `node scripts/c3-real-smoke.mjs` all passed. Garage CORS preflight returned 200 and anonymous original GET was denied. Root: `npm run check`, `npm run typecheck`, `npm run build`, `npm test` (84/84) and `git diff --check` passed. The published curriculum still has 29 Stage lessons; `/capstone` remains locked.

## 19. Remaining Risks

Synchronous indexing can exceed request limits for large files or slow real Providers; C9 must choose a production execution strategy. A staging PUT can be replayed until expiry; sealed READY originals preserve integrity, but replay can leave a private staging orphan for future cleanup. Local Garage is single-node. Existing dependency audit findings need release review. Mock search proves pipeline correctness, while one real smoke is not a search-quality evaluation.

## 20. Files Changed

`package.json`; `scripts/assemble-capstone-reference.mjs`; `scripts/check-capstone-c3.ts`; `docs/capstone-c3-validation.md`;
`course-content/internal/capstone/c3/lesson-draft.md`; `course-content/internal/capstone/c3/package-lock.json`;
`course-content/internal/capstone/c3/overlay/.env.example`; `README.md`; `next.config.ts`; `docs/architecture.md`;
`course-content/internal/capstone/c3/overlay/app/page.tsx`; `app/knowledge/page.tsx`; `app/knowledge/search/page.tsx`;
`app/api/knowledge/uploads/route.ts`; `app/api/knowledge/documents/route.ts`; `app/api/knowledge/documents/[id]/route.ts`; `app/api/knowledge/documents/[id]/process/route.ts`; `app/api/knowledge/documents/[id]/source/route.ts`; `app/api/knowledge/search/route.ts`;
`course-content/internal/capstone/c3/overlay/lib/knowledge-core.ts`; `knowledge-parser.ts`; `knowledge-indexer.ts`; `embedding-provider.ts`; `storage.ts`;
`course-content/internal/capstone/c3/overlay/prisma/schema.prisma`; `migrations/20261008000000_knowledge/migration.sql`;
`course-content/internal/capstone/c3/overlay/scripts/setup-garage.mjs`; `c3-http-smoke.mjs`; `c3-real-smoke.mjs`; `test/knowledge.test.ts`;
`course-content/internal/capstone/fixtures/valid.txt`; `valid.md`; `valid-two-page.pdf`; `empty.txt`; `broken.pdf`; `scanned-or-no-text.pdf`; `encrypted.pdf`.

Paths shortened after their first common prefix in this section; the Git commit contains the authoritative full path list.

## 21. Git

Commit subject: `Build Capstone C3 private knowledge pipeline`. The final task response records the resulting SHA, origin/main and clean working-tree status. No `.env`, real DB/S3/Provider Secret or local runtime artifact is tracked.
