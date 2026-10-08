# C6 internal teaching reference

Continue the student's own C5 project. Author validation assembles C1→C6 incrementally; this overlay is not a replacement Product Brief.

```powershell
node scripts/assemble-capstone-reference.mjs c6 .runtime/c6-reference-new
```

In the new runtime: `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`. Use only a separately provisioned TEST_DATABASE_URL; set DATABASE_URL to the same isolated empty database, then `npx prisma migrate deploy` and `npx prisma migrate status`. Never use the course platform database or db push.

Server configuration adds MCP_EXTERNAL_URL (fixed `/api/mcp/external-research`), MCP_EXTERNAL_AUTH_SECRET (random≥32 bytes, server only), optional CROSSREF_MAILTO. Explicit local production-build testing uses MCP_ALLOW_LOCAL_HTTP=1; production uses HTTPS. Configure existing C3 storage/embedding and C5 chat providers as before. No secrets are in this reference.

Deterministic HTTP test: run the opt-in `C6_TEST_MCP_FIXTURE=1` service `node --import tsx scripts/c6-mcp-fixture.ts` on 3133 with a temporary server-only MCP secret. Run the application on 3132 with the same secret, MCP_EXTERNAL_URL=http://127.0.0.1:3133/api/mcp/external-research, AI_RESEARCH_MODE/AI_REPORT_MODE/AI_EMBEDDING_MODE=mock and explicit localhost allowance. Then `npm run test:db`. Fixture has no production imports and makes no Crossref network requests; its extra tool must never enter the application registry.

Real smoke: use a separate empty DB and real C3/C5 providers/storage, configure the application MCP URL to its own fixed endpoint (default smoke port3134), set C6_REAL_SMOKE=1, then `node scripts/c6-real-smoke.mjs`. This opt-in sends public keywords to Crossref, consumes configured AI provider calls and uploads only the non-sensitive memory fixture. It requires actual private and external citations; fixture/model-scripted decisions do not qualify. Logs contain counts, query, safe step summaries and latencies, never tokens or complete abstracts.

Internal Authoring only. Capstone remains locked and formal Stage lesson count remains 29.
