# H21前置输入

参见[H20交接](../h21-handoff.md)。必须带入五维区别：Session历史谱系、当前Agent身份、结构Fiber所有权、Handle释放能力、运行时父Agent。还需会解释协作取消/排空、下游恢复可能阻塞、未知外部结果不能盲重。

H21研究activation/provider/delivery、spawn与fork的上下文准备、后代清理与结果回传；本包没有开发这些实现或为其预先给GO。H22继续不同调度抽象，H23继续载体，H24再做完整系统证据。不要把历史Session分支当运行时子Agent。
