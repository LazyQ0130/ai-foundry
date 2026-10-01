# Stage 3.3 流式问答验收（2026-10-01）

## 范围与基线

- 起点：GitHub `main` `13d60fd58c2683401a1855467f293e42385ea975`。
- 只新增 3.3 正文与从 3.2 继续的内部 A/B 参考实现，并将 3.3 时长改为 55～70 分钟。Stage 3 仍为 7 节，均 `isPublished:false`；正式课程仍为 29 节。
- 保留 `/api/ai/answer` 普通 `generate()` 与 `/api/ai/suggest` 的 `JSON.parse → Zod strict`。未修改数据库 schema、迁移、Starter、Stage 1/2/4 或平台 Auth、支付、权益。3.2 首次真实 502 的既有记录保留在 `docs/stage-3-l2-validation.md`。

## 实现与边界

- 单个 server-only `lib/ai-provider.ts` 中的 `stream()` 与 `generate()` 共用配置、请求 helper、固定 `max_tokens:256`、thinking 选项、超时和错误映射。真实请求发送 `stream:true`、`stream_options.include_usage:true`；默认受控超时 20 秒，无自动重试。
- `ProviderSseParser` 按行缓存任意网络切分，处理 `data:`、空行、`[DONE]`、delta、usage、坏 JSON 与非正常结束。Route 在 Auth、Origin、JSON、输入与共享限流通过后，发送本产品的 NDJSON `meta/delta/usage/done/error`，不透传 Provider 原始 SSE。
- 浏览器沿用原问答输入区的普通/流式切换。流式状态为 `idle/pending/streaming/completed/cancelled/failed`。第一段前 pending，收到正文后 streaming；取消立即保留部分文字并停止当前视图写入。generation id 过滤取消后 A 的迟到内容。取消由浏览器 AbortController 经 Route 的信号传给 Provider fetch。
- 浏览器交互复核时发现，停止按钮留在 `<form>` 内会在当前自动化环境中伴随一次重复提交，导致取消状态被新请求覆盖。将停止按钮移到表单外，并在流式活动期间拒绝表单重复提交；随后用真实浏览器点击首段后取消，页面保留 `MOCK：`、显示「已停止生成」，再次读取也未增长。
- Mock 固定四段、每段间隔约 800 ms，页面标注「Mock 模式 · 未调用真实模型」。

## 自动与本地实测

| 项目 | 结果 |
| --- | --- |
| `node --import tsx --test .../stream-units.test.mjs` | 3/3；任意切分、多事件、空行、DONE、usage、坏 JSON、提前关闭、A/B generation id |
| A 装配项目 `npm run build` | 通过，Next.js 15.5.26；包含 `/api/ai/stream` |
| B 装配项目 `npm run build` | 通过，保留 B 页面变化 |
| A/B `reference.test.mjs` | 两版均通过：3.1 问答、3.2 结构化与坏输出、Resource CRUD/Alice-Bob 隔离；3.3 Mock/Real Stub 流、401/403/400/429、Provider 401/5xx、部分失败、异常关闭、敏感值不进入响应、取消关闭上游连接 |
| `npm run verify` | 通过，原平台测试 67/67；内容与 bundle 检查通过 |
| `npm run check` | 通过，课程目录与 Starter 检查通过 |
| Prompt Copy | 使用现有 LessonMarkdown 实际点击，剪贴板与正文代码块严格相等，长度均为 864 字符；随后清空测试剪贴板 |
| 页面 | 同一渲染器桌面及 390px 截图检查通过；标题、Prompt 卡片与复制按钮可见，移动宽度未见横向溢出 |
| 浏览器 Mock 交互 | 本地隔离账号实际观察 pending → streaming，首段后点击停止，显示 cancelled 且保留首段；后续无新增文字 |

隔离数据库：本机 Docker `aifoundry-stage3-spike-pgvector`，`stage3_l1`，仅 127.0.0.1:55433；未连接平台/生产数据库。平台 `npm run verify/check` 使用既有平台测试环境。参考项目装配在被忽略的 `.runtime/`，不提交构建产物。

## 真实 Provider 小额验收

本机被 Git 忽略的 `.env` 提供北京地域 Workspace 凭证；本节不记录 Key、完整模型输出或原始 Provider response。调用路径是正式 TypeScript `stream()` → Next Route → 浏览器式 Node reader，模型为 `qwen3.7-flash`。

| 请求 | HTTP | 首个文本块 | 文本块数 | 总耗时 | usage | 结束 |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| 短问题正常生成 | 200 | 346 ms | 10 | 789 ms | total tokens 48 | `done=true` |
| 短问题首段后取消 | 200 | 357 ms | 1 | 首段 357 ms 时 abort | 未到尾部 | `done=false`；取消后新增视图块 0 |

取消信号确实从浏览器请求传入 Route，再传入 Provider fetch；本地 Provider Stub 在浏览器取消后观察到上游 socket 提前关闭。真实云端连接由同一正式路径发起，并在首段后中止；无法从客户端直接观察百炼内部何时停止计费，因此不对此作超出证据的保证。

## 未测试与风险

- 未部署 3.3 到生产，也未验证 Vercel 多实例下的限流；当前限流仍为单进程 Map。
- 未做弱网、跨区域或大量并发性能评估；真实调用只覆盖两条短输入。
- 未做 Embedding、pgvector、RAG 或流式结构化 JSON。本课明确停在流式问答。
