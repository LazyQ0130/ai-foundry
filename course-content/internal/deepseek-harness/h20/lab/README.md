# H20 可复现实验

固定官方Commit `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`。实践A/B/C/D是练习编号，C/D是证据等级。真实组件为Cordis、LlmRuntime、llm-retry、AgentLoop、Session、Tools、TokenMeter、Repair；两个专门恢复分支另用Basic Compaction。模型与外部业务效果是受控替身。

在AI Foundry仓库根运行，环境准备见[作者README](../../../../../docs/deepseek-harness-v2/h20/README.md)：

```powershell
node docs/deepseek-harness-v2/h20/scripts/run-labs.mjs
node docs/deepseek-harness-v2/h20/scripts/run-labs.mjs A rate-limit
node docs/deepseek-harness-v2/h20/scripts/run-labs.mjs A budget
node docs/deepseek-harness-v2/h20/scripts/run-labs.mjs B parallel
node docs/deepseek-harness-v2/h20/scripts/run-labs.mjs C recovered
node docs/deepseek-harness-v2/h20/scripts/run-labs.mjs C cancelled
node docs/deepseek-harness-v2/h20/scripts/run-labs.mjs D unknown
node docs/deepseek-harness-v2/h20/scripts/run-labs.mjs X
```

默认45项TAP，C6/D39；单项输出完整JSON，不覆盖总体结果。A_CASES/B_CASES/D_CASES列全部分支；C有recovered/cancelled。测试逐项保存trace，runner把完整事件、请求、实时帧、错误、计数、虚拟延迟汇总到behavior-traces与时间戳traces记录。失败原始run也保留，不计PASS。

clock.ts只在隔离子进程替换定时器；Retry算法、事件、真实插件和请求执行保持官方实现，random使用官方非序列化RetryInternals钩子。Date.now的事件时间戳仍取宿主时钟，断言不靠真实sleep碰运气。门控finally明确放行；虚拟调度有200轮硬上限，Adapter脚本有限，绝不发无限付费请求。全局时钟逐fixture恢复，不并发运行这些测试。

C/X使用真实JSONL none，显式flush、关闭和同进程新Context/后端Resume。X复制精确已提交逻辑前缀到全新ID和根，模拟缺结果中断，原任务正常取消排空；不杀进程、不截断文件、不伪称Fork。D的closed-step为Repair组件夹具，不把人为缺结果旧Step推广成完整持久格式有效轨迹。教学幂等Map不代表Harness自动幂等机制。

源码与直接/传递依赖逐项锁定后，程序复制到新mkdtemp根运行。环境只给子进程本轮fixture-home，不继承个人DSH_HOME或凭据；工具仅内存，无文件、网络、邮件或支付副作用。bootstrap拒绝递归删除，所有新文件与空目录登记保留，H18/H19保留材料不动。没有清理命令，禁止指向已有用户存储。

本轮Windows实测不外推其他平台；没有真实Provider、独立进程恢复、默认Zstd、真实崩溃/断电、E级全应用、成本缓存收益、学员或独立外审验证。完整输入、预期与参考答案见[正式教材](../lesson.md)。
