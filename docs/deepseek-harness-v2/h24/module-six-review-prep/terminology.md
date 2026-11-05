# 术语一致性与待审问题

| 词/易混对象 | 四课统一读法 | 审查重点 |
| --- | --- | --- |
| childId / runId / Activation | 稳定子级身份、一次执行配对、句柄生命周期分别核 | 冷继续不能复活旧实例或旧dispose权限 |
| Parent / Caller delivery | 异步回执/通知与等待结果两种交付 | Workflow前台聚合不能冒用Parent工具时序 |
| 工作流依赖图 / 父子树 | A∥B→C数据依赖不是父子关系 | 预算/取消所有者独列 |
| WorkflowRun / Job / Goal / Schedule | 运行活动、后台工作、目标状态、计划触发不同 | “持久任务”笼统词需逐项拆解 |
| accepted / idle / task success | 输入接纳、运行边界、业务验收不同 | D3 exit0但Turn error，D4模型虚报 |
| live event / EventLog / raw Result / Trajectory | 实时观察、已记录事实、可选原始结果、派生视图 | 不由视图缺失推未执行 |
| Generation / revision / Seq / Attempt | 连接代际、实时帧、事件位置、模型尝试 | 不跨命名空间相等比较 |
| Profile / core fixture / shipped app | 配置组合、作者局部、完整交付入口 | H23 prepare与H24 YAML差异应保留；均未E |
| E keyless / real Provider E2E | 完整应用范围与外部模型环境两维 | 不用一个“端到端”抹平差异 |
| cancel / idle / dispose / close / exit | 控制、排空、所有权释放、通道关闭、进程退出 | SDK shutdown响应非最终进程证据 |

作者核对未发现需立即改动H21–H23正文的已证术语冲突；这不是“术语无问题”的独立审查结论。开放问题：所有“恢复”是否明示新Context/新Agent/新PID；所有“完整”是否误指作者核心；默认退出P1是否影响此前更宽措辞，需独立外审逐段核查。
