# Capstone Publishing Integration Plan（设计，不执行）

日期：2026-10-08。当前 Internal Authoring，Capstone 暂未解锁。本文件不授权发布。

## 当前事实与阻断条件

- `server/services/course-content.ts` 的 `lessonMetadata` / `readLessonContent` 只从 `src/data/courses.ts` 的 Stage catalogue 解析；C1～C9 不在其中，当前正文 API 无法加载 Capstone。
- `server/routes/courses.ts` 的 `/api/lessons/:lessonId` 先调用 `requireLessonAccess`；它检查 Stage entitlement。现有服务端鉴权能力可复用，但尚无 Capstone 正文分支。
- `server/services/entitlement.ts` 已有 `PROJECT_LAB_KEY = project-lab` 和 `hasProductAccess`；`prisma/schema.prisma` 已有 ProductEntitlement。`server/routes/admin/entitlements.ts` 已能分别授权项目版或 Project Lab。**已有权益记录，不等于已有 Capstone 内容访问控制。**
- `server/routes/progress.ts` 依赖 Stage lesson metadata；`server/services/progress.ts` 只计算 Stage formalProgress/stageProgress。现有 Lesson / LessonProgress / LessonCheck 的关系围绕 Stage，不能直接塞入一个伪造 Stage 5。
- `src/pages/CapstoneOverview.tsx` 当前是公开锁定展示页。按钮提示暂未解锁，未请求付费正文。此状态正确。
- `server/routes/course-assets.ts` / `src/data/courseAssets.ts` 只有固定 Stage 下载白名单，未提供 Capstone Starter。

## 最小发布模型

1. 新增独立、可信的 Capstone catalogue，固定 `c1`～`c9`，不加入 `allLessons` / `formalLessons` / `stages`。
2. 审核后从内部 lesson-draft 生成正式正文 `course-content/capstone/c1.md`～`c9.md`；只生成九份已批准 Markdown，不复制 overlay、答案、验证记录。构建阶段不把正文导入前端。
3. 独立页面 `/capstone/lessons/:lessonId` 和服务端 `/api/capstone/lessons/:lessonId`。先校验可信 catalogue / published，再验证 ACTIVE user + ACTIVE project-lab entitlement，然后读取文件。未登录401、无权益403、未知/未发布404；管理员停用/撤权即时生效。
4. 进度采用独立 CapstoneLesson / CapstoneProgress / CapstoneCheck 关系，使用正式 migration。checkKey沿用已审查的61个稳定key，服务端再次验证当前正文checkKeys。写入与撤权/停用共享用户锁。返回独立 `capstoneProgress {completed,total:9}`，Stage formalProgress保持29。
5. 全阶段课程版不自动获得 Project Lab；项目版沿用已存在的独立权益。不得用“拥有四个Stage”代替project-lab检查；不得只隐藏前端按钮。
6. 下载资源继续经服务端固定白名单 + project-lab guard，不接受请求路径，不放 public/dist。正文/附件响应使用private/no-store；避免shared CDN缓存付费正文。
7. 发布必须与云验证和公开承诺决策分离：解除锁定前先完成审计阻断项、独立批准，再注册正文、进度、资源和公开状态。不要创建空权益或自动开通用户。

## 预计影响文件（下一轮）

| 目的 | 已有文件 / 拟新增位置 |
|---|---|
| 独立 catalogue | 新 `src/data/capstoneLessons.ts`；不改 Stage catalogue计数 |
| 正式正文 | 新 `course-content/capstone/c1.md`～`c9.md` |
| Loader / content guard | 新 `server/services/capstone-content.ts`，复用 `server/services/entitlement.ts` |
| API wiring | 新 `server/routes/capstone.ts`，`server/app.ts` 实际挂载点 |
| Progress | `prisma/schema.prisma`、新migration、新 `server/services/capstone-progress.ts` / routes |
| Frontend routing | `src/App.tsx`、新 CapstoneLessonPage，沿用 LessonMarkdown/工作台交互 |
| Progress consumers | AuthProvider/API client/项目页新增独立字段；不改变Stage29的分母 |
| Protected downloads | `src/data/courseAssets.ts`、`server/routes/course-assets.ts`、`server/services/asset-access.ts`、`scripts/build-starter.ts` |
| Status / copy | `src/data/capstoneShowcase.ts`、`src/pages/CapstoneOverview.tsx`、`src/pages/ProjectsPage.tsx`、`src/pages/Pricing.tsx`、`src/data/site.ts`、PurchaseModal；经产品批准后统一更新 |
| Acceptance | 新Capstone auth/progress/download测试、更新check-bundle与课程检查器 |

文件名为设计建议；实际实施前再次核对挂载点和迁移方案。当前没有实现以上路由或数据库表。

## 学生下载白名单

- `starter/capstone` 的最小工程文件：package/lock/config、app空壳、bootstrap测试、README、`.env.example`和`.gitignore`。
- `docs/templates/product-brief.md` / `user-flow.md` / `architecture-decision.md` 空白模板。
- 经单独审核的合成fixtures：正常PDF/MD/TXT与坏/无文本PDF，须带格式和用途说明；只复制固定文件名单。
- 不下载：C1完成Brief/User Flow、完成ADR、任何overlay/final Reference、eval答案和Gold、作者validation/audit、秘密、运行记录、私人fixture。
- 发布前检查ZIP目录树、内容哈希、凭据、symlink和超出白名单文件；授权/撤权/匿名下载均需真实API测试。

## 必须完成的发布验收

匿名、无权益、课程版、项目版、已撤权、disabled用户各测正文/进度/附件；非法lessonId/checkKey/path拒绝。项目版能完成九课、持久化61项任务并显示9/9；Stage始终29。未发布正文404，付费内容不进入public bundle，压缩包不泄露Reference。Prerequisite必须明确Stage1～4或等效能力。

## 公开承诺决策

当前 `Production Product` 与C9真实生产交付目标要求云证据。若保持承诺，先完成云验证。若产品负责人选择仅承诺local production-like / Deployable Product，需独立批准并同步Showcase/C9/购买说明；本轮不替负责人作决定，也不修改Pricing或deliverables。
