# A/B/C/D/E模块级证据

本轮原实验 **144/144**，互斥为 **A1/C65/D78**；新增跨课 **D5/5**，合计149项为 **A1/C65/D83**。**B未独立运行，E未运行**，不是失败。四个原错误答案负例均非零EXPECTED_FAILURE，另列且不加进149。共同Renderer本轮实际为12项，单独计数，不乘四、不算Harness组件行为。

| 课程 | 原始记录与本轮记录 | A | B独立 | C | D | E |
|---|---|---:|---|---:|---:|---|
| H09 | h09/evidence/lab-results.json、lab-tests.txt → 本目录baseline/h09/evidence同名文件 | 0 | 未跑 | 3 | 21 | 未跑 |
| H10 | h10/evidence/lab-results.json、lab-tests.txt → baseline/h10/evidence | 0 | 未跑 | 4 | 27 | 未跑 |
| H11 | h11/evidence/lab-results.json、lab-tests.txt → baseline/h11/evidence | 0 | 未跑 | 25 | 15 | 未跑 |
| H12 | h12/evidence/lab-results.json、lab-tests.txt → baseline/h12/evidence | 1 | 未跑 | 33 | 15 | 未跑 |
| 本轮跨课 | evidence/cross-course/run-*.json与tests-*.tap，最后5/5 | 0 | 未跑 | 0 | 5 | 未跑 |

上表裸路径均为`docs/deepseek-harness-v2/`下或本目录`evidence/`下。每个用例名字、原始与新日志、互斥级别可在[test-case-index.md](test-case-index.md)与[test-matrix.json](evidence/test-matrix.json)逐项核查。分类依据是lab中真实setup/action/assertions，四课最新TAP名字与新运行一致；没有只依据报告标题重新分类。C11/C21等参数化数字按TAP实际展开，不能按ID尾数计数。

| D集合 | 真正连接的官方组件与操作 | 外部替身 / 没有覆盖 |
|---|---|---|
| H09 D01–14（展开21） | Cordis、Registry、AgentLoop Factory/ReactLoopAgent、SessionStore/Session/projection、Scope；创建发布、维护屏障、退出等待、恢复入口与身份竞争 | 通常无LLM Adapter或工具；D12只模型元信息+pre-step拒绝，stream零次；D07/10/11持久后端是内存Map夹具，没有官方JSONL/磁盘/租约。虽然装配有LLM/Prompt/Tools服务，不宣称它们的生成/执行行为被测 |
| H10 D01–12（展开27） | 上述真实创建+Driver、Inbox、SystemPrompt、LlmRuntime、StreamAttempt、Session；真实Tools/NativeExecutor在工具场景串联call/result/后续请求 | 官方MockAdapter脚本；read_fixture常量与确定性异常；取消门由夹具释放；无文件/Shell/磁盘。direct/retry等虽挂Tools但未执行主体 |
| H11 D01–11（展开15） | 真Agent/Scope/Prompt/Session与LlmRuntime；系统节点更新、Context刷新/抑制、请求冻结、两Agent可见性；Tools/Native提供可见Schema | 官方MockAdapter；工具只是定义/可见性输入，主体未调用；目录是变量字符串；无生产WorkingDirectory/真实目录、无Token缓存收益 |
| H12 D15场景 | 真Loop/Prompt/Session/Runtime/Assembler/Accumulator/Attempt结算；tool-chain另真Tools/Native调用一次；逐片紧凑流与committed seq核对 | 本地ScriptedAdapter；固定README；append故障只拦截新夹具Session方法，不是磁盘故障；取消门可控；无HTTP/SSE网络、PiAi库或完整应用 |
| 新D5 | 创建前安装观察器→setup/commit/created/Handle→Inbox/Turn/Prompt→两处请求→实际结算→Handle退出；每次原始Loop请求用另一真实Session从事件前缀重建messages/config/tools/toolHistory | ControlledAdapter；固定工具；真实Session在内存；B第二次响应前断言读到结果。模型脚本不证明自主规划，重建不恢复signal或HTTP字节 |

C组件级划分也说明依赖：H09 C01–03目标Registry，Factory/Agent结构替身；H10 C01–03目标Inbox（真Session/投影作载体，结构Agent，无Driver任务链），C04目标Attempt（真实Session接纳回调）；H11 C25目标SystemPrompt/Scope，工具多为Schema Provider数据；H12 C33目标Assembler/Accumulator/Message/Runtime或DeepSeek.translate。必要真实依赖并不自动使一次单组件API测试变成完整工作流D。D要求跨组件的生命周期/请求/结算关系被断言；“挂了服务”与“验证了它执行”分开。

历史记录完整保留：原课31份run JSON的身份/退出与诊断摘要在test-matrix.json，其中H09四次失败、H10一次失败仍在原处。H11最初39、补例40，H12先48后49等原始迭代不重写。新增探针第一轮错误Session返回形状并超时，第二轮4/5误读结果关联字段，第三轮5/5；每次有原始TAP/JSON和保留scratch。[修订记录](revisions.md)给准确原因。首轮超时只提供3例失败片段，后面未完成，不伪称5例已运行。

复现命令（仓库根，已有锁定源码和隔离依赖；不调用模型、不装全仓、不清理）：

```powershell
python docs/deepseek-harness-v2/module-three-review/scripts/check-sources.py
python docs/deepseek-harness-v2/module-three-review/scripts/run-audit.py labs new-run
node docs/deepseek-harness-v2/module-three-review/scripts/run-probes.mjs
python docs/deepseek-harness-v2/module-three-review/scripts/run-audit.py content new-run
python docs/deepseek-harness-v2/module-three-review/scripts/run-audit.py visual new-visual
```

源码缓存用HARNESS_SOURCE_CACHE，原作者脚本依赖锚点按各课H09/H10/H11/H12_DEPS_ANCHOR与ZOD_ANCHOR配置；新增探针用H12同名锚点。Node24.16.0；Zod4.4.3及H04依赖锁逐项核integrity。所有环境仅白名单系统路径和新fixture-home。派生审查脚本只改绝对导入、输出/截图位置，原断言不改，派生脚本hash与scratch记入run-*.json。重跑请用新TAG保存另一轮记录，不覆盖baseline。

E仍无完整Boot/Profile/产品鉴权/GUI/真实Provider/持久后端链，也未运行完整官方Vitest、真实模型性能、磁盘flush/崩溃恢复、原生沙箱或全部取消竞态。A/C/D绿色不能升级为上述结论；真实学员、外审、实际学习时间亦不由测试替代。
