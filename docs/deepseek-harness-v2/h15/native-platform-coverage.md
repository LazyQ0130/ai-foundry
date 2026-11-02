# 原生平台覆盖范围

实际宿主：win32 / x64。Node v24.16.0。这里把真实策略、模拟探测和原生进程执行严格分开；完整应用E未运行。

| 能力 | 实际运行 | 受测边界 | 不能据此推出 |
|---|---|---|---|
| Approval/Policy/Session | 是，真实组件 | Turn、问答、事件、逐调用解析与回放 | 原生OS限制已执行 |
| LocalSandboxProvider选择与argv | 是，真实算法，probe为模拟 | unavailable/full/partial及Windows只读包装 | 已运行bwrap、Landlock、Seatbelt、ACL |
| Linux bwrap | NOT_RUN | 静态核对链、profile、测试 | Linux真实强制有效 |
| Linux Landlock | NOT_RUN | 静态核对ABI完整度，模拟partial报告 | 旧/新内核实际效果 |
| macOS Seatbelt | NOT_RUN | 静态契约与profile | macOS原生验证 |
| Windows ACL进程runner | NOT_RUN | 静态partial限制；模拟只读argv | 受限令牌、硬链接/ACL漏洞或授权撤销已验证 |
| Windows本地文件后端 | 是，真实磁盘IO | Actual Koffi DACL copy / ReplaceFileW, no platform override；仅清理钩子替换 | Windows进程沙箱或所有并发竞态已验证 |

full表示文件效果词汇中的完整度；partial必须显式保留。C程序的strictConsumer仅为教学判断，并未运行真实Shell消费者处理partial。无可用选择链时真实provider抛SANDBOX_UNAVAILABLE，未spawn；真实runner执行前失败的stderr/exit归因本轮仅静态核对。

Windows已知边界包括NTFS硬链接对象别名、读取不受完整约束及AppContainer ACL/低完整度读取问题；不支持额外可写根。工作区standing ACE与每活跃会话/工作区的随机临时授权生命周期不同。全部来自固定源码说明，本轮未真实授予/撤销这些进程ACL。

fs实验验证明确安排在变更检查之前的外部写入导致FS_STALE_VERSION，不验证检查与发布之间的任意外部竞争、祖先链接交换或Windows路径别名攻击。临时目录有自动写授权，故本轮不把临时兄弟目录当围栏越界测试。机器可读范围见[platform-coverage.json](evidence/platform-coverage.json)。
