# 平台、后端与传输覆盖

实际宿主为Windows win32 x64；跨平台原生结论不外推。机器范围见[backend-coverage.json](evidence/backend-coverage.json)。

| 家族 | 真实受测组件/实际边界 | 替身 | 未运行 |
|---|---|---|---|
| File | tool-fs/fs-sandbox/local/workingDirectory/观察，真实Windows文件IO与原子发布；逐个明确文件清理 | 图片注册测试的Mock附件，未解码 | 真实图片/持久附件、恶意链接竞态、其他平台原语 |
| Shell | tool-pwsh/shell-env/Jobs/Native/Pipeline，前台/后台/取消接线 | FixtureShell固定只读命令输入与输出句柄 | 原生pwsh/bash、真实环境清理、超时强杀/spill、各平台进程沙箱 |
| Web | Runtime选择/ready、工具格式化/上限、错误与取消；纯URL校验 | 离线Search/Fetch，所有URL只作数据 | 真实HTTP/DNS/SSRF目标测试、厂商API/凭据、网络隔离 |
| MCP | 实际插件+SDK2.2.0+stdio管道+可信Node Server，发现/调用/资源/刷新/断线/一次重连 | Server业务是假数据；scope-only资源提供方是内存替身 | Streamable HTTP、外部Server/认证、完整重连竞态、phase2注册冲突执行 |
| 综合 | 实际AgentLoop/Scope/Registry/Native/Session，Loop与Adapter输入及每次前缀重建 | 脚本模型、Shell/Web替身 | 完整Host E、真实模型语义质量 |

没有Mock MCP Transport：这里真正经过SDK协商和stdio消息。也没有把本地Node进程通信写成原生Shell或OS沙箱验证。模型受控回复用于可重复行为，不能证明学员或真实LLM理解了资料。

网络限制依据固定HTTP provider的requestOnce与官方说明：URL/重定向卫生不构成完整私有目的地址限制，policy中的公开地址注释不能替代实现。原生runner、完整E与真实学员继续NOT_RUN。
