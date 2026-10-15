# AI Foundry 项目工坊｜AI 网页阅读与知识整理助手课程研发蓝图 V1.1

> 文档状态：方案设计稿（尚未实施、测试或发布）  
> 设计日期：2026-10-14  
> 正式中文名称：**AI 网页阅读与知识整理助手**  
> 内部代号：`browser-copilot`（仅作为工程标识）  
> 关联平台仓库：https://github.com/LazyQ0130/ai-foundry  
> 独立示例工程建议名称：`ai-browser-copilot`（保留作为技术仓库名称）  
> 定位：项目工坊 · 中级实战 · 8 节正式课 + 3 项选做挑战  
> 前置能力：Stage 2、Stage 3，或等效的 React/TypeScript/API/LLM 基础  
> 建议工时：13–18 小时（学员预估；不含排队/账号/云端审核），需要学员测试修订。

## 0. 名称与对外定位

- **对外课程名称：AI 网页阅读与知识整理助手**。面向学员、项目工坊列表、宣传文案、课程标题、作品展示统一使用。
- **内部代号：Browser Copilot**，保留 `browser-copilot` / `ai-browser-copilot` 作为 slug、代码仓库和目录；不作为主视觉或售卖标题。
- **一句话卖点：** 不离开正在阅读的网页，就能让 AI 帮你总结文章、理解术语、回答问题并保存笔记。
- **课程目标：** 不是在浏览器中再造聊天机器人，而是开发一款尊重授权边界、可安装、可日常使用的 AI 阅读和知识整理工具。

## 1. 项目目标

### 1.1 一句话定位

在 Chrome 浏览器侧边栏构建一个用户主动授权的 AI 网页阅读助手：读取当前网页、总结与划词、基于当前页面内容问答、解释 GitHub README，并把笔记安全地保存在本地。

### 1.2 目标用户及其任务

主要用户：需要频繁阅读技术文档、GitHub README 和长篇文章的大学生 / 开发学习者。

核心任务：
1. 不离开原网页，选择性读取内容、获得摘要和术语解释。
2. 对当前页提问，结果能够回查到实际提供的网页内容。
3. 将摘要、手动编辑的笔记和来源 URL 保存，重新打开浏览器可找回。

### 1.3 交付边界

**V1 必做：** Chrome 插件加载与侧边栏；最小权限的当前页内容读取；网页摘要；右键划词解释/翻译/总结；当前页有依据问答；GitHub README 模式；本地笔记/搜索/删除/导出；可复现的构建和测试。提供 localhost 开发模型服务；如果向公众提供云端模型能力，必须另行完成用户鉴权和配额，不能开放无保护的运营者密钥代理。

**V1 不做：** 扫描全部打开的标签页；持续监控浏览历史；网页任意自动操作；跨网页知识检索；向量库；云端账户与同步；无限记忆；全浏览器兼容；大型网页的完整解析（PDF 阅读器、登录墙、Shadow DOM 深层内容和 iframe 均不作保证）；扩展商店审核通过。

**三项选做挑战：** A 多网页知识库；B 受控浏览器 Agent；C 云端笔记同步。挑战不纳入 V1 的进度分母及正式结业。

### 1.4 项目完成定义

学员在干净的 Chrome 环境中可加载打包扩展；配套模型服务正常运行后，能完成 4 条端到端场景：
- 普通文章：用户主动授权 → 读取正文 → AI 摘要 → 有依据问答；
- GitHub README：读取用户当前实际页面 → 输出技术栈/用途/运行入口，不虚构源码；
- 选中段落：右键解释/翻译/总结 → 显示在侧栏；
- 用户笔记：保存/编辑/搜索/删除/导出 → 重开浏览器依然存在。

## 2. 技术决策

| 子系统 | V1 技术与限制 | 教学理由 |
|---|---|---|
| 浏览器目标 | Chrome 116+、Manifest V3 | 统一单浏览器验收；116+ 覆盖直接打开面板的相关能力 |
| 插件框架 | WXT、React、TypeScript | WXT 自动组织 Side Panel、Background 等入口；TS 适用于安全消息契约 |
| 界面 | React + Tailwind CSS | 复用 Stage 2/3 已学能力，不重新讲通用布局 |
| 权限 | `activeTab`、`scripting`、`storage`、`contextMenus`、`sidePanel` | 最小必要权限；WXT sidepanel 入口可自动声明 sidePanel 权限，实际产物为准 |
| 网页提取 | `chrome.scripting.executeScript` + DOM、可选 Readability | 用户操作后临时访问单一页面；控制正文抽取成本 |
| 消息 | typed `chrome.runtime` / `chrome.tabs` messages | 明确 Background、Panel、页面代码的边界 |
| AI API | 独立 Node.js + Express 服务，LLM Provider Adapter | Key 只放服务端；可 mock / 切换供应商 |
| 本地存储 | `chrome.storage.local`，仅持久化笔记与设置 | 不引入 Prisma；满足 V1 量级、显式检查配额 |
| 测试 | Vitest + 浏览器集成/手工验证脚本 + mock LLM | 真实 Chrome 行为不能靠单元测试替代 |
| 发布 | `wxt build` / `wxt zip` + 安装和回归指南 | 最终是插件，不是普通 Web 网站 |

**服务部署约束：** 教学默认由学员在本机启动 `127.0.0.1` 的独立 AI API，密钥只在该服务端的 `.env`。本地 API 只绑定回环地址，并实施基础请求限制。离开开发机使用或公开分享，则需部署带实际用户鉴权、请求额度和滥用防护的远程 API；打包 ZIP 本身不等于模型功能在任何电脑上都可直接使用。不要把统一运营者 API Key 写入插件或打包文件。若日后允许用户自带密钥，需设计专门的告知与安全方案，本次不纳入 V1。

**权限路径（关键）：** 用户点击扩展工具栏图标，打开侧栏并得到当前标签页短期 `activeTab` 授权；侧栏点击“读取页面”复用这次仍有效的授权。`activeTab` 不等于永久读取所有页；切换到无授权标签页、跨来源跳转或访问 Chrome 内部页时提示“请点击扩展图标授权当前页”。不要通过在侧栏按钮内部点击就假定获得新的 `activeTab` 授权。右键菜单操作可独立触发用户手势并向侧栏提供选中文字。实现前应以 Chrome 116+ 实测行为为准。

**权限扩展原则：** 生产首次发布不申请 `https://*/*` 等所有网站的永久 `host_permissions`。如后续需要“始终允许当前站点”，用 `optional_host_permissions` 并在用户手势下按站点请求。仅对学生明确使用的后端来源配置网络请求权限及服务端来源校验。

## 3. 工程架构、职责与文件建议

```text
Chrome 浏览器
   用户触发扩展 action / 选中文字右键菜单
           |
   Background Service Worker ── 标签页/权限/事件/消息协调
           |                          |
      Side Panel (React)        按授权注入页面读取逻辑
           |                          |
           +───── PageSnapshot <──── DOM 提取、清洗、分段
           |
           +───── NotesStore (chrome.storage.local)
           |
           +───── AI API (127.0.0.1:8787 开发态)
                        |
                   ProviderAdapter (server-only secret)
                        |
                       LLM
```

建议独立工程结构：

```text
ai-browser-copilot/
├── extension/
│   ├── entrypoints/
│   │   ├── background.ts
│   │   └── sidepanel/              # WXT sidepanel UI 入口
│   ├── src/
│   │   ├── ui/                     # React pages / components / views
│   │   ├── browser/                # 授权、activeTab、消息、页面读取
│   │   ├── contracts/              # 消息、页面、AI、笔记等 TS/Zod 契约
│   │   ├── features/               # summary / selection / chat / github / notes
│   │   └── storage/                # notes local adapter
│   └── wxt.config.ts
├── api/
│   ├── src/routes/ai.ts
│   ├── src/providers/llm.ts
│   ├── src/security/limits.ts
│   └── .env.example
├── fixtures/pages/                 # 普通文章、GitHub-like、SPA、恶意文本等
├── tests/                          # unit / integration / browser smoke
├── docs/                           # ADR、架构图、部署、验收、演示
└── README.md
```

注：这是建议路径，不要求 WXT 必须采用上述内部子目录。脚手架需以实际生成版本的目录结构、导出语义和构建产物校准；避免仅为匹配此示意强行改动官方配置。

**边界：** Content Script / 被注入的函数只读取 DOM 并返回普通结构化文本，不携带模型密钥；Side Panel 管理用户交互与状态；Background 处理扩展事件并校验消息来源与目标页；AI 服务端执行额度检查、模型请求、结果解析与引用映射验证。Background Service Worker 会休眠，不能依赖内存全局变量保存持久状态。

## 4. 数据与接口契约（研发前固定）

### 4.1 PageSnapshot

```ts
type PageBlock = {
  id: string;             // 当前快照内唯一，如 b-001
  kind: 'heading' | 'paragraph' | 'list' | 'code';
  text: string;           // 纯文本；有长度上限
};
type PageSnapshot = {
  snapshotId: string;     // UUID，每次重新读取生成新 ID
  tabId: number;
  url: string;
  title: string;
  capturedAt: string;     // ISO 8601
  contentHash: string;    // 摘要用于识别变化；不作为安全签名
  truncated: boolean;
  blocks: PageBlock[];
};
```

服务端不可将客户端提交的 URL、hash 或 block 当作经独立验证的网页事实；它们代表扩展提交的当前上下文。引用要明确标注“本次读取页面”。

约束：默认只读顶层主文档、HTML 可访问正文；跳过隐藏内容、表单字段、密码框、脚本、广告区域等；不抓取 iframe、跨站私有内容。提取前后过滤不支持 `chrome://`、扩展商店、受限制 Chrome 页面以及无有效授权的标签页。推荐单块最多 1,500 字符、总正文不超过 20,000 字符，界面展示“内容已截断”；这两项是 V1 初始阈值，可根据真实评估调整。后端限制整个请求体字节数，防止超限/滥用。仅发送当前用户主动触发操作所需的片段。

### 4.2 浏览器扩展消息

统一定义带鉴别字段和版本的 discriminated union（示意）：

```ts
type ExtensionRequest =
  | { v: 1; type: 'PAGE_CAPTURE'; requestId: string; tabId: number }
  | { v: 1; type: 'SELECTION_ACTION'; requestId: string; action: 'explain' | 'translate' | 'summarize'; text: string; pageUrl?: string }
  | { v: 1; type: 'PAGE_GET_STATUS'; requestId: string; tabId: number };
type ExtensionResult<T> =
  | { ok: true; requestId: string; data: T }
  | { ok: false; requestId: string; code: 'NEEDS_PERMISSION' | 'UNSUPPORTED_PAGE' | 'NO_CONTENT' | 'TAB_CHANGED' | 'OVER_LIMIT' | 'UNKNOWN'; message: string };
```

消息均需 runtime schema 验证，不信任来自网页的任意窗口事件。异步任务应绑定 `requestId + snapshotId + tabId + url`，页面切换、URL 改变后旧响应不得覆盖当前页状态；允许用户显式查看旧结果但不能混合为当前页信息。

### 4.3 模型 API

唯一基础主接口：`POST /api/ai/respond`。

```ts
type AiRequest = {
  requestId: string;
  mode: 'summary' | 'selection' | 'page_qa' | 'github_readme';
  snapshot: Pick<PageSnapshot, 'snapshotId' | 'url' | 'title' | 'blocks' | 'truncated'>;
  userText?: string;
  selectionText?: string;
  history?: Array<{ role: 'user' | 'assistant'; text: string }>;
};
type AiResponse = {
  requestId: string;
  snapshotId: string;
  status: 'answered' | 'insufficient';
  text: string;
  references: Array<{ blockId: string; quote?: string }>;
  warnings: string[];
};
```

具体结构需要共享 schema 或生成代码保持两端一致。服务端必须对客户端输入再限长、校验 mode 所需字段、关闭代理任意 URL 功能、限定模型输出长度、设置超时与速率限制。使用流式传输时沿用相同 `requestId/snapshotId` 并明确最终结束/失败事件；浏览器断连可取消任务，不保证所有 Provider 均可立刻停止计费。

引用要求：返回的 `blockId` 必须出现在该次快照提交的白名单内；若携带 `quote`，校验其确实为对应 block 原文子串。**存在引用 ID 不代表陈述真实得到充分支持**，课程仍要求人工复核；模型不能验证或来源不足时 `status=insufficient`。

### 4.4 本地笔记 Note

```ts
type SavedNote = {
  id: string;
  url: string;
  title: string;
  summary: string;
  userBody: string;
  tags: string[];
  sourceCapturedAt: string;
  createdAt: string;
  updatedAt: string;
};
```

只保存用户明确选择的笔记结果，不默认缓存原网页全文或浏览历史；第一版限制数量、每条文本和总体字节数，提供容量提示；`storage.local` 默认可能对 content scripts 可用，设置可信上下文访问级别并由侧栏管理敏感笔记数据。没有“真正加密的私人保险箱”保证。不采用 `unlimitedStorage`，优先保证可导出和删除。未来挑战 C 才处理云端同步与冲突。

## 5. 八节课程详细设计

统一每节结构：本节成果演示 → 唯一目标 → 新概念 → 架构图/契约 → 练习需求 → AI 协作提示词 → 人工验收 → 故障排查 → Git 提交/阶段证据。

### P1 让 AI 进入浏览器：最小扩展骨架（60–90 分钟）

**唯一目标：** 在 Chrome 上真实加载 WXT/React 插件，并通过扩展 action 打开 Side Panel。

- **新增知识：** 浏览器扩展与网页的区别、Manifest V3、WXT EntryPoint、Chrome action 和 Side Panel。
- **交付：** 工作目录、可运行侧栏、浏览器加载截图、`README` 的启动命令、固定构建目标 Chrome 116+。
- **任务：** 创建工程；清理不需要的 popup；配置 action/sidepanel；实现欢迎和未授权状态；构建产物检查；手动加载。
- **非目标：** 不调用 LLM，不读取网页正文，不做用户系统。
- **必须验收：** T01 开发模式成功加载；T02 点击图标打开侧栏；T03 关闭/重开浏览器扩展不报错；T04 release build 可生成。
- **排错：** popup 抢占 action、Side Panel 没入口、权限未生成、Manifest 构建与开发模式不一致。

### P2 让插件真正看懂网页：读取与通信（90–120 分钟）

**唯一目标：** 在当前标签页有授权的前提下，完成 Side Panel → Background → 页面提取 → PageSnapshot 的可回显链路。

- **新增知识：** `activeTab`、`scripting`、Service Worker 生命周期、隔离运行环境、DOM 文本提取、消息生命周期。
- **交付：** 可复用提取器、`PageSnapshot` Schema、授权说明 UI、示例页面 fixture。
- **任务：** 设计 `PAGE_CAPTURE`；检查 tabId/来源；注入只读提取；提取标题、URL、纯文本、block IDs；处理无权限、空内容与重定向。
- **非目标：** 不发网络请求到 LLM，不绕过登录墙，不抓取所有标签页。
- **必须验收：** T05 普通文章能得到可读正文；T06 页面广告和导航不占正文主篇幅；T07 无授权/Chrome 内部页面失败可解释；T08 切换标签页不会串内容；T09 超长内容带截断提示。
- **排错：** `activeTab` 生命周期、SPA 导航后数据过时、脚本注入限制和 background 休眠。

### P3 让网页拥有 AI：摘要及模型调用（90–150 分钟）

**唯一目标：** 提取快照经过独立服务端发送给 LLM 并展示可解析的网页摘要。

- **新增知识：** 扩展对 API 的请求边界；扩展里的 CORS/host 许可；服务端密钥与配额；模型结构化输出；Abort/Timeout。
- **交付：** `api/` 可运行开发服务、`.env.example`、模式化 `summary` 请求、summary UI、LLM mock。
- **任务：** 实现 Provider Adapter、严格参数和输入限制、服务端无 Key 不启动模型路由；摘要（概览/关键点/来源提示）；停止/重试状态。
- **非目标：** 不做浏览器 Agent；不为公开互联网暴露未鉴权的模型代理。
- **必须验收：** T10 有授权页面摘要成功；T11 provider 失败/慢响应 UI 可恢复；T12 Key 不出现在扩展构建或日志；T13 输入过长时明确提示截断；T14 mock 和真实 Provider 形状一致。
- **排错：** CORS/权限、model 名与 base URL 配置、provider 错误、JSON Schema 验证。

### P4 选中即理解：原生划词助手（90–120 分钟）

**唯一目标：** 使用浏览器右键菜单把当前用户选中的文本交给侧栏进行解释、翻译和总结。

- **新增知识：** Chrome contextMenus、selectionText、用户手势、与面板消息协同、选择与注入的区别。
- **交付：** 3 个右键操作、侧栏任务展示、选中文本长度/空值提示。
- **任务：** 安装时创建菜单并防重复；确保选择文本属于发起交互的 tab/url；按模式送给 AI；打开/复用侧栏并显示结果。
- **非目标：** 不支持图片 OCR/视频字幕，不在网页里注入浮窗（可留作自定义挑战）。
- **必须验收：** T15 英文翻译成功；T16 中文解释/总结可用；T17 超限选中文本可控失败；T18 从另一标签页选中内容不会错误关联当前页。
- **排错：** contextMenus 权限、selection 来源丢失、菜单点击与 Side Panel 打开时机。

### P5 和当前网页对话：来源与拒答（120–150 分钟）

**唯一目标：** 让回答严格绑定用户当前认可的 `PageSnapshot`，引用实际的 block，并在证据不足时拒答。

- **新增知识：** 单页上下文组织、block 来源映射、对话历史预算、模型幻觉与提示注入、页面版本管理。
- **交付：** 当前页问答面板、来源片段按钮、insufficient 状态、最小 Eval 样例。
- **任务：** 提交 snapshot + 问题 + 短历史；校验返回引用 ID 与 quote；显示片段并可定位/查看原文；限制提问轮次/长度；跨页提示重读。
- **非目标：** 不做 embedding、不做跨页面检索、不承诺网页以外的实时事实。
- **必须验收：** T19 可答问题引用正确片段；T20 明确无答案问题拒答；T21 模型伪造 block ID 时拒绝使用；T22 切换 URL 后旧回答不当作新页证据；T23 含恶意指令的网页文本不会改写安全规则/泄露密钥。
- **排错：** 结构化输出无效、block ID 不存在、文本截断导致依据丢失、历史污染。

### P6 GitHub 专属模式：真实场景优化（60–90 分钟）

**唯一目标：** 对浏览器中实际读取到的 GitHub README 提供更有用的专属解读，不引入新的仓库 API。

- **新增知识：** 网页场景识别、内容分区和专用提示词、能力边界说明。
- **交付：** GitHub 模式 UI；产品用途、技术栈、运行/学习路径的结构化回复。
- **任务：** 识别 github.com 仓库 README 视图；解析已读取页面摘要；未读取的依赖和文件树标为未知；与通用问答共用 AI 合约。
- **非目标：** 不抓取私有仓库，不调用 GitHub token，不宣称阅读仓库全部源码。
- **必须验收：** T24 README 正确提取；T25 提供 3 类真实有依据的结论；T26 不存在的信息输出未知；T27 GitHub 页面读取失败时可以回退通用模式。
- **排错：** GitHub SPA 切换、README 容器变动、依赖猜测。

### P7 把网页变成知识资产：本地笔记（120–150 分钟）

**唯一目标：** 明确由用户触发保存的笔记，在关闭扩展/浏览器后仍能检索、编辑、删除与导出。

- **新增知识：** Chrome `storage.local`，本地数据生命周期，配额，schema version，导出数据防注入。
- **交付：** SavedNote schema、笔记列表、搜索/编辑/删除、Markdown 导出、容量提醒。
- **任务：** 设计纯本地笔记；仅保存用户选择的摘要与笔记；不默认落盘网页全文；升级预留 schemaVersion；设置本地存储可信访问边界。
- **非目标：** 不接入 PostgreSQL，不自动采集浏览历史，不假设 `storage.local` 加密。
- **必须验收：** T28 跨浏览器重启数据保留；T29 编辑/删除一致；T30 搜索有效；T31 Markdown 导出有来源 URL 与时间；T32 数据超限时明确失败不破坏旧数据。
- **排错：** Storage 错误、异步写入并发、旧数据迁移、笔记隐私与文本转义。

### P8 从 Demo 到交付：验证、打包、展示（150–210 分钟）

**唯一目标：** 用可重复的质量证据交付“能安装且在模型服务就绪时能使用”的插件。

- **新增知识：** 扩展打包、Manifest 权限审查、端到端状态测试、安全边界、回归矩阵与产品说明。
- **交付：** 构建 ZIP、从零安装指南、README、架构图、测试记录、2–3 分钟演示、已知限制清单。
- **任务：** 静态检查/单测/集成测试/真实浏览器 smoke；审查 host permissions、密钥；断网/换页/禁用扩展/Service Worker 重启；验证开发/构建产物一致。
- **非目标：** 不以 Chrome Web Store 过审作为结业门槛；不承诺公开远程服务天然安全。
- **必须验收：** T01–T32 全部必选项通过；T33 干净 Chrome 环境重复安装成功；T34 禁用/更新 Service Worker 状态正常；T35 README 中明确 API 运行依赖与隐私边界；T36 公开模型服务如存在，则必须有鉴权、配额、超时和滥用防护，否则保持本机教学模式。
- **排错：** `activeTab` grant 差异、打包资源路径、生产环境 API 端点、插件升级时数据迁移。

## 6. 验收矩阵 / 证据归属

| 类别 | 覆盖测试 | 证据形式 | 阻断说明 |
|---|---|---|---|
| 工程运行 | T01–T04 | 构建日志 + Chrome 录屏 | 必须通过 |
| 网页授权与读取 | T05–T09 | fixture + 错误页面截图 | 必须通过 |
| LLM 摘要和可靠性 | T10–T14 | mock + 真实服务测试记录 | 必须通过（真实账号/服务配置须说明） |
| 划词行为 | T15–T18 | 右键实际交互录屏 | 必须通过 |
| 基于来源的问答 | T19–T23 | 固定问答 fixture + 失败例子 | 必须通过 |
| GitHub 模式 | T24–T27 | 公开 README 实测、未知场景 | 必须通过 |
| 笔记持久化 | T28–T32 | 重启/搜索/导出证据 | 必须通过 |
| 交付与生产边界 | T33–T36 | 安装文档、ZIP、审查记录 | 必须通过 |

**建议新增固定质量集：** 3 个普通文章样例（含噪声/短文/超长）、2 个 GitHub-like 样例、1 个 SPA 导航样例、1 个空页面、1 个权限禁止页面、1 个含“忽略系统指令”恶意网页、1 个模拟多标签页切换。固定 10–12 条问答题，其中至少 3 条应明确拒答，并保留来源 blockId 和人工评估结果。

**教师验收与学员验收分层：** 教师维护可重建的 Reference 和自动化 suite，学员需在本机亲自运行核心 smoke 并提交至少一次异常场景证据。不要把“代码编译通过”当成“Chrome 权限与页面行为可用”。

## 7. 学员 Starter 与教学材料

**Starter 只包含：** 可运行 WXT React 侧栏空壳；TS 契约文件的空实现/注释；无业务能力的 mock API 框架；必要脚本；README；安全 `.env.example`。不提前完成网页提取、AI 模型调用、笔记和完整交互。

**Reference：** 教师维护按 P1–P8 可重建的分阶段版本，采用增量 overlay 或标签；每节都能在干净环境独立组装并执行测试；不可把 Reference 混入公开 Starter ZIP。

**正文：** 沿用 AI Foundry 现有 YAML frontmatter、Concept/Task/Prompt/Check/Stuck/DeepDive 等规范。按课固定 objective、checklist、checkKeys；新 keys 保持全局唯一，且不因文字调整改变。每节保留：问题导入、唯一目标、架构解释、任务步骤、供学员修改的 Prompt、手动验证、故障排查、提交记录。指导性 Prompt 从 P1→P8 逐步减量。

## 8. 三个自主升级挑战（不提供完整参考代码）

### A｜跨网页知识库（RAG）

**任务：** 用户主动收藏至少 5 个不同网页，可跨多个来源问答；回答显示原始网址及相关来源，未知问题能拒答。

**技术路径提示：** 设计来源记录 → 结构化分段 → embedding/向量检索 → 检索结果与回答引用绑定。可探索 IndexedDB + 本地向量方案，或复用 Stage 3 的服务端 pgvector。

**禁止捷径：** 不将当前页简单拼接五次当作真正检索；不在未授权情况下后台抓取全部访问网页。

**独立交付：** ADR、最小检索评估集、准确来源演示、隐私说明。

### B｜受控浏览器操作 Agent

**任务：** 在自己制作的安全测试站点中，Agent 能按用户任务读取、点击、填写，执行前展示计划；涉及写操作需人工确认，可停止并解释失败。

**技术路径提示：** 受限 Tool Schema、当前 tab/DOM 元素白名单、可验证 precondition、确认 token、操作后读取真实状态、步骤数与时间预算。

**禁止捷径：** 不执行 LLM 生成的任意 JS；不默认跨网站操作；不自动提交支付、发送消息、修改真实账号数据。

**独立交付：** 安全工具清单、审批日志、异常用例与复现视频。

### C｜云端账号与笔记同步

**任务：** 两个独立 Chrome 环境登录同一账号同步笔记，支持离线修改与重连后同步，用户隔离有效。

**技术路径提示：** 用户认证、记录 version/updatedAt/删除墓碑、增量同步、冲突合并策略、端到端用户隔离测试。

**禁止捷径：** 不直接把本地笔记同步到公开无鉴权 API；不把“上传一次”称为双向同步。

**独立交付：** 同步状态机、冲突案例、隔离测试结果、数据删除与隐私说明。

三个挑战可任选其一，不计入 8 节正式课完成率；挑战页仅放需求、技术提示、验收标准和必要安全边界。

## 9. 对 AI Foundry 平台的接入建议

根据当前主仓库：正式 Stage 课共 29 节；Capstone 独立 9 节并使用 `project-lab` 权益标记；`CapstoneLessonProgress` 和 `CapstoneCheck` 当前服务于 C1–C9。

**不要直接将 P1–P8 加入 `capstoneLessons.ts` 或复用 C1–C9 的统计分母。** 建议先将项目工坊课程抽象为通用 `LabProject`、`LabLesson` 元数据，在权限判定和服务端 Markdown Renderer 的基础上复用既有成熟能力，但进度数据键采用 `(userId, projectSlug, lessonId)` 组合，check progress 增加对应项目维度，避免跨项目冲突。老数据采用可验证迁移，保留 C1–C9 完成状态；不破坏原来的 `project-lab` 授权逻辑。

**建议权益初版：** 作为 `project-lab` 权益内新增项目，不临时增加一个新单品价格；是否全部学员开放交由运营决定。这是产品建议，不代表当前线上已有权限。

**建议未来文件路径：**

```text
course-content/project-lab/browser-copilot/p1.md ... p8.md
course-content/internal/project-lab/browser-copilot/
src/data/labProjects.ts
server/routes/lab-projects.ts
server/services/lab-content.ts
server/services/lab-progress.ts
starter/browser-copilot-starter.zip
```

这些是未来修改建议，不代表仓库已存在这些文件。正文仍由后端受权读取，打包前检查付费正文、参考答案和密钥没有进入公开前端 bundle。

**页面展示：** 项目工坊 → AI 研究工作台（综合毕业项目）和 AI 网页阅读与知识整理助手（独立实战）。后一项显示 P1–P8、三个挑战卡片、技术栈、前置能力、Starter 下载、学习进度与作品成果。现有正式课 29 节统计、Capstone 9 节统计以及 Browser Copilot 8 节统计彼此独立。

## 10. 研发实施顺序与阶段闸门

1. **Phase 0：技术 Spike（必须先做）**：锁定 WXT/Chrome 版本；验证 toolbar→sidepanel→临时授权→script injection→回传；右键 `selectionText`→sidebar；本地 API 调用和打包 smoke。若关键路径无法复现，不开始写正文。
2. **Phase 1：契约冻结**：PageSnapshot、ExtensionRequest、AiRequest/Response、SavedNote；枚举权限失败/状态切换；固定 10 个以上 fixtures。
3. **Phase 2：Reference 实现**：按 P1–P8 顺序逐个实现，每节提交前运行单元、集成与浏览器证据；不一次性生成一堆尚未验证的课。
4. **Phase 3：课程正文与教学 Starter**：按最新 Renderer V2 规范编写；每课至少 1 个成功、1 个异常验收；检查 Starter 不泄露答案。
5. **Phase 4：平台项目工坊通用化**：独立项目目录、授权、进度、管理员标记、受保护附件、内容检查、用户体验；执行迁移与老 Capstone 回归。
6. **Phase 5：发布前审计**：新环境重建插件和后台；完成 T01–T36；构建包安全扫描；前台、付费权限、课程进度、移动端项目浏览一致性验证（移动端仅课程网站，不是移动端插件）；再标记发布。

**阻断条件：** ① activeTab / Side Panel 链路未在目标 Chrome 复现；② 使用了全站永久权限且无合理必要；③ 密钥落入插件包；④ 网页恶意指令可突破限制；⑤ 跨 tab/URL 串数据；⑥ 无法从 Starter 干净重建；⑦ 平台学员权益泄露或原 Capstone 进度破坏；⑧ 未保护的公网 LLM 代理；⑨ 未通过真实浏览器 smoke。

## 11. 参考资料（核对时以实时官方文档为准）

- WXT Entrypoints：https://wxt.dev/guide/essentials/entrypoints
- WXT Manifest：https://wxt.dev/guide/essentials/config/manifest
- Chrome Side Panel：https://developer.chrome.com/docs/extensions/reference/api/sidePanel
- Chrome activeTab：https://developer.chrome.com/docs/extensions/get-started/tutorial/scripts-activetab
- Chrome scripting：https://developer.chrome.com/docs/extensions/reference/api/scripting
- Chrome contextMenus：https://developer.chrome.com/docs/extensions/reference/api/contextMenus
- Chrome Storage：https://developer.chrome.com/docs/extensions/reference/api/storage
- Chrome permissions：https://developer.chrome.com/docs/extensions/reference/api/permissions
- Chrome MV3 Service Worker 生命周期：https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle

---

**状态声明：** 本文是课程和研发设计，不是已实现的产品；本次仅更新本地规划文档，未对 GitHub 仓库进行写入操作。具体接口/目录应在 Phase 0 实测后再冻结。
