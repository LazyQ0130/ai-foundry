# Capstone C7 author validation

Validated 2026-10-08. Internal Authoring; not a release approval.

## 1. C7 Verdict

PASS WITH CHANGES. C7 teaching reference and lesson are complete. Inherited dependency advisories remain; no production release or unlock occurred.

## 2. Learning Objective

Students separate proposal, human decision and exact execution; understand canonical arguments, version-bound approval, atomic writes, replay and provenance. Lesson duration is 120–150 minutes.

## 3. Product Write Decision

Saving knowledge is a post-run action. Research success does not depend on whether a person accepts a Note. No write tool joins the C6 Research Runtime.

## 4. ResearchRun / ResearchAction / KnowledgeNote Lifecycle

Run remains COMPLETED. One Action per Run: PROPOSED → REJECTED or EXECUTED. Edit increments version while PROPOSED. KnowledgeNote is a separate Workspace asset.

## 5. Stage 4 Approval Reuse Audit

Reviewed S4-L6 agent-approval-v2.ts, agent-confirm-transaction.ts, agent-idempotency.ts and agent-persistence.ts. Retained canonicalization, exact HMAC binding, TTL, constant-time verification, row lock, transaction, deterministic keys and replay. Reimplemented around Capstone ownership. Did not copy Resource/AgentRun/AgentStep/waiting_approval/save_research_note/UI/persistence domain. Detailed audit is in C7 overlay docs/architecture.md.

## 6. Proposal Provider

Mock and real strict title/content providers. The route accepts only {}, loads the owned persisted grounded report and snapshots, rejects ineligible reports and persists only a successful Proposal. No tools, new retrieval or Note writes. Concurrent initial generation is tested to persist one Action.

## 7. Canonical Args

Strict validation, trim, title 1–120/content 1–2000 and deterministic title/content JSON field order. Stored canonical representation and deterministic key are rechecked before execution.

## 8. Edit / Versioning

Locked edit accepts title/content/expectedVersion; updates args, version and key. Old approval token gets 403; stale edit gets 409. Human-modified content is not labeled automatically grounded.

## 9. Approval Token

HMAC-SHA256 binds versioned audience/tool, user, workspace, Run, Action, Action version, canonical args hash, expiry and nonce. Five-minute TTL, server-only secret at least 32 bytes, constant-time signature check. No full Note content or DB token storage. GET dynamically issues current PROPOSED token. Expiry is tested with injected clock and a signed expired HTTP token; no five-minute sleep or HTTP clock override.

## 10. Reject

Strict expectedVersion, ownership and lock; only PROPOSED can become REJECTED. No Note, no subsequent edit/approve, no regenerated second Action. Run stays COMPLETED.

## 11. Atomic Execution

Approve body contains only approvalToken. One short transaction locks and rechecks current persisted Action, ownership, version/hash/TTL; inserts exact stored args and marks EXECUTED. No Provider/network inside the transaction. No APPROVED intermediate state.

## 12. Idempotency / Replay

Unique Action.idempotencyKey and KnowledgeNote.sourceActionKey. Valid repeated approval returns the same Note with replayed:true. Expired tokens remain invalid even for replay; an existing Note can be read normally.

## 13. Concurrent Approval

Actual HTTP Promise.all and actual PostgreSQL integration test both pass: one created result, one replay, one Note with identical ID. Row lock serializes the decision; unique key enforces the final invariant.

## 14. Transaction Rollback

Dedicated direct integration hook throws INJECTED_ROLLBACK after INSERT and before Action update. Observed Note count 0 and Action PROPOSED, followed by successful retry producing one Note. Hook is never accepted or forwarded by HTTP routes.

## 15. KnowledgeNote

Workspace-owned asset; Knowledge area list/detail and Run Action panel support loading, empty, error/retry and busy states. Exact content is shown before approval. Editing requires save and renewed confirmation. There is no direct Note POST creation endpoint.

## 16. Provenance

Note links to source Run. sourceRunId is nullable ON DELETE SET NULL; deletion of the source Task/Run leaves Note readable. sourceActionKey does not create a cascading dependency on Action. Integration test proves survival and unchanged Document/Chunk counts.

## 17. Failure Experiments

Implemented exercises/tests for direct write bypass, stale edit token, sequential duplicate, concurrent approval, transaction rollback, reject then approve/edit, expiry, tamper, wrong bindings, Bob/anonymous, extra ownership fields, approval content injection and ineligible report. Provider failure leaves no half Action or Run mutation.

## 18. Isolation

HTTP Alice/Bob/anonymous checks cover Proposal, Action GET/edit/reject/approve and Note list/detail. Identity derives from server Session → User → Workspace; Action predicates additionally follow Run → Task → Workspace owner. Cross-origin writes are rejected. Client owner/workspace/content fields cannot override the server boundary.

## 19. Student Ownership

Student decides post-run lifecycle, exact human review, edit/reject policy, deletion semantics and write scope; inspects migration, bindings, locks, constraints and attack evidence. AI can generate boilerplate, UI and tests. Seven prompts preserve the demand → prompt → diff → explain → run → break → fix → rerun workflow.

## 20. C7 Reference

Assembles Bootstrap + C1…C7 in a fresh ignored workspace. Adds Action/Note schema and sixth migration, provider, canonicalization/approval primitives, write service/routes, separate UI, Notes UI, tests and architecture. A separate fresh assembly matched the verified final reference byte for byte across all 117 assembled files.

## 21. C8 / C9 Boundary

No automatic Note embedding/indexing/RAG ingestion, restarted Agent, write runtime tool, Eval, worker, queue, resume or production deployment. Capstone remains 暂未解锁 and formal lessons remain 29. No entitlement, catalogue, purchase or published lesson changes.

## 22. Security / Dependency Audit

C7 adds zero production dependencies and inherits the C6 lock. npm audit --omit=dev: 1 moderate, 4 high, 0 critical; affected package entries @prisma/config, deepmerge-ts, next, postcss, prisma. Full npm ci audit: 1 moderate, 9 high including development dependencies. These remain release risks; no force upgrade was applied during C7. Node crypto supplies HMAC/hash/random/constant-time operations. Only .env.example with placeholders is tracked; actual secrets, tokens, test DB configuration and logs stay in ignored runtime or process memory.

## 23. Lesson Verification

check:capstone-c7 PASS: Renderer V2 frontmatter/parser, 7 prompts, 7 globally unique stable checkKeys, all seven relevant block types, lifecycle/contracts/migration and boundaries. Root check PASS includes authored lessons, catalogue, Starter consistency and C2–C7 checks. Published content remains 30 files including preparation and 29 formal lessons.

## 24. Full Verification

Fresh reference .runtime/c7-reference-final:

| Command / check | Result |
|---|---|
| npm ci | PASS, 380 packages; inherited advisories above |
| npm run lint | PASS |
| npm run typecheck | PASS |
| npm test | PASS, 33/33 |
| npm run build | PASS, also rerun after final UI retry correction |
| prisma migrate deploy | PASS, all six migrations on empty c7_final and c7_real_final |
| prisma migrate status | PASS, up to date |
| C7 HTTP smoke | PASS, real HTTP requests against built Next server |
| tsx --test test/knowledge-write.integration.ts | PASS, 5/5 actual PostgreSQL tests |
| npm audit --omit=dev | Completed, reports five inherited advisories; nonzero audit status is not a clean audit |
| Fresh assembly equality | PASS, 117/117 files |
| Root npm run check | PASS |
| Root npm test | PASS, 84/84 |
| Root npm run build | PASS; existing Vite large-chunk warning |
| git diff --check | PASS before commit |

Reference databases are isolated local PostgreSQL at port 55439; no production or platform database was used for C7 Reference tests. Root regression tests used the existing dedicated aifoundry_test schema. No db push. Temporary launchers generate secrets in memory, coordinate app/smoke environments and terminate app processes afterwards; local C7 and Garage containers are stopped after verification without deletion.

## 25. Real Smoke

PASS: real object-store upload + embedding → real bounded private research → grounded report with two citations → real Note Proposal → human edit v2 → approve → replay → one exact persisted Note. Non-sensitive agent-memory fixture only. Proposal latency 2803 ms; title length 60; content length 1344; version 2; replayed true; Note count 1; source Run 1; whole smoke 17907 ms. No approval token, secret or provider raw response recorded. Smoke is opt-in C7_REAL_SMOKE=1.

## 26. Remaining Risks

- Semantic fidelity of generated Notes belongs to C8; strict JSON and approval do not prove factual faithfulness.
- Human edits are not automatically grounded claim by claim. UI explicitly labels human confirmation.
- Process crashes, production recovery/execution and deployment belong to C9.
- Existing dependency advisories remain unresolved release risks.
- Concurrent first Proposal requests can spend duplicate Provider work before the short lock; persistence is still unique. Bounded output and human review remain necessary.

## 27. Files Changed

Complete file list (31 files):

- course-content/internal/capstone/c7/README.md
- course-content/internal/capstone/c7/lesson-draft.md
- course-content/internal/capstone/c7/overlay/.env.example
- course-content/internal/capstone/c7/overlay/app/api/knowledge/notes/[id]/route.ts
- course-content/internal/capstone/c7/overlay/app/api/knowledge/notes/route.ts
- course-content/internal/capstone/c7/overlay/app/api/research/actions/[actionId]/approve/route.ts
- course-content/internal/capstone/c7/overlay/app/api/research/actions/[actionId]/reject/route.ts
- course-content/internal/capstone/c7/overlay/app/api/research/actions/[actionId]/route.ts
- course-content/internal/capstone/c7/overlay/app/api/research/runs/[runId]/knowledge-note-proposal/route.ts
- course-content/internal/capstone/c7/overlay/app/api/research/runs/[runId]/route.ts
- course-content/internal/capstone/c7/overlay/app/knowledge/notes/[id]/page.tsx
- course-content/internal/capstone/c7/overlay/app/knowledge/notes/page.tsx
- course-content/internal/capstone/c7/overlay/app/knowledge/page.tsx
- course-content/internal/capstone/c7/overlay/app/runs/[runId]/page.tsx
- course-content/internal/capstone/c7/overlay/components/KnowledgeActionPanel.tsx
- course-content/internal/capstone/c7/overlay/docs/architecture.md
- course-content/internal/capstone/c7/overlay/lib/knowledge-note-approval.ts
- course-content/internal/capstone/c7/overlay/lib/knowledge-note-contract.ts
- course-content/internal/capstone/c7/overlay/lib/knowledge-note-provider.ts
- course-content/internal/capstone/c7/overlay/lib/knowledge-write-http.ts
- course-content/internal/capstone/c7/overlay/lib/knowledge-write-service.ts
- course-content/internal/capstone/c7/overlay/prisma/migrations/20261012000000_human_knowledge_write/migration.sql
- course-content/internal/capstone/c7/overlay/prisma/schema.prisma
- course-content/internal/capstone/c7/overlay/scripts/c7-http-smoke.mjs
- course-content/internal/capstone/c7/overlay/scripts/c7-real-smoke.mjs
- course-content/internal/capstone/c7/overlay/test/knowledge-note.test.ts
- course-content/internal/capstone/c7/overlay/test/knowledge-write.integration.ts
- docs/capstone-c7-validation.md
- package.json
- scripts/assemble-capstone-reference.mjs
- scripts/check-capstone-c7.ts

## 28. Git

Authorized commit: Build Capstone C7 human-approved knowledge writes. Target origin/main. Final delivery message records verified commit SHA, remote equality and clean working tree after push; this report is part of that commit.
