# H19 可复现实验

固定官方 Commit `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`。实践 A/B/C/D 是练习名称，C/D 是证据等级，二者不要混用。本轮真实组件包括 Cordis、Session、TokenMeter、BasicCompaction、Pruner、ImageOffload；D 再加入 AgentLoop、LlmRuntime 和受控 Adapter；X 另挂原始 JSONL。

在 AI Foundry 仓库根、Node 24 与作者 README 所列隔离依赖下运行：

```powershell
node docs/deepseek-harness-v2/h19/scripts/run-labs.mjs
node docs/deepseek-harness-v2/h19/scripts/run-labs.mjs A
node docs/deepseek-harness-v2/h19/scripts/run-labs.mjs B
node docs/deepseek-harness-v2/h19/scripts/run-labs.mjs C
node docs/deepseek-harness-v2/h19/scripts/run-labs.mjs C partial-commit
node docs/deepseek-harness-v2/h19/scripts/run-labs.mjs D
node docs/deepseek-harness-v2/h19/scripts/run-labs.mjs D overflow
node docs/deepseek-harness-v2/h19/scripts/run-labs.mjs X
```

默认运行 34 项 TAP（C19/D15）；单项输出 JSON，不覆盖总体 lab-results。C_CASES 和 D_CASES 列出全部分支；default C=success、D=pressure。完整程序、输入预测、预期轨迹与评分见 [正式教材](../lesson.md)。extras.ts 的图片、命令和检查点失败由总测试入口运行。

先核对源码和依赖再启动：runner 按 source-lock.json 校验 9619 项 SHA256；check-sources.py 另与固定 Git blob 对照。四个依赖锚点中的每个直接和传递包都按固定 pnpm-lock 的 name/version/integrity 校验。bootstrap 只把明确包解析到这些锚点，不更改业务 node_modules 或官方源码。新机器依赖准备见 [作者 README](../../../../../docs/deepseek-harness-v2/h19/README.md)。

runner 将完整程序复制到全新 mkdtemp 目录，仅向子进程设置自己的 fixture-home，环境不继承个人 DSH_HOME 或模型凭据。工具 work 只返回内存字符串，无文件和网络副作用；Adapter 不发真实 Provider 请求。A 与部分拒绝测试是内存组件夹具，不声称每个人工事件都通过磁盘格式校验；真实持久化证据只来自 X 的真实 Loop 轨迹。

所有新 scratch、JSONL、锁文件及空目录保留登记，不删除。bootstrap 拒绝递归 rm，包括上游清理分支；不要绕开保护，也不要把 root 改成已有 Session。AGENTS 禁止批量删除，因此这里不提供清理脚本；如需处理多文件，由用户手动决定。H18 的保留材料不属于本轮清理范围。

实测平台 Windows、Node 24.16.0。X 是同进程关闭旧 Context、再建新 Context 与新 JSONL 后端并调用真实 agents.resume。它不等于独立进程、默认 Zstd、真实断电或完整 Harness E 集成。Meter 数值为固定启发式或脚本 Usage，不是账单。缓存收益、真实成本、摘要质量和学员效果仍未验证。
