# 失败、差异与修订记录

所有run/traces保留；当前绿色结果不删除初始失败、不缩小等级定义、不修改官方固定源码。

| 发现 | 处理/证据 | 当前状态 |
| --- | --- | --- |
| Loader Smoke README对inspect描述较宽 | 实现只在exit码符合预期后inspect；外层保存原始stdout/stderr/exit | 已按实现教学，非全失败回调保证 |
| AppBoot settled不等全部核心ACTIVE | 官方必需ID审查有限；作者夹具显式要求自己的所有核心行ACTIVE | A2三个反例通过 |
| 首次lib路径Windows分隔符比较不当 | 比较时规范化分隔符；保留plain Node实际缺产物错误 | 反例PASS，lib正向NOT_RUN |
| 初版作者Schema误用普通JSON Schema思路 | 按真实author DSL逐属性required与对象additionalProperties | 正向工具和P1合同通过 |
| Windows嵌套JSON cwd/旧UUID规范化 | 官方typed redaction后preserve，显式escaped cwd alias | B1/B2通过 |
| 新作者Fixture CRLF与官方LF不同 | 保留初审与原始字节base64，明确EOL修订，.gitattributes仅限本课fixture | 未Record/Refresh；后续字节不可变 |
| 属性测试只挂Tools导致缺SystemPrompt依赖 | 使用官方mountAgentLoopTestDependencies，仍不挂Loop | P1 40样本通过，不升D |
| Retry-After配置1ms在线上变成1秒 | 先保留超1ms上限负例；正向明确接受1000ms | D7/D1均通过，非无限重试 |
| 默认SDK+HTTP关闭后原生断言 | 两个PID相同失败；close header和owned dispatcher均未解决；不将异常退出改为期望0 | OPEN P1，整体NO-GO |
| 支持的runtime exit测试钩子自然退出 | 显式作者sdk-plugin采用exitCode/stdin.pause，完整23项与X过 | 仅该测试配置通过，不关闭默认分支问题 |
| 初始npm传递包漂移及原地替换 | 3 added/3 removed如实登记；后续使用全新精确锁树，旧缓存保留 | 操作偏差披露；受保护项目无变化 |

## 尚未闭合的默认退出

[default-exit-failure.json](evidence/default-exit-failure.json)列原始trace、两个PID、实际退出码3221226505（0xC0000409）及`UV_HANDLE_CLOSING`断言。JSON-RPC shutdown响应已出现，实际退出仍非0，故不能以响应或文本验收。归因尚限于作者源码组合/平台，未证实上游发行应用普遍缺陷。

当前core实践使用官方允许的运行时钩子且正常释放；它使教材练习可复现，但不是默认生产分支的修复。闭合要求独立最小复现、Node/HTTP/退出所有权诊断、默认exit0及对应产品入口回归；本轮不修改固定上游代码，不为课程扩大研究到发布或重做H23。

Snapshot复核在baseline-review、baseline-review-initial与baseline-eol-correction中，初始候选和全部失败原始run保留。未因红灯自动重录全部基线。
