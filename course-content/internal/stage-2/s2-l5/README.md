# 2.5 内部 A/B 参考实现

本目录延续 2.4 的同一批参考项目。`implementation-a` 保留日期排序，`implementation-b` 保留清除筛选、自选标题与统计；`common` 提供两边共用的认证增量代码。正文见 `course-content/stage-2/s2-l5.md`，证据见 `docs/stage-2-l5-validation.md`。这不是 Stage 1 Starter，也不应用整页覆盖学生已个性化的作品。

在原 `Resource` 模型旁只增加 `User`、`Session`，并新增第二个正常迁移。密码由 Node 内置 `scrypt`、随机 salt 与恒定时间比较处理；原始随机 Session Token 只送入 HttpOnly Cookie，数据库仅存 SHA-256 Token Hash。四个认证 Route Handler 负责注册、登录、恢复会话与退出。四种 Resource 方法先查有效 Session：未登录回 401，登录后继续 2.4 的 CRUD 契约。Resource 没有 ownerId/userId；Alice 与 Bob 目前共享同一集合，2.6 才做所有权隔离。

页面在数据库资料区增加简单注册、登录、退出入口，加载时调用 `/api/auth/me`，不在 JavaScript 中保存 Token。两边分别在已有隔离 PostgreSQL schema 运行增量迁移；没有 reset、清表或连接 AIFoundry 平台业务 schema。`common/package.json` 延续 Prisma 6.19.3 与既有 `deepmerge-ts` override，未新增密码哈希依赖。
