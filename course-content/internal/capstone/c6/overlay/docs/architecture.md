# C6 Architecture · External Evidence via MCP

```text
Browser → Session → Workspace → Task → Run(sourcePolicy)
                                    ├─ Brief → bounded Model
                                    ├─ search_knowledge → private Knowledge
                                    └─ search_external_references
                                         → fixed authenticated MCP Client
                                         → /api/mcp/external-research
                                         → Crossref Adapter → api.crossref.org
Private + eligible abstract → Map<citationKey,ResearchEvidence>
                           → GroundedReport → Citation Snapshot
```

One Next.js deployment and PostgreSQL retain the C2 modular monolith. The MCP endpoint is an explicit read boundary with no database, Session or private Knowledge imports. Object storage and embeddings remain C3 capabilities. C4 claim contract and C5 cancellation/transaction guards remain in force.

## Product and privacy decisions

Run sourcePolicy defaults to PRIVATE_ONLY, including historical rows. Enabling PRIVATE_AND_EXTERNAL discloses public research keywords to Crossref; the UI warns before execution. The local registry contains one or two fixed read tools. Discovery cannot add capabilities.

The server derives `approvedExternalQuery` from the first sentence of the Task (max 200 characters), before reading private evidence. The model may choose whether to call external research, but must copy this approved string exactly. Server equality validation prevents private observations from adding words. This deliberately limits automatic expansion/translation. Users must keep the research question itself non-sensitive; the policy does not make a private question public-safe automatically. MCP receives only `{query}`, never private chunks, documents, report drafts, identifiers, cookies or provider keys. Timeline shows the actual outgoing query.

## Evidence and historical provenance

REFERENCE_METADATA is a candidate bibliographic record, excluded from report evidence. CLAIM_EVIDENCE requires valid bounded plain abstract text. Crossref abstracts are untrusted and support only statements present in the excerpt, not full-paper claims.

ResearchEvidence is a union of private evidence (original locators retained) and ExternalEvidence (DOI, locally constructed link, year, version, supportLevel). Runtime tags retrieved private evidence KNOWLEDGE; shared C3/C4 primitive types stay compatible. Accumulator: private≤5, external≤3, total≤8. External citationKey hashes sourceType, normalized DOI, adapter version and evidence content. The same key represents the same evidence content, not all future versions of a DOI.

ResearchCitation is one table with optional external fields. External locator fields are null; unified position numbers span both source types. No live source foreign key deletes historical snapshots. Reports store the full bounded external evidence excerpt (≤1600 characters); private excerpts retain C4’s 1200-character limit; upstream raw abstract≤16K, normalized evidence≤1600. DOI is a live link, snapshot is historical evidence. React renders text, never external HTML.

## Bounded external read

Crossref host/path fixed; no redirects; rows=3; upstream timeout=8s; streamed response≤250KB. Conservative balanced JATS tag subset, no attributes/unknown entities; unreliable markup becomes metadata-only. Missing DOI/bad title skipped. Optional CROSSREF_MAILTO is server configuration.

MCP Client/Server 2.2.0, Streamable HTTP, pinned protocol 2026-07-28. URL fixed by server configuration with exact `/api/mcp/external-research` path. Production HTTPS; explicit local verification may allow localhost HTTP. Short HMAC token (2 minutes), audience ai-research-external, scope tools:call:search_external_references; Host/Origin checks, fixed discovery/call, strict output validation, abort and 12s total timeout. Client closes in finally. Process-local request quota is not a distributed production quota.

External failure marks TOOL Step FAILED with safe code; source disabled for the remainder of this Run. Observation reports unavailable, private evidence survives, no automatic retries. With no evidence: insufficient report. A private retrieval system failure still fails the Run. Step summaries hold query/counts/upstream latency, not full abstracts; Step latency covers the MCP operation. C5 still bounds 4 model turns, 3 tool calls, 120 seconds and 10 provider units.

## Stage 4 MCP reuse audit

| Source | Retained | C6 adaptation |
|---|---|---|
| s4-l4/common/lib/mcp-reference-auth.ts | HMAC, random nonce, TTL, timingSafeEqual, fixed URL/protocol | New audience/scope/path/env names |
| s4-l4/common/lib/mcp-reference-adapter.ts | Client, transport, pin, listTools confirmation, exact call, abort/timeout/close | Strict Crossref union result and 12s deadline |
| s4-l4/common/lib/mcp-reference-server.ts | McpServer/registerTool/createMcpHandler | Crossref adapter only, context.mcpReq.signal |
| s4-l4/common/lib/mcp-request-guard.ts | Fixed process request window | Internal endpoint request quota |
| s4-l4/common/app/api/mcp/reference/route.ts | Host/Origin, bearer verification, no-store/error boundary | Fixed external endpoint |

Removed all `research_reference`, `publicReference`, ref-rag/ref-git/ref-mcp demo behavior. No Stage 4 pages, Agent product state, private routes or demo references copied. The MCP server is replaceable without changing the product domain or claim contract.

## Future boundaries and limits

Write capability = Not implemented yet.
Approval = Not implemented yet.
KnowledgeNote = Not implemented yet.

No AgentAction, external document/index tables, automatic import, arbitrary URL/web search, Browser Agent, resume, queue, worker or multi-agent. Abrupt process exit may leave RUNNING, inherited from C5. Third-party availability, data completeness and actual claim entailment remain limitations; production deployment/rate controls require C9 review.
