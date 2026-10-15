# Stage 4 验收工具

只复制本包 `scripts` 文件到自己的 Stage 4 项目；不要覆盖自己的页面、`package.json` 或 `.env`。重复文件先比较。固定 Eval 的案例、Runner 和界面由 4.7 的开发任务生成，本包只提供环境加载、准备与启动入口，不包含 Agent 完成答案。

## 4.7：准备评估库

先确认 Docker 已运行、`docker compose ps` 显示 db healthy，且日常 `.env` 的 `DATABASE_URL` 已是本机 `127.0.0.1:55433/stage4_learning`。原连接串中的密码、用户名和编码保持原样，不在终端重新输入。

```bash
node scripts/prepare-agent-eval.mjs
```

工具会从现有地址安全生成 `stage4_l7` 地址；库已存在就沿用，否则只创建这个固定测试库，然后在子进程里给 Prisma 临时指定该地址、应用现有五次迁移并检查状态。不会修改 `.env` 的日常 `DATABASE_URL`、删除数据库或迁移。`PASS test-database`、`PASS migration-deploy`、`PASS migration-status`、`PASS prepare-agent-eval` 全部出现才继续。

如已有本机 `.env.course-checks` 的 `TEST_DATABASE_URL`，只接受同一指定本机端口的 `stage4_l7`。没有就不必创建或手工填写此项。配置文件不能出现日常 `DATABASE_URL`；该值仍由项目原环境文件读取。

## 构建并运行

让 AI 将 `package.json` 的 `eval:agent` 设置为 `node scripts/run-agent-eval.mjs`，实际 Runner 放在 `eval/stage4-agent-eval.mjs`；工具在独立子进程中加载本机测试配置并执行它。`.gitignore` 必须含 `/.runtime/`，并保留 `.env*`。一次一条执行：

```bash
npm run build
```

构建成功后：

```bash
npm run eval:agent
```

Eval 自己启动本机 Mock/Stub 服务，不需要你为它再跑 `npm run dev`。默认评估端口 32747，日常服务端口与它不同即可。若该端口已被占用，在本机 `.env.course-checks` 追加 `AGENT_EVAL_PORT=32748` 再运行，不随意停止其他项目。

成功报告应有 `Cases 20/20; hard gates PASS`，三个硬门槛均为 0。报告在 `.runtime/stage4-agent-eval/report.md` 与 `report.json`，在编辑器文件栏打开。单案例：

```bash
npm run eval:agent -- --case cross-user-read
```

单案例通过只证明该项，不代表全矩阵。教学红灯：

```bash
npm run eval:agent -- --case unapproved-write --inject-failure unapproved-write
```

本条**应该**输出 FAIL 并退出失败，但不实际越权写入。紧接着 Windows PowerShell 输入 `$LASTEXITCODE`，macOS 终端输入 `echo $?`，非 0 说明失败被正确传给终端；必须在运行其他命令前查看。不传注入开关重跑该案例应恢复 PASS 与 0。

## 排障

`AGENT_LEARNING_DATABASE_REQUIRED`／`AGENT_TEST_DATABASE_REQUIRED`：检查目标，工具故意拒绝云库、日常库作为 Eval 目标或其他端口，不改保护条件。`FIVE_MIGRATIONS_REQUIRED`：你还没完成 4.6 或目录不对，先核对五次历史迁移，不新造或删除迁移凑数。`TEST_MIGRATION_FAILED`：先确认 db healthy、用户名和原密码可用；若打印 Prisma 错误代码，按该代码诊断，不运行 reset/drop。`GIT_IGNORE_REQUIRED`：给 `.gitignore` 补 `/.runtime/` 并核对配置被忽略。`EVAL_START_FAILED`：先检查依赖、Runner 文件和构建，别把缺文件解释成测试通过。

测试账号和非敏感资料留在专用评估库，工具不会自动清库。Cookie、审批 Token、API Key、数据库连接串不写进报告或聊天。

`CHECK_CONFIG_CONFLICT` 时先关闭旧终端、重新打开并 cd，统一不同环境文件中的同名测试配置，不绕过冲突检查。
