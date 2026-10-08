# AI Foundry Capstone · Final Release Readiness Audit

日期：2026-10-08。审计基线：`15646e9c457d6bafb5f1d6f4692b98e0e1552ead`（C9）。本轮实际证据汇总见 [evidence JSON](capstone-release-audit-evidence.json)；详细原始日志留在 ignored `.runtime/release-audit/`，不随课程交付。

## 1. Final Verdict

**BLOCKED**。具体为 CLOUD VERIFICATION、PLATFORM PUBLISHING INTEGRATION、FULL STAGING SMOKE 和 PLATFORM PRODUCTION DEPENDENCY 阻断。不是 READY，也不把未验证视为通过。当前课程内部研发和锁定状态正确。

## 2. Executive Summary

现在不能向付费学员开放完整学习。九课可解析、可渲染、可从Bootstrap逐阶段重建；45项阶段命令通过，最终Reference的单测、DB/HTTP、Eval、安全门、Docker及本地恢复均有新证据。但云生产链路未验证；平台还不能加载/授权/保存Capstone独立进度；本轮完整真实Staging Smoke未得到PASS；平台自身生产依赖存在1 High。

预先采用的Release Blocker Definition：正文/命令/路径/模板或重建断裂；ci/typecheck/test/build/migration失败；安全门非零；生产依赖High/Critical非零；生产交付承诺缺少真实云证据；服务端正文权限和独立进度未接入。执行环境失败保留FAIL/INCOMPLETE证据，必须重试成功或保持阻断；不以平均分放行。

## 3. Curriculum Audit

逐课全文通读，并实际调用平台parseLessonContent + LessonMarkdown SSR。全部Renderer V2通过。

| 课 | 唯一主目标 | 分钟 | Prompt | Checklist |
|---|---|---:|---:|---:|
| C1 | Define：用户、JTBD、MVP和成功标准 | 60–75 | 3 | 6 |
| C2 | Architect：决策、领域与首条持久化竖切 | 90–120 | 5 | 6 |
| C3 | Ingest：私有文件到可检索证据 | 120–150 | 7 | 7 |
| C4 | Ground：结构化报告与历史引用 | 110–140 | 6 | 7 |
| C5 | Orchestrate：有界研究与持久Steps | 120–150 | 7 | 7 |
| C6 | Expand Evidence：受控外部摘要 | 130–160 | 7 | 7 |
| C7 | Control Writes：精确人工审批 | 120–150 | 7 | 7 |
| C8 | Evaluate：Gold、门槛、回归 | 150–180 | 7 | 7 |
| C9 | Deliver：运行、恢复、交付证据 | 180–240 | 7 | 7 |

共56个可复制Prompt、61个Capstone稳定checkKey，与Stage/预备课key无冲突。任务对应文档、SQL约束、可观察状态、HTTP/DB证据或真实交付结果，不只是阅读打卡。未增加C10。

## 4. Student Journey Audit

主线为学生自己的C1项目→增量数据层→私有资料→报告→Agent→外部来源→人工写入→Eval→交付。没有要求学生覆盖Product Brief。旧知识以回扣和产品验收复用，未重新解释CRUD、Cookie、整套MCP或Docker基础。

总时长1080–1365分钟，即18小时～22小时45分钟，云账号/DNS/Provider等待另计。C1补上Stage1～4或等效能力自检。C3/C6/C8/C9为配置和故障密集课，时间是建议范围，缺少独立学员计时研究；不能作为完成时间保证。

修正C2“Run留给C5”：实际C4建Run，C5扩展Workflow。C4～C8原装配README错误继承C3范围，已修正，并补作者测试所需Mock开关、MCP fixture和Eval allowlist说明。没有用作者终端的隐式环境冒充学员路径。

## 5. Starter Audit

`starter/capstone`只有Next/TS/config、空app壳、可执行test命令、README和三个空模板。没有Prisma、Auth、Workspace/Task、文件、Agent、Citation、MCP、Note、Eval或生产交付实现。C1新装配的安装/检查/build验证了同一Bootstrap工程。

bootstrap.test只是验证测试命令能执行，不证明业务正确；后续课程的真实HTTP/DB测试承担产品验收。Starter当前没有平台下载注册，这是发布待办，未偷偷公开Reference。

## 6. Student Ownership Audit

| Capability | Student Builds In |
|---|---|
| Product Brief / User Flow | C1 |
| Architecture / ADR | C2 |
| Workspace / ResearchTask | C2 |
| File Knowledge | C3 |
| Grounded Report / Citation Snapshot | C4 |
| Research Agent / Brief / Step | C5 |
| External Evidence / Source Policy | C6 |
| Human-approved Write / KnowledgeNote | C7 |
| Product Eval | C8 |
| Production Delivery | C9 |

学生决定用户问题、选型标准、领域边界、证据资格、授权与部署风险；AI生成boilerplate、adapter/UI/tests。学生必须检查Diff、migration、ownership predicate、strict input、事务与故障证据。前课允许未来领域图，但没有提前交付下一课核心实现。

## 7. Reference Reconstruction

全部从新目录 `.runtime/release-audit/c1`～`c9`装配，未复用旧C9 Reference。装配链为Bootstrap+C1文档+逐课overlay，C2只抽取Stage4的最小Auth原语。

README修复后又全新装配 `reviewed-c1`～`reviewed-c9`，随后对最终阶段README条件化修正再装配 `reviewed2-c1`～`reviewed2-c9`。逐文件比较证明除README和Next生成类型声明外，所有源/配置/锁文件与已完整测试的对应阶段相同（分别17/34/59/69/84/96/115/127/150个文件）。文档修复不改变业务实现；此比对将已有执行证据绑定到修复后装配，而非假装重新执行了所有付费调用。

| 阶段 | npm ci / lint / typecheck / test / build | 单测数 | 关键运行证据 |
|---|---|---:|---|
| C1 | 五项PASS | 1 | 产品文档+build |
| C2 | 五项PASS | 1 | 空DB、注册/Task/刷新/隔离HTTP |
| C3 | 五项PASS | 4 | Garage签名、PDF、失败重试、scoped retrieval |
| C4 | 五项PASS | 10 | grounding/拒答/假引用/来源删除快照 |
| C5 | 五项PASS | 19 | workflow/工具/取消/预算/隔离 |
| C6 | 五项PASS | 29 | 鉴权MCP fixture、额外工具不授权、混合证据 |
| C7 | 五项PASS | 33 | HTTP审批+5项真实事务测试 |
| C8 | 五项PASS | 39 | 25/25 Eval |
| C9 | 五项PASS | 40 | release、Docker、DB/HTTP、Eval、recovery |

## 8. Final Reference Verification

全新C9 npm ci/lint/typecheck/test/build通过。release:check首次因本审计并行DB测试持有Windows Prisma engine DLL导致EPERM；结束该进程后串行完整重跑通过，包含generate、lint/typecheck/40tests/build/Eval/baseline/两种audit。没有删锁文件、跳过generate或更改门槛。

C9 Reference源/锁文件未因本轮审计改变；Docker从新装配context构建，复用了内容一致的合法缓存层。不能将此称为云部署验证。

## 9. Database / Migration

新建独立PostgreSQL17+pgvector容器，两套新库服务：各阶段空库audit_c2～audit_c7、最终capstone_c9_test，以及单独55440的capstone_c8_eval。没有使用平台库或生产库，没有db push/reset。

C2～C9均执行migrate deploy/status。最终六条migration成功；数据库查询确认vector extension0.8.6、KnowledgeChunk.embedding为vector(1024)。六条为initial/knowledge/grounded_report/research_workflow/external_evidence/human_knowledge_write。scoped vector retrieval由C3 HTTP及最终Eval再次实际执行。

## 10. Product Test Regression

C2～C7及C9 test:db全部PASS。C3验证signed PUT/GET、匿名拒绝、sealed原文、真实PDF页、故障无半索引/Retry和Alice/Bob。C4验证假key/坏输出/无证据/Provider失败、重索引与删除后的历史快照。C5验证strict工具、停止/取消/失败及隔离。C6是真实本地MCP HTTP fixture，明确不是live Crossref；验证额外工具不授权、关闭外发、metadata-only、timeout/429/坏URL降级。

C7/C9各跑五项真实DB integration：并发approve仅一条Note、INSERT后异常整体rollback、编辑旧token失效/reject、expiry/Provider失败、并发proposal唯一与来源删除后Note存活。最终C8 Eval进一步组合这些边界。

## 11. Product Eval

新C8和新C9均25/25。最终C9运行默认Eval、baseline comparison，串行release gate再跑一次。Hit@3=10/10，MRR=0.95；37项case/metric比较unchanged，无regression。数据/runner版本和安全计数保存在evidence JSON。

四种注入只改变Eval observation，不实际越权：leak→FAIL/exit1；unapproved-write→FAIL/exit1；unsupported-claim→FAIL/exit1；execution-error→INCOMPLETE/exit2。没有把执行失败写成零泄漏PASS。

本轮未跑完整昂贵real Eval。C8历史词法8/9、optional Judge9/9、lexical_fidelity_flags=1仍是历史证据，不能覆盖本轮真实Smoke失败。

## 12. Safety Hard Gates

| Gate | 最终deterministic值 |
|---|---:|
| cross_workspace_leaks | 0 |
| unapproved_writes | 0 |
| duplicate_knowledge_notes | 0 |
| invalid_citations | 0 |
| unsupported_deterministic_claims | 0 |
| unsupported_answer_count | 0 |
| partial_ready_count | 0 |
| tamper_accepts | 0 |

覆盖Workspace/private source、strict tool args、fixed MCP、来源策略、Citation allowed-set、exact approval/expiry/tamper/version/concurrent/rollback/replay/Note isolation。C8 storage stub不证明IAM，私有性另由真实Garage C3 smoke验证；云IAM/CORS未验证。没有发现安全回退。

## 13. Dependency Audit

最终C9新装配 `npm audit --omit=dev --json` 和 `npm audit --json` 均0 vulnerabilities，串行release gate同样确认。Next15.5.27、Prisma6.19.3及PostCSS/deepmerge override保持已验证组合。

**独立平台发现**：平台根目录生产audit为2 Moderate/1 High/0 Critical；High为sharp。全量为4 Moderate/7 High/2 Critical/13 total，涉及sharp、concurrently/shell-quote、Tailwind/braces等。不能把Reference零漏洞宣传成整个平台零漏洞。未进行可能涉及Tailwind major迁移的平台依赖重构；此项列为正式开放前的安全阻断，需单独修复并回归平台。

早期阶段保留其历史依赖快照，C9才修依赖；中途npm ci的告警没有被隐藏。学生必须完成C9修复后才部署。

## 14. Docker / Runtime

新runtime和release target实际build通过。runtime image `sha256:bc395e0cce1d32ff69247f1dcf93f7ee0337d298a9fd0e0d2980dffa83c62cb1`，127199166 bytes，USER node。PORT3153实际运行；health在空DB时仍返回ok，验证它不依赖DB/Provider。release image实际执行migrate status，六条up-to-date。

真实TXT/PDF在新镜像内上传处理为READY；Embedding与Chat实际调用。私有研究Run21 MODEL_FAILED安全终结；Run22成功报告，但Proposal反复不满足2000字符上限。后续定点复验Run23完成混合报告，含KNOWLEDGE/CROSSREF/KNOWLEDGE三条Citation，并成功real Proposal/Approve/Replay one Note。

因此：**真实组件集成已复验，完整Staging Full Smoke仍FAIL**。不能合并几次局部成功写成一次完整PASS。新镜像PDF文本解析可用，optional canvas/DOMMatrix/Path2D warning仍存在；本产品不渲染PDF图片/不做OCR。

structured log只含event/runId/step/status/errorCode/latencyMs，实际失败和完成事件均观察到。诊断时只在ignored本地挂载harness记录finish_reason/JSON keys/长度，不输出内容、凭据或Token，未修改产品代码。

## 15. Crash Recovery

真实DB recovery测试PASS：dry-run不写；旧RUNNING+旧Step→FAILED/PROCESS_INTERRUPTED；10秒新Run不变；旧Run但近期完成Step不变；COMPLETED不变；PROPOSED Action和Note不变；重复/并发幂等。恢复不Resume、不生成Note、不替人批准。

## 16. Cloud Deployment

**NOT VERIFIED**。没有可用于本产品的云部署目标/配置与公开HTTPS证据。本轮没有创建收费云资源、伪造域名或自动发布。

## 17. Cloud Database

**NOT VERIFIED**。本地全新空库与restore通过，不证明云TLS、权限、容量、备份或连接策略。下一轮必须核实实际云provider及pgvector、六migration和scoped retrieval。

## 18. Cloud Object Storage

**NOT VERIFIED**。Garage私有性有新证据；Production R2 IAM、生产origin CORS、真实浏览器PUT/GET未验证。S3 adapter和preflight不能替代云bucket配置及浏览器验证。

## 19. HTTPS / MCP

生产HTTPS/MCP为**NOT VERIFIED**。本地真实MCP已认证连接并调用live Crossref：3条结果、2条eligible abstract。Run23实际调用外部工具并引用Crossref；另一次外部调用429，记录FAILED Step并保留已有证据。没有把远端listTools当授权，也没有关闭严格query约束。

## 20. Production Safe Smoke

**NOT VERIFIED**。没有public HTTPS目标，不能合法执行production-smoke；本地Staging例外不算生产Safe Smoke。脚本静态逻辑/单测验证opt-in、public HTTPS、synthetic、60HTTP/8min上限及禁止本地目标。真正公网执行仍是阻断。

完整本地Staging脚本新复验未PASS。先前过早启动时空DB注册失败（无付费调用）；迁移后第一次MODEL_FAILED；第二次报告完成但Proposal失败。随后定点诊断确认一条Proposal为2318字符，strict契约拒绝，Action/Note未产生。Run23的1477字符Proposal成功批准并重放。这是Provider输出风险，不允许以截断或放宽2000上限求绿。

## 21. Backup / Rollback

本地新库实际pg_dump custom格式→新空audit_restore→pg_restore --no-owner成功；六migration、extension0.8.6和vector(1024)一致。之前不可变runtime image `sha256:0686747873bfdb19f240c9d4991ed3a2293086bacd7bed3e7b2002a8fb994a4b`在独立3154容器启动，health200。此为本地restore/旧image启动演练，**不是云备份恢复验收**，也没有验证生产数据回滚。

迁移策略：当前六migration无C9破坏性schema变更；应用回滚前核对schema/config兼容。迁移采用forward fix；必要时restore到新DB，禁止migrate reset。已核对[Render backups](https://render.com/docs/postgresql-backups)和[rollbacks](https://render.com/docs/rollbacks)：paid DB可PITR至新实例；镜像使用digest、环境组和DB不会随应用自动回滚。实际账户流程和恢复窗口仍待验证。

## 22. Platform Integration Audit

当前Stage loader、course API、progress和download白名单均没有Capstone接入。已有Project Lab ProductEntitlement/hasProductAccess是可复用基础，不能视为C1～C9已受保护开放。展示页锁定正确，无付费正文泄漏。

设计与逐文件影响列表见 [Publishing Integration Plan](capstone-publishing-integration-plan.md)。没有实现新route、entitlement或progress表。

## 23. Capstone Lesson Publishing Model

独立Project Lab。未来正式正文建议 `course-content/capstone/c1.md`～`c9.md`，由可信独立catalogue定位。保留Stage1～4正式29课；不得变成38课或伪造Stage5。正式正文只在服务端鉴权后读取，不前端import。

## 24. Progress Model

当前Capstone独立progress未实现。计划独立CapstoneLesson/Progress/Check及API，0/9单独计算；Stage formalProgress继续29。服务端验证稳定checkKeys，写入与停用/撤权协调，不只用localStorage或UI勾选。

## 25. Entitlement / Access Control

现有项目版开通事务写四Stage entitlement +独立project-lab产品权益；全阶段课程版没有这个产品权益。未来Capstone正文、进度、附件均需ACTIVE account + ACTIVE project-lab服务端判断，撤权/停用生效。匿名401/无权限403/未发布或未知404。当前尚未接入这些Capstone端点，列发布阻断。

## 26. Pricing / Product Copy Consistency

Pricing、planTemplates、PurchaseModal、Projects与Showcase按项目版权益与“暂未开放”表述，29 Stage课程未改成38；当前未发现Capstone的12～15小时承诺。repo历史Stage4的12～15小时不是Capstone时长，不能批量替换。未找到可作为本产品现行公开承诺的独立Product Handbook。

未改Pricing、价格、购买按钮、权益开通模型。下一轮发布要将各处“暂未开放”同步更新，并明确29 Stage +9 Capstone、18～22h45和前置能力，不能提前承诺已经开放。

## 27. Showcase Audit

title/subtitle/description/exitState/abilities/九课lessons/technologies与叙事匹配。公开页面标题仍写“八课毕业路线”，本轮修为九课，状态仍锁定。核心栈与交付物存在对应课程。

`deliverables: Production Product`仍保留。云未验证，列 **Product Claim Decision Needed**：负责人选择保持生产承诺并完成云验证，或独立批准改为Deployable/local production-like并同步C9与文案。本轮不替负责人改承诺。

## 28. Bundle / Content Leakage Audit

扩展check-bundle：检查internal Capstone lesson/overlay/完成Brief/ADR/Gold/答案/作者validation与本轮audit，全文/长段落及JSON转义marker；所有内部文件含二进制fixture做精确hash对比；拒绝public course-content/starter/ZIP/private环境目录；检查私钥/AWS marker和当前已加载的秘密值，不输出值。

新构建339个dist/public文件通过，既有30篇正文（含预备课，正式课仍29）与190个内部文本artifact通过。负向把完成Product Brief复制进dist，exit1精确拒绝，随后只删除该明确测试文件。并非穷尽式secret认证：未知凭据、变形文本或重新编码的泄漏仍需下载白名单、代码审查和发布gate。

## 29. Student Deliverables

已审查C9 README、architecture.md/mmd、trust-boundary、demo/resume/interview/retrospective/deployment/release-evidence。未发现作者机器路径、本地用户名、秘密或虚假Demo URL；当前云URL明确未验证。示例Eval数字明确是Reference证据，Resume要求学生换成自己的事实；不能借用历史25/25/8/9或本轮结果当学生成果。

未来下载仅Bootstrap、选定合成fixtures和空模板；不公开任何overlay、完成Brief/ADR、内部Reference、Gold答案、作者记录。具体白名单见Publishing Plan。

## 30. Editorial Findings

| 发现 | 处理 |
|---|---|
| C2说Run留给C5，与C4冲突 | 已改C4建Run/C5扩展 |
| 展示页八课标题与九课数组冲突 | 已改九课 |
| 前置能力与总时长未在开头明确 | C1补Stage1～4/等效能力与18～22h45 |
| C4～C8继承C3 README错误范围、隐藏fixture配置 | 装配器生成对应阶段README并补测试说明 |
| C6/C8/C9步骤密、配置/费用/等待较多 | 风险记录；不砍安全实验，不承诺按上限必然做完 |
| Reference历史数字与当前验收易混淆 | 保留历史标识、本轮单独证据，不伪造更新旧结果 |
| Production Product无云证据 | 阻断/负责人决定，不擅自改承诺 |

人工通读未发现重新教授整套基础课程或巨型一键生成最终产品的Prompt；每次新增能力后都有Diff/Explain/Run/Break/复验。独立学员试学尚未发生，不能把作者走查当真实学员研究。

## 31. Prompt Quality Audit

全部56个Prompt实际可复制，输入随当前工程阶段；输出范围明确、未来课禁止项清楚。C1产品审查和C2选型先由人决定。C3～C7逐步schema/adapter/runtime/UI，而非空工程一条Prompt写完；C8先契约/Gold再runner；C9先只读审查再必要交付。

编码Prompt要求不操作Git，最后由学生检查并保存；只读审查不写文件。权限来自Session/Workspace、strict tools、exact approval与事务，不交给模型决定。Diff/Explain要求贯穿课程；个别Prompt不逐条重复全部边界，依靠相邻正文/既有工程契约，已纳入通读核对。

## 32. Public Claims Audit

可支持：九课工程演进、Reference可重建、固定deterministic Eval通过、局部真实组件集成和本地恢复。不可支持：fully production-verified、公网Demo/云IAM/CORS/云backup保证、真实用户效果/准确率、完整本轮Staging PASS、所有Provider调用成功。

固定Gold的Citation support不等于通用语义认证；Judge9/9不能遮住词法flag或安全门；真实Proposal长输出会安全失败。公开Production Product交付承诺必须等云gate和完整smoke通过或由负责人重新定义。

## 33. Release Matrix

| Area | Status | Evidence | Blocker |
|---|---|---|---|
| C1–C9 lessons | PASS | parse+SSR/56Prompt/61key/全文通读 | 否 |
| Bootstrap | PASS | 最小文件树+C1 ci/build | 否 |
| C1–C9 assembly | PASS | 三套新装配/源文件一致比对 | 否 |
| Final Reference | PASS | ci/lint/typecheck/40tests/build/serial release | 否 |
| DB migrations | PASS LOCAL | 6 migrations/0.8.6/vector1024 | 否，云另列 |
| Unit / DB / HTTP | PASS | 九阶段单测、C2～C7/C9 HTTP、事务5项 | 否 |
| C8 Eval | PASS | 最终25/25、37unchanged、四注入 | 否 |
| Safety gates | PASS | 八项0 | 否 |
| Reference Dependency | PASS | production/full audit0 | 否 |
| Platform Dependency | FAIL | prod1High；full2Critical/7High | 是 |
| Docker | PASS LOCAL | 新runtime/release build/run/CLI | 否 |
| Recovery | PASS LOCAL | dry/fresh/stale/recent/proposed/idempotency | 否 |
| Real component integration | PASS LIMITED | Run23 mixed+realProposal+oneNote | 完整smoke另列 |
| Staging Full Smoke | FAIL LOCAL | MODEL_FAILED及Proposal超长；未得到完整PASS | 是 |
| Cloud Runtime | NOT VERIFIED | 无publicHTTPS部署证据 | 是 |
| Cloud DB | NOT VERIFIED | 只有本地新库证据 | 是 |
| Cloud Storage | NOT VERIFIED | 只有Garage；R2 IAM/browserCORS未测 | 是 |
| HTTPS MCP | NOT VERIFIED | 本地authenticated/liveCrossref通过 | 是 |
| Production Smoke | NOT VERIFIED | 无publicHTTPS目标 | 是 |
| Backup / rollback | PARTIAL LOCAL | 新库restore+旧digest health；云未测 | 是 |
| Platform lesson loader | MISSING | Stage-only resolver | 是 |
| Progress model | MISSING | Stage-only progress | 是 |
| Entitlement | PARTIAL | product-lab模型有，Capstone路由guard未接 | 是 |
| Pricing consistency | PASS CURRENT | 29/项目版/暂未开放；未改价格 | 发布时同步 |
| Bundle leakage | PASS SAMPLED | 339文件/内部marker+hash/负向exit1 | 否，保留白名单gate |
| Public claims | DECISION NEEDED | Production Product vs云NOT VERIFIED | 是 |

## 34. Blocking Issues

1. 公网runtime/云DB/私有云存储及browser CORS/HTTPS MCP/Production Safe Smoke/云backup与rollback证据缺失。
2. Capstone正式正文Loader/服务端project-lab权限/独立0/9进度/受保护资源下载尚未实现。
3. 本轮完整真实Staging Smoke未PASS；有真实MODEL_FAILED和超长Proposal，必须保留严格契约，在下一轮受控环境完成一次完整验收。
4. 平台生产依赖sharp High；平台全量开发链另有Critical/High，需审查与回归修复。
5. 生产交付公开承诺尚不能用证据支持；需要完成云验证或负责人明确批准范围变更。

## 35. Non-blocking Risks

小型合成Gold、闭集support规则、Judge随机性；同步workflow/no Worker、单实例rate limit；人工触发recovery；Provider/Crossref可失败、同义/中文分布外质量待更多样本；短期签名URL属于bearer capability；无Team/RBAC/OCR/Note索引。ESLint支持周期和Next插件warning、PDF可选canvas warning均记录。上述风险不能替代第34节阻断项。

## 36. Fixes Made During Audit

仅修C1前置说明、C2领域课程归属、展示页九课typo、装配README/测试说明、bundle保护检查，新增跨九课Renderer/key/Prompt检查和审计/云清单/发布设计。未修改Capstone产品业务逻辑、历史Stage1～4内容、Pricing、权益或发布位；未新增功能/课节/Tag。

修后重新跑受影响Renderer/checker、装配与非README内容一致验证、平台typecheck/build/84tests/全check和bundle负向；Reference执行代码未改变，九阶段完整命令、最终Eval/DB/HTTP/release/Docker证据仍绑定相同源与lock。首轮EPERM串行重跑成功，真实失败保留，不隐藏。

## 37. Cloud Verification Checklist

详见 [Cloud Verification Checklist](capstone-cloud-verification-checklist.md)。只剩真实目标/隔离配置、cloud migration/vector、private bucket/browser CORS、HTTPS/MCP、staging完整smoke、production safe smoke、provider backup/restore与不可变image rollback证据。云目标未提供时停止新增功能，下一轮专门验证。

## 38. Publishing Plan

仅设计，详见 [Publishing Integration Plan](capstone-publishing-integration-plan.md)。先补阻断证据，再经独立批准实现正式正文storage/routes/server entitlement/progress/附件和公开状态。Stage29与Capstone9独立。当前没有移动正文、开通用户或解锁。

## 39. Full Verification

实际命令与每阶段exit code完整保存在evidence JSON。原始日志目录 `.runtime/release-audit`。

- 每个c1～c9：`node scripts/assemble-capstone-reference.mjs cN .runtime/release-audit/cN`；`npm ci`、`npm run lint`、`npm run typecheck`、`npm test`、`npm run build`，45项exit0。
- 修后 `reviewed-c1`～`reviewed-c9`新装配，逐文件比较源/配置/lock一致。
- C2～C9：`npx prisma migrate deploy`、`npx prisma migrate status`，全部exit0；C2～C7/C9 `npm run test:db` exit0；C9 `npm run test:recovery` exit0。
- C8与最终C9 `npm run eval:capstone` exit0/25case；C9 `npm run eval:capstone -- --compare-baseline eval/baseline.json` exit0/37unchanged。
- C9四条`--case … --inject-failure leak|unapproved-write|unsupported-claim|execution-error`，exit1/1/1/2符合预期。
- C9 `npm run release:check` 首轮exit1（本地DLL锁），串行重跑exit0；`npm audit --omit=dev --json` / `npm audit --json` exit0/0。
- `docker build --target runtime` / `--target release`；新runtime实际运行；release容器`npx prisma migrate status`；SQL查migration/extension/vector，PASS。
- `npm run smoke:staging`的等价脚本入口 `node scripts/staging-smoke.mjs http://127.0.0.1:3153`（两显式local opt-in），完整运行FAIL；定点真实MCP/privateReport/mixedReport/Proposal/Approve/replay结果单列，未合并为PASS。
- `npm outdated --json`实际执行（exit1表示存在较新版本，不等于漏洞）；recovery CLI实际dry-run eligible3/apply3/最终dry-run0，处理的是专用测试库中已陈旧的合成Run。
- C9无配置运行 `node scripts/check-production-env.mjs` 预期exit1；显式opt-in对本地地址执行production-smoke预期exit1，未发生产请求。
- 专用本地库 `pg_dump -Fc`、新空库`pg_restore --no-owner`；旧image digest启动和health200，本地演练PASS。
- 平台 `npm run check`、`npm run build`、`npm test`（84/84）、`npm run typecheck`、`npm run check:capstone-release`、C2/C9 checker、`npm run check:bundle`通过；Product Brief泄漏注入exit1。
- 平台两种audit非零发现如第13节，未隐藏。
- `git status`、`git diff`、`git diff --check`实际执行；最终提交/推送结果见第41节和最终回复。

## 40. Files Changed

1. `course-content/internal/capstone/c1/lesson-draft.md`
2. `course-content/internal/capstone/c2/lesson-draft.md`
3. `src/pages/CapstoneOverview.tsx`
4. `scripts/assemble-capstone-reference.mjs`
5. `scripts/check-bundle.ts`
6. `scripts/check-capstone-release.ts`
7. `package.json`
8. `docs/capstone-release-readiness-audit.md`
9. `docs/capstone-release-audit-evidence.json`
10. `docs/capstone-cloud-verification-checklist.md`
11. `docs/capstone-publishing-integration-plan.md`

只有以上文件拟提交。运行目录、数据库、logs、secrets、signed URL和token不入Git。没有批量删除。

## 41. Git

基线main/origin/main：15646e9c457d6bafb5f1d6f4692b98e0e1552ead。审计修复提交消息：`Audit Capstone release readiness`。本文件与证据位于该提交，最终SHA、origin/main一致性和working tree由提交后实际命令核对并在最终回复给出；不把本地SHA当云部署SHA。没有Release Tag或课程发布。


# Phase A Remediation Addendum

日期：2026-10-08。基线：8a6145a96b10889420172486d177eb757d68c4d0。

## A. Verdict / Scope

**PHASE A BLOCKED**。整体 Final Release Readiness 继续 **BLOCKED**。

production High 与全部 Critical 已移除，但平台 full audit 的 Tailwind 3 / braces High 链仍在；一次完整真实 Staging Smoke 仍因 planner 结构输出失败。没有将局部成功合并为 PASS。原审计与失败记录全部保留。本附录及安全结构证据见 docs/capstone-phase-a-evidence.json。

没有云部署、production bucket/domain、Production Smoke、Loader、progress、route、entitlement、Pricing、download、课程解锁或 Tag。正式 Stage 仍 29 节，Capstone 仍暂未解锁、Internal Authoring。课程正文未修改：本轮只有依赖、内部指令、验证入口与测试变化，没有引入 Repair 等学生可观察的新流程。

## B. Platform Dependency Remediation Matrix

重新运行 npm audit --omit=dev --json、npm audit --json、npm outdated --json 和 npm ls，依据当前 advisory 与实际 lock。outdated 首次遇到本机 npm cache ENOENT，改用独立 .runtime/blocker-phase-a/npm-cache 后成功获取清单；没有将该错误解释为无过时依赖。

| Package / chain | Severity | Runtime / Dev | Direct / Transitive | Fixed Version | Breaking Risk | Decision |
|---|---|---|---|---|---|---|
| sharp | High | Runtime | Direct | 0.35.5 | Patch; native libvips update | 0.35.4 → 0.35.5; avatar HTTP regression passed |
| concurrently → shell-quote | Critical (2 affected packages) | Dev | Direct → transitive | concurrently 10.0.6 / shell-quote 1.12.0 (advisory fixed >=1.11.0) | Patch / compatible minor | 10.0.5 → 10.0.6, lock resolves shell-quote 1.12.0 |
| postcss → source-map-js | High | Dev | Transitive | 1.2.2 | Patch | Lock update 1.2.1 → 1.2.2 |
| tailwindcss → chokidar → braces; tailwindcss → fast-glob → micromatch → braces | High (5 affected packages) | Dev | Direct Tailwind / transitive remainder | No published braces patch; npm proposes Tailwind 4.3.3 | Major CSS compiler/plugin/configuration migration | BLOCKED; keep Tailwind 3.4.19, no unsafe overrides or major migration |
| tailwindcss / postcss-nested → postcss-selector-parser | Moderate (2 affected packages) | Dev | Transitive | 7.1.6; parent range requires older major | Major transitive override or Tailwind migration | Retain, disclose; not disguised as zero vulnerabilities |
| react-router-dom → react-router | Moderate (2 affected packages) | Runtime | Direct → transitive | 7.18.0+; npm proposes 7.18.4 | React Router 6 → 7 major | Retain, disclose; no unrelated routing migration |

来源：[sharp advisory](https://github.com/advisories/GHSA-wq5f-xc86-pv6w)、[shell-quote advisory](https://github.com/advisories/GHSA-pqg4-j6r4-53mv)、[source-map-js advisory](https://github.com/advisories/GHSA-68fv-2mgg-jv7q)、[braces advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)。当前 braces advisory 明确 Patched versions: None，npm registry 最新仍 3.0.3；Tailwind 3 最新 3.4.19 仍使用受影响链。

剩余五个 High 为 braces、chokidar、micromatch、fast-glob、tailwindcss 的关联计数，不是五个独立 root advisories。不能以 Dev 为由豁免。没有可发布的兼容 braces 补丁；不将 chokidar 4 强行覆盖 chokidar 3 API，也不随意替换 micromatch 的 brace parser。npm 建议 Tailwind 4.3.3；这涉及 CSS 编译、PostCSS 插件、配置与 utility 行为、整个页面样式和 watcher 回归，需要负责人决定后单独迁移。没有执行 audit fix --force 或 React/Vite/Tailwind/Prisma major。

| Scope | Before | After | Gate |
|---|---|---|---|
| Platform production | 2 Moderate / 1 High / 0 Critical | 2 Moderate / 0 High / 0 Critical | High/Critical gate PASS，非零漏洞仍披露 |
| Platform full | 4 Moderate / 7 High / 2 Critical | 4 Moderate / 5 High / 0 Critical | BLOCKED |
| Final Reference production | 0 | 0 | PASS |
| Final Reference full | 0 | 0 | PASS |

sharp 实际用于 server/routes/me.ts 的头像上传：读取 WebP、拒绝非法/动画/超像素输入、旋转裁剪到 512×512、重编码 WebP、写入数据库。升级后 tests/avatar.test.ts 实际经过 HTTP 上传、读取 metadata、隔离、替换、重登录持久化与 reset 路径，PASS；不是只验证库能 import。

## C. MODEL_FAILED Diagnostic / Fix / Remaining Blocker

合成 fixture、真实 qwen3.7-flash、当前真实工具 schema，**最多五组，实际五组、15 次调用、无 retry**。前三组各最多三个 turn；后两组最多四个 turn，第二组在第二个 turn 即失败。只记录 HTTP status、finish reason、choices/content/tool count/length、工具名、JSON 顶层 keys、latency 和 error category；不保存原始正文、prompt、私有 evidence 或凭据。

复现到 HTTP 200 + stop，但 adapter 拒绝 ready decision，归类 **INVALID_RESPONSE / INVALID_MODEL_TURN**。前期诊断没有保存 stop JSON 的字段形状，不能断言是语法错误或具体哪个字段值；诊断脚本最初将 generic rejection 标成 MALFORMED_JSON，证据已纠正为 INVALID_RESPONSE，未把猜测当事实。

最小修复：planner 指令明确 stop 只能返回唯一 ready_to_synthesize=true 字段，不能返回 false/额外字段/正文；增加 request 注入仅供 deterministic contract tests。合法 true 接受，false/extra/malformed 拒绝且每例只有一次调用。未修改 strict tool parser、citation allowed-set 或 runtime limits，未增加 retry/repair。

修复后的真实完整 Smoke 再次出现 **HTTP 200、stop、非空 29 字符、零 tool call、有效 JSON 却不是合法 ready object**，本地安全诊断标记 INVALID_RESPONSE，Run 为 MODEL_FAILED。说明单靠指令补强仍不足以解除稳定性阻断。旧审计缺少同级诊断，不能声称已经证明旧失败是同一个具体输出。没有无限重刷或继续试改。

Research 上限仍为 4 model turns / 3 tools / 10 provider units / 120s deadline；cancel、external query 与 MCP 工具暴露边界保持。

## D. Proposal Contract / Prompt / Fidelity

原真实 2318 字符失败记录保留；本轮 deterministic 2300 字符仍严格失败。真实 content 不 slice、不保存超限、不放宽 2000；title 仍 <=120。新的指令目标 1200–1600 字符，硬上限 2000，优先核心结论、限制、适用条件，不逐条重写 Report、不重复来源，保留实体/数字/不确定性与 Human Review。

没有加入 Proposal Repair：post-run 每次最多一次 provider call、一个 provider unit、共享现有 30s action timeout，maxTokens=1800 只控制成本，不保证字符长度。测试 1600/2000 字符原样接受，2300 拒绝，所有分支调用数为 1；既有额外字段/工具调用/provider failure 测试继续 PASS。

C8 deterministic Note Fidelity 4/4、数字/实体/否定/新增事实负例继续通过，没有改 threshold 或 gold。没有 repair path，因此 repair 特定测试不适用。完整 Smoke 在 Proposal 之前失败，**真实 Proposal 小样本未运行（0 次），真实 Proposal fidelity NOT VERIFIED**；不能以 prompt 改动或 mock fidelity 代替真实证据。原 Proposal contract stability blocker 尚未解除。

## E. One Full Staging Invocation

fresh assembled .runtime/blocker-phase-a/c9；另 fresh assemble 153 源文件逐字节比对，0 mismatch。独立新 PostgreSQL/pgvector 容器；空 capstone_phase_a_staging DB 正式 migrate deploy 六条 migration。与安全回归的 capstone_c9_test、Eval 的 capstone_c8_eval、平台 DB 分离。

最终 Linux Docker runtime 用 real chat / embedding、MCP/Crossref；本地私有 Garage 合成对象前缀，不复用先前失败账号/文件/Run。loopback storage bridge 仅是本地测试 harness，不作为云 HTTPS/IAM 证据。

Runner 补上 Human Edit/version/token 更新，并将私有 Run 限于 Report 验证，只对混合 Run Proposal → Edit → Approve → Replay，目标当前账号总共 exactly one Note；保留 60 HTTP / 480s / staging 两个 Research Run 上限。失败输出带 phase/category/retry/partial side effects，安全日志不打印 cookie/token/signed URL/正文。该新增后半段在本轮真实 Smoke **尚未到达**，C7 HTTP 编辑/审批回归单列通过，不拼接为完整成功。

**Full Staging Smoke: FAIL**，仅一次 invocation，16 HTTP，14700ms。

- Register/Login、TXT/PDF upload → 两个 READY、private retrieval、Private Run/grounded report/citation snapshots 已通过。
- exact phase：PRIVATE_AND_EXTERNAL_run；HTTP 502；安全 Provider category INVALID_RESPONSE；Run error MODEL_FAILED。
- retryOccurred=false。
- 数据库实际状态：1 User，2 READY documents，Run 1 COMPLETED，Run 2 FAILED/MODEL_FAILED，0 ResearchAction，0 KnowledgeNote。
- 混合报告/MCP/Crossref 完整链、Proposal、Human Edit、Approve/Replay、protected original/anonymous source check 未在这次调用中完成，不标 PASS。
- 不运行 after-PASS 的五次 Proposal 样本，不伪造 5/5。

## F. Full Verification

| Project / command | Actual result |
|---|---|
| Platform npm ci | exit 0 |
| Platform npm run db:generate | exit 0；fresh ci 后必须生成本 schema client |
| Platform npm run typecheck | exit 0 |
| Platform npm test | exit 0，84/84，含 avatar 实际路径 |
| Platform npm run check | exit 0 |
| Platform npm run build | exit 0 |
| Platform npm run check:bundle | exit 0；最终附录后已复验（339 public files） |
| Platform npm audit --omit=dev / npm audit | exit 1/1，分别 Moderate 留存、High 留存；见矩阵，不隐藏 |
| Final Reference npm ci | exit 0 |
| Final Reference npm run lint / npm run typecheck / npm test | exit 0/0/0，42/42 |
| Final Reference npm run build | exit 0；最终 release:check 又实际 build |
| Final Reference npm run eval:capstone | exit 0，25/25 |
| Final Reference npm run eval:capstone -- --compare-baseline eval/baseline.json | exit 0，no regression |
| Final Reference npm run release:check | 最终版本 exit 0，含 42 tests/build/Eval baseline/audit |
| Final Reference npm audit --omit=dev / npm audit | exit 0/0，0 vulnerabilities |
| Final Reference c5-http-smoke / c6-http-smoke | exit 0/0 |
| Final Reference npm run test:db | exit 0，C7 HTTP + 5 DB transaction tests |
| Full real staging-smoke | exit 1，FAIL，不重刷 |

C5/C6：unknown/bad/multiple tools、steps/tools/provider budget、timeout/cancel、external disabled/query restriction、MCP extra tool/degradation、isolation 均回归。C7：strict Proposal、Edit/old token、approve/double/concurrent/rollback、reject/tamper/expiry/Bob/replay 均回归。

环境准备失败也保留：fresh root npm ci 后尚未 generate Prisma 导致第一轮 typecheck/test/check/build/bundle 失败，生成后重新完整通过；Reference 最早两次显式 Eval 在空库 migration 前为 EVAL_SETUP_OR_REPORT_ERROR/exit2，migration 后显式 Eval/baseline 和最终 release:check 均通过。不是降低门禁或修改测试换绿。

## G. Remaining Decisions / Cloud / Publishing / Git

本轮 BLOCKED：需决定如何解除 Tailwind 3/braces 无兼容补丁链；Research planner valid stop JSON 结构仍不稳定，必须继续按严格 adapter contract 解决，不能把 false/额外字段当 ready；随后才有新的有预算的独立全链验收和真实 Proposal 样本依据。

Cloud Runtime、Cloud DB、R2、HTTPS MCP、Production Smoke、Cloud backup/rollback 继续 **NOT VERIFIED**。docs/capstone-cloud-verification-checklist.md 与 docs/capstone-publishing-integration-plan.md 未改动。Production Product claim 仍无依据。

本轮修改：package.json、package-lock.json；C6 research-model.ts 与新 research-model.test.ts；C7 knowledge-note-provider.ts / knowledge-note.test.ts；C9 delivery-smoke.mjs；本审计附录；docs/capstone-phase-a-evidence.json。诊断/日志/DB/凭据只在忽略的 .runtime 或本地测试环境，未入 Git。没有删除文件。

提交消息：Remediate Capstone local release blockers。最终 SHA、origin/main 和 working tree 由实际提交后核对，见本轮最终回复；不创建 Tag。


# Phase A2 Addendum

2026-10-08；基线 b9d394067f630539bb929d4d85372485139fd410。**Phase A2 BLOCKED，整体 Release BLOCKED**。本轮不是 C10，没有云验证、Publishing、Pricing/Entitlement、解锁或 Tag。正式 Stage 仍 29 节。

## 1. Planner Protocol Decision / Implementation

旧协议把 HTTP 200/stop 的 content 必须精确解析为 ready_to_synthesize=true 当成控制信号。现在按 Provider metadata：finish_reason=stop 且无 tool_calls → 内部 ready；Planner content 不解析为业务 JSON、不执行、不展示、不保存为产品输出。它可以是 JSON/prose/empty/null；Report 仍由独立 Provider 与 Grounded Report Contract 产生。

finish_reason=tool_calls 时只映射函数提议，Runtime/Registry 仍要求恰好一个 allowlisted call、strict args、source policy、workspace ownership 与 exact external query。零/多工具、unknown/bad/extra args 仍拒绝。stop-with-tools、length/content_filter/unknown finish 仍 INVALID_MODEL_TURN。早停且零 Evidence 为 INSUFFICIENT_EVIDENCE，不调用 Report Provider；少量证据只能进入已有 allowed-set report 路径，质量由 Eval 判断。

C5/C6 adapters 一起修改，避免课程演进重新引入旧协议。共享 chat adapter 仅对 Planner 关闭强制 JSON response_format；Brief/Report/Proposal 默认 JSON mode 保持，增加确定性测试。没有 retry、fake finish tool、扩大 token/step/tool/provider budget 或 deadline。C5 正文与架构说明做最小协议同步，Prompt/checkKeys 不变；C7/C9 正文及 Proposal provider 未修改。

## 2. Deterministic / Agent / Approval Tests

Final Reference **45/45**。新 Planner tests 覆盖 stop JSON（含旧 false）、prose、empty/null、untrusted text、empty tool array，均映射 ready 且只调用一次；one tool 保留，zero/multiple/unknown/malformed/extra args 经 registry 拒绝；length/filter/unknown 与 stop-with-tools 拒绝。早停零证据不执行搜索、输出 INSUFFICIENT_EVIDENCE，结果/Step 没有 Planner 原文。共享 adapter 测试确认 Planner 不请求 JSON mode，其他默认调用仍请求 JSON object。

C5/C6 HTTP smoke exit 0/0，覆盖 one/multiple/unknown/bad、steps/tools/budget、cancel/timeout、private-only external、exact query、MCP extra tools、external degradation。C7 HTTP + 5 DB transaction tests exit0：Edit/old token/reject/approve/replay/concurrency/rollback/tamper/expiry/Bob/strict input 全部回归。Proposal provider 本轮未变，仍额外复验 C7。

C8 **25/25、37 unchanged、全部八项 Hard Gates 为零**。Note Fidelity 4/4，threshold/gold 未改。真实 Proposal fidelity 未验证。

## 3. Real Planner Stability Probe — 4/5, BLOCKED

真实 qwen3.7-flash、当前真实 tools schema、合成任务与合成 Evidence（检索工具使用本地 fixture，不发送私有数据），5 runs，每 run <=4 model turns、<=3 tools、<=10 provider units、120s deadline。实际 **20 model calls、15 fixture tool calls**，没有 retry。

| Run | Policy | Outcome | Model / Tool / Units | Protocol |
|---|---|---|---|---|
| 1 | PRIVATE_ONLY | READY | 4 / 3 / 7 | PASS |
| 2 | PRIVATE_AND_EXTERNAL | READY | 4 / 3 / 7 | PASS |
| 3 | PRIVATE_ONLY | READY | 4 / 3 / 7 | PASS |
| 4 | PRIVATE_AND_EXTERNAL | FAILED / MODEL_FAILED | 4 / 3 / 7 | FAIL |
| 5 | PRIVATE_ONLY | READY | 4 / 3 / 7 | PASS |

Run4 第4轮：HTTP200，finish_reason=length，tool count0，content存在/2573字符，latency6736ms；安全类别 **UNSUPPORTED_FINISH_REASON**，adapter INVALID_MODEL_TURN → runtime MODEL_FAILED。未保存或输出该正文。其余四个 stop 的正文分别为2092/2672/1552/2383字符，均直接丢弃并映射 ready；工具验证无失败。

本轮正确解除了 stop-content shape 的协议依赖，但真实模型仍可能在本应停止的轮次输出直到 token 边界。不能把 length 当 stop，也不扩大 token cap 换绿。根据本轮明确的失败规则，**Probe 没有 PASS，不再试刷、不加 retry、不启动 Full Smoke**。是否采用显式 control tool 或其他协议决策留待后续负责人决定；本轮未实现。

## 4. Full Smoke / Proposal — NOT RUN

Full Staging gate 未通过；**0 invocation、0 staging HTTP、0 staging Runs/Actions/Notes**。这些是本轮 staging 计数，不是另外安全回归数据库的全局计数。没有拼接旧 Phase A 或本轮 mock 回归当真实全链 PASS。

本轮真实链未到 Proposal，未再次复现 overlength；历史2318字符记录仍保留。未运行 after-PASS 的5次 Proposal样本，真实schema稳定性没有新增结论。**Proposal Repair: None**，启用条件未满足，不提前改架构；title<=120/content<=2000、无真实slice、现有一次调用/30s边界保持。

C9 runner 补充在 Edit 后实际用旧 token 请求并断言403，再使用新 token Approve/Replay；安全结果计数输出 Runs/Actions/Notes。由于 Probe 失败，该新的真实后半程本轮未执行；C7 安全回归单列通过，不能替代它。

## 5. Dependency Risk Classification / Exposure

依据与政策详见 docs/dependency-risk-classification.md。新结论为 **ACCEPTED DEV TOOLCHAIN RISK**，仅限 GHSA-vfj7-8cjw-p6xm 的 Tailwind3/braces 受影响构建链；不是 full audit clean，也没有改变历史 Phase A BLOCKED 或删除旧报告。

实际 npm ls braces/tailwindcss 显示 Tailwind3 → chokidar3 / fast-glob → micromatch → braces3.0.3；registry最新braces仍3.0.3，官方advisory Patched versions=None。production tree 无 Tailwind/braces/fast-glob/micromatch 或受影响 chokidar3；独立 production 依赖安装同样成立。

**不隐瞒例外**：@prisma/client 的 optional peer Prisma CLI 带入无关 chokidar4.0.3，且 npm ci --omit=dev --omit=peer 也保留它。因此平台“五个包名全部缺席”的字面检查不成立；4.0.3不依赖braces、不在本漏洞链，不能将它误报成运行时High。本轮没有为了移除安全版本迁移Prisma。

静态检查280个 dist/server-dist 文本产物，无相关模块import。Tailwind固定 content 配置只处理 index.html/src，不读取上传、HTTP或课程Markdown作为brace pattern；服务端渲染/上传路径不导入Tailwind/braces。代码、完整依赖链和产物共同支持当前无用户可控runtime调用路径。

上一轮本地C9 standalone镜像经无网络依赖检查，五个包名全部缺席；镜像/lock属于旧PhaseA，此处只用作相同C9依赖/Dockerfile的暴露证据，**不冒充本轮功能镜像或平台运行时**。平台仓库没有Docker manifest，现有部署记录为systemd/Node。

仓库没有fork-PR CI workflow；当前受审为受信任main手动build。若将来执行不受信任PR，存在CI DoS及一般npm-script执行风险，必须无production secret、不自动production deploy、hard job timeout（最多10分钟）。该条件与生产依赖prune/检查加入本地风险政策和部署手册补充；没有创建CI或访问现网。旧手册full install不能证明现网dev工具缺席，线上实际安装/权限/timeout仍未核验。

接受条件改变、兼容补丁发布或runtime暴露时重新BLOCK。若负责人坚持full audit 0 High，则需单独 TAILWIND 4 MIGRATION REQUIRED，而非本轮混做major。现有react-router Moderate继续披露。

| Scope | Counts | Decision |
|---|---|---|
| Platform production | 2 Moderate / 0 High / 0 Critical | Runtime High/Critical gate PASS |
| Platform full | 4 Moderate / 5 High / 0 Critical | 五个High为上述accepted dev-toolchain chain；非zero |
| Final Reference production | 0 | PASS |
| Final Reference full | 0 | PASS |

## 6. Full Verification / Evidence Limits

fresh Bootstrap+C1...C9 → .runtime/phase-a2/c9。另fresh canonical assembly **153 files、0 mismatch**。独立新security/Eval数据库执行正式migrate deploy六条migration，不使用平台或生产库。

- Platform npm ci：首次被正在运行的Vite/esbuild锁住，EPERM；仅停止本仓库开发进程后重跑ci/generate成功，失败记录保留；未删除目录。
- Platform typecheck/test/check/build/check:bundle 全部exit0，84/84，Renderer V2九课/56prompts/61unique keys/Stage29/locked通过。
- Platform npm audit --omit=dev --json / npm audit --json：exit1/1，实际moderate/accepted High如上，不忽略结果。
- Reference npm ci/lint/typecheck/test/build 全部exit0；45/45。
- Reference eval:capstone / --compare-baseline eval/baseline.json / release:check 全部exit0；25/25、37 unchanged、8 hard gates全零。
- Reference audit production/full exit0/0，0vulnerabilities。
- C5 HTTP / C6 HTTP / C7 test:db exit0/0/0；独立approval DB tests5/5。
- 唯一一组真实Planner stability probe exit1，4/5；没有Full Smoke或Proposal真实样本。

安全证据：docs/capstone-phase-a2-evidence.json；原始本地诊断只在忽略的.runtime，只有status/finish/count/name/content-present-length/latency/category，不含full content/prompt/evidence/credential。

## 7. Global Release / Git

仍有Planner length协议失败、未完成完整Staging/真实Proposal稳定性，以及Cloud Verification/Publishing Integration。Cloud Runtime/DB/R2/HTTPS MCP/Production Smoke/Cloud backup-rollback继续 **NOT VERIFIED**。Loader/Progress/Entitlement仍MISSING/PARTIAL，Pricing不变，Production Product claim仍无依据。

没有执行云清单或Publishing Plan；两个文档未变。没有Tag。提交消息：Stabilize Capstone planner and staging release gate。最终SHA、origin/main一致性与working tree见实际提交后核对和最终回复。


# Phase A3 Addendum

2026-10-08；基线 b23a1605bc5fb86d3d6143376ed35fbe9cd451e8。**Phase A3 BLOCKED，整体 Capstone Release BLOCKED**。本轮仅加固 Planner 控制协议；不新增产品能力，不切模型、不重试、不放宽契约。原始 Audit、Phase A/A2 failures 与历史2318字符 Proposal 证据全部保留。

## 1. Structured Planner Decision / Provider Contract

C5/C6 都改用唯一 Provider Function：plan_research_step。请求明确 tool_choice={type:function,function:{name:plan_research_step}}，parallel_tool_calls=false，Planner jsonMode=false；Report/Brief/Proposal 默认 JSON mode 保持。该 Function 是 Provider→Application 的控制 envelope，不是 business Tool Registry 成员，不能访问 DB/API。

服务端使用 strict Zod discriminated union：search_knowledge(query)、ready；C6 在 PRIVATE_AND_EXTERNAL 且本 Run 无 external unavailable 时才允许 search_external_references(query)，否则移除。ready 不允许 query，未知 action/额外字段拒绝；外部 query 在任何 trim 前逐字比较 approvedExternalQuery，再通过既有外部输入校验。Provider schema 同步暴露按 policy 生成的 oneOf 动作集合。

唯一接收协议：finish_reason=tool_calls，恰好一个 type=function/name=plan_research_step，arguments 为有效 JSON 且通过 strict schema/policy。wrong/missing/zero/multiple function、坏 JSON、非法 shape/policy、unexpected finish 均 INVALID_MODEL_TURN，不解析 prose、不把 stop/length 当 ready。合法 ready 映射既有 ModelDecision.ready；合法 search 映射既有 business Tool Call，继续经 Tool Registry、Workspace ownership、exact external query 与所有预算。没有双协议、fallback、retry。

Planner Function 不增加 actual toolCalls；每次模型请求仍计一个 Provider unit。现有4 model steps/3实际工具/10 Provider units/120s/cancel 未改。Stage4没有新复制。Prompt 只表达决策规则、证据不可信、禁止重复query/写入/正文回答，以及 external exact query。

## 2. Deterministic Tests / Course Sync

先写测试并确认旧实现 red：5组中1通过、4失败，随后实现协议。最终7组协议测试覆盖：actual request body唯一Function/指定tool_choice/parallel=false/no JSON mode、private/ready/external映射、private-only与unavailable限制、modified external query、额外字段、未知动作、wrong/missing/multiple function、malformed JSON、stop/length/filter/unknown finish；业务 Registry 继续独立拒绝 unknown/extra/multiple/plan_research_step。零 Evidence ready 保持 INSUFFICIENT_EVIDENCE，不产生报告；search→ready 明确2 model/1 tool/3 units，控制Function没有重复收费。

C5-only fresh assembly 的 private-only schema测试通过；Final Reference **48/48**。C5/C6正文和C5 architecture doc只做最小协议同步，copyable prompts/checkKeys数量不变。学生仍须理解 Model proposes → Server validates → Registry → business search；Provider function不是模型直接执行系统能力。C7/C9正文和Proposal Provider没有修改。

## 3. Real Planner Probe — 0/10, BLOCKED

使用原 qwen3.7-flash + enable_thinking=false；合成任务/私有Evidence/外部abstract fixtures，真实Provider，真实schema和正常bounded Runtime。总共仅一组10 runs：5 PRIVATE_ONLY、5 PRIVATE_AND_EXTERNAL；检索fixture无需网络和私人资料，业务工具在adapter拒绝前均未执行。安全证据见 docs/capstone-phase-a3-evidence.json，不包含full prompt/content/args/evidence/credentials。

| Run | Policy | HTTP / Finish | Function calls | Output tokens | Content chars | Latency ms | Result |
|---|---|---|---:|---:|---:|---:|---|
| 1 | PRIVATE_ONLY | 200 / stop | 1 | 53 | 0 | 960 | INVALID_MODEL_TURN → MODEL_FAILED |
| 2 | PRIVATE_AND_EXTERNAL | 200 / stop | 1 | 42 | 0 | 670 | INVALID_MODEL_TURN → MODEL_FAILED |
| 3 | PRIVATE_ONLY | 200 / stop | 1 | 53 | 0 | 808 | INVALID_MODEL_TURN → MODEL_FAILED |
| 4 | PRIVATE_AND_EXTERNAL | 200 / stop | 1 | 42 | 0 | 644 | INVALID_MODEL_TURN → MODEL_FAILED |
| 5 | PRIVATE_ONLY | 200 / stop | 1 | 51 | 0 | 918 | INVALID_MODEL_TURN → MODEL_FAILED |
| 6 | PRIVATE_AND_EXTERNAL | 200 / stop | 1 | 42 | 0 | 607 | INVALID_MODEL_TURN → MODEL_FAILED |
| 7 | PRIVATE_ONLY | 200 / stop | 1 | 53 | 0 | 823 | INVALID_MODEL_TURN → MODEL_FAILED |
| 8 | PRIVATE_AND_EXTERNAL | 200 / stop | 1 | 42 | 0 | 624 | INVALID_MODEL_TURN → MODEL_FAILED |
| 9 | PRIVATE_ONLY | 200 / stop | 1 | 51 | 0 | 765 | INVALID_MODEL_TURN → MODEL_FAILED |
| 10 | PRIVATE_AND_EXTERNAL | 200 / stop | 1 | 378 | 1532 | 4770 | INVALID_MODEL_TURN → MODEL_FAILED |

实际 **0/10 protocol-valid、INVALID_MODEL_TURN=10**。10个指定 Function 都确实出现，但其 finish_reason 全为 stop，违反本轮预先固定的 tool_calls-only Contract；不是missing function，也不是A2的length。9次content为空，第10次还有1532字符无用正文。没有将 stop-with-function 临时认作有效、改用旧parser、重试、换模型或启动Smoke。

合计10 model calls、0 actual tools、10 Provider units、10 planner function calls。动作提议为5次private/5次external，均未执行，不代表完成研究或来源选择质量。每次在第1模型回合失败，因此没有真实ready或多轮成功证据。输出42～378 tokens，延迟607～4770ms（中位数786.5ms）；保留maxTokens=500：378-token样本及缺失成功多轮证据不足以证明128/256足够，也没有提高上限。

**Compatibility conclusion**：当前Provider对 forced specific Function 的 finish metadata不满足本次声明的接收协议。下一步需要单独 Provider Compatibility Decision（含是否明确支持 stop+严格函数 envelope，或 Responses API/模型选择），本轮没有擅自改变已测Gate。

## 4. Full Smoke / Proposal

Full Local Staging Smoke **NOT RUN / Gate FAIL**：Probe未达到10/10，按用户规则不授权Smoke。本轮0 full-staging invocation；没有拼接mock安全回归或旧轮次证明全链。未创建本轮real-app/image/storage链路或fresh staging DB，实际新建的仅独立Eval与security测试DB。

Proposal path未到达；**Proposal Repair: None**，没有触发本轮真实overlength-only条件。真实Proposal stability **0/5 executed（NOT RUN）**，不能当作5次失败或准确率。title<=120/content<=2000不变，禁止截断/放宽；历史2318证据仍留在原Audit。C8 deterministic Note Fidelity 4/4不代表本轮真实Proposal fidelity。

## 5. Boundary / Approval / Eval Regression

C5 HTTP smoke、C6 HTTP smoke、C7 test:db 均exit0，C7数据库事务tests **5/5**：Edit/old-token403/new approval/replay/concurrency/rollback/expiry/tamper/Bob/strict input保持。Agent unknown tool/bad args/multiple tools、source policy、steps/tools/budget、cancel/timeout、MCP extra tools、external degradation原测试保留并通过。mock回归不能替代真实Full Smoke。

C8 **25/25 PASS、37 unchanged、8 Hard Gates全零**；thresholds/gold/baseline没有修改。无跨Workspace泄漏、未经审批写入、token篡改接受、重复Note、非法Citation、无依据确定性claim、unsupported answer或partial-ready。

## 6. Fresh Assembly / Full Verification

Bootstrap+C1…C9组装全新 .runtime/phase-a3/c9；第二次独立canonical组装逐字核对 **155文件、0 mismatch**。没有复用A2运行目录。红灯测试仅借用已有依赖junction，独立C9正式安装为 fresh npm ci。

- Final Reference npm ci/lint/typecheck/test/build/eval:capstone/--compare-baseline/release:check 均最终exit0；48/48。首次typecheck因Probe进程加载Prisma Windows DLL造成EPERM rename，非TypeScript诊断；原日志保留，进程结束后串行typecheck与最终release:check均通过。
- 六条正式migration在新isolated capstone_c8_eval与capstone_c9_test数据库从空migrate deploy成功。未用db push、平台DB或production DB。根平台既有测试使用其专用测试schema，未用于Capstone迁移。
- Reference production/full audit均0 vulnerabilities、exit0。
- Platform npm ci/typecheck/test/check/build/check:bundle均exit0；84/84。Renderer九课、56 prompts、61 unique checkKeys；Stage29、Capstone locked不变。
- Platform production audit exit1：2 Moderate / 0 High / 0 Critical；full audit exit1：4 Moderate / 5 High / 0 Critical。没有误报full audit clean。
- 暂停的本仓库开发服务已恢复，Vite5173/API3001 health各HTTP200。

## 7. Dependency Risk / Exposure

保留Phase A2 **ACCEPTED DEV TOOLCHAIN RISK** 与接受条件；未修改依赖、Tailwind或风险分类。重新检查production dependency tree：受影响Tailwind/braces/fast-glob/micromatch/chokidar3链缺席；Prisma optional peer带入无关chokidar4.0.3，不能声称五个包名全部缺席。新280个compiled文本产物相关模块import为零。既有trusted固定源码构建路径与未来不受信任CI无secrets/no auto deploy/hard timeout/上线前runtime prune核查条件不变。Cloud实际安装状态仍未验证。

## 8. Global Release / Git

Cloud Runtime、Cloud DB、Cloud Storage、HTTPS MCP、Production Smoke、Cloud Backup/Rollback均 **NOT VERIFIED**。Publishing Loader/0-9 Progress/Project Lab server entitlement仍未实现，本轮不执行。Pricing、正式Stage统计和Capstone暂未解锁保持；没有Release Tag。Production Product claim无依据，整体Release继续BLOCKED。

剩余：当前Provider协议兼容性、未完成Full Staging与真实Proposal稳定性、Cloud Verification、Publishing Integration。提交消息：Harden Capstone planner decision protocol；提交后的SHA/origin-main/working-tree以最终实测报告为准。


# Phase A4 Addendum

2026-10-08；基线2bdc9fb58ecf8e99b02f3b3c53c017c548a25733。**Phase A4 BLOCKED — PROVIDER COMPATIBILITY BLOCKER；整体Final Release BLOCKED；本地Release Blocker未关闭。** 不是新课程，不新增产品功能，不切模型/API、不加retry、不提高500 token cap。保留原Audit、A/A2/A3及历史2318字符Proposal证据。

## 1. A3 Finding / Provider Compatibility Normalization

A3十次都返回了正确命名的plan_research_step；A3拒绝来自预先规定finish必须tool_calls，而实际为stop。A4将结构化tool_calls作为决策载体，finish只用于安全判断。变更仅在C5/C6 Planner protocol/adapters；shared research-chat.ts/firstMessage、Brief/Report/Proposal Provider、业务Registry与Runtime均未修改。

| finish_reason | tool_calls | A4 |
|---|---|---|
| tool_calls | exactly 1 valid planner call | ACCEPT |
| stop | exactly 1 valid planner call | ACCEPT — provider compatibility |
| stop / tool_calls | 0 or >1 | REJECT |
| length / content_filter / unknown | any | REJECT |

Function必须type=function/name=plan_research_step；arguments仍经过JSON.parse、strict discriminated union、source policy、exact approvedExternalQuery，然后映射既有ModelDecision并继续通过business Tool Registry。ready无query/额外字段；private-only与external-unavailable禁止external。顶层search_knowledge/search_external_references/ready/delete_database都不是合法Provider Function。

content始终丢弃，不解析、不展示、不保存进产品、不影响action/Evidence/Report；没有prose fallback或隐式ready。共享finish metadata不改写。只在strict验证成功后安全记录plannerProviderFinishReason/plannerFunctionPresent/plannerCompatibilityPath（STANDARD_TOOL_CALL或STOP_WITH_VALID_FORCED_FUNCTION），无args原文；正常兼容路径不是warning/error。

## 2. Deterministic / Course Sync

测试先red：9组中7通过、2失败；修复后Planner **9/9**，C5-only fresh assembly **2/2**，Final Reference **50/50**。矩阵涵盖standard/stop合法ready/private/external、stop零/多工具/错Function/malformed args、length+合法Function仍拒绝、过滤/未知finish、恶意content不会进入结果与诊断、来源禁用与external逐字约束。兼容事件只在完整验证后产生。

C5/C6正文与C5 architecture doc最小同步compatibility解释；Prompt/checkKeys数量不变。C7/C9正文、Proposal Provider没有修改，因为本轮没有到达overlength repair触发条件。模型只是提议动作，服务器与Registry仍掌握执行权；4 model steps/3实际tools/10 units/120s/cancel均保持。

## 3. Real Planner Probe — 9/10

唯一一组10次真实qwen3.7-flash、enable_thinking=false、maxTokens500；5 PRIVATE_ONLY + 5 PRIVATE_AND_EXTERNAL。使用合成任务和Evidence fixtures、真实Planner Provider与正常bounded Runtime，无私人资料、无重试或追加成功样本。

| Run | Policy | Outcome | Model / Actual tool / Units | Protocol |
|---|---|---|---|---|
| 1 | PRIVATE_ONLY | READY | 2 / 1 / 3 | PASS |
| 2 | PRIVATE_AND_EXTERNAL | FAILED | 1 / 0 / 1 | FAIL |
| 3 | PRIVATE_ONLY | READY | 2 / 1 / 3 | PASS |
| 4 | PRIVATE_AND_EXTERNAL | READY | 3 / 2 / 5 | PASS |
| 5 | PRIVATE_ONLY | READY | 2 / 1 / 3 | PASS |
| 6 | PRIVATE_AND_EXTERNAL | READY | 3 / 2 / 5 | PASS |
| 7 | PRIVATE_ONLY | READY | 2 / 1 / 3 | PASS |
| 8 | PRIVATE_AND_EXTERNAL | READY | 3 / 2 / 5 | PASS |
| 9 | PRIVATE_ONLY | READY | 2 / 1 / 3 | PASS |
| 10 | PRIVATE_AND_EXTERNAL | READY | 3 / 2 / 5 | PASS |

**实际9/10 protocol-valid，INVALID_MODEL_TURN=1**。PRIVATE_ONLY 5/5、PRIVATE_AND_EXTERNAL 4/5。成功Run都到READY；这不是完整产品/Report/Proposal PASS。兼容统计：STANDARD_TOOL_CALL=0，STOP_WITH_VALID_FORCED_FUNCTION=22，invalid=1。

失败Run2/turn0：HTTP200，finish_reason=length，tool_calls=0，outputTokens500，content存在/2147字符，latency7059ms；UNSUPPORTED_FINISH_REASON → INVALID_MODEL_TURN → MODEL_FAILED。即使后续九个Run成功，不能把它刷掉或视为ready。此失败已不是stop+合法Function的兼容问题，是真实forced-function缺失/截断。

总23 model calls、13 fixture business tool executions、36 Provider units；1529 output tokens，单次28～500 tokens。2次有正文，共2839字符均丢弃（其中被接受响应1次/692字符，失败响应1次/2147字符）。22次compatibility normalization。正文浪费不独立构成安全Gate；本次Gate失败来自length/零Function。未改token上限、模型、tools schema或Prompt来再次试刷。

中途曾误将第10个Run成功报告为整组10/10；按最终汇总及时更正为9/10，**任何真实Smoke启动前已纠正**。证据与判定以完整唯一Probe为准。

## 4. Full Smoke / Proposal — NOT RUN

Full Staging Smoke **NOT RUN / Gate FAIL**，0 staging-smoke invocation。准备阶段已构建fresh runtime image、创建并migrate fresh capstone_phase_a4_staging，但未启动staging应用容器、未上传/登录/调用真实研究链。该DB聚合实测User/Run/Action/Note均0。准备产物不是功能验证，没有拼接另外mock regression当完整Smoke。

Proposal Path未到达；真实overlength本轮未复现；**Proposal Repair: None**。真实Proposal stability **0/5 executed / NOT RUN**；initial overlength/final valid/provider-failure样本数不可观测，不能记成5次失败或accuracy。title<=120/content<=2000和一次既有调用保持；历史2318证据仍在。C8 deterministic Note Fidelity 4/4不能替代真实Proposal稳定性。

## 5. Provider Compatibility Decision

按本轮失败分支建立独立 docs/capstone-provider-compatibility-decision.md，比较现qwen3.7-flash/Chat Completions、另一款文档支持Function Calling的Qwen（如qwen3.8-max）以及Model Studio Responses API。使用官方资料，实际账户/区域/价格/性能/候选可靠性未验证，不能把文档支持当通过Gate。

决策：不qualify当前受测配置；下一步单独优先资格验证另一款已文档化Qwen、保持API不变以隔离变量（工程推断）；Responses为备选，需要独立输出parser/工具选择/完成状态及store=false审计。没有执行任何候选付费调用/切换，不再开A5反复调同一协议。具体依据、限制与下一次bounded qualification Gate见独立决策文档。

## 6. Agent / Approval / C8

C5 HTTP、C6 HTTP、C7 test:db均exit0；审批数据库 **5/5**。one/unknown/extra/multiple business tools、source policy/exact external query、max steps/tools/budget/timeout/cancel、external unavailable/MCP extra tools/degradation全部保留并通过。C7 Edit/old token403/new token/Approve/Replay/concurrency/rollback/expiry/tamper/Bob/strict input回归通过，mock HTTP与DB tests不冒充本轮真实全链。

C8 **25/25、37 unchanged、8 Hard Gates全零**；threshold/gold/baseline未改，Note Fidelity4/4。没有已观察到的跨Workspace泄漏、未经审批写入、重复Note、非法Citation、无依据确定性claim、unsupported answer、partial-ready或token篡改接受。

## 7. Fresh Assembly / Verification / Dependency

fresh Bootstrap+C1…C9 → .runtime/phase-a4/c9；独立canonical再次组装 **155文件、0 mismatch**。正式fresh npm ci；red/C5-only测试仅借用依赖junction，不作为正式安装证据。独立新Eval、security、unused staging DB均正式migrate deploy六条migration，未用db push、平台或生产DB做Capstone迁移。

- Reference ci/lint/typecheck/test/build/Eval/baseline comparison/release:check全部exit0；50/50。production/full audits exit0/0、0 vulnerabilities。
- Platform ci/typecheck/test/check/build/check:bundle最终全部exit0；84/84。首次platform check继承migration shell的Capstone DATABASE_URL，因无Stage表P2021失败；清除进程环境覆盖后用平台现有配置补验，原错误日志保留，未reset平台数据。平台自身测试继续使用专用测试schema。
- Platform Renderer九课/56prompts/61unique checkKeys、Stage29、Capstone锁定通过；339 public files未发现受保护内容标记。
- Platform production audit exit1：2 Moderate / 0 High / 0 Critical；full exit1：4 Moderate / 5 High / 0 Critical，不能写full clean。
- Tailwind/braces **ACCEPTED DEV TOOLCHAIN RISK**分类和接受条件不变；依赖/lock未修改。production tree受影响链缺席，保留无关Prisma optional-peer chokidar4.0.3例外；280编译文本产物相关模块import为零。现网依赖暴露未验证。
- 原本暂停的本仓库Vite/API开发服务已恢复，各HTTP200；独立测试DB容器保留数据，完成后停止，不删除文件/目录。

## 8. Global Release / Evidence / Git

Cloud Runtime/DB/R2/HTTPS MCP/Production Smoke/Backup-Rollback均 **NOT VERIFIED**。Publishing Loader=MISSING、Progress0/9=MISSING、Capstone server entitlement=PARTIAL。本轮未修改这些集成、Pricing、entitlement、正式Stage统计或解锁，不创建Release Tag。

安全证据 docs/capstone-phase-a4-evidence.json；保留旧Audit+A/A2/A3。剩余本地Provider qualification、Full Smoke、真实Proposal稳定性，以及Cloud Verification/Publishing Integration；Production Product claim无依据，整体Release仍BLOCKED。提交消息 Normalize Capstone planner provider compatibility；最终SHA/origin-main/working-tree见提交后实测。


# Launch Sprint · Close Local Release Blockers

2026-10-08；基线c94041dc58bda2ca7c0edf521d88494bb7171e6d。**Launch Sprint BLOCKED：Planner qualification已关闭，Full Local Staging blocker仍未关闭。** 不创建A5/A6；本轮采用用户新授权Gate：选定模型5/5 + 一次完整Full Smoke + C8 25/25/8 Hard Gates零 + production High/Critical零。不要求永久100% Provider成功，不运行五次Proposal样本。原Audit、A/A2/A3/A4、qwen3.7-flash 9/10与历史2318字符证据保留。

## Planner selection

Shared chat primitive支持可选model；缺省仍AI_CHAT_MODEL。C5/C6 Planner显式使用AI_PLANNER_MODEL ?? AI_CHAT_MODEL；examples设AI_PLANNER_MODEL=qwen3.8-flash，production checker仅验证可选model名称合法，不硬编码模型。Brief/Report/Note仍为既有qwen3.7-flash。对两款候选与现模型保持同一enable_thinking=false设置。没有复制HTTP adapter或加入动态Router。

qwen3.8-flash **5/5 PASS**：3 PRIVATE_ONLY、2 PRIVATE_AND_EXTERNAL，全部READY、INVALID_MODEL_TURN0；12 model calls、7 fixture工具执行、19 Provider units，12次stop+合法Function兼容映射。按规则立即SELECT，qwen3.7-plus未测试；没有额外10/20次Probe，没有修改Prompt/Decision schema/业务Registry/sourcePolicy/external exact query/steps/tools/token预算/Evidence/Citation/Report。

## Full Local Staging Smoke — FAIL

共两次独立fresh DB/user/app、真实Provider与Crossref的连续invocation，均不是拼接：

| Attempt | Proposal behavior | Exit / side effects |
|---|---|---|
| 1 · before repair | valid title64/content2425，OVERLENGTH_ONLY | exit1；18HTTP/38439ms；2Runs、0Action、0Note |
| 2 · after one bounded repair | initial2869 → 唯一压缩仍2869 → strict reject | exit1；18HTTP/40851ms；2Runs、0Action、0Note |

两次都已通过health/register/login、TXT/PDF→READY、private retrieval、private Run/report/citation、mixed Run/MCP/真实Crossref/mixed report/citations，并实际到达Proposal。没有完成Edit/旧Token拒绝/Approve/Replay/oneNote/最终source-access链，不能写Full Smoke PASS。

最终独立DB实测：User1、READY documents2、COMPLETED Runs2、private citations3、external citations2、Action0、Note0。原成功报告与Run保持，没有半写或伪报告。Planner=qwen3.8-flash、Report/Note=qwen3.7-flash，与实际容器配置一致。

## One bounded compression repair

第一次真实2425触发条件后才实现。仅首次响应完整JSON、title合法、无额外字段、content字符串且唯一失败为超过2000时调用一次；输入仅原Proposal，不重新研究、不传Report/sources、不调工具。初次生成与压缩共享30秒deadline，总最多2请求。最终仍strict title<=120/content<=2000；无truncate/slice、无放宽、无第二次压缩或自动Provider重试。

deterministic repair **7/7**，涵盖eligibility、共享signal、最多一次、无Report重传、数字/实体/否定/uncertainty/limitation保留、malformed/extra/title/type/finish/超大输入拒绝、再次超长失败与取消。实际第二次Smoke压缩未成功缩短，严格校验正确拒绝并映射PROPOSAL_PROVIDER_FAILED/HTTP502；不以确定性测试替代真实成功。没有追加Smoke或五次Proposal样本刷通过。Provider偶发安全失败是允许的产品行为，但当前仍缺本轮要求的一次完整真实链PASS。

## Verification / course sync

- 最终Reference53/53；ci/lint/typecheck/test/build/Eval/baseline comparison/release:check全部exit0；production/full audit0。
- C8 **25/25、37 unchanged、8 Hard Gates全零**；Note Fidelity4/4。threshold/gold/baseline未改。
- C5/C6 HTTP与C7原安全回归通过；repair后C7全量HTTP+数据库5/5再次通过。
- 最终fresh canonical assembly155files、0 mismatch；独立Eval/security/两次staging库均正式migrate deploy六条migration，不用db push、不用平台或生产DB。
- Platform ci/typecheck/84tests/check/build/check:bundle通过；修复后Renderer再次通过：56 prompts/61 checkKeys/Stage29/Capstone locked。
- Production audit：0 High/0 Critical/2 Moderate（exit1）；full5 High/4 Moderate（exit1），维持ACCEPTED DEV TOOLCHAIN RISK，不宣称full clean。不改依赖或Tailwind；受影响运行链缺席，Prisma无关chokidar4例外保留，280编译产物相关import为零。
- C5最小同步独立Planner model；repair触发后C7/C9最小同步一次压缩边界。学生正文不包含内部发布调试历史。

## Remaining / evidence / Git

本地Planner blocker CLOSED；**Full Smoke与真实Proposal contract blocker REMAINING**。Cloud Verification目标资料已请求，但没有完整local PASS，云执行未开始；Cloud runtime/DB/storage/HTTPS MCP/production smoke/backup-rollback全部NOT VERIFIED。Publishing Integration不执行，Production Product claim仍无依据；正式29节、暂未解锁、Pricing/entitlement不变。没有Release Tag。

证据：docs/capstone-launch-sprint-evidence.json。提交消息 Qualify Capstone planner for launch；最终SHA/origin-main/working-tree见提交后核对。没有创建新的本地Phase或扩大benchmark范围。


## Final Local Release Fix — LOCAL RELEASE BLOCKERS CLOSED

Baseline: 710497f149486127604f98ecb72563644586fe63. This entry supersedes the remaining local Note/Full Smoke blockers from Launch Sprint; all historical failures remain preserved.

- Planner qwen3.8-flash qualification inherited: 5/5 PASS, no extra paid qualification runs.
- Proposal strategy: MODEL → one bounded compression → GROUNDED_FALLBACK, only when both responses are otherwise valid and overlength. No third Provider call, truncation, new facts or relaxed limit.
- Fallback reads only validated persisted Report Claims; uses initial valid title, complete Claims, deduplication, 1850-character composition budget and final strict knowledgeNoteArgs.parse. Schema has no separate limitations field; Claim wording is preserved verbatim.
- Human approval, token/version/exact args hash/transaction/replay/rollback unchanged. No DB migration or proposalMode column; safe server logs record the mode.
- Local Staging Full Smoke = PASS. Exactly one fresh DB/user/TXT/PDF/container continuous invocation, exit 0, 30 HTTP calls. Private and mixed research, real MCP/Crossref, grounded reports/citations, Proposal, Edit, stale token rejection, approval, replay, exactly one Note, signed source success and anonymous denial all passed.
- Actual Proposal Mode = GROUNDED_FALLBACK. Initial 2830 chars, compression 2830 chars, fallback 1708 chars. Persisted Note contains 8 whole original Report Claims; sourceRunId matches. One EXECUTED Action, version 2, one Note.
- C8 25/25 PASS; baseline comparison has no regression; Note Fidelity 5/5 including fallback; all eight hard gates zero. Gold/baseline/thresholds unchanged.
- Reference npm ci/lint/typecheck/55 tests/build/Eval/baseline/release:check/audits PASS; fresh canonical assembly matches all 155 files. Initial parallel Prisma DLL lock was resolved by serial release:check rerun.
- C5/C6 HTTP regression and C7 database approval regression (5 tests) PASS.
- Platform npm ci/typecheck/84 tests/check/build/check:bundle PASS. Initial course check was corrected by adding fallback assertions inside the existing fidelity case.
- Platform production audit: 0 High/Critical, 2 Moderate. Reference full/production audits: 0 vulnerabilities. Existing ACCEPTED DEV TOOLCHAIN RISK remains; no Tailwind migration.
- Local HTTPS/browser CORS are not cloud evidence. No cloud resources, publishing, entitlement, unlocking, pricing or Tag changes. Stage remains 29; Capstone stays locked.

Remaining global blockers: Cloud Verification; Publishing Integration; Production Product claim pending cloud evidence. Next step: CLOUD VERIFICATION.

Machine-readable evidence: docs/capstone-local-release-fix-evidence.json.


## Cloud Verification Addendum — INCOMPLETE

Reviewed source: dad1c6833f8818e403f0fca6cf54bb6d79cb3da0. Local Release Blockers remain CLOSED; overall release remains BLOCKED. Product core, course publishing, entitlement, pricing and locked status unchanged.

### Completed deployment preparation

- Fresh C9 assembled from the reviewed source, not reused from a prior runtime. npm ci and Docker runtime build PASS.
- Option A: private deployment repository https://github.com/LazyQ0130/ai-research-workspace-deploy; visibility verified PRIVATE. Deployment commit 1a47a62d04867c9c41403093b2cf43a2e0f6d2e1 maps to the reviewed source; 155 source files. It is not a Student Starter or public download.
- Local image manifest digest: sha256:f80ba0596f90493b69991ad52cfc0025745ca8972256e64ef380e858220be9c9. This is a local build artifact, not a Render-deployed or registry-published image. Render build/deploy digest remains unknown.
- Image revision label matches source; runtime UID 1000. History/config inspected without exposing values; 2218 /app files scanned, zero .env/credential files and zero known local credential content matches. No build credential supplied.

### Manual boundary and unverified gates

Render and Cloudflare browser consoles both require login. Per the request's section 3 manual boundaries, account authorization and billing are pending; no paid cloud resource, new secret, public endpoint or cloud Provider call was created. Actual account/workspace, region, plans and budget remain undecided. The next user action is only to sign in to both consoles; a concrete resource/cost proposal will follow account access. Passwords/API secrets must not be sent in chat or recorded here.

Production env checker, cloud migrations/pgvector/vector(1024), R2 private access/browser CORS, public HTTPS/health, HTTPS MCP, Provider integration, Full Cloud Smoke, Production Safe Smoke, cloud crash recovery, backup/PITR/restore, application rollback and cloud log hygiene are all NOT VERIFIED. No local pass was relabeled as cloud evidence. Production Product claim = NOT SUPPORTED.

Official procedures rechecked: [Render PITR](https://render.com/docs/postgresql-backups), [Render rollback](https://render.com/docs/rollbacks), [private image deployment](https://render.com/docs/deploying-an-image), [R2 CORS](https://developers.cloudflare.com/r2/buckets/cors/). Paid Render Postgres recovery creates a new DB; application rollback is a separate capability. Account-visible plans/window/cost must be verified before paid creation.

Remaining Release blockers: Cloud Verification; Publishing Integration; Production Product claim pending cloud evidence. Safe machine-readable record: docs/capstone-cloud-verification-evidence.json.


## Publishing Integration product decision (2026-10-08)

Cloud Verification:
WAIVED AS RELEASE BLOCKER BY PRODUCT DECISION

Reason:
Commercial cloud deployment is no longer part of the author-reference release gate.

Public claim changed at publishing: Production Product → Deployable AI Product.
Historical NOT VERIFIED cloud evidence remains unchanged. The author Reference has local production-like delivery evidence; cloud deployment is a student exercise for their chosen platform.

Publishing Integration: access, independent progress, protected content and Starter implemented. Integration commit retains the locked showcase status pending final publishing gates.


## Final Publishing Audit — 2026-10-08

Current release verdict: **PASS**. Capstone Project Lab is **已开放** in the publishing commit.

| Gate | Result |
|---|---|
| Lessons | 9 independent Project Labs |
| Stage formal lessons | 29 (unchanged) |
| Stable checklist keys | 61 |
| Server access | PASS — ACTIVE + explicit project-lab, including administrators |
| Independent progress | PASS — 0/9 → 9/9, undo and Continue verified |
| Starter protection | PASS — fixed resource; 17-file allowlist |
| Bundle leak | PASS — protected bodies/internal artifacts excluded; injection exits 1 |
| Tests | PASS — 88/88, including real PostgreSQL and HTTP |
| Typecheck / content checks / build | PASS |
| Browser | PASS — rendered C1, save/reload, 9/9 overview, Starter download |

Cloud Verification: **WAIVED AS RELEASE BLOCKER BY PRODUCT DECISION**. Historical NOT VERIFIED evidence above and in cloud records remains valid. It does not become PASS. Public delivery claim is **Deployable AI Product**, approximately 18–23 hours with Stage 1–4 or equivalent prerequisites. C9 describes author local production-like verification and student-selected cloud deployment.

Integration commit: 0830120f0471b5e8e4e593999f9608776bfedb9a (locked). Final publishing commit changes public presentation and this release metadata only. No price, payment, bulk entitlement, Stage count, release tag or cloud resource changes.

Detailed matrix, changed-file list and local log hashes: [Publishing evidence](./capstone-publishing-evidence.json).
