# 统一工具能力模型

模型请求声明 → ToolCallBlock/ID → Registry与ResolvedToolSet → Native/Pipeline → 具体Consumer/后端 → 规范结果与ContentBlock → tool/result/下一请求。每条箭头须注明实际条件，不能把它画成所有工具必走的一条安全链。

六个独立问题：看得见吗、此Step准入吗、允许执行吗、后端就绪吗、效果怎样约束、事实怎样记录。审批不是所有工具默认必问；guard不替代OS；fs意图不是进程检查；Web ready不是网络健康；MCP发现不授权Scope；内存提交不是flush。

H16综合保存每次请求当时的事件前缀与两侧输入，可作为后续审查的候选跨课样例；目前只索引，没有作正式四课一致性裁决。
