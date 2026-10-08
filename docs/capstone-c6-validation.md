# Capstone C6 validation · 2026-10-08

## Verdict

PASS WITH CHANGES. Student-facing internal draft, incremental C6 reference, deterministic protocol/product tests and opt-in real mixed research are complete. Existing production dependency findings remain, so this is not a production release approval. Capstone stays locked; formal Stage lessons remain 29 (30 content files include preparation).

## Learning and product decisions

130–160 minute advanced integration lesson, seven prompts and seven new globally unique checkKeys. Students decide why external research is necessary, when a result is eligible evidence, privacy/default-off policy, provenance and failure behavior. AI may generate adapters, SDK glue, boilerplate UI and tests. Students inspect migrations, actual outgoing query, server boundaries, snapshots, failures and isolation. Start from their own C5; no Product Brief replacement.

PRIVATE_ONLY is the database/default model registry policy. PRIVATE_AND_EXTERNAL is an explicit per-Run choice with browser disclosure. The approved external query is derived before private retrieval from the first sentence of the original Task, bounded to 200 characters. Model tool schema supplies this exact query as an enum; runtime and service equality-check it. Unauthorized expansion never reaches MCP and is labeled “Rejected query (not sent)”. This intentionally gives up automatic translation/expansion; a user must still keep the Task question itself non-sensitive.

## Crossref official validation

Reviewed [Crossref REST API](https://www.crossref.org/documentation/retrieve-metadata/rest-api/), [filters](https://www.crossref.org/documentation/retrieve-metadata/rest-api/rest-api-filters/) and [usage tips](https://www.crossref.org/documentation/retrieve-metadata/rest-api/tips-for-using-the-crossref-rest-api/). Official docs list has-abstract, row limits and optional mailto, and note that some abstracts may carry copyright. Runtime uses fixed `https://api.crossref.org/works`, query, rows=3, filter=has-abstract:true. No automatic retries or redirects; mailto only from server configuration.

Initial low-frequency `agent memory` query returned HTTP 200 and three records with abstracts, latency 1200ms. A `select=DOI,title,abstract,published` request returned 500; omit select and bound streamed full-record response to 250KB. A later longer query also returned 500; changing the non-sensitive query to `agent memory` produced the final successful run. Availability is not assumed from a past 200 response.

Adapter: 8s deadline, at most three items, DOI/title checks, locally constructed DOI link (upstream URL ignored), raw abstract≤16K, conservative balanced JATS subset without attributes, normalized plain evidence≤1600. Unreliable/no abstract is REFERENCE_METADATA, never allowed report evidence. CLAIM_EVIDENCE supports the supplied abstract excerpt only. No full abstract mirror or full-paper claim. External citation key hashes sourceType + normalized DOI + adapterVersion + evidence excerpt. External snapshot retains the whole bounded excerpt (≤1600); private snapshots retain C4’s ≤1200 limit.

## MCP reuse audit

Actual SDKs installed and built: @modelcontextprotocol/client=2.2.0, @modelcontextprotocol/server=2.2.0, MIT licenses; pinned protocol 2026-07-28. No version change needed.

| Stage 4 source | Retained primitive | C6 result |
|---|---|---|
| `s4-l4/common/lib/mcp-reference-auth.ts` | HMAC/nonce/TTL/timingSafeEqual/fixed URL/pinned protocol | `external-mcp-auth.ts`, new aud/scope/path/env |
| `s4-l4/common/lib/mcp-reference-adapter.ts` | Client/StreamableHTTPClientTransport/connect/listTools/exact call/abort/close | `external-research-mcp.ts`, strict Crossref result, 12s total deadline |
| `s4-l4/common/lib/mcp-reference-server.ts` | McpServer/registerTool/createMcpHandler | `external-mcp-server.ts`, Crossref only, SDK signal is context.mcpReq.signal |
| `s4-l4/common/lib/mcp-request-guard.ts` | Process request window | 60 protocol requests/minute internal endpoint guard |
| `s4-l4/common/app/api/mcp/reference/route.ts` | Host/Origin/no-store/bearer/error boundary | `/api/mcp/external-research` |

Removed research_reference/publicReference/ref-rag/ref-git/ref-mcp demo business. No Stage 4 pages, Agent domain or private product routes copied. Server has no Prisma/Session/Workspace/Knowledge dependency. Client receives only query. HMAC audience ai-research-external, scope tools:call:search_external_references, TTL 2 minutes, secret≥32 bytes. Server-configured exact path, HTTPS in production; localhost HTTP only with explicit local verification allowance. Discovery confirms one fixed known tool; remote extra tools cannot enter local Registry.

## Workflow and report

UI → Session → Workspace → owned Task → Run policy → Brief → bounded Model → fixed tool → ResearchEvidence union → C4 GroundedReport validation → transactionally stored Citation/report. Private evidence retains locators, external private locators null. One citation table and unified positions. Old Runs default private. Exact C4 report schema text is checked (line endings normalized); no payload-contract change. Evidence cap 5 private + 3 external, total 8. Model metadata is never trusted as provenance.

External timeout/429/bad result creates FAILED TOOL Step and safe unavailable observation; disables external for this Run, no infinite retries. Existing private evidence survives. No evidence means insufficient report. Private core tool failure still fails Run. The Step contains outgoing query, counts, upstream latency and MCP total latency, not complete abstracts or provider requests. C5 remains bounded at 4 model turns, 3 tools, 120s, 10 provider units.

## Deterministic verification

Fresh assembled `.runtime/c6-reference-final` installed with npm ci. Isolated pgvector PostgreSQL17 container on localhost55438, databases c6_final and c6_real_final; never used platform/production DB for reference verification. Each started empty; all five C2→C6 migrations deployed. Migration status up to date. No db push.

| Command / gate | Result |
|---|---|
| Reference npm ci | PASS, 380 installed packages; full audit 1 moderate/9 high including dev tree |
| Reference npm run lint | PASS |
| Reference npm run typecheck | PASS |
| Reference npm test | PASS 29/29, including inherited C3/C4/C5 tests |
| Reference npm run build | PASS; fixed MCP route included |
| prisma migrate deploy / status | PASS; 5 migrations from empty DB / up to date |
| Reference npm run test:db | PASS; deterministic real MCP HTTP fixture, mixedRunId4 in c6_final |
| Root npm run check | PASS; C2–C6, Renderer V2, keys, starter, catalogue |
| Root npm test | PASS 84/84 |
| Root npm run build | PASS, including typecheck; existing large frontend chunk warning |
| npm audit --omit=dev | Exit1: 1 moderate/4 high, listed below |
| git diff --check | PASS |

Deterministic tests cover disabled spoof→external executions0/outbound0; strict Run/tool input; fixed host/rows/timeout signal; 429/bad/oversized response; malformed abstract/DOI/title/URL; stable/change-sensitive keys; MCP extra/absent tool; invalid result; HMAC expiry/tampering/path; approved query rejection before MCP; metadata-only exclusion; mixed snapshots; FAILED external Step with private success; no-evidence abstention; malicious abstract cannot add writes; failed source cannot be retried through Registry.

HTTP test uses test-only standalone MCP fixture (explicit opt-in, not imported by production routes), no live Crossref. Authenticated client discovers fixture extra send_email but only calls fixed search_external_references. Alice sees private+external citations and refreshes stored snapshot; Bob sees neither Run nor citations/list, cannot run Alice Task; anonymous401. workspaceId/userId/ownerId/maxSteps/maxTools/mcpUrl/externalHost/apiKey rejected400. Metadata-only/no-evidence timeout abstain. Timeout/429/bad URL degrade to private report with FAILED Step. Legacy default private. Wrong MCP host403; unauthenticated MCP401.

## Opt-in real smoke

Real application endpoint and authenticated MCP, live Crossref, qwen3.7-flash (verified Stage4 nonthinking option), text-embedding-v4 1024, private Garage S3. Uploaded only the non-sensitive memory approaches TXT. Real model chose tools; no forced tool list sequence, fixture result or mock decision used.

Final query: `agent memory`. Research Task asked to compare the private memory approaches with a separately cited scholarly perspective. Final result:

| Metric | Observed |
|---|---|
| Source policy | PRIVATE_AND_EXTERNAL |
| Model decisions | 4 |
| Tool calls | 3: private1, external2 |
| External call1 | results3, eligible2, metadataOnly1; upstream658ms / MCP689ms |
| External call2 | results3, eligible1, metadataOnly2; upstream654ms / MCP675ms |
| Timeline Steps | 9 |
| Stored Citation types | KNOWLEDGE, CROSSREF, CROSSREF |
| Report | grounded; mixed provenance persisted |
| Total smoke time | 19200ms, includes registration/upload/indexing |
| Private original-source GET | PASS, byte-for-byte non-sensitive fixture |

Bounded repeated external query was deduplicated by evidence key. Different live eligible counts reinforce that upstream contents and normalization are time-dependent. The model may still repeat a query despite planner instructions; the fixed tool budget prevents unlimited requests.

Earlier observations retained honestly: model-expanded query was denied; an intermediate real run succeeded with mixed citations while retaining that rejection; final candidate then hit Crossref500 and abstained; another encountered MODEL_FAILED. The final short-query run passed all mixed-source assertions. No background automatic retry was added. No keys, bearer tokens, complete abstracts or raw upstream bodies were saved to tracked logs.

## Security, ownership and remaining risks

Production audit findings unchanged from C5: @prisma/config, deepmerge-ts, next, postcss, prisma; 1 moderate/4 high/0 critical. No reported production advisory introduced by MCP client/server2.2.0. Keep this as internal authoring; resolve the inherited tree and deployment controls during release audit, without opportunistic breaking upgrades in this lesson. Node ci also reports dev-tree findings separately.

Crossref completeness varies; abstract excerpt is not full paper. Conservative markup handling sacrifices recall. Metadata-only results cannot support claims. Third-party rate limits/500 and provider errors remain possible. Approved query intentionally restricts expansion and cannot sanitize a user's sensitive original question. Claim entailment still needs human review. Production fixed MCP HTTPS/proxy/timeouts/shared quotas require deployment verification. Abrupt process failure may leave a RUNNING Run; no queue/resume/worker added.

No write tools, Approval, AgentAction, KnowledgeNote, external indexing tables, automatic private import, arbitrary URL/web search, Browser Agent or C7 lesson. Capstone registration/entitlement/purchases unchanged, locked showcase verified, 29 formal Stage lessons unchanged.

One local launch was rejected by automatic approval because it assigned the MCP test secret in shell. Used an ignored Node launcher with server-only ephemeral/local credentials instead. No further approval was required and no secret was committed.
