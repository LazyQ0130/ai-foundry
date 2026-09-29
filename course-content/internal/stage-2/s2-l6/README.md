# 2.6 内部 A/B 参考实现

在 2.5 的同一批参考项目上增量实现 Resource 所有权。`implementation-a` 保留日期排序，`implementation-b` 保留清除筛选、自选标题与统计；两边共用 `common` 中的 Prisma schema、三次迁移、认证及资源 API 和 `ResourcePreview`。迁移只为旧 Resource 增加可空 `ownerId`、索引和外键；旧资料保留且不自动认领。

`GET` 在 Prisma 查询中按当前 Session 的 user.id 过滤；`POST` 由服务端写入归属并拒绝请求体指定 ownerId；`PATCH`/`DELETE` 在同一次 Prisma 写操作中同时限制 ID 和 ownerId。账号切换时清理个人状态并中止或忽略旧请求。所有 Cookie 写接口补充最小的 Origin/Fetch Metadata 来源检查。静态示例仍在本地、只读，和“我的数据库资料”分别显示。

正文见 `course-content/stage-2/s2-l6.md`；实际 A/B 验证见 `docs/stage-2-l6-validation.md`。本目录供教学对照，不是覆盖学生自选功能的完整 Starter。
