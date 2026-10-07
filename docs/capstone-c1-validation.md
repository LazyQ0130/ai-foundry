# AI Foundry Capstone C1｜课程制作与验收

日期：2026-10-08（Asia/Shanghai）。本轮是内部作者草稿与 C1 Reference；没有注册 Capstone Lesson、修改 entitlement 或解锁课程。

## 1. C1 Verdict

**PASS。** 正文、空白学生模板、完成版内部 Reference、九课 Showcase 和独立验证均完成。可以进入正式发布前的编辑与权限接入流程；本轮没有执行发布。

## 2. Learning Objective

学生能从自己的研究场景定义一个主要用户、当前流程和核心问题；写出自己的 JTBD；划清 AI、系统代码和人的职责；主动确定 MVP 与 Non-goals；画出主路径和失败分支；提出日后能实际检验的成功标准。最终交付 `docs/product-brief.md`、`docs/user-flow.md` 和 README 顶部一句定位，而不是业务代码。

## 3. Lesson Structure

正文为 `course-content/internal/capstone/c1/lesson-draft.md`，估时 60～75 分钟，结构如下：

| 时间 | 教学动作 | 学生输出 |
| --- | --- | --- |
| 0～6 分钟 | 从过度宽泛的 Agent Prompt 看到开发错误 | 明确本课只定义产品 |
| 6～16 分钟 | 真实研究场景、Before、问题与功能区别 | 当前流程和三个痛点 |
| 16～24 分钟 | 一个 Primary User、自己的 JTBD | 用户与任务句 |
| 24～32 分钟 | AI、系统代码、人的职责 | 决策与权限边界 |
| 32～46 分钟 | Must/Later/No、Scope Explosion 的 Break→Fix | MVP、Non-goals 与删减理由 |
| 46～56 分钟 | After、Task/Run 直觉、页面结构 | User Flow 与失败分支 |
| 56～66 分钟 | 可检验 Success Criteria、Brief 审查 | 两份产品文件与一句 README 定位 |
| 66～75 分钟 | 自述、Git diff 与保存点 | Product Definition 版本 |

正文使用 Renderer V2 frontmatter、H2/H3，以及 prompt、task、concept、check、stuck、warning、deepdive 教学块。六条 checklist 对应六个全局唯一 checkKey。没有正式 C1 路由或下载资源 ID。

## 4. Product Brief

内部完成版在 `course-content/internal/capstone/c1/docs/product-brief.md`。主要用户是会阅读多份私人资料、补充外部信息并写可追溯报告的**个人研究者**；示例语境是开发者调研企业知识管理中的 AI Agent。核心问题是资料分散、内部外部证据难以合并、报告结论与来源脱节。学生可改研究主题，但须保留一位主要用户与一条可完成的研究主线。

## 5. MVP / Non-goals

MVP 包含个人身份与 Workspace、PDF/MD/TXT 私有资料与检索、ResearchTask/Run、内部与外部 Evidence、Citation-backed Report 与 Source Preview、受限只读研究流程、审批后的 KnowledgeNote、Run Timeline、Eval 与部署。Non-goals 包含 OCR、Multi-Agent、Team/RBAC、Browser Agent、任意网页抓取、Mobile App、Payment、复杂 Queue、多模型路由、Marketplace 与无人批准的高风险写入。正文不是先发答案：学生先做 Must/Later/No 和故障实验，之后才看到带理由的 Reference 对照。

## 6. User Flow

独立文件 `course-content/internal/capstone/c1/docs/user-flow.md` 保存 Before、After、失败分支和页面推导。主路径为 Login → Workspace → Knowledge → Task → Run → 内部/外部 Evidence → 带引用报告 → 来源检查 → 批准/编辑/拒绝提案 → 如获批准才形成 KnowledgeNote。ResearchTask 是持续目标，ResearchRun 是一次执行。一级页面为 Dashboard、Knowledge、Research、Runs，另有三个详情页；Citation 不单列导航。

## 7. AI Coding Tasks

正文有三个可复制 Prompt，均要求 AI 不写代码、不改文件：

1. 分析学生自己的 Before，找重复劳动、来源流失与需核实的问题，不先给方案。
2. 挑战 Must/Later/No，建议删减并检查与 JTBD 的联系，由学生决定是否采纳。
3. 审查 Brief 与 Flow 的矛盾、遗漏和验收标准，不替学生重写。

AI 在 C1 是 Product Thinking Partner；每个 Prompt 的输入都来自学生先写的决定。

## 8. Failure Exercise

Scope Explosion 提供故意膨胀的十六项需求，包括 OCR、Browser Agent、团队、支付、多模型和自动写入。学生先识别与 JTBD 相关的能力，再分 Later/No，最后砍回可交付 V1。Break 是没有边界的产品范围，Fix 是带理由、能验收的主流程。

## 9. Student Ownership

`starter/capstone/docs/templates/` 只有空白 Product Brief 与 User Flow 模板；`docs/product-brief.md` 和 `docs/user-flow.md` 的完成版只在内部 Reference。Ownership checker 继续限制 Bootstrap 文件白名单；C1 校验脚本比对共享模板与 Starter 模板一致，并确认 Reference 内容没有泄漏到模板。学生须自己选研究语境、写 Before 与 JTBD、决定取舍、处理 AI 审查意见及提交自己的文档。

## 10. C1 Reference

`scripts/assemble-capstone-reference.mjs c1 <new .runtime path>` 从 Bootstrap 只叠加内部 `docs/product-brief.md`、`docs/user-flow.md` 和一句定位的 README；作者的 `lesson-draft.md` 不进入项目。实际装配检查：这三个文件存在，`prisma/`、`lib/`、`app/api/` 与 `lesson-draft.md` 均不存在。C1 Reference 没有 C2 的 Auth、Workspace、ResearchTask 或数据库。

## 11. Showcase Sync

`src/data/capstoneShowcase.ts` 已更新为 C1～C9，C1 从问题定义开始，C2 明确是架构与第一条竖切。`/projects` 与 `/capstone` 继续读取同一个数据源；九张卡仍标记「暂未解锁」，没有课程页或购买链接。测试继续断言正式课程统计是 29 节，四个 Stage 未变。

## 12. Verification

| 命令 / 检查 | 结果 |
| --- | --- |
| `npx tsx scripts/check-capstone-c1.ts` | Renderer V2 解析、六条 checkKey、三个 Prompt、教学块、资源与模板检查通过 |
| `node scripts/check-capstone-bootstrap.mjs` | 通过；工程骨架与空白模板，没有完成版产品文件 |
| 从 Bootstrap 新装配 C1 Reference：`npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` | 全通过；应用仍是空产品壳 |
| `node --import tsx --test tests/capstone-showcase.test.ts` | 3/3 通过；九课均锁定，正式统计仍为 29 |
| 平台根 `npm run build` | 通过，含 typecheck 与生产前端构建 |
| 平台根 `npm run check` | 通过；既有 Stage 内容与 Starter 包一致 |
| 平台根 `npm test` | 84/84 通过 |
| `git diff --check` | 通过 |

## 13. Files Changed

```text
course-content/internal/capstone/c1/README.md
course-content/internal/capstone/c1/docs/product-brief.md
course-content/internal/capstone/c1/docs/user-flow.md
course-content/internal/capstone/c1/lesson-draft.md
docs/capstone-c1-validation.md
docs/templates/product-brief.md
docs/templates/user-flow.md
scripts/assemble-capstone-reference.mjs
scripts/check-capstone-bootstrap.mjs
scripts/check-capstone-c1.ts
src/data/capstoneShowcase.ts
starter/capstone/README.md
starter/capstone/docs/templates/product-brief.md
starter/capstone/docs/templates/user-flow.md
tests/capstone-showcase.test.ts
```

## 14. Git

本轮开始前 `origin/main` 为 Phase 2 提交 `2241bf14746e3b81406fe1af3433fbad8ffa4fb0`，且已核对远端包含要求的六类 Phase 2 文件。C1 的最终提交 SHA、远端 HEAD 与工作树状态在交付消息中记录。
