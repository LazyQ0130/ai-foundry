# Stage 3 Starter：个人知识工作台

这是 Stage 2 完成状态的干净项目起点。你可以从这里开始 Stage 3；它没有模型调用、Embedding、RAG 或 Evaluation。使用它不等于已经学会 Stage 2。

需要 Node.js 20、PostgreSQL 和一个单独用于学习的数据库。复制 `.env.example` 为本地 `.env`，换掉示例密码和地址；`.env` 被 Git 忽略。首次运行：

```bash
npm install
npx prisma migrate deploy
npx prisma migrate status
npm run dev
```

打开 `http://localhost:3000`，注册两个练习账号，分别创建资料并确认彼此看不到对方的内容。随后验证修改、删除、退出与重新登录；`npm run build` 应通过。三次版本化 migration 保存在 `prisma/migrations`。不要用平台数据库、作者数据库或其他生产库练习。

若还没有本地 PostgreSQL，可按 Stage 3.4 的 pgvector Docker 路线启动独立学习库。完成本页检查后，回到 3.1 课程，在**这份项目**里增加第一个 AI 问答入口。
