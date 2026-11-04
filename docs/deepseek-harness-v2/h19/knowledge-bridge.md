# H19 前置阅读与知识衔接

基线H18提交a8fe4fb；官方源码固定f3803c96974ad4a94195fb97e5c637e9c2a3afe3。本轮按任务完整阅读30讲蓝图、第一至第四模块集中审查与有效制作规范，阅读H10/H11/H12/H14/H17/H18正式教材和相关实践、断言/质量/交接材料；固定源码的Compaction/TokenMeter文档、实现、配置目录与相关官方测试的装配/动作/断言分支分别核对。前置材料hash登记于 evidence/prerequisite-review.json。

官方测试仅静态研究，不宣称跑过完整Vitest：相关路径包括 token-meter/tests/{token-meter,measurement-projection,route-pricing,context-breakdown-projection}.spec.ts；compaction-basic/tests/{compaction-basic,compaction-loop-repro,manual-compaction,runtime-context-admission}.spec.ts；tool-result-pruner、image-offload、projection、command-compact的spec。上游存在递归清理路径，实际行为另用不删除文件的本课fixture验证。

| 衔接 | 已建立的概念 | H19使用与核查 | 防止跨界 |
|---|---|---|---|
| H10→H19 | Turn/Step/Attempt及失败结算 | D:overflow按attempt后、step/end前重试；pre-step错误可继续 | 不把摘要当普通用户Step；完整可靠性留H20 |
| H11→H19 | Prompt、request/header、工具Schema | A核system/schema成本；模型切换测目标封装；摘要另带指令 | Header不是所有消息；不借机开发完整路由系统 |
| H12→H19 | AssistantStream、Settlement、可缺Usage | A真实Accumulator一致流；Usage锚点有完整头和下限前提 | reasoning不重复加，脚本Usage不称真实账单 |
| H14→H19 | Assistant工具提议、tool/call、tool/result | 选区按Surface工具配对；B/X替换结果仍保留身份与原事实 | 修剪不是重执行；不凭缺结果猜外部状态 |
| H17→H19 | Event Log、Surface、Projection、deriveMessages | summary仅日志；user replace改变位置；image/offload是消息投影 | 不把Seq大小当位置；不删旧事实；不新增弃用同步读 |
| H18→H19 | Handle所有权、flush、关闭、新实例Resume | X真实JSONL存完整压缩决定，恢复相同派生消息且不重跑旧调用 | 无后端flush不证明磁盘；H18跨进程结果不转记H19 |
| H19内部 | 计量→三入口→平衡选区→摘要→替换→恢复 | A/B/C/D/X逐层验证；五个精读入口与三段学习停顿 | 不把Mock摘要当事实完整性证明 |

与H18交接核对：格式与恢复只作为承载压缩事件的前置，不复做Fork课程；日志继续保留但上下文可缩减。当前真实X只覆盖正常闭合后Resume，未测试崩溃于summary/replace/end之间后跨进程恢复。原物理文件与临时空目录保护另由最终审计验收。

与后续蓝图核对：H20承接本课取消、超限、重试、部分提交的边界；后续路由与多模态课程承接modelPolicies、适配器图片价格等。本课只给解释当前Compaction所需的机制，不实现它们的完整配置矩阵或架构。
