# Architecture — C5 teaching reference

```text
Browser → Next.js modular monolith
  ├─ Session → Personal Workspace
  ├─ ResearchTask → ResearchRun(brief, status, stopReason)
  │                     ├─ ResearchStep[] timeline
  │                     ├─ bounded Research Runtime
  │                     │    └─ read-only search_knowledge → shared Retrieval Service
  │                     └─ C4 GroundedReport + ResearchCitation snapshots
  └─ KnowledgeDocument → KnowledgeChunk → PostgreSQL + pgvector
       └─ private S3-compatible original source
```

## Product workflow

The Route checks Origin, Session and server-derived Workspace→Task ownership. Research Service creates RUNNING Run and a BRIEF Step before the Brief Provider call, stores a small validated Brief, then invokes the bounded Runtime. Runtime controls one model decision and at most one strictly validated tool call per turn, accumulating at most five unique Evidence rows by citationKey. It has no Prisma or HTTP dependency. Service creates and finishes a Step around each real action. Timeline summaries are limited to 500 characters; raw private Evidence, system prompts and Provider bodies are not persisted there.

The provider must call the sole forced `plan_research_step` function exactly once with tool_calls or stop finish reason (Planner-only provider compatibility). Strict discriminated decisions permit private search or ready. The adapter maps search to the existing business Registry; only action=ready means internal ready. Planner content is discarded. Invalid/missing/multiple calls, length/content_filter and unknown finishes fail closed. A stop without a valid forced function is never ready. Shared provider metadata is preserved; safe compatibility diagnostics contain no arguments or content. This control envelope is not a business Tool and consumes no Tool count; the model call still consumes one Provider unit. Only internal ready with nonempty Evidence reaches the existing C4 `generateReport` → `validateGroundedReport` → `citationSnapshots` path. C4 Report JSON and Citation Snapshot semantics remain. Zero Evidence produces COMPLETED/INSUFFICIENT_EVIDENCE. MAX_STEPS, MAX_TOOLS, BUDGET_EXHAUSTED, TIMEOUT, FAILED and CANCELLED never masquerade as a completed report. C4 historical Runs with null Brief and no Steps remain readable.

## Limits and cancellation

Server constants: four model steps, three tool calls, 120-second Run deadline, ten per-Run units covering Brief/model/search/report; each Provider HTTP call is capped at 30 seconds. Browser and model cannot raise them. Explicit cancel route checks Run→Task→Workspace, atomically records CANCELLED and cancelRequestedAt, and aborts the active in-process signal. Service checks the DB flag/status before each subsequent action. An already-started external request may still incur cost. Abrupt process death can leave RUNNING; no Resume, Queue or Worker is implemented.

## Stage 4 reuse audit

Inspected `course-content/internal/stage-4/s4-l5/common/lib/agent-runtime.ts`, `agent-provider.ts`, `course-content/internal/stage-4/s4-l4/common/lib/agent-tools.ts` and `starter/stage-4/lib/ai-provider.ts`. Retained the bounded for-loop, one-tool-per-turn validation, unknown/multiple rejection, AbortSignal, max steps/tools and Provider budget ideas; reused the verified `enable_thinking: false` option for configured `qwen3.7-flash`. Reimplemented these as Capstone-specific modules. Did not copy Stage 4 Experiment UI, echo, Resource logic, `save_research_note`, external reference/MCP, approval, old persistence wiring or old result fields. New product parts are Brief, ResearchStep callbacks, Workspace-bound read tool, Evidence Map and C4 report handoff.

## Future boundary

External MCP, external source types, write tools, AgentAction, approval and KnowledgeNote are **not implemented yet**. C6/C7 may extend the product policy later; C5 exposes only `search_knowledge`.
