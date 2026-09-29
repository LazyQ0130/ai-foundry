# 2.7 内部 A/B 参考实现

沿用 2.6 的独立 A/B 练习项目、User/Session/Resource 模型与三次迁移，不新增表。`implementation-a` 保留日期排序，`implementation-b` 保留清除筛选、自选标题与统计。两边共用 `common/components/ResourcePreview.tsx` 和 2.6 的认证、资源 API。

本节只增量改善页面状态：个人 GET 按真实响应进入 Loading、Ready、Empty 或 Error；刷新或错误时旧列表标为未确认；GET 或写入返回 401 清空私有状态并回到登录；标题、简介、标签做基本前端检查，服务端 400 仍为最终结果。POST/PATCH/DELETE 等待期间防重复，响应无法确认时先重新读取核对，再允许同类写入。POST 已确认成功而后续 GET 失败时保留保存成功消息。

本目录是教学对照源码，不是覆盖学生原项目的 Starter。测试用延迟、503 与响应丢失注入均只在独立临时运行副本中进行，最终源码不含故障开关。正文见 `course-content/stage-2/s2-l7.md`，实测证据见 `docs/stage-2-l7-validation.md`。
