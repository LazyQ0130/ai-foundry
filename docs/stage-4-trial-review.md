# Stage 4 试学反馈（学员视角，只读审查，未改动任何课程内容）

日期：2026-10-03。范围：`course-content/stage-4/s4-l1～l8.md` 全文、`starter/stage-4/`、`course-content/internal/stage-4/`、
`docs/stage-4-*.md`、`src/data/courses.ts`、`scripts/check-*.ts`。

试学方式：读完 8 篇正文；逐个核对 Starter 代码与正文口径；按 README 把 Starter 真实跑起来走一遍；
跑内容检查脚本。**没有修改任何课程、代码或配置文件。**

---

## 一、总体结论

技术层面经得起核对，作者验收记录也很扎实。问题几乎全部集中在**"零基础学员照着做会不会卡住"**这一层：
正文残留了一批只有作者懂的内部工程术语，缺排障支线，个别跨课指示对学员不可执行。

按"会不会真的卡住人"排，下面第三节是 P0/P1，第四节是小口径问题。

---

## 二、我实际验证过的事实（先说对得上的）

| 正文口径 | Starter / 实现 | 结论 |
|---|---|---|
| Prisma 四次迁移 | `starter/stage-4/prisma/migrations/` 恰好 4 个 | 对 |
| 每用户每分钟 5 次 HTTP guard | `lib/request-work-budget.ts` `maxAttempts = 5` / 60s | 对 |
| 每用户每分钟 10 个 Provider units | `lib/provider-work-budget.ts` `providerUnitLimit = 10` | 对 |
| `retrieveTopK` 的 LIMIT 3 | `lib/knowledge-retrieval.ts` `ragTopK = 3` | 对 |
| owner / ready / model / dimension 在 SQL 的 ORDER BY 与 LIMIT **之前**过滤 | 同上，条件全在 WHERE | 对 |
| 1024 维、`text-embedding-v4`、`qwen3.7-flash` | `.env.example` + `compose.yaml` | 对 |
| 默认 `AI_PROVIDER_MODE=mock` | `.env.example` | 对 |
| 20 主案例 / 73 子案例 | 脚本实数：functional 21 + reliability 14 + safety 38 = 73；主案例 20 | 对 |
| 未发布课的 checkKeys 有守护 | `check:authored-content` 通过：30 篇 / 149 唯一 checkKey | 对 |

**真跑结果（我按 README 从头走了一遍）**：4 次迁移全部应用成功 → `next dev` 起来 → 注册登录 201 →
Mock 普通问答返回 `kind: mock` → 建知识文档 `status: ready` / `chunkCount: 1` / `dimension: 1024` →
RAG 问答返回 `status: answered` + 引用。**Starter 交付物本身是完整可用的。**

---

## 三、会被卡住的问题

### P0-1　学过 Stage 3 的学员，第一分钟就会在 `docker compose up -d` 失败（已实测）

- `starter/stage-3/compose.yaml` 与 `starter/stage-4/compose.yaml` **用同一个主机端口**：
  都是 `127.0.0.1:55433:5432`。
- 而 4.1 开头写"Stage 4 可以独立购买……你已有完整的 Stage 3 完成项目，也可以沿自己的版本继续"，
  courses.ts 里 Stage 4 的 `recommend` 也正是"完成 Stage 3 阶段自检"。也就是说，
  **正常路径上的学员，本机很可能还留着 Stage 3 的容器。**
- 实测（本机 `stage-3-db-1` 容器在运行时，在 `starter/stage-4/` 执行 `docker compose up -d`）：

  ```
  Error response from daemon: failed to set up container networking:
  Bind for 127.0.0.1:55433 failed: port is already allocated
  ```

- README 和 4.1 正文都**没有任何提示**。这句报错对零基础学员基本等于天书——他不知道这是"你上一阶段的容器还开着"。
- 连锁影响：4.7 正文又把 `127.0.0.1:55433/stage4_l7` 写死。如果学员为了绕开冲突把 compose 端口改成了别的，
  4.7 给的地址就会跟着错。

**建议**：README「第一次启动」加一条：若本机还跑着 Stage 3 的数据库容器，
先 `docker compose down`（在 Stage 3 目录）或把 Stage 4 端口改成别的；4.7 里也交代端口来源。

### P0-2　4.6 有两句话写进了"要复制给 AI 的 Prompt"里，学员会原样发给 AI

4.6 第一个 Prompt（`s4-l6.md:26`）：

> "……只在 **4.6 Reference overlay** 增加第五次 Prisma migration……"

4.6 确认段 Prompt（`s4-l6.md:74`）：

> "……关闭公开的旧 V1 可确认写路径，**历史 4.3 Reference** 和课程不要改。"

"Reference overlay""历史 4.3 Reference"是作者内部装配术语，学员的 AI 编程工具完全无法解析，
只能瞎猜——而第二句里的"关闭旧路径"这种指令，一旦被误解成"删代码"，后果不小。

**与之同类的还有**（这几处在正文结尾，学员同样可能整段复制）：`s4-l3.md:103`「增量 Reference、装配器、验收记录」、
`s4-l4.md:95`「4.4 Reference」、`s4-l5.md:99`「4.5 装配」、`s4-l6.md:103`「A/B Reference」、
`s4-l7.md:91`「A/B 构建」、`s4-l8.md:81`「装配 4.8 A/B」，以及 `s4-l7.md:10` checklist 里的「已完成 A/B」。

### P1-3　4.7 让学员"新建隔离数据库 stage4_l7"，但没有任何一步教他怎么做

4.7 正文（`s4-l7.md:23`）只说：

> "在本机新建隔离 PostgreSQL 数据库 `stage4_l7`，把不提交的 `TEST_DATABASE_URL` 指向
> `127.0.0.1:55433/stage4_l7`，部署已有五次 migration。"

但：
- `compose.yaml` 只自动创建 `stage4_learning`，`stage4_l7` **不存在**，需要学员自己 `CREATE DATABASE`；
- `TEST_DATABASE_URL` **不在** `.env.example` 里（只有 `DATABASE_URL`）；
- "部署已有五次 migration"用什么命令、指向哪张库，正文没给。

作者自己在验收记录里用的是 `stage4_l7` / `stage4_l8` 这样的库（见 `stage-4-l7/l8-validation.md`），
但那是作者环境，学员没有这些上下文。这是本阶段最"黑盒"的一步。

### P1-4　4.3 里混进了"补上一课测试"的内部补丁

4.3 的 Prompt（`s4-l3.md:82`）要求 AI：

> "再补一条 **4.2 fail-closed 单测**：`search_knowledge` 已启用且 `userId` 有效，
> 但调用 `runAgent` 时漏传 `reserveEmbedding`，应返回 `budget_exhausted`……"

这是作者在改 4.2 时顺手打的一个内部补丁，被原样写进了 4.3 的教学 Prompt。
学员读到会问"我明明在做 4.3，为什么要补一条 4.2 的测试？"——**内部工程痕迹混进了教学内容**。

---

## 四、教学呈现层面的问题

### P2-5　Stage 4 是唯一一个 concept / deepdive / stuck 全为零的阶段

八个阶段正文的教学块统计（`course-content/stage-*/*.md`）：

| 阶段 | prompt | check | concept | deepdive | stuck | warning |
|---|---:|---:|---:|---:|---:|---:|
| Stage 1 | 11 | 9 | 7 | 9 | 7 | 1 |
| Stage 2 | 29 | 13 | 8 | 6 | 58 | 4 |
| Stage 3 | 13 | 9 | 5 | 3 | 8 | 3 |
| **Stage 4** | **26** | **13** | **0** | **0** | **0** | **1** |

Stage 4 是难度最高（courses.ts 标 `difficulty: '高级'`）、概念最密（Agent Loop、工具契约、HMAC 签名、
幂等键、Run 状态机、MCP 协议、注入防御）、密钥与成本风险最大的阶段，却是**唯一一个连一个
`concept` / `deepdive` / `stuck` 块都没有的阶段**。

结果就是：学员一旦撞上"Docker 起不来""migrate 报错""刷新后实验区没出现""AI 生成的代码跑不通"，
正文里没有任何可查的支线（全阶段只有 4.1 有一句"如果实验区没出现，先检查开发服务器和改动是否保存"）。
26 个 prompt vs 0 个讲解块，整门课是"把 Prompt 丢给 AI → 看结果 → 读一小段解释"的节奏，
对已经会写代码的人够用，对课程定位的"大学生 / 初级开发者"偏薄。

**建议**：至少给每个高风险操作配一个 `warning`（HMAC Secret 生成、MCP Bearer、第五次 migration、隔离库），
给 MCP / HMAC / 幂等键各配一个 `concept`，入口处（4.1、4.7）配 `stuck`。

### P2-6　"先看到结果"的节奏，对纯零基础会变成"先看到一堵墙"

4.1 第一个 Prompt 一次要求 AI 在 5 个层面同时动刀（Tool Registry / Mock model / agent-runtime /
Route / 首页 UI 组件），约 400 字。作者的验收记录里，A/B 都是**自己手写装配**并逐项验收的；
课程形态假设"学员把 Prompt 丢给 AI 编程工具就得到能跑的代码"——这个假设目前**没有任何真实学员验证过**。

这不是要改形态，而是建议在 4.1 明确写一句"AI 一次没做对是正常的，按报错逐步让 AI 修"，
降低第一次就卡死的挫败感。

---

## 五、小口径问题

1. **4.2 的返回值描述比实现少**（`s4-l2.md:30` vs `internal/stage-4/s4-l2/common/lib/knowledge-search.ts:22-28`）。
   正文说"每项仅含 title、position、最多 160 字符的 preview、similarity"，实际实现是
   `preview: slice(0, Math.min(160, Math.floor(len * 0.75)))`（**另外还砍 25%**）、
   `title: slice(0, 120)`、`similarity` 保留 3 位小数——正文都没提。
   短资料（<213 字）时 preview 会明显短于"160"，学员对照 checkpoint 时会疑惑。
2. **课时合计口径偏乐观**。8 课 frontmatter 相加是 11.75h（最快）～14.5h（最慢），
   蓝图写"约 12～15 小时"，`courses.ts` 写 `totalDuration: '约 12 小时'`——取了最乐观的下限。
3. **隔离库命名不统一**。4.7 让学员建 `stage4_l7`；4.8 正文只说"专用隔离库"，
   而作者 4.8 验收记录里用的是 `stage4_l8`。

---

## 六、做得好的地方（这阶段不是"问题多"，是"缺打磨"）

- **技术口径零偏差**。第二节那张表我逐个对过 Starter 源码，没有一处对不上；
  "owner 过滤在 SQL 的 Top-K 之前"这个最核心的隔离声明，代码成立。
- **4.7 的三个安全硬门槛**（`cross_user_leaks` / `unapproved_writes` / `duplicate_confirmed_writes` 必须为 0、
  不被通过率平均掉）是本阶段最有价值的教学设计，20/73 的案例矩阵也真实成立。
- **教学诚实度很高**。4.3 主动把"纯 HMAC 可重放"标成 `CURRENT KNOWN LIMITATION`、
  4.6 明确"业务幂等 ≠ 全系统 exactly-once"、4.8 如实写 `deployment-ready only` 而不编造 URL。
  这在讲安全的课程里很少见，是加分项。
- **配图问题没复发**。8 张教学图全部落地（`public/course-media/stage-4/`，每张 1MB+ 生图风格）。
- **Starter 实测可跑**，且 `check:authored-content` 已能把未发布的 Stage 4 正文
  （40 个 checkKey）纳入守护——阶段三遗留的"未发布无守护"在这一阶段解决了。

---

## 七、建议优先级

| 优先级 | 事项 |
|---|---|
| P0 | 端口冲突提示（README + 4.1）；4.6 两处写进 Prompt 的 "Reference overlay / 历史 4.3 Reference" |
| P1 | 4.7 补"怎么建隔离库 / 配 TEST_DATABASE_URL / 部署迁移"；清理其余 8 处黑话；4.3 移出"4.2 补测"内部补丁 |
| P2 | 补 concept / stuck / warning 块；4.2 返回值描述与实现对齐；课时口径统一 |
