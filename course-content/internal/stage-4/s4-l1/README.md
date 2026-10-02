# Stage 4.1 内部 Reference

基线为 `starter/stage-4/`，即 Stage 3.7 最终产品与 V1.1.1 Reliability Patch。A/B 只保留原页面差异；Agent Tool、Runtime、Provider、Route 和 UI 在 `common/` 中共用。没有新增 Prisma migration、业务知识 Tool、写入、审批、MCP 或持久化。Starter 本身不包含本课答案。

在平台仓库根目录向**全新** `.runtime` 目录装配，再在装配目录安装依赖、运行测试和构建：

```powershell
node scripts/assemble-stage4-reference.mjs 1 a .runtime/stage4-l1-a-new
node scripts/assemble-stage4-reference.mjs 1 b .runtime/stage4-l1-b-new
cd .runtime/stage4-l1-a-new
npm install --no-audit --no-fund
npm test
npm run build
```

B 版同样运行三条 npm 命令。`npm test` 显式调用本地 `tsx`，继承 Stage 3 的预算、知识切块、Citation、Streaming 和 Eval 单元测试，再运行本课 Agent deterministic 测试，不需要数据库或真实 Key。

真实 Route 验收必须先使用隔离的本地 `stage4_l1` PostgreSQL 库应用 Starter 既有四次 migration。之后从平台根目录用本机被忽略的 Provider 环境配置运行 `node course-content/internal/stage-4/s4-l1/real-agent-acceptance.mjs <已构建装配目录>`，设置 `TEST_DATABASE_URL` 为该隔离库。它注册一个临时测试账号，只发送非敏感短输入；终端仅输出调用计数、finish reasons、token 总量和耗时。真实工具选择可能为直答，最多尝试三种自然语言任务，不使用 `required`。

教学图：`public/course-media/stage-4/s4-1-01.png`。正文只展示学生路径，不提 A/B 组织方式。Stage 4 仍未发布。
