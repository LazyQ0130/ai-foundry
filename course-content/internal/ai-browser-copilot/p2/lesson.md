---
estimatedTime: "180–240 分钟，可分两次完成"
difficulty: "进阶实作"
objective: "在 P1 插件中加入用户授权后的当前页读取，以严格消息契约和页面代次保护侧栏中的真实正文。"
checklist:
  - "从 P1 完成态继续工程，在独立目录安装并启动 P2 Starter"
  - "审查四项生产权限，用工具栏获得当前网页临时授权"
  - "提取标题、来源及有编号的可见正文块"
  - "验证隐藏和表单内容排除，以及正文与扫描长度限制"
  - "接通侧栏与后台的严格消息契约，并拒绝非法请求"
  - "验证切换标签页、导航和同 URL 刷新使旧快照失效"
  - "处理迟到响应、消息失败和超时，允许恢复重试"
  - "解释并验证后台重启后的匿名页面代次恢复"
  - "在新目录按锁文件重装并完成生产 Chrome 复验"
  - "核对 P1 入口未回归，保存成功、失败与恢复证据"
checkKeys:
  - "check-230c7a928b6e4fd1"
  - "check-56e04a91d38fb702"
  - "check-890c3e7f612ab4d5"
  - "check-7c41df0298a3b6e0"
  - "check-2a6e81bfc407d935"
  - "check-04db93e816f25ca7"
  - "check-c91a4fe3076d82b5"
  - "check-e32d67a01fc948b6"
  - "check-b178c02da495e36f"
  - "check-6f02b7a135e8cd49"
---

## 从一个阅读问题出发

你打开了一篇长文章，想让侧栏接着整理它。侧栏已经能打开，但它还不知道左边是哪一篇文章。把标题手动贴进去很容易，难的是在切换标签页后，保证侧栏展示的内容仍然属于眼前的网页。

本节先解决这个问题：用户在工具栏授权，点击“读取当前网页”，侧栏显示标题、完整来源 URL、可见正文块和快照信息。看到错误时，你能分辨是没有权限、没有正文，还是页面已经变了。下一节才把经过核对的快照交给模型。

本课附件为 `ai-web-reader-p2-starter.zip` 与 `ai-web-reader-p2-reference.zip`。Starter 已继承 P1 的工具栏入口、React 页面和确认按钮；新增严格契约与匿名页面代次工具作为基础设施。**正文提取、后台协调、侧栏客户端与结果展示仍是 TODO**。项目能构建、读取按钮却禁用，是练习起点的预期状态。Reference 是本课完成态，不包含后续课程答案。

:::concept{title="本节的支持范围"}

只读取用户主动授权的当前标签页、顶层普通 HTTP/HTTPS HTML。正文按可检查的块整理，总量最多 6000 个 UTF-16 码元，单块最多 1500，最多 100 块，扫描最多 20000 个节点。中文常用字通常计一个，emoji 可能计两个，界面中的“字符”按这个规则计数。

PDF、浏览器内置页、Chrome Web Store、iframe、Shadow DOM 和复杂动态站点不属于第一版支持范围。不调用模型、不划词、不写笔记、不自动遍历所有标签页。

:::

## 继续 P1 工程，先认清新增文件

准备已完成的 P1、独立安装的 Node.js 和桌面 Chrome。环境准备仍见[环境说明](/environment)，本课不重复安装编辑器和 React 基础。研发组合为 Node.js 24.16.0、npm 11.13.0、WXT 0.21.4、React 18.3.1、TypeScript 5.9.3、Zod 4.6.5；最低安装约束为 Node 22.12，优先使用已验证版本。Chrome 155 有运行证据，Manifest 中的 116 下限尚未实机验证。

标准练习使用 P2 Starter，它由 P1 Reference 直接增量而来。若继续自己的 P1 个性化页面，先保留一份副本，让 AI 对照新增文件和配置合并，不要把整个 App 覆盖掉。不要执行 `npm create` 重建另一套项目，也不要把 Phase 0 原型拷进来。

例如将源码解压到桌面的 `ai-web-reader-p2`，在**包含 package.json 的那层**打开终端：

```powershell
Set-Location -LiteralPath "$env:USERPROFILE\Desktop\ai-web-reader-p2"
node --version
npm --version
npm ci
npm run typecheck
npm run dev
```

保持终端运行。Chrome 打开 `chrome://extensions`，开启开发者模式，加载此项目的 `.output\chrome-mv3-dev`。如果你用的是其他解压目录，把下面的相对路径接在那个目录后面；**项目根目录和 extension 源码目录都不是待加载的构建产物**。

| 文件 | 本节职责 | Starter 状态 |
|---|---|---|
| `extension/wxt.config.ts` | WXT、Manifest 和开发环境配置 | 已配置，需审查 |
| `extension/entrypoints/background.ts` | 工具栏入口、消息路由、页面失效事件 | P1 已完成，P2 路由待接 |
| `extension/src/contracts.ts` | 输入、输出、错误和快照的数据契约 | 提供，可阅读与调用 |
| `extension/src/context-tokens.ts` | 以 session 存储匿名页面代次 | 提供，可阅读与调用 |
| `extension/src/extract.ts` | 只读顶层 DOM，输出正文块 | 待实现 |
| `extension/src/coordinator.ts` | 授权范围、注入与上下文核对 | 待实现 |
| `extension/src/read-client.ts` | 请求编号、超时和结果提交 | 待实现 |
| `extension/entrypoints/sidepanel/App.tsx` | 操作、状态、纯文本展示 | P1 已完成，P2 待接 |
| `scripts/fixtures.mjs` | 可重复访问的普通练习网页 | 提供，不是模型 API |

:::prompt{title="先让 AI 解释增量，不急着写代码"}

```text
请阅读当前 P2 Starter 的 README、package.json、wxt.config、contracts、context-tokens 和 TODO 文件。
这是从 P1 Reference 继续的同一个 WXT/React/TypeScript 插件，只完成 P2 网页读取。
先用一张表说明：代码运行环境、输入、输出、哪些能力已经完成、哪些 TODO 需要本课实现。
解释为什么 Side Panel 的 document 指向侧栏自己，不能直接用它读取左侧网页。
说明 activeTab、scripting、storage、sidePanel 各自的用途，以及为什么不需要全站权限。
不要修改文件、升级依赖、加入模型、选区或持久化正文。列出建议修改的文件与每步可观察结果，等我审查后再分步实现。
```

:::

:::check{title="任务 1：起点仍是 P1 的完成态"}

工具栏能打开侧栏，“确认已看到侧栏”能改变文字；读取练习按钮暂时禁用。安装与类型检查通过。核对 package-lock 与固定版本，而不是以 AI 回复“依赖安装好了”代替终端输出。

:::

## 三个执行环境怎样合作

侧栏负责交互与显示，它拥有自己的 DOM；后台是可被 Chrome 终止的协调者；提取函数临时进入目标网页的隔离执行环境，只读该页面的顶层 DOM。函数结束后返回可序列化的数据，没有常驻监听器。

```text
侧栏 CAPTURE 请求
  → 后台验证消息来源与格式
  → 核对当前 windowId / tabId / URL / 匿名代次
  → chrome.scripting.executeScript，顶层 frame 0、ISOLATED
  → 返回标题 / URL / 正文块，以及 Chrome 提供的 documentId
  → 后台再次核对页面、代次与文档
  → 侧栏验证响应编号、结构和 CHECK_CONTEXT
  → 当前请求仍有效，才展示
```

这里没有网页 → 后台的指令通道。网页中即使出现 `{"type":"DELETE_ALL"}`，也只能作为正文字符串显示。不要添加 `window.postMessage` 桥接，不要解释网页里的 JSON 来调用扩展 API。

### 临时访问来自工具栏

生产权限仅有 `sidePanel`、`activeTab`、`scripting`、`storage`。`activeTab` 让 Chrome 在用户点击扩展工具栏等受支持的入口后，临时授予当前标签页访问；它不是所有网页的常驻授权。侧栏里的“读取”按钮本身不会替另一个标签页补发授权。

保留 P1 的普通 `chrome.action.onClicked`，在回调中直接调用 `chrome.sidePanel.open({windowId})`，不要先等待存储、提取或网络操作。初始化与安装/启动时恢复 `openPanelOnActionClick: false`；不要换成另一个入口导致授权关系失去已验证依据。

同源导航或刷新可能保留访问 grant，但旧文档快照必须失效。跨源导航通常撤回此前 grant，需要重新点击工具栏。请把“Chrome 是否允许注入”与“手里的快照是否属于当前文档”分开检查。

可对照 Chrome 的 [activeTab 授权说明](https://developer.chrome.com/docs/extensions/develop/concepts/activeTab)与 [scripting API](https://developer.chrome.com/docs/extensions/reference/api/scripting)核对这些边界；声明权限、调用 API 和实际获得授权是三个要分别检查的环节。

:::warning{title="开发权限与生产权限分开看"}

WXT 开发构建会加入开发服务器所需的权限和回环来源。权限验收以停止 dev 后的 `.output\chrome-mv3\manifest.json` 为准，不用开发 Manifest 证明产品最小权限。生产没有 `host_permissions`、`content_scripts`、`tabs` 或 popup。

浏览器权限控制扩展能访问哪里；CORS 控制网络响应是否允许读取；CSP 限制扩展自身能连接哪些网络资源。本节没有 API，生产 `connect-src 'none'`。正文提取使用 scripting，不应通过放开 CORS 或 CSP 修复未授权错误。

:::

## 先写一个能被检查的只读提取器

新开终端，在同一项目目录运行：

```powershell
npm run fixtures
```

打开 `http://127.0.0.1:8002/article-a`。练习页包含导航、标题、正文、列表与代码段，便于分辨“提取成功”是否只是把整个页面胡乱拼在一起。这个服务只返回普通网页，不接收或保存正文，不需要 Key。

`extractPage` 是固定函数，Chrome 会序列化它。即使在 TypeScript 模块里能访问某个导入变量，注入后的函数也未必有那个变量。把它运行时所需的小常量和工具函数放在函数内部；类型导入会在构建中消失，不影响序列化。不要用 `eval` 或把页面字符串当代码执行。

先选择可见的 article/main，没有合适候选就遍历 body。过滤应跳过整棵无关子树，而不是读取全部 `innerText` 后才删除几个词。明确排除 script/style/template、导航/页眉页脚、表单和可编辑区、隐藏或完全透明区域、iframe 等。不要读取 input.value，也不要让 textarea 的初始文字漏入结果。

保留足够简单的结构：`heading`、`paragraph`、`list`、`code`；给每块编号 `b-001`、`b-002`。`text` 必须严格等于所有块的 text 用换行连接，界面和将来模型输入才能核对同一份材料。保留行内词间空白，代码段保留换行；截断 emoji 时不切断代理对。

:::prompt{title="实现有边界的内容提取"}

```text
只完成 extension/src/extract.ts，遵循已经提供的 Extracted 契约，不修改其他 TODO。
实现固定、可序列化、只读的 extractPage 和轻量 probeDocument。只支持顶层普通 HTML。
提取 title、location.href 和可见正文，保留 heading/paragraph/list/code 块，按 b-001 顺序编号；text 与块换行连接完全一致。
跳过脚本、隐藏/透明子树、导航、表单输入及textarea、contenteditable、iframe，不进入 Shadow DOM。
总正文含换行 <=6000 UTF-16码元、单块<=1500、<=100块，扫描<=20000节点；达到限制明确 truncated/scanLimited。
扫描和文本拼接也要有上限，不能只在无界遍历结束后 slice。保留行内空白、代码换行，避免切断emoji。
空正文返回NO_CONTENT，非HTML返回UNSUPPORTED_PAGE；不要借用页面自己的脚本，不申请额外权限。
实现后说明你检查了哪些排除条件、注入函数是否依赖模块闭包，以及怎样用 privacy/long/empty/inline 练习页验证。先不要接模型或划词。
```

:::

:::check{title="任务 2：审查提取函数，再接入扩展"}

检查函数内部没有模块级运行时依赖；没有读取表单 value；遍历停止和字符串拼接都有边界。暂时没有通信时，提取器写完不等于真实注入成功。接通后回到这些夹具核对；不要让 AI 用自行构造的假正文截图充当成功证据。

:::

## 用严格消息把环境连起来

`contracts.ts` 同时提供 TypeScript 类型和运行时 Zod 校验。TypeScript 能约束写代码时的数据，不能保证运行时收到的消息真的符合约定。后台用 `RequestSchema.safeParse`，侧栏用 `ResponseSchema` 与 `SnapshotSchema`；未知字段、未知操作、错误版本和无效 UUID 都拒绝。

本节只有 `CAPTURE` 与 `CHECK_CONTEXT` 两种请求，二者都有 v、requestId、context。context 含 windowId、tabId、url。CAPTURE 成功返回 Snapshot，CHECK_CONTEXT 成功只返回 `{current:true}`；失败返回有编号的错误。不要通过 `as Snapshot` 跳过校验。

后台还要验证 sender.id 等于自己、sender.url 精确等于扩展的 `sidepanel.html`，拒绝带 sender.tab 的普通标签页或内容脚本来源。因此，把侧栏 HTML 地址粘进新标签页打开，只能用于检查 React 布局，不能等同真实 Side Panel 的通信验收。

:::prompt{title="接通固定的只读消息路径"}

```text
完成 coordinator.ts 和 background.ts 中的 P2 消息路由，保持 P1 工具栏回调原样。
复用 contracts 与 context-tokens，不重写协议。校验来源和消息后才能创建页面租约或注入。
只调用固定 extractPage/probeDocument，target明确顶层frame0，world为ISOLATED；禁止从消息接收任意函数或代码。
核对请求中的窗口、活动标签页、URL、loading状态和租约身份；注入后再核对。
InjectionResult.documentId是Chrome给出的文档身份，不要自行伪造。轻量探测与提取的documentId必须一致。
CAPTURE产生snapshotId、contextToken、documentId、capturedAt、正文SHA-256和来源；CHECK_CONTEXT验证已有token和documentId。
后台注册onMessage后返回true，异步sendResponse；所有监听器在worker启动时同步注册。
整体后台操作设4秒时限，错误区分NEEDS_PERMISSION/UNSUPPORTED_PAGE/NO_CONTENT/TAB_CHANGED/BAD_MESSAGE/TIMEOUT/CONTEXT_UNAVAILABLE。
不要把所有错误都吞掉，不能用全站权限解决未授权。完成后列出输入校验、注入前后检查以及错误恢复位置，运行类型检查。
```

:::

### 为什么 tabId 和 URL 还不够

同一标签页刷新后，tabId 和 URL 都可能没有变化，页面已经是另一个文档。我们给每次页面上下文一个匿名 UUID 代次；刷新/loading、导航或相关标签页变化时立即替换内存中的租约身份，再串行写入 `storage.session`。旧请求即使先发后到，也不能通过身份检查。

`context-tokens.ts` 已提供这部分容易出错的基础工具。`lease(tabId)` 得到稳定的租约对象，`lease.ready` 读取或创建 UUID；`invalidate(tabId)` **同步**换掉对象，然后排队持久化新 UUID；`isCurrent` 按租约身份判断；关闭标签页时 `release` 等前面的写入完成再删键。存储失败不会永久污染后续重试。

`documentId` 再补一层检查：后台探测当前顶层文档并比较 Chrome 提供的文档身份。它可以拦住事件处理延迟期间，同 URL 已经换文档的情况。`contentHash` 用来核对正文是否相同，不能代替文档身份，也不是网页可信度证明。

| 事件/情况 | 本节处理 |
|---|---|
| 当前窗口切换标签页 | 侧栏清正文、递增本地 generation；后台使进入的标签页租约失效 |
| loading 或 URL 改变 | 立即使相关页面代次和侧栏旧结果失效 |
| 标签页关闭、移出窗口、被替换 | 清理或作废对应上下文 |
| 相同 URL 刷新 | 旧 token/documentId 失效；重读可以在同源 grant 尚在时成功 |
| 请求迟到 | 后台前后核对，侧栏 generation/requestId 双重拒绝旧提交 |
| worker 终止后重启 | 同步重注册监听器；从 storage.session 恢复匿名 token，不恢复正文 |

:::deepdive{title="后台生命周期与侧栏本地 generation"}

MV3 Service Worker 可能空闲终止，不能把内存 Map 当永久数据库。session 可以跨同次浏览器会话的 worker 重启保留状态；扩展重载或浏览器会话重置后不能承诺它还存在。不要靠轮询或定时请求强行保活。

平台依据见 [Service Worker 生命周期](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle)和 [storage.session](https://developer.chrome.com/docs/extensions/reference/api/storage)。文档说明 API 边界，具体工程仍需运行验收。

后台租约保护“返回的数据还属于这个文档”；侧栏 generation 保护“这次异步结果仍属于当前交互”。清空旧正文时同步递增 generation，任何 await 之后都不能无条件 setState。超时不代表 executeScript 已被取消；它可能稍后完成，因此晚到的成功与晚到的错误都要丢弃。

还有一个容易漏掉的边界：如果查询当前页在超时后才返回，不应继续发出新的 CAPTURE；后台已经超时也不应启动下一次注入或探测。在等待之后、发出下一步之前检查本次操作是否仍存活。只给最终 setState 加守卫，不能阻止这些多余读取。

同 URL 的 SPA 局部内容更新没有通用事件保证。本课不加 MutationObserver 通用监听；页面局部变更后由用户重读。后续若扩大范围，需要另立需求与验收，不能据此宣称支持所有动态网站。

:::

## 让侧栏展示能核对的结果

侧栏只负责发出操作、检查回应、展示数据。连接 `createReader`，操作状态用 idle/loading/success/error。开始新读取时马上清掉旧快照；换页、失败、超时也不能残留旧正文。按钮在等待期间禁用，在错误或成功后恢复。

从 `chrome.windows.getCurrent()` 确定侧栏所属窗口，再查这个窗口里的活动标签页。别用另一个刚获得焦点窗口的内容替换它。标题、URL、编号正文块用 React 普通文本渲染；不用 `dangerouslySetInnerHTML`。元数据可以放进折叠区域，不要挤占阅读区。

:::prompt{title="实现侧栏状态与异步提交保护"}

```text
完成 read-client.ts 和侧栏 App 的 P2部分，保留已可用的P1欢迎与确认按钮。
窗口ID固定为侧栏所属窗口；只读取该窗口的活动tab。先查询真实来源，不硬编码example.com。
消息使用随机requestId并设6秒整体时限，严格验证回应结构、requestId、来源；CAPTURE后再CHECK_CONTEXT。
最终提交前再次检查当前context及本地generation。切换、导航、刷新、关闭、移出窗口/替换时清正文并递增generation。
新请求开始、错误和超时都清掉旧结果；旧请求晚到的成功/错误不得覆盖新请求；成功和失败后按钮均恢复。
显示标题、原URL、字符/块数量、截断提示和纯文本正文；折叠显示tabId/windowId/token/documentId/hash/时间。
增加“检查快照有效性”操作复用CHECK_CONTEXT，不能给它附带读取或模型调用。正文只存在侧栏内存，不写storage。
审查effect清理和所有异步分支，运行typecheck/build。列出哪些是自动测试，哪些仍需实际Chrome授权，不能把断言写成原生验收PASS。
```

:::

:::check{title="任务 3：第一次真实读取"}

在 article-a 网页点击工具栏的本扩展图标，再在原生侧栏点读取。应看到“P2 文章 A”、正确 URL、ARTICLE_A、列表和代码块；导航不在正文里。展开元数据，应有 Chrome 的 documentId、UUID 代次和 SHA-256。若只看见页面标题或固定示例文字，还不算完成。

:::

## 按结果验收，而不是按文件数量验收

先用本地夹具完成可重复检查，再用普通 HTTPS 页面验收真实授权。使用**生产构建**判断权限边界：Ctrl+C 停止 dev，执行以下命令，在扩展管理页加载当前目录下 `.output\chrome-mv3`。避免同时保留同名开发版与生产版，混淆验收对象。

```powershell
npm run typecheck
npm run build
npm run fixtures
```

夹具服务另占一个终端，需保持运行。若已在运行，不要再启动第二份。也可先构建，再另开终端运行 fixtures。

| 场景 | 怎么做 | 必须看到 |
|---|---|---|
| 普通 HTTPS | 打开 https://example.com/，点工具栏授权再读取 | 正确标题、URL 与实际正文，无模型摘要 |
| 未授权标签页 | 新开另一个标签页访问 https://www.iana.org/help/example-domains，不点工具栏，直接在已有侧栏尝试读取 | 拒绝；没有上一页正文。点工具栏后才可重读 |
| 内置/禁止注入 | 打开 chrome://version 或 Chrome Web Store，尝试读取 | 明确拒绝，无旧正文；回普通网页可恢复 |
| 跨标签页 | A、B 两页来回切换并分别授权读取 | 切换立即清旧正文，新结果来源与当前页面一致 |
| 同 URL 刷新 | 先读一页并记 token/documentId，再刷新 | 旧正文清除；重读后文档身份与代次改变，不要求同源重新授权才成功 |
| 隐私排除 | 打开 /privacy，授权后读取 | 有 VISIBLE_OK；没有任何 SECRET_ 字样、表单值或 iframe/Shadow 内容；网页指令字符串只显示为文本 |
| 长度与扫描上限 | 分别读取 /long、/scan | 总正文<=6000，单块<=1500，编号连续；有截断/扫描限制提示，页面不长期卡住 |
| 空白与文档类型 | 读取 /inline、/empty、/not-html | Hello world 有空格，代码换行保留；后两者为 NO_CONTENT / UNSUPPORTED_PAGE |
| 超时与迟到 | 在隔离自动测试中延迟旧响应；新请求先完成 | 旧成功和旧失败均不覆盖新结果；超时恢复按钮；下一次读取可成功 |
| worker 重启 | 作者隔离自动测试实际终止worker再发CHECK_CONTEXT；手工可用扩展Service Worker管理工具停止后复验 | 未换页的匿名token可恢复；换文档后的旧快照拒绝；不靠刷新整个扩展假装worker重启 |
| P1 回归 | 关闭再从工具栏打开，点确认按钮 | 入口和React交互仍成功 |

:::prompt{title="让 AI 先测试，再给结论"}

```text
请审查本课完成态并编写有针对性的作者测试，不把测试工具打进学生交付包。
用确定性适配器覆盖：非法消息/来源、非活动tab、同URL新代次、文档ID变化、旧成功与旧错误迟到、请求和上下文查询超时、存储失败后重试。
用真实Chrome覆盖：实际DOM过滤和长度、真实runtime消息、侧栏展示、刷新/切换清空、实际worker终止与重启。
任何仅用于测试的host权限都放在单独夹具扩展中，记录与产品manifest的差异；它不能证明activeTab原生授权。
按单元测试、受控浏览器自动化、产品原生交互三个来源给出PASS/FAIL/BLOCKED及原始日志，不用TypeScript通过代替运行成功。
不使用模拟action点击来伪造用户授权，不接入模型，不修改现有课程平台和发布状态。列出真实失败、修复与重验结果。
```

:::

:::task{title="任务 4：保存一份可追溯的验收记录"}

保存一张读取成功的截图，包含来源与可见正文；一张明确失败且无旧正文的截图；记录失败后的恢复。补充构建日志、Chrome 版本和本次加载目录。截图不能独立证明所有生命周期场景，自动测试日志也不能独立证明工具栏 grant。

新建另一个解压目录，用原始锁文件 `npm ci`、typecheck、build，再在 Chrome 加载它的生产产物。不要沿用旧 node_modules 来证明可重新安装。只做与变更有关的回归；已有不变能力的证据可以引用，不必不断重做全部 P1 操作。

:::

## 遇到问题时从哪一层找

先记录错误发生时的来源 URL、tabId、token/documentId，以及侧栏状态。看网页 Console 只能看到网页层，扩展后台和侧栏各有自己的日志。

| 现象 | 可能原因 | 恢复与核对 |
|---|---|---|
| NEEDS_PERMISSION | 没点工具栏、跨源后 grant 撤回、单位策略限制 | 回普通网页点本扩展图标；核对生产权限，不加全站权限 |
| 读出了插件自己的按钮 | 在侧栏 document 上做 DOM 提取 | 提取函数放到 scripting 的目标 tab 顶层执行 |
| 函数未定义/ReferenceError | 注入函数引用模块闭包 | 将运行时辅助函数放进 extractPage；重新构建、重载扩展 |
| BAD_MESSAGE | 版本/字段/UUID错误，或把侧栏HTML当普通tab打开 | 看请求与sender；不要删除来源校验来容忍错误调用方式 |
| TAB_CHANGED | 刷新、切换、导航或文档ID已不同 | 重新读取；这是防止旧正文污染的正常拒绝 |
| NO_CONTENT | 空页面，或可见正文均在支持范围外 | 用article-a恢复；检查过滤是否误排除了main自身 |
| UNSUPPORTED_PAGE | 内置页/WebStore/PDF/非HTML | 换普通HTML；PDF不属于本课补丁目标 |
| TIMEOUT 或通道关闭 | 后台异常、页面繁忙、消息未保留通道 | 看后台Console与onMessage return true；恢复按钮后重试，不无限loading |
| 仍显示上页内容 | 失效只写异步存储、UI没清空、旧回调无generation守卫 | 先同步失效，再持久化；检查所有await后的提交 |
| 刷新地址未变，所以旧快照“有效” | 仅比较tabId+URL | 加匿名代次与Chrome documentId，不能拿hash代替 |
| localhost开发服务连不上 | 端口占用或加载了生产目录 | 核对3080 dev、8002夹具；分别在自己的终端停止旧服务并重启 |

采集日志：`chrome://extensions` → 本扩展 → “Service Worker”打开后台 DevTools；在侧栏正文区域右键“检查”打开侧栏 DevTools，查看 Console。Console 清空旧记录后只复现一次；记录错误文本、版本和时刻。不要打开网页 DevTools 后误称采集了后台错误。关闭 DevTools 后再做空闲观察，因为调试器可能影响 worker 的空闲终止。

需要保存终端日志时，可以在自己的练习目录使用：

```powershell
npm run typecheck 2>&1 | Tee-Object -FilePath .\p2-typecheck.log
npm run build 2>&1 | Tee-Object -FilePath .\p2-build.log
```

日志是你自己的练习证据，正式源码包不用带 Profile、.env、node_modules 或其他个人数据。不要在截图或聊天中暴露登录页面、表单值和密钥。

## 回顾与下一节

现在你已经能说清楚：读取要用户授权，提取运行在网页的隔离环境，后台协调生命周期，侧栏只能提交仍然有效的结果。它显示的是真实、有限且带来源的材料；网页内容仍是不可信数据。

P3 会消费本节的 Snapshot，在发送前再做 CHECK_CONTEXT，并引入明确目的地、权限/CORS/CSP与超时处理。那一节才需要模型配置。本课无需准备真实Key，也不先接入一个“顺便能用”的摘要按钮。先保存当前完成态和验收证据，再结束本节。
