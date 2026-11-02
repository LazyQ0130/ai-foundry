# H13–H16 衔接与重复检查

| 课 | 核心责任 | 本课如何承接 | 保留的界限 |
|---|---|---|---|
| H13 | 定义、注册、Schema、Scope、Step准入 | 对照四家族实际注册，综合允许集合限制远端write | 不重写完整Schema教程；不是所有工具同一种校验接线 |
| H14 | Executor/Pipeline/结果/取消/调度 | 用真实Native/Pipeline和Loop获得结果及请求前缀 | 本例并行上限1不是固定调度算法；error.info与Session投影分开 |
| H15 | 审批、逐调用策略、OS文件约束与观察 | File仅复习意图/版本，Shell明确替身无沙箱保证 | Scope≠OS；文件sandbox≠网络限制；不重写后端探测 |
| H16 | File/Shell/Web/MCP能力组合 | 工具地图、五项允许能力、两类失效状态、清理责任 | 不提前讲H17持久化、H20完整恢复或H27全竞态矩阵 |

新事实须注意：workingDirectory的当前目录与原始sandbox工作区不同；read_image附件条件注册和execute模型路线检查不同；Web选择失败时ready为true；MCP发现失败保留旧代但注册冲突不保留半套新代。正文据真实源码和局部实验说明，没有改动前课。

第四模块准备只列历史证据与候选问题，不进行正式一致性裁决，不自动修订H13–H15。
