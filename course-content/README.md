# 服务端课程正文

正文文件仅由后端读取；不要放到 `public/`，不要从 `src/` 导入。

目录与 `src/data/courses.ts` 的课程一一对应。Stage 1（第 0 课及 1.1～1.6）和 Stage 2（2.1～2.8）正文已制作并发布。Stage 3（3.1～3.7）正文已制作，当前七课仍为 `isPublished: false`；Stage 4 尚未制作，保持占位。正式课程总数为 29。

每个文件使用 YAML frontmatter 与 Markdown 正文，按 [Lesson Renderer V2 规范](../docs/lesson-renderer-v2.md) 编写 H2 / H3 和 Concept、Task、Prompt、Check、Stuck、DeepDive 等教学块，不执行任意 MDX 或 HTML。正文变更通过文件维护，不提供 CMS 编辑器。

`checklist` 是任务文字，`checkKeys` 是对应的稳定标识。两者数量必须相同，标识必须唯一，格式为 `check-` 加 16 位十六进制字符串。调整文字或顺序时保留对应 key；添加新任务时使用新的 key；不要把已有 key 分配给另一个任务。数据库按用户、课时、key 单独保存勾选状态。

`npm run check:authored-content` 枚举所有已存在的课程正文，检查目录归属、YAML、教学块、Prompt 和全局唯一 checkKeys，不依赖发布状态。`npm run check:content` 单独检查已发布正文与数据库 catalogue、发布状态和预览策略是否同步。`npm run check:bundle` 检查构建的全部 JS / source map，确保付费正文和提示词没有打包进去。`verify` 与 `check` 均运行 authored 校验。

第 0 课与 1.1 按现有免费体验策略，1.2～1.6 沿用 Stage 1 付费权限；Stage 2 使用独立 Stage 2 entitlement；Stage 3 使用独立 Stage 3 entitlement，不要求 Stage 2 entitlement。当前 Stage 3 价格为 269，价格源头仍以 `src/data/courses.ts` 为准。ACTIVE 登录且有 ACTIVE Stage 3 entitlement 的学员可下载 Stage 3 Starter，独立于 Stage 1 Starter 的现有权限。部署新增已发布正文时运行 `npm run db:seed` 同步目录标记，再运行 `npm run check:content`。
