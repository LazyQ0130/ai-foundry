# C7 Architecture: human-approved knowledge writes

## System context

Browser → Next.js modular monolith → PostgreSQL. The inherited private object store, embedding, grounded report and bounded read-only research runtime remain C3–C6 capabilities. C7 adds a post-run write service, not a runtime tool.

## Lifecycle and domain

User → unique Personal Workspace → ResearchTask → ResearchRun.

A COMPLETED grounded Run can have exactly one ResearchAction. Its lifecycle is PROPOSED → REJECTED or PROPOSED → EXECUTED. ResearchRun stays COMPLETED throughout. A rejected or executed Action cannot be regenerated. Edit is available only while PROPOSED and increments version.

KnowledgeNote is a Workspace asset with title, content, nullable sourceRunId and unique sourceActionKey. Deleting a Task/Run cascades its Action, but sets the Note sourceRunId to null. The Note remains available. No automatic indexing, embeddings or retrieval inclusion occur.

## Trust boundary

Proposal POST accepts only an empty object. The server loads the owned persisted grounded report and citation snapshots. The Provider returns strict title/content; it has no tools and cannot write. Its output is untrusted and requires human review. An edited Note is not automatically verified claim by claim.

Session → User → Workspace establishes identity. Action and Note queries enforce that scope on the server. Client userId, workspaceId, ownerId, report and approval content are rejected by strict contracts.

Canonical args trim and validate title/content, then serialize in fixed field order. Edit updates canonical args, version and idempotency key. GET issues a fresh approval token for the current proposed version without storing the token.

## Approval and execution

HMAC-SHA256 approval binds audience, tool, user, workspace, Run, Action, version, canonical args hash, expiry and nonce. TTL is five minutes; the server-only secret requires at least 32 bytes. Signature verification uses constant-time comparison. Token payload contains no full Note content.

Approve accepts only approvalToken. A short PostgreSQL transaction locks the Action, rechecks ownership, lifecycle and exact token binding, and writes the database canonical args. Creating the Note and marking EXECUTED commit together. No Provider or network work happens in this transaction.

Action idempotencyKey and Note sourceActionKey are unique. A concurrent caller waits on the row lock and returns the same Note as a replay. A failure after Note INSERT rolls back both operations; a retry can execute normally. This is a database transaction guarantee, not a production crash recovery system.

## Stage 4 reuse audit

Reviewed `agent-approval-v2.ts`, `agent-confirm-transaction.ts`, `agent-idempotency.ts` and `agent-persistence.ts` from the internal Stage 4 S4-L6 reference.

Retained principles: strict canonical args, exact approval binding, HMAC and constant-time verification, TTL, transactional row locking, deterministic idempotency keys, persisted result and replay.

Reimplemented for ResearchAction/KnowledgeNote. Did not copy Stage 4 Resource, AgentRun, AgentStep, waiting-approval lifecycle, save_research_note business operation, UI or persistence domain. No write tool was added to the C6 Research Runtime.

## Verification and future work

Unit tests cover canonical args and token boundaries. Dedicated database tests cover concurrent first proposal, concurrent approval, rollback, stale versions, expiry and Note survival. HTTP smoke checks strict input, Alice/Bob/anonymous isolation, cross-origin writes, reject and replay. Real smoke runs a real grounded report and real proposal before human edit and approval.

C8 will evaluate semantic fidelity; human review is still required. C9 will address process crashes and production execution. No worker, queue, resume, deployment or additional write tools are implemented here. Existing inherited dependency advisories remain documented in the author validation report.
## C8 Product Eval & Regression

Product code and the six existing migrations remain inherited from C7. Eval is a CLI against a dedicated allowlisted local test database, built Next HTTP server and synthetic S3 stub, with four layers: Functional, Quality, Safety, Reliability. No Eval business tables or product dashboard exist.

25 fixed cases combine real database/HTTP observations, product primitives and labeled external stubs. Gold uses six synthetic documents, ten retrieval queries, two unsupported questions, approved/forbidden claims, negation/number/entity and AI Note fidelity. Deterministic reports and real quality reports stay separate. Safety counters are zero-only hard gates; quality thresholds are reviewed after baseline; execution/setup errors are INCOMPLETE. Fault injections change observations only and prove FAIL/INCOMPLETE behavior.

JSON/Markdown reports live under ignored .runtime. Reviewed baseline stores safe aggregate metrics and stable case status, bound to dataset and runner versions. Comparison reports improved/unchanged/regressed and blocks regressions. Reports omit documents/chunks/prompts/vectors, cookies, approval tokens, secrets and raw provider responses.

Real Eval is explicit opt-in: fixed9 cases, ten semantic queries, four reports, mixed private/Crossref evidence, Note fidelity, two bounded workflows; direct call caps and total deadline constrain cost. Optional C8_JUDGE=1 enables a bounded Note fidelity judge with only claim+cited excerpt; lexical flags remain visible and no safety gate relies on its score. Exact gold and lexical signals have limited semantic coverage; human-edited Notes remain human-confirmed. Cloud IAM/signature behavior is not proved by the local S3 stub.

Stage4 S4-L7 runner/context/probe/report patterns were reviewed: retain fixed matrix, subcases, DB facts, safe observations, separate gates, JSON/Markdown, failure injection and INCOMPLETE. Rebuild product cases; omit Resource, Agent Demo ownership/waiting-approval/resume and old fixed20 count.

C9 retains production deployment/recovery, abrupt process-death handling, monitoring and final delivery artifacts. Dataset coverage, distribution shift and inherited dependency advisories remain explicit risks. Capstone stays Internal Authoring and locked; formal lessons29.
