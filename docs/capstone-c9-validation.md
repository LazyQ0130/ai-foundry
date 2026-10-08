# Capstone C9 · Production Delivery & Portfolio — 作者验证

验证日期：2026-10-08。课程仍为 Internal Authoring。本报告区分课程制作、Reference、本地生产形态与真实云环境；不把未验证项视为通过。

## 1. C9 Verdict

**PASS WITH CHANGES**。课程、交付Reference、依赖修复与本地实证完成；**LOCAL PRODUCTION-LIKE VERIFIED / CLOUD DEPLOYMENT NOT VERIFIED**。没有已验证的云目标/生产bucket/HTTPS域名，不能宣称Production Ready。下一轮仍须Final Capstone Release Readiness Audit。

## 2. Learning Objective

从Feature Complete/Eval Passed走到有运行、配置、恢复、发布证据的交付版本，再用真实事实完成作品集表达。180～240分钟，不计云账号/DNS等待。继续学生自己的C8项目，C9不添加主要业务功能。

## 3. Production Architecture Decision

比较serverless Next、long-lived Docker Node、API+worker，选择long-lived modular monolith。拟用Render paid Docker/Render Postgres/private R2；已查当日官方Docker/PORT/TLS/pre-deploy/pgvector/R2资料，链接保存于deployment-decision.md。云端实际HTTP时限、网络与资源尚NOT VERIFIED，不从build timeout推导request timeout。

## 4. Environment Strategy

Local/Test-Eval/Staging/Production分开DB/bucket/secrets。C9独立pgvector容器55441/capstone_c9_test；C8回归在本轮新建的独立容器55440/capstone_c8_eval，均从空库migration。没有拿平台DB作为Reference DB。平台回归沿用既有独立aifoundry_test schema。

## 5. Secret Inventory

DATABASE_URL、S3五项、AI embedding/chat、MCP URL/auth、ACTION_APPROVAL_SECRET、APP_ORIGIN和可选CROSSREF_MAILTO明确分工。MCP/Approval各自随机>=32字节，不能共用或暴露NEXT_PUBLIC。checker只输出名称/状态；缺失、local/mock/test配置拒绝。形状检查不能证明随机性或IAM。实际生产secrets配置NOT VERIFIED。

## 6. Dependency Remediation

原production audit 1 moderate/4 high/0 critical（5 affected entries）：Next cache poisoning→15.5.27；PostCSS source-map/file-read/XSS→override8.5.23；deepmerge-ts循环图栈耗尽→override8.0.2，连带解除@prisma/config/prisma传播。Prisma/client继续6.19.3；未自动降级/跨Prisma主版本。

full audit另有eslint-config-next→Next plugin→fast-glob→micromatch→braces未修复链，改为typescript-eslint8.71.1+React Hooks7.1.1。保留TS/Hooks检查，明确暂失Next专用lint规则。production和full最终均0漏洞，无接受Moderate。范围是C9Reference，未声称整个课程平台所有依赖都已整改。逐项advisory/版本/代价见dependency-remediation.md。

## 7. Docker / Runtime

multi-stage dependencies/build/release/runtime，Node22 Debian基础digest固定；npmci/generate/build，不在build迁移；非root USER node、production、PORT、standalone。runtime约127.2MB；没有env/Git/runtime/test资料。真实image health/register/login/Task持久化/anonymous401通过。TXT/PDF实际在Linux standalone内处理通过。PDFJS canvas渲染依赖警告仍在；本产品文本提取通过，不声称支持扫描/OCR/渲染。

## 8. Database / Migration

两套独立空DB均六条正式migration deploy成功，status up-to-date；vector0.8.6，列vector(1024)，真实scoped检索通过。release target独立构建，容器内CLI status通过。C9没有schema/migration改动，没有db push/reset。云DB/备份恢复NOT VERIFIED。

## 9. Production Object Storage

云设计private R2、300秒signedPUT/GET、10MiB上限、真实origin CORS与对象生命周期策略；本地Garage实测signedGET200/anonymous denied，两个格式上传/封存/处理成功。**Production R2 IAM/CORS/生命周期没有实测**，不能借Garage通过替代。

## 10. HTTPS / MCP

production checker要求公开HTTPS、同产品固定MCP路径，禁止local flag。实际real smoke在localhost HTTP+显式local-only test flag，MCP认证/工具调用/Crossref成功；生产HTTPS/MCP HTTPS NOT VERIFIED。

## 11. Crash Recovery

默认dry-run，显式--apply；十分钟阈值大于120秒deadline；锁Run后复核status/startedAt和全部近期Step start/completion。旧Run/运行中Step→FAILED/PROCESS_INTERRUPTED，不Resume；fresh10秒/近期活动/completed保护，PROPOSED不变，无Note写入，并发与重复幂等。真实DB integration通过，末次dry-run eligible0/applied0/steps0。需要deploy/maintenance/operator触发，无后台worker。

## 12. Logging / Error Hygiene

Research start/step finish/run finish采用event/runId/step/status/errorCode/latencyMs字段白名单；不打印prompt/chunk/providerbody/Cookie/Token/URL。客户端继续安全错误，新增PROCESS_INTERRUPTED与失败状态可操作提示。诊断真实Provider时仅在ignored测试入口观察HTTP status/finish reason/JSON字段形状，无原文与secret。该诊断不进入产品/提交。

## 13. Release Check

先生成fresh Prisma client再import C8 guard；拒绝production/非allowlist Eval DB，移除paid keys并强制mock。lint/typecheck/40tests/build/C8Eval/production+fullaudit全部通过。单独production-env检查为配置/部署前门，不把测试fixture通过当生产配置PASS。registry TLS失败曾正确阻断，恢复后整套重跑通过。

## 14. Staging Smoke

**云Staging NOT VERIFIED**；本地production-mode real full smoke通过：注册/登录→TXT+PDF READY→private search→private Run→mixed Run→Grounded Report/Citation→Proposal→Human approval→replay one Note→source/anonymous denial。33HTTP calls，34361ms，最多2Runs/60requests/8分钟限制。这里没有HTTPS和真实浏览器CORS证明。

## 15. Production Safe Smoke

**NOT VERIFIED**。脚本已建立：explicit opt-in、公开HTTPS、一个synthetic TXT、一个mixed Run、boundedcalls/timeout、无破坏性注入。显式给localhost输入会在发请求前拒绝。没有假URL，没有在线篡改DB/故障注入。

## 16. C8 Eval Regression

C9修复后deterministic25/25；Functional5/Quality7/Safety6/Reliability7；Hit@3 10/10、MRR0.95，answerable4/4、abstention2/2、note fidelity4/4，八项HardGate计数0。baseline37项unchanged，regressed=false。保留C8历史real词法8/9、optionalJudge9/9、lexical_fidelity_flags=1与人工语义复核；本轮两条real smoke不冒充完整paid real Eval。

## 17. README

中文AI研究工作台/AI Research Workspace，用户问题先于技术栈；Flow/Features/Trust/Architecture/Eval/Run/Deployment/KnownLimitations齐全。只写实际数字、无虚构Demo或用户指标，明确云未验证与真实Provider失败记录。材料在实际本地smoke后完成。

## 18. Architecture Diagram

architecture.md含GitHub Mermaid，另有architecture.mmd与trust-boundary.mmd源。体现Auth/Workspace、Knowledge/S3/pgvector、bounded runtime/read-only tools/MCP、Report/Snapshot、Review/transaction/Note，模型不作为权限来源。

## 19. Demo Script

180秒分段脚本，synthetic数据，提前完成的Run如实标注；不以剪辑伪造运行速度。安全/Eval用一句真实数字；当前明确是本地演示。

## 20. Resume Project Entry

四条问题/设计/验证结果：bounded workflow、grounding/snapshot、exactapproval/idempotency、25-case Eval。没有效率/用户量/准确率虚构；学生要替换成自己实测数字，不声称已生产上线。

## 21. Interview Guide

Product/Architecture/Workspace/Task-Run/RAG/locator/Citation/Agent/MCP/Security/HITL/Idempotency/Eval/Production均有结论→原因→代码→证据→局限框架与追问，不给背诵长答案。

## 22. Retrospective

七个问题涵盖Non-goals、选型、Eval问题、重做、100倍、Team、Note回流污染。未来Queue/Worker/rate-limit/observability/RBAC/OCR/Noteindexing仅讨论。

## 23. Student Ownership

学生决定部署标准、风险接受、Secret所有权、恢复/回滚与成果表述；AI生成Docker/scripts/docs。学生必须核对diff/migration/image/smoke/Eval/边界和局限，不能由AI一键宣布Production Ready。

## 24. C9 Reference

C8累积项目加Docker、health、env/release/smoke/recovery、structuredlogs、恢复提示、dependencylock与portfolio文档。assembler支持c1～c9并只输出新的.runtime目录；保留旧overlay不变。final组装目录.runtime/c9-reference-final已npmci及全套验证。

## 25. Final Capstone Boundary

无新major功能，无queue/worker/Team/OCR/Noteindexing；schema/migrations全部继承。Capstone InternalAuthoring、暂未解锁、正式Stage29；未改entitlement/pricing/purchase/catalogue，未注册正式C9/创建tag。

## 26. Security / Dependency Audit

C9Reference production/full均0 moderate/0 high/0 critical。安全HTTP和真实DB复查exactapprove/edit/reject/concurrent/expired/tampered/wrongbinding/isolation/strictinput，五项knowledge-writeintegration与recovery通过。High/Critical未被豁免，audit网络错误未当PASS。云生产边界仍未知。

## 27. Lesson Verification

RendererV2解析+SSR通过，7Prompt，7个新的全局唯一稳定checkKeys，180～240min。使用prompt/task/concept/check/stuck/warning/deepdive；C9checker检查交付工件、配置/恢复/发布边界、locked29课程。平台content30文件含prep，与正式29不冲突。

## 28. Full Verification

| Scope / command | Result |
|---|---|
| Fresh C9 assemble / npm ci | PASS；248packages，audit0 |
| Reference npm run lint / typecheck / npm test / build | PASS；40/40 |
| prisma migrate deploy / status (two empty dedicated DBs) | PASS；6/6 |
| extension/column SQL + actual scoped search | PASS；0.8.6 / vector(1024) |
| npm run release:check | PASS；mock only，production/full audit0 |
| npm run eval:capstone -- --compare-baseline eval/baseline.json | PASS；25/25，37 unchanged |
| C7 HTTP smoke | PASS；ownership/approval/strictinput等 |
| knowledge-write.integration.ts | PASS；5/5 |
| npm run test:recovery / recovery --dry-run | PASS；实际DB，不Resume/Approve |
| Docker runtime build/run | PASS；health/auth/task/anonymous |
| Docker release build + container migrate status | PASS |
| C9_STAGING_SMOKE + C9_LOCAL_STAGING_SMOKE full real smoke | PASS；33HTTP/2Runs/34361ms；local only |
| production smoke localhost negative | EXPECTED REJECT，0networkcalls |
| production-env missing negative / fixture contract tests | EXPECTED REJECT / PASS；actual production NOT VERIFIED |
| Platform npm run typecheck / check / build | PASS；C2～C9与content全部 |
| Platform npm test | PASS；84/84 |
| Platform npm run check:bundle | PASS；336public/dist files无受保护Markdown标记 |
| git diff --check | PASS |

曾遇且已修复/记录：空public Docker COPY、fresh Prisma client导入顺序、registryTLS临时失败、真实MODEL_FAILED两次。未运行auditfixforce/dbpush/生产Eval/故障注入。

## 29. Real Deployment / Real Smoke

真实云部署NOT VERIFIED。Linux Docker+真实qwen3.7-flash/text-embedding-v4/Crossref/私有Garage PASS：Run7私有2citations，Run8混合3citations其中2external；各1Note，签名文件可读/匿名拒绝。每Run4MODEL/3TOOL/1BRIEF/1REPORT（9providerunits），Proposal各1次；不是吞吐/成功率测量。镜像digest和lockhash见Reference release-evidence.md。

## 30. Remaining Risks

同步执行无queue/worker；恢复是fail-closed终结而非自动Resume，需运维触发。Provider结构/语义、Crossref摘要覆盖和datasetshift仍有波动。Next专用lint暂缺、ESLint9支持期警告、PDFJS渲染polyfill警告已记录。云HTTP时限、HTTPS/MCP、R2IAM/CORS、backuprestore/rollback未验证；因此没有ProductionReady结论。无接受Moderate。

## 31. Files Changed

完整清单在下方自动从本轮明确修改路径列出。忽略的.runtime数据库/镜像/日志/credentials不进入Git。

```text
.gitignore
course-content/internal/capstone/c9/lesson-draft.md
course-content/internal/capstone/c9/overlay/.dockerignore
course-content/internal/capstone/c9/overlay/.env.production.example
course-content/internal/capstone/c9/overlay/Dockerfile
course-content/internal/capstone/c9/overlay/README.md
course-content/internal/capstone/c9/overlay/app/api/health/route.ts
course-content/internal/capstone/c9/overlay/app/runs/[runId]/page.tsx
course-content/internal/capstone/c9/overlay/docs/architecture.md
course-content/internal/capstone/c9/overlay/docs/architecture.mmd
course-content/internal/capstone/c9/overlay/docs/demo-script.md
course-content/internal/capstone/c9/overlay/docs/dependency-remediation.md
course-content/internal/capstone/c9/overlay/docs/deployment-decision.md
course-content/internal/capstone/c9/overlay/docs/deployment.md
course-content/internal/capstone/c9/overlay/docs/interview-guide.md
course-content/internal/capstone/c9/overlay/docs/release-evidence.md
course-content/internal/capstone/c9/overlay/docs/resume-project.md
course-content/internal/capstone/c9/overlay/docs/retrospective.md
course-content/internal/capstone/c9/overlay/docs/trust-boundary.mmd
course-content/internal/capstone/c9/overlay/eslint.config.mjs
course-content/internal/capstone/c9/overlay/lib/research-service.ts
course-content/internal/capstone/c9/overlay/lib/server-log.ts
course-content/internal/capstone/c9/overlay/next.config.ts
course-content/internal/capstone/c9/overlay/package-lock.json
course-content/internal/capstone/c9/overlay/package.json
course-content/internal/capstone/c9/overlay/scripts/check-production-env.mjs
course-content/internal/capstone/c9/overlay/scripts/delivery-smoke.mjs
course-content/internal/capstone/c9/overlay/scripts/production-smoke.mjs
course-content/internal/capstone/c9/overlay/scripts/reconcile-stale-runs.mjs
course-content/internal/capstone/c9/overlay/scripts/release-check.mjs
course-content/internal/capstone/c9/overlay/scripts/staging-smoke.mjs
course-content/internal/capstone/c9/overlay/test/production-env.test.ts
course-content/internal/capstone/c9/overlay/test/recovery.integration.mjs
docs/capstone-c9-validation.md
package.json
scripts/assemble-capstone-reference.mjs
scripts/check-capstone-c9.ts
```

## 32. Git

目标main，提交说明`Build Capstone C9 production delivery`。提交后以`git rev-parse HEAD`、`git ls-remote origin refs/heads/main`与`git status --porcelain`核对；完整SHA与推送/clean结果在最终交付消息及ignored本地运行绑定记录中报告。本报告不把Git提交当作云部署SHA，不创建ReleaseTag。
