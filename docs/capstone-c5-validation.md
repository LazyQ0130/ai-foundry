# Capstone C5 internal validation — 2026-10-08

## Scope

C5 remains internal authoring. Bootstrap + C1 + C2 + C3 + C4 + C5 assemble into a separate teaching reference. Capstone stays locked and the 29 published Stage lessons are unchanged. Only private `search_knowledge` is available; there is no external source/MCP, write tool, approval, KnowledgeNote, Resume, Queue or Worker.

## Stage 4 Reuse Audit

Inspected `course-content/internal/stage-4/s4-l5/common/lib/agent-runtime.ts`, `agent-provider.ts`, `course-content/internal/stage-4/s4-l4/common/lib/agent-tools.ts`, and `starter/stage-4/lib/ai-provider.ts`. Kept the bounded for-loop, one-tool-per-turn validation, unknown/multiple rejection, AbortSignal, max steps/tools, budget and the configured Qwen non-thinking option as **design primitives**. The C5 runtime, model adapter and service are newly written for ResearchTask/Run/Step and C4 Evidence/Report/Citation. No Stage 4 Experiment UI, echo tool, Resource logic, `save_research_note`, MCP reference, approval path, old persistence wiring or old result fields were copied.

## Deterministic verification

| Check | Result |
| --- | --- |
| New `.runtime` assembly and `npm ci` | PASS; no new dependency |
| Empty isolated PostgreSQL 17 + pgvector, C2→C3→C4→C5 `prisma migrate deploy` and `migrate status` | PASS; schema current |
| Reference lint/typecheck/unit/build | PASS; 19 unit tests on final fresh assembly |
| Reference HTTP smoke | PASS; Brief→Model→Tool→Evidence→Stop→C4 Report/Citation→Step reload |
| Failure smoke | PASS; unknown tool, bad/extra args, multiple tools, max steps/tools, budget, early stop, Tool/Provider/Brief errors, cancellation |
| Isolation | PASS; Bob and anonymous cannot start/read/cancel Alice’s Run or obtain her source URL |
| Historical C4 Run | PASS; null Brief and empty Steps remain readable |
| C5 checker | PASS; Renderer V2, seven unique checkKeys, seven prompts, C4 contract and C6/C7 boundary |
| Root `npm run check`, `npm run typecheck`, `npm test`, `npm run build` | PASS; 84/84 root tests; Capstone remains locked |

Step positions are continuous and uniquely constrained. Each real action starts with a persisted RUNNING Step and finishes with status, bounded summary and latency; private Chunk content and Provider raw bodies are not stored in Timeline. A repeated citationKey is retained once in the final Evidence Set. Non-normal stop outcomes produce no report or Citation. The cancellation smoke observes CANCELLED, cancelRequestedAt, preserved Steps and no subsequent Tool.

## Real opt-in integration

The first smoke with a two-page fixture correctly stopped at MAX_TOOLS when the model kept searching; a second attempt recorded TIMEOUT on a 30-second model call. Neither created a false report. We then used a non-sensitive note that actually describes two persistent memory approaches and reused Stage 4’s verified `enable_thinking: false` setting for the configured Qwen model. Final fresh-assembly smoke passed: private TXT upload, real `text-embedding-v4`, real `qwen3.7-flash` Brief/decisions, two `search_knowledge` calls, explicit stop, C4 GroundedReport validation, two Citation snapshots, signed source read. The final run had seven Steps and took 14,561 ms. This is integration evidence, not a report-quality evaluation.

## Security, dependency and remaining limits

No new production package is added. Production audit remains the existing C3/C4 surface: 1 moderate and 4 high advisories in `next`, `postcss`, `prisma`, `@prisma/config`, `deepmerge-ts`. Tool arguments contain only `query`; Workspace is server-derived. Tool output is untrusted data. The single real smoke does not prove semantic grounding or prompt-injection resistance; C8 needs a fixed evaluation set. Explicit cancellation blocks subsequent actions, while an already-started Provider call may still incur cost. Abrupt process death can leave RUNNING, and in-process abort cannot reach a different server instance; C9 needs a production recovery and execution policy.
