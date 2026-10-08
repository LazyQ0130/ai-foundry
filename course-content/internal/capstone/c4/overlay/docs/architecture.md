# Architecture — C4 teaching reference

## System context

```text
Browser → Next.js modular monolith
            ├─ Session Auth → Personal Workspace
            ├─ ResearchTask → ResearchRun → GroundedReport JSON
            │                         └─ ResearchCitation snapshots
            └─ Knowledge → private S3-compatible storage
                         → PDF/MD/TXT parser → chunks
                         → embedding → PostgreSQL 17 + pgvector
```

One application and one relational database. Agent Runtime, ResearchStep, Tool registry, MCP, approvals and KnowledgeNote are **not implemented yet**.

## Current domain and lifecycle

`ResearchTask` is the long-lived question. Each `ResearchRun` is one attempt: `RUNNING → COMPLETED / FAILED`. With no or inadequate evidence, a completed run has `stopReason=INSUFFICIENT_EVIDENCE`, empty claim arrays and a clear message. No `ResearchReport` table is needed; the validated structured result belongs to one Run in `report Json`.

## Retrieval and report boundary

The shared `retrieveKnowledgeEvidence` service serves both Search Debug and Run creation. SQL filters the server-derived Workspace, READY documents, embedding model and dimension before Top-K. It adds document content hash and indexing version for provenance. A Run retrieves once and the focused report provider is called at most once. At most five Evidence items and 12,000 serialized Evidence characters enter a single bounded call (1,500 output tokens, 30-second timeout). Evidence is untrusted data, never a role instruction. C4 exposes no model tools or writes.

Every factual claim in summary, findings, analysis and conclusion has 1–3 citationKeys from **that run's retrieved Evidence Set**; there are at most 12 claims total and 500 characters per claim. Zod rejects malformed/extra fields; server validation rejects unknown keys and empty grounded reports. Only the server maps keys to title, excerpt, page, offsets, hash and version. Provider response never determines source metadata. Semantic support of a claim is not proven by key membership; C8 will evaluate it.

## Historical Citation Snapshot

`ResearchCitation` belongs to Run, with unique `(runId,citationKey)` and position. `documentId`/`chunkId` are provenance hints without source FKs. Deleting or reindexing a KnowledgeDocument cannot cascade a historical Citation. The report page always reads saved title/excerpt/page/offset/hash/version; it separately checks current source availability. A currently available source uses the existing Session/Workspace-protected signed GET; a missing source shows the historical snapshot and an unavailable message.

## Trust and ownership

The browser may choose a task ID in the URL but cannot submit Workspace, owner, or user IDs to create a Run. The server checks Session→Workspace→Task before recording RUNNING. Run detail checks Run→Task→Workspace. After generation, a short transaction saves snapshots, report JSON and COMPLETED. Provider/output errors leave FAILED with a short code and no report. An abrupt process stop can leave RUNNING; background recovery is later delivery work.
