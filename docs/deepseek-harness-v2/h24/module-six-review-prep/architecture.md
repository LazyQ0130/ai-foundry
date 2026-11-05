# 架构与所有权图（供审查）

下图是条件组合关系，非一条每次都走的调用链；来源为固定源码及H21/H22正文。未因画图而新增全模块动态证据。

```mermaid
flowchart TD
  A[父 Agent / Session / Scope] -->|显式委派| S[Subagent Runtime / Manager]
  S -->|按名选择| P[Spawn / Fork / 外部 Provider]
  P --> V[Activation：childId / runId / result / dispose]
  W[Workflow Engine：脚本与依赖图] -->|持有一次执行| R[WorkflowRun：进程内活动]
  R -->|可使用| S
  R -->|可拥有| J[Job / 受管进程或后台活动]
  G[Goal：目标状态与预算] -->|按策略决定继续工作| A
  T[Schedule：持久计划和触发] -->|触发不等业务完成| A
  V -->|已定义事实/交付| H[各自 Session 与父交付]
  R -->|执行/结果/日志按通道| H
  J -->|通知/记录不复活旧进程| H
  H --> D[JSONL / Projection / 查询]
```

Activation区分Parent/Caller，childId可跨执行期而runId更新；Fork继承已完成前缀而非未来。Workflow依赖边不是父子树；前台聚合等待不等异步Parent回执。Job/WorkflowRun不因读日志跨重启复活，Goal/Schedule的持久状态也不等所有外部效果已发生。取消责任沿显式持有关系传播，不能由关闭Client推出任意后台进程树已结束。

审查时分别画Registry owner、调用者和Session lineage；检查父取消、晚发布Activation和进程done/result/释放几个终点。只读图不能替代实际门闩/文件/进程证据。
