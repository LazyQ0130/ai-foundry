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
