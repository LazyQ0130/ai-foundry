# H03 固定源码与执行顺序核对

Commit：`f3803c96974ad4a94195fb97e5c637e9c2a3afe3`。仓库版本 `0.2.2-alpha.2`。未使用 main、其他提交的 API 或文件结构。每个正文链接带准确范围；原始片段、Git blob、SHA-256 见 [source-check.json](evidence/source-check.json)。

本文核对的是默认循环、已注册适配器、选中原生执行器的路径。没有把某种 Profile 配置推成所有产品路径，也没有声称所有工具必须弹审批。Stage 4 及先修证据见 [knowledge-bridge.md](knowledge-bridge.md)。

## 先后关系怎样核对

采用三层证据：固定 Git tree 校验字节与行号；TypeScript AST 定位实际调用表达式与分支祖先；作者分别阅读实现分支、测试 setup/action/assertions。**找到单词或得到词法行号顺序不足以证明控制流**。AST 门禁只防引用漂移，条件、返回、异常、finally 的解释如下；对应测试均静态阅读，完整官方套件未运行。

| AST 编号 | 核对的执行关系 | 不能省略的分支判断 | 交叉测试 |
| --- | --- | --- | --- |
| O1 | turn/start → preStep → step/start → step → step/end → turn-stopping → turn/end | reject 早返回，由外层 finally 关 Turn；Step 有自己的 finally；自然结束才检查停止，新输入可能继续 | loop 455–489、1325–1369；interception 253–274 |
| O2 | claim → 模型选择 → tools.resolve → systemPrompt.assemble → pre-step waterfall | 选择或组装失败可在 Step 前退出；reject 不等于一律安全/审批拒绝 | interception 253–274；loop 846–865 |
| O3 | prepareRequest → 接纳消息提交 → buildRequest → stream → 成功助手结算 → tools.execute | 只比较成功流分支；取消/错误 catch 另有 interrupted/attempt；prepareCall 不成立时用户消息尚未提交 | loop 79–123、491–525、1403–1427 |
| O4 | 按需 header/context → deriveMessages → 冻结请求 | 两种事件均在条件内，不能画成每步必写；当前路径有专门 preparedCall，另有无注册 route 的 middleware fallback | request-reconstruction 88–112、342–392、850–896 |
| O5 | AssistantStreamAttempt.settle 中 append → committed end | append 抛出会 abandon，绝不能画成已提交；chunk 只是实时通知，stream 嵌入单一结算记录 | loop 79–123、126–154；本轮实际库探针 |
| O6 | 原生批次 settlement.start → pipeline.prepare → dispatch | prepare 可直接产生拒绝/错误结果；tool/call 先有不代表主体启动，返回结果按调用关联 | tools/batch 154–170、243–265；coverage-edges 227–253 |

[control-flow.json](evidence/control-flow.json)保存六项 AST 选择、行号、分支祖先与限制说明。未声称静态检查遍历了所有可能路径。

## 十一阶段的输入、输出、事实与失败边界

路径前缀：`AL=packages/core/agent-loop/src/`；`T=packages/core/tools/src/`；`S=packages/core/session/src/`；`L=packages/llm/llm/src/`。精确链接在后方断言表及正文。

| 阶段 / 归属 | 入口与位置 | 输入 → 输出 | 事件 / 正常与失败边界 |
| --- | --- | --- | --- |
| 1 输入 / Agent | AL/agent.ts send/followup 170–189；inbox.ts 215–230 | UserMessage → 排队与 wake | spliced 是会话事实；inserted/status 是通知；无效输入/日志失败不假装收到 |
| 2 领取 / Inbox | AL/inbox.ts claim 108–112；agent.ts preStep 283–317 | 队列、候选位置 → 领取批与 enter/reject | claim 移出队列并通知；不是 user/message；模型选择/组装也可能失败 |
| 3 开 Turn / 循环 | AL/agent.ts turn 327–361 | 被唤醒的运行阶段 → turn/start | 开始先于领取；首次 reject 为 blocked，零 Step；空 enter 也可能零 Step completed |
| 4 开 Step / 循环 | AL/agent.ts 360–388 | enter 决定 → step/start、步骤执行与 step/end | 接纳与取消检查后才打开；Step 内 finally 负责结束，日志自身失败另计 |
| 5 组装 / SystemPrompt + Session | AL/agent.ts 294、435–479、656–744 | 模型选择、组装材料、有效历史、工具集 → 冻结 GenerateOptions | system/user 按需提交；header/context 按需；prepare 失败可能尚无用户消息 |
| 6 模型接入 / LLM | AL/agent.ts prepareRequest 613–652；L/index.ts 960–1017 | 选择与配置 → 绑定调用 → stream | provider 未注册、配置不符、取消可拒绝；fallback 存在，不能一概断言必须注册 |
| 7 流处理 / AL | assistant-stream.ts 49–108；agent.ts 490–583 | chunks → compact stream、消息或 attempt | live start/chunk；先结算后 committed end；中断可有安全前缀；追加失败为 abandoned |
| 8 工具分派 / Tools | AL/agent.ts 586–609；T/index.ts 369–377；native/index.ts 15–35 | 结构化调用 → 当前执行器/共享批次 | max-tokens 先退出不分派；普通错误结果与批次调度异常分开 |
| 9 反馈 / 原生批次 | T/batch.ts 154–170、243–265 | 调用与政策 → 相关 ToolResultMessage | tool/call 先于准备；allow+guards+signal 才 dispatch；tool/result 进入后续模型视图 |
| 10 会话 / Session | S/index.ts 892–911、999–1029、1057–1063 | 接受事件 → 有序日志；有效表面 → 消息数组 | session/event 观察；内存 commit 不等于 flush；attempt、边界不全进入消息历史 |
| 11 结束 / 循环 | AL/agent.ts 395–425 | 自然结束、新输入或异常 → 继续或 turn/end.reason | 新输入/stop listener 可续步；aborted/error/max-tokens/blocked 不等于成功；硬崩溃不保证闭合 |

## 官方文档与实现的精度差异

1. `docs/architecture.zh.md:110` 对 `agent/*` 实时通知作总体概括；`inbox.ts:223` 与 inbox 测试明确有持久队列事件 `agent/inbox/spliced`。正文以具体写入路径为准，要求看契约而非前缀。
2. 架构流程中的取消摘要不能覆盖全部分支：`agent.ts:499–539` 在安全前缀非空时可保存 interrupted assistant/message，空内容或其他失败可为 attempt。图只画成功主线，正文和实验分开说明。
3. 官方生命周期时序图用 Tools 一列概括工具系统；本课解释该列实际含服务、选中执行器与共享流水线，避免归因给“Registry 独自执行所有动作”。
4. Step 官方概括为模型请求与相关工具；`step()` 重试 while 和测试 188–212 说明一次 Step 可有多次尝试。正文明确区别请求尝试与步骤边界。

## 实际执行与未执行范围

- 已执行：独立教学实验十项行为测试；真实源码四项内存库探针（实时块与结算、append→committed end、Session 消息派生与离线重建、追加失败→abandoned）；实际平台 Renderer 九项测试及本课 React 交互检查。
- 官方测试为选读与断言交叉核对，**未执行完整官方 Vitest 或 AgentLoop 集成**。库探针不加载完整 Profile、不访问真实模型、不 flush、不执行原生文件/沙箱操作；不借它宣称取消与工具链全栈运行通过。
- 无真实 API、跨进程恢复、OS 安全边界或提示注入防御的综合验证。模型超时实验是固定故障注入。

## 逐条可追踪断言

下表由当前已校验事实生成；测试原始片段与状态保存在 JSON。独立外审待完成。

| ID | 教学结论 | 符号/位置与固定证据 | 测试定位 |
| --- | --- | --- | --- |
| S01 | Agent/Session 共用身份；创建前准备世界 | [packages/core/agent/src/index.ts:59–68](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent/src/index.ts#L59-L68) | 实现/契约静态核对；不虚报测试 |
| S02 | setup 后登记 Agent，创建与一次 Turn 不同 | [packages/core/agent-loop/src/index.ts:621–640](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/index.ts#L621-L640) | 实现/契约静态核对；不虚报测试 |
| S03 | followup 入 next-turn 并请求唤醒 | [packages/core/agent-loop/src/agent.ts:170–189](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L170-L189) | 实现/契约静态核对；不虚报测试 |
| S04 | Inbox 变更是 Session 事实，claim 不等于 user/message | [packages/core/agent-loop/src/inbox.ts:215–230](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/inbox.ts#L215-L230) | inbox.spec.ts:174–193（选读） |
| S05 | Turn 打开先于 preStep；reject 零 Step | [packages/core/agent-loop/src/agent.ts:327–361](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L327-L361) | interception.spec.ts:253–274（选读） |
| S06 | 领取、选择、工具解析、组装，再进入接纳扩展点 | [packages/core/agent-loop/src/agent.ts:283–317](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L283-L317) | loop.spec.ts:1325–1369（选读） |
| S07 | 准备模型调用先于首次用户消息提交 | [packages/core/agent-loop/src/agent.ts:443–479](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L443-L479) | loop.spec.ts:846–865（选读） |
| S08 | 绑定适配器与有效调用配置 | [packages/llm/llm/src/index.ts:960–1017](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/llm/llm/src/index.ts#L960-L1017) | request-reconstruction.spec.ts:342–393（选读） |
| S09 | 请求头/容量按需记录，派生并冻结消息 | [packages/core/agent-loop/src/agent.ts:656–744](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L656-L744) | request-reconstruction.spec.ts:88–112（选读） |
| S10 | 先结算会话，再发 committed end | [packages/core/agent-loop/src/assistant-stream.ts:78–108](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/assistant-stream.ts#L78-L108) | loop.spec.ts:79–123（选读） |
| S11 | 取消有安全前缀时可留 interrupted 消息，错误可留 attempt | [packages/core/agent-loop/src/agent.ts:499–539](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L499-L539) | loop.spec.ts:1403–1427（选读） |
| S12 | 失败流可在同一 Step 再尝试 | [packages/core/agent-loop/src/agent.ts:541–563](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L541-L563) | loop.spec.ts:188–212（选读） |
| S13 | 助手响应先结算，再提取调用并交 Tools | [packages/core/agent-loop/src/agent.ts:566–597](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L566-L597) | loop.spec.ts:491–525（选读） |
| S14 | 选中原生执行器时通过共享批次 | [packages/core/tool-executor-native/src/index.ts:15–35](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/tool-executor-native/src/index.ts#L15-L35) | 实现/契约静态核对；不虚报测试 |
| S15 | tool/call 先于检查与主体分派 | [packages/core/tools/src/batch.ts:154–170](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/tools/src/batch.ts#L154-L170) | 实现/契约静态核对；不虚报测试 |
| S16 | 策略、可能审批、守卫及取消后才 dispatch | [packages/core/tools/src/pipeline.ts:190–231](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/tools/src/pipeline.ts#L190-L231) | 实现/契约静态核对；不虚报测试 |
| S17 | tool/result 关联调用身份及源序号，进入消息表面 | [packages/core/tools/src/batch.ts:243–265](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/tools/src/batch.ts#L243-L265) | loop.spec.ts:491–525（选读） |
| S18 | 错误工具结果可回读；不等于 Turn error | [packages/core/agent-loop/src/agent.ts:586–609](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L586-L609) | coverage-edges.spec.ts:227–253（选读） |
| S19 | 没有工具只是自然结束候选，停止前仍查新输入 | [packages/core/agent-loop/src/agent.ts:395–400](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L395-L400) | loop.spec.ts:1224–1267（选读） |
| S20 | Step finally 关闭；Turn catch 区分 aborted/error，finally 记结束 | [packages/core/agent-loop/src/agent.ts:370–425](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L370-L425) | loop.spec.ts:1851–1875（选读） |
| S21 | Session commit 是内存日志接受，不等于 flush | [packages/core/session/src/index.ts:892–911](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/session/src/index.ts#L892-L911) | 实现/契约静态核对；不虚报测试 |
| S22 | SessionStore 本身不实现持久化 | [packages/core/session/src/index.ts:1057–1063](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/session/src/index.ts#L1057-L1063) | 实现/契约静态核对；不虚报测试 |
| S23 | 消息历史由有效表面派生，不是全部日志 | [packages/core/session/src/index.ts:999–1029](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/session/src/index.ts#L999-L1029) | request-reconstruction.spec.ts:850–896（选读） |
| S24 | max-tokens 不分派被截断步骤的工具 | [packages/core/agent-loop/src/agent.ts:584–587](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L584-L587) | loop.spec.ts:1520–1549（选读） |
| S25 | Agent 状态 idle/running 不等于任务成败 | [packages/core/agent-loop/src/agent.ts:156–168](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L156-L168) | loop.spec.ts:1851–1875（选读） |
| S26 | 实例拥有者释放负责停止与清理，不是每轮销毁 | [packages/core/agent/src/index.ts:150–162](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent/src/index.ts#L150-L162) | 实现/契约静态核对；不虚报测试 |
| S27 | 官方运行单位：Turn 零或多 Step | [docs/architecture.zh.md:81–87](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/docs/architecture.zh.md#L81-L87) | 实现/契约静态核对；不虚报测试 |
| S28 | 实验性且未经安全审计 | [SAFETY.zh.md:5–15](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/SAFETY.zh.md#L5-L15) | 实现/契约静态核对；不虚报测试 |
