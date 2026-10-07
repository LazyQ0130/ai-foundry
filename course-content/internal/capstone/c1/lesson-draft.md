---
estimatedTime: "60～75 分钟"
difficulty: "综合实践 / 产品设计入门"
objective: "从自己的研究场景出发，定义 AI 研究工作台的主要用户、问题、JTBD、V1 范围、用户流程与可验证的成功标准，完成 Product Brief 和 User Flow。"
checklist:
  - "已写清一个主要用户、当前研究流程和最值得解决的三处问题"
  - "已用自己的话写出 JTBD，并划清 AI、系统代码与人的职责"
  - "已把需求分成 MVP 与 Non-goals，主动砍掉至少三个超出 V1 的功能"
  - "已画出资料到带引用报告、人工决定与知识笔记的主路径及失败分支"
  - "已写出可验证的产品、可信度、安全、可靠性与交付标准"
  - "已审查 AI 建议，检查 Git diff，并保存 Product Definition 版本"
checkKeys:
  - "check-c1a1000000000001"
  - "check-c1a1000000000002"
  - "check-c1a1000000000003"
  - "check-c1a1000000000004"
  - "check-c1a1000000000005"
  - "check-c1a1000000000006"
---

## 0～6 分钟：一个很容易写出的错误需求

假设你现在打开 Codex，输入这段话：

```text
帮我做一个功能强大的 AI Research Agent。
它要支持知识库、联网搜索、PDF、OCR、网页抓取、Browser Agent、
Multi-Agent、团队协作、自动生成报告和自动保存知识。
```

AI 可能马上给你页面、数据表和技术方案。但你还没说清谁要用它、为什么用、研究报告怎样才算可信。直接动手，后面很可能不断改数据模型、增加页面和扩大 Agent 权限，直到功能不少，却没有一条完整的用户主线。

今天先不写业务代码。你要做的是把「我想做一个 AI Research Agent」变成一句能指导 C2～C9 开发的话：**为谁，在什么情境下，解决什么问题，V1 做到哪里，什么暂时不做。**

本课会留下三个文件：`docs/product-brief.md`、`docs/user-flow.md`，以及 README 顶部的一句产品定位。当前工程仍是最小 Bootstrap；Auth、数据库、Agent 和 Citation 的实现从后续课程开始。

## 6～16 分钟：先看一个研究者的下午

你要调研「AI Agent 在企业知识管理中的应用」。电脑里有三份 PDF、两篇 Markdown 笔记和几段 TXT 资料；还需要补充公开信息。报告交出几天后，同事问：「这句话有什么依据？」你必须重新找到它的来源。

如果没有这款工作台，你大概会这样做：

```text
打开已有资料
    ↓
搜索关键词、复制片段 ──────┐
                           ↓
浏览器搜索 → 外部资料 → 手动整理
                           ↓
                         写报告
                           ↓
                    回头寻找原始出处
```

请先换成**你自己的研究场景**：课程论文、软件技术调研、行业研究或竞品研究都可以。写出现在的步骤，在其中标出最费时间、最容易丢来源或最难复核的三处。不要急着写「向量数据库」和「Agent」。那是可能的做法，不是用户正在经历的麻烦。

:::task{title="画出 Before"}
在项目中建 `docs/user-flow.md`。你可以先复制 `docs/templates/user-flow.md`，只填写 Before 和最痛的三处。用 Markdown 或 ASCII 就够了，不需要新装设计软件。
:::

让 AI 帮你看流程，但让它先忍住给方案。把你刚写的场景和 Before 放进下面的 Prompt，替换方括号内容。

:::prompt{title="Prompt 1：分析当前研究流程"}

```text
我正在定义个人 AI 研究工作台，当前只做问题分析，不写代码，也不要提出功能或技术栈。
我的研究场景是：[写你选择的场景]
当前流程是：[贴出你自己写的 Before]

请按顺序指出：
1. 哪些步骤在重复劳动或频繁切换上下文；
2. 哪些信息最容易失去来源，哪些结论最难复核；
3. 你认为最值得核实的三个用户问题，每个问题后写出从当前流程看到的依据；
4. 仍需要向真实用户确认的一件事。
请区分你从我提供的流程推断出的内容和你尚无证据的猜测。不要替我决定产品功能，不要修改文件。
```

:::

AI 的分析只是候选。拿你的 Before 逐条核对：它如果说「用户需要十个 Agent」，那仍然是方案，而且当前流程没有支持这个判断。

### 把功能句改回问题句

| 一开始写出的功能 | 倒回去找用户问题 |
| --- | --- |
| 做一个向量数据库 | 多份个人资料分散，研究时找不到相关段落 |
| 加 Citation | 报告写完，无法快速说明某条结论来自哪里 |
| 接 MCP 搜索 | 自己的资料不足，需要补充可标明出处的公开信息 |
| Agent 自动保存笔记 | 好的研究结果值得复用，但用户必须先确认要写入什么 |

:::concept{title="问题先于功能"}
「用户想完成什么、现在卡在哪里」是问题；「用什么技术实现」是方案。先写问题，后面才有依据决定做哪些功能，也有依据删除哪些功能。
:::

## 16～24 分钟：选一个主要用户，写一句 JTBD

V1 只服务一个 Primary User：经常阅读多份资料、补充外部信息并形成可追溯研究结论的个人研究者。你需要再给他一个具体情境，例如「调研软件技术的开发者」。不用编姓名、年龄、爱好；这些信息帮不了你决定报告、来源和审批流程。

现在用自己的话填一句话：

```text
当 ______ 时，我希望 ______，这样我就能 ______。
```

先自己写，写完再对照这个参考句式：

> 当我要研究一个主题时，我希望系统能同时利用自己的资料和可信外部来源整理证据，并生成带引用的研究报告，这样我能更快得到结果，而且能检查重要结论来自哪里。

如果你的句子只有「我希望用 RAG、Agent、MCP」，还没说出用户要完成的事。把工具名拿掉，再试一次。**不要原封不动复制参考句**；你选的研究场景，应能在句子里看出来。

:::check{title="问题和用户已经足够具体"}
- 能说出一个主要用户，而不是「所有需要 AI 的人」。
- Before 是一条实际流程，不是功能清单。
- JTBD 说清触发情境、希望完成的任务和为什么有价值。
:::

## 24～32 分钟：AI 可以做什么，权限留给谁

这是一款 AI 产品，不能把所有步骤都交给模型。把刚才的流程分成三列：

| AI 适合提出或生成 | 系统代码必须保证 | 人必须决定 |
| --- | --- | --- |
| 检索候选资料、整理 Evidence、提出 Research Brief、组织报告、建议笔记 | 登录与归属、文件存储、检索过滤、引用校验、工具名单、运行状态、持久化与审批执行 | 研究目标、是否接受结论、是否批准写入、报告是否可信、笔记是否保存 |

想一想：模型生成了一段「请保存这份研究结论」，就等于它有权写入你的知识库吗？当然不等于。它可以提出 Note Proposal；系统要把准确内容交给你看，你批准后才能执行。你在 Stage 4 学过的审批边界，在这里变成一个真实产品决定。

:::warning{title="把建议当授权，会改变产品性质"}
研究报告可能包含模型误解的内容。V1 不让 Agent 自动写 KnowledgeNote，更不能让外部资料中的文字命令它写入。人的确认是产品流程的一步，后续 C7 才实现对应的服务端约束。
:::

在 `docs/product-brief.md` 的 Problem、Target User、Current Workflow、JTBD 中写入自己的决定；再用一小段话写清这三种职责。此时还不用画数据库，也不用决定 Next.js。

## 32～46 分钟：把 V1 砍到能交付

现在做范围选择。先别看参考答案，把下面的功能池分到 Must、Later、No。Must 的判断标准只有一个：少了它，主要用户还能否完成「私人资料与外部证据 → 可追溯报告 → 自己决定是否保存」？

```text
PDF / TXT / Markdown / DOCX / OCR / 网页抓取 / RAG / Citation /
Agent / MCP / Multi-Agent / Workspace / Research History / Team /
Billing / KnowledgeNote / Browser Agent / Mobile App
```

:::task{title="先写自己的 Must、Later、No"}
在 Product Brief 的 MVP 与 Non-goals 下先分组。为每个 Must 写它支持哪一步用户任务；从 Must 中主动删掉至少三个原本想做的功能，并写出原因。不要因为一项技术已在 Stage 4 学过，就自动把它放进 V1。
:::

### 故障实验：Scope Explosion

一份故意写坏的需求说：同时做知识库、联网搜索、PDF、DOCX、OCR、图片理解、网页抓取、Browser Agent、Multi-Agent、团队协作、RBAC、支付、移动 App、多模型路由、自动写数据库和自动发邮件。一个人从这份清单开工，首先会卡在什么地方？

先找出与 JTBD 直接相关的能力，再找「以后也许有价值」的，最后找当前完全没有理由做的。请把这份清单改写成一版能交付的 V1，并用两句话解释你砍掉了什么。这里的 **Break → Fix** 是产品范围：坏版本是无边界功能池，修复是可验收的主流程。

:::prompt{title="Prompt 2：让 AI 挑战 MVP"}

```text
请作为严格的产品评审，挑战我的个人 AI 研究工作台 V1 范围，不写代码、不修改文件。
Primary User：[贴你的主要用户和场景]
JTBD：[贴你自己写的 JTBD]
Must / Later / No：[贴你的分类和理由]

请找出：
1. Must 中与 JTBD 联系最弱的三项，说明删除后主流程是否还能完成；
2. 被我放进 No、但没有它主流程可能断裂的项目；
3. MVP 与 Non-goals 的冲突；
4. 最小端到端流程仍缺少的可信度或人工确认步骤。
只给审查意见，不替我重写需求。每条意见都引用我提供的具体决定；无法判断时写「需验证」。
```

:::

你决定采纳或拒绝每条建议，并在 Brief 里写原因。下面是课程 Reference 的范围，**现在才拿来对照**：

| V1 要形成的能力 | 为什么保留 |
| --- | --- |
| 登录、Personal Workspace | 私人资料必须有归属边界 |
| PDF/MD/TXT 与私有检索 | 让已有资料进入同一研究过程 |
| ResearchTask、ResearchRun、内部/外部 Evidence | 一个研究目标可以多次执行，并汇集两类来源 |
| 带 Citation 的 Report、Source Preview、证据不足时降低确定性 | 让用户核对结论，而非只得到一段流畅文字 |
| 有界 Research Workflow 与只读工具 | AI 能协助研究，执行范围仍受控 |
| KnowledgeNote Proposal 与 Human Approval | 有价值的结论能保存，写入由人决定 |
| Run Timeline、Eval、部署 | 失败可理解，产品可靠且可交付 |

以下是 Reference 暂不做的范围和理由。Non-goals 是**当前版本主动不做**，不等于永远不能做。

| Non-goal | 为什么 V1 不做 |
| --- | --- |
| OCR | 扫描质量、识别语言和错误处理会把本课变成另一类文档产品 |
| Multi-Agent | 当前研究任务尚未证明多个 Agent 比一个受限流程更有价值 |
| Team / RBAC | 多人协作会引入另一套权限与共享模型；先验证个人流程 |
| Browser Agent | 动态页面交互扩大权限和失败面，当前只需固定只读来源 |
| 任意网页抓取 | 难以控制来源质量、访问边界和恶意内容 |
| Mobile App | 主任务是阅读、核对与撰写，先交付 Web 工作台 |
| Payment | 还没有验证核心研究价值，不引入收费流程 |
| 复杂异步 Queue | V1 先保持任务量和执行边界可控，运行规模增长再评估 |
| Multi-model Router | 没有多模型效果或成本证据支持复杂路由 |
| Marketplace | 与个人研究主流程无关，还会增加供应方和审核问题 |
| Autonomous High-risk Writes | 写入必须经过准确展示和人工决定 |

你可以选不同的研究语境，但如果将 OCR 或 Team 放回 Must，要说出它怎样帮助这位主要用户完成 JTBD、会增加什么成本，以及从 V1 删去哪项来换取时间。

## 46～56 分钟：从任务画出页面，不从表名画页面

现在回到 `docs/user-flow.md`，画 After。先只画用户看得到的动作：

```text
Login → Workspace → Upload Knowledge → Create Research Task
                                      ↓
                              Start Research Run
                           ┌──────────┴──────────┐
                    Search Knowledge       Search External
                           └──────────┬──────────┘
                                   Evidence
                                      ↓
                          Citation-backed Report
                                      ↓
                            Review and decide
                                      ↓
                  Approve / Edit / Reject Note Proposal
                                      ↓
                           Knowledge Note（如批准）
```

一个 ResearchTask 是持续的目标，例如「研究 Agent Memory」。今天执行一次，明天资料更新后再执行一次，是两个 ResearchRun。这里先建立产品直觉；C2 才把它落实到数据模型。

给主路径加上失败分支：PDF 解析失败、证据不足、外部来源不可用、Run 被取消、笔记提案被拒绝。用户每次会看到什么、下一步能做什么？不要把失败简单画成一条通往「完成」的线。

由用户任务推页面，V1 一级导航是 Dashboard、Knowledge、Research、Runs；各自需要的详情页是 Knowledge Detail、Research Detail、Run Detail。Citation 应在报告里打开来源，不需要单独的 `/citations` 导航。当前也没有必须独立建 Settings 页的任务。

:::concept{title="页面服务用户任务"}
数据库里将来可能有 ResearchCitation、ResearchStep 等实体，但实体不等于一级页面。先让用户顺着「资料 → 研究 → 报告 → 核对」走通，再决定哪些详情需要展示。
:::

## 56～66 分钟：写一份能被检验的 Product Brief

你的项目已有 `docs/templates/product-brief.md`。将它复制到 `docs/product-brief.md`，填写 Problem、Target User、Current Workflow、JTBD、MVP、Non-goals、User Flow、Success Criteria、Open Questions。`docs/user-flow.md` 已有 Before；补完 After、失败分支与页面。最后在 README 顶部加一句你自己的产品定位。只改这三个交付文件，不需要把 Bootstrap 改成一个会运行研究的产品。

Success Criteria 不要写「AI 很智能」或「页面好看」。至少写到这些可检查的结果：

- **Product**：用户能从资料进入系统，发起研究，得到报告，查看引用，再决定是否保存。
- **Trust**：重要 Citation 能回到本次 Evidence；证据不足时不装作确定。
- **Security**：`cross_workspace_leaks = 0`，`unapproved_writes = 0`。
- **Reliability**：Run 成功、失败、取消、等待确认都有明确状态。
- **Delivery**：最终能部署、复现、演示并解释关键取舍。

这些不是声称今天已通过测试；C8/C9 会把它们变成真正的验收。现在先把「成功长什么样」写清楚，后面才知道该验证什么。

:::prompt{title="Prompt 3：审查 Product Brief"}

```text
请只审查我写的 Product Brief 与 User Flow，不写代码，不修改任何文件，也不要重写整篇文档。
Product Brief：[贴 docs/product-brief.md 内容]
User Flow：[贴 docs/user-flow.md 内容]

请用表格列出最多六处具体问题：位置、为什么影响产品决策、我应该自己回答的问题。
重点检查：Primary User 与 Problem 是否一致；JTBD 与 MVP 是否相连；MVP 与 Non-goals 是否冲突；AI、系统代码与人的职责是否清楚；失败分支是否可理解；Success Criteria 是否可验证。
不要把你猜测的用户事实写成已验证事实。最后指出一处你认为可以保留的决定及其依据。
```

:::

逐条判断 AI 的审查，不要一键接受。若它建议加团队权限，回到你的 Primary User 和 V1 Non-goals；若它发现「自动保存笔记」与「人工审批」冲突，就应修正。最终文档写你的决定，而不是 AI 的平均意见。

:::stuck{title="文档越写越像功能清单？"}
回到 Before，把每个 MVP 条目连到一个具体痛点或 After 步骤。连不上的先放 Later；不要靠增加技术名词让文档看起来更完整。若 AI 改写了整篇文档，要求它只列问题和证据，再由你亲自修改。
:::

## 66～75 分钟：检查这次产品决定，保存版本

打开三个交付文件，试着不用 RAG、Agent、MCP 这些词，用两句话说明用户、问题和 V1 范围。再检查模板提示有没有留空、Before/After 是否一致、Non-goals 是否真的写了取舍理由。不要把内部 Reference 的句子原样当成自己的研究场景。

在**自己的 Capstone 项目目录**运行：

```bash
git status
git diff
git diff --check
```

这次原则上只改变 `docs/product-brief.md`、`docs/user-flow.md` 和 `README.md`。如有其他改动，逐一解释。确认没有环境文件、API Key 或不相关业务代码后，保存一次版本，例如提交 `define research workspace product scope`。实际提交信息可以用你自己的话。

:::check{title="C1 完成后你能说清什么"}
- 谁使用这个产品、原来怎么研究，以及最痛的三处是什么。
- AI 帮助哪几步，系统和人各自保留什么决定权。
- V1 必须做什么、至少三个想做但暂不做的功能为什么被砍掉。
- 一次研究从资料到报告、引用检查和是否保存怎样流转。
- 哪些结果能在后续课程被真实验证。
:::

如果最后只能说「我用了 RAG、Agent、MCP」，请再回到 Problem 和 JTBD。C2 会从你今天的产品决定推导技术方案，并做出第一条可运行的竖切；今天的成果就是那条工程路线的起点。

:::deepdive{title="为什么 C1 不顺手把工程也搭完？"}
你已经学过技术能力，容易看到一个问题就开始建表或接模型。这次故意把产品决定单独留下版本：当 C3 的文件范围、C5 的 Agent 权限或 C7 的写入审批出现争议时，你能回到 Problem、JTBD、Non-goals 和 Success Criteria，而不是靠临时添加功能解决每个新想法。代码复用留给对应课程；产品边界必须由你自己建立。
:::
