# 2.3 本地发布与验收记录（2026-09-28）

## 基线和范围

开始时本地 `main` 为 `d428d3ee970a9f07f511c377b26f5a30a58675dc`，工作区干净。本轮没有切换旧提交、提交或推送。只增加 2.3 正文、内部 A/B 参考与迁移、验证记录，并修改课程发布标记、课程说明及相关权限和渲染测试。Stage 1 Starter、平台 Prisma schema、Auth、价格、支付和进度算法均未改；2.4～2.8 保持未发布。

## 课程和环境选择

正文在 `course-content/stage-2/s2-l3.md`：5 个全新 checkKeys、三段分阶段主要 Prompt、独立迁移前检查、真实 POST/GET、刷新/重启、故障与凭证安全、具体 Stuck 排查和作者配图注释。主线选择 Neon 免费 PostgreSQL；官方资料确认存在免费方案和 Prisma 迁移支持，额度/地区/账号条件要求学生按当时页面核对。本轮未创建 Neon 账号，云端连接和该账号的迁移权限**未实测**；内部验收使用本机 PostgreSQL 两个新建隔离 schema，不将其冒充云端验证。

内部 [A/B 参考与详细结果](../course-content/internal/stage-2/s2-l3/README.md)固定 Prisma CLI/Client 6.19.3，Node.js 24.16.0 + Next.js 15.5.26 + TypeScript 5.9.3 上实际完成初始化探针、Client 生成、A 的 `migrate dev` 和 B 的 `migrate deploy`、TypeScript、开发服务及生产构建。迁移 SQL 在 `common/prisma/migrations/`，原 2.2 页面与旧资料均未改。

## 持久化与错误证据

A/B 初始 GET 都返回空数组；合法 POST 都返回 201、`saved:true`、数据库生成 ID `1`。之后的 GET 和直接 Prisma 查询得到同一 ID，重复 GET 不增加记录。空标题、空简介、坏分类、“全部”、错误类型和格式错误 JSON 都返回 400，记录数不变。浏览器再保存时两份项目各得到 ID `2`，页面通过 GET 显示标题、简介、分类与创建时间，原静态列表仍为 9 条。A/B 刷新和重启 Next.js 后都重新读到相同记录；A 日期排序、B 搜索/教程/重要筛选与清除筛选都正常。

为验证故障，仅将 B 临时项目本地 `.env` 指向不可用本地端口后重启 Next.js，没有停共享数据库或修改业务 schema。GET/POST 都返回 503；页面分别显示读取/保存失败，不显示成功。恢复 `.env` 后 GET 200，仍只有先前两条，故障请求未写入。默认 WorkBuddy 未实测。曾尝试在 in-app 浏览器用 F12 打开 Network，但开发工具面板未出现；浏览器 Network 面板的 Payload/Response **未直接检查**。真实浏览器操作、HTTP 状态/JSON、Next.js 请求日志和直接数据库查询提供了交叉证据。

## 安全和范围检查

- A/B `.env` 只在各自临时项目且被原 `.gitignore` 的 `.env*` 排除；本仓库新增参考文件不含真实连接字符串。扫描本轮 19 个源码文件、A 的 18 个及 B 的 8 个 `.next/static` 文件，未发现真实 URL 或密码；客户端构建也没有测试 schema 标识。
- 迁移文件和 Prisma schema 留在参考源码；依赖版本明确。没有 User、Session、编辑、删除或所有权隔离，也没有导入原始九条资料。
- 依赖安装审计出现 3 项 high，关联 Prisma CLI 的 `@prisma/config → deepmerge-ts <8`。没有运行跨主版本的强制修复；参考匿名写入应用只用于受控本地教学，不公开部署。以后升级版本需重新做兼容性与审计。
- 未运行 `migrate reset`、`drop database`、清表、删除迁移或批量删除文件。临时 schema 和项目保留供复核。

## 平台发布与验证

2.3 `isPublished:true` 后运行既有 `npm run db:seed`；`check:content` 为 10 份已发布正文。匿名读 2.3 为 401，仅 Stage 1 权益为 403，Stage 2 权益可读且正文 `no-store`，2.4 仍为 404；正式课仍为 29，Stage 2 仍为 8。测试还验证 2.3 清单 key 的服务端保存，Stage 1 完成态测试仍通过。

本地平台使用 `aifoundry_test` schema 的 Stage 2 测试账号打开 2.3：H2/H3、Concept、Task、Prompt、Check、Warning、Stuck、DeepDive 与 5 项清单均渲染；Prompt 点击后显示“已复制”；清单勾选刷新后仍在，随后还原测试账号状态。桌面与 390px 手机宽度均检查，手机出现折叠菜单，浏览器报告 `clientWidth=375`、`scrollWidth=375`，未见横向溢出。

## 命令结果

- `npm run db:seed`、`npm run typecheck`、`npm test`（65/65）、`npm run build`、`npm run check:content`、`npm run check:bundle`（104 个构建文件、10 课）、`npm run check:starter` 均通过。
- 第一次 `npm test` 暴露测试之间的断言影响：新增 2.3 清单保存使 Stage 2 测试账号有一条进度记录，旧断言错误地期望它全站零记录。已将断言限定到它要保护的 `s1-l1`，重跑 65/65 通过。
- `npm run verify` 最终通过：typecheck、build、65/65 测试、10 份正文检查及 104 个构建文件的 bundle 检查均通过。
