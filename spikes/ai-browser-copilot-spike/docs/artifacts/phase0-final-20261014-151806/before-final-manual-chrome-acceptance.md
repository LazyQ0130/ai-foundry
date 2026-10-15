# Phase 0：Windows + Chrome 人工验收指南

当前状态：**待人工执行，不能据本指南宣布通过**。本轮只做技术验收，不开发 P1–P8。以下每项应当由你亲自点击真实浏览器界面；不要运行脚本触发 action、伪造右键事件或在普通扩展标签页中代替原生 Side Panel。

## 当前更新：先加载0.0.2，验证跨休眠摘要

0.0.1读取已通过，但用户在摘要时遇到快照误失效；该版只将代次存于worker内存，后台休眠会丢失。当前0.0.2已改为session恢复。请在扩展卡片点重新加载，确认v0.0.2，回网页点A、重新读取后点Mock；成功后保持页面不变，关闭worker DevTools等待45秒，再点Mock。第二次不应仅因后台休眠而要求重读。真实导航/刷新后仍应重读，选区65秒仍应拒绝。

以下0.0.1说明是之前工具栏修复背景，实际执行应以0.0.2为准。

0.0.2也保留了0.0.1的工具栏修复：使用普通action回调打开侧栏，避免自动Side Panel action跳过activeTab授权。重复点图标应打开/保持侧栏，不依赖自动切换关闭。

## 1. 准备三个 PowerShell 窗口

需要已安装的 Google Chrome、Node 24.16.0（本轮实际版本）、npm 11.13.0、可选 Python。不要使用主仓库的 `.env`，不需要数据库、模型账号或 API Key。

三个终端都先执行：

```powershell
$spikeRoot = 'C:\Users\QYF\Desktop\AIFoundry\spikes\ai-browser-copilot-spike'
Set-Location -LiteralPath $spikeRoot
```

终端 A 用于构建、证据和启动 Chrome；B 运行 Mock API；C 托管本地测试页面。B/C 运行服务时不要关闭窗口；停止时在对应窗口按 Ctrl+C。**不要删除旧 Profile 或证据目录，也不要使用任何递归删除命令。**

终端 A：

```powershell
node --version
npm --version
npm run typecheck
npm test
npm run build
npm run zip
$manualStamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$evidenceRoot = Join-Path $spikeRoot "docs\artifacts\manual-$manualStamp"
New-Item -ItemType Directory -Path $evidenceRoot | Out-Null
Copy-Item -LiteralPath 'docs\manual-results-template.md' -Destination (Join-Path $evidenceRoot 'results.md')
Get-FileHash -Algorithm SHA256 -LiteralPath '.output\ai-browser-copilot-phase0-0.0.2-chrome.zip' |
    Format-List | Out-File (Join-Path $evidenceRoot 'zip-sha256.txt') -Encoding utf8
```

本轮已留存的交付 ZIP 是 `docs\artifacts\worker-lifecycle-fix\ai-browser-copilot-phase0-0.0.2-chrome.zip`。如使用 ZIP，请在**新的空目录**解压，只加载解压后包含 manifest.json 的文件夹，不直接加载 ZIP。自行重建的 ZIP 时间戳/压缩哈希可能不同，应记录实际哈希；不能冒用原报告哈希。

## 2. 新建隔离 Chrome Profile，加载最终扩展（SP-01）

终端 A：

```powershell
$chromeExe = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$manualProfile = Join-Path $spikeRoot ".runtime\manual-profile-$manualStamp"
& $chromeExe "--user-data-dir=$manualProfile" '--no-first-run' '--no-default-browser-check'
```

这是你用于操作的可见测试窗口；不需要远程调试或 unsafe 调试开关。不登录账号，不开启同步；若显示欢迎引导，选无需登录继续。不要把日常 Chrome 的配置目录传给上述命令。若 Chrome 安装路径不同，替换 `$chromeExe` 为实际路径。

1. 在该窗口地址栏输入 `chrome://version`，截图保存 `00-chrome-version.png`，在 results.md 记录版本。截图若含不想分享的本地路径，可遮挡；保留版本号。
2. 输入 `chrome://extensions`，打开右上角“开发者模式”。
3. 点击“加载已解压的扩展程序”，选择：
   `C:\Users\QYF\Desktop\AIFoundry\spikes\ai-browser-copilot-spike\.output\chrome-mv3`。
4. 应看到“AI 网页阅读与知识整理助手 · Phase 0”，版本 0.0.2，Service Worker 链接。卡片不应有加载错误或红色“错误”按钮。
5. 记录本次扩展 ID，保存 `01-extension-loaded.png`。不要假设与报告中的 ID 相同。

若出现报错：点击“错误”复制全文（文件路径、行号、堆栈），保存 `01-extension-errors.txt`；此项 FAIL，先停止成功链路测试。不要通过添加全站权限或关闭 Chrome 安全机制来消除错误。

## 3. 工具栏打开真实 Side Panel（SP-02）

1. 打开 `https://example.com/`，等待页面完整显示。
2. 点击地址栏右侧拼图图标，在列表中找到本扩展并点图钉固定。
3. **点击固定后的扩展图标**。应在浏览器侧面打开原生侧栏，页内能看到正式中文名称、Phase 0、扩展 ID 和三个按钮：
   “读取当前网页”“接收右键选区”“调用本机 Mock 摘要”。
4. 此时“调用本机 Mock 摘要”应为禁用状态。
5. 保存 `02-toolbar-sidepanel.png`，截图同时包含页面地址栏、扩展图标和原生侧栏。普通新标签页里打开 `chrome-extension://…/sidepanel.html` 不算本项通过。

若图标不响应，记录：是否仍存在 popup、侧栏是否出现在另一侧、扩展卡片的错误，以及 Service Worker Console。不要在 Console 调 `sidePanel.open()` 来替代点击结果。

## 4. 启动本机 Mock API（终端 B）

把下面的 `实际ID` 替换为本次 Chrome 卡片/侧栏显示的 32 位 ID，保留 `chrome-extension://` 前缀：

```powershell
$env:EXTENSION_ORIGIN='chrome-extension://实际ID'
$env:PROVIDER='mock'
npm run api
```

应输出 `Phase 0 Mock API listening on http://127.0.0.1:8787`。另开终端 A 执行：

```powershell
Invoke-RestMethod 'http://127.0.0.1:8787/health'
```

预期 `ok=True / provider=mock / phase=0`。**health200 只证明服务启动，不代表扩展权限或侧栏成功。**

若是 `EADDRINUSE`，先停止自己启动的旧 Mock/故障服务，不要盲目终止其他进程。若出现 Origin 配置错误，修正 ID 后重启 B。`.env.example` 不是自动加载的配置文件，必须执行上述环境变量赋值。

## 5. 当前页读取与 Mock 往返（SP-03、SP-08）

1. 保持 Example Domain 网页和真正侧栏同时可见。此前已亲自点击过该页工具栏图标。
2. 在侧栏点击“读取当前网页”。应显示“读取成功”、标题 Example Domain、URL `https://example.com/`、tabId/snapshotId 和实际可见正文。
3. 保存 `03-capture.png`。若仍出现“请点击工具栏…”提示，先确认侧栏显示v0.0.2；该修复尚待实际复验，请保存完整窗口与错误，不用反复点击掩盖失败。
4. 点击“调用本机 Mock 摘要”，应先显示请求中，随后显示“Mock 往返成功（未调用真实模型）”，下方含 `[MOCK]`、页面标题、正文前120字符和输入字符数。
5. 保存 `08-mock-roundtrip.png`，确认摘要所属标题/URL 与刚读的网页一致。

**最小网络权限说明：** 当前发布候选 manifest 仍无 host_permissions；真实 Chrome155 的扩展 worker 和扩展文档均已通过精确 CORS 访问127.0.0.1:8787。你应保持此配置验收真正侧栏，不新增全站权限。如当前 Chrome 出现本地网络权限提示，记录提示原文，由你决定是否允许该测试扩展访问本机；不要关闭浏览器安全功能。失败时按第11节收集 Origin、预检和错误。

## 6. 临时授权、跨源导航、内部页（SP-04、SP-11）

每个子项均记录实际结果，不将“用户重新点击图标后成功”记作“未经授权也成功”。

| 操作 | 预期结果 |
|---|---|
| 新开 `https://www.iana.org/help/example-domains`，**先不要点本扩展图标**，在保留的侧栏点读取 | 应提示授权/页面变化，不应返回 Example Domain 的旧正文。如果侧栏未保留，记录为未完成子项，不通过图标授权后冒充无授权测试 |
| 在 IANA 页亲自点扩展图标，再读取 | 应显示 IANA 当前标题、URL、正文 |
| 从已授权 Example 页的**同一个标签页地址栏**导航到 IANA，未重新点图标前读取 | 跨源授权应失效；不能静默读取或沿用旧快照。随后重新点图标授权应可恢复 |
| 新标签页 `chrome://newtab`、`chrome://version` | 提示不支持或重新授权，不显示历史正文，扩展不崩溃 |
| 打开 `https://chromewebstore.google.com/` 后读取 | 安全拒绝，不尝试用永久权限绕过限制 |

保存 `04-ungranted.png`、`04-cross-origin.png`、`11-internal.png`。若已对某个 tab 授权，切回来可能仍保留其同源授权，**这不算违规**；使用全新 tab 测无授权，不假定每次切 tab 都会撤销所有 grant。撤权测试可在测试 Profile 的扩展卡片停用再启用扩展，回到网页、未点击图标前尝试读取；真实结果应写入记录。

## 7. 两个 HTTPS 站点划词与有效期（SP-06、SP-07）

1. 在 Example Domain 拖选页面正文中的一小段，**在选中文字上右键**，选择“验证：发送选中文字到阅读侧栏”。必要时此操作会打开侧栏。
2. 点击侧栏“接收右键选区”。应看到刚选的文字，以及对应网页 URL/tabId；不是之前的快照或选区。保存 `06-selection-example.png`。
3. 再点一次“接收右键选区”，应出现 `NO_SELECTION`，旧选区消失（一次消费）。
4. 在同一窗口的 IANA 标签页选择不同文字并重复，保存 `06-selection-iana.png`；两个站点的选区、URL 和 tabId 必须对应各自发起页面。
5. 右键发送选区后等待至少 **65 秒**再接收，应拒绝过期选区。先不要消费，否则测到的只是一次消费。
6. 先发送一个有效选区，再点击网页空白处取消选择，在空白处右键选择同一菜单。接收应拒绝空选区，不能回退到之前有效文字。
7. 发送选区但不接收，切到另一个 tab 再切回；再次接收应拒绝。发送后按 Ctrl+R 刷新同一 URL 也应失效。
8. 发送后关闭发起 tab，在另一页接收，应无旧内容。另一个无关后台 tab 导航或关闭，不应清除当前页面仍有效的选区。

**超长、空页和表单 fixture（终端 C）：**

```powershell
python -m http.server 8001 --bind 127.0.0.1 --directory tests/fixtures
```

- 访问 `http://127.0.0.1:8001/long.html`，点图标授权并读取，应“已截断为6000字符”；在网页正文区域按 Ctrl+A 全选，右键发送，再接收应拒绝 >2000 字符选区。保存 `07-long-rejected.png`。
- `article-a.html` 读取应包含 ALPHA_SELECTION，不含隐藏的 `HIDDEN_SECRET_FIXTURE`、表单值 `PRIVATE_FORM_VALUE` 或导航；恶意指令测试句应只是文字。
- `empty.html` 授权读取应 `NO_CONTENT`。
- 可选在自己的 iframe fixture 内划词，本轮只支持顶层来源，应拒绝子框架选区。

没有 Python 时先完成真实 HTTPS 验收，将这些 fixture 子项标 BLOCKED，不用真实私密页面代替。两个 localhost origin 不能替代上面的两个真实 HTTPS 站点。

## 8. 异步隔离与可控故障（SP-05、SP-09）

终端 B 按 Ctrl+C 停止普通 API，保留 EXTENSION_ORIGIN，运行受控故障服务。所有模式仍只监听127.0.0.1，复用同一输入/来源边界，不调用模型。

| 模式与命令 | 在真正侧栏操作 | 预期 |
|---|---|---|
| 不运行服务 | 已授权读取后点 Mock | 快速出现 `API_ERROR`，按钮恢复，可重试 |
| `$env:SPIKE_FAULT='timeout'; npm run api:fault` | 点 Mock | 约1.8秒后 `API_ERROR：API_HTTP_504`，不无限等待 |
| `$env:SPIKE_FAULT='invalid-provider'; npm run api:fault` | 点 Mock | `API_ERROR：API_HTTP_502`；服务拒绝非法 Provider 输出，不能把它显示为成功摘要 |
| `$env:SPIKE_FAULT='delay'; npm run api:fault` | 点 Mock 后1秒内切到另一 tab，再切回；另做同 URL Ctrl+R | 旧摘要不能重新出现；需要重新读取页面。建议录屏而非只拍最终静态画面 |

每次换模式都先在 B 按 Ctrl+C，确保端口只由一个服务占用。

客户端2.5秒超时的详细操作见下方第8.1节。共享fetch客户端已有真实HTTP超时测试，不能冒充侧栏UI子项。

非法 JSON、错配 requestId/snapshotId、302跳转已由实际 HTTP 客户端测试覆盖；人工故障服务返回502演示的是**服务端拒绝非法 Provider**，不是声称侧栏收到了裸非法JSON。需要专门裸响应的 UI 证据时另行配置受控响应夹具，不能混写。

保存 `05-tab-race.mp4` 或连续截图、`09-offline.png`、`09-timeout.png`、`09-invalid-provider.png`。之后 B 恢复 `npm run api`，再次验证正常成功。

### 8.1 客户端2.5秒超时（仅限真正侧栏）

服务必须是普通Mock（当前代理已恢复npm run api，session60546），不能用服务端timeout/invalid-provider夹具代替。保持DevTools打开以维持限速设置，本项不测worker休眠。

1. 在扩展侧栏内部空白处右键→“检查/Inspect”，打开侧栏自己的开发者工具。在Network/网络面板保持No throttling/无限速，点一次侧栏Mock；确认请求列表中出现`http://127.0.0.1:8787/api/ai/summary`并正常成功。若没有请求，先确认检查对象为sidepanel.html，不能只对example.com网页限速就声称测了扩展。
2. 点开发者工具内齿轮Settings/设置，进入Throttling/节流，找到Network throttling profiles，Add profile/添加配置。名称Phase0-3000ms；Download和Upload各10000 Kbps；Latency/延迟3000 ms；其他参数保持默认。点Add保存，不配置CPU限速。
3. 关闭开发者工具内部Settings页，回到Network；在No throttling下拉选择Phase0-3000ms，确认已实际选中。配置创建和实际应用是两个步骤。方法与单位依据[Chrome官方说明](https://developer.chrome.com/docs/devtools/settings/throttling)。
4. 保持原网页不切tab、不刷新，点侧栏Mock。约2.5秒后应`API_TIMEOUT：请求已取消，可重试。`，按钮恢复，无成功摘要；再次点击应同样超时且按钮恢复。Network可能显示请求canceled/failed，保留profile及请求记录截图；不能把API_HTTP_504或Failed to fetch当成本项成功。
5. Network下拉改回No throttling/无限速，重新点Mock，应正常成功、旧错误消失、按钮恢复。截图保留取消限速后正常请求结果。完成后关闭开发者工具，防止影响后续worker/重启测试。
6. 如果没有相关控件、不能确认检查对象或未触发超时，保存实际界面/错误，标BLOCKED或FAIL并调查，不改扩展超时阈值、不关闭浏览器安全功能，也不使用脚本调用代替真正侧栏按钮。

## 9. 重开浏览器、worker 与第二个干净 Profile（SP-12）

1. 关闭所有这个独立 Profile 的 Chrome 窗口，保留 B/C 服务。用第2节同一 `$manualProfile` 命令重开。
2. 访问 HTTPS 页，亲自点图标打开侧栏、读取、Mock、划词；旧未消费选区不应在重开后自动出现。截图 `12-restart.png`。
3. worker 休眠：关闭 worker DevTools，等待约1分钟，再通过图标/右键使用；检查扩展可恢复。DevTools 打开可能使 worker 保持活动，不能据此声称测了休眠。
4. 在 `chrome://extensions` 点本扩展的重新加载按钮；回到网页重新打开侧栏并重新读取；重载前快照和选区不能继续当作有效结果。
5. 新建第二个路径，如 `.runtime\manual-profile-second-时间戳`，加载**同一最终包目录**，不复制旧 Profile。重新执行图标→读取→划词→Mock，保存第二组证据。目录相同通常得到相同扩展 ID，仍需实际核对；如 ID 变化，B 中改 EXTENSION_ORIGIN 并重启。

只有两轮都成功，才能填 SP-12 PASS。仅把依赖装到新目录、或仅重开同一个 Profile 都不足以通过该项。

## 10. 权限与包审查（SP-10）

打开 `.output\chrome-mv3\manifest.json` 或对交付 ZIP 运行审查脚本：

```powershell
python scripts/audit-package.py docs/artifacts/worker-lifecycle-fix
```

应只有 `activeTab / scripting / sidePanel / contextMenus / storage`；无永久 `host_permissions`、无全站 matches、无 popup 和常驻 content_scripts；CSP 的 connect-src 仅指向 `http://127.0.0.1:8787`。这是网络目的地限制，不会授予网页读取权限。代码只读注入回传纯文本，不允许网页向后台发任意执行请求。

## 11. 日志与失败取证

**Service Worker：** `chrome://extensions` → 本扩展卡片 → “Service Worker/检查视图” → Console，启用 Preserve log。复制红色错误的完整堆栈到 `worker-errors.txt`。测试休眠前关闭此窗口。

**真正侧栏：** 在侧栏内容空白处右键“检查”（菜单文案可能为 Inspect），确认 DevTools 的目标是本扩展 `sidepanel.html`，而不是网页。若没有该菜单，在扩展卡片的“检查视图”中查找已打开的 sidepanel。无法找到时记录缺失，不新开普通 sidepanel 标签页替代原生 UI。

- Console：开启 Preserve log，保存 `panel-errors.txt`。UI 上的 `API_ERROR` 状态也要截图。
- Network：开启 Preserve log，筛选 `127.0.0.1:8787`；点 summary 请求查看 Request URL、Method、Origin、Content-Type、Response status、Access-Control-Allow-Origin，必要时查看 OPTIONS。预检可能缓存，不要求每次都出现 OPTIONS。
- 正常 Origin 应是实际 `chrome-extension://ID`；`ORIGIN_DENIED` 多为 ID 配置不匹配。不同 Chrome 的真实行为必须记录，不能直接把服务改为接受任意 Origin。
- `ERR_CONNECTION_REFUSED`：检查 B 是否启动与端口；CSP 报错：核对是否加载了旧包；本地网络访问提示/策略拒绝：记录 Chrome 版本和原文，保持 BLOCKED，再调查。
- 可导出只含测试 fixture 的 HAR，保存本地；HAR 可能包含正文和环境路径，分享前检查。无需提交 API Key，所有测试均应 Mock。

每项证据记录：测试编号、时间、Chrome版本、扩展ID、包hash、发起tabId/URL、操作顺序、预期、实际、截图/日志文件、PASS/FAIL/BLOCKED。地址栏和侧栏来源一起截图，才能检查是否串页。没有执行填 BLOCKED，不留“默认通过”。

## 12. 收尾与判定

保存填好的 results.md 和证据，停止 B/C 服务；Chrome 测试 Profile 可保留。不要批量删除，不运行平台 seed/迁移，不更改课程发布状态。

你需要优先亲测：**图标打开侧栏 → 授权读取 → 两站点右键 → 侧栏 Mock → 未授权/跨源拒绝 → 重启和第二 Profile复验**。若任一关键项失败，提交操作与错误证据以便修复。按原任务书，SP-01/02/03/04/06/08/10/12 必须全PASS，且不能有跨页泄漏/密钥/全站权限问题才可 GO；当前仍 NO-GO。
