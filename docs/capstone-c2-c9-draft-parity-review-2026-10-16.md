# Capstone C2 / C9 正式稿与内部草稿差异审查

审查日期：2026-10-16。基线：`1d58a422d8134447941ab1f55f13496399275650`，本地 `main` HEAD 与该提交一致，开始时工作区干净。结论：关键教学内容差异已补入内部草稿，静态一致性与既有课程检查通过；运行、云部署和真实学员验证本轮未执行。

## 1. 范围与依据

完整比对以下两组文件，包含 frontmatter、全部正文、命令、提示词、教学指令块与验收要求：

- [C2 正式稿](../course-content/capstone/c2.md) / [C2 内部草稿](../course-content/internal/capstone/c2/lesson-draft.md)
- [C9 正式稿](../course-content/capstone/c9.md) / [C9 内部草稿](../course-content/internal/capstone/c9/lesson-draft.md)

主要依据是本次基线的正式课程。辅助核对 Starter 的 `docs/local-environment.md`、`compose.yaml`、`scripts/init-local-env.mjs`，C9 overlay 的 Dockerfile、部署 runbook，以及课程解析、渲染和发布检查器。这里只核对仓库已有契约，不重新认定参考依赖版本在今天仍然安全。

## 2. 全量差异与处置

下表按教学行为分组，共 C2 三项、C9 五项；不是按 Git diff 的上下文块计数。基线中未发现内部草稿独有的研发段落；除下表内容外，两组文件的其余文本一致。

| 项目 / 正式稿位置 | 基线草稿差异 | 可能造成的理解偏差 | 处置 |
|---|---|---|---|
| C2「先把本地数据库跑起来」：环境前置检查 | 缺少 Docker 用途、安装指南入口、Client/Server 判据和环境阻断处理 | 把 CLI 已安装当成引擎可用；无权限或 WSL 失败仍继续；误用 Stage 3 云库替代完整隔离环境 | 同步整段；环境未就绪时只继续 Domain Map，运行验收保持未完成 |
| C2 同节：执行目录 | 缺少自己 C1/Capstone 根目录的文件判据与多终端入口 | 在平台仓库或错误窗口运行初始化与 Compose | 同步 `package.json`、`compose.yaml` 判据和 `/environment#terminals` 链接 |
| C2 同节：失败、暂停与恢复 | 缺少逐条停止排错、原凭据核对及 stop/up 恢复 | 失败后继续迁移；重生成密码；删卷/reset 造成数据丢失 | 同步失败分类、保留凭据和数据卷的恢复方法 |
| C9「依赖修复与环境隔离」：审计解释 | 只保留简短 direct/transitive 等术语；缺目录、报告入口、退出码与脱敏说明 | 混淆过期与漏洞；把网络失败当零漏洞；误认受影响包数量就是根因数量 | 用正式稿扩展说明替换旧简述；保留历史数字及“运行当天结果为事实”的限定 |
| C9 同节：overrides 与路径识别 | 缺少定义、`npm explain` / `npm ls`、未安装包的处理和官方规则入口 | 为对齐参考答案添加无关依赖；把安装成功当成兼容或安全 | 同步说明和只读命令；不修改任何依赖版本或锁文件 |
| C9 同节：升级与回滚 | 缺少保存点、单根因修改、重验及定点恢复流程 | 连续升级失去归因；手删锁文件；回退整个项目；审计绿灯替代功能回归 | 同步源码保存、配置备份、npm 更新、恢复两份依赖文件及 `npm ci` 的顺序 |
| C9「做出真正可运行的容器」：准备条件 | 缺少 C2 运行预制服务与 C9 构建应用的区别、Docker Server 前置检查 | 把宿主机构建通过当成容器验收 | 同步用途说明与环境阻断条件 |
| C9 同节：构建、启动、恢复与成功标志 | 缺少双 target 命令、提交标签、runbook 启动核对、容器地址与 guard、logs/stop/start、镜像回滚和成功判据 | 猜 target；原样执行占位符；容器内使用宿主机 loopback；绕过隔离；把 health 当完整交付 | 同步完整步骤和验收说明，保留按学生 ADR/平台确定启动命令的方式，不硬编码通用 `docker run` |

这些差异均改变操作前提、步骤、失败处理或证据判据，属于应同步的教学内容。没有仅为文风统一而改写其他段落。

## 3. 允许保留的研发说明

下列材料保留原样，作为有日期和环境范围的研发记录，不复制进学生正文，也不改写为本轮实测结果：

- [C2 作者验证](capstone-c2-validation.md)：2026-10-08 的独立验证库端口 55434、历史依赖审计数字、Internal/locked 等当时状态。当前学生环境以 Starter 的开发库 55439、Eval 库 55440 为准。
- [C9 作者验证](capstone-c9-validation.md)：2026-10-08 的独立测试库 55441、当时的 180～240 分钟估时、Internal/locked 状态、镜像体积、审计和 smoke/Eval 结果。当前课时为 360～600 分钟，历史报告不作为当前课程元数据。
- C2 架构决策、C2/C9 overlay 实现、C9 依赖整改和部署证据文档：保留作者选型、参考工件和已有证据边界；不以内部 Reference 的结果代替学生项目结果。

历史说明可能与当前发布状态不同；这属于证据时点和使用对象的区别。`scripts/check-capstone-publishing.ts` 要求正式课文与审核草稿逐字节一致，并阻止作者发布流程进入学生正文，因此研发记录继续留在独立文档中。没有用统一历史报告的方式扩大本次范围。

## 4. 补丁与不变项

课程修订仅涉及两份内部 `lesson-draft.md`：C2 新增 6 行；C9 新增 32 行、删除 1 行旧简述。另新增本审查报告。两份正式稿、Starter、overlay、代码、依赖、数据库和发布配置未改动。

保持不变的契约包括：

- 两课全部 frontmatter，包括 objective、difficulty、estimatedTime、checklist 和 checkKeys；C2 的 6 个 key/5 个提示词，C9 的 7 个 key/7 个提示词；所有原有 `:::check` 块。
- C2 只实现 User、Session、Workspace、ResearchTask；注册事务、唯一 owner、服务端 Session→Workspace 归属、严格输入、Alice/Bob/匿名/跨来源隔离，正式 migration；不引入文件、RAG、Agent 或团队权限。
- C9 High/Critical 阻断、Moderate 明确处理；generate/migration/HTTP/Eval 等回归要求；不执行 `audit fix --force`。参考版本保留其历史语境。
- Docker 构建不注入生产 Secret、不做 migration；runtime/release 职责、非 root、PORT、`.dockerignore`；发布仍按 build→backup/verify→migrate deploy once→status→deploy→smoke。
- Local/Test-Eval/Staging/Production 隔离、DB guard、1024 维、独立安全 Secret、私有存储和人工审批。stale Run 十分钟复核、fail closed、幂等、不 Resume、不批准 Action、不创建 Note。
- C8 完整矩阵、Hard Gates 与 baseline；受控 real smoke 的显式授权及预算；本地、Staging 与 Production 证据分开，云未验证不能宣称 Production Ready。无 queue/worker/OCR 等新范围。

可在仓库根目录生成仅含两课修订的补丁（报告不在其中）：

```powershell
git diff --output=.runtime/capstone-c2-c9-drafts.patch -- course-content/internal/capstone/c2/lesson-draft.md course-content/internal/capstone/c9/lesson-draft.md
```

## 5. 本轮验证与结果

| 验证 | 结果与含义 |
|---|---|
| 全文 diff、修订后 Buffer 字节比较 | PASS：C2/C9 正式稿与对应草稿均完全一致，没有残留差异 |
| 对照基线正式稿 | PASS：正式稿内容未变；比较时仅归一化 Git 检出换行 |
| 对照基线草稿 frontmatter、全部 prompt/check 块 | PASS：元数据、提示词及原有验收块未变 |
| `npm run check:capstone-c2` | PASS：解析、稳定 key/提示词、ownership 与 C3 范围检查 |
| `npm run check:capstone-c9` | PASS：解析/SSR、稳定 key/提示词、交付工件和安全契约静态检查 |
| `npm run check:capstone-release` | PASS：九课渲染、56 个可复制提示词、61 个 Capstone key、2130～3480 分钟总课时 |
| `npm run check:capstone-publishing` | PASS：九课正式/草稿字节一致、目录元数据、61 个稳定 key、Starter 白名单与当前已开放状态 |
| `npm run check:authored-content` | PASS：Stage 和 Capstone 内容/唯一 key 检查 |
| Starter 与 C9 参考工件交叉核对 | PASS（静态）：本地端口/服务、凭据保留脚本、双 target、部署顺序与恢复边界有对应依据；环境页存在 terminals/reports 入口 |
| `git diff --check` | PASS：无空白错误；Git 的 LF→CRLF 提示属于仓库换行配置提示 |
| 导出补丁的正向/反向可应用性 | PASS：`git apply --check --cached .runtime/capstone-c2-c9-drafts.patch` 对基线索引通过，`git apply --check --reverse` 对修订后草稿通过；均只检查，未应用或暂存 |

既有检查器包含静态源码断言；检查通过不代表本轮执行了它们提到的 DB、HTTP、Docker 或 Eval。没有运行 `npm ci`、依赖升级、付费 Provider、真实 smoke、数据库迁移或云部署，也未重新执行历史验证报告中的命令。本次为 Markdown 教学修订，使用上述相关检查；未扩展到全站构建和全站测试。

## 6. 后续实操与真实学员验证方法（本轮均未执行）

以下用于验证课程引导是否足够清楚，不是本轮已经通过的验收。每项记录日期、环境、项目 SHA/镜像、脱敏命令与退出状态、可观察结果；未运行明确写 NOT RUN/NOT VERIFIED。

| 场景 | 方法 | 通过判据 |
|---|---|---|
| C2 安装与目录 | 学员按第 1 节检查 Docker/WSL/Compose/Node，在自己的 C1 项目核对根目录文件；引擎未启动时观察是否停在前置条件 | 能区分 Client/Server；找对项目；环境受阻不会宣称数据库验收完成 |
| C2 DB 首次启动与恢复 | 在独立课程环境逐条执行初始化、up、pg_isready 和扩展可用性查询；创建合成账号/Task 后 stop/up，刷新读取；在隔离环境观察一次启动失败后的排错选择 | 两库就绪，vector 0.8.6 可用但 C2 不提前启用向量功能；原凭据、账号与 Task 保留；不删卷、不 reset、不覆盖环境文件 |
| C2 端到端与边界 | 空的独立测试库部署正式 migration，运行 lint/typecheck/tests/build/HTTP；完成 Alice/Bob、匿名、伪造归属和跨来源实验 | 四表/约束符合原契约，刷新仍在、Bob 不可见、非法写入被拒；不能只用前端显示当证据 |
| C9 审计与恢复 | 运行两种 audit、outdated、explain/ls；区分漏洞输出与 registry 故障；在有保存点的独立副本中处理一个根因，再演练只恢复依赖配置和锁文件 | 能解释直接/间接路径及 override 风险；原源码保留；目标安装版本、审计门槛及全部功能回归都有证据；网络失败不记 PASS |
| C9 容器与排错 | 核对 target/占位符后构建双镜像，按 ADR/runbook 启动；检查容器内 health、登录、Task、真实 PDF；通过本机脱敏日志定位一次隔离环境启动错误并 stop/start | 标签可追溯；配置/网络与 guard 一致；health 之外的功能实测成立；不清库、不停其他项目、不用付费重试代替排错 |
| C9 恢复、发布与质量门 | 在独立 DB 验证 stale/fresh/recent/completed、dry-run/apply/重复/并发与审批不变；按发布顺序验证 migration/vector/scoped retrieval；运行完整 C8 gate | fail closed 且幂等，无 Note 副作用；原 Hard Gates/baseline 不回退，完整矩阵通过，备份/镜像回滚只在演练后标通过 |
| C9 云与真实 smoke | 平台可用且显式 opt-in 后，分开执行 Staging full/Production safe smoke；真实浏览器验证 HTTPS、CORS、private upload/source，保留预算 | 不能拿 localhost/静态 checker/作者历史结果替代；云缺项保持 NOT VERIFIED，不宣称 Production Ready |

真实学员验证须让目标学员在独立项目中实际跟做，观察其是否能找到目录、理解前置条件、停在失败步骤、选择恢复动作并解释验收证据；记录卡点、求助和结果。维护者跑通同样命令属于工程实操验证，仍不能代替学员理解验证。

本轮能够确认的是：两套材料对关键教学行为的表述一致，既有静态课程契约保持通过。不能据此认定原正式课有运行故障，也不能宣称教学有效性或生产可用性已获真实验证。
