# C7 · Human-approved Knowledge Write

Internal Authoring. Continue the student's own C6 project; the author reference assembles Bootstrap + C1…C7 without replacing their Product Brief.

Assemble a fresh workspace with `node scripts/assemble-capstone-reference.mjs c7 .runtime/c7-reference-new`. In it run npm ci, lint, typecheck, test and build. Use an independent empty TEST_DATABASE_URL and the same DATABASE_URL; deploy all six migrations and inspect migrate status. Never use production/platform DB or db push.

Add server-only ACTION_APPROVAL_SECRET (at least 32 random bytes, independent of MCP credentials), AI_NOTE_MODE=mock or explicitly real. Node crypto handles approval; no new production dependency. Token is returned only for owned PROPOSED Actions, retained in browser memory, never stored in DB or logs.

`npm run test:db` runs actual HTTP security smoke then PostgreSQL integration tests. Start the application with mock research/embedding/report/note providers (default HTTP port3140), temporary server-only approval secret, isolated DATABASE_URL and matching TEST_DATABASE_URL. Give the smoke process the same temporary secret to sign an expired test token; this is a test-only signer, not a route clock override. Integration tests inject rollback/clock through direct function hooks only. HTTP cannot request either.

Opt-in `C7_REAL_SMOKE=1 node scripts/c7-real-smoke.mjs` (default port3141) requires real C3 storage/embedding, real C5 report/workflow and real Note Provider. It uploads a non-sensitive TXT, creates a real private grounded report, asks the real model for a Note Proposal, edits a phrase, approves/replays and verifies one Note. Record only latency/lengths/version/counts; no tokens or raw provider output.

Proposal → Edit/Reject/Approve is a separate lifecycle. ResearchRun remains COMPLETED. Notes are independent of file knowledge, never automatically embedded/indexed. Source Run deletion sets sourceRunId null while retaining Note. Capstone remains locked, formal Stage count29; no C8 eval or C9 recovery/deployment.
