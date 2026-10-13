# 本地环境：C2 数据库 → C3 私有存储 → C8 隔离评估

这些文件只准备基础设施，产品代码仍由你逐课实现。镜像固定为 PostgreSQL 17 + pgvector 0.8.6、Garage 2.4.1；存储检查复用 C3 的 S3 SDK，不需要另装 S3 命令行工具。C1 不需要启动任何服务。

## 1. Windows 先准备 Docker

安装 [Docker Desktop](https://docs.docker.com/desktop/setup/install/windows-install/)，启用 WSL 2 后端并切到 Linux containers。按安装器要求重启，启动 Docker Desktop，等引擎就绪。在 PowerShell 验证：

```powershell
wsl --status
docker version
docker compose version
node --version
```

`docker version` 必须同时有 Client 和 Server；只有 Client 时先启动引擎。Node 要 >=20.19。macOS/Linux 使用 Docker Desktop 或 Docker Engine + Compose v2，后续 `node` 和 `docker compose` 命令相同；只有下文的环境变量语法区分 shell。

Windows 跟课用 Linux 容器里的 pgvector，避免在 Windows PostgreSQL 上现场编译扩展。若已有原生 PostgreSQL，也先按这套独立容器完成课程；不要把数据库 URL 指向课程平台或已有业务库。

## 2. C2：启动独立开发库和测试库

在解压后的 starter 根目录执行（已有项目只补入本指南、compose.yaml、infra/ 和 scripts/ 中的两个环境脚本，保留自己的代码和文档）：

```powershell
node scripts/init-local-env.mjs
docker compose --env-file .env.local up -d --wait db eval-db
docker compose --env-file .env.local ps
docker compose --env-file .env.local exec -T db pg_isready -U capstone -d capstone
docker compose --env-file .env.local exec -T eval-db pg_isready -U capstone -d capstone_c8_eval
docker compose --env-file .env.local exec -T db psql -U capstone -d capstone -c "SELECT name, default_version FROM pg_available_extensions WHERE name='vector';"
```

两库都应 healthy / accepting connections；最后应返回 `vector | 0.8.6`。镜像包含扩展文件，C2 尚不启用向量功能。C3 的正式 migration 才执行 `CREATE EXTENSION IF NOT EXISTS vector` 并建 `vector(1024)` 列。

初始化脚本生成随机本地密码、S3 key 和 Garage RPC secret，只写被 Git 忽略的 `.env.local`，不打印值；再次执行会保留现有文件。`.env.example` 是变量说明，不含可用凭据。Next.js 自动读取 `.env.local`；Compose 每次都显式指定 `--env-file .env.local`。Prisma CLI 不会自动读取这个 Next.js 文件，安装 Prisma 后用 Node 显式加载：

```powershell
node --env-file=.env.local node_modules/prisma/build/index.js migrate dev --name init
node --env-file=.env.local node_modules/prisma/build/index.js migrate status
npm run dev
```

上面的 `migrate dev` 用于 C2 创建开发迁移，需要先完成本课 schema。测试库只部署已写好的迁移。在**单独的 PowerShell 窗口**切换测试环境，再运行测试（替换成你项目中已实现的测试命令）：

```powershell
$env:TEST_DATABASE_URL = node --env-file=.env.local -p 'process.env.TEST_DATABASE_URL'
$env:DATABASE_URL = $env:TEST_DATABASE_URL
node node_modules/prisma/build/index.js migrate deploy
npm test
```

macOS/Linux 的测试窗口对应命令：

```bash
export TEST_DATABASE_URL=$(node --env-file=.env.local -p 'process.env.TEST_DATABASE_URL')
export DATABASE_URL="$TEST_DATABASE_URL"
node node_modules/prisma/build/index.js migrate deploy
npm test
```

测试完关闭这个窗口。不要在它里面启动日常开发服务。开发用 `127.0.0.1:55439/capstone`；测试用 `127.0.0.1:55440/capstone_c8_eval?schema=public`，是独立 PostgreSQL 服务和数据卷。测试 runner 必须核对 host、port、database、schema 和 `DATABASE_URL === TEST_DATABASE_URL`；复制旧阶段的 guard 时只把明确的本地 allowlist 改为此测试地址，保留其他拒绝规则。

## 3. C3：启动 Garage 并验证私有性与 CORS

```powershell
docker compose --env-file .env.local up -d garage
docker compose --env-file .env.local exec -T garage /garage status
docker compose --env-file .env.local exec -T garage /garage bucket info capstone-private
npm install --save-exact @aws-sdk/client-s3@3.1147.0 @aws-sdk/s3-request-presigner@3.1147.0
node scripts/check-local-storage.mjs
```

Garage 通过 `--single-node --default-bucket` 自动建立单节点布局、私有 bucket 和关联 key，不需要手工猜 Node ID 或运行 layout assign。应看到健康节点、bucket 存在。刚启动时尚未就绪可稍等再执行 status。

先安装固定版本的两个 S3 SDK 包，这是 C3 存储 adapter 本就需要的依赖。检查脚本只用于本地基础设施，配置 CORS、上传一份无敏感信息的 TXT、验证 signed GET、验证匿名 GET 被拒、验证 PUT preflight；只输出 PASS，不打印密钥和签名 URL。它保留 `aifoundry-infra-check/storage-check.txt` 这个合成对象，重复运行覆盖同一个检查对象。

`.env.local` 中 `S3_ENDPOINT=http://127.0.0.1:3900`、region 为 `garage`、bucket 为 `capstone-private`。应用 adapter 必须使用 path style。开发服务在宿主机运行，端点必须是浏览器能访问的地址；不要把 Compose 内的 `http://garage:3900` 填进应用签名 URL。Secret 只在服务端。

默认应用来源是 `http://localhost:3000`，`infra/cors.json` 同时列出 `http://127.0.0.1:3000`。换端口时手工同步 `C3_APP_ORIGIN` 与 CORS 的 AllowedOrigins，再运行检查；不要改成 `*`。命令行 preflight 通过后，仍需在 C3 页面真正上传 TXT，观察浏览器 Network 中 OPTIONS/PUT 成功，以及处理后状态 READY。CORS 控制浏览器访问，不能代替 bucket 的签名鉴权。

随后完成 C3 migration，在开发库检查扩展已启用：

```powershell
docker compose --env-file .env.local exec -T db psql -U capstone -d capstone -c "SELECT extname, extversion FROM pg_extension WHERE extname='vector';"
```

再按本课验证 1024 维检索、Alice/Bob 隔离和失败重试。基础设施检查不能证明你的上传路由、文件处理或 ownership 已正确。

## 4. C8：复用隔离 Eval 库

`eval-db` 的 55440 端口与 C8 的严格 allowlist 对齐。默认数据库是 `capstone_c8_eval`；首次初始化还创建 `capstone_c8_real`，供可选真实模型评估。二者都与日常开发库分离。运行前在独立测试窗口设置上述 `DATABASE_URL` / `TEST_DATABASE_URL`，部署全部已提交 migration，再执行自己实现的 Eval runner。真实评估换到 `capstone_c8_real`，须对两个变量同时换库、部署 migration 并显式 opt-in；不要给默认 deterministic runner 提供付费 Key。

## 5. 停止与排错

暂停课程时执行 `docker compose --env-file .env.local stop db eval-db garage`；恢复时执行相应的 `up -d`。named volumes 保留数据与凭据。不要重新生成密码来修连接错误，也不要删除数据卷来排错。

| 症状 | 先检查 |
|---|---|
| docker 无 Server / WSL 失败 | Docker Desktop、WSL 2、Linux containers；按官方安装文档排错 |
| 端口被占用 | 55439、55440、3900 的占用进程；不要停掉不认识的服务，修改端口需同步 URL 与测试 allowlist |
| 镜像拉取失败 | Docker 网络/代理与官方 registry；不要让 AI 随意换第三方镜像 |
| authentication failed | `.env.local` 是否与首次创建数据卷时的密码一致；初始化脚本保留旧文件 |
| vector 不在 available extensions | 是否真的连接了 pgvector 镜像；不要误连 Windows 原生 PostgreSQL |
| vector 未出现在 pg_extension | C3 migration 是否在这个数据库正式执行 |
| Garage 不健康 / bucket 不存在 | `/garage status`、启动 flags、配置文件挂载、持久卷；不要把 bucket 改公开 |
| storage checker 失败 | Garage 就绪、S3 SDK 安装、凭据与 bucket、CORS 的 origin/端口；不要分享原始 secret |
| CLI 检查过了但浏览器 PUT 失败 | 浏览器实际 Origin、preflight、path style、签名中的 host/Content-Type/过期时间 |

已有 `.env.local` 的项目：先在本地编辑器对照 `.env.example` 补缺失变量，生成新的随机值可用 `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`，只用于**尚未初始化**的服务。已有 DB/Garage 必须沿用原凭据。需要重建或批量清理时由你确认并手动处理，课程脚本不删除文件、目录或卷。

安装依据：[pgvector 官方安装说明](https://github.com/pgvector/pgvector#installation)、[Garage Quick Start](https://garagehq.deuxfleurs.fr/documentation/quick-start/)、[Garage 配置](https://garagehq.deuxfleurs.fr/documentation/reference-manual/configuration/)。版本锁定是为了复现实操；它不代表这套单节点环境已经适合生产。
