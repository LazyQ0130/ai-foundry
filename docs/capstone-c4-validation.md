# Capstone C4 internal validation — 2026-10-08

## Scope

C4 starts from the student’s own C3 project. The internal reference assembles Bootstrap + C1 + C2 + C3 + C4. This remains internal authoring: Capstone stays locked and the published Stage count remains 29. C4 adds one retrieve-once/generate-once ResearchRun, a structured GroundedReport contract, historical ResearchCitation snapshots, report UI and Source Preview. It does not add C5 Agent workflow, tools, MCP, approval or notes.

## Evidence

| Check | Result |
| --- | --- |
| Fresh assembly in `.runtime/c4-reference-final` | PASS |
| `npm ci` | PASS; no new dependency compared with C3 |
| `prisma migrate deploy` on isolated empty `c4_final` PostgreSQL 17 + pgvector DB | PASS; C2 initial → C3 knowledge → C4 grounded report |
| Reference `npm run lint` / `npm run typecheck` / `npm test` / `npm run build` | PASS; 10 unit tests |
| Reference `npm run test:db` | PASS; Grounded, no evidence, fake citation, malformed output, Provider error, unique citation constraint, ownership, reindex, deletion |
| Real opt-in smoke, two-page non-sensitive PDF | PASS; private upload → real embedding `text-embedding-v4` → pgvector → real chat `qwen3.7-flash` → grounded report → 1 citation → signed source GET, 26,987 ms on final run |
| Root `npm run check` / `npm run typecheck` / `npm test` / `npm run build` | PASS; root tests 84/84 |
| C1/C2/C3/C4 lesson checkers | PASS; C4 has 7 unique checkKeys, 6 prompts and Renderer V2 blocks |
| `npm audit --omit=dev` in C4 reference | Existing 1 moderate / 4 high (`next`, `postcss`, `prisma`, `@prisma/config`, `deepmerge-ts`), matching C3; no added dependency surface |

The HTTP smoke seeds a READY KnowledgeDocument and vector Chunk directly in the isolated DB to test the C4 boundary deterministically. The separate real smoke exercises C3 private upload, indexing and Source Preview end to end. A fake citation or malformed output creates FAILED with no report/citations. A Workspace with no READY Evidence creates COMPLETED/INSUFFICIENT_EVIDENCE without calling the Provider. Reindex changes live Chunk content while the old snapshot stays fixed; deleting the Document cascades the Chunk while the historical report and snapshot remain readable and mark the live source unavailable. Bob cannot create a Run for Alice’s Task, read Alice’s Run or obtain Alice’s signed source URL; anonymous calls are rejected.

## Limits to carry forward

The server proves citation keys belong to that run’s retrieved Evidence; it does not prove that the quoted passage semantically entails every generated claim. C8 needs a fixed quality evaluation set. This synchronous teaching version can leave RUNNING after abrupt process termination; C9 needs recovery and deployment policy. A single real smoke proves integration, not general report quality. Existing dependency advisories require a separate upgrade pass before release.
