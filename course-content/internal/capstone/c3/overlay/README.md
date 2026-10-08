# AI Research Workspace — internal C3 teaching reference

Assemble with `node scripts/assemble-capstone-reference.mjs c3 .runtime/<new-name>` from the course root. Students continue their own C2 project; this author reference is incremental C1 + C2 + C3 and is not the public Starter. It contains no report, ResearchRun, Agent, MCP, OCR or Citation Snapshot.

## Local services

Use an **isolated** PostgreSQL 17 database with pgvector and a **private** S3-compatible Bucket. The local teaching adapter is Garage 2.4.1 single node, previously provisioned by Phase 2. Configure the Bucket and access key privately, never commit credentials. Set `TEST_DATABASE_URL` and set `DATABASE_URL` to that same test URL for verification; do not use the course platform or production DB. Set the `S3_*` values in `.env.local` or your shell. `node scripts/setup-garage.mjs` checks/creates the Bucket and configures CORS for `C3_APP_ORIGIN` (normally `http://localhost:3118`). A successful browser preflight is required for direct signed PUT. Local single-node Garage is not a production storage promise; choose and test production object storage in C9.

## Verification

From a **new empty** test database: `npm ci`, `npm run db:migrate`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`. Start with `npm run start -- -p 3118` and mock mode. Run `npm run test:db` in another shell with the same isolated DB URL; for the broken-index experiment start the server with `C3_EMBED_FAIL_ONCE_AT=1`. The HTTP smoke asserts private signed PUT/GET, anonymous denial, sealed-source integrity after staging PUT replay, PDF pages, failure/retry without partial chunks, SQL-scoped search and Alice/Bob isolation. `npm audit --omit=dev` checks production dependencies. Default tests require no real Provider Key. To examine semantic quality, use a non-sensitive small file and opt-in real mode with server-only `AI_EMBEDDING_*` configuration, then run `node scripts/c3-real-smoke.mjs` after deterministic tests pass.

## Limits

PDF/MD/TXT, 10 MiB file, 100,000 normalized characters, 160 chunks, 800/120 chunk/overlap, 1024-dimensional embedding, five search hits, sequential embedding. `PROCESSING` has a 15-minute lease. Current synchronous processing must be revisited for long jobs at C9.
