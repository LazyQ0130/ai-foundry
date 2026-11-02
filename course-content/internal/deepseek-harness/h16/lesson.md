---
estimatedTime: "240～320 分钟（分三段；作者估算，安装另计，真实学员时长待验证）"
difficulty: "高级源码研习 · 多工具组合与能力边界"
objective: "为隔离项目配置可解释的 File、Shell、Web、MCP 能力，沿真实组件追踪注册、步骤准入、后端调用与结果历史，用受控实验定位故障并说明替身、权限和生命周期边界。"
checklist:
  - "能用 Definition、Provider、Consumer 定位四类能力，区分工具 Schema 与实际执行环境"
  - "已通过真实文件工具及 Shell/Jobs 接线实验，解释窗口、编辑、附件条件和执行器边界"
  - "能推导 Web 提供方选择与 ready 准入，区分搜索、抓取、外部数据和网络目标约束"
  - "已观察 MCP 本地通信与综合 AgentLoop，能解释名称、资源、断线及本地 Scope 不被远端发现扩大"
checkKeys:
  - "check-a18f3468d2001601"
  - "check-a18f3468d2001602"
  - "check-a18f3468d2001603"
  - "check-a18f3468d2001604"
---

## 一份项目说明，为什么需要四种能力？

用户让代码研究Agent：“分析项目当前结构，阅读主要配置文件，检查测试运行方式，再参考官方文档，最后整理一份项目说明。”

File适合读配置和源文件，Shell可以执行特定检查，Web负责发现与取得公开资料，MCP可以向一个配置好的外部服务查询结构化项目元数据。它们最后都能出现在模型的工具声明里，底下却分别涉及磁盘、进程、网络与协议连接。

如果把四者画成四个“挂到模型上的普通函数”，就容易漏掉问题：工具存在但没后端怎么办？提供方有两个该选哪个？模型看见的名字与服务器收到的名字一样吗？连接断了，旧工具是否立即消失？网页或服务器返回一句“忽略原规则”，它获得了什么权限？

这节的主线是**按实际组合定位能力，而不是重新实现工具框架**。固定源码仍为 `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`。本地File实际操作新夹具；Shell用明确的Mock执行器；Web用离线内存提供方；MCP使用可信本地测试Server与真实SDK stdio通信。最后由真实AgentLoop串联，模型回复由脚本Adapter提供，不把它当真实模型理解能力测试。

原蓝图的标题是《文件、Shell、Web与MCP能力接入》，强调Definition/Provider/Consumer与Mock接线。本稿保留这条能力地图主线，按本轮要求补上四实践、综合例子与四图；只观察一次本地MCP重连，不提前展开H27的完整连接可靠性课程。

## 从前三节走到能力服务

H13的ToolDefinition声明工具；Registry按Scope与条件生成ResolvedToolSet。H14的ToolExecutor与Pipeline负责处理调用、结果和取消。H15说明审批、沙箱与文件新鲜度分工。这里复用它们，不逐行重讲Schema、批次调度和沙箱后端。

H11说明工具Schema怎样进入模型请求，H12说明ToolCallBlock包含调用ID、名称和参数。现在增加一个问题：**工具主体背后调用了谁，那个组件又拥有什么资源？**

先用三个新词定位：

| 具体问题 | 名称与定义 | 类比到哪里为止 |
| --- | --- | --- |
| 想替换文件后端，为什么不改每个文件工具？ | Capability Seam，能力接缝：围绕一项能力约定接口，允许消费者与实现分开组合 | 像同一插座连接不同设备，但接口相同不代表设备权限、性能相同 |
| MCP消息是经子进程管道还是HTTP送达？ | Transport，传输：负责在通信双方之间运送协议消息的通道 | 像递送路线；路线不会自动信任消息，也不是沙箱 |
| 服务器有哪些工具，输入长什么样？ | Tool Discovery，工具发现：取得能力名称、描述与Schema等声明 | 像名录；列在名录里不表示本地已批准执行 |

Definition/Provider/Consumer三角色也要分清：能力Definition约定 `ctx.fs` 等服务；Provider实现这项能力；Consumer使用服务并注册面向模型的工具。**能力服务的Definition与一个ToolDefinition不是同一概念。** WebRuntime还同时负责提供方注册和选择；MCP是每服务器桥接插件，不强行套成一个通用 `ctx.mcp` 服务。[职责与作用域](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/docs/subsystems/mcp.zh.md#L39-L47)

![Agent 当前步骤的 Schema 和 ToolCallBlock 经统一工具入口处理，随后分到 File、Shell、Web、MCP 各自能力路径；每类保留自己的后端、约束和资源责任](/course-media/harness-v2/h16/h16-01.png "图 1｜上部是统一调用控制，下部是能力分支。注册、步骤准入和实际执行分别判断，不能由同一个“可用”状态替代。")

可以按四层读一次调用：模型看到名称与Schema；工具定义说明输入，由具体家族接线负责校验与结果组织；主体调用能力服务或SDK；实际后端执行，再把结果交回统一协议。并非每个家族都单独拥有四个包；这是一份责任清单，不是硬性类继承图。

## File：工具组织操作，后端落实文件原语

`dsh-tool-fs` 是消费者，依赖 `tools`、`fs`、`systemPrompt`、`workingDirectory`。配置分别控制read、read_image、write、edit的注册，默认开启；但read_image还受附件服务存在条件影响。缺依赖时插件可能等待而不注册，不能只确认包能被导入。[inject / apply](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/fs/tool-fs/src/index.ts#L21-L92)

FileSystem服务约定resolve、stat、readText、writeText、editText等；fs-local实现本地磁盘，fs-sandbox继承本地实现并给变更增加策略围栏。二者替换同名服务提供者，不能把裸local描述成天然在工作区内。观察策略是另一个可选事件插件，相关机制只按H15必要复习。[SandboxedFileSystem](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/fs/fs-sandbox/src/index.ts#L53-L62)

### 相对路径跟随当前工作目录，不跟随一句 cd

工具通过workingDirectory服务取得调用Session的有效目录，再交给文件后端解析；无Agent直接调用才使用后端默认值。服务还会校验目录存在。Session header保留原始项目目录，而当前工作目录可由持久变更事件调整；当前目录变化不等于扩大SandboxPolicy使用的原始工作区边界，也不是调用宿主 `process.chdir()`。[sessionResolveOptions](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/fs/tool-fs/src/session-cwd.ts#L21-L25)

例如原始项目在fixture根，工具传 `file_path: 'fixture.txt'`，就按该会话有效目录解析。若Shell上一调用执行了cd，也不能据此推导下一次文件工具或新Shell进程继承了它的进程状态。

### read：窗口输出，仍要数清整个文件

read先解析参数，offset从1开始，limit默认及最大值由部署readLimit决定。一次stat取得文件类型、大小和观察版本：不存在则记录缺失并抛FS_NOT_FOUND；不是普通文件也拒绝。大文件或大小未知时使用streamText，否则readText。[parseReadArgs / execute](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/fs/tool-fs/src/read.ts#L57-L169)

之后buildWindow按行筛选，给保留的行编号，并分别限制行数、源行字符与保留字节。即使保留窗口已满，仍继续扫描，以得到准确totalLines。它不是只读前几行就声称知道总行数；也不是把全部内容无限保存在模型输出中。[buildWindow / truncateLine](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/fs/tool-fs/src/read-render.ts#L68-L117)

实践A把readLimit设2、单行源字符上限设8，并强制流式路径。第2～3行显示两个repeat，totalLines为4。长行的value.lines.text会包含 `... (line truncated to 8 chars)` 提示，所以“源行上限8”不能误算成“最终text总长不超过8”。读取窗口也不表示只对这些字节授予观察授权：固定版本记录的是该目标的stat版本。后续编辑是否适用仍需判断，不能从看过一小窗推导模型理解了整个文件。

### write与edit分工不同

write提交完整新内容，可以创建或替换；edit按old_string/new_string进行字面替换，replace_all决定是否替换全部匹配。没有匹配与存在多个匹配是不同错误；歧义不能靠随意选第一处解决。H15的观察条件在消费者分发fs意图事件后交给后端检查；成功变更还会更新观察。[execute](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/fs/tool-fs/src/edit.ts#L131-L140)

贯穿任务可以这样做：read取得配置窗口 → 判断需要修改的内容 → edit精确替换 → 再read验证实际保存结果。实际代码当然可以直接通过ctx.fs操作，但绕过工具消费者也可能绕过自动观察事件或结果呈现，这正是本课要区分的能力层。

### read_image：附件与模型路线是两道条件

read_image不是把base64大字符串塞进文本。它通过文件后端取得支持的图片字节，交给附件服务校验、解码及持久存储，再返回带附件引用的图像ContentBlock和文本说明。当前路线还必须明确声明image输入；未知能力不能当作支持。[assertImageCapableRoute / execute](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/fs/tool-fs/src/read-image.ts#L118-L280)

这里要细分位置：附件服务存在时，tool-fs才注册read_image；**当前固定实现对模型图片能力的检查在execute内部、文件IO之前，并非该工具注册上的when条件。** 因而看到Schema也不证明这个模型能成功读取图片。实践A只用Mock附件服务验证注册出现/撤销及缺模型路线的执行前拒绝，没有运行图片解码、存储或多模态模型，不把这一条件测试升级成图像能力实测。

## Shell：工具、执行器、环境和Jobs各有职责

tool-bash与tool-pwsh向模型声明命令参数并呈现结果；`ctx.shell`由某个ShellExecutor实现提供。local执行器通过subprocess能力创建和管理进程；sandbox执行器再消费沙箱提供方及策略。shell-env贡献每次调用的可信DSH环境快照；Jobs在组合启用时拥有任务标识、输出读取和生命周期。[inject / apply](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/shell/tool-pwsh/src/index.ts#L48-L557)

![File、Shell、Web 的能力服务、提供方和消费者分层；MCP 以每服务器桥接接入 Registry，并另有共享资源服务，没有通用ctx.mcp](/course-media/harness-v2/h16/h16-02.png "图 2｜角色归属图，不是同步执行顺序。ToolDefinition与能力服务契约不同，四家族不要求结构完全一致。")

| 角色 | 具体组件 | 它不替谁负责 |
| --- | --- | --- |
| 工具消费者 | tool-bash或tool-pwsh | 不独自创建OS沙箱 |
| Shell执行器 | bash-local/pwsh-local，或对应sandbox实现 | 不拥有模型会话或所有后台任务策略 |
| 环境贡献 | shell-env收集DSH_HOME、会话等事实；执行端另外处理父环境 | 不等于自动消除所有敏感环境信息 |
| 子进程运行时 | 对应subprocess提供方 | 不决定模型当前可见工具集合 |
| 可选Jobs | jobs-local与tool-jobs等 | 缺服务时不能凭run_in_background字段创造后台能力 |

Bash与PowerShell方言不同：前者按bash -c解析命令，后者把命令作为一个argv元素交给PowerShell的-Command。Windows路径、变量语法和运行时选择也不同。普通调用新建进程，所以变量、cd与shell内存状态不自动跨调用持续；应明确传workdir，按Session有效目录取得默认值。[PwshLocalExecutor](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/shell/pwsh-local/src/index.ts#L1-L9)

shell-env的贡献是可信插件声明并逐调用收集的DSH命名空间；执行端还会清理父环境中的凭据形状和旧DSH值，再叠加受控事实。不能把本课Mock执行器接收到正确dshEnv，写成真实进程环境清理已经验证。[collect](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/shell/shell-env/src/index.ts#L154-L163)

### 非零退出与基础设施异常不同

ShellExecution.result约定：命令非零退出、超时终止和取消终止可以返回描述性结果；准备或基础设施失败才可能使Promise拒绝。工具会按其路径把aborted等映射到工具失败，但普通exitCode=7仍可能是 `isError:false` 的前台结果，退出码供模型和应用继续判断。[ShellExecutor](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/shell/shell/src/index.ts#L49-L96)

stdout/stderr也不是无限文本：执行器有内存和可选spill上限，结果带truncated等事实。限流、spill及真实进程杀停涉及具体提供方，本课只验证消费者接线，不以固定字符串输出替代这些原生行为的证据。

### 后台能力是组合结果

没有Jobs时，工具只声明前台能力，即使Schema根允许额外键，执行时也会拒绝偷偷传入的run_in_background。Jobs就绪并且配置允许后，注册会切换为带后台字段的版本；请求后台时返回jobId，后续通过job_output等工具读取。Jobs卸载时，工具可以回到前台版本。[pwshTool / apply](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/shell/tool-pwsh/src/index.ts#L524-L612)

还有一层区别：存在Jobs且promoteOnTimeout适用时，普通前台调用也可能先注册任务再等待；到时限可以转后台。禁用相关能力、缺控制器或任务准入失败时会走另一条截止处理路径。取消、超时、输出消费游标与任务所有权要结合实际配置，不能说“所有Shell都支持后台”或“工具返回即进程结束”。完整故障恢复留给H20。[execute](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/shell/tool-pwsh/src/index.ts#L537-L553)

本课实践B只向FixtureShell提交白名单字符串Get-Location，不执行OS命令。这个替身明确模拟退出码与取消；真实tool-pwsh、Registry、Pipeline、shell-env、workingDirectory和Jobs仍在运行。因此我们能判断接线与结果，不能判断PowerShell本身、Bash跨平台行为或原生沙箱强制效果。

## Web：Search找来源，Fetch取指定内容

web_search接收queries数组，用来发现相关来源；每个seam搜索请求只含一个query。web_fetch接收一个URL，取得该资源正文。搜索结果有sources、可选content及truncated；Fetch结果有最终url、statusCode、html/text正文及truncated。搜索返回摘要，不等于已经读取完整页面。[WebSearchRequest / WebFetchResult](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/web/web/src/types.ts#L14-L83)

WebRuntime提供 `ctx.web`，分别维护Search和Fetch提供方注册。tool-web只调用统一服务，不需要知道底层厂商；选择哪家由部署配置与当前提供方状态决定。真实包提供了多种选择，本课都不发送凭据或外网请求：[registerSearchProvider / registerFetchProvider](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/web/web/src/index.ts#L103-L122)

| 提供方包 | 能力及稳定ID | 本课证据边界 |
| --- | --- | --- |
| web-search-exa | Search，exa | 静态核对注册与接口，未调用API |
| web-search-perplexity | Search，perplexity，可带生成的摘要content | 同上，不把摘要当已核实事实 |
| web-search-deepseek | Search，deepseek-official，辅助Messages搜索路线 | 未运行，不等同当前聊天请求自动搜索 |
| web-deepseek-api | 分别注册deepseek-search-api与deepseek-fetch-api | 共享服务下仍是两类操作及各自选择 |
| web-fetch-http | Fetch，http，经HTTP(S)取得正文 | 只运行无网络URL校验；真实抓取未测 |

### 提供方选择不按注册先后碰运气

显式searchProvider/fetchProvider会选择对应注册且available的ID；没有指定时必须恰好一个可用。配置ID不存在、配置ID不可用、零可用、多个可用是四种不同WebError。每次操作重新读取选择值，不要求换提供方时重挂所有工具。[resolveProvider](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/web/web/src/index.ts#L226-L248)

| 选择输入 | 调用结果 |
| --- | --- |
| 未指定，恰好一个available | 自动使用它 |
| 显式second，first与second都可用 | 使用second |
| 未指定，零个可用 | WEB_PROVIDER_UNAVAILABLE |
| 未指定，两个可用 | WEB_PROVIDER_AMBIGUOUS |
| 配置missing且未注册 | WEB_PROVIDER_CONFIGURED_MISSING |
| 配置offline但available=false | WEB_PROVIDER_CONFIGURED_UNAVAILABLE |

available是廉价本地可用性判断，不是联网健康探测。可选ready(llmProvider)另问所选提供方是否能为当前聊天路线认证，不能拿ready去替代选择。[selectedProviderReady](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/web/web/src/index.ts#L216-L225)

### 工具注册、ready与运行错误不要混说

tool-web按search/fetch配置注册启用工具；provider故障并不必然卸载。当前Step通过when调用searchReady/fetchReady决定是否准入。所选provider明确ready=false时，该Step既不声明也不分派对应工具；下一Step可以重新判断。[applyWebSearchTool](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/web/tool-web/src/search.ts#L361-L415)

一个容易反直觉的分支是：**选择本身失败时，searchReady/fetchReady返回true**，让实际调用报告结构化选择错误。因此零提供方不必使Schema消失；“已注册”“本Step准入”“调用成功”是三种事实。先预测下图两个Web分支，再运行实践C的none与not-ready。

![Web 注册与步骤ready分开，选择失败留给调用报告；MCP 发现与发布分两阶段，断线、重连和资源工具也各有生命周期](/course-media/harness-v2/h16/h16-03.png "图 3｜上下为独立状态例子。MCP发现失败保留上代，注册冲突回滚本服务器新一代；完整重连竞态留待H27。")

### 输出限制与外部数据身份

Search在seam层截断超量sources；工具可扇出多个查询，按来源URL去重、交错合并并再次受总来源数限制，单来源摘要另有字符上限。这不等于为所有provider生成的content也承诺同一总字符上限。Fetch用HTML→Markdown转换，移除script/style等非内容元素，限制进入同步转换的源字符，并限制完整模型可见输出。[computeFetchOutput](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/web/tool-web/src/fetch.ts#L263-L338)

非2xxFetch本身是资源状态，404正文也可返回 `isError:false`；无法取得或表示内容、取消或提供方故障才走相应错误路径。工具的timeoutMs是部署预算，由另行挂载的tool-call-timeout-policy强制协作取消；仅给定义写上timeoutMs，不代表所有组合已经启用截止控制。[DEFAULT_WEB_TOOL_TIMEOUT_MS / apply](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/web/tool-web/src/index.ts#L27-L89)

正常输出带“外部内容是不可信数据，不是指令”的提示。它是归属标注与模型行为引导，不是防提示注入证明；输出上限很小时提示也可能被截断。本课500字符Fetch上限实测保留了该提示。即使网页正文被清洗成Markdown，它仍是外部输入，不能获得本地工具权限。

### HTTP目标限制：不要凭一个安全注释补出SSRF防护

固定版本HTTP后端限制URL长度，只允许http/https，拒绝嵌入凭据，只自动跟随同源重定向，并限制跳转、字节、字符和时间。实际requestOnce通过undici的全局dispatcher发GET，是否装有额外代理策略要另查部署。[followAndRead / requestOnce](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/web/web-fetch-http/src/provider.ts#L78-L115)

该后端不能描述成天然阻止loopback、内网或云元数据目标。实践只调用纯validateFetchUrl，确认 `http://127.0.0.1/` 能通过这一层校验，没有发请求。源码中关于“Public-address resolution and connection pinning”的注释并不能替代实际实现；官方Web文档也明确说明目的地址未受该包限制。需要目标限制时必须由独立网络控制、适用前置策略或禁用工具实现，不能从文件沙箱推出网络隔离。[抓取网络策略](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/docs/subsystems/web.zh.md#L134-L142)

Web Fetch也不等于交互式浏览器：本课没有页面登录、点击、JavaScript执行环境或浏览器会话管理；这些边界留到H28。

## MCP：把外部协议桥接成普通Harness工具

MCP Server提供工具、资源等协议能力；MCP Client与它协商、发现并发起调用。Tool Call是执行一项外部能力，Resource是按URI描述和读取资料，Transport负责传输。本课的测试Server是可信本地夹具，协议通信真实运行，业务结果仍是虚构元数据。

`mcp-client`每个插件实例配置一个serverName，支持stdio或Streamable HTTP。stdio由SDK启动指定子进程，经管道通信；Streamable HTTP连接配置的URL。本课不使用npx，不下载未知Server，子进程只运行随课审阅过的mcp-server.mjs；Streamable HTTP仅静态核对。stdio本身不限制这个程序访问宿主资源。[createTransport](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/mcp/mcp-client/src/transport.ts#L31-L46)

插件只依赖统一工具注册表作为必要入口，不提供共享ctx.mcp；可选地向mcpResources发布资源提供方，向SystemPrompt发布有服务器归属的指令章节。SDK拥有协议协商与消息校验，Harness桥接拥有公开名称、工具适配和所属插件生命周期。外部Server不会替换本地Registry。[apply](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/mcp/mcp-client/src/index.ts#L32-L188)

MCP返回内容同样来自外部，合法协议结构不等于可信指令，也不要假设它自动带Web相同的不可信提示。工具结果投影与服务器instructions是两条通道，本地权限都不能由这些内容自行扩大。

### 公开名称与发送名称分开

干净原名的公开工具名为 `mcp__<serverName>__<rawName>`。alpha和beta都提供metadata时，模型分别看到mcp__alpha__metadata与mcp__beta__metadata，SDK仍向对应Server发送原始metadata，而不是把公开名再拆回原名。桥接在发现时保留明确的原名映射。[publicToolName / syncTools](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/mcp/mcp-client/src/tools.ts#L79-L145)

公开名还要满足最多64字符与字符集要求；有损替换或截断时追加由服务器名与原名计算的12位hash，降低常见归一化冲突。它不是任意输入绝对无碰撞的数学证明；清单中产生重复公开名仍会被拒绝。serverName在同一注册Scope内不能重复，不同Agent作用域可以复用该名称。

### 工具列表更新分两阶段

先通过SDK取得完整列表并构造下一代定义；这一阶段网络/协议失败或重复名字，会保留上一代注册。成功后才撤销上一代并注册下一代；若此时遇到外国注册占位等冲突，新一代会全部回滚，本服务器不留下半套工具。**后一分支不能说成一定保留旧工具**。[syncTools](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/mcp/mcp-client/src/tools.ts#L118-L162)

实践D实际触发正常新增与重复列表：extra出现；随后重复metadata导致刷新失败，旧extra仍在。注册冲突阶段本轮只静态核对，没有把前一分支的实测外推为两阶段都运行过。

### 断线与工具消失不是同一个时刻

连接监督器拥有客户端/传输代际、串行同步和重连。已建立连接丢失且reconnect=false时，注册工具保留，调用旧连接失败；资源服务器条目也可仍存在，但请求报告disconnected。reconnect=true时会按有界退避创建新连接、发现并重新发布；预算耗尽才撤销服务器工具。无法确认旧代关闭时还会停止重连，避免重叠子进程。[scheduleReconnect](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/mcp/mcp-client/src/connection.ts#L211-L239)

本课分别实测关闭重连后的保留与失败，以及一次stdio断开后新PID重连成功。完整退避预算、旧代迟到消息、关闭失败、启动协商竞态与HTTP恢复矩阵属于H27及H20，不在这里假装全面覆盖。卸载插件则应停止重连、等待在途同步结算、关闭连接并撤销其工具与名称保留。[dispose](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/mcp/mcp-client/src/connection.ts#L393-L416)

## MCP Resource：显式按服务器读取，不自动灌进Prompt

`ctx.mcpResources`拥有共享注册表与三个工具：list_mcp_resources、list_mcp_resource_templates、read_mcp_resource。前两个发现资源URI或参数化模板，后一个按指定server与URI读取。列表返回的URI是定位信息，不等于已经下载正文，也不等于一个命令字符串。[registerResourceTools](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/mcp/mcp-resources/src/tools.ts#L32-L58)

这些共享工具在有可见服务器提供方时存在；调用时再在执行Agent的Scope中解析server。一个不可见的scope-only服务器，不能仅靠猜出字符串就从其他Agent读取。连接是否可用由连接拥有的provider继续判断，所以服务器注册仍在而网络断了时，工具可能仍可见并返回失败。[request](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/mcp/mcp-resources/src/index.ts#L121-L129)

资源读取按需进行，连接本身不触发把所有资源内容放进SystemPrompt。普通读取文本进入工具历史；规范value保留完整JSON，模型文本会把blob二进制字段换成描述，不直接灌base64。本课实际读文本资源，二进制呈现只静态核对。服务器instructions是另一条有归属的Prompt章节路径；它与MCP Prompt模板不是同一功能，固定版本不提供完整Prompt模板、资源订阅或任务型执行桥接。[renderResourceResult](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/mcp/mcp-resources/src/render.ts#L16-L24)

## 用同一张比较表判断能力来源

| 维度 | File | Shell | Web | MCP |
| --- | --- | --- | --- | --- |
| 谁注册模型工具 | tool-fs按开关，图片再看附件服务 | tool-bash或tool-pwsh，Jobs可引起版本切换 | tool-web按search/fetch开关，Step另查ready | 每服务器client适配发现列表；资源由共享服务注册 |
| 服务与后端 | ctx.fs + workingDirectory；local/sandbox等后端 | ctx.shell + shellEnv + workingDirectory；local/sandbox执行器再接subprocess | ctx.web分别选择Search/Fetch Provider | 无通用ctx.mcp；连接中的SDKClient；可选ctx.mcpResources |
| 外部进程或网络 | 本地文本原语不需Shell；其他后端可能远端 | 原生local创建进程；命令是否联网取决于命令和额外控制 | 生产Provider通常联网，本课内存Provider不联网 | stdio是进程管道，HTTP是网络；本课实际本地Node进程 |
| 附加资源 | read_image需要持久附件与可验证图片路线 | 后台与提升依赖Jobs/控制器等组合 | 普通文本不依赖Jobs；超长输出保留另看部署 | 图像投影需要附件；Resource另按服务器及Scope |
| Scope的作用 | 过滤工具、提示词与调用者所属观察 | 影响可见工具与任务所有者，不是OS权限 | 控制工具准入/可见性，不替代网络目标限制 | 服务器名称保留、工具与资源提供方按注册/调用Scope解析 |
| 主要安全条件 | 路径围栏、观察expected需真实挂载和正确消费者 | 需实际sandbox执行器/provider才有文件效果限制 | 外部数据不可信；文件沙箱不管网络目标 | 发现不授权本地能力；stdio不隔离进程；外部内容不可信 |
| 典型失败 | 缺fs/目录，未观察，陈旧或歧义 | 缺执行器/Jobs，准备失败，或普通非零状态 | 配置ID缺失/不可用、歧义、未准入、检索失败 | 协商/发现/同步/连接失败或远端isError |
| 取消与释放 | 消费者传signal，后端按系统调用边界协作；监听归属插件 | 执行器与subprocess拥有进程，Jobs拥有任务；按实际层清理 | signal传Provider，预算需对应策略；注册归属Fiber | SDK取消请求，监督器停重连并关闭/等待/注销 |
| 模型最后看到 | 行号文本、写编辑说明或附件图像 | 输出、退出/超时/任务标识等呈现 | 来源/摘要或HTTP状态及正文，带外部数据提示 | 适配的工具结果或有服务器归属的资源文本；不一定等同规范value |

这些格子不能脱离部署判断。接口统一使Agent能够组合结果，但不会自动抹平权限、状态或清理责任。

## 统一结果协议，保留各家族的语义

ToolCallBlock提出调用，ToolCallId关联一次根级调用；ToolDefinition说明输入与执行，ToolExecutionResult保存运行时规范结果，ContentBlock形成模型可读内容。Native路径把结果作为ToolResultMessage交回Loop，接线存在时Session产生tool/call与tool/result；tools/result则是运行时观察。[BatchSettlement](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/tools/src/batch.ts#L124-L262)

例如File的FS_AMBIGUOUS_EDIT、Web的WEB_PROVIDER_AMBIGUOUS仍有各自机器错误码；运行时失败位置在 `result.error.info.code`，不能误读为 `result.error.code`。Session日志的错误投影还有自己的形状，需沿H14核对。Shell exitCode=7可能是正常描述性value；MCP服务返回isError则桥接抛错，使统一结果标为失败。两段同样的文本“失败”不代表同样的重试或权限后果。[errorInfo / toolErrorResult](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/tools/src/pipeline.ts#L680-L707)

## 实践准备：同一套可复核的隔离入口

四项实践A～D之外还有综合X；这些字母是实践名，不是验证等级。分级继续使用A教学模拟、B独立Cordis、C真实单组件、D多个真实组件局部组合、E完整应用及外部集成。本轮9项C与14项D，共23项TAP检查；依赖组件不重复计级。真实stdio本地通信仍归D，不凭一个SDK调用升级为完整应用E。

作者runner先核9552份固定源码/文档/配置的Git blob和SHA256，再把lab复制进全新临时目录，使用新DSH_HOME与环境白名单。SDK及转换依赖在仓库外隔离安装，所有运行依赖版本/integrity与固定上游锁核对；没有npx或业务依赖变更。Windows是本轮实际宿主。

```powershell
python docs/deepseek-harness-v2/h16/scripts/check-sources.py
node docs/deepseek-harness-v2/h16/scripts/run-labs.mjs
```

随附lab中所有文件需保留原名。程序、原始执行参数、退出值、stdout/stderr、程序hash与目录均在证据包中。negative-answer故意预测“零Web提供方使工具注销”，必须非零退出。若核心练习不能运行，应保留失败，不能通过更宽权限或替换官方组件来凑PASS。

清理遵守用户指令：禁止批量删除。每次只删除一个已经检查路径的明确夹具/暂存文件，自动创建的空目录保留；只替换官方默认递归清理钩子，不替换文件版本、字面编辑、原子发布或Windows文件原语。SDK连接关闭由真实生命周期负责，Web不发真实请求，Shell不执行命令。

:::deepdive{title="依赖接线完整程序"}
保存为bootstrap.mjs。hook只解析隔离依赖与固定源码的诊断子模块，不替换实现；SDKstdio子进程也用这份已核验入口。
<!-- code:bootstrap.mjs:start -->
```javascript
import { registerHooks,createRequire } from 'node:module';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
const base=createRequire(pathToFileURL(process.env.H16_DEPS_ANCHOR));
const fsDeps=createRequire(pathToFileURL(process.env.H16_FS_DEPS_ANCHOR));
const extra=createRequire(pathToFileURL(process.env.H16_ECO_DEPS_ANCHOR));
const names=new Map(['js-yaml','@eslint-community/regexpp','ajv','node-addon-require-builtin','resolve.exports','semver'].map(n=>[n,pathToFileURL(base.resolve(n)).href]));
for(const n of ['chokidar','koffi','yaml'])names.set(n,pathToFileURL(fsDeps.resolve(n)).href);
for(const n of ['zod','turndown','@joplin/turndown-plugin-gfm','diff'])names.set(n,pathToFileURL(extra.resolve(n)).href);
for(const n of ['@modelcontextprotocol/client','@modelcontextprotocol/client/stdio','@modelcontextprotocol/server','@modelcontextprotocol/server/stdio'])names.set(n,pathToFileURL(extra.resolve(n)).href);
for(const [name,path] of [['@deepseek-ai/dsh-web-fetch-http/src/policy.ts','packages/web/web-fetch-http/src/policy.ts'],['@deepseek-ai/dsh-tool-fs/src/read.ts','packages/fs/tool-fs/src/read.ts'],['@deepseek-ai/dsh-mcp-client/src/tools.ts','packages/mcp/mcp-client/src/tools.ts']])names.set(name,pathToFileURL(resolve(process.env.HARNESS_SOURCE_CACHE,path)).href);
registerHooks({resolve(s,c,next){
 return next(names.get(s)??s,c);
}});
```
<!-- code:bootstrap.mjs:end -->
:::

:::deepdive{title="完整公共准备"}
保存为support.ts。base挂载真实公共组件，files提供真实受限本地fs与workingDirectory。carrier用于组件场景；综合场景使用真实AgentLoop Agent。
<!-- code:support.ts:start -->
```typescript
import assert from 'node:assert/strict';
import {mkdtemp,stat,unlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,dirname,relative,isAbsolute,basename} from 'node:path';
import {Context} from '@deepseek-ai/cordis';
import SessionStore,{Session,SessionId,SESSION_FORMAT_VERSION} from '@deepseek-ai/dsh-session';
import SessionProjectionRegistry from '@deepseek-ai/dsh-session-projection';
import SystemPrompt from '@deepseek-ai/dsh-system-prompt';
import ToolsService from '@deepseek-ai/dsh-tools';
import {NativeToolExecutor} from '@deepseek-ai/dsh-tool-executor-native';
import SandboxPolicy from '@deepseek-ai/dsh-sandbox-policy';
import SandboxedFs from '@deepseek-ai/dsh-fs-sandbox';
import WorkingDirectory from '@deepseek-ai/dsh-working-directory';
import LlmRuntime,{ToolCallId} from '@deepseek-ai/dsh-llm';
export {Context,Session,SessionId,ToolCallId};
export const gate=<T=void>()=>Promise.withResolvers<T>();
export const textOf=(r:any)=>r.content?.filter((b:any)=>b.type==='text').map((b:any)=>b.text).join('')??'';
export async function exists(p:string){try{await stat(p);return true;}catch(e:any){if(e.code==='ENOENT')return false;throw e;}}
export async function until<T>(read:()=>T|undefined|Promise<T|undefined>,timeout=5000){
 const end=Date.now()+timeout;while(Date.now()<end){const value=await read();if(value!==undefined)return value;await new Promise(r=>setTimeout(r,10));}throw Error('bounded fixture condition not reached');
}
export function carrier(ctx:Context,cwd:string,id='fixture'){
 const sid=SessionId(id),session=Session.create(sid,undefined,{version:SESSION_FORMAT_VERSION,id:sid,createdAt:0,isSeeded:false,cwd});
 session.append('turn/start',{turn:1});return {id:sid,session,ctx,options:{provider:'fixture',model:'text'},inject(){throw Error('unexpected directory transition');}} as any;
}
export const block=(name:string,args:any,id=name)=>({type:'tool-call' as const,id:ToolCallId(id),name,arguments:JSON.stringify(args)});
export async function invoke(ctx:Context,name:string,args:any,agent?:any,signal=new AbortController().signal,toolSet?:any){
 const batch=await ctx.tools.execute({calls:[block(name,args)],agent,signal,toolSet});return batch.results[0].result;
}
export async function base(){
 const ctx=new Context();for(const p of [SessionStore,SessionProjectionRegistry,SystemPrompt,LlmRuntime,ToolsService])await ctx.plugin(p as any);
 ctx.tools.setExecutor(new NativeToolExecutor(ctx));return {ctx,close:()=>ctx.fiber.dispose()};
}
export async function files(ctx:Context){
 const root=await mkdtemp(resolve(tmpdir(),'aifoundry-h16-')),file=resolve(root,'fixture.txt'),retained:string[]=[];let stage:string|undefined;
 const inside=(p:string)=>{const r=relative(root,resolve(p));assert.ok(r!==''&&!r.startsWith('..')&&!isAbsolute(r));};
 await ctx.plugin(SandboxPolicy,{mode:'workspace-write',workspaceRoot:root});await ctx.plugin(SandboxedFs,{cwd:root});
 (ctx.fs as SandboxedFs).internals={
  inspectTemp({tempPath,stagingDir}){inside(tempPath);assert.equal(basename(tempPath),'fixture.txt.tmp');assert.equal(dirname(tempPath),stagingDir);stage=tempPath;},
  async removeStagingDir(dir){inside(dir);assert.ok(stage&&dirname(stage)===dir);if(await exists(stage))await unlink(stage);retained.push(dir);stage=undefined;},
 };
 await ctx.plugin(WorkingDirectory,{defaultDirectory:root});
 return {root,file,retained,async cleanup(){inside(file);if(await exists(file))await unlink(file);}};
}
```
<!-- code:support.ts:end -->
:::

## 实践 A：真实File工具读取、编辑、再读

先预测四项：未装附件时是否有read_image；另一Session未观察文件能否edit；卸载观察插件后同一操作怎样变化；单行上限8时提示是否也算在8字符内。

输入仅为新目录fixture.txt。write创建四行；read读取2～3行；edit重复词应拒绝歧义，修改title成功；read验证并观察长行。再检查预先取消、观察策略缺失、附件存在条件与工具开关。验收同时看trace中的value、content、isError及error.info，而不是只找成功文字。

:::deepdive{title="实践 A 完整程序"}
保存为file.ts。Mock附件只用于注册和执行前拒绝；不读取图片，也不声称存储实现已经验证。
<!-- code:file.ts:start -->
```typescript
import * as ToolFs from '@deepseek-ai/dsh-tool-fs';
import * as Observation from '@deepseek-ai/dsh-fs-observation-policy';
import {base,files,carrier,invoke,exists} from './support.ts';
export async function filePractice(){
 const h=await base(),f=await files(h.ctx),agent=carrier(h.ctx,f.root,'file');const result:any={root:f.root,trace:[]};
 const call=async(label:string,name:string,args:any,signal?:AbortSignal)=>{const r=await invoke(h.ctx,name,args,agent,signal);result.trace.push({label,result:r});return r;};
 try{
  let plugin=await h.ctx.plugin(ToolFs,{readLimit:2,readMaxLineLength:8,readMaxBytes:50,readStreamMinSize:1});
  const observation=await h.ctx.plugin(Observation);result.schemas=h.ctx.tools.schemas();
  await call('create','write',{file_path:'fixture.txt',content:'title=old\nrepeat\nrepeat\nlast-line-is-long\n'});
  await call('window','read',{file_path:'fixture.txt',offset:2,limit:2});
  await call('ambiguous','edit',{file_path:'fixture.txt',old_string:'repeat',new_string:'once'});
  await call('edit','edit',{file_path:'fixture.txt',old_string:'title=old',new_string:'title=new'});
  await call('verify','read',{file_path:'fixture.txt',offset:1,limit:1});
  await call('length-cap','read',{file_path:'fixture.txt',offset:4,limit:1});
  const other=carrier(h.ctx,f.root,'unseen');result.unseen=await invoke(h.ctx,'edit',{file_path:'fixture.txt',old_string:'new',new_string:'bad'},other);
  await call('cancel','read',{file_path:'fixture.txt'},AbortSignal.abort());
  await observation.dispose();result.withoutObservation=await invoke(h.ctx,'edit',{file_path:'fixture.txt',old_string:'new',new_string:'bare'},other);
  result.readImageWithoutAttachments=h.ctx.tools.get('read_image')!==undefined;
  // 只测试可选服务导致的注册与执行前路由拒绝，不伪造图片解码/持久存储。
  const attachment=await h.ctx.plugin({apply(owner){owner.provide('attachments',{imageLimits:{mediaTypes:['image/png']}} as any);}});
  result.readImageWithMockAttachments=h.ctx.tools.get('read_image')!==undefined;
  result.imageRouteRefusal=await call('image-route','read_image',{file_path:'missing.png'});
  await attachment.dispose();result.readImageAfterDispose=h.ctx.tools.get('read_image')!==undefined;
  await plugin.dispose();plugin=await h.ctx.plugin(ToolFs,{write:false,edit:false,readImage:false});
  result.readOnlySchemas=h.ctx.tools.schemas();await plugin.dispose();result.afterToolDispose=h.ctx.tools.schemas();
  await f.cleanup();result.fileRemoved=!(await exists(f.file));result.retained=f.retained;
  return result;
 }finally{await h.close();await f.cleanup();}
}
```
<!-- code:file.ts:end -->
:::

:::deepdive{title="实践 A 详细参考答案"}
创建返回成功，window给出行号2和3、totalLines=4，说明窗口与全文件行数分开。ambiguous失败且error.info.code为FS_AMBIGUOUS_EDIT；edit修改title后verify看到title=ne及明确的8字符截断提示，不能据截断显示误判实际保存只剩8字符。length-cap同样保留last-lin并追加提示。

另一Session没有观察，edit得到FS_NOT_OBSERVED。取消的read失败；卸载观察插件后同一Session可不带自动版本条件编辑当前内容，但fs-sandbox仍在，不是所有保护一起消失。没有附件服务时read_image不注册，Mock附件服务出现后注册，未知模型路线在文件IO之前拒绝，附件卸载后工具又消失。这没有验证真实图像内容处理。

将write/edit/readImage关闭后只保留read；工具插件卸载后注册为空，明确夹具文件删除，空目录保留。若图片或文件工具缺失，先看依赖和配置，不直接修改模型Prompt要求它强行调用不存在的工具。
:::

## 实践 B：真实Shell消费者，显式替身执行器

先写出没有ctx.shell时的注册状态，再预测退出码7是否必然isError。随后比较无Jobs、有Jobs及取消路径。FixtureShell只接受Get-Location，返回标记为fixture-only的固定内容，不执行任何PowerShell、Bash或外网程序。

验收：执行器未提供时pwsh不出现；正常结果exitCode=0；非零脚本结果exitCode=7但isError=false；无Jobs时后台请求失败且Schema无该字段；取消后工具结果失败；有真实Jobs/控制器时得到jobId并能用job_output读取夹具输出。

:::deepdive{title="实践 B 完整程序"}
保存为shell.ts。替身实现只是可控进程句柄，不等于官方执行器；实际受测对象是消费者、环境、工作目录、Jobs与统一执行接线。
<!-- code:shell.ts:start -->
```typescript
import {ShellExecutor} from '@deepseek-ai/dsh-shell';
import * as ToolPwsh from '@deepseek-ai/dsh-tool-pwsh';
import * as ShellEnv from '@deepseek-ai/dsh-shell-env';
import LocalJobs from '@deepseek-ai/dsh-jobs-local';
import * as ToolJobs from '@deepseek-ai/dsh-tool-jobs';
import AgentRegistry from '@deepseek-ai/dsh-agent';
import {base,files,carrier,invoke,gate,until} from './support.ts';
// 教学替身位于执行器边界；命令不会交给OS执行。
export class FixtureShell extends ShellExecutor {
 requests:any[]=[];specs:any[]=[];entered=gate();mode='ok';
 resolve(request:any){this.requests.push(request);return {command:request.command,workdir:request.workdir??process.cwd(),timeoutMs:request.timeoutMs??1000,onExpiry:request.onExpiry??'kill',stdoutMaxBytes:64000,...request};}
 async execute(spec:any){
  if(spec.command!=='Get-Location')throw Error('fixture command is not allowlisted');
  this.specs.push({...spec,signal:spec.signal?{aborted:spec.signal.aborted}:undefined});this.entered.resolve();
  const output='fixture-only: project-check\n',done=gate();let status:any='completed',aborted=false;
  if(this.mode==='wait'){status='running';spec.signal?.addEventListener('abort',()=>{aborted=true;status='killed';done.resolve();},{once:true});}else done.resolve();
  const proc:any={get status(){return status;},exitCode:this.mode==='nonzero'?7:0,signal:null,done:done.promise,
   readOutput:()=>({delta:output,lossy:false}),kill(){status='killed';done.resolve();return true;},
   observed:{stdout:{readFrom:(n:number)=>({text:output.slice(n),nextOffset:output.length,lossy:false})},stderr:{readFrom:(n:number)=>({text:'',nextOffset:n,lossy:false})}},
   result:async()=>{await done.promise;return {exitCode:proc.exitCode,signal:null,timedOut:false,aborted,timeoutMs:spec.timeoutMs,stdout:{text:output,truncated:false},stderr:{text:'',truncated:false}};}};
  return proc;
 }
}
export async function mountShell(ctx:any){await ctx.plugin(ShellEnv);await ctx.plugin(FixtureShell);return ctx.plugin(ToolPwsh);}
export async function shellPractice(){
 const h=await base(),f=await files(h.ctx),agent=carrier(h.ctx,f.root,'shell');
 try{
  await h.ctx.plugin(ShellEnv);const tool=await h.ctx.plugin(ToolPwsh);const missing=h.ctx.tools.get('pwsh')===undefined;
  await h.ctx.plugin(FixtureShell);const shell=h.ctx.shell as FixtureShell;
  const schemas=h.ctx.tools.schemas(),normal=await invoke(h.ctx,'pwsh',{description:'夹具只读检查；不会执行OS命令',command:'Get-Location'},agent);
  shell.mode='nonzero';const nonzero=await invoke(h.ctx,'pwsh',{description:'夹具非零退出',command:'Get-Location'},agent);
  const withoutJobs=await invoke(h.ctx,'pwsh',{description:'无Jobs请求后台',command:'Get-Location',run_in_background:true},agent);
  shell.mode='wait';shell.entered=gate();const controller=new AbortController();
  const pending=invoke(h.ctx,'pwsh',{description:'取消夹具执行',command:'Get-Location'},agent,controller.signal);await shell.entered.promise;controller.abort();const cancelled=await pending;
  shell.mode='ok';await h.ctx.plugin(AgentRegistry);const jobs=await h.ctx.plugin(LocalJobs,{pumpPollMs:10});await h.ctx.plugin(ToolJobs);
  const withJobsSchemas=h.ctx.tools.schemas();
  const background=await invoke(h.ctx,'pwsh',{description:'夹具后台检查',command:'Get-Location',run_in_background:true});
  const id=(background as any).value?.jobId;if(!id)throw Error('fixture background job not registered');
  await until(()=>h.ctx.jobs.get(id).status==='completed'?true:undefined);
  const jobOutput=await invoke(h.ctx,'job_output',{job_id:id});await jobs.dispose();
  const afterJobsSchemas=h.ctx.tools.schemas();await tool.dispose();
  return {missingExecutor:missing,schemas,normal,nonzero,withoutJobs,cancelled,withJobsSchemas,background,jobOutput,afterJobsSchemas,afterToolDispose:h.ctx.tools.get('pwsh')!==undefined,requests:shell.requests,specs:shell.specs,
   boundary:'Real tool-pwsh/shell-env/Tools/Pipeline/working-directory/Jobs; FixtureShell replaces OS process execution, no native PowerShell or Bash run'};
 }finally{await h.close();await f.cleanup();}
}
```
<!-- code:shell.ts:end -->
:::

:::deepdive{title="实践 B 详细参考答案"}
tool-pwsh先因依赖缺失而没有注册，FixtureShell成为ctx.shell后才出现。真实消费者收集会话workdir与dshEnv，传给执行器。normal与nonzero都取得描述性前台结果，后者保留退出码7；这表明统一isError不是Shell所有业务状态的替代指标。

无Jobs时不能因为多传run_in_background就获得后台能力；有Jobs后工具版本加入该参数，后台调用返回jobId，真实Jobs和tool-jobs读取替身observed输出。取消案例由替身观察signal并结算aborted，再由真实工具映射为失败；它不证明OS已杀掉一个真实PowerShell树。

Jobs卸载后消费者回到前台版本，工具本身卸载后pwsh消失。接收到正确dshEnv仅证明消费者交付了可信快照，不证明真实进程父环境清理、超时强杀、spill或原生沙箱已测试。报告须同时写“真实组件”和“Mock Executor”，不能只保留其中一半。
:::

## 实践 C：提供方选择、步骤准入和离线正文

先预测none、ambiguous与not-ready三种输入下，Registry、当前ResolvedToolSet及执行结果分别是什么。再运行八个场景，查看C_*。

真实WebRuntime与tool-web组合，提供方只返回内存Fixture。Search返回四个来源，配置最多两项、摘要12字符；Fetch返回404的HTML，配置完整输出最多500字符。cancel用门闩保证提供方进入后才abort。纯HTTP URL校验接受loopback但不发送请求。

:::deepdive{title="实践 C 完整程序"}
保存为web.ts。这里的URL仅作数据标识，Provider不调用fetch、DNS或真实网络。
<!-- code:web.ts:start -->
```typescript
import WebRuntime from '@deepseek-ai/dsh-web';
import * as ToolWeb from '@deepseek-ai/dsh-tool-web';
import {validateFetchUrl} from '@deepseek-ai/dsh-web-fetch-http/src/policy.ts';
import {base,carrier,invoke,gate} from './support.ts';
export const webCases=['unique','explicit','none','ambiguous','configured-missing','configured-unavailable','not-ready','cancel'] as const;
export function webProviders(){
 const trace:any[]=[],entered=gate();let ready=true,wait=false;
 const search=(id:string)=>({id,available:()=>true,ready:async(route:any)=>{trace.push({stage:'searchReady',route});return ready;},
  async search(req:any,signal?:AbortSignal){trace.push({stage:'search',id,req});if(signal?.aborted)throw Error('fixture aborted');
   return {content:'offline fixture answer',sources:[1,2,3,4].map(n=>({url:`https://fixture.invalid/${n}`,title:`Doc ${n}`,summary:'long-summary-'.repeat(10)})),truncated:false};}});
 const fetch=(id:string)=>({id,available:()=>true,ready:async()=>ready,
  async fetch(req:any,signal?:AbortSignal){trace.push({stage:'fetch',id,req});entered.resolve();
   if(wait)await new Promise<void>((_r,reject)=>{if(signal?.aborted)reject(Error('fixture fetch aborted'));else signal?.addEventListener('abort',()=>reject(Error('fixture fetch aborted')),{once:true});});
   return {url:req.url,statusCode:404,body:{kind:'html' as const,content:'<h1>Fixture documentation</h1><script>hidden-bad</script><p>'+('Data only. '.repeat(150))+'</p>'},truncated:false};}});
 return {trace,search,fetch,entered,setReady(v:boolean){ready=v;},setWait(v:boolean){wait=v;}};
}
export async function mountWeb(ctx:any){const p=webProviders();await ctx.plugin(WebRuntime);ctx.web.registerSearchProvider(p.search('offline-search'));ctx.web.registerFetchProvider(p.fetch('offline-fetch'));await ctx.plugin(ToolWeb,{searchMaxResults:2,searchSummaryMaxChars:12,fetchMaxOutputChars:500});return p;}
export async function webPractice(kind:typeof webCases[number]='unique'){
 const h=await base(),p=webProviders(),agent=carrier(h.ctx,process.cwd(),'web');
 try{
  await h.ctx.plugin(WebRuntime,kind==='explicit'?{searchProvider:'second',fetchProvider:'fetch'}:kind==='configured-missing'?{searchProvider:'missing'}:kind==='configured-unavailable'?{searchProvider:'offline'}:{});
  if(kind!=='none'&&kind!=='configured-missing')h.ctx.web.registerSearchProvider(kind==='configured-unavailable'?{...p.search('offline'),available:()=>false}:p.search('first'));
  if(['explicit','ambiguous'].includes(kind))h.ctx.web.registerSearchProvider(p.search('second'));
  h.ctx.web.registerFetchProvider(p.fetch('fetch'));if(kind==='not-ready')p.setReady(false);
  const plugin=await h.ctx.plugin(ToolWeb,{searchMaxResults:2,searchSummaryMaxChars:12,fetchMaxOutputChars:500});
  const schemas=h.ctx.tools.schemas(),signal=new AbortController();
  const set=await h.ctx.tools.resolve({agent,modelSelection:{provider:'fixture',model:'text'},signal:signal.signal});
  const admitted=h.ctx.tools.schemas(agent,set);
  const search=await invoke(h.ctx,'web_search',{queries:['fixture docs']},agent,signal.signal,set);
  let fetch:any;
  if(kind==='cancel'){
   p.setWait(true);const pending=invoke(h.ctx,'web_fetch',{url:'https://fixture.invalid/docs'},agent,signal.signal,set);await p.entered.promise;signal.abort();fetch=await pending;
  }else fetch=await invoke(h.ctx,'web_fetch',{url:'https://fixture.invalid/docs'},agent,signal.signal,set);
  set.dispose();await plugin.dispose();
  const offlineUrlPolicy={loopbackAccepted:validateFetchUrl('http://127.0.0.1/').hostname==='127.0.0.1',networkRequests:0};
  return {kind,schemas,admitted,search,fetch,trace:p.trace,afterDispose:h.ctx.tools.schemas(),offlineUrlPolicy,
   boundary:'Real WebRuntime/tool-web/Tools/activation; memory providers only, no HTTP fetch, search API, DNS or network request'};
 }finally{await h.close();}
}
```
<!-- code:web.ts:end -->
:::

:::deepdive{title="实践 C 详细参考答案"}
unique自动选first；explicit选second，不能按先注册first就猜结果。none、ambiguous、configured-missing、configured-unavailable的工具注册都保留，ready在选择失败时返回true，所以当前Step也能声明工具，调用再得到对应error.info.code。not-ready不同：所选Provider明确返回false，Registry仍有两工具，但ResolvedToolSet为空，Provider search根本没运行。

成功Search只保留两个sources且truncated=true，每项summary受12字符限制。Fetch的404不自动变工具异常；正文被转成模型文本，hidden-bad脚本内容不出现，外部不可信提示保留，完整文本不超过500字符，meta.truncated与显示一致。cancel进入Provider后收到abort，最终工具失败。

这个实验不能证明真实HTTP网络目标防护或厂商API兼容性。loopbackAccepted只证明纯URL层不拒绝该地址；networkRequests为0。上限、选择错误和外部标注来自真实组件；页面和来源都是受控替身。
:::

## 实践 D：两个本地MCP Server与真实stdio通信

先预测alpha/beta同名metadata是否冲突；断线时Schema是否立刻消失；资源URI是否直接把正文写进Prompt。再观察两轮D_*，一轮关闭重连，另一轮只验证一次重连成功。

同一受信任夹具程序各启动一份Server，SDK协商、发现、调用、工具变更订阅与资源读取真实发生，未替换传输。程序只返回虚构元数据、计数和PID，不读取私人文件、不联网、不执行Shell。重复列表用于测试发现阶段失败保留；不是生产MCP部署教程。

:::deepdive{title="本地 MCP Server 完整程序"}
保存为mcp-server.mjs。stdout只承载MCP协议；write是无文件副作用的计数工具，供本地允许集合实验使用。
<!-- code:mcp-server.mjs:start -->
```javascript
// 可信本地夹具。stdout仅供MCP协议；不读文件，不发网络请求，不执行Shell。
import {McpServer} from '@modelcontextprotocol/server';
import {serveStdio} from '@modelcontextprotocol/server/stdio';
import {z} from 'zod';
const label=process.argv[2]??'local';
serveStdio(()=>{
 const server=new McpServer({name:'h16-'+label,version:'1'});
 let writes=0;
 const response=name=>({content:[{type:'text',text:JSON.stringify({server:label,rawTool:name,pid:process.pid,writes})}]});
 server.registerTool('metadata',{inputSchema:z.object({})},async()=>response('metadata'));
 // 只计数的教学假write，不进行任何文件写入，用于本地Scope拒绝实验。
 server.registerTool('write',{inputSchema:z.object({})},async()=>{writes++;return response('write');});
 server.registerTool('control',{inputSchema:z.object({action:z.enum(['add','duplicate-list','disconnect','error'])})},async({action})=>{
  if(action==='add')server.registerTool('extra',{inputSchema:z.object({})},async()=>response('extra'));
  if(action==='duplicate-list'){
   server.server.setRequestHandler('tools/list',async()=>({tools:[{name:'metadata',inputSchema:{type:'object'}},{name:'metadata',inputSchema:{type:'object'}}]}));
   server.server.sendToolListChanged();
  }
  if(action==='disconnect')setTimeout(()=>process.exit(0),30);
  if(action==='error')return {isError:true,content:[{type:'text',text:'controlled remote tool failure'}]};
  return response('control:'+action);
 });
 server.registerResource('project','fixture://project',{},async()=>({contents:[{uri:'fixture://project',text:'local structured project metadata'}]}));
 return server;
});
```
<!-- code:mcp-server.mjs:end -->
:::

:::deepdive{title="实践 D 完整程序"}
保存为mcp.ts。实际MCP Client插件创建SDK stdio传输和子进程；本课没有Mock Transport。额外scope-only资源提供方是显式内存替身，用于单独检查资源分派Scope。
<!-- code:mcp.ts:start -->
```typescript
import * as McpClient from '@deepseek-ai/dsh-mcp-client';
import McpResources from '@deepseek-ai/dsh-mcp-resources';
import {publicToolName} from '@deepseek-ai/dsh-mcp-client/src/tools.ts';
import {createScope} from '@deepseek-ai/dsh-scope';
import {fileURLToPath} from 'node:url';
import {base,invoke,until,carrier} from './support.ts';
export async function mountMcp(ctx:any,name='alpha',reconnect=false){
 const env=Object.fromEntries(['HARNESS_SOURCE_CACHE','H16_DEPS_ANCHOR','H16_FS_DEPS_ANCHOR','H16_ECO_DEPS_ANCHOR'].map(k=>[k,process.env[k]!]));
 return ctx.plugin(McpClient,{transport:'stdio',serverName:name,command:process.execPath,
  args:['--import',new URL('./bootstrap.mjs',import.meta.url).href,fileURLToPath(new URL('./mcp-server.mjs',import.meta.url)),name],
  env,cwd:process.cwd(),toolCallTimeoutMs:3000,failOnStartupError:true,
  reconnect:{enabled:reconnect,initialDelayMs:50,maxDelayMs:200,maxAttempts:2}});
}
export async function mcpPractice(reconnect=false){
 const h=await base(),events:any[]=[];h.ctx.on('tools/change',()=>events.push({stage:'tools/change',names:h.ctx.tools.schemas().map(t=>t.name)}));
 const errors:string[]=[];h.ctx.logger.error=(s:any)=>{errors.push(String(s));};
 try{
  await h.ctx.plugin(McpResources);const alpha=await mountMcp(h.ctx,'alpha',reconnect),beta=await mountMcp(h.ctx,'beta');
  const initial=h.ctx.tools.schemas(),a=await invoke(h.ctx,'mcp__alpha__metadata',{}),b=await invoke(h.ctx,'mcp__beta__metadata',{});
  const resourceList=await invoke(h.ctx,'list_mcp_resources',{server:'alpha'}),resource=await invoke(h.ctx,'read_mcp_resource',{server:'alpha',uri:'fixture://project'});
  const remoteError=await invoke(h.ctx,'mcp__alpha__control',{action:'error'});
  await invoke(h.ctx,'mcp__alpha__control',{action:'add'});await until(()=>h.ctx.tools.get('mcp__alpha__extra')?true:undefined);const refreshed=h.ctx.tools.schemas();
  await invoke(h.ctx,'mcp__alpha__control',{action:'duplicate-list'});await until(()=>errors.some(s=>s.includes('re-sync failed'))?true:undefined);
  const afterFailedRefresh=h.ctx.tools.schemas();
  const cursor=events.length;await invoke(h.ctx,'mcp__alpha__control',{action:'disconnect'});
  let afterDisconnect:any,afterReconnect:any;
  if(reconnect){await until(()=>events.slice(cursor).some(e=>e.names.includes('mcp__alpha__metadata')&&!e.names.includes('mcp__alpha__extra'))?true:undefined);afterReconnect=await invoke(h.ctx,'mcp__alpha__metadata',{});}
  else{await until(()=>errors.some(s=>s.includes('connection lost'))?true:undefined);afterDisconnect={schemas:h.ctx.tools.schemas(),call:await invoke(h.ctx,'mcp__alpha__metadata',{}),resource:await invoke(h.ctx,'list_mcp_resources',{server:'alpha'})};}
  const scopeAgent=carrier(h.ctx,process.cwd(),'resource-scope');let local:any;
  const scoped=await h.ctx.plugin({inject:['mcpResources'],apply(owner){local=createScope(owner,scopeAgent);local.ctx.mcpResources.register('scope-only',{async request(){return {resources:[]};}});}});
  const hiddenResource=await invoke(h.ctx,'list_mcp_resources',{server:'scope-only'});
  const visibleResource=await invoke(h.ctx,'list_mcp_resources',{server:'scope-only'},scopeAgent);await scoped.dispose();
  await alpha.dispose();const afterAlpha=h.ctx.tools.schemas();await beta.dispose();const afterDispose=h.ctx.tools.schemas();
  return {transport:'ACTUAL_STDIO_CHILD_PROCESSES',sdk:'client/server 2.2.0; actual negotiation/discovery/calls/resources',reconnect,initial,a,b,resourceList,resource,remoteError,refreshed,afterFailedRefresh,afterDisconnect,afterReconnect,hiddenResource,visibleResource,afterAlpha,afterDispose,events,errors,
   normalized:[publicToolName('alpha','name.with.dot'),publicToolName('alpha','name/with/dot')],
   limits:'Trusted local fixture Server; no external endpoint, Streamable HTTP, credentials or full outage/backoff race matrix'};
 }finally{await h.close();}
}
```
<!-- code:mcp.ts:end -->
:::

:::deepdive{title="实践 D 详细参考答案"}
alpha与beta的公开metadata名称不同，但返回的rawTool都是metadata，且server字段不同，证明公开名和线上原名分离。list_mcp_resources找到fixture://project，read_mcp_resource按需返回文本；remoteError为工具失败，不把服务器isError当正常成功值。

新增extra通过真实SDK列表变更传播到Registry；后续重复metadata列表被拒绝，旧extra仍保留。这是发现/构建阶段失败，不能拿它证明注册冲突也保留旧工具。关闭重连的Server断开后，metadata仍可见，但调用失败；资源共享工具也还在，资源请求失败。开启重连的那轮重新发现成功，metadata返回不同PID，证明启动了新本地Server；没有验证全部退避与竞态分支。

scope-only资源对其他调用者不可见，对所属Agent可调用；这项提供方是内存替身，不能冒充第三个实际SDK连接。卸载alpha只撤其工具，beta仍存在；两个客户端都卸载后共享资源工具也归零。实际stdio通信与可信Server的业务假数据必须同时标注；Streamable HTTP、外部认证与真实服务未测试。
:::

## 综合 X：只给项目说明所需的五项能力

把前四项接起来：File读取新夹具；Shell读取检查替身；WebSearch和Fetch取得离线资料；MCP取得本地Server元数据；真实AgentLoop把工具结果送入下一模型请求，脚本Adapter根据实际工具历史生成说明。

![真实AgentLoop只允许五个指定工具，依次得到File、Shell替身、Web离线资料与MCP本地stdio结果，再提交Session并形成下一请求；额外远端write仍被Scope拒绝](/course-media/harness-v2/h16/h16-04.png "图 4｜本例并行上限为1，箭头只是受控顺序。第二Session核对每个请求前缀；模型与Shell/Web为替身，MCP和文件本地原语实际运行，不是完整E应用。")

组合的必需接线可按下面查：公共Session/Projection/SystemPrompt/Llm/Tools/Native；SandboxPolicy与fs-sandbox、workingDirectory、tool-fs；shell-env、FixtureShell、tool-pwsh；WebRuntime、离线Search/Fetch、tool-web；每服务器MCP Client。AgentRegistry与AgentLoop最后创建具有Scope允许集合的Agent。综合配置关闭File写/编辑/图片，只允许read、pwsh、web_search、web_fetch、mcp__alpha__metadata。

第二条综合轨迹故意让脚本模型提出mcp__alpha__write。Server确实声明了它，模型当前工具集没有它；本地返回失败，再次metadata证明服务器writes仍为0。这不是危险写入试验，只检验远端发现不能自行扩大本地能力。Scope也仍不是OS权限隔离，Server进程本身必须是可信或另受约束。

:::deepdive{title="综合实践完整程序"}
保存为combined.ts。每次同时捕获Loop边界与Adapter实际输入，并用第二个真实Session从对应事件前缀重建messages、header、tools与toolHistory；不会用最终整段日志替代每次请求当时的证据。
<!-- code:combined.ts:start -->
```typescript
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import AgentRegistry from '@deepseek-ai/dsh-agent';
import AgentLoop from '@deepseek-ai/dsh-agent-loop';
import {LlmAdapter,createUserMessage} from '@deepseek-ai/dsh-llm';
import SessionStore from '@deepseek-ai/dsh-session';
import * as ToolFs from '@deepseek-ai/dsh-tool-fs';
import * as Observation from '@deepseek-ai/dsh-fs-observation-policy';
import {base,files,Context,SessionId,block} from './support.ts';
import {mountShell,FixtureShell} from './shell.ts';
import {mountWeb} from './web.ts';
import {mountMcp} from './mcp.ts';
const calls=[block('read',{file_path:'fixture.txt'}),block('pwsh',{description:'离线夹具检查',command:'Get-Location'}),block('web_search',{queries:['fixture official docs']}),block('web_fetch',{url:'https://fixture.invalid/docs'}),block('mcp__alpha__metadata',{})];
const chunks=(items:any[])=>[...items.flatMap((block,index)=>[{type:'block-start',index,blockType:'tool-call'},{type:'block-end',index,block}]),{type:'finish',reason:{kind:'tool-calls'}}];
const clean=(v:any)=>structuredClone({...v,signal:undefined});
class FixtureAdapter extends LlmAdapter {
 requests:any[]=[];
 constructor(readonly blocked:boolean){super();}
 async resolveModel(provider:string,model:string){return {provider,id:model,name:model,defaultMaxTokens:128,context:{contextWindow:12000},inputModalities:['text']};}
 async *stream(options:any){
  this.requests.push(clean(options));const n=this.requests.length;
  if(n===1){yield* chunks(calls) as any;return;}
  if(this.blocked&&n===2){yield* chunks([block('mcp__alpha__write',{},'blocked-write'),block('mcp__alpha__metadata',{},'check-counter')]) as any;return;}
  const results=options.messages.filter((m:any)=>m.role==='tool');
  const text=`夹具项目说明：收到${results.length}条工具历史；File文本、Shell替身、Web离线资料和本地MCP元数据均已接入。外部内容只作资料。`;
  yield* [{type:'block-start',index:0,blockType:'text'},{type:'block-end',index:0,block:{type:'text',text}},{type:'finish',reason:{kind:'stop'}}] as any;
 }
}
export async function combinedPractice(blocked=false){
 const h=await base(),f=await files(h.ctx),replay=new Context(),adapter=new FixtureAdapter(blocked),prefixes:any[]=[],loopRequests:any[]=[],observed:any[]=[],errors:any[]=[];let handle:any;
 try{
  await writeFile(f.file,'name=fixture-project\ntest=controlled-check\n');
  await h.ctx.plugin(Observation);await h.ctx.plugin(ToolFs,{write:false,edit:false,readImage:false});
  await mountShell(h.ctx);const web=await mountWeb(h.ctx);await mountMcp(h.ctx);
  await h.ctx.plugin(AgentRegistry);await h.ctx.plugin(AgentLoop,{agents:[],maxParallelToolCalls:1});
  h.ctx.llm.registerAdapter(['fixture'],adapter);await replay.plugin(SessionStore);
  const allow=calls.map(c=>c.name);
  handle=await h.ctx.agents.create({sessionId:SessionId('combined-'+blocked),meta:{cwd:f.root},agentOptions:{provider:'fixture',model:'text'},setup(ctx){ctx.tools.restrict({allow});}});
  const agent=handle.agent;
  h.ctx.on('agent/error',e=>errors.push(String(e.error)));
  h.ctx.on('tools/result',(exec,result)=>observed.push({callId:exec.callId,name:exec.name,result:structuredClone(result)}));
  h.ctx.on('llm/stream',async function*(options,next){
   const events=agent.session.snapshotEvents(),rebuilt=replay.sessions.prepare(SessionId('replay-'+prefixes.length),{seed:events}),header=rebuilt.requestHeader()!;
   assert.deepEqual(rebuilt.deriveMessages(),options.messages);for(const [k,v] of Object.entries(header.config))assert.deepEqual(options[k],v);
   assert.deepEqual(header.tools??[],options.tools??[]);assert.deepEqual(rebuilt.toolHistory(),options.toolHistory);
   prefixes.push({events,throughSeq:events.at(-1)?.seq,reconstruction:'PASS messages/config/tools/toolHistory from second actual Session'});loopRequests.push(clean(options));yield* next();
  });
  agent.followup(createUserMessage({source:{kind:'user'},content:[{type:'text',text:'为隔离Fixture整理项目说明；只使用五项批准的只读能力。'}]}));await agent.whenIdle();
  return {blocked,fixture:f.root,allow,registered:h.ctx.tools.schemas().map(t=>t.name),requests:adapter.requests,loopRequests,prefixes,observed,facts:agent.session.snapshotEvents(),errors,webTrace:web.trace,
   shellRequests:(h.ctx.shell as FixtureShell).requests,
   boundary:'Actual AgentLoop + registry/scope + Native/Pipeline + tool-fs/local FS + workingDirectory + tool-pwsh/FixtureShell + tool-web/memory providers + MCP SDK over real stdio; model is scripted, not a real LLM or complete E app'};
 }finally{if(handle)await handle.dispose();await replay.fiber.dispose();await h.close();await f.cleanup();}
}
```
<!-- code:combined.ts:end -->
:::

:::deepdive{title="综合实践详细参考答案"}
正常轨迹有两次模型请求：第一次看到恰好五项Schema，发出五次调用；File返回实际夹具文本，Shell标记为fixture-only，Web返回有外部提示的离线内容，MCP返回真实本地通信取得的虚构元数据。五条tool/call与五条tool/result进入Session，下一请求含五条工具历史，Adapter才生成说明。它没有评价真实模型分析是否正确。

限制轨迹多一个Step：脚本提出未准入的远端write以及允许的metadata。本地结果对write标isError，Server的writes仍为0；第二次metadata也进入历史，然后第三请求生成说明。远端多声明一个工具，不会改变本地Scope允许集合。实际根Registry里存在这个工具与当前Agent不声明它并不矛盾。

每次Loop输入都由独立Session从当时事件前缀重建核对；Adapter输入另存。角色和结果一致，不代表四家族权限相同。结束时Agent、客户端、服务和文件夹具按所有权释放；无真实模型、原生Shell、互联网或完整Host应用，因此分级为D。中途失败应先定位相应组件，不为了继续让允许集合失效。
:::

:::deepdive{title="统一运行入口"}
保存为demo.ts。完整断言另见ecosystem.test.ts；X是综合实践标签，不是E级证据。
<!-- code:demo.ts:start -->
```typescript
import {filePractice} from './file.ts';
import {shellPractice} from './shell.ts';
import {webPractice,webCases} from './web.ts';
import {mcpPractice} from './mcp.ts';
import {combinedPractice} from './combined.ts';
console.log('A_file',JSON.stringify(await filePractice()));
console.log('B_shell',JSON.stringify(await shellPractice()));
for(const kind of webCases)console.log('C_'+kind,JSON.stringify(await webPractice(kind)));
console.log('D_mcp',JSON.stringify(await mcpPractice()));
console.log('D_reconnect',JSON.stringify(await mcpPractice(true)));
console.log('X_combined',JSON.stringify(await combinedPractice()));
console.log('X_restricted',JSON.stringify(await combinedPractice(true)));
```
<!-- code:demo.ts:end -->
:::

## 故障定位：从声明走到后端，不凭一句“工具不可用”跳结论

按顺序保存证据：插件是否挂载/等待依赖 → 必需服务是否就绪 → Registry实际定义 → 当前Agent的Scope → 当前Step的ResolvedToolSet与请求Schema → 调用是否进入执行器 → 参数、策略、后端、结果处理分别在哪里失败 → 连接或进程是否仍在 → 应重新配置、连接还是明确停止。禁用与故障也要分开。

| 具体故障 | 可复核机制 | 合理处理 |
| --- | --- | --- |
| File edit拒绝FS_AMBIGUOUS_EDIT | 真实字面匹配找到多处，路径和观察未必有错 | 重读相关上下文，使用更明确old_string；不能盲选第一处 |
| pwsh完全不出现 | 必需ctx.shell未提供时插件等待 | 查服务组合与Fiber状态；不靠Prompt创造执行器 |
| web_search有Schema却WEB_PROVIDER_AMBIGUOUS | 注册与Step准入可成立，执行时未配置唯一提供方 | 明确选择ID或减少可用提供方；不是重写工具参数Schema |
| Web工具从当前Step缺席 | 所选Provider ready=false | 查当前路线及认证配置，下一Step重新解析；不称插件已卸载 |
| MCP metadata仍在但调用失败 | 连接丢失，配置关闭重连而保留最后工具 | 报告断线，按配置恢复；不伪称工具被删除 |
| Resource报当前Scope不可用 | shared工具存在，但指定server不属于调用者可见层 | 检查服务器注册Scope与调用Agent；不能猜URI跨越Scope |

重新连接不是所有错误的恢复办法，非零Shell状态也不是重启框架的理由。H20与H27再研究更完整的重试、未知结果与连接代际。

## 十道思考题：先推导，再看答案

**思考1｜配置。** tool-web启用search，没有任何Search Provider。Registry、ready与实际调用分别怎样？

:::deepdive{title="思考 1 参考答案"}
Registry仍注册web_search。searchReady在选择失败时返回true，所以当前Step可声明它；实际search调用抛WEB_PROVIDER_UNAVAILABLE，由统一结果保留机器错误信息。这与所选Provider明确ready=false不同，后者影响步骤准入。诊断必须记录三个状态，不把一个“不可用”词覆盖注册、认证与实际选择。修复应挂载或正确选择提供方，不是强令模型调用隐藏函数。
:::

**思考2｜代码。** 附件服务刚挂载，模型只声明text输入。能否据read_image已注册断言成功读图？

:::deepdive{title="思考 2 参考答案"}
不能。附件服务影响注册是否出现，当前固定实现对模型图片路线的检查在execute内部、文件IO之前。text-only或能力未知的模型会被拒绝；这不是read_image的when步骤条件。即使路线通过，真实字节格式、附件媒体类型限制与存储解码仍可能失败。本课只测注册和拒绝，不能据Mock附件的存在宣称真实图片处理已经实现或验证。
:::

**思考3｜轨迹。** alpha与beta都声明metadata；alpha额外声明write。本地Agent只允许alpha的metadata。能否借服务器发现把write加入当前调用？

:::deepdive{title="思考 3 参考答案"}
不能。两个metadata按serverName限定公开名，线上仍分别调用原始metadata；write即使在根Registry中存在，也必须满足本地Scope与步骤准入。综合限制轨迹提出write后本地结果失败，Server计数仍0。发现只是能力声明，不是本地授权。但Scope不约束Server进程本身的OS行为，因此本地服务程序仍需信任或独立隔离，不能把Scope当沙箱。
:::

**思考4｜配置。** Search有first和second两个可用提供方，未配置ID；它们都ready。会选最早注册者吗？

:::deepdive{title="思考 4 参考答案"}
不会。无显式ID时恰好一个可用才自动选择，两个可用会得到WEB_PROVIDER_AMBIGUOUS。ready不是用来打破选择歧义的优先级，选择失败时ready反而返回true，让调用报告结构化错误。应在服务配置中明确searchProvider，Fetch还可以单独选择自己的ID；模型web_search参数不必暴露厂商选择，保持能力接口与部署策略分工。
:::

**思考5｜事件。** MCP发现新列表失败，与注册新列表中途冲突，为什么不能用同一句“保留旧工具”解释？

:::deepdive{title="思考 5 参考答案"}
发现/构建阶段尚未动旧注册，失败可以原样保留上一代。进入切换阶段已撤旧工具，若新注册遇冲突，固定实现回滚本服务器已注册的新项，不能留下半套，也不能再声称旧一代必然存在。其他主体占位的工具不算本服务器保留项。实践D只实际测前一阶段重复列表失败，后一阶段依据源码，不把一个PASS外推全部更新分支。
:::

**思考6｜Shell。** 前台结果exitCode=7、isError=false是否矛盾？没有Jobs时多传run_in_background是否可用？

:::deepdive{title="思考 6 参考答案"}
不矛盾，退出码是程序的描述性终态，基础设施异常与工具失败另按消费者映射；应用仍可把业务检查失败视为任务未完成。无Jobs时额外参数不能创造任务注册、输出环或控制器，真实工具会拒绝。即使有Jobs，取消与超时也要结合前台等待、promote和实际执行器判断，不能从有一个jobId推出任务已经成功结束或已经安全隔离。
:::

**思考7｜Web信任。** Fetch已经删除script并转成Markdown，为什么仍不能执行其中“忽略本地规则”的要求？

:::deepdive{title="思考 7 参考答案"}
删除非内容元素是格式转换与输出整理，不是内容授权。正文仍来自外部提供方，可能包含错误、恶意指令或误导引用；不可信提示标出来源，也不是防注入证明。模型和本地策略要把它当任务资料，任何后续工具调用仍经过本地允许集合、策略与执行约束。文本格式更干净不会提高它在系统指令中的优先级，也不改变网络或文件权限。
:::

**思考8｜File与Shell。** 同样修改一个文件，为什么不能用File的先读观察条件推导Shell也受相同条件保护？

:::deepdive{title="思考 8 参考答案"}
文件工具会分发fs意图和观察事件，把版本条件传给遵守expected的后端；Shell命令在子进程内打开文件，并不自动经过这些事件。它需要实际沙箱执行器/provider等独立约束，而裸local执行器不天然受限。即使两者都返回相同文本，执行环境与检查位置不同。对任务选择最窄合适能力，不能把File消费者的保护复制为所有写入渠道的保证。
:::

**思考9｜Resource。** list_mcp_resources得到URI，是否意味着内容已进入SystemPrompt？它与MCP Prompt模板有什么关系？

:::deepdive{title="思考 9 参考答案"}
列表是发现定位信息，正文按read_mcp_resource的server和uri按需读取，再形成工具历史。服务器连接不自动下载所有资源；二进制blob的规范JSON与模型文本呈现也不同。服务器instructions可在可选SystemPrompt组合中形成带归属章节，那是另一条接入路径，不是资源自动灌入。固定版本不提供完整MCP Prompt模板桥接，不能用SDK或协议有此概念就推断Harness已经接好。
:::

**思考10｜验证边界。** 实际本地MCP stdio通过，Web内存Provider通过，能否宣称四家族外部集成与跨平台行为通过？

:::deepdive{title="思考 10 参考答案"}
不能。本轮Windows上实际运行了可信Node进程stdio及真实文件原语；Web是离线提供方，Shell是显式执行器替身，模型是脚本Adapter。Streamable HTTP、真实搜索/抓取API、原生Shell和三平台进程沙箱未运行，完整应用E也未运行。局部D能证明具体接线、消息与拒绝轨迹，不能证明外部服务兼容、网络安全或跨平台强制；清理与取消结论也要限定到实际拥有资源的组件。
:::

## 完成本课，再准备审查而不直接启动审查

用同一套问题自查：每项能力由谁注册；依赖谁；当前Agent看到哪些Schema；实际调用哪个后端；哪些数据不可信；失败属于参数、策略、执行或结果；谁负责取消和退出。能用原始轨迹回答，比记住四个包名更重要。

H13解决定义/可见/准入，H14解决执行与结果，H15解决授权和强制，H16把真实能力家族接起来。第四模块准备包只汇总依赖、组件、证据与潜在问题，不执行集中审查，也不自动改写H13～H15。

H17将转向Session、事实日志与事件溯源。带过去的是本课真实tool/call、tool/result、请求前缀与模型工具历史的区别，不在这里展开持久化重启/快照/fork；H20处理可靠恢复，H25～H30分别扩展插件、模型、MCP、交互环境、观测与工程门禁。

23项C/D、源码核对和三宽度检查属于作者研发证据；实际学员理解、时长、独立外审与完整E仍未验证。240～320分钟按能力地图、四实践、综合推导三段安排，较原蓝图增加的实践负担单独记录。本课完成后停止，不自动开发H17、不开展正式第四模块集中审查、不发布课程。
