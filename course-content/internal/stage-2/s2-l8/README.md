# 2.8 内部 A/B 参考实现

沿用 2.7 的全栈应用与三次迁移，不新增表，不改认证和 ownerId 服务端限制。A 保留 Stage 1 日期排序，B 保留清除筛选、自选标题与统计。`common/` 放两份共享的 API、组件、Prisma schema、迁移和部署脚本；`implementation-a/app/page.tsx`、`implementation-b/app/page.tsx` 分别替换各自页面。本目录是教学对照源码，不是一个可直接部署的 Next.js 根目录。

本节选择 A 做生产参考部署，B 保持本地生产构建级回归。真实云端结果和公开 URL 记录在 `docs/stage-2-l8-validation.md`；未执行的项目明确标为未验证。学生应部署自己的独立知识工作台仓库，不能把 AIFoundry 教学平台仓库当成学生项目。

完整项目的 README 模板在 `common/README.md`。`postinstall` 生成 Prisma Client；本地 `npm run build` 生成 Client 再构建；Vercel Build Command 为 `npm run vercel-build`，顺序为 generate、migrate deploy、migrate status、next build。`DATABASE_URL` 只配置在 Vercel Production；Preview 使用独立数据库或暂不连接数据库。
