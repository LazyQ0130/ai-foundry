# Architecture — C3 teaching reference

## Current system

```text
Browser
  ↓
Next.js modular monolith
  ├─ Session Auth → Personal Workspace
  ├─ ResearchTask
  └─ Knowledge
      ├─ private S3-compatible object storage (Garage locally)
      ├─ PDF/MD/TXT parser → normalized pages → deterministic chunks
      ├─ focused 1024-dimensional embedding adapter
      └─ PostgreSQL 17 + pgvector
```

One application and one relational database remain. External MCP, Agent runtime, ResearchRun, reports, Citation snapshots and notes are **not implemented yet**.

## Document lifecycle

`PENDING_UPLOAD → PROCESSING → READY / FAILED`. The server signs a fixed PUT after Session/Workspace verification and generates a staging object key. The browser uploads directly to a private bucket. Processing rechecks actual object size, MIME and file content, then writes verified bytes to a fresh server-only sealed key before the short DB commit. A signed staging PUT can be replayed until expiry but cannot change a READY document's sealed source. A short processing lease prevents simultaneous work; stale work can be retried. Failed parsing or embedding cannot mark a document READY.

## Current domain

```text
User → one Workspace
          ├─ ResearchTask
          └─ KnowledgeDocument → KnowledgeChunk → vector(1024)
```

`KnowledgeDocument` holds metadata and an object key, never a permanent public URL. The original private file is the source preview path for C4: after authorization, a short signed GET can retrieve it and the parser can reconstruct normalized page text. We intentionally do not duplicate the entire extracted text in the database. Chunk content and locators are retained for current retrieval.

## Locator contract

PDF `page` is 1-based and offsets index normalized **page** text. MD/TXT use `page = null` and offsets index normalized **document** text. Offsets are JavaScript UTF-16 string indices, not PDF byte positions. `citationKey` hashes contentHash, indexingVersion, page, offsets and content; parser/normalization changes require a version change. C3 does not save a citation snapshot.

## Index commit and retrieval

Parse, chunk, all external embeddings and sealed-object write finish before a short transaction replaces chunks, switches objectKey and marks READY. A failed transaction rolls back all chunks; a failure records FAILED and best-effort removes an orphan sealed object. The staging object is best-effort removed after success. `(documentId, indexingVersion, position)` is unique. Retrieval SQL joins Document and Chunk, filters the current server-derived Workspace, READY status, embedding model and 1024 dimension, then orders by vector distance and limits to five. Mock vectors prove pipeline behavior but not semantic quality.

## V1 limits

PDF/MD/TXT only; 10 MiB per file; 100,000 normalized characters; 160 chunks; 800-character chunks with 120 overlap; 500-character query; sequential embedding; 15-minute processing lease. This synchronous design is suitable for the teaching reference; long jobs and production object storage need C9 deployment evaluation.
