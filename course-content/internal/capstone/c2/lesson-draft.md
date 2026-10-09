---
estimatedTime: "90～120 分钟"
difficulty: "高级综合实践"
objective: "从 C1 产品需求推导架构，亲自决定技术与领域边界，复用已学工程能力完成登录、个人工作区与持久化研究任务的第一条 Vertical Slice，并验证服务端归属隔离。"
checklist:
  - "已从 C1 需求推导工程约束，完成自己的技术决策与取舍"
  - "已完成 Architecture Decision 和第一版 Domain Map"
  - "已用正式 migration 建立 User、Session、Workspace、ResearchTask，并检查约束与 SQL"
  - "已完成登录 → 工作区 → 创建研究任务 → 刷新仍存在的完整链路"
  - "已用 Alice/Bob、匿名请求和伪造归属字段验证服务端边界"
  - "已运行测试与 build，检查 migration 和 Git diff，保存 C2 版本"
checkKeys:
  - "check-c2a2000000000001"
  - "check-c2a2000000000002"
  - "check-c2a2000000000003"
  - "check-c2a2000000000004"
  - "check-c2a2000000000005"
  - "check-c2a2000000000006"
---

## 从 C1 的流程倒推工程能力

C1 已回答「为什么做、给谁做、V1 做到哪里」。现在打开**你自己的** `docs/product-brief.md` 和 `docs/user-flow.md`，找到这条主线：

```text
Login → Workspace → Upload Knowledge → Research Task → Research Run → Evidence → Report
```

如果今天要把它做成软件，需要什么？先按能力分组，再谈框架。

| C1 产品要求 | 工程需要 | C2 是否实现 |
| --- | --- | --- |
| 私人资料和任务 | 服务端身份、统一 ownership | 是，先覆盖 Task |
| 任务刷新后还在 | 持久化关系数据 | 是 |
| 同一任务可多次研究 | Task 与 Run 生命周期分离 | 只建 Task；C4 建 Run，C5 扩展 Workflow |
| 带出处的报告 | 文件、检索、引用 | 否，C3/C4 |
| 调用模型 | 服务端 Provider | 否 |
| 外部资料 | 受控工具 / MCP | 否，C6 |
| 用户确认后写笔记 | 服务端审批边界 | 否，C7 |

浏览器将需要表单、任务列表和后续的报告页面；服务端将承担 Auth、API、ownership 以及未来 AI Provider 和 Agent Runtime；关系数据从 User、Workspace、ResearchTask 起步。文件将来进入私有对象存储，向量检索将来用到 pgvector。**未来需要**并不等于**现在安装**。

:::task{title="写下自己的工程需求"}
在 `docs/architecture-decision.md` 的 Context 草稿里，先写出你从 C1 MVP、Non-goals 和 User Flow 推出的 4～6 条约束。每条都指出来源。不要先写技术栈。
:::

:::concept
技术栈不是作品集装饰品。每项技术选择都应能追溯到产品约束；当前没有的能力可以记录在未来图中，不必先装进 V1。
:::

## 由你做技术决策

先比较三个都说得通的方案。A 是 Next.js + TypeScript 的 full-stack modular monolith；B 是 React + Express + TypeScript；C 是 React + FastAPI。B 的前后端边界更显式，C 适合团队已有 Python 服务与处理能力的情形；它们都不是错误答案。

你先决定评价标准及其重要性。可从前后端协作、已有能力复用、AI/Provider 集成、类型一致性、部署、单人维护和后续课程扩展选择。给每个标准写一句「为什么本项目在乎它」。再各写一个优势和一个代价。

| 标准（本课参考） | A Next.js | B React + Express | C React + FastAPI |
| --- | ---: | ---: | ---: |
| 前后端统一 | 3 | 2 | 1 |
| 已验证能力复用 | 3 | 2 | 1 |
| AI 接入 | 3 | 3 | 3 |
| 类型一致性 | 3 | 3 | 1 |
| 部署复杂度 | 3 | 2 | 2 |
| 单人维护 | 3 | 2 | 2 |

1～3 分只表示**这个项目、这个阶段**的判断。总分不能代替理由；如果你已经有稳定的 Python 研究服务，C 的评分和结论可能不同。

:::prompt{title="Prompt 1：让 AI 评审架构"}

```text
请根据我已经完成的 Product Brief 和 User Flow，帮助我评审技术架构，不写代码，也不要直接宣布唯一答案。

项目约束：[贴自己的 MVP、Non-goals、User Flow，以及我先写出的工程约束和评价标准]
候选：
A. Next.js + TypeScript modular monolith
B. React + Express + TypeScript
C. React + FastAPI

请：
1. 提取真正影响选型的工程约束；
2. 按前后端协作、类型一致性、数据库/AI 集成、部署、单人维护、未来扩展比较；
3. 指出每种方案至少一个真实优势和一个真实代价；
4. 检查我的标准有没有偏向某个方案；
5. 不替我做最终决定。
不要加入微服务、Kafka、Kubernetes 等未由需求要求的技术。
```

:::

看完评审后，**你**选方案并写入 ADR：Decision、Context、Options、Criteria、Trade-offs、Final Choice、Consequences。模板见 `docs/templates/architecture-decision.md`；若你的 C1 项目没有此文件，可从课程提供的模板内容新建。AI 可指出遗漏，最终理由要由你写。

本课 Reference 选择 Next.js、TypeScript、PostgreSQL、Prisma。它复用了已验证的工程原语，适合一个开发者、一套产品数据和一个部署单元。PostgreSQL 当前存关系数据，后续可在同一数据边界引入 pgvector。React + Express 会增加两个应用的协作和部署工作；React + FastAPI 会增加 TS/Python 合约维护。Next.js 也有代价：服务端运行限制和长任务处理需要在后续 C5/C9 专门处理。

:::check
- ADR 写出每个方案的真实优势与代价。
- 最终选择能回指至少三条 C1 约束。
- 本课只安装第一条链路需要的组件；pgvector、对象存储、模型、Agent、MCP 尚未安装。
:::

### Break 1：Architecture Explosion → Fix

有人提交这张 V1 架构图：

```text
Next.js Frontend → API Gateway → Auth / Research / Knowledge / Agent Microservices
                                  ↓
                    Redis + Kafka + PostgreSQL + Vector DB
                                  ↓
                              Kubernetes
```

:::task{title="保留、删除、重新考虑"}
逐项标注 Keep、Remove、Revisit。对每个 Keep，指出 C1 哪条需求要求它；对 Revisit，说明出现什么具体条件才重新评估。把当前图收敛到 Browser → Next.js 模块（UI / Routes / Auth / Research）→ PostgreSQL，写入 `docs/architecture.md`。架构复杂度本身没有价值。
:::

Agent 的选型也只做轻量决定：A 复用 Stage 4 已验证的 bounded runtime；B LangGraph 一类图编排；C 从零重写 Loop。Reference 选择 C5 再复用 A，因为停止、取消、工具校验与边界已有验证，而 Capstone 的新问题是研究产品领域。B 对复杂分支和持久图执行有优势，C 有最大自由度，但现在都不进入 C2 产品。

## 从 User Flow 抽取领域

现在才进入工程对象。User 回答「谁在使用系统」；Workspace 回答「谁拥有研究资料与任务」；ResearchTask 回答「用户长期想研究什么」。例如「Agent Memory 的工程实现」是 Task，不是一次模型请求。C4 会建立同一 Task 的多次 Run，C5 再为每次 Run 加入有界研究步骤。

```text
User
 └── 1 Personal Workspace
       ├── ResearchTask → future ResearchRun
       ├── future KnowledgeDocument
       └── future KnowledgeNote
```

为什么不直接 User → Task？在很小的应用里直接 `userId` 完全合理。本产品的资料、任务、未来 Run 与 Note 都需要同一个产品作用域；从 Workspace 开始查询使 ownership 语义清楚，后续资源不用各自发明 owner 字段。V1 仍是一人一个 Workspace，**不做** Team、Membership 或 RBAC。

:::task{title="画自己的 Domain Map"}
在 `docs/architecture.md` 画当前三个对象和 future 对象，给每个当前对象写一句生命周期解释。亲自回答 Workspace 是否值得存在、Task 和 Run 为什么分离，以及第一条 Slice 包含什么。Domain Map 是产品解释，不能只贴 ER 图。
:::

## 数据层与已学 Auth 的重组

从自己的 C1 项目继续。只有没有可用 C1 项目时，课程作者才用内部干净 C1 Reference 验证；不要覆盖自己的 Product Brief。先让 AI 读现有文件，限制它只建数据层。

:::prompt{title="Prompt 2：建立第一条链路的数据层"}

```text
请先阅读当前 Capstone 项目、package.json、app、现有测试，以及 docs/product-brief.md、docs/user-flow.md、docs/architecture-decision.md。
现在只建立 C2 第一条 Vertical Slice 所需的数据层，不实现文件、AI、RAG、Agent、MCP、ResearchRun。
要求：
1. 使用 PostgreSQL + Prisma；建 User、Session、Workspace、ResearchTask；
2. V1 每个 User 恰好一个 Workspace，ownerId 唯一；ResearchTask 属于 Workspace；
3. Task 只有 title、query 和必要时间字段；不加 Run、Document、Citation、Note；
4. 使用正式 migration，不用 db push；补必要的 Prisma client 封装与输入 schema；
5. 不修改 C1 Product Brief 的决定；先不做 UI、不操作 Git。
完成后解释每条 relation 为什么存在，列出全部改动文件。
```

:::

看 `git diff` 和 migration SQL，而不只看 schema。数清 User、Session、Workspace、ResearchTask 四张表，找出 FK、UNIQUE、INDEX、cascade。`Workspace.ownerId UNIQUE` 保证**至多一个**；注册事务负责创建那个工作区，二者合起来保证新注册用户的「恰好一个」。如果 User 创建成功而 Workspace 创建失败，产品会留下无法工作的账号，所以它们是同一个初始化动作。

:::concept
这里复用 Auth 工程原语，不重新学习 Cookie 或 CRUD。要理解的是：旧能力如何进入新产品，以及 Session 身份怎样决定 Workspace 归属。
:::

:::prompt{title="Prompt 3：接入 Auth 和 Workspace"}

```text
继续当前 C2 项目，把已学的服务端 Session Auth 接进这个新产品。
要求：注册、登录、退出、当前会话；密码只存安全 hash；服务端生成随机 token，数据库只存 token hash；HttpOnly Cookie 与过期时间；所有写请求做同源保护。
浏览器不得提供 userId 或 workspaceId 作为身份依据。注册 User 时，在同一数据库事务内创建唯一 Personal Workspace 和 Session。
不建 Team、Role、WorkspaceMember，不做 Task UI 或 AI 功能。可复用已验证 Auth primitive 的最小实现，但不要复制 Stage 4 页面、业务路由、Agent 或 RAG。
完成后说明身份从哪里得到、Workspace 从哪里得到、伪造哪些客户端字段仍无法改变归属。不要操作 Git。
```

:::

:::check
- 数据库只保存密码 hash 和 Session token hash；Cookie 为 HttpOnly，Session 有过期时间。
- 注册事务创建 User、Workspace、Session；Workspace ID 来自服务端查询。
- 从空的独立测试库执行 migration，而不是 `db push`。
:::

## 第一个真正可运行的产品动作

先完成一个用户动作：登录 → 工作区 → 创建 Task → 写入数据库 → 再次读取。不做更新、删除、ResearchRun、文件或模型。

:::prompt{title="Prompt 4：完成 ResearchTask 端到端链路"}

```text
在现有 C2 数据层和 Session Auth 上，完成第一条 ResearchTask 链路。
服务端：受保护的 GET / POST /api/research/tasks；身份只从 server session 获取；从 session.userId 查询唯一 Workspace；POST 只接受 title 和 query；trim 后 title 1～120、query 1～2000；strict validation 拒绝 userId、workspaceId、ownerId 等额外字段；列表按真实 Workspace ID 过滤；返回简短安全错误。
页面：未登录有最小注册/登录入口；登录后显示 Workspace；可创建和列出 Task；刷新后仍可见；有 loading、empty、error 状态。UI 保持最小。
暂不做 update/delete/run，不加 AI、RAG、文件、Agent、Citation。完成后运行现有测试与 build，报告改动，不操作 Git。
```

:::

现在你有了一条**Vertical Slice**：

```text
UI → Route → Validation → Auth → Workspace ownership → Prisma → PostgreSQL
```

它的价值在于一个最小用户动作穿过了整套系统。后续 C3～C7 也按这个方法扩展，而不是先把所有页面写完再开始服务端。

:::stuck{title="页面显示了任务，但刷新后消失"}
先确认 POST 的 201 和返回的 Task ID，再看新的 GET 是否返回同一 ID；检查 `DATABASE_URL` 是否指向迁移过的测试库、写入是否真正 await、列表是否按当前 Workspace 过滤。不要用前端内存列表当作持久化证据。
:::

## Break 2，伪造归属与双用户隔离

正常 POST 只发送 `{ "title": "Agent Memory", "query": "比较不同实现方案" }`。现在故意加上 `workspaceId`、`userId` 或 `ownerId`，试图写进另一个人的工作区。严格输入应返回 400；即使实现选择忽略额外字段，也绝不能用它决定归属。正确链路是 **Server Session → User → Workspace**。

:::task{title="Alice / Bob 隔离实验"}
用独立测试数据库注册 Alice 与 Bob。确认两人各有一个不同的 Workspace；Alice 创建 Task，发出新 GET 请求确认仍在；Bob 的列表不能看到它。再试未登录 POST、Bob 猜 Alice Task ID（若有详情接口）、Bob 发送 Alice 的 workspaceId/userId/ownerId，以及跨来源写入。记录状态码与可观察结果；没有详情接口时无需为了 IDOR 演示添加它。
:::

:::warning
隐藏页面按钮不是权限控制。要在真实 Route、查询条件和数据库结果上验证隔离。测试库必须独立，不能使用生产库或课程平台库。
:::

:::prompt{title="Prompt 5：只读审查真实架构"}

```text
只读审查当前 C2 Vertical Slice，不修改文件。
请从真实代码指出：1. Session 身份在哪里解析；2. Workspace 如何由服务端获得；3. Task POST 允许哪些字段；4. 数据库查询在哪里限制 workspaceId；5. 注册时 User、Workspace、Session 是否原子创建；6. migration 哪些约束保证一人至多一个 Workspace；7. 页面刷新后 Task 为什么仍存在。
然后列出最多五个当前真实风险或未来工作，不要建议提前实现 C3～C9。不要把 UI 隐藏当作权限证据。
```

:::

自己逐条对照代码。`docs/architecture.md` 最后应简洁记录 Browser → Next.js → PostgreSQL、当前 User/Workspace/ResearchTask、当前 POST 链路；Object Storage、AI Provider、External MCP 只能标为 **Not implemented yet**。

## 验收与保存

从空测试库执行正式 migration；运行 lint、typecheck、tests、build 和 HTTP smoke。确认注册、自动 Workspace、创建 Task、刷新后仍在、Bob 看不到、匿名不能写、伪造归属不能写、跨来源写入被拒。检查 `git status`、`git diff`、`git diff --check` 和 migration SQL；确认 `.env`、真实 DATABASE_URL、Cookie secret、测试库配置与日志没有进入 Git。然后保存自己的 C2 版本，提交信息可用 `build first research workspace slice`。

:::deepdive{title="为什么后续仍可能调整架构"}
当出现真正的团队权限、独立扩缩容或长时后台任务需求时，重新评估边界与运行方式。今天的模块化单体让这些边界先在代码中清晰存在；不靠提前拆服务证明架构成熟。
:::
