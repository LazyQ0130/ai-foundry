# AIFoundry 线上部署记录（2026-10-04）

本文件记录 AIFoundry 在**朝晞云服务器**上的部署方式、日常运维命令与注意事项。
它不是课程内容，是给运营者自己看的操作手册。

---

## 一、站点与服务器

| 项 | 值 |
| --- | --- |
| 站点地址 | <https://aifoundry.top>（`www` 301 跳转到主域） |
| 服务器 | 朝晞云 香港轻量 4核8G 15Mbps 70G，Ubuntu 24.04.1 |
| 公网 IP | <server-ip> |
| 数据盘占用 | 约 9.9G / 68G（15%） |
| 内存占用 | 约 0.8G / 7.8G |
| DNS | DNSPod：`@` 和 `www` 两条 A 记录 → <server-ip>（部署前已配好） |
| HTTPS 证书 | Let's Encrypt，自动签发与续期（由 Caddy 负责） |

### ⚠️ 这台服务器上还跑着另一个站点

`vclab.top`（Vibe Coding Lab）和 AIFoundry **共用同一台服务器**。两者互不影响：

```
Internet
   │  :80 / :443
   ▼
Caddy（Docker 容器，--network host，自动 HTTPS）
   ├── vclab.top            → 127.0.0.1:3000   (vibe-coding-lab-app-1, Next.js)
   └── aifoundry.top        → 127.0.0.1:3001   (systemd: aifoundry, Express)
                                  │
                                  └── DATABASE_URL → 127.0.0.1:<db-port>
                                        (Docker: aifoundry-db, postgres:16-alpine)
```

**不要删除或修改 `vibe-coding-lab-*` 容器和 `/opt/vibe-coding-lab/` 里的业务文件**，
只改其中的 `Caddyfile`（这是两个站点共用的反代配置）。

---

## 二、登录服务器

登录方式、地址和端口请查看本地私有运维记录。

---

## 三、部署结构

| 项 | 位置 |
| --- | --- |
| 代码 | `/opt/aifoundry`（`git clone` 自 `github.com/LazyQ0130/ai-foundry`，仓库为 public） |
| Node 运行时 | `/opt/node`（v22.23.3），已软链到 `/usr/local/bin/{node,npm,npx}` |
| 环境变量 | `/opt/aifoundry/.env`（600 权限，已被 `.gitignore` 忽略，`git pull` 不会覆盖） |
| 数据库密码 | `/opt/aifoundry/.dbpass`（600） |
| Session 密钥 | `/opt/aifoundry/.session-secret`（600） |
| 服务单元 | `/etc/systemd/system/aifoundry.service` |
| 应用日志 | `/var/log/aifoundry.log` |
| 数据库容器 | `aifoundry-db`（postgres:16-alpine，`127.0.0.1:<db-port>`，卷 `aifoundry_pgdata`） |
| 数据库名/用户 | 都是 `aifoundry` |
| 备份 | `/opt/aifoundry/backup.sh` → `/opt/aifoundry/backups/`，保留 14 天 |
| 定时任务 | root crontab `35 3 * * *`（VCL 的是 `25 3 * * *`，两者并存） |
| 反代配置 | `/opt/vibe-coding-lab/Caddyfile`（备份为 `*.bak-<时间戳>`） |

### 关键环境变量（`/opt/aifoundry/.env`）

```
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://aifoundry:<密码>@127.0.0.1:<db-port>/aifoundry?schema=public
SESSION_SECRET=<64 位随机值>
APP_ORIGIN=https://aifoundry.top
ADMIN_PHONE=<管理员手机号>
ADMIN_INITIAL_PASSWORD=<初始管理员密码>
WECHAT_QR_URL=/wechat-contact.jpg
ALL_ACCESS_PRICE=599
ALL_ACCESS_PROJECTS_PRICE=699
TRUST_PROXY_HOPS=1
# 验证码邮件（服务端专用，授权码不得提交到 Git）
SMTP_HOST=smtp.qq.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=<发信邮箱>
SMTP_PASSWORD=<SMTP授权码，不是邮箱登录密码>
SMTP_FROM_NAME=AIFoundry
```

- `APP_ORIGIN` 必须是 `https://`，否则生产模式启动即报错。
- `TRUST_PROXY_HOPS=1` 是因为前面有一层 Caddy，**只有单层可信反代时才设 1**。
- `ADMIN_PHONE` / `ADMIN_INITIAL_PASSWORD` 只在**首次 seed、库中无该手机号时**生效，
  之后改这两个值不会重置已有密码。
- `ALL_ACCESS_PRICE` 是「全阶段课程版」的展示价格，`ALL_ACCESS_PROJECTS_PRICE` 是「项目版」的展示价格，改完重启服务即可生效。
- 绑定邮箱、换绑和找回密码依赖 `SMTP_*` 配置。本机 `.env` 不会随 Git 部署到服务器；必须在生产 `.env` 单独配置。修改后重启 `aifoundry`，使 systemd 重新加载环境变量。

### 邮件发送排查与验证

在服务实际运行目录执行连接和认证检查（不发送邮件）：

```bash
cd "$(systemctl show -p WorkingDirectory --value aifoundry)"
node --input-type=module -e 'const {verifyMailConnection}=await import("./server-dist/server/services/mail.js"); await verifyMailConnection(); console.log("SMTP connection and authentication passed")'
```

此命令使用已经构建的运行时模块，不依赖开发工具 `tsx`。连接和认证通过仅证明可以登录邮件服务；实际发信需另行授权测试，且 SMTP 接受邮件不代表已确认收件箱收到。不要把 `.env` 内容、SMTP 授权码或验证码输出到日志。

2026-10-16 线上排查确认：生产 `.env` 和运行进程缺少全部 `SMTP_*` 参数，导致绑定邮箱返回「邮件暂时发送失败，请稍后重新获取」。修复前已将原配置备份为 `/opt/aifoundry/.env.before-mail-20261016T134242Z`（600 权限）；补齐 6 个参数并重启 AIFoundry 后，运行进程配置、SMTP 连接及认证均通过。一封经管理员授权、发往发信邮箱本身的测试邮件已获 SMTP 接受，站点内外健康检查正常。

### 2026-10-17：课程大纲按阶段权益返回

完整课程元数据改在 `server/data/courses.ts` 维护；`src/data/courses.ts` 是 `npm run build:catalogue` 生成的公开概览，不应直接编辑。正式 `npm run build` 会先生成公开概览。种子、服务端与内容校验工具读取服务端完整数据，前端仅通过 `/api/stages` 在当前账号拥有对应 ACTIVE 阶段权益时取得完整大纲。该接口使用 `private, no-store` 并按 Cookie 区分响应；登录、退出与权益变化会刷新并隔离目录缓存。

未开通用户不能展开课程介绍页或课程目录的逐课内容；免费体验仍开放。公开构建扫描同时检查付费逐课说明和学习起点。上线时将旧 `dist` 移到非公开备份位置，新的公开目录仅含本次构建，避免旧哈希资源继续提供历史大纲。未删除文件或目录。

本次备份：`/opt/aifoundry/backups/course-outline-20261017T082300Z`，包含旧前端、服务端构建与改动前源码。134 项测试通过；线上匿名目录脱敏、旧资源不再公开、免费体验及健康检查通过。

### 项目工坊逐课内容采用独立权益

项目工坊的完整课名、教学阶段与逐课说明分别维护在 `server/data/capstoneLessons.ts` 和 `server/data/capstoneShowcase.ts`。`npm run build:catalogue` 同时生成公开版元数据；公开前端只保留课时标识、统计和 C1 试看入口，不包含 C2–C9 的真实课名与逐课说明。

`/api/capstone` 仅在当前账号具有 ACTIVE 的 `project-lab` 产品权益时返回完整目录；游客、仅开通四阶段课程、已撤销或已禁用账号的 `lessons` 均为空。课程介绍页「项目实战」与项目工坊总览共用权限组件；课内侧栏与标题也使用服务端授权返回的数据。登录、退出、切换账号与项目工坊权益变化会隔离并刷新目录缓存。

发布须同时更新前后端，在新公开目录中放入本次构建，保留旧目录到非公开备份位置。可沿用已验证的 Node 依赖与 SMTP 环境配置；没有数据库结构变更时不做迁移或重置。课程导读文案和三张教学配图随同发布。

---

## 四、日常运维命令

```bash
# 看服务状态
systemctl status aifoundry --no-pager

# 重启
systemctl restart aifoundry

# 实时日志
tail -f /var/log/aifoundry.log
journalctl -u aifoundry -n 100 --no-pager

# 数据库容器
docker ps
docker exec -it aifoundry-db psql -U aifoundry -d aifoundry
```

### 更新代码后重新部署

```bash
cd /opt/aifoundry
git pull
npm install --no-audit --no-fund      # 依赖有变化时才需要
npm run db:migrate                    # 有新 migration 时才需要
npm run db:seed                       # 只在课程目录/发布状态有变化时需要
npm run build                         # 生成 dist / server-dist / Starter ZIP
systemctl restart aifoundry

# 验收
curl -s -o /dev/null -w "%{http_code}\n" https://aifoundry.top/
```

> **必须**在 `/opt/aifoundry` 目录下启动服务：服务端读取 Starter ZIP 用的是
> 相对路径 `starter/aifoundry-stage1-starter.zip`。systemd 单元里已经设好
> `WorkingDirectory=/opt/aifoundry`。

### 备份与恢复

```bash
# 手动备份（脚本每天 03:35 自动跑一次，保留 14 天）
/opt/aifoundry/backup.sh

# 恢复（会覆盖现有数据，谨慎）
gunzip -c /opt/aifoundry/backups/aif-<时间戳>.sql.gz | \
  docker exec -i aifoundry-db psql -U aifoundry -d aifoundry
```

### 修改反代配置

```bash
vi /opt/vibe-coding-lab/Caddyfile          # 改完先看一遍
docker exec caddy caddy validate --config /etc/caddy/Caddyfile
docker exec caddy caddy reload   --config /etc/caddy/Caddyfile
```

Caddy 会自动为新域名申请证书，不需要手动跑 certbot。

---

## 五、必须知道的坑

1. **Docker Hub 在这台服务器上不可达**（`registry-1.docker.io` 无路由，各种国内镜像源也没有）。
   现有镜像只有 `postgres:16-alpine`、`caddy:2-alpine`、`alpine:latest`、`vibe-coding-lab-app:latest`。
   要新增镜像得先想办法（换源、离线导入），别直接 `docker pull`。
2. **不要用 22 端口 SSH**，用 <ssh-port>。
3. **本机（开发机）出网走代理**，直连服务器 SSH 可能被拉黑。
4. 服务器上**没有 gcc/g++/make**，Node 原生模块靠预编译包安装（当前依赖都正常）。
5. 应用以 root 身份运行（systemd 单元已加 `NoNewPrivileges` / `PrivateTmp` /
   `ProtectSystem=full` / `ProtectHome`）。若想更严格，可另建专用系统用户再迁移，属可选项。

---

## 六、上线时的初始状态（2026-10-04）

- 课程目录：Stage 1~4 全部 `isPublished=true`、`isPurchasable=true`，
  课时 7 / 8 / 7 / 8 全部已发布，Stage 1 有 2 节试看（与开发库一致）。
- 后台无任何学员、无任何授权记录（全新库）。
- 管理员：手机号 `<管理员手机号>`，昵称「管理员」，角色 ADMIN，状态 ACTIVE。

> **建议尽快在站点「个人中心」里修改管理员密码。** 初始密码在部署过程中以明文形式
> 出现过（控制台页面、本文档的前置沟通），属于已知暴露面。


## 2026-10-08：Phase A2 本地运行依赖边界补充（未部署）

以上历史部署记录保留。本轮没有访问或修改服务器。后续交付应区分 build 环境与 runtime：完成 Prisma/migration/seed/build 后再对运行副本执行 npm prune --omit=dev --no-audit --no-fund，并验证生成 client/原生模块可用、runtime tree 不含受影响 Tailwind/braces 链。下一次更新前须重新安装 build 依赖。

仅 npm audit --omit=dev 或仓库 devDependency 标记不能证明现网 node_modules 已移除开发工具。详情与本地证据见 dependency-risk-classification.md；当前线上安装状态未核验，不改变任何 Capstone Cloud Verification 状态。

构建只执行受信任源码；Linux 可用 timeout --signal=TERM --kill-after=10s 600s npm run build 设置上限。若以后接 fork-PR CI，必须无生产 secrets、不自动生产部署、设置 job timeout。本轮未增加 CI 平台。
