# H10来源、许可与隔离范围

正文、四份SVG与教学组织为课程原创。固定源码引用、公开接口及装配改编来自DeepSeek Harness Commit `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`；MIT原文保留在SOURCE-LICENSE.txt，Cordis MIT保留在CORDIS-LICENSE.txt。Zod4.4.3许可保留在ZOD-LICENSE.txt，依赖在仓库外隔离安装/复用并核锁。

`lab/official-mock.ts`逐字节复制上游`packages/core/agent-loop/tests/mock-adapter.ts`，保留在MIT许可覆盖下，内容检查比较完整字节。support.ts真实服务装配参考scope-lifecycle.spec.ts及request-error.spec.ts；content tool使用官方tool-testkit的defineContentToolFixture。作者新增脚本响应、两段文本、等待门、轨迹收集、断言和答案校验；这些不是官方完整应用或自主模型规划能力。

没有复制完整上游仓库进课件。源码只从锁定研究缓存读取且核Git blob/SHA256；没有修改缓存。官方Vitest只选读，没有执行其目录清理钩子。本轮运行只创建明确的新OS夹具目录，保留不清理；不访问个人Harness Home/凭据、真实模型、私人文件或危险Shell工具。

Session为真实内存会话，没有存储后端，不代表磁盘flush/恢复。README/TEST是代码内固定字符串，不读取本机同名文件。完整应用集成E、产品鉴权、线上图片映射均未执行。

HTML为私有作者预览，实际SSR与React挂载QA分开记录；/course-media只在本地夹具映射，不表示线上发布。没有修改public、课程目录、数据库、权限、价格、进度或发布状态，也没有开发H11。
