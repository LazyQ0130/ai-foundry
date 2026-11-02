# H17 可运行实践

这是作者仓库内的随课程序，不是独立npm包。Node24同步解析hook接入锁定官方源码及隔离依赖；不会安装或修改AI Foundry业务依赖，不使用个人Harness Home、真实模型、Shell工具或联网服务。

在AI Foundry仓库根运行：

```powershell
python -X utf8 docs/deepseek-harness-v2/h17/scripts/check-sources.py
node docs/deepseek-harness-v2/h17/scripts/run-labs.mjs
```

单项先预测后运行：

```powershell
node docs/deepseek-harness-v2/h17/scripts/run-labs.mjs A
node docs/deepseek-harness-v2/h17/scripts/run-labs.mjs B
node docs/deepseek-harness-v2/h17/scripts/run-labs.mjs C
node docs/deepseek-harness-v2/h17/scripts/run-labs.mjs D
node docs/deepseek-harness-v2/h17/scripts/run-labs.mjs X
```

D_failure与D_rejected可单独选择。默认入口运行20项测试、全部demo与故意错误答案；单项模式不改写总体lab-results。输出保存在本课docs的evidence，带时间戳raw run保留stdout/stderr/exit/源文件hash，失败也保留。

文件对应：append.ts=A，surface.ts=B，projection.ts=C，agent.ts=D三种分支，trace.ts=综合X；support.ts提供创建与订阅，bootstrap.mjs接线，demo.ts按选择调用。session.test.ts检验真实行为；negative-answer.ts故意把16条事实当16条消息，必须以断言失败退出，不能修成通过。

默认源码缓存与可配置路径见[作者README](../../../../../docs/deepseek-harness-v2/h17/README.md)。HARNESS_SOURCE_CACHE与HARNESS_GIT_CACHE必须指向同一固定Commit，H17_DEPS_ANCHOR指向隔离commander/index.js，H17_ZOD_ANCHOR指向Zod4.4.3的index.js。runner完整核直接和传递package的name/version/integrity，不合即停止，不覆盖旧缓存求绿。

数据收集只用新建Session的session/event，不新增eventAt/snapshotEvents/ownEvents生产调用。Session重建增加end-seed标记；综合原轨迹16条，重建实例17条。Header在日志之外。

实验等级C17/D3是TAP执行项，多个断言可能共享同一次实践，不是20种彼此独立场景。Session/Surface/Registry/Loop/Native均真实；Adapter和工具业务内容是确定性替身；没有挂持久后端。flush计数器不是存储，内存checkpoint行不是磁盘缓存恢复。真实崩溃、JSONL、跨进程锁、Fork和完整E均未验证。

代码及详细参考答案在[正式教材](../lesson.md)，完整程序逐字同步。临时fixture与证据均保留，不执行批量清理。
