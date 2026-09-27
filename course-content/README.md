# 服务端课程正文

正文文件仅由后端读取；不要放到 `public/`，不要从 `src/` 导入。

目录与 `src/data/courses.ts` 的课程一一对应。**目前只有 `stage-1/s1-l0.md`（第 0 课）和 `stage-1/s1-l1.md`（1.1 黄金样板课）是正式编写的正文**；1.2～4.8 尚未制作，对应课程在 courses.ts 中标记 `isPublished: false`，属于正确的占位状态，不要为「填满网站」批量生成低质量正文。

每个文件包含 Markdown 标题和一个 `json` 代码块，代码块使用原有三栏课程页面的数据结构，包含 Task、Prompt、Check、Stuck、DeepDive 等内容。这样可以继续使用现有 React 组件渲染，不执行任意 MDX 或 HTML。正文变更通过 Git/文件维护，不提供 CMS 编辑器。

`checklist` 是任务文字，`checkKeys` 是对应的稳定标识。两者数量必须相同，标识必须唯一，格式为 `check-` 加 16 位十六进制字符串。调整文字或顺序时保留对应 key；添加新任务时使用新的 key；不要把已有 key 分配给另一个任务。数据库按用户、课时、key 单独保存勾选状态。

`npm run check:content` 检查目录、数据库元数据、全部内容结构与任务键。`npm run check:bundle` 检查构建的全部 JS / source map，确保正文和提示词没有打包进去。

迁移保持了原始教学内容：目前 `stage-2/s2-l3.md` 是专门编写的 API 课程，其余 21 节仍是原 Demo 的结构化示例，需要运营方在正式售课前完成教学编写。发布、停售和试看标记可在后台课程管理中调整。默认没有试看课。
