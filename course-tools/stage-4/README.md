# Stage 4 验收工具

只复制本包 `scripts` 文件到自己的 Stage 4 项目；不要覆盖自己的页面、`package.json` 或 `.env`。重复文件先比较。4.6 提供固定的三单元核心检查；4.7 的完整 Eval 案例、Runner 和界面仍由该课开发任务生成。本包不包含 Agent 完成答案。

## 4.6：三次学习，使用同一套固定检查

完成第五次迁移后，在自己的项目根目录逐条执行：

```bash
node scripts/check-persisted-run.mjs --prepare
```

```bash
npm run build
```

第一单元：`node scripts/check-persisted-run.mjs --part persistence`，五项检查保存、权限、只读与真正重启回读。

第二单元：重新 build，运行 `node scripts/check-persisted-run.mjs --part confirm`，七项累计检查，包含八次同 Action 并发确认及重启后重试。

第三单元：重新 build，运行 `node scripts/check-persisted-run.mjs --part recovery`，九项累计检查，包含并发 Resume 与事务中途失败回滚。无参数或 `--part all` 运行同样的九项完整核心检查。

工具只使用 `127.0.0.1:55433/stage4_checks`，从现有 `stage4_learning` 地址派生；设置了 TEST_DATABASE_URL 时必须精确指向同一专用库。4.7 的 stage4_l7 配置不能用于本课。每次运行创建新的合成账号，保留记录供复核，不删文件、不清库。测试使用随机的进程内签名 Secret 和 Mock 模式，不调用真实 Provider；测试服务由工具独立启动和关闭。

接口与模型按 4.6 正文实现。第三单元还需实际产品模块 `lib/agent-confirm-transaction.ts` 导出 `confirmPersistedAction({ token, ownerId, secret, afterResourceCreate? })`，返回 `{ saved, replayed }`；HTTP Confirm 调用同一函数。注入回调在 Resource.create 之后、Action 更新之前执行，仅限直接测试，HTTP 不接受 hook。没有该函数或协议不匹配应修产品实现，不能删除断言或把检查输出改成 PASS。

Windows PowerShell 紧接着查看 `$LASTEXITCODE`，macOS 查看 `echo $?`。失败为非 0；汇总中的 5/7/9 只说明已运行的单元。工具不替代本课取消、非法字段、跨用户 Confirm、预算边界、页面操作和真实 Provider 验收。错误仅输出案例名和安全类别，不输出 Token、Cookie 或连接串。

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
