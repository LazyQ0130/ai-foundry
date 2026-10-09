---
estimatedTime: "150～180 分钟"
difficulty: "高级综合实践"
objective: "用人工审查的固定数据集、四层 Product Eval、独立 Hard Gates、故障注入和 baseline comparison，证明研究工作台的哪些行为可靠、哪些质量仍待验证。"
checklist:
  - "已区分 Test 与 Eval，并定义四层产品验收"
  - "已人工审查固定 Gold Dataset、正确 Evidence 与应答/拒答行为"
  - "已建立 Retrieval、Citation Support、Abstention 与 Note Fidelity 指标"
  - "已建立跨 Workspace、未批准写入、重复笔记及无效引用 Hard Gates"
  - "已把 C3～C7 失败行为整理成可重复 Reliability Matrix"
  - "已用故障注入验证 FAIL / INCOMPLETE，并建立 reviewed baseline"
  - "已分别运行 deterministic 和受控 real eval，检查报告、依赖与 Git 并保存 C8"
checkKeys:
  - "check-c8e8000000000001"
  - "check-c8e8000000000002"
  - "check-c8e8000000000003"
  - "check-c8e8000000000004"
  - "check-c8e8000000000005"
  - "check-c8e8000000000006"
  - "check-c8e8000000000007"
---

# Capstone C8 · 证明整个 AI 产品真的可靠

Product Eval & Regression

## 现在凭什么相信这个产品

继续自己的 C7 项目。内部作者从干净 C7 Reference 组装验证；不要覆盖自己的 Product Brief。现在先停止加功能，选一份已经生成的研究报告，回看每条 Citation。

它引用的段落真的支持那句话吗？没有资料时系统会拒答吗？Bob 能看到 Alice 的 Evidence 或外部查询历史吗？Crossref 挂掉会不会被当成研究完成的证据？连点八次批准会产生几条笔记？把自己的答案和证据位置写下来。

:::task{title="先提出可证伪的可靠性承诺"}
写出三条产品承诺，每条同时写“怎样证明成立”和“什么观察会推翻它”。例如：一个 Action 最多产生一个 Note；反例是同一个 sourceActionKey 对应两条笔记。不要只写页面可打开或 HTTP 200。
:::

:::concept{title="Test 与 Eval 回答不同的问题"}
Test 验证代码逻辑按预期运行；Product Eval 检查检索、证据、生成、授权和失败处理组合后的产品行为是否达到事先定义的标准。已有 Unit/HTTP/DB Tests 继续保留，Eval 在它们之上组织固定产品矩阵。代码能运行，结论仍可能不受证据支持。
:::

## 定义四层与观察契约

| 层 | 要证明的事 | 观察 |
|---|---|---|
| Functional | 主要链路产生正确产品结果 | 持久化报告、引用、一个精确 Note |
| Quality | 找得对、引得对、该答才答 | Hit@3、support gold、abstention、fidelity |
| Safety | 绝不能发生的副作用为零 | 跨域泄漏、未批准写入、重复 Note |
| Reliability | 依赖失败和限额下保持事实一致 | FAILED、不出现 partial READY、可安全重试 |

学生先选择哪些承诺属于 Hard Gate。比如一个跨 Workspace 泄漏不能被其他 24 项 PASS 平均掉。Latency 则先作为描述值，小样本 p95 不代表生产 SLA。

:::prompt{title="Prompt 1：Eval Contract"}

~~~text
先读我的C7产品和已有测试，不增加产品功能。根据我写的可靠性承诺建立Product Eval契约：functional/quality/safety/reliability；固定case id、mode、subcases；safe assertion、observed metrics、PASS/FAIL/INCOMPLETE；JSON与Markdown report。
Hard Gates与case pass rate独立；DB断开、fixture缺失、执行抛错不能按零泄漏算PASS。partial运行不得宣称全量通过。默认mock/deterministic，不依赖AI Key、不调用付费模型。
只输出设计和文件计划，等我检查后再逐步实现，不操作Git。
~~~

:::

## 建立可以人工核对的 Gold

Reference 用六份非敏感合成资料：persistent memory、短期上下文、人工批准、3 次重试、Model A 实验未改善、PostgreSQL 原子事务。固定十个 Retrieval query，覆盖原文、同义表达、中文和相近文档；另有两个完全无关问题。

例如 persistent memory 可跨运行并在进程重启后保留；context window 不可跨进程保留。不能引用后者得出前者的结论。Model A 被测试、Model B 未测试；“没有改善”不能变成“改善”；3 不能变成 30。

:::task{title="人工审查 Gold，而不是让 AI 自评自洽"}
逐条打开 eval/fixtures/gold.mjs。标出 relevantCitationKeys、允许的 paraphrase、forbidden claim；说明每条答案被哪个句子支持。换成自己产品的资料时也必须做这一步。AI 可以提出初稿，不能独自出题、定真相、评分后宣布可靠。
:::

:::prompt{title="Prompt 2：Fixed Gold Dataset"}

~~~text
根据我已人工批准的事实建立小型synthetic fixtures与固定cases，不抓真实私人文件。包含persistent/context distractor、negation、3对30、Model A对Model B、无资料、metadata-only external、Note新事实。
Retrieval每例包含id/query/relevantCitationKeys，可选forbidden；答案与引用逐条可追溯。建立CAPSTONE_EVAL_DATASET_VERSION，修改fixture必须升版本并重新review。
保存Gold与审核说明，不把运行结果、向量或Provider响应提交。不要修改产品算法以迎合数据，不操作Git。
~~~

:::

## 质量指标不是一个总分

Hit@3 表示 Top 3 中至少出现一条 relevant Evidence。MRR 进一步区分正确证据排第一还是第三。不相关问题不计“检索应该什么都不返回”：向量 Top-K 本来可能返回低相关结果，必须另测最终 abstention。

Mock embedding 是词项 hash，只能验证 pipeline 与词项回归；Real embedding 才提供语义检索信号。两个分数分别报告，不能用 mock 中文命中来宣称真实语义质量。

:::concept{title="Citation Validity 不等于 Citation Support"}
Evidence 说 PostgreSQL 支持事务，Claim 却说它是全球最快数据库：key 可以完全合法，结论仍不受支持。先验证 key 属于当前 Evidence，再评估 claim 与所引用 excerpt 的关系。固定 Gold 可以精确检查已批准表达及否定/数字/实体；这个闭集 evaluator 不能充当通用语义判官。
:::

Abstention 同时测 answerable_success_rate 与 unsupported_abstention_rate。只有拒答率高不够，有明确证据却拒答同样是质量问题。Mock 的 empty-retrieval stub 要标明边界；真实评估必须包含“检索有不相关资料”的问题。

KnowledgeNote fidelity 只评估 AI Proposal：保留报告关键结论，不改变否定、数字、实体，不增加事实。C7 人工编辑后的内容是 human-confirmed content，不进入自动忠实度硬门槛。

:::prompt{title="Prompt 3：Functional / Safety Product Matrix"}

~~~text
围绕C1～C7工作台建立固定产品矩阵，参考已有测试但不删除它们。Functional覆盖private research、mixed evidence、insufficient、proposal→approve、human edit。
Safety覆盖Knowledge list/retrieval/Task/Run及其Step/Citation/external query history/Action/Note/signed source URL，真实HTTP Alice/Bob/anonymous；Proposal/Reject/expired/Bob/tampered后Note delta0；顺序/响应丢失重试/并发批准最多一条Note。
默认所有Provider mock，真实PostgreSQL与HTTP用于事实验证，外部响应使用明确stub。数据库强校验TEST_DATABASE_URL的host/port/database/schema，禁止生产/平台/普通dev DB。不要新增Eval业务表或产品工具，不操作Git。
~~~

:::

:::prompt{title="Prompt 4：Quality Evaluator"}

~~~text
实现Hit@3/MRR、Citation allowed-key validity、固定gold semantic support、answerable与unsupported abstention、AI Proposal fidelity。用真实产品retrieval/report/note primitive产生observations，不要assert(true)。加入合法key但不支持claim、negation/number/entity变化、新事实和metadata-only案例，证明detector抓得住错误。
明确mock retrieval与real retrieval的不同；固定模板匹配只适用于闭集合成Gold。AI生成后的人工Edit不参加自动fidelity门槛。失败输出case id、safe expected/observed evidence id和assertion名，不保存完整文本、向量、Token或原始Provider响应。
~~~

:::

## Hard Gates 与真正的 DB 事实

至少阻断 cross_workspace_leaks、unapproved_writes、duplicate_knowledge_notes、invalid_citations、unsupported_deterministic_claims。Reference 还阻断 unsupported_answer_count、partial_ready_count、tamper_accepts。

不要把“按钮隐藏”当安全证据。检查真实受保护路由和数据库 delta。来源 URL 的测试检查 Bob 无权取得 Alice 的签名链接；已经签发的短期 URL 本身是 bearer capability，应按原 C3 的 TTL 和保密边界使用。

:::check{title="逐项指出证据来自哪里"}
对每个 Hard Gate 说出：哪个请求/数据库查询/产品 primitive 产生 observed；什么情况下 count 加一；case 执行失败时为何不能默认 count0→PASS。若回答不出来，先修 evaluator。
:::

## Reliability Matrix

| 产品边界 | 注入 | 期待事实 |
|---|---|---|
| File | broken/scanned PDF | 安全失败，不假装已提取 |
| Index | 第二个 chunk embedding 失败 | FAILED、0 部分 chunks、不 READY |
| Retry | stale PROCESSING lease | 可重新处理 |
| Research | steps/tools/budget/deadline/cancel | 对应停止原因，不继续执行 |
| External | MCP timeout、429/5xx、malformed | 保留 private evidence；无证据则拒答 |
| Write | INSERT 后异常、重复并发、过期 | rollback / one Note / no write |

这里用本地仅测试的 S3 HTTP stub 走真实 storage adapter 与 indexer；它不证明云存储 IAM 或实际签名校验，C3 真实存储 smoke 仍保留。故障只注入测试环境，不改生产算法。

:::prompt{title="Prompt 5：Runner、Report 与 Hard Gates"}

~~~text
实现固定矩阵Runner，整合Reliability表与已有产品primitive。每例捕获execution error→INCOMPLETE；setup/import/DB/fixture/report失败也写安全INCOMPLETE报告并非零退出。总状态独立计算Hard Gates、Quality Threshold和case pass rate。
输出.runtime/capstone-eval下JSON与Markdown，含版本、四类结果、计数、Hit@3/abstention/fidelity、model/embedding/tool/external calls、latency及小样本限制。不保存Cookie/approvalToken/APIKey/Secret/Prompt/raw document/chunk/response/vector。
阈值先看真实Reference baseline再review；不通过时先判product bug/eval bug/dataset bug，不降低阈值求PASS。禁止新migration、新Eval UI后台、Worker或Queue。
~~~

:::

## 报告与 reviewed baseline

先完整跑一次，逐例解释结果，再把安全稳定的聚合指标和 case status 保存为 eval/baseline.json。运行结果放 .runtime 不提交。Baseline 绑定 dataset version、runner version 和 mode；版本不同应拒绝比较，要求人工 review。

比较显示 improved / unchanged / regressed。新 Hard Gate 失败、PASS→FAIL、Hit@3 下降超过约定容忍值、拒答恶化都需要解释。有意修改需求时可以人工更新基线，但必须写明理由，不自动覆盖。

:::prompt{title="Prompt 6：Failure Injection 与 Regression"}

~~~text
提供--case、--inject-failure、--compare-baseline。只修改eval observation：unapproved-write/leak/unsupported-claim/retrieval；不真的越权写入。execution-error让case抛错。各自写单独report并非零退出；FAIL与INCOMPLETE分开。
基于首次完整通过的实际报告建立reviewed baseline，只存安全聚合metrics/case status/版本。比较退化时阻断，partial不能当full release结果。测试阈值边界、版本不匹配和报告不完整，保留原baseline直到人工批准更新。
~~~

:::

## 让 Eval 自己变红

:::task{title="四种故障必须亲自跑"}
运行下面命令，记录每次 exit code 与 report.overall。前三类应 FAIL；execution-error 应 INCOMPLETE。检查数据库没有因此产生恶意副作用。恢复正常参数再全量运行，结果应回到正常基线。
:::

~~~bash
npm run eval:capstone -- --case retrieval-gold --inject-failure retrieval
npm run eval:capstone -- --case citation-support-gold --inject-failure unsupported-claim
npm run eval:capstone -- --case unapproved-write --inject-failure unapproved-write
npm run eval:capstone -- --case cross-workspace-isolation --inject-failure leak
npm run eval:capstone -- --case private-research --inject-failure execution-error
npm run eval:capstone -- --compare-baseline eval/baseline.json
~~~

:::stuck{title="失败后先判断修哪一边"}
Hit@3 低：查看 safe gold/observed IDs、embedding mode、fixture是否正确。Key 合法但结论错：检查 support 与原文，不重复统计 validity。DB断开：保持INCOMPLETE，不能补零。并发重复：追锁、UNIQUE与事务，不改 expected。Gold自己错了：人工修数据、升版本、重审baseline。不要直接把阈值调低。
:::

## 真实模型评估与保存

Real Eval 不是再跑一次 smoke。Reference 固定十条语义检索、四份 answerable/irrelevant report、真实 private+Crossref mixed report、Note fidelity 和两条 bounded full workflow。分别记录真实模型与embedding、dimension1024、parser/indexing/dataset/runner版本。

先跑 deterministic gate，再明确 opt-in Real。脚本固定 case count、直连调用上限和总时限；两个完整 Workflow 继续受 C5 的 budget/deadline 限制。普通 build/verify 不会调用付费模型。Real quality 为 informational；若用可选LLM Judge，只能传 claim+cited excerpt，严格 supported/partially_supported/unsupported+reason，绝不接触身份/secret/整库，也不能成为 Safety Gate。Reference 默认固定Gold与可解释规则；C8_JUDGE=1 可单独启用 Note fidelity Judge，词法告警继续记录，Judge 不替换 Safety Gate。

:::prompt{title="Prompt 7：受控 Real Eval 与只读审查"}

~~~text
确定性通过后才实现独立opt-in real eval。固定多条paraphrase/中文retrieval、answerable与irrelevant evidence拒答、real mixed Crossref/private report、AI Proposal数字/实体/否定fidelity、两条完整Workflow。固定case count、calls、timeout、model与dimension，不允许任意扩张CLI付费调用。
记录安全汇总和版本；结构validity、固定规则质量信号与需人工语义复核分别写清，不能声称通用semantic certification。只读审查报告泄漏、数据库guard、Hard Gate、INCOMPLETE、baseline、failure injections；列真实风险，不实现C9。
~~~

:::

:::warning{title="评估通过的范围必须诚实"}
固定小数据集通过不等于真实世界可靠。LLM Judge 有随机性；规则只覆盖写出的事实；真实分布会变化。突然进程死亡、生产恢复与部署仍属于 C9；依赖告警也仍存在。不要用一次高分生成最终简历或发布文案。
:::

~~~bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
# DATABASE_URL = TEST_DATABASE_URL，独立allowlist测试库
npx prisma migrate deploy
npx prisma migrate status
npm run eval:capstone
npm run eval:capstone -- --compare-baseline eval/baseline.json
# 单独配置真实Provider并明确opt-in后
npm run eval:capstone:real
npm audit --omit=dev
git status
git diff
git diff --check
~~~

:::check{title="保存 C8 的证据"}
解释四层、Gold、人审、Hard Gate、Quality Threshold、FAIL/INCOMPLETE与baseline。核对真实结果而非示例数字；检查 .env、Token、Secret、数据库URL、运行报告/日志不入Git，保存自己的C8提交。更新architecture的Eval章节，继续保持Internal Authoring。C9的production deployment、crash recovery、final README、Demo video和Capstone发布不在本轮实现。
:::
