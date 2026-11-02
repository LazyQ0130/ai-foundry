# H17 前置与知识边界

仅交接，不开发H17。学员进入前应能从X_combined区分ToolCallBlock、运行时ToolExecutionResult、Session的tool/call与tool/result，以及下一请求里的工具历史。限制案例有七个调用/结果，write被拒绝，服务器计数0；这不是副作用回滚。

H17再展开SessionEvent、seq、Surface、deriveMessages与投影；本课只用第二真实Session重建各请求当时的前缀，不教完整事件溯源或持久化恢复。内存append接受不等于磁盘flush，stdio连接也不属于从Session历史自动重放的外部资源。

保留未验证项：真实LLM、完整E、原生Shell与三平台沙箱、Streamable HTTP、外部API/认证、完整MCP重连竞态、学员试读和实测时长。H20/H27/H28等分别扩展恢复、连接可靠性与交互环境，不把本课受控测试变成这些能力的全面证明。
