# 服务端课程正文

正文文件仅由后端读取；不要放到 `public/`，不要从 `src/` 导入。

目录与 `src/data/courses.ts` 的课程一一对应。Stage 1（第 0 课及 1.1～1.6）和 Stage 2（2.1～2.8）正文已制作并发布。Stage 3（3.1～3.7，共 7 课）与 Stage 4（4.1～4.8，共 8 课）正文及配套 Reference 均已制作，仓库课程发布标记均为 `isPublished: true`。实际开放以运行数据库和后台状态为准。正式课程总数为 29。

每个文件使用 YAML frontmatter 与 Markdown 正文，按 [Lesson Renderer V2 规范](../docs/lesson-renderer-v2.md) 编写 H2 / H3 和 Concept、Task、Prompt、Check、Stuck、DeepDive 等教学块，不执行任意 MDX 或 HTML。正文变更通过文件维护，不提供 CMS 编辑器。

`checklist` 是任务文字，`checkKeys` 是对应的稳定标识。两者数量必须相同，标识必须唯一，格式为 `check-` 加 16 位十六进制字符串。调整文字或顺序时保留对应 key；添加新任务时使用新的 key；不要把已有 key 分配给另一个任务。数据库按用户、课时、key 单独保存勾选状态。

`npm run check:authored-content` 枚举所有已存在的课程正文，检查目录归属、YAML、教学块、Prompt 和全局唯一 checkKeys，不依赖发布状态。`npm run check:content` 单独检查已发布正文与数据库 catalogue、发布状态和预览策略是否同步。`npm run check:bundle` 检查构建的全部 JS / source map，确保付费正文和提示词没有打包进去。`verify` 与 `check` 均运行 authored 校验。

第 0 课与 1.1 按现有免费体验策略，1.2～1.6 沿用 Stage 1 付费权限；Stage 2 使用独立 Stage 2 entitlement；Stage 3 使用独立 Stage 3 entitlement，不要求 Stage 2 entitlement。当前 Stage 3 价格为 269，价格源头仍以 `src/data/courses.ts` 为准。ACTIVE 登录且有 ACTIVE Stage 3 entitlement 的学员可下载 Stage 3 Starter，独立于 Stage 1 Starter 的现有权限。部署新增已发布正文时运行 `npm run db:seed` 同步目录标记，再运行 `npm run check:content`。

Stage 4 使用独立 Stage 4 entitlement；ACTIVE 登录且拥有 ACTIVE Stage 4 entitlement 的学员可下载 Stage 4 Starter，不要求同时拥有 Stage 3 entitlement。环境信息统一链接 `/environment`，正文不重复维护推荐模型名或工具下载地址。Stage 3/4 开发 Prompt 使用练习骨架与折叠参考答案，技术和安全边界不可因练习形式而删减。

工程思维训练的作者底稿见 [工程任务单](../docs/templates/engineering-task-sheet.md)，审查与修订依据见 [V1.1 优化报告](../docs/teaching-optimization-v1.1-report.md)和 [V1.2 收尾报告](../docs/teaching-optimization-v1.2-report.md)。学生所需格式直接放在 1.6、2.8、3.7、4.7 页面，不要求访问内部 docs；4.8 复用原演示稿，Capstone 复用现有产品定义、ADR、评估与复盘。Stage 2 的基础分工判断、Stage 3 的固定题分析和 Stage 4 的安全边界解释融入原总结／评估；V1.1 全栈实操、三题探索、自主失败实验仍为进阶选做。不新增进度键，不替代原验收或固定基准，不重复填写任务单或机械复制到每课。

P1 操作说明的公共回链为 `/environment#console`、`#network`、`#accounts`。Stage 2/3/4 验收工具使用各自 `stage2-tools`、`stage3-tools`、`stage4-tools` 固定资源 ID，按对应阶段独立权益下载；只包含 `course-tools/` 白名单中的工具脚本和 README，不包含完成应用、测试秘密或评估案例答案。`npm run build:starter` 同时生成三份 `course-tools/aifoundry-stageN-tools.zip`，`check:starter` 检查字节一致性。部署需携带这些 ZIP 与原 Starter ZIP，不放进 `public` 或前端 bundle。独立 Node 入口加载项目实际本机环境，再加载被 Git 忽略的 `.env.course-checks`；详细报告仅放被忽略的 `.runtime`。双账号配图明确标为 AI 生成的概念示意，不作为真实界面截图。

Stage 2 工具还包含 s2-l7 隔离故障辅助：`fault-project.mjs` 在当前项目的 `.runtime/s2-l7-fault-demo` 建立代码快照，以同一学习库的新随机 schema 应用已有三次迁移，不复制原秘密配置、不覆盖已有副本；仅允许在匹配标记的副本改名／恢复 Resource 表。`fault-proxy.mjs` 只监听本机 3007，转发副本 3008，以真实响应演示延迟、保存后读取失败和正文中断；先校验 Origin 后转换到内部应用地址，保留 Session 与 ownerId 保护。正文中断先发送响应头，避免 Chromium 自动重发 POST。工具不清库、不删除目录，结束必须恢复表并停止自己的服务。详细操作与恢复方法在 s2-l7，维护时同步 Stage 2 README 和固定 ZIP 白名单。

技术备注与术语预告按统一格式维护：当前课先写可执行动作、可见结果和验收边界，再将代码名称、字段／协议规格放入 `:::deepdive{title="给 AI 的技术备注：…"}`。开头说明实现名称可照抄给 AI，但测试、拒绝条件和真实证据仍需完成；不把操作命令、成功标志或安全要求全部藏入折叠块。未来才用的术语使用 `:::concept{title="术语预告：…（具体课号／进阶范围）"}`，给出白话含义、何时使用和本课停止位置；当前正在验收的能力不能用“现在不用懂”跳过。未经课程实现的后台执行、多实例等要写成明确限制，不写成已具备能力。

s4-l8 课首和 objective 同时区分真实上线与 `deployment-ready only`，共用本机测试、生产构建、固定 Eval 和安全门槛。后者必须明确未上线、待配置项和未验证的云端检查，不伪造 URL、Smoke 或勾选状态；正文保留真实 HTTPS、数据库迁移、Preview／Production 隔离和审批／恢复／重复确认验收。Secret 名称须对照实际实现：审批为 `AGENT_APPROVAL_SECRET`，MCP 鉴权为 `MCP_AUTH_SECRET`。
