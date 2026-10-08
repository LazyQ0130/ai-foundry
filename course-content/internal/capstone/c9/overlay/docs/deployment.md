# 交付 Runbook

先阅读 deployment-decision.md。当前云部署 **NOT VERIFIED**，没有 Demo URL。不要照抄环境值。

## 1. 环境与 Secret Inventory

| 环境 | 数据/凭据 | 允许操作 |
|---|---|---|
| Local | 本地 DB/bucket、mock 或显式 real | 开发 |
| Test/Eval | 独立临时 DB、synthetic、mock | 故障注入、C8 Eval |
| Staging | 独立云 DB/bucket/secret | 真实 Provider full smoke |
| Production | 生产专属，无 TEST_DATABASE_URL | safe smoke、受控 release |

| 变量 | 用途/检查 |
|---|---|
| DATABASE_URL | PostgreSQL TLS URL；仅服务端/单独 migration job |
| S3_ENDPOINT / REGION / BUCKET | private bucket 定位；HTTPS；不是公开资源域名 |
| S3_ACCESS_KEY_ID / SECRET_ACCESS_KEY | bucket 限权凭据；不进入浏览器 |
| AI_EMBEDDING_BASE_URL / API_KEY / MODEL / DIMENSION | embedding provider，维度固定 1024 |
| AI_CHAT_BASE_URL / API_KEY / MODEL | chat provider；可与 embedding 同账户，不可与应用安全 secret 共用 |
| MCP_EXTERNAL_URL / AUTH_SECRET | 固定 HTTPS tool endpoint / 独立认证凭据 |
| ACTION_APPROVAL_SECRET | 独立 HMAC 精确授权；轮换会使旧 approval token 失效 |
| APP_ORIGIN | 真实产品 HTTPS origin；用于配置检查与 bucket CORS |
| CROSSREF_MAILTO | 可选 polite-pool 联系邮箱，仅服务端 |

四种 AI_*_MODE 都设 real。Node production。生产禁用全部 mock/fault 开关、MCP_ALLOW_LOCAL_HTTP，移除 TEST_DATABASE_URL。没有 Cookie secret：Session 是随机 token，DB 只存 hash；不要发明共享 Cookie secret。

每个应用安全 secret 独立运行一次 `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`，直接保存到 secret manager。不要复制到报告/聊天/Git/截图。静态检查能检查形状和明显低复杂度，**不能证明随机性**，生成过程由操作者负责。所有 NEXT_PUBLIC_* 都按公开处理。

在安全的独立生产检查进程注入配置后运行 `npm run check:production-env`。只输出变量名与状态。通过后还需验证网络、IAM、实际 HTTPS 和域名解析；checker 不连接第三方。

## 2. 本地与 release code gate

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

开专用 Test/Eval shell，DATABASE_URL 与 TEST_DATABASE_URL 指向 C8 guard 允许的本地 55440/capstone_c8_eval/public。先从空库 migrate deploy，再运行：

```bash
npm run release:check
npm run eval:capstone -- --compare-baseline eval/baseline.json
```

release:check 拒绝 production/非 allowlist DB，移除付费 key、强制 mock，依次 lint/typecheck/test/build/Eval/audit。生产配置检查与它是两个隔离进程。不能向 Eval shell 注入生产 secrets。full 与 production audit High/Critical 都必须零；registry 失效算失败。输出写 ignored `.runtime/release`。绝不 `npm audit fix --force`。

## 3. 构建可追溯镜像

从**组装后的 C9 项目**执行，不是平台仓库根目录：

```bash
docker build --target runtime -t research-workspace:<git-sha> .
docker build --target release -t research-workspace-release:<git-sha> .
```

记录 git SHA、基础镜像 digest、镜像 digest、lockfile hash。Dockerfile 没有复制 env，build 不需要生产凭据、不执行 migration。runtime 只带 standalone/.next/static/public，release target 才带 CLI/schema/scripts。镜像内有生成后的 Prisma client。真实验证 PDF 路径，不能只看 build 成功。

## 4. 数据库发布

确认目标环境与备份；演练从备份恢复。使用独立 migration 凭据，从 release 镜像在同一受控网络运行：

```bash
npx prisma migrate deploy
npx prisma migrate status
```

CLI 命令在 release image 的 `/app` 中运行。一个 release 一次，不能每个 Preview 执行。禁止生产 migrate dev、db push、reset。SQL 检查：

```sql
SELECT extversion FROM pg_extension WHERE extname = 'vector';
SELECT format_type(atttypid, atttypmod)
FROM pg_attribute
WHERE attrelid = '"KnowledgeChunk"'::regclass AND attname = 'embedding';
```

必须返回 extension version 和 vector(1024)。用 synthetic embedding 完成一次 scoped retrieval，不能只确认列存在。当前六条 migration，无 C9 schema 变更。

## 5. Cloud deployment

把已审查的组装 Reference 放入学生自己的生产仓库；不要公开整个平台/课程作者目录。Render 使用 paid Docker Web Service，runtime target，PORT 平台注入，health `/api/health`。HTTPS secret 只在运行环境注入。release target 用单独 job 完成 migration/status；不要让 app 启动命令自动迁移。

R2 新建私有 bucket，public domain/r2.dev 禁用，bucket 限权 token；配置真实产品 origin 的 CORS。安装后先 anonymous denied / signed GET / signed PUT，再 browser 上传。对象密钥仍由服务端从 Workspace 推导。容器没有持久化上传文件。

确认 MCP_EXTERNAL_URL 的 HTTPS endpoint 与当前 host 一致；不启用 MCP_ALLOW_LOCAL_HTTP。cloud 必须测真实混合 Run、PDF 和 120 秒预算以内的完整请求；核对 upstream/proxy 时限，不能把 build timeout 当 HTTP timeout。

## 6. Smoke 分层

Staging 无私人资料，先确认第三方费用上限，再显式 opt-in：

```bash
npm run smoke:staging -- https://<your-staging-host>
```

需要 C9_STAGING_SMOKE=1。注册/登录→synthetic TXT+PDF→READY→检索→private Run→mixed Run→Citation→Proposal→Approve→replay one Note→signed source/anonymous denied。最多 60 HTTP 请求、2 Runs、8 分钟；每个 Run 仍受现有 120 秒/10 provider unit 约束，Proposal 单独有调用。最多两个 Proposal，无循环付费重试。操作者 opt-in 只授权审核 synthetic 测试笔记；不要对真实用户内容自动 approve。

生产先设置 C9_PRODUCTION_SMOKE=1，再 `npm run smoke:production -- https://<your-product-host>`。拒绝 localhost/IP/HTTP，只有 synthetic TXT、一个 mixed bounded Run、一个 Proposal/Approve/replay。不会执行故障注入、并发轰炸、DB mutation 或删除。每次失败先排查，不盲目重跑付费调用。

Node 预检不能证明浏览器所有行为：必须在真实浏览器确认 CORS/upload/cookie/source。Smoke 身份由脚本随机创建，不输出密码/Cookie。所有数据前缀 smoke-/[SMOKE]。当前没有用户删除 API；由授权运维在独立审查下按 smoke 用户和 objectKey 定点清理，不运行批量删除脚本，不给前端加测试删除接口。

本地 production-like 可在专用测试环境设置 C9_STAGING_SMOKE=1、C9_LOCAL_STAGING_SMOKE=1，指定 loopback base；这不是 Production Safe Smoke，HTTPS/CORS 必须仍标 NOT VERIFIED。

## 7. Recovery / rollback

应用滚动发布后、每十分钟维护或异常 Run 投诉时，release image 用生产专属 DB 执行：

```bash
npm run recover:stale-runs -- --dry-run
npm run recover:stale-runs -- --apply
npm run recover:stale-runs -- --dry-run
```

默认 dry-run，apply 必须显式。阈值十分钟大于正常两分钟，最近 Step started/completed 都保护 Run。锁 Run 后复核；FAILED / PROCESS_INTERRUPTED，运行中 Steps 同样失败，第二次 apply 为零。只报告计数，不创建 Step、Action、Note，不 Resume。若运维未执行，陈旧 Run 仍会显示 RUNNING；V1 不是自动后台恢复。

检查结构化 event/runId/status/errorCode/latencyMs；不记录完整 prompt/providerbody/token。健康探针只证明进程能响应，不依赖 DB/AI/storage。用户错误必须是稳定分类与可操作提示。

回滚旧镜像前检查 schema compatibility 和旧配置；必要时停止写入再按备份流程恢复，保留独立审计证据。没有验证恢复演练，就不能写“可恢复”。

## 8. 证据与发布边界

填写 release-evidence.md：环境、日期、源 SHA/镜像 digest、migration、storage、HTTPS、smoke、recovery、Eval SHA/结果；只记录状态/计数/安全 ID，不记录 signed URLs 或原文。NOT VERIFIED 不是 PASS。

全部关键项通过才称 Production Ready；作品集材料也必须基于证据。C9 仍 Internal Authoring，Capstone 暂未解锁，正式 29 节，不创建 release tag。下一轮单独做 Final Capstone Release Readiness Audit。
