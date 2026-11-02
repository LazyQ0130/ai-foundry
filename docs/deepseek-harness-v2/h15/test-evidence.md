# H15 实验与证据分级

31项实际TAP通过：18 C + 13 D。A/B是实践名称时不代表验证等级；受控应答者与probe替身不记原生能力。没有独立A/B计数或E运行。

| 实践 | 真实受测对象与跨边界断言 | 替身/未触发能力 | 分级 |
|---|---|---|---|
| A | ApprovalService→真实Session提交；策略投影、应答Waterfall、取消与迟到、无Turn、提交前故障；重复callId无缓存grant | 结构性Agent；受控应答者；无UI/真实存储故障 | 18 C |
| B | Tools/Native/Pipeline→Approval/Session；批准后guard拒绝，普通pre改写对照，取消主体0，最终ToolResult | 常量计算；结构性Agent；无Loop、工具日志sink、Shell、文件 | 11 D |
| C | SandboxPolicy/Session回放→共享roots；Approval升权→单次覆盖；真实provider选择及argv | probe/launcher替身；无spawn；strictConsumer为教学判断 | 1 D，内含模拟边界 |
| D | fs-sandbox/local真实IO→观察意图→真实版本拒绝、重读恢复、缺失创建、同ID新Session与卸载/重载；只读围栏仍生效 | 夹具consumer显式发事件，非tool-fs；清理钩子替换；无攻击竞态 | 1 D |

[practice-output.json](evidence/practice-output.json)保存A/B每场景、C完整策略/事件/argv与D逐项label；[lab-tests.txt](evidence/lab-tests.txt)为最新TAP；[lab-results.json](evidence/lab-results.json)保存版本/程序hash/分级；每次run-时间戳-*.json保留实际args、exit、stdout、stderr、程序hash与scratch，包括失败历史。输出不把教学trace伪装成Session事件。

[lab-mutation.txt](evidence/lab-mutation.txt)是故意错误预测“批准后guard不能阻止”的预期非零失败，不是产品缺陷或待修测试。官方实现未改动；没有运行上游含递归清理的完整测试。

## 实际展开的TAP条目

- C approval allow
- C approval reject
- C approval cancel-answer
- C approval unavailable
- C approval missing
- C approval throw-sync
- C approval throw-async
- C approval invalid
- C approval delegate
- C approval never
- C approval pre-abort
- C approval late
- C approval rejects idle
- C approval rejects closed
- C approval audit commit failure cannot return grant
- C approval per-session policy and runtime context are not transcript
- C allowed-once is not a cached grant for a repeated callId
- C deployment never, cancelled signal, and session ask precedence
- D pipeline allow
- D pipeline deny
- D pipeline ask-allow
- D pipeline ask-reject
- D pipeline ask-missing
- D pipeline guard
- D pipeline override-deny
- D pipeline override-guard
- D pipeline approved-guard
- D pipeline cancel-approval
- D pipeline pre-abort
- D SandboxPolicy + Session + Approval + simulated local provider
- D real local filesystem + fence + observations across lifecycle
