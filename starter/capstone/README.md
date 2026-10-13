# AI 研究工作台 — 项目起点

从 C1 开始，把 `docs/templates/` 的空白模板复制到 `docs/product-brief.md`、`docs/user-flow.md`，完成自己的产品定义。C2 再搭建数据库、登录、工作区和第一条研究任务。

Starter 包含 Next.js、TypeScript、ESLint、测试命令、空应用和产品模板，以及可逐课启动的本地 PostgreSQL/pgvector、Garage 配置。产品 schema、账户、研究 UI、模型和存储 adapter 由你在课程中实现。

需要 Node >=20.19。先运行 `npm ci`、`npm run lint`、`npm run typecheck`、`npm test`、`npm run build`。

C1 不需要 Docker 服务。进入 C2/C3 前按 [本地环境指南](docs/local-environment.md) 安装 Docker、生成本地凭据、启动独立开发/测试库、验证 pgvector、私有 bucket 与 CORS。已有项目只补入环境文件，保留自己的成果。环境脚本不会实现产品功能，也不会删除数据。
