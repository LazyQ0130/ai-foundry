---
estimatedTime: "120～150 分钟"
difficulty: "高级综合实践"
objective: "把已完成研究中的结论转成独立、可编辑的知识笔记提议；通过版本绑定、短期审批 Token、事务和幂等性，保证只有人明确批准的服务器精确内容才被保存一次。"
checklist:
  - "已解释 Proposal、Human Decision、Execution 为什么必须分离"
  - "已建立 ResearchAction / KnowledgeNote，保持 ResearchRun 完成状态独立"
  - "已让用户查看和编辑 Proposal，修改后旧 Approval Token 失效"
  - "已让批准只执行服务器保存的精确 canonical args，拒绝客户端二次修改"
  - "已用事务、行锁和幂等键保证重复及并发批准只产生一条笔记"
  - "已验证拒绝、过期、篡改、跨用户、rollback 和恶意额外字段"
  - "已完成 Notes UI、测试、真实 Smoke、build、audit、migration 与 Git 检查并保存 C7"
checkKeys:
  - "check-c7e7000000000001"
  - "check-c7e7000000000002"
  - "check-c7e7000000000003"
  - "check-c7e7000000000004"
  - "check-c7e7000000000005"
  - "check-c7e7000000000006"
  - "check-c7e7000000000007"
---

# Capstone C7 · 把研究结果安全沉淀成知识资产

Human-approved Knowledge Write

## 报告完成之后，谁决定保存

继续自己的 C6 项目，保留已有产品文档。内部课程作者才用标准 C6 Reference 验证。选一个 COMPLETED + grounded Run，读报告和 Citation Snapshot，圈出值得长期保存的一段结论，写下你会修改的限定条件。

研究结束后，结论还留在一次 Run 里。用户希望沉淀知识资产，但 AI 认为“值得保存”并不等于用户授权保存。本课把写入分成三个可检查事实：Proposal 提出数据，Human Decision 决定是否接受及修改，Execution 才产生数据库中的 KnowledgeNote。

~~~text
Grounded Report → AI Proposal → Human Review
                                  ├─ Edit → new version → review again
                                  ├─ Reject → no Note
                                  └─ Approve → atomic write → KnowledgeNote
~~~

:::task{title="先写自己的保存标准"}
为刚才的报告写一个 Note 标题和不超过 2000 字符的内容。标明哪些限定条件必须保留、哪些表达你愿意人工修改，以及为什么拒绝保存也应该是一个正常结果。先做判断，再让 AI 帮你实现。
:::

:::concept{title="Agent 可以提出写入，但不能自己决定写入"}
写权限来自服务器验证过的明确用户动作。模型输出只能成为候选数据；按钮、系统 Prompt 和模型自述“已保存”都不能替代真实授权与数据库事务。
:::

## 两个生命周期

C4～C6 已完成研究生命周期：检索、报告、引用、COMPLETED。保存笔记是研究完成后的另一个生命周期。用户最终拒绝 Note，也不会把成功研究变成未完成。

| 对象 | 表达的事实 | 生命周期 |
|---|---|---|
| ResearchRun | 一次研究、报告和证据历史 | 已完成后仍是 COMPLETED |
| ResearchAction | 一次待产生副作用的精确提议 | PROPOSED / REJECTED / EXECUTED |
| KnowledgeNote | 人工确认后长期保存的知识资产 | 可独立于来源 Run 生存 |

Stage 4 Demo 允许 AgentRun 停在 waiting_approval；本产品的 ResearchRun 已完成。复用 Stage 4 的 HMAC、精确参数、事务锁和幂等思想，重新围绕 Workspace / ResearchRun / ResearchAction / KnowledgeNote 接线。

本课不把 save_knowledge_note 加进 C6 Research Runtime，也不把审批伪装成 ResearchStep。Run 页面展示独立 Action panel。V1 每个 Run 最多一个 SAVE_KNOWLEDGE_NOTE Action，拒绝后不重新生成第二个；改变主意可以重新研究。

## 领域模型与删除语义

KnowledgeNote 属于 Workspace，保存 title、content、sourceRunId、sourceActionKey 和时间。它独立于 KnowledgeDocument / Chunk / Report。sourceRunId 可空，采用 ON DELETE SET NULL；删研究历史时，Note 继续存在。sourceActionKey 是唯一的来源与幂等提示，不建立删除依赖。

ResearchAction 属于 Run，runId 唯一，canonicalArgs 保存确定性序列化内容，version 从 1 开始，idempotencyKey 唯一。Action 可以随 Run 删除；人工保存的 Note 不随之删除。

:::prompt{title="Prompt 1：Action / Note Schema 与 Migration"}

~~~text
先读自己的 C6 项目、Run/Citation/Workspace schema 和历史 migration。我的决定是研究与保存笔记分离。新增 ResearchAction：id、runId UNIQUE、唯一 SAVE_KNOWLEDGE_NOTE toolName、canonicalArgs、version、PROPOSED/REJECTED/EXECUTED、idempotencyKey UNIQUE、时间与decidedAt/executedAt。
新增 KnowledgeNote：id、Workspace归属、title/content、sourceRunId?、sourceActionKey UNIQUE、时间。来源Run删除SET NULL，笔记继续存在；Action随Run删除，sourceActionKey不做Action删除依赖。Workspace删除可级联自己的Notes。
保持ResearchRun原状态，不加入WAITING_APPROVAL或APPROVED，不改Research Runtime/工具。正式新增migration，不用db push、不重写旧migration。解释每个FK/UNIQUE和删除策略，列出diff，不操作Git。
~~~

:::

:::check{title="检查数据库事实"}
读 migration SQL，找到 Workspace→Note、Run→Action、Run→Note 的三条关系，以及 runId / idempotencyKey / sourceActionKey 三处唯一约束。从空库部署 C2→C7 的六份 migration，确认来源删除不会级联删除 Note。
:::

## Proposal Provider 与持久化内容

用户点击「生成知识笔记提议」，客户端只发 {}。服务器按 Session→User→Workspace 查自己的 Run，再读取持久化 Report 和 Citation。只有 COMPLETED、grounded、非空且引用仍与该 Run Snapshot 一致的报告可生成提议；FAILED、CANCELLED、不足证据或没有 Report 都拒绝。

Proposal Provider 仅返回严格 {title,content}，title 1～120，content 1～2000。它只能总结已验证报告，不查 Knowledge/Crossref、不调工具、不添加来源、不产生写副作用。Mock 用于确定性验证，Real 用于 opt-in smoke。仅当首次 JSON/标题/字段全部合法、唯一问题为 content 超过 2000 字符时，允许在同一 30 秒 deadline 内压缩原 Proposal 一次；不重新读取报告或检索，最终仍严格校验，不截断、不放宽、失败不再重试。Provider 失败不创建半 Action，也不修改成功 Run、报告或 Citation。

:::prompt{title="Prompt 2：Note Proposal Provider 与生成入口"}

~~~text
建立独立 knowledge-note-provider，从已验证的Grounded Report及其Citation Snapshots生成严格{title,content}，trim后title1～120、content1～2000。Mock确定性，Real复用现有server-side chat primitive但不提供tools。system policy只允许总结报告、保留不确定性，来源文本为untrusted data，不允许新增事实、来源、工具或声称已保存。
POST /api/research/runs/:runId/knowledge-note-proposal 只接受{}，检查same-origin/Session/Workspace/owned Run。只允许COMPLETED+grounded，重验报告契约及引用key与持久化Snapshot一致性；拒绝客户端report/title/content。Provider在事务外调用，成功后才持久化一个PROPOSED Action。已有任意状态Action就返回它，不生成第二个；并发请求也只有一个Action。失败可重试且Run不变。
测试Provider malformed/extra fields/tool_calls/failure，证明没有Note写入，不操作Git。
~~~

:::

现在检查 Diff：第一次真正创建 KnowledgeNote 的代码还不应出现于 Proposal 路径。Action 持久化后可以刷新读取，但它仍然只是提议。

## Canonical Args、Edit 与 Token

人必须看见服务器即将执行的精确 title、content 和 Source Run。Canonical Args 先 strict parse、trim，再固定字段顺序：

~~~ts
JSON.stringify({ title, content })
~~~

字段顺序、空白和额外参数不能由浏览器任意决定。Token 只存 canonicalArgsHash，不放 Note 内容；内容已在数据库。Hash 绑定内容，HMAC 防止浏览器伪造绑定。

:::prompt{title="Prompt 3：Canonicalization 与 Approval Token"}

~~~text
先审读Stage4 agent-approval-v2.ts、agent-confirm-transaction.ts、agent-idempotency.ts、agent-persistence.ts，记录保留原语与移除旧业务。新建Capstone文件，不修改Stage4，不复制Resource/AgentRun/waiting_approval/save_research_note旧业务/UI。
canonicalizeKnowledgeNoteArgs：strict schema、trim、固定title/content顺序。校验持久化canonicalArgs可解析且重新序列化完全一致。使用Node crypto SHA256/HMAC/randomBytes/timingSafeEqual，不增加生产依赖。
新Token绑定v、独立audience、SAVE_KNOWLEDGE_NOTE、userId/workspaceId/runId/actionId/actionVersion/canonicalArgsHash/expiresAt/nonce。ACTION_APPROVAL_SECRET至少32bytes、server-only、不入DB/Git，TTL5分钟。GET当前PROPOSED Action动态生成Token，不持久化Token。注入clock测试过期，不等待五分钟；拒绝坏签名、malformed、错误user/workspace/run/action/version/hash。
解释为什么这是当前提议的审批能力而不是登录凭据，不操作Git。
~~~

:::

Edit 是主流程：人可能保留 AI 的结构，改掉夸大的结论。PATCH 接受 title、content、expectedVersion。服务端检查 ownership、PROPOSED、版本一致，在锁内更新 canonicalArgs、version+1、幂等键。返回规范化的新内容与新 Token，旧 Token 从此与当前版本不符。

:::prompt{title="Prompt 4：Edit / Reject"}

~~~text
实现GET/PATCH /api/research/actions/:actionId，PATCH严格{title,content,expectedVersion}。Session→Workspace→Run ownership，same-origin。短事务锁Action FOR UPDATE，再检查PROPOSED和expectedVersion；更新canonicalArgs、version+1、idempotencyKey。并发编辑只能一个版本成功，stale请求409。返回当前规范化提议与新Token。
POST同Action的/reject只接{expectedVersion}，同样检查/加锁，设REJECTED、decidedAt。拒绝后不能编辑/批准，不创建Note，Run仍COMPLETED。拒绝是最终决定，重复生成入口返回原Action。
strict拒绝workspaceId/userId/ownerId/runId/toolName等额外字段。测试v1→edit v2→旧Token失败、新Token可用、reject后无Note、跨用户HTTP拒绝。不操作Git。
~~~

:::

:::task{title="亲自破坏一个旧 Token"}
在未刷新前保留 v1 Token。编辑提议保存成 v2，用旧 Token 发真实批准请求，预期 403 且没有 Note。重新读取当前 Action，核对页面文字与 v2 的 canonicalArgs，再继续。不要把 Token 写进日志、Git 或截图。
:::

## Atomic Execution 与 Idempotency

Approve 只接 {approvalToken}，不再接 title/content。看到 A，提交时改成 B 的 TOCTOU 问题，必须通过“执行数据库中同版本的精确内容”解决。

~~~text
BEGIN → lock Action → verify ownership + token + current version/hash
      → EXECUTED? return existing Note
      → PROPOSED? parse stored args → INSERT Note → Action EXECUTED
COMMIT
~~~

没有 APPROVED 中间状态。批准与执行一次完成，失败整体回滚，Action 保持 PROPOSED，用户可以安全重试。事务里只做数据库工作，不调用 AI、MCP 或检索。

幂等键由 toolName、runId、actionId、version、canonicalArgs 稳定 hash 得到。Action.idempotencyKey 与 Note.sourceActionKey 都 UNIQUE。行锁让两个并发批准串行看到当前事实，唯一键提供最后的数据库约束。有效 Token 重放返回同一 Note 与 replayed:true；Token 过期后不能靠重放绕过校验，可以直接查看已保存 Note。

:::prompt{title="Prompt 5：Atomic Approve、Replay 与 Rollback"}

~~~text
POST /api/research/actions/:actionId/approve严格只接{approvalToken}，拒绝title/content/workspaceId。same-origin+Session+ownership后，进入短事务，Action FOR UPDATE；重新查当前Action→Run→Task→Workspace与owner，再验证Token绑定用户/Workspace/Run/Action/当前version/argsHash/TTL。仅从DB解析精确canonicalArgs，校验toolName和稳定幂等键。
已EXECUTED且Token仍有效：按当前key和Workspace返回现有Note，replayed:true。PROPOSED：创建Note并标Action EXECUTED，decidedAt/executedAt在同一事务；REJECTED拒绝。Run/Report/Citation/Step不变。事务内无AI/网络。
实际PostgreSQL integration test在Note INSERT之后、Action更新前注入抛错（仅直接测试hook，HTTP不可提供），验证Note0/Action PROPOSED，再安全重试。实际HTTP Promise.all两个Approve验证一个Note、一个created与一个replayed。另测顺序双击、token tamper/expiry/wrong binding/Bob、approve额外参数。完成后指出唯一真正写Note的位置，不操作Git。
~~~

:::

:::deepdive{title="为什么锁和唯一键一起存在"}
锁使状态判断、版本校验与写入属于同一串行临界区，避免两个事务同时认为“尚未执行”。唯一键表达数据库不允许同一个动作产生两条笔记，即使以后接线出错也不能悄悄重复。只在前端禁用按钮，无法覆盖网络重试或另一个浏览器窗口。
:::

## 人看到的产品流程

Run Detail 的独立 Action panel 展示等待确认、已拒绝、已保存。编辑状态只显示保存修改/取消；先把新文字持久化并重新展示，才能批准。按钮写「批准并保存到知识笔记」，让副作用清楚可见。

Knowledge 区域增加 /knowledge/notes 与详情：Title、Content、Saved At、Source Run。来源仍在时跳回报告，来源删除时说明历史记录已删除，Note 继续可读。编辑后内容属于人工确认文字，不标 AI Verified，不声称逐 Claim 自动 Grounding。Note 不自动成为 Document、不 Embedding、不进入 RAG；保存之后停止，不再启动 Agent。

:::prompt{title="Prompt 6：Proposal / KnowledgeNote UI"}

~~~text
沿用现有Knowledge信息架构。Run Detail中为COMPLETED+grounded报告提供“生成知识笔记提议”，单独Action panel展示规范化Title/Content/Source Run/version/status，说明尚未保存。支持编辑input/textarea、保存修改并重新确认、拒绝本次提议、批准并保存到知识笔记。编辑中禁用批准；冲突/过期提示重新读取当前Action，不自动批准新内容。Token仅在内存，不能写localStorage/log。
增加Notes list/detail和受保护GET API，只按Session的Workspace过滤；不增加手工POST创建Note。展示人工确认、保存时间和Source Run链接；Run删除后Note仍可读。loading/empty/error/retry/busy状态完整。
确认ResearchRun/Timeline不被改成审批状态、不新增ResearchStep，不自动索引Note或继续Agent。用HTTP确认刷新与来源跳转，再说明改动，不操作Git。
~~~

:::

## Break → Fix → Re-run

:::task{title="实际攻击与故障实验"}
1. 直接 POST /api/knowledge/notes：没有创建入口，不能绕过 Action。
2. Edit v1→v2，再用 v1 Token：拒绝，无 Note。
3. 连续及 Promise.all 并发批准：只有一条 Note，重放返回同一 ID。
4. Note INSERT 后抛错：整体 rollback，Note 0、Action PROPOSED，然后重试成功。
5. Reject 后 approve/edit：拒绝，Run 仍 COMPLETED。
6. 注入 clock 测试过期；篡改 payload/signature/action/version/hash；跨用户使用 Token：全部拒绝。
7. Edit 加 workspaceId，Approve 加 title/content，Proposal 加伪造 report：400。
8. FAILED/CANCELLED/不足证据/无报告 Run 生成 Proposal：拒绝，不创建半 Action。
9. Alice 的 Proposal/Note，Bob 猜 ID 后 GET/Edit/Reject/Approve；匿名请求：服务端全部隔离。
:::

:::warning{title="人工确认不是自动语义认证"}
Token 证明批准了哪个版本和哪些参数，事务证明写入原子且不重复；它们不能证明笔记的每句话忠实于研究证据。人工 Edit 后更不能继续声称逐 Claim 自动验证。语义忠实度留待 C8，当前保留来源 Run 供回看。
:::

:::prompt{title="Prompt 7：只读 Side-effect Security Audit"}

~~~text
只读审查真实代码，不改文件：Proposal在哪里产生、哪里第一次真正创建Note；为何客户端Report/Workspace不能决定保存内容和归属；Approve为什么只接Token；Token具体绑定哪些字段与TTL；Edit为何让旧Token失效；事务在哪锁行、在哪重验当前版本；Replay/并发为何只有一条Note；INSERT后失败如何回滚；Reject为何无法继续执行；Run为何始终COMPLETED。
追踪Note→Source Run和删除语义，证明没有自动Embedding/RAG反馈循环。指出所有HTTP ownership predicate、strict body、same-origin与测试证据，不把隐藏按钮当权限控制。列最多五个真实剩余风险，不提前实现Eval/Worker/Queue/Resume/部署。
~~~

:::

:::stuck{title="先定位哪一种事实不一致"}
生成失败先查 Run eligibility 与 Provider 契约，不改 Run 状态；旧 Token 403 先读当前 version/hash 与 TTL，不关闭验签；并发重复先确认真实数据库锁和两处 UNIQUE，不用前端按钮防重复；来源删后 Note 消失检查 FK 删除策略；批准超时先读 Action/Note 再重试，不在客户端重新发 title/content。不要把秘密、Token 或 Provider raw body贴给AI。
:::

确定性测试全部通过后，用非敏感真实 grounded 报告做 opt-in smoke：真实 Provider 生成提议，小幅编辑一次，使用当前 Token 批准，再重放。记录 Proposal latency、title/content length、version、replayed、note count；不记录 Token、Secret、Provider 原始响应。

~~~bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
# 使用独立空 TEST_DATABASE_URL；DATABASE_URL 指向同一测试库
npx prisma migrate deploy
npx prisma migrate status
npm run test:db
npm audit --omit=dev
git status
git diff
git diff --check
~~~

:::check{title="保存自己的 C7"}
亲自解释 post-run action、三个事实、canonical args、version、精确 Token、锁、唯一键、事务和 provenance。检查实际命令与安全实验；确认.env、Approval Secret、Token、测试DB、日志未入Git，再保存自己的提交，例如 add human-approved knowledge notes。AI可生成密码学接线/表单/测试，你负责决定并验收授权边界。
:::

更新 docs/architecture.md，画出 Model→Proposal→Server validation→Human exact review→Persisted args execution→Note。本课继续 Internal Authoring；C8 的 Eval、C9 的进程恢复/部署与最终交付不在本轮实现。

可靠性补充：AI Proposal → One bounded compression → Grounded deterministic fallback。仅当两次结果都只是 content 超长时，服务器从当前 Run 已持久化并验证的 Grounded Report 中，以完整 Claim 确定性组装不超过 1850 字符的可编辑草稿，复用初始合法标题；不截断、不增加事实、不再调用模型。安全日志区分 MODEL、MODEL_COMPRESSED、GROUNDED_FALLBACK。这是安全降级，不代表 AI 总结成功。模型负责可读性，服务器负责产品契约；草稿仍为 PROPOSED，必须经用户 Edit / Reject / Approve，sourceRunId 保留报告与引用来源。其他错误继续安全失败。
