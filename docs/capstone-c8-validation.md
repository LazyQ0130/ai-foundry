# Capstone C8 author validation

Validated 2026-10-08. Internal Authoring; this is not a product release verdict.

## 1. C8 Verdict

PASS WITH CHANGES. The fixed Product Eval suite, student lesson, reviewed baseline and fault/regression detection are complete. Real quality has an explicitly retained lexical fidelity flag, optional-judge uncertainty and inherited dependency advisories.

## 2. Learning Objective

Define reliable behavior before measuring it; distinguish Functional/Quality/Safety/Reliability, structural citations versus semantic support, deterministic gates versus real quality, FAIL versus INCOMPLETE, and reviewed baseline versus permanent truth. Lesson: 150–180 minutes.

## 3. Eval Philosophy

Tests prove implementation behavior. Product Eval organizes evidence about the end-to-end research workbench and its quality. Existing C3–C7 unit/HTTP/DB tests remain. A high case pass rate cannot average away one safety failure. Build/verify never run paid Eval.

## 4. Eval Dataset

CAPSTONE_EVAL_DATASET_VERSION v1; runner/report version1. Six author-reviewed synthetic documents cover persistent/context memory, protected writes, 3 versus30 retries, Model A versus Model B, no improvement, and PostgreSQL transactions. Ten retrieval queries cover keywords, paraphrases, Chinese, distractors, negation, number and entity. Two unrelated questions and approved/forbidden claim pairs provide abstention/support/fidelity gold. Students must inspect and approve their own Gold; AI-generated answers are not automatically authoritative.

The deterministic matrix contains 25 main cases / 93 named subcases: Functional5, Quality7, Safety6, Reliability7. The real matrix contains9 main cases /38 named subcases. These are product cases, not copied Stage4 Demo cases.

## 5. Functional Eval

Private task → actual HTTP research → persisted report/citations; mixed private/abstract runtime → report citing both; actual empty-workspace HTTP research → persisted insufficient report; Proposal→one exact Note; human edit→current version exact Note. Results are checked, not just HTTP200.

## 6. Retrieval Quality

Actual product pgvector retrieval over fixed documents. Deterministic Hit@3 10/10 =1.0, MRR .95. Real embedding Hit@3 10/10 =1.0, MRR1.0. Scores are separate: hash embedding measures lexical/pipeline regression, real embedding measures this small corpus's semantic retrieval.

After reviewing the observed baseline, the teaching threshold is Hit@3≥.90 (one miss among ten); baseline regression tolerance .05. No failing threshold was lowered to obtain PASS.

## 7. Citation Validity / Support

Validity checks allowed Evidence keys and rejects unknown/malformed citations; invalid_citations0. Support uses closed, author-approved claim/excerpt pairs and forbidden negation/number/entity/new-fact variants. Actual mock findings are checked against the cited source text. A legal key with an unsupported claim is detected. This exact Gold evaluator is not a general semantic classifier; real report claims still carry semantic_review_required observations.

## 8. Abstention Eval

Deterministic answerable4/4 and unsupported abstention2/2; unsupported_answer_count0. The deterministic unrelated-query subcases deliberately supply empty evidence through the runtime stub and disclose that scope. Functional HTTP separately verifies an actually empty Workspace. Real reports receive irrelevant but nonempty evidence: answerable2/2, unsupported abstention2/2, real_unsupported_answers0.

## 9. KnowledgeNote Fidelity

Deterministic AI Proposal fidelity4/4; mutation checks detect changed negation, number, entity and new facts. Human edits are excluded from automated fidelity gates.

Real default lexical evaluation initially scored8/9 cases, flagging Note fidelity. The initial “any30 is wrong” rule could reject the fixture's explicit “3, not30” statement. Added English/Chinese counterexamples and a negated-alternative-aware rule. A later real result still raised one lexical flag; it remains recorded rather than being deleted or treated as a proven product bug.

Optional C8_JUDGE=1 was then implemented as an explicitly separate quality signal. It receives only candidate claim/content and the report excerpt, returns strict supported/partially_supported/unsupported+reason, has no tools/identity/database access, and does not affect Safety Hard Gates. In the final controlled run it classified the Note supported; Note fidelity signal1/1 while lexical_fidelity_flags1 remains visible. No claim of general semantic certification is made.

## 10. Safety Hard Gates

Deterministic observed values all0: cross_workspace_leaks, unapproved_writes, duplicate_knowledge_notes, invalid_citations, unsupported_deterministic_claims, unsupported_answer_count, partial_ready_count, tamper_accepts. True PostgreSQL/HTTP facts enforce ownership and approved writes. Eight replayed concurrent approvals and a fresh concurrent first approval produce one Note.

Real reports label these counters SIGNAL_ONLY, because the real quality run does not repeat the complete deterministic safety matrix. Missing required quality observations in a full deterministic run are INCOMPLETE, not an inferred PASS.

## 11. Reliability Matrix

Broken/scanned PDF and invalid UTF8; partial embedding failure→FAILED/zero chunks; stale PROCESSING retry; max steps/tools/budget; deadline/cancel; MCP timeout/429/5xx/malformed external output; private degradation and no-evidence abstention; after-INSERT rollback and safe retry; Provider failure without half Action or Run mutation. Results: retry_success_count3, external_degradation_success_count4, timeout_handled_count1, cancel_handled_count1, partial_ready_count0.

The in-memory localhost S3 HTTP stub exercises the real storage adapter and indexer. It does not validate real cloud IAM/signatures. Existing real storage smoke remains separate.

## 12. Failure Injection

Actual CLI executions and exit codes were checked:

| Injection | Observed | Exit |
|---|---|---:|
| unapproved-write | unapproved_writes1, FAIL | 1 |
| leak | cross_workspace_leaks1, FAIL | 1 |
| unsupported-claim | unsupported_deterministic_claims1, FAIL | 1 |
| retrieval | Hit@3 0/10, FAIL | 1 |
| execution-error | INCOMPLETE, fullSuitePassed false | 2 |

The first four modify observations only, not product data or production algorithms. Full injected retrieval plus baseline comparison detects regression; restored normal execution returns25/25 PASS with no regression. No unauthorized write was performed to test the gate.

## 13. Report Format

Ignored .runtime/capstone-eval/<run-kind>/report.json and report.md contain category results, safe assertions/expected-observed IDs, metrics, independent gates/thresholds, baseline deltas, versions, call accounting and latency limits. Single cases/injections use separate directories. Setup/import/fixture/DB/report errors produce a safe INCOMPLETE fallback and nonzero exit. Raw documents/chunks/prompts/vectors, cookies/tokens/secrets/API keys/raw responses are absent; sensitive-field scan passed.

## 14. Baseline / Regression

eval/baseline.json stores reviewed safe aggregate metrics and25 case statuses bound to mode, dataset and runner versions. Normal comparison:37 unchanged entries, zero regressed. Full injected retrieval:24/25 pass, Hit@3 0, FAIL and regressed true. Matrix or version mismatch requires human review and produces INCOMPLETE. Baseline updates are manual decisions, not automatic overwrites.

## 15. Stage 4 Eval Reuse Audit

Read S4-L7 stage4-agent-eval.mjs, cases.mjs, context.mjs, probe.mjs and report.mjs. Retained fixed matrices/subcases, product probes, actual DB facts, independent gates, safe JSON/Markdown, injection, INCOMPLETE and real separation. Added the Quality layer. Did not copy Resource/Agent Demo cases, Stage4 owner/waiting-approval semantics, Resume or its fixed20 count.

## 16. Student Ownership

Students decide valuable behaviors, Gold Evidence, hard gates versus thresholds, reasonable criteria, which side to fix after failure and whether to update baseline. AI generates runner, boilerplate, metrics/reports and fixture drafts. Seven staged prompts preserve student review and require actual failure evidence.

## 17. C8 Reference

Bootstrap+C1…C8 fresh assembly. Adds eval fixtures/cases/context/probe/metrics/runner/report/baseline/optional judge, tests and architecture Eval section. No app/lib/prisma product changes or new migration. Fresh assembly equality passed129 files; subsequent evaluation-only safeguards were copied identically and inspected before commit.

## 18. C9 Boundary

No new product tools/sources/write flows, Eval database tables/dashboard, worker/queue/resume, production Docker/deployment/monitoring/crash recovery, final portfolio README/video/resume/interview artifacts or release. Capstone remains 暂未解锁; formal Stage lessons29. No entitlement/purchase/catalogue changes.

## 19. Security / Dependency Audit

Zero new production or development dependencies. C6/C7 lock inherited. npm audit --omit=dev completed with1 moderate/4 high/0 critical: @prisma/config, deepmerge-ts, next, postcss, prisma. npm ci full audit reports1 moderate/9 high including development dependencies. Audit is not clean; no force upgrades were applied.

Runner strongly allows only localhost/127.0.0.1:55440 with public schema and dedicated capstone_c8_eval/capstone_c8_real databases; identical DATABASE_URL and TEST_DATABASE_URL required, NODE_ENV production rejected. Approval secret is generated in process memory. Real opt-in and fixed calls/deadline prevent accidental paid runs.

## 20. Lesson Verification

Renderer V2 actual rendering PASS, seven copyable Prompt blocks, seven globally unique new stable checkKeys and relevant teaching blocks. Dedicated C8 checker verifies four layers, fixed dataset,25 cases, metrics, gates, INCOMPLETE, injection, baseline, DB guard and absence of C9/product implementations. Root checks retain30 published files including preparation and29 formal lessons.

## 21. Deterministic Eval Results

| Metric | Actual |
|---|---:|
| Cases | 25/25 |
| Retrieval Hit@3 | 10/10 |
| MRR | .95 |
| Answerable success | 4/4 |
| Unsupported abstention | 2/2 |
| AI Note fidelity | 4/4 |
| All eight hard-gate counters | 0 |
| Safe retry successes | 3 |
| External degradation successes | 4 |
| Baseline regressed entries | 0 |

Measured deterministic run is approximately four seconds including local app startup, so it is included in Reference verify after build. No paid calls occur. Mock model/tool counters are explicitly instrumented boundary counts, not a complete cost ledger.

## 22. Real Provider Eval Results

Final controlled quality run with optional Judge:9/9 main cases. Chat qwen3.7-flash; embedding text-embedding-v4, dimension1024; Judge qwen3.7-flash. Hit@3 10/10, MRR1.0, answerable2/2, unsupported abstention2/2, invalid citations0, Note signal1/1, lexical flags1, judge supported1. Twenty generated claims/notes retain semantic-review-required observations. Private+real Crossref report cited both evidence types; two full research→proposal→human approval workflows completed.

Direct paid chat calls8; embedding calls16 including six fixture embeddings; Crossref1. Persisted full-workflow accounting:12 chat calls including brief/report/proposal, four embeddings, four tools. No monetary estimate or token usage was invented. Real sample p50 6826ms, p95 12195ms is descriptive only. Fixed direct limits chat10/embedding16/Crossref2, two workflows with C5 research budget10 plus one Proposal call each, eight-minute fetch/runner deadline. Default no-Judge real evaluation's8/9 and retained lexical flag must be read alongside the9/9 advisory-Judge result.

## 23. Product Bugs Found by Eval

No newly confirmed C1–C7 product bug was found; no product code was modified.

Evaluation issues corrected: a lexical number rule treated a negated alternative as affirmative; added English/Chinese negation regression tests while retaining unresolved flags. A partial real report could overwrite the full report; separated directories. Real quality could appear to certify unexecuted safety gates; changed those statuses to SIGNAL_ONLY. Missing required full quality metrics now produce INCOMPLETE. TypeScript test annotations were corrected. None of these changes lowers the reviewed quality thresholds or changes product expectations.

## 24. Remaining Risks

- Optional LLM Judge is nondeterministic and shares the generator model, so correlated errors remain possible.
- Closed Gold, lexical rules and a six-document dataset have limited coverage; twenty real claims/notes still require semantic review.
- Real-world distribution shift can invalidate the small teaching baseline.
- Abrupt process death and production recovery remain C9 work.
- S3 stub does not prove cloud IAM/signature behavior; already-issued source URLs remain short-lived bearer capabilities.
- Inherited dependency advisories remain release risks.
- This internal Eval PASS is not authorization to release Capstone or declare a production SLA.

## 25. Full Verification

| Command / check | Result |
|---|---|
| Fresh assemble c8 | PASS |
| npm ci | PASS,380 packages, advisories above |
| npm run lint | PASS |
| npm run typecheck | PASS |
| npm test | PASS,39/39 |
| npm run build | PASS |
| prisma migrate deploy | PASS,six inherited migrations on two empty databases in a fresh isolated container |
| prisma migrate status | PASS,up to date |
| eval:capstone / baseline comparison | PASS,25/25,no regression |
| Five injections and full regression | Expected FAIL/INCOMPLETE and exit1/2 verified; normal recovery exit0 |
| Controlled real Eval |9/9 with optional Judge; default lexical run8/9 retained as a limitation |
| Report formatting refresh | Same measured real observations regenerated after SIGNAL_ONLY format fix; no additional Provider calls |
| npm audit --omit=dev | Completed, five inherited advisories remain |
| Root npm run check | PASS,C2–C8 and published content/Starter checks |
| Root npm test | PASS,84/84 |
| Root npm run build | PASS,existing Vite large-chunk warning |
| Sensitive-field scan / git diff --check | PASS |

Reference used independent local port55440 databases only. Root regressions used the existing dedicated aifoundry_test schema, not production. Test processes stop after execution; both temporary C8 containers are preserved and stopped, with no file/directory deletion.

## 26. Files Changed

Complete list (19 files):

- course-content/internal/capstone/c8/README.md
- course-content/internal/capstone/c8/lesson-draft.md
- course-content/internal/capstone/c8/overlay/docs/architecture.md
- course-content/internal/capstone/c8/overlay/eval/baseline.json
- course-content/internal/capstone/c8/overlay/eval/cases.mjs
- course-content/internal/capstone/c8/overlay/eval/context.mjs
- course-content/internal/capstone/c8/overlay/eval/fixtures/gold.mjs
- course-content/internal/capstone/c8/overlay/eval/judge.mjs
- course-content/internal/capstone/c8/overlay/eval/metrics.mjs
- course-content/internal/capstone/c8/overlay/eval/probe.mjs
- course-content/internal/capstone/c8/overlay/eval/real-cases.mjs
- course-content/internal/capstone/c8/overlay/eval/report.mjs
- course-content/internal/capstone/c8/overlay/eval/runner.mjs
- course-content/internal/capstone/c8/overlay/eval/runtime-probe.mjs
- course-content/internal/capstone/c8/overlay/test/product-eval.test.ts
- docs/capstone-c8-validation.md
- package.json
- scripts/assemble-capstone-reference.mjs
- scripts/check-capstone-c8.ts

## 27. Git

Authorized commit: Build Capstone C8 product evaluation. Target origin/main. Final delivery records verified commit SHA, remote equality and clean working tree; this validation report belongs to that commit.
