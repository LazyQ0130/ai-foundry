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
