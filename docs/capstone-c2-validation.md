# Capstone C2 internal authoring validation

Date: 2026-10-08. Status: PASS WITH CHANGES. Internal only.

## 1. C2 Verdict

PASS WITH CHANGES: the Phase 2 engineering spike was retained and reshaped into a student lesson and teaching reference. The changes add an explicit architecture decision and domain explanation, a usable minimal UI, observable states, and stronger isolation smoke coverage.

## 2. Learning Objective

Students derive engineering constraints from their own C1 product definition, decide an architecture, model the first domain, and validate a complete login → Workspace → persistent ResearchTask chain. Previously learned full-stack primitives are reused at product level.

## 3. Requirement → Engineering Mapping

Private research → Session plus ownership; persistent task → PostgreSQL; repeatable research → Task/Run separation; future grounded reports → private files/retrieval/citations; future external research → controlled MCP; notes → approval boundary. Only the first two are implemented in C2.

## 4. Architecture Decision

The lesson compares Next.js + TypeScript, React + Express + TypeScript, and React + FastAPI using project-specific criteria and student-owned weighting. The reference chooses Next.js/TypeScript modular monolith with PostgreSQL/Prisma; its ADR records the alternatives, their advantages and costs, and conditions to revisit. Agent runtime reuse is decided for C5, not installed in C2.

## 5. Domain Model

User is the account; Workspace is the ownership scope; ResearchTask is a long-lived research question. `Workspace.ownerId` is unique, and registration creates User, Workspace and Session together. ResearchRun, KnowledgeDocument and KnowledgeNote remain future objects.

## 6. Auth Reuse

The assembler copies only reviewed Stage 4 auth/password/Prisma primitives and login/logout/me routes. The C2 registration transaction, Workspace lookup, task input and product routes are C2-specific. Session, HttpOnly cookie, token hash, expiry, password hash and same-origin write rejection are verified in the actual reference code and HTTP path.

## 7. Vertical Slice

Browser → task form → POST `/api/research/tasks` → strict Zod input → server Session → server-derived Workspace → Prisma → PostgreSQL. GET filters by the same Workspace. The UI exposes loading, empty and error states, and a new GET after creation proves persistence.

## 8. Failure Experiments

Break 1 asks students to reduce an unsupported gateway/microservice/Redis/Kafka/Kubernetes design to the current modular monolith, recording when to revisit. Break 2 injects `workspaceId`, `userId` and `ownerId`; each is rejected with 400 in the smoke test.

## 9. Student Ownership

Students choose criteria, stack, modular monolith rationale, Workspace domain role, Task/Run split and Slice scope. AI may generate boilerplate. Students inspect migration, transaction, Session/Workspace boundary, strict input, diff and isolation results.

## 10. C2 Reference

The assembler starts from C1 docs and Bootstrap, then adds `docs/architecture-decision.md`, `docs/architecture.md`, Prisma schema/migration, Auth, Workspace, ResearchTask routes, minimal UI and HTTP smoke. Students continue their own C1 project; this is an internal author reference.

## 11. C3 Boundary

The C2 schema has exactly User, Session, Workspace and ResearchTask. The checker rejects C3+ schema names and known future route/module paths. No KnowledgeDocument, KnowledgeChunk, Embedding, pgvector setup, storage, parser, Agent, ResearchRun, Citation, MCP or Note implementation is present.

## 12. Database / Isolation Verification

An isolated PostgreSQL 17 container at local port 55434 was initialized empty. `prisma migrate deploy` applied the sole initial migration; SQL has four tables, three foreign keys, unique Workspace owner, task scope index and cascades. HTTP smoke passed Alice/Bob registration, distinct automatic Workspaces, task creation, fresh GET persistence, Bob list/detail isolation, anonymous GET/POST rejection, three injected fields, cross-origin rejection, logout and login. Database counts after smoke: 2 Users, 2 Workspaces, 1 ResearchTask.

## 13. Lesson Verification

`scripts/check-capstone-c2.ts` passes Renderer V2 parsing, six globally unique C2 checkKeys, five prompt blocks, required teaching blocks, student decision/failure topics, ownership source checks, C3 schema/file checks and locked showcase. ADR template matches the shared template. C1 checker passes too.

## 14. Full Verification

Reference: `npm ci`, `npm run lint`, `npm run typecheck`, `npm test` (1 bootstrap test), `npm run build`, `npm run test:db` all passed. Root: `npm run typecheck`, `npm test` (84 passed), `npm run build`, `npm run check`, `git diff --check` all passed. Root check confirms 29 formal Stage lessons remain unchanged and Capstone remains locked. `npm ci` reported 10 dependency audit findings (1 moderate, 9 high) in the existing pinned reference dependency tree; no dependency upgrade was included in this curriculum change.

## 15. Files Changed

`course-content/internal/capstone/c2/lesson-draft.md`; `course-content/internal/capstone/c2/architecture-decision.md`; `course-content/internal/capstone/c2/overlay/README.md`; `course-content/internal/capstone/c2/overlay/app/page.tsx`; `course-content/internal/capstone/c2/overlay/app/styles.css`; `course-content/internal/capstone/c2/overlay/docs/architecture.md`; `course-content/internal/capstone/c2/overlay/scripts/c2-http-smoke.mjs`; `scripts/assemble-capstone-reference.mjs`; `scripts/check-capstone-c2.ts`; `starter/capstone/docs/templates/architecture-decision.md`; `package.json`; this report.

## 16. Git

Commit subject: `Build Capstone C2 architecture and vertical slice`. The final task response records the resulting SHA and push/working-tree status. No `.env`, connection URL, cookie token or local runtime artifact is tracked.
