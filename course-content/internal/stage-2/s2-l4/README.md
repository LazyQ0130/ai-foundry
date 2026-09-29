# 2.4 内部 A/B 参考实现

本目录延续 2.3 的两个独立参考项目。A 保留日期排序；B 保留清除筛选、自选标题及 `ResourceStats`。`common/` 复制 2.3 已验证的 Resource Schema、迁移、Prisma 入口和 POST/GET 契约；本课新增 `app/api/resources/[id]/route.ts`，并扩展原 `ResourcePreview`。教学正文在 `course-content/stage-2/s2-l4.md`。参考源码不属于 Stage 1 Starter，不应用整页覆盖学生已个性化的作品。

Next.js 15 的动态 `params` 是 Promise，接口先 `await` 再校验 ID。PATCH 要求完整的 title、desc、tag、important，复用 2.3 的文字与分类规则，并要求 important 为 boolean。成功回 HTTP 200 和 Prisma 更新后的 `{ok:true,resource}`。DELETE 仅按单个 ID 删除，成功回 HTTP 200、`{ok:true,deletedId}`。非法 ID / 输入回 400、不存在回 404、数据库故障回 503；GET/POST 仍是 2.3 契约。接口不含登录或所有权，仅用于受控本地非敏感练习，不能公开部署。

页面以数据库资料为主要管理区，每条数据库记录可编辑或二次确认删除。取消不发送写请求，成功后重新 GET；重读失败保留旧显示并提示单独重读，绝不自动重复 PATCH/DELETE。原始九条静态资料只读且与数据库数量分开；A 的排序与 B 的清除筛选保持原逻辑。

## 2026-09-28 本地验证

运行项目仍为 `C:\Users\QYF\AppData\Local\Temp\aifoundry-s2-l3-20260928-1\a` 和 `b`，数据库为本机 PostgreSQL `localhost:55432` 中各自隔离的 `s2l3_a_20260928`、`s2l3_b_20260928` schema。仅记录非秘密标识；真实连接地址只留在各临时项目的 `.env`。复用 2.3 已应用的建表迁移，没有 reset、drop、清表或批量删除。两边原有 ID 1、2 保留；本课各自新建 ID 3、4，仅修改并删除新建的 ID 3，ID 4 保持。浏览器另新建一次性 ID 5，在二次确认后只删 ID 5；取消确认时它仍在。浏览器把 ID 4 编辑后刷新仍显示新标题。完整响应、时间戳、数据库计数与失败场景见 `docs/stage-2-l4-validation.md`。

A/B 均运行 `npm install`、`prisma generate`、TypeScript、`next build`、开发服务器、真实 HTTP 与浏览器操作。依赖审计另作核对：Prisma 6.19.3 的 CLI 链 `@prisma/config@6.19.3 → deepmerge-ts@7.1.5` 原报告 3 项 high；本课参考 `package.json` 用 npm `overrides` 固定 `deepmerge-ts@8.0.2`，A/B 安装后审计为 0，并验证 Prisma generate/migrate status/构建。覆盖方案是本地兼容性实测，不等于 Prisma 官方承诺；正式部署前需复审锁文件、升级路径和生产构建。未运行 `npm audit fix --force`，未跨 Prisma 主版本升级。
