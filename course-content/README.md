# 服务端课程正文

正文文件仅由后端读取；不要放到 `public/`，不要从 `src/` 导入。

目录与 `src/data/courses.ts` 的课程一一对应。**目前正式正文为 `stage-1/s1-l0.md`（第 0 课）、`stage-1/s1-l1.md`～`stage-1/s1-l6.md`（1.1～1.6）及 `stage-2/s2-l1.md`～`stage-2/s2-l8.md`（2.1～2.8）**；Stage 3 起尚未制作，对应课程在 courses.ts 中标记 `isPublished: false`，属于正确的占位状态，不要为「填满网站」批量生成低质量正文。

每个文件使用 YAML frontmatter 与 Markdown 正文，按 [Lesson Renderer V2 规范](../docs/lesson-renderer-v2.md) 编写 H2 / H3 和 Concept、Task、Prompt、Check、Stuck、DeepDive 等教学块，不执行任意 MDX 或 HTML。正文变更通过文件维护，不提供 CMS 编辑器。

`checklist` 是任务文字，`checkKeys` 是对应的稳定标识。两者数量必须相同，标识必须唯一，格式为 `check-` 加 16 位十六进制字符串。调整文字或顺序时保留对应 key；添加新任务时使用新的 key；不要把已有 key 分配给另一个任务。数据库按用户、课时、key 单独保存勾选状态。

`npm run check:content` 检查目录、数据库元数据、全部内容结构与任务键。`npm run check:bundle` 检查构建的全部 JS / source map，确保正文和提示词没有打包进去。

第 0 课与 1.1 是免费体验，1.2～1.6 沿用 Stage 1 付费权限；2.1～2.8 使用独立的 Stage 2 付费权限。部署新增正文时运行既有 `npm run db:seed` 同步目录标记，再运行 `npm run check:content`；无需修改权限或进度架构。
