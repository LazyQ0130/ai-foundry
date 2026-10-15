# Stage 3 Starter：个人知识工作台

这是 Stage 2 完成状态的干净项目起点。你可以从这里开始 Stage 3；它没有模型调用、Embedding、RAG 或 Evaluation。使用它不等于已经学会 Stage 2。

需要符合项目 engines 的 Node.js、npm、PostgreSQL 和一个单独用于学习的数据库。没有 Docker 也可以开始：按课程网站的「免费环境页 → 工具安装 → 第 5 项 B」建立独立 Neon 学习库，在 SQL Editor 核对库名和 vector 扩展，再从 Connect 复制同一库的 Direct／unpooled 直连地址。保留连接串安全参数，只填进本机配置，不发给 AI。已有可用 Docker 则用 compose.yaml 的本地路线；不要求先安装 WSL 或进入 BIOS 才能选择云库。

复制 `.env.example` 为本地 `.env`，用实际学习库地址替换 `DATABASE_URL`；其他配置保留。已有 `.env.local` 时核对同名键，避免应用与 CLI 指向不同库。`.env` 被 Git 忽略；按环境页第 6 项确认后再运行。保留 Starter 已锁定的 Prisma 6.19.3，不照抄其他版本的初始化或 db push。

只有本机 Docker 路线先执行下列命令，确认有 Client 和 Server、db 为 Up／healthy；云路线跳过这三条：

```bash
docker version
docker compose up -d
docker compose ps
```

随后两条路线都在含 `package.json` 的本项目目录首次运行：

```bash
npm install
npx prisma migrate deploy
npx prisma migrate status
npx prisma generate
npm run dev
```

打开终端这次显示的 Local 地址（通常 `http://localhost:3000`），注册两个练习账号，分别创建资料并确认彼此看不到对方的内容。随后验证修改、删除、退出与重新登录；`npm run build` 应通过。三次版本化 migration 保存在 `prisma/migrations`。不要用平台数据库、作者数据库或其他生产库练习。

成功应有三次已有迁移、状态 up to date、Client 生成和 Local／Ready。云路线不运行 docker 命令，Docker 路线先确认本机库 healthy。连接错误先查实际库与配置来源，不 reset、不切生产库、不重试不确定的写入。原云库或本机库可以延续到 3.4，届时再增量加入第四次迁移，不创建空库替换原记录。完成检查后回到 3.1，在**这份项目**里增加第一个 AI 问答入口。

3.1～3.7 始终在这份项目根目录执行命令，不进入 `scripts`、`.runtime` 或工具包解压目录运行。窗口 A 保持 dev，窗口 B 每次重新 cd；浏览器、`CHECK_BASE_URL`、`EVAL_BASE_URL` 用同一个 Local 主机名与端口，数据库 URL 则仍是云地址。课程网站「环境说明 → Stage 3 全程路线」集中列出逐课衔接、模式切换和失败恢复。

每课先 Mock、后真实；上一课 real 收尾时，下一课需本人把 `.env` 的 `AI_PROVIDER_MODE` 改回 mock、停止并重启 dev。保留数据库和模型凭据，只换模式；Mock／真实向量不能改标签混用。3.4 之后始终四次 migration，`test`、`test:db`（含只读 `--check-target`）和评估 Runner 按各课由你与 AI 增量开发，不是本 Starter 已完成的功能。

3.7 的 Mock 和真实评估分别用新的专用账号，各自只入库同一固定三篇资料；真实一轮另需本人明确确认。最新版 Stage 3 工具会在启动前把旧报告复制到 ignored `.runtime/stage3-eval-history/`，失败或中断不算完整一轮，存档也不代表新结果。重跑可能再次消耗额度，不自动续跑或重试。恢复时按原 ID 只读核对和原模式复验；Git 保存源码，不备份云数据库与秘密配置。
