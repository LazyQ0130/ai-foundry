# P2 Starter 与 Reference

两者来自同一P1基线，依赖、锁文件、WXT配置、严格契约、匿名session基础工具、夹具一致。Starter完整保留P1可用的工具栏与React确认，不提前包含P2完整答案。源码包各19个明确文件；作者测试、Profile、依赖目录不在包里。

| 不同文件 | Starter | Reference |
|---|---|---|
| README.md | 说明禁用读取按钮和TODO，目标行为需完成练习后验证 | 完成态安装、读取、边界和恢复说明 |
| extension/entrypoints/background.ts | 完整P1入口，P2路由/失效监听TODO | 同步注册严格消息和生命周期监听 |
| extension/entrypoints/sidepanel/App.tsx | 完整P1确认交互、P2禁用练习入口 | 读取/核对、窗口归属、事件清空、结果纯文本展示 |
| extension/entrypoints/sidepanel/style.css | P1样式起点 | 结果块、来源换行、元数据与按钮布局 |
| extension/src/extract.ts | 类型正确的NO_CONTENT/空probe占位 | 实际可序列化、过滤限长的提取器 |
| extension/src/coordinator.ts | 可构建的BAD_MESSAGE占位，未注册读取链路 | 来源校验、代次、注入、documentId、超时和错误 |
| extension/src/read-client.ts | 明确“尚未实现”的占位 | 严格消息、generation与最终核对 |

提供contracts和session工具是教学取舍：课堂重点是分清执行环境、实现内容提取、接通安全消息和审查异步提交；串行存储工具仍要求阅读和解释，但不要求学员从零发明。正文的五组Prompt逐步推进，每步需亲自核对运行结果，Reference只作对照。

机器比较结果保存在作者delivery报告的starter_reference_differences，恰为上述7文件。完成Starter的作业需满足本课任务矩阵，不能以“起点已能构建”当成完成网页读取。
