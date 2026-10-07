# ADR 001 — Web and agent architecture

Status: Accepted for internal C2 spike
Date: 2026-10-07

## Decision
Use a Next.js and TypeScript modular monolith with PostgreSQL/Prisma. Introduce bounded Stage 4 runtime only in C5.

## Context
One developer must deliver a browser UI, server-side auth and APIs, private file handling, relational data, vector retrieval and a deployable product. The course already contains verified TypeScript primitives.

## Options and criteria
Scores: 1 poor, 3 strong. This is a project decision, not a universal ranking.

| Criterion | Next.js monolith | React + Express | React + FastAPI |
| --- | ---: | ---: | ---: |
| Unified frontend/server workflow | 3 | 2 | 1 |
| Reuse of verified course primitives | 3 | 2 | 1 |
| AI/provider integration | 3 | 3 | 3 |
| End-to-end type consistency | 3 | 3 | 1 |
| Deployment simplicity for one developer | 3 | 2 | 2 |
| Course maintenance | 3 | 2 | 1 |

## Trade-offs
Next.js binds the product to its server runtime and requires care with long agent calls. React + Express gives explicit service boundaries but duplicates routing and build configuration. FastAPI has a strong Python parsing/AI ecosystem but introduces two languages and contract generation for this cohort.

## Final choice
The existing Next.js/TypeScript primitives reduce integration risk while keeping the new product domain genuinely student-owned. Keep service boundaries as modules. Do not split microservices for V1.

## Agent decision
Reuse Stage 4's bounded runtime in C5, after students design ResearchRun. LangGraph offers graph/checkpoint abstractions but adds a second orchestration model to learn; a fresh ad hoc loop discards already tested bounds, cancellation and approval behavior. Revisit if the workflow grows into branching long-running jobs.

## Consequences
C2 must create the product schema and auth/workspace/task flow. C3 introduces object storage and pgvector. C5 integrates, rather than pre-installs, the runtime. Deployment must account for server execution limits.
