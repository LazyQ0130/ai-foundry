# Stage 4 Starter｜AI 知识工作台

这是 Stage 4 的起点。项目已有登录、个人资料、AI 问答、结构化输出、流式回答与取消、知识文档、向量检索、RAG 和引用验证。现在还没有 Agent 功能；课程 4.1 会从这里开始添加。

## 第一次启动

需要 Node.js、npm、Docker，以及能运行 Docker Compose 的环境。

1. 在解压后的项目目录运行 `npm install`。
2. 将 `.env.example` 复制为本机 `.env`，为 `STAGE4_LOCAL_DB_PASSWORD` 设置你自己的本地数据库密码，并填写与之匹配的 `DATABASE_URL`。数据库名为 `stage4_learning`，Compose 映射本机端口 `55433`。`.env` 已被 Git 忽略，不要提交。
3. 运行 `docker compose up -d`，等待数据库健康检查通过。
4. 运行 `npx prisma migrate deploy`。这会应用已存在的四次迁移，包括 pgvector；不需要 `migrate reset`。
5. 运行 `npm run dev`，打开终端提示的本地地址，注册并登录一个练习账号。

默认 `AI_PROVIDER_MODE=mock`。先用 Mock 试一次普通问答、结构化建议、流式回答和知识文档检索，确认现有 AI 知识工作台能工作。Mock 是确定性演示，不代表真实模型的回答质量。

想在后续课程使用真实百炼 Provider 时，把 `AI_PROVIDER_MODE` 改为 `real`，并在本机 `.env` 中填写同一北京地域 Workspace 的 Chat/Embedding endpoint 与你自己的 API Key。模型默认 `qwen3.7-flash`，Embedding 默认 `text-embedding-v4`、1024 维。密钥只留在服务端 `.env`，不要放进页面、课程笔记或 Git。当前 4.1 的 Mock 路径不需要真实 Key。

## 项目结构

- `app/`：页面与受保护的 API Route。
- `components/`：工作台交互。
- `lib/`：Session、Provider、限流、知识检索与引用验证。
- `prisma/`：schema 和四次已有 migration。

这个 Starter 不含 Agent Loop、Tool Registry、MCP、审批或 Agent 数据表。遇到 4.1 步骤时，从这份干净起点新增即可。
