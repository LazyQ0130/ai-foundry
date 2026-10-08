# C8 · Product Eval & Regression

Internal Authoring. Students continue their own C7 project and review their own gold answers. This reference adds evaluation only; no new product flow, schema or production dependency.

## Author verification

Assemble into a fresh directory: `node scripts/assemble-capstone-reference.mjs c8 .runtime/c8-reference-new`. Run npm ci, lint, typecheck, test, build. Eval starts/stops its own built Next server on localhost:3142 and an in-memory synthetic S3 HTTP stub on localhost:3911; it needs no cloud-storage credentials. The stub exercises the real storage adapter/indexer but does not verify cloud IAM/signatures.

Create an independent pgvector test database. Runner allows only localhost/127.0.0.1:55440, public schema, database capstone_c8_eval or capstone_c8_real. Set DATABASE_URL and TEST_DATABASE_URL to the identical dedicated URL. NODE_ENV=production is rejected. Apply the inherited six migrations with migrate deploy and inspect migrate status; no new C8 migration or db push.

`npm run eval:capstone` forces mock providers and executes 25 cases across four categories. It generates safe JSON/Markdown under .runtime/capstone-eval/deterministic. Build and verify never call paid providers; verify includes the measured short deterministic Eval after build. No runtime artifacts are committed.

Review eval/fixtures/gold.mjs by reading every fact and gold pair. Ten retrieval queries cover keyword, paraphrase, Chinese, number, negation and entity; two irrelevant questions evaluate abstention. Closed-gold support/fidelity checks are not a general semantic classifier. Mock unrelated-query abstention uses explicit empty evidence; real Eval also supplies irrelevant nonempty evidence. Dataset changes require a version bump and human baseline review.

The first baseline observed 25/25 cases, Hit@3 10/10, MRR .95, answerable4/4, abstention2/2 and fidelity4/4. Author-reviewed thresholds: Hit@3≥.90 (one miss in ten), the other three rates1.0, safety violations0. These are teaching-corpus criteria, not universal production requirements. Never lower a threshold solely to make a run pass.

## Regression and failure injections

Use `--compare-baseline eval/baseline.json` for the reviewed deterministic baseline. Compare versions, stable metrics and case statuses; PASS→FAIL and new hard-gate failures block. Retrieval decline tolerance .05. Version mismatch, missing cases or setup errors produce INCOMPLETE; partial execution cannot claim full-suite success. Update the baseline only after explicit human review of changed requirements/dataset.

`--case unapproved-write --inject-failure unapproved-write` injects observation only, never an actual unauthorized write. Also run leak/cross-workspace-isolation, unsupported-claim/citation-support-gold, retrieval/retrieval-gold and execution-error/private-research. The first four must exit1/FAIL, the final one exit2/INCOMPLETE. Reports use separate directories so a bad run cannot overwrite the normal report.

## Controlled real quality

Only `C8_REAL_EVAL=1 npm run eval:capstone:real` enables paid calls. Configure real chat/embedding provider and dimension1024 server-side. Fixed 9 main cases include 10 retrieval queries, four reports (two answerable/two irrelevant), a real private+Crossref mixed report, Note fidelity and two full private workflows. Direct calls cap chat10/embedding16/Crossref2; two workflows inherit C5 budget/deadline; entire matrix has an eight-minute deadline. Arbitrary case-count arguments are rejected. Reports record model/parser/indexing/dataset/runner versions and safe call counts, never keys, tokens, prompts or raw responses.

Real quality is informational and separate from deterministic gates. Fixed lexical fidelity signals and structural validity do not prove all semantic claims. An optional C8_JUDGE=1 judge receives only claim+cited excerpt with strict supported/partially_supported/unsupported+reason; it is off by default, bounded, and remains outside Safety Gates. Lexical flags remain visible when the judge is enabled. Human-edited Notes are excluded from automatic fidelity evaluation.

## Stage 4 audit and boundaries

Read S4-L7 eval runner, context, probe and report. Retain fixed matrices/subcases, DB facts, safe probes, independent gates, JSON/Markdown, failure injection, INCOMPLETE and real separation. Rebuild cases around Knowledge/ResearchRun/Citation/Action/Note; do not copy Agent Demo cases, Resource, old owner model, waiting approval, Resume or a mandated 20-case count.

No Eval business tables, dashboard, runtime write tools, new sources, worker, queue, crash recovery, production deployment, final portfolio README/video/resume or release. Capstone remains locked and formal Stage lessons29. Coverage, distribution shift, optional judge nondeterminism, abrupt process death, production recovery and inherited dependency advisories remain risks.
