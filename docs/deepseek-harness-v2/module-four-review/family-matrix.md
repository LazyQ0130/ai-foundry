# File / Shell / Web / MCP真实组件比较

范围为锁定Commit，不从目录名推服务可用。包名前缀均为`@deepseek-ai/dsh-`；具体文件与源码分支见[断言索引](source-assertion-index.md)。四家族共享模型工具协议，不共享一套后端权限保证。

| 维度 | File | Shell | Web | MCP |
|---|---|---|---|---|
| 模型名称 | read/write/edit/read_image | bash或pwsh；组合后job_output等另属tool-jobs | web_search/web_fetch | mcp__server__raw（需要时规范化/摘要）；共享list_mcp_resources/list_mcp_resource_templates/read_mcp_resource |
| 注册Consumer | tool-fs | tool-bash / tool-pwsh | tool-web | 每服务器mcp-client把发现项适配成ToolDefinition；mcp-resources拥有资源工具 |
| 必需服务 | tools/fs/systemPrompt/workingDirectory | tools/shell/shellEnv/systemPrompt/workingDirectory等，具体inject以包为准 | tools/web/systemPrompt | mcp-client必需tools；没有通用ctx.mcp |
| 能力契约 | FileSystem `ctx.fs` | ShellExecutor `ctx.shell` | WebRuntime `ctx.web`，独立Search/Fetch registry | SDK Client/Transport ↔ Server；资源另有ctx.mcpResources |
| Provider实现 | fs-local；fs-sandbox继承local并加围栏；部署只选择一份同名fs | bash/pwsh-local或sandbox执行器→subprocess；sandbox另有Provider/runner | exa、perplexity、deepseek-official、deepseek-search-api/deepseek-fetch-api、http等 | 配置指定stdio程序或Streamable HTTP地址；SDK2.2.0 |
| 可选依赖 | Observation；read_image需attachments；路线image能力执行前检查 | Jobs/控制器、tool-jobs、sandboxPolicy/sandbox、spill等看组合 | Provider ready；tool-call-timeout-policy才施加预算；无强制Jobs | mcpResources/SystemPrompt、图像附件、reconnect配置 |
| 开关/配置 | read/write/edit/readImage分别开关，read窗口/行字符/字节等 | 方言、workdir、输出限额；Jobs出现可切换背景参数版本 | search/fetch开关；各自Provider ID；结果/查询/摘要/字符预算 | serverName/transport/command,args,env,cwd或URL；启动失败策略/超时/重连 |
| Scope | 工具贡献/提示路由；观察以调用Session对象为键 | 当前工具与任务归属，不隔离进程 | 影响可见工具与when，不控制网络目标 | Server名称/工具按层，资源请求先按exec.agent查server；外部Server不能改本地allow |
| Step准入 | 普通File无需特殊when；read_image不是模型能力when，附件控制注册，execute内查路线 | Jobs可导致工具注册替换，旧set不能认新登记；不等于每个命令when | selectedProviderReady=false排除；选择失败返回true，执行报告具体错误 | 已注册的发现项按普通Registry资格；连接断开未必注销；非“所有MCP调用前when探活” |
| 执行入口 | Loop→Tools→Native→Pipeline→File Consumer→fs | 同入口→工具→ShellExecutor→可选confine→subprocess | 同入口→工具→WebRuntime选择→Provider | 同入口→适配定义→SDK.callTool(rawName)；资源→runtime.request |
| 规范结果/模型内容 | 行号窗口/总行数、写编辑说明、图像附件；规范JSON再render | 前台输出/exitCode/aborted/timedOut等，或background jobId；exit7可isError=false | sources/可选content/truncated；Fetch url/statusCode/body，工具转Markdown和meta | 原始JSON规范值与模型投影分开，blob/图像另处理；远端isError归工具失败 |
| 典型错误 | FS_NOT_FOUND/FS_NOT_OBSERVED/FS_STALE_VERSION/FS_AMBIGUOUS_EDIT/FS_SANDBOX_DENIED等 | 缺服务不注册；后台参数缺组合拒绝；准备/执行基础设施错误；并非所有状态统一错误码 | WEB_PROVIDER_UNAVAILABLE/AMBIGUOUS/CONFIGURED_MISSING/CONFIGURED_UNAVAILABLE；未准入走工具未知等 | transport/协议/发现/同步错误、远端isError；不能杜撰统一稳定MCP错误码；UNKNOWN_TOOL可来自本地Scope |
| 取消 | signal按消费者/后端系统调用边界协作，不撤回已发布文件 | 执行器/子进程决定退出与终止，Jobs可能仍持任务；FixtureShell只模拟 | signal传提供方；政策预算需要组合；HTTP超时不证明上游未处理 | SDK请求取消与远端完成分开；监督器拥有同步链、旧代关闭和重连等待 |
| 释放 | 工具/监听由Fiber撤销；观察卸载清空；夹具单文件清理 | 工具、任务、进程各自owner；工具回执不等于任务完全退出 | 工具与Provider注册各自Effect撤销；在途操作看Provider | dispose停止重连、等待同步/关闭、注销工具/名称；首资源provider注册共享工具，最后一个撤销 |
| 安全限制 | 可选意图+expected、路径围栏，非任意代码内核边界；残余TOCTOU | 实际sandbox消费者和runner才约束文件效果；模式非网络；Windows partial | 外部数据不可信；HTML清洗/URL语法不是完整SSRF或注入防御 | stdio程序在宿主执行，须信任或另隔离；发现/Server instructions/结果不授权 |
| 动态证据 | H15真实local+适配器；H16真实tool-fs；新增B实际Loop8call | H16真实tool-pwsh/env/Jobs+FixtureShell；原生NOT_RUN | H16八离线变体；新增C同一Loop跨Step状态变化；网络0 | H16实际SDK本地stdio两Server、工具/资源/同步/故障/一次重连和退出；D复用；HTTP NOT_RUN |

“工具注册后一定能搜索”“断开立即所有MCP工具消失”“File和Shell边界完全相同”“Resource自动成为系统提示”“Fetch是完整浏览器”“所有工具错误终止Turn”均不成立。分别可由Web none、MCP retained、FS事件vs进程、资源按需读取、HTTP正文抓取、H14普通body-error和新增A/C推翻。以上反例针对固定实现，不是泛泛框架经验。
