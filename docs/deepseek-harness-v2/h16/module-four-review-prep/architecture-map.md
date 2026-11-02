# 四类工具的组件地图

| 家族 | Consumer | 服务/提供方 | 额外条件与所有权 |
|---|---|---|---|
| File | tool-fs | FileSystem → local/sandbox等 | workingDirectory；观察插件；图片附件/模型路线；可信路径围栏 |
| Shell | tool-bash/tool-pwsh | ShellExecutor → local/sandbox → subprocess | shell-env；可选Jobs/控制器；任务与进程清理分层 |
| Web | tool-web | WebRuntime → 独立Search/Fetch注册提供方 | 逐调用选择；Step ready；输出限制；网络目标另管 |
| MCP | 每服务器client适配定义 | SDKClient/Transport ↔ Server | 名称/Scope、发现/切换、重连；资源独立runtime；无ctx.mcp |

统一入口不意味着家族同构。MCP资源、服务器instructions与Prompt模板不能混为一个机制。后续审查可对照H16比较表逐格检查实际配置；这里未运行外部系统。
