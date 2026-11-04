# H23 隔离实验

从仓库根运行：

```powershell
node docs/deepseek-harness-v2/h23/scripts/run-labs.mjs A
node docs/deepseek-harness-v2/h23/scripts/run-labs.mjs B
node docs/deepseek-harness-v2/h23/scripts/run-labs.mjs C
node docs/deepseek-harness-v2/h23/scripts/run-labs.mjs D
node docs/deepseek-harness-v2/h23/scripts/run-labs.mjs X
node docs/deepseek-harness-v2/h23/scripts/run-labs.mjs
```

最后一条是唯一计数用 TAP：25 项，C7/D18。A/B/C/D 是分项演示，X 复用 B1/C1，不额外计测试。所有程序亦完整折叠在正文。运行前先预测，再运行，最后按参考答案解释原始帧、PID、事件和 JSONL。

固定源码 f3803c96974ad4a94195fb97e5c637e9c2a3afe3。默认源码根为本机研究缓存，可用 HARNESS_SOURCE_CACHE 指向同一固定字节树，runner 会逐一比对 9792 文件哈希。默认六棵依赖树及 anchor 见 run-labs.mjs；所有直接/传递包版本和 integrity 均对固定 pnpm-lock.yaml 验证，不接受“最新版”。复现机器应按这些树的精确版本建立专用缓存，设置 H23_DEPS_ANCHOR、H23_ZOD_ANCHOR、H23_NATIVE_ANCHOR、H23_LIMIT_ANCHOR、H23_PTC_ANCHOR、H23_WIRE_ANCHOR；不得指向个人运行时配置。已有五树与安装版本记录见 evidence/dependencies.json。

本课新增 wire 树的精确安装命令（专用研究缓存，无业务 package 变更）：

```powershell
npm install --prefix C:/Users/QYF/.codex/research/h23-wire-deps --save-exact --ignore-scripts --no-audit --no-fund ws@8.21.3
npm install --prefix C:/Users/QYF/.codex/research/h23-wire-deps --save-exact --ignore-scripts --no-audit --no-fund eventsource-parser@3.1.0
npm install --prefix C:/Users/QYF/.codex/research/h23-wire-deps --save-exact --ignore-scripts --no-audit --no-fund mime-types@3.0.2
```

mime-db1.54.0 为固定传递依赖。SDK 入口不是 bundle：薄 mjs 先注册仓库现有 tsx，再装 bootstrap，再 import sdk-runtime.ts，保留官方相对 package.json 语义。Host tsconfig 没有的 Client 子路径在 bootstrap 中逐项映射到已核实源文件；ws 用正式 ESM wrapper，不能拿 CJS named export 假装已加载。runner 只使用隔离 scratch、最小白名单环境与新 DSH_HOME，保留失败和成功证据，不批量清理。

SDK 使用真实 CLI parser，但不执行发行版 sdk-minimal Profile。作者 Profile 的 bundles/patch/cordis 配置均为空数组，真实 loadProfileDirectory 与 boot 建立 AppBoot/Loader，prepare 装入真实 Session/AgentLoop/Tools/Mock LLM/JSONL，Loader settled 后挂正式 SDK Server。模型路由固定 fixture/parent，绝无真实付费调用。stdin/stdout 是真实进程管道；observe 的私有 child 字段仅用于作者抓帧，不是 SDK 公共 API。关闭使用正式 SDK shutdown/close，检查 exit0；不杀测试主进程。

Web 使用正式 Client RPC/Gateway/SessionController/事件流/AgentLoop/JSONL，fetch、stream 与认证 Peer 是受控协作者。没有真实 WebSocket、HTTP cookie/Origin 鉴权或完整 Web UI，不能从本课测试推导安全认证。CLI dump、Connection Generation、revision 缺口等不含模型循环的用例归 C；真实 Loop+Mock 的组合归 D。

Resume 在同一隔离存储根正常关闭后以新 SDK PID 打开；与断电/崩溃恢复不同。仅 allowed-once 执行受控内存副作用；迟答/缺应答失败关闭。所有文件位于新临时根，除正常 JSONL 追加/受控 fixture 版本损坏外不接触真实 Session。fs.rm 的 recursive 调用被 bootstrap 拒绝，所有临时目录保留。

故障时查看 docs/deepseek-harness-v2/h23/evidence/run-*.json、runner-failure-*.json、traces-*.json；最终索引见 lab-results.json 和 test-grades.json。不要删除历史失败来美化通过率。完整发行 Profile、外部 Provider、真实 Web UI 与 E 级集成都未验证。
