# LLM Retry审查输入

H20实际：默认normal预算/五类瞬态码；AUTH/QUOTA/Adapter ABORTED拒绝；500与指数序列、U1抖动、Retry-After范围内/超上限；always脚本有界、下游优先/下游错误回退；同Step多Attempt、用户输入一次、失败部分流不污染模型；无插件与直接Runtime不自动获得恢复；两种Compaction组合不消费通用计划；取消/释放清理。

源码静态或未全测：多Provider/完整policyKey变更矩阵、投影重复fold、就绪失败/陈旧回调、零抖动下界所有组合、真实HTTP Retry-After日期/网络归一化、全部重叠策略顺序。详细逐例真实组件/替身见[H20矩阵](../coverage-matrix.md)。不能把源码正确、历史官方测试存在或任意A–E数字当成这些项目当前执行通过。
