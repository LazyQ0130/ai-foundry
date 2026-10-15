---
estimatedTime: "90–120 分钟"
difficulty: "入门实作"
objective: "用 WXT 创建可重复安装、构建的 Chrome 扩展，从工具栏打开自己的 React 原生侧栏。"
checklist:
  - "在新目录用锁文件安装 Starter，并启动 WXT 开发服务"
  - "识别 Manifest、Background 和 Side Panel 各自的职责"
  - "实现工具栏点击打开原生 Side Panel"
  - "完成自己的欢迎页和 React 确认交互"
  - "观察一次开发时页面修改生效"
  - "完成 TypeScript 检查与生产构建，核对最小权限"
  - "复现并恢复一次故障，保存证据"
  - "从全新解压目录重新安装并在 Chrome 复验"
checkKeys:
  - "check-64f1c3a8b2907e16"
  - "check-927bd315a6e804fc"
  - "check-e20a7946d1b385cf"
  - "check-731e9cb0254df68a"
  - "check-b958f64a12d30ce7"
  - "check-0a1d8fc6932b7e45"
  - "check-46ce80b5a7193df2"
  - "check-f812d64a9c037be5"
---

## 这节课要做出什么

我们先给阅读助手一个能稳定打开的入口：点击 Chrome 工具栏中的扩展图标，右侧出现自己的页面，点击页面里的确认按钮，看到 React 更新后的文字。接下来几节课再逐步加入网页读取、整理与模型能力。

本课结束时，你应该能解释“这段代码运行在哪里”，并从另一个新文件夹重新安装成功。只在 AI 的回复里看到“已完成”，还不算完成。

本课交付两份源码附件：`ai-web-reader-p1-starter.zip` 是练习起点；`ai-web-reader-p1-reference.zip` 是完成后的对照实现。先使用 Starter。它已经准备好 WXT 配置、React 挂载和样式，但**工具栏事件尚未连接，欢迎页交互也需要你完成**。起点能构建而工具栏点击没有结果，是刻意保留的练习。

:::concept{title="今天的能力边界"}

本节只创建侧栏入口。它不读取网页、不申请网页访问权限、不保存笔记，也不发送模型请求。标题里的“AI”表示项目方向；本课尚没有 AI 摘要。

:::

## 准备好独立的开发环境

准备 Windows、桌面版 Chrome、代码编辑器、可使用的 AI 编程助手，以及独立安装的 Node.js。不要依赖编辑器内置的 Node，也不要在 AI Foundry 网站工程里安装这份项目。

本课已验证 Node.js **24.16.0**、npm **11.13.0**、Chrome **155.0.8059.41**。项目的 `.nvmrc` 记录 Node 版本；`engines` 要求 Node 22 及以上，只是安装下限，下游构建依赖还要求至少 22.12，其他版本并未全部实测，请直接使用 24.16.0。Manifest 声明最低 Chrome 116，但本课尚未在 Chrome 116 实机验收。优先使用上述已验证组合；受单位策略管理的浏览器可能禁止加载开发扩展。

将 Starter 解压到自己的工作目录，例如桌面的 `ai-web-reader-p1`。用编辑器打开**包含 package.json 的那一层**，再打开终端。下面的 PowerShell 命令假设你使用这个文件夹名称；如果不同，先在编辑器终端切换到实际目录。

```powershell
Set-Location -LiteralPath "$env:USERPROFILE\Desktop\ai-web-reader-p1"
node --version
npm --version
npm ci
```

`npm ci` 按 `package-lock.json` 安装已有版本，随后 `prepare` 生成 WXT 的类型声明。不要让 AI 在这一步升级 WXT、替换构建框架或删除锁文件。首次安装需要网络；出现 `ENOTCACHED` 说明离线缓存不足，恢复网络后在新解压的目录重试。

:::check{title="第一张证据"}

保存终端截图，包含版本号、当前项目目录与安装完成结果。检查目录里能看到 `package.json`、`package-lock.json` 和 `extension`。终端没有未处理的安装错误，才继续。

:::

## 扩展里的三位协作者

浏览器扩展也有页面，但它比普通网站多了浏览器管理的入口、权限和后台事件。

| 部分 | 本课职责 | 从哪里看 |
| --- | --- | --- |
| Manifest V3 | 声明名称、版本、权限与入口 | WXT 生成的 `manifest.json` |
| Background Service Worker | 收到工具栏点击后打开侧栏 | `background.ts`，扩展管理页的 Service Worker 控制台 |
| Side Panel | 渲染 React 页面，处理确认按钮 | `sidepanel/App.tsx`，侧栏自己的 DevTools |

关系是：**你点击扩展图标 → Chrome 派发 action 事件 → Background 调用 Side Panel API → Chrome 打开扩展页面 → React 渲染界面**。本课没有 Content Script，网页内部不会运行我们的脚本。

:::deepdive{title="后台为什么不是一直开着的网页？"}

Manifest V3 后台是事件驱动的 Service Worker，Chrome 会在空闲时终止它。不能依赖内存变量永久保存状态，也不要靠定时器保持后台存活。本节只在顶层注册事件；后续读取网页时，会引入 `storage.session` 和页面上下文代次来处理恢复与失效，今天不实现这些功能。

:::

## 看懂 Starter 的结构

```text
ai-web-reader-p1/
  package.json                  安装、开发、检查、构建命令
  package-lock.json             锁定依赖版本，保留在项目中
  tsconfig.json                 TypeScript 检查范围
  extension/
    wxt.config.ts               WXT、React、Manifest 配置
    entrypoints/
      background.ts             工具栏事件的练习位置
      sidepanel/
        index.html              扩展页面外壳
        main.tsx                React 挂载入口
        App.tsx                 欢迎页与确认交互的练习位置
        style.css               基础样式
```

安装会生成 `.wxt`；开发或构建会生成 `.output`。这些都是工具产物，不是让 AI 编辑的源码。WXT 通过 `entrypoints` 识别后台与侧栏，自动填写相应 Manifest 字段。我们的配置放在 `extension` 中，所以所有命令都显式指定同一份配置文件。

:::prompt{title="先让 AI 读工程，再修改"}

复制以下需求，让 AI 先反馈理解。你要对照文件判断它有没有把背景和页面混淆。

```text
请阅读当前 P1 Starter 的 package.json、锁文件、extension/wxt.config.ts 和 entrypoints。
先不要修改文件。用文件路径说明 Manifest、Background Service Worker、React Side Panel 分别在哪里。
列出目前故意缺少的两项练习，以及 npm ci、npm run dev、npm run typecheck、npm run build 的用途。
保留 WXT 0.21.4、React 18.3.1、TypeScript 5.9.3 和已有锁文件。
本节范围只有工具栏打开原生侧栏和欢迎页确认交互，不添加网页读取、模型、存储或新权限。
```

:::

## 启动 WXT，加载开发扩展

在项目终端执行，保持终端运行：

```powershell
npm run dev
```

看到 WXT 启动、开发服务器使用 `127.0.0.1:3080`、扩展构建完成后，在 Chrome 地址栏打开 `chrome://extensions`。开启右上角“开发者模式”，点击“加载已解压的扩展程序”，选择项目里的 **`.output\chrome-mv3-dev`**。不是项目根目录，也不是 `.output` 本身。

在右上角拼图菜单找到本课名称，点击图钉固定。记下开发扩展的 ID 和显示的版本。此时工具栏尚未连线，先不要把“点击后没反应”误判为安装失败。

:::warning{title="开发版权限不能当作产品权限"}

WXT 开发时会为热更新自动加入 `tabs`、`scripting` 和开发服务器的回环地址权限，并调整开发 CSP。它们来自开发工具。本课生产包的产品权限只有 `sidePanel`，没有 `host_permissions`，也没有 `activeTab`。核对最小产品权限时应看生产构建，不能用开发 Manifest 代替。

:::

开发服务器地址只是开发服务，不是阅读助手网站。侧栏必须由 Chrome 加载扩展页面。不要把浏览器里打开一个普通 React 地址当作 Side Panel 验收。

## 实现工具栏打开原生 Side Panel

先用自己的话描述结果：“点击固定的扩展图标，右侧出现本扩展侧栏”。再让 AI 在练习位置完成接线。

:::prompt{title="连接浏览器入口"}

```text
请完成 extension/entrypoints/background.ts 的 P1 TODO。
使用 chrome.action.onClicked，在用户点击事件中立即调用 chrome.sidePanel.open({ windowId: tab.windowId })；校验 windowId，并处理打开失败的日志。
保留普通 action 事件路线，使用 setPanelBehavior({ openPanelOnActionClick: false })，在 worker 初始化、首次安装和浏览器启动时恢复该设置；顶层同步注册监听器。
不要在 open 前等待异步查询、定时器或模型请求，不要设置 action.default_popup。
不添加 activeTab、scripting、storage、contextMenus、网页脚本或 API。本课只需要 sidePanel 产品权限。
修改后解释为何 open 必须紧随用户点击，以及如何从 Chrome 检查结果。
```

:::

关键审查不是逐字记住 API，而是确认事件顺序。检查代码是否符合以下顺序：

```ts
chrome.action.onClicked.addListener((tab) => {
  if (!Number.isInteger(tab.windowId) || tab.windowId < 0) return;
  void chrome.sidePanel.open({ windowId: tab.windowId }).catch((error) => {
    console.error('[P1] Failed to open Side Panel', error);
  });
});
```

`openPanelOnActionClick: false` 关闭浏览器替我们自动打开的路线，让普通 `onClicked` 事件保持为后续课程的明确入口。若添加 `default_popup`，点击会进入 popup，普通 action 事件不会按本课方式触发。若在 `open` 前 `await` 网络等操作，可能丢失用户手势，Chrome 会拒绝打开侧栏。

修改后台后，在 `chrome://extensions` 点本课卡片的重新加载按钮，返回一个普通网页，例如 `https://example.com/`，点击**你固定的本课图标**。它可能是默认字母图标。右上角通用的侧栏按钮和拼图按钮不是这次要验收的入口。

:::check{title="确实是原生侧栏"}

Chrome 右侧出现可关闭的原生 Side Panel，标题属于本课扩展，内部显示 Starter 欢迎页。保存包含工具栏、网页地址和整个侧栏的截图。只看到一个新标签页或普通网页弹窗，不满足此项。

:::

Side Panel 的打开权限不等于读取网页的授权。后续的 `activeTab` 只在特定用户操作后对当前标签页提供临时访问，不能推导成所有标签页都能读。本节没有申请它。

## 把欢迎页变成自己的阅读入口

打开 `App.tsx`，先自行决定标题和一句欢迎语，再让 AI 实现最小交互。你应能指出 JSX 的哪一段对应屏幕上的哪一个区域。

:::prompt{title="完成自己的 React 页面"}

```text
请只修改 extension/entrypoints/sidepanel/App.tsx。
将欢迎页标题和介绍改为我自己的阅读入口；保留“本节只创建侧栏，不读取网页、不发送数据”的边界说明。
启用一个“确认已看到侧栏”按钮，用 React useState 在点击后显示确认成功文字，状态区域使用 aria-live="polite"。
不使用 alert，不保存数据，不请求接口，不新增依赖，不实现后续课程功能。
完成后告诉我：按钮事件如何改变状态，哪个 JSX 位置会随之更新；让我亲自点击验收。
```

:::

确认按钮必须真的改变页面。静态写一句“确认成功”不算 React 交互完成。状态仅保存在这次 React 页面实例中；关闭重开或重新加载后恢复初始提示是可以接受的，本节没有持久化要求。

保持 `npm run dev` 运行，把欢迎语再改一个词并保存。在已经打开的侧栏观察更新；若改的是后台或配置，需要重新加载扩展后重开侧栏。保存修改前后两张截图，或录一段短视频，证明变的是扩展页面。

:::task{title="暂停一下，自己解释"}

用三句话写进自己的学习记录：为什么侧栏中的按钮用 React 事件，而工具栏点击写在 Background；为什么不直接编辑 `.output`；为什么这一节不需要网页访问权限。

:::

## 构建能脱离开发服务运行的版本

先在开发终端按 `Ctrl+C` 停止服务。执行：

```powershell
npm run typecheck
npm run build
```

检查通过后，生产目录是 **`.output\chrome-mv3`**。在扩展管理页移除本课开发扩展，再加载这个生产目录，固定图标，重复“工具栏打开 → 点击确认 → 关闭侧栏 → 再打开”。注意核对名称没有“开发”后缀，避免误测另一个版本。

打开生产目录的 `manifest.json`，核对 `manifest_version` 为 3、有 `background.service_worker` 与 `side_panel.default_path`；`permissions` 只有 `sidePanel`，没有 `host_permissions`，没有 `action.default_popup`。生产 CSP 中 `connect-src 'none'` 符合本课没有网络请求的事实。不要手改生成文件；差异应回到 `wxt.config.ts` 调整再构建。

:::concept{title="权限、CORS、CSP 分别管什么？"}

浏览器权限决定扩展可调用哪些能力、访问哪些站点；CORS 是服务器对跨源读取的响应规则；CSP 约束扩展页面可以加载和连接什么资源。三者不能相互替代。本节生产页面不请求服务，不需要本地 API、CORS 配置或全站权限。

:::

`npm run zip` 可以另行生成用于分发的扩展构建 ZIP。**Chrome 的“加载已解压”要选择含 manifest.json 的文件夹，不能直接选择 ZIP**。课程源码 ZIP 则含 `package.json`，两种 ZIP 用途不同。

## 故意制造一次可恢复的错误

任选下面一项，在自己的开发工程复现、记录、恢复。不要改动已有其他扩展或个人浏览数据。

| 现象 | 先查什么 | 恢复操作与应该看到的结果 |
| --- | --- | --- |
| `npm ci` 提示 Node 版本不满足 | `node --version` 和终端 PATH | 安装独立的已验证 Node，重开终端后在新解压目录安装成功 |
| 安装 `ENOTCACHED` 或下载失败 | 是否离线、代理与 npm registry | 恢复网络；保留失败日志，在新解压目录重新 `npm ci` |
| Chrome 说没有 Manifest | 选中的文件夹有没有 manifest.json | 开发先等 WXT 构建，选择 `.output\chrome-mv3-dev`；生产选择 `.output\chrome-mv3` |
| 工具栏点击没反应 | 是否尚未完成 TODO、选错图标、有 popup、后台有错误 | 核对普通 onClicked 路线，重新加载扩展，从网页重新点图标 |
| `sidePanel.open` 提示需要用户手势 | 是否在 open 前加了 await/定时器 | 回到点击监听器直接调用，重新加载再点击 |
| 修改页面不更新 | 是否加载生产目录、dev 终端是否还在 | 使用开发目录并恢复服务；后台或配置变化后手动重载 |
| 3080 端口被占用，WXT 退出 | 是否已开着同项目另一个 dev 终端 | 在属于本项目的旧终端 Ctrl+C，再启动；strictPort 不会悄悄改端口 |
| `npm run typecheck` 报错 | 报错文件及行号，是否把字符串写成错误类型 | 修复源码，再检查和构建；不要关掉 strict 或跳过检查 |

推荐先在 `App.tsx` 临时写入 `const practiceCount: number = 'one';`，运行 `npm run typecheck`，记录类型错误；删除你刚加的这一行，重新检查、构建通过。这个练习能证明你会从错误回到可用状态，无须破坏安装环境。

:::stuck{title="把完整现象交给 AI"}

扩展管理页点击“错误”查看错误；点击 Service Worker 打开后台 Console。在侧栏内部右键“检查”，查看页面 Console。两者不是同一个上下文。先截图原始错误，再清空并复现一次，区分旧错误和新错误。收集版本、加载目录、重现步骤、完整错误文本和期望结果。不要提交个人网页信息、账号令牌或密钥。

:::

:::prompt{title="根据证据排查，不盲目重装"}

```text
我在做 P1 工具栏打开 React 侧栏，下面附版本、加载的目录、操作步骤、期望结果和完整错误日志。
请先区分安装、WXT 构建、Background 和 Side Panel 页面四个层面，提出一个最可能原因和最小修复。
保留锁定依赖、普通 action 事件路线与 sidePanel 唯一产品权限；不要加入 popup、全站权限、网页读取或 API。
不要批量删除文件，不要跳过 TypeScript 检查。说明修复后要由我在 Chrome 点击什么来复验。
若证据不足，请指出还需要哪一个具体日志；不要声称已完成真实浏览器验收。
```

:::

## 用新目录完成最后一次复验

不要只在原目录看一次成功。将原始 Starter 再解压到一个新目录，例如 `ai-web-reader-p1-recheck`，仅复制自己完成的 `background.ts`、`App.tsx`（若改了样式也带上对应源码），保留锁文件。在新目录运行 `npm ci`、`npm run typecheck`、`npm run build`。

在 Chrome 移除先前的本课扩展后，加载新目录的生产构建，再从工具栏打开侧栏并点击确认。关闭再打开 Chrome 后再做一次。条件允许时使用 Chrome 的新独立资料窗口，重新加载该生产包；不要删除日常 Profile，也不要以“ID 相同”代替实际点击验证。不同文件夹或资料配置可能影响扩展 ID，本节不依赖固定 ID。

如果不确定自己改对了什么，再将 Reference 解压到**另一个**新目录，独立安装和构建后对照行为。不要把 Reference 覆盖到你的练习目录，也不要用它的成功代替自己作品的验收。

:::check{title="提交这组可核对的成果"}

- 新目录安装、类型检查、构建完成的终端证据。
- 开发扩展加载、工具栏打开原生侧栏和 React 确认交互的截图。
- 修改欢迎语后开发侧栏实际更新的证据。
- 生产 Manifest 最小权限截图及开发服务停止后仍能打开的截图。
- 一次故障原始日志、修复说明与恢复成功证据。
- 新目录重装、Chrome 重启后的复验记录，注明版本、时间和加载目录。

:::

## 回顾与下一节衔接

你现在有一个真正由 Chrome 管理的扩展入口，并且能分辨后台事件与 React 页面、开发构建与生产构建。更重要的是，你能根据日志修复一次错误，再从干净目录复现自己的结果。

下一节会从这个入口继续，讨论用户授权后怎样读取当前网页。届时才加入必要的 `activeTab`、脚本注入与页面上下文设计。本节留下普通 action 事件和清晰目录，便于延续；现在不用提前实现读取、消息协议或模型调用。

需要核对 API 时，可以阅读 [Chrome Side Panel 文档](https://developer.chrome.com/docs/extensions/reference/api/sidePanel)、[activeTab 文档](https://developer.chrome.com/docs/extensions/develop/concepts/activeTab) 和 [WXT CLI 文档](https://wxt.dev/api/cli/wxt)。文档描述能力，学员仍须在自己的 Chrome 中完成上述验收。
