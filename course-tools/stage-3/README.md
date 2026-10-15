# Stage 3 验收工具

只复制本包 `scripts` 中的文件到自己的项目 `scripts` 文件夹，不替换页面、数据库或你已有的 `rag-eval.mjs`。配置写在项目根目录的本机 `.env.course-checks`，不要给 AI 真实密码。

全部命令在自己的知识工作台根目录执行，应能看到 `package.json`、`scripts`、`prisma`；不进入本工具包、`scripts` 或 `.runtime` 运行。云路线从 3.1～3.7 沿用同一 Neon 学习库；数据库在云端，Next 应用和检查命令仍在本机，EVAL/CHECK 的地址不是 DATABASE_URL。详见课程环境页「Stage 3 全程路线」。

Stage 3.1 的 HTTP 边界检查：确认项目服务端配置为 `AI_PROVIDER_MODE=mock`，保存并重启 `npm run dev`。在项目根目录的 `.env.course-checks` 明确填写 `CHECK_BASE_URL=http://localhost:3000`，主机名和端口换成自己的实际 Local；保留其他配置，同名键只写一次，`git check-ignore .env.course-checks` 应输出该路径。先配置再运行，即使是默认端口也不省掉。浏览器、CHECK_BASE_URL、EVAL_BASE_URL 都用同一个 Local 主机名与端口。

```bash
node scripts/course-checks.mjs --case ai
```

应看到未登录 401、空白/超长输入 400、异常 Origin 403，最后 `PASS ai`。不会发送合法模型请求，不用你的真实 API Key；Cookie 只在脚本内存中。其他 Cookie、Session、ownership、Origin 案例用法与 Stage 2 工具一致，仍只允许本机学习环境。

Stage 3.7 先将服务端 `AI_PROVIDER_MODE=mock` 并重启，在本机页面注册一个新的专用 Mock 评估账号，如 `rag_eval_mock_01`，用自己的测试密码，在该账号内只导入本课固定三篇知识资料，各篇 ready。不要重复导入同标题或复用日常混合资料账号。AI 按本课生成 `scripts/rag-eval.mjs`、`eval/knowledge-pack.json` 和 `eval/rag-cases.json` 后，在项目根目录创建／更新 `.env.course-checks`：

```text
EVAL_BASE_URL=http://localhost:3000
EVAL_USERNAME=rag_eval_mock_01
EVAL_PASSWORD="这里换成自己注册的测试密码"
EVAL_MODE=mock
EVAL_REAL_CONFIRM=NO
```

确认 `.gitignore` 含 `.env*` 和 `/.runtime/`；`git check-ignore .env.course-checks .runtime/course-check-proof` 应输出两项。保持该项目 `npm run dev` 开着，固定知识包入库后等待至少 60 秒，然后在另一个项目终端执行：

```bash
node scripts/run-rag-eval.mjs
```

本入口先读取本机配置，再运行**你本课实现的 Runner**。应逐题出现 `Case 1/12` 到 `Case 12/12`，12 题之间至少等 13 秒，末尾摘要有 `caseCount:12` 和报告路径。结果不必全绿；Mock 数字不代表真实模型质量。

本课要求 Runner 把 Mock 标为 `scope=mock_pipeline_only`，明确输出 `automaticChecksPassed`、`automaticFailureCaseCount`、`automaticIssuesByType` 和 `humanSupportReviewPending`。引用未命中预期文档应显示 `expected_citation_miss`，不能显示“无错误”；命令结束不表示质量通过。内部参考 Mock 的数字不理解语义，只固定引用 Top-1 并返回示例，不判断资料是否足够；不能为固定题集加关键词规则追求全绿。Token 全部缺测时总计为 null；部分缺测只报已知总计和缺测数，不用零冒充缺测，也不据此计算整轮费用。具体来源支持仍需人工复核。

详细结果在 `.runtime/stage3-eval-report.json`，人工复核表在 `.runtime/stage3-eval-review.md`。已有报告时，入口先复制到 `.runtime/stage3-eval-history/唯一存档编号/`，打印 `PREVIOUS_REPORT_ARCHIVED`；只保存旧证据，不删除当前报告、不覆盖旧存档。查看当前文件须核对本轮 mode、runAt、caseCount，不能把启动或存档信息当成新评估完成。路径异常或复制失败时停止，不继续覆盖旧结果。

真实模式先保留 Mock 账号与资料，再用另一个新的专用账号，如 `rag_eval_real_01`。服务端设 real 并重启后，在此账号只用真实 Embedding 建立同一知识包，核对 ready／模型／1024 维；等至少 60 秒。把 `.env.course-checks` 的用户名、密码改为该账号，`EVAL_MODE=real`、`EVAL_REAL_CONFIRM=YES`，再运行同一命令。入口会保留旧 Mock 报告。不要把报告或测试密码提交到 Git。

`GIT_IGNORE_REQUIRED`：先让 AI 修好上面两个忽略规则，不改接口。`EVAL_MODE_REQUIRED`：核对文件名不是 `.env.course-checks.txt`，以及模式拼写。`CHECK_EXECUTION_FAILED`：核对 Runner 已创建、题集存在、实际端口、测试账号和资料归属；只给 AI 脱敏现象，不给原密码。429 时等限流窗口，不并发、不提高限流。出现 `providerFailures` 时这是失败记录，不能因为命令跑完就说模型全部通过。

`CHECK_CONFIG_CONFLICT`：旧终端变量或其他环境文件与 `.env.course-checks` 矛盾，重新开终端并 cd，统一同名配置，不静默覆盖。`EVAL_LOGIN_FAILED`：先在页面亲自登录该测试账号，核对实际端口与本机密码。`REAL_EVAL_CONFIRM_REQUIRED`：本轮尚未明确允许真实调用。

`EVAL_RESPONSE_MODE_MISMATCH`：要求本课 Runner 在响应 kind 不符／缺失时立即非零退出，不继续下一题；核对服务端模式、重启与评估模式后再决定是否重跑。`EVAL_REPORT_PATH_REQUIRED`：报告／存档路径应是本项目普通目录和文件，不改到外部位置或解除 Git 忽略。Ctrl+C、中途退出时没有完整新报告，先按打印进度与历史存档检查；不自动续跑，完整重跑须另行决定，真实调用需确认费用。恢复 Mock 时，同时恢复服务端 mock 并重启、EVAL_MODE=mock、EVAL_REAL_CONFIRM=NO 和原 Mock 账号密码。3.4～3.7 的数据库测试仍先用自己实现的 `npm run test:db -- --check-target` 核对独立学习库；本包不提供完成版 `test:db`。

`EVAL_CANDIDATE_IDS_REQUIRED`：停止在本题，让 AI 按 3.6 约定给 `/retrieve`、`/ask` 的 `matches` 增加真实且稳定的 sourceId，保留字段和原隔离／来源校验，重启服务。先用 Mock 页面请求，按课程 Network 步骤查看 `/ask` Response，确认每项候选有编号且最终来源编号属于本次候选，再决定完整重跑。不能按标题猜编号、删除成员检查或给旧报告补编号；本包入口不代替学员修改接口与 Runner。
