# 1.2 课程与技术验证

日期：2026-09-27。正文：`course-content/stage-1/s1-l2.md`。

## 内容依据与范围

完整读取下载目录中的《AIFoundry_课程内容总纲与编写规范_V1.3_定稿版.docx》、第 0 课、1.1、Stage 1 Starter 的页面/数据/组件/配置，以及 `docs/lesson-renderer-v2.md`。母文档最新版按文件名、正文版本和修改时间核对。

本轮新增 1.2 正文与五个独立 checkKeys；在 `src/data/courses.ts` 只把 1.2 设为已发布，沿用非 Preview 的 Stage 1 权限。同步课程目录说明及受发布状态影响的既有测试；没有修改 Auth、Entitlement、Pricing、Progress、Dashboard、Renderer 或下载系统实现。

正文先让学生分析模糊需求中需要猜测的部分，再观察真实项目、认识功能/状态/事件、自己补全需求，最后实现和交叉点击。未要求模糊请求必须失败。自由练习三选一，最低完成要求是独立描述需求与检查例子，额外实现可选。

## Starter 与版本判断

原始数据已有 `important: boolean`，id 1、2、7 为 true；卡片已用该字段显示星标。Excalidraw 为 false。首页已有 query / activeTag 两个 useState 和组合 filter，无重要筛选入口。

**Starter 源文件与交付 ZIP 均不变。** 不提前交付本节答案，不增加字段、依赖或状态库。

正文明确继续使用学生完成 1.1 的项目；1.1 的文案、颜色修改不构成 1.2 的功能前提。也明确允许从第 0 课下载的原始 Starter 开始。当前无需 1.2 起点快照、Stage release snapshot 或新分发系统；后续课程出现真实数据/功能依赖时再评估。

## Prompt 实做记录

1. `npm run check:starter` 确认当前 ZIP 与源码一致。
2. 将当前 ZIP 解压到 `.runtime/s1-l2-qa/clean/aifoundry-stage1-starter`，没有预先复制最终实现。
3. 在干净副本运行 `npm install`：102 个包，0 vulnerabilities。环境 Node.js v24.16.0、npm 11.13.0。
4. `npm run dev -- --hostname 127.0.0.1 --port 3122` 启动成功；浏览器先看到原始 9 条资料，没有新控件。
5. 当前 Codex 读取副本首页、数据、卡片，按正文「实现只看重要资料」请求实施；请求原文另存 `.runtime/s1-l2-qa/prompt.txt`。仅在副本 `app/page.tsx` 新增 onlyImportant 默认 false、复选框 onChange，以及与现有条件组合的 matchImportant。
6. 浏览器实际点击以下全部操作，逐次核对卡片标题，不只运行静态断言。

这是当前 Codex 的一次按文中请求实做，**不是另一名独立 Agent 的盲测，也不是 WorkBuddy / Cursor 的多轮稳定性测试**。正文没有把它描述成真实学员试学；25～35 分钟为教学设计估计，尚无新手用时数据。

## 浏览器操作结果

| 操作 | 结果 |
| --- | --- |
| 默认关闭，全部标签、空搜索 | 9 条 |
| 开启重要筛选 | Next.js、Tailwind、「怎样提出一个好问题」，3 条 |
| 关闭 | 恢复 9 条 |
| 搜索 Excalidraw | 1 条 |
| Excalidraw + 重要 | 0 条，显示原有无匹配提示 |
| 关闭重要 | 保留搜索词，恢复 Excalidraw |
| 再开启、清空搜索 | 保留重要筛选，恢复 3 条 |
| Next.js + 重要 | 1 条 |
| 空搜索、教程 + 重要 | Next.js、Tailwind，2 条 |
| 工具 + 重要 | 0 条 |
| 关闭重要 | 标签仍为工具，恢复 Excalidraw、Raycast |
| Next.js + 教程 + 重要 | 1 条 |
| 切文章 | 0 条 |
| 清空搜索 | 「怎样提出一个好问题」，1 条 |
| 关闭重要 | 恢复文章下的 3 条 |
| 切全部 | 恢复 9 条 |
| 开启 + Next.js + 教程后刷新 | 关闭、空搜索、全部标签、9 条；控件仍在 |

开发终端请求返回 200，未出现编译或运行错误；浏览器检查时 error / warn 日志为空。

源文件比对确认数据、卡片、图标、package.json、layout 和全局样式未变；总数继续使用 resources.length。副本的 npm install 自动移除了 lockfile 中 postcss 的 dev 标记，未改变版本或添加依赖，未回写交付 Starter。

开发服务停止后，将副本 `.next` 移到同一副本内的 `.next-dev-evidence` 留存，再运行生产构建。没有批量删除文件。

## 构建与课程检查

| 检查 | 结果 |
| --- | --- |
| 副本 npm run build | 通过，Next.js 15.5.26 |
| 副本 npx tsc --noEmit | 通过（原 Starter 没有 typecheck script） |
| 站点 npm run typecheck | 通过 |
| 站点 npm run build | 通过；保留既有大于 500 KB 的 bundle 提示，未做基础设施优化 |
| npm test | 50 / 50 通过 |
| npm run check:content | 4 阶段、3 篇已发布正文与任务键一致 |
| npm run check:bundle | 通过，3 篇正文未泄漏到前端产物 |
| npm run check:starter | 通过，交付 ZIP 与原始 Starter 一致 |

在本地数据库通过既有 seed 同步目录标记；部署环境仍需运行既有 `npm run db:seed`。未执行线上部署。

实际课程页使用独立 `aifoundry_test` schema 验证，桌面 1440px、手机 390px 均无整页横向溢出，正文单一 H1，H2/H3 与教学块正常显示，配图注释不显示。Prompt 显示复制成功，并实际粘贴到本地 Starter 输入框核对文本；DeepDive 默认折叠，可展开。第一项任务点击后刷新保持勾选，测试后恢复未勾选。

API 测试确认匿名访问 1.2 返回 401、无权益学生返回 403、有 Stage 1 权益返回真实正文及五个任务键；1.3 仍未发布。没有改变原有访问策略。

## 配图与内容边界

保留四处作者注释：现有页面及控件位置、动作到页面结果的流程、开关前后对比、搜索与重要筛选组合。未伪造截图或引用不存在的图片资源。

功能只解释到动作与结果；状态只解释到运行时记忆；事件只解释到点击/输入触发操作；筛选只解释到同时满足几道判断。成功标准与保护原功能自然放入需求和点击步骤，不引入额外英文术语。

未系统讲 React、Debug、diff 或 Git，未编写 1.3，未修改 Stage 2～4。
