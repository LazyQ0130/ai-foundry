# 16张核心教学图索引

4课各4张，保持历史文件原样；本轮新增H24四图。下面文件身份的完整SHA256见[证据JSON](../evidence/module-six-figures.json)。作者H24三宽实看不代替对全部历史图重新集中审查。

| 图 | 源 / PNG | 教学作用 |
| --- | --- | --- |
| H21 / h21-01 | [SVG](../../h21/figures/source/h21-01.svg) / [PNG](../../h21/figures/h21-01.png) | 职责与协作图；不是完整时序。Provider不直接创建本地Agent；Factory与委派服务是两个能力。 |
| H21 / h21-02 | [SVG](../../h21/figures/source/h21-02.svg) / [PNG](../../h21/figures/h21-02.png) | 历史对比图；没有持续同步箭头。没有任何已完成Turn时，Fork Provider也返回空seed。 |
| H21 / h21-03 | [SVG](../../h21/figures/source/h21-03.svg) / [PNG](../../h21/figures/h21-03.png) | 精选时序；两种delivery是互斥选择。显式dispose可提前走停止路径，不必等自然结束。 |
| H21 / h21-04 | [SVG](../../h21/figures/source/h21-04.svg) / [PNG](../../h21/figures/h21-04.png) | 关系结构图；Registry owner、结构Fiber、持久parentSession、Activation持有者分层。图不授予权限或保证外部进程停稳。 |
| H22 / h22-01 | [SVG](../../h22/figures/source/h22-01.svg) / [PNG](../../h22/figures/h22-01.png) | 职责结构；进程边界只标在 PTC 层。Goal 与 Schedule 可组合，不是 Workflow 的内置阶段。 |
| H22 / h22-02 | [SVG](../../h22/figures/source/h22-02.svg) / [PNG](../../h22/figures/h22-02.png) | 关系对照；每项箭头表示该项内部 await，不表示不同条目的阶段锁。 |
| H22 / h22-03 | [SVG](../../h22/figures/source/h22-03.svg) / [PNG](../../h22/figures/h22-03.png) | 精选生命周期；校验失败不进入运行。普通子级任务失败可产生 null，不必变成工作流 fatal error。 |
| H22 / h22-04 | [SVG](../../h22/figures/source/h22-04.svg) / [PNG](../../h22/figures/h22-04.png) | 观察与记录的分路；仅根工具调用记录四类日志，未画成所有 workflow 事件自动持久化。 |
| H23 / h23-01 | [SVG](../../h23/figures/source/h23-01.svg) / [PNG](../../h23/figures/h23-01.png) | 职责结构而非一条必经调用链；Web应用Remote与SDK协议分别接入领域能力。 |
| H23 / h23-02 | [SVG](../../h23/figures/source/h23-02.svg) / [PNG](../../h23/figures/h23-02.png) | 精选双向路径；真实Web流在 /api/remote.mux 上复用，课程实验使用明确的受控载体。 |
| H23 / h23-03 | [SVG](../../h23/figures/source/h23-03.svg) / [PNG](../../h23/figures/h23-03.png) | SDK时序摘要；本版本没有轮次中取消方法，不能编造session/cancel。 |
| H23 / h23-04 | [SVG](../../h23/figures/source/h23-04.svg) / [PNG](../../h23/figures/h23-04.png) | 状态对照；控制回执、实时更新和持久确认不是同一事实。 |
| H24 / h24-01 | [SVG](../../h24/figures/source/h24-01.svg) / [PNG](../../h24/figures/h24-01.png) | 课程A–E是证据级，不是官方测试车道的同名定义；动态最高D。 |
| H24 / h24-02 | [SVG](../../h24/figures/source/h24-02.svg) / [PNG](../../h24/figures/h24-02.png) | 绿色是真实官方组件；黄色是受控模型/故障边界；原始证据不由作者报告替代。 |
| H24 / h24-03 | [SVG](../../h24/figures/source/h24-03.svg) / [PNG](../../h24/figures/h24-03.png) | D1恢复链与D4失败对照分别画出；没有虚构一个聚合故障轨迹。 |
| H24 / h24-04 | [SVG](../../h24/figures/source/h24-04.svg) / [PNG](../../h24/figures/h24-04.png) | 已有绿色证据保留，已知P1与未验证项分别记录；本轮整体NO-GO。 |
