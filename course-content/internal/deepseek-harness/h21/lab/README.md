# H21 可复现实验

固定官方Commit `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`。四项实践和综合X的输入、预测、预期输出及完整参考答案见[lesson.md](../lesson.md)。环境准备与四个隔离依赖锚点见[作者README](../../../../../docs/deepseek-harness-v2/h21/README.md)。

```powershell
node docs/deepseek-harness-v2/h21/scripts/run-labs.mjs
node docs/deepseek-harness-v2/h21/scripts/run-labs.mjs A registry
node docs/deepseek-harness-v2/h21/scripts/run-labs.mjs A caller
node docs/deepseek-harness-v2/h21/scripts/run-labs.mjs B child-failure
node docs/deepseek-harness-v2/h21/scripts/run-labs.mjs C
node docs/deepseek-harness-v2/h21/scripts/run-labs.mjs C empty
node docs/deepseek-harness-v2/h21/scripts/run-labs.mjs D cold-resume
node docs/deepseek-harness-v2/h21/scripts/run-labs.mjs D limits-tree
node docs/deepseek-harness-v2/h21/scripts/run-labs.mjs X
```

默认21项，C8/D13。A_CASES/B_CASES/D_CASES和boundaries.C_CASES列明有效分支；single demo保存JSON但不计新增测试。真实父/子创建、Loop、Session、Runtime/Manager、Spawn/Fork、模型工具、消息和结果执行路径由官方代码完成。模型和常量业务为受控替身，external handle-fixture不创建外部Agent、PID或协议连接。

Directory按官方测试夹具模式适配；PointQuery继承官方观察与点读，仅关闭未配置的全文搜索；FixtureRuntime只提供显式配置cell并使用正常类插件初始化，不替换官方委派算法。Preset服务/审批/沙箱未挂载，相关策略仅静态审阅，不从Scope测试外推权限认证。

B父/子均真实驱动Mock；C保持继承路线，隔离验证历史；D冷恢复同进程同Context中的新Agent与writer，持久发现另外使用新Context/Backend且0 Agent/0模型调用。X走真实模型工具→子局部工具→send_message→父继续→结算→冷继续，并复用C作初始历史比较；不重复计算共享行为。

runner先核固定源码字节及全部依赖锁，复制到新临时根，scrub环境并设置独立DSH_HOME。程序有有限脚本、有界等待，finally放行本次门闩；不读私人Session、网络、Shell或付费API。bootstrap拒绝递归rm，产物和空目录保留供复核。任何批量删除都须由用户手工处理，实验没有清理命令。
