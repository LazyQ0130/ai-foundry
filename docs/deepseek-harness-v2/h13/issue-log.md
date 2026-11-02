# H13 研发问题记录

## QA01｜请求边界不能逐字相等（已定位）

首轮 36 项中 33 通过、3 失败。原始 TAP 与 timestamp run JSON 已保留。失败在 D03/D04/D06 的 `loopRequests === requests` 断言：Loop 输入保留 `developer/tool-removal`，Mock Adapter 不支持 toolUpdate，真实 LlmRuntime 按 `projectToolUpdates` 移除 developer 更新消息。它没有改变当前 tools 列表。初版断言忽略了 H11 已说明的提供方投影。

修复只改 H13 断言：保留两个完整请求，逐项检查 tools、header、toolHistory 与非 developer 消息；对 developer 消息明确断言在此 route 被移除，并以官方 `projectToolUpdates` 的结果核对。不得删掉真实 Runtime 或把差异裁成相等。复验结果见最终质量报告。

## 路径核对

研究时查找的 `packages/ptc/tool-executor-ptc`、`agent-loop/src/events.ts`、`tools/src/errors.ts` 不存在。通过 rg 找到实际 `packages/core/tool-executor-ptc/src/index.ts`、`packages/core/agent/src/runtime-types.ts`、`tools/src/contracts.ts`/`schema.ts`。正文与断言均使用实际路径。未将查找失败写成 API。

timeout policy 实际在 `packages/guard/timeout-policy/src/index.ts`，不是按包名猜测的 core 路径；核对后新增该目录字节锁。源码链接范围检查还拦截四个末行超界（cookbook 105→实际103、schema 647→646、executor110→102、SystemPrompt709→697）；按实际范围和主题收紧，正式稿不留越界链接。

## QA02｜看似通过但验证了错误边界（已修复）

语义复查发现 C26 初版将编译后的 raw Schema 传给接受作者 DSL 的 validateArgs，assert.throws 只证明声明格式错误，未证明 default 不填值。修改为传入原始属性映射，并精确对照 missing-required 诊断与显式 a=2 的无诊断结果。37项最终运行保留该修正；没有以原“通过”作为最终证据。

## QA04｜图二补齐子级观察前提（已修复）

作者复核1440成图时发现，子级示例紧跟A的allow/deny图，未注明实践B已撤销A限制，容易让学员误以为仍在这些过滤器下的子级还能先看见analyze。图中改为“撤销A限制，再看子级”，与实际程序顺序一致。重生SVG/PNG并复跑三宽度检查；正文与官方行为不需要改动。

## QA03｜接口字段集合检查误依赖声明顺序（已修复）

首轮 content-check 在 ToolSchema 报字段顺序差异：真实顺序为 deferLoading/name/description/parameters。这里验证的是字段集合，顺序不是协议语义；改为双方排序后精确比较，仍拒绝多/少字段。原始错误保留在工具执行记录，本文件记录诊断；未伪造一个不存在的原始日志文件。之后统一检查运行器保存完整 stdout/stderr。
