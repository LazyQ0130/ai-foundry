# Deployment Decision · C9

Status: accepted architecture; cloud execution NOT VERIFIED. Review date: 2026-10-08.

## Context

研究同步执行，Run deadline 为 120 秒；PDF 解析需要 Node；MCP 是独立认证的 HTTP 调用。一个部署单元、一个开发者，沿用 modular monolith。文件不保存在容器磁盘。

| 方案 | 优势 | 当前代价 | 决定 |
|---|---|---|---|
| Serverless Next.js | 自动弹性、预览方便 | 需逐项证明请求时限、冷启动、PDF 支持；120 秒工作流不能凭猜测上线 | 可选但本 Reference 未采用 |
| Long-lived Node + Docker | 同一 Node 运行环境，便于解析 PDF、检查日志和进程恢复 | 需要容器运维、资源上限和发布流程 | 当前选择 |
| API + Worker | 长任务与请求解耦 | 队列、重试与分布式状态扩大范围 | 用户量/排队需求出现时重新考虑 |

## Canonical cloud target

拟用 **Render paid Docker Web Service + Render Postgres + private Cloudflare R2**。这是一项待执行的选择，不能当作已部署证据。当前无已配置并验证的该云环境，Reference 验证先使用本地 Docker、独立 pgvector DB 和 Garage。

- Docker runtime: Node 22 Debian，standalone，非 root，监听 `0.0.0.0:$PORT`。
- Render 公开说明 Docker、PORT、TLS termination 和 paid pre-deploy 支持；官方文档没有给本次环境的完整端到端请求时限保证，因此上线前必须实际验证 120 秒路径及代理超时。不要推导“Docker 没有超时”。
- DB 使用同区域独立服务，TLS；先备份，显式执行 release image 的 `prisma migrate deploy` 一次，再 status。确认 `vector` extension 和 `vector(1024)`。
- R2 使用 S3 endpoint、`auto` region，bucket public access 关闭。只授予本应用 bucket 对象读写权限。signed PUT/GET 300 秒；文件上限 10 MiB，提取上限 100000 字符/160 chunks。
- R2 CORS 只允许真实产品 origin，PUT/GET/HEAD，content-type；不得把 CORS 当作权限。anonymous GET 必须 401/403。先验证预检，再用真实浏览器验证上传。
- 生命周期：未完成 staging 对象按单独前缀设置过期；正式对象保留策略依据产品决定，不能直接把全部对象设短期过期。结合 DB 备份制定保留与恢复窗口。
- HTTPS 产品域名；MCP 固定到同一 HTTPS host 的 `/api/mcp/external-research`，独立随机 secret；禁用 local HTTP flag。
- Local、Test/Eval、Staging、Production 数据库、bucket、凭据分离；关闭未配置独立 DB 的 Preview。生产不设置 TEST_DATABASE_URL。
- 恢复：部署后/运维每十分钟执行 recovery dry-run，经计数核对后 apply；超过十分钟无 Step 活动的 RUNNING → PROCESS_INTERRUPTED，不自动 Resume，不执行 Approval。
- 回滚：保存上一个已验证镜像 digest；应用回滚不逆向撤销 migration。检查 schema 向后兼容；不兼容时停写并按独立恢复演练恢复备份，不能临时 reset。

## Official sources checked

2026-10-08 阅读。部署时重新检查，文档不是实际运行证明：

- [Next.js 15 self-hosting](https://nextjs.org/docs/15/app/guides/self-hosting)：Node/container 路径。
- [Render Docker](https://render.com/docs/docker)、[Web Services](https://render.com/docs/web-services)：镜像和端口/TLS。
- [Render deploys](https://render.com/docs/deploys)：paid pre-deploy、失败保留旧部署。
- [Render Postgres extensions](https://render.com/docs/postgresql-extensions)：扩展支持；目标实例仍需 SQL 检查。
- [R2 CORS](https://developers.cloudflare.com/r2/buckets/cors/)：presigned browser 请求仍需 CORS。
- [R2 presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/)：签名临时访问。

## Known limits

无 queue/worker、同步请求会占用进程；crash recovery 只终结旧执行。云网络、代理时限、资源容量、R2 IAM/CORS、备份恢复尚需部署验证；当前不得标 Production Ready。
