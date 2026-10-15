# Phase 0 当前验收记录

更新：2026-10-14 14:55（Asia/Shanghai）。**NO-GO，继续Phase 0，不进入P1–P8。**

工程当前修复版本0.0.2；Chrome155.0.8059.41、独立Profile及扩展ID `hijkflihajcoealnhjnepmgabohaimcn` 已由先前截图记录。Mock、SP-04及SP-11由用户文字确认；本次SP-06和SP-07一次消费子项新增四张v0.0.2侧栏截图及操作成功确认。SP-07两组八项、SP-05四项均获用户文字确认；SP-09的504/重试有截图与用户文字确认，502状态与可用按钮另有截图；新增Network列表截图（summary200/preflight204），未提供Headers/HAR；当前Profile配置指向的磁盘加载目录已与归档ZIP逐文件核对一致，见最新包证据。

| 编号 | 状态 | 实际结果与证据 |
|---|---|---|
| SP-01 加载MV3 | PASS | [扩展卡片截图](artifacts/manual-user-20261014-133518/01-extension-loaded.png)，首次0.0.0；后续0.0.1原生面板截图及当前版本复验过程另记 |
| SP-02 工具栏打开原生侧栏 | PASS | [完整窗口截图](artifacts/manual-user-20261014-133518/02-toolbar-sidepanel.png)与用户完成操作声明；普通action授权修复保留 |
| SP-03 授权后读取HTTPS | PASS | [0.0.1读取截图](artifacts/manual-user-20261014-134717/03-read-success.png)，标题、URL、tabId、snapshotId和正文对应 |
| SP-04 未授权/跨源撤权 | PASS | [用户四步文字确认](artifacts/manual-user-20261014-140449/user-confirmation.txt)：拒绝→成功→拒绝→成功；子项见下表 |
| SP-05 切tab后旧请求返回 | PASS | [用户四项确认](artifacts/manual-user-20261014-143057/user-confirmation.txt)：切tab、A→B→A、同URL刷新隔离正常，重新读取后恢复成功 |
| SP-06 两站点原生划词 | PASS | [Example截图](artifacts/manual-user-20261014-141247/06-selection-example.png)、[IANA截图](artifacts/manual-user-20261014-141247/06-selection-iana.png)及用户操作确认；URL对应，tabId分别1183769424/1183769425 |
| SP-07 空/长/失效选区 | PASS | 一次消费截图、两组文字确认覆盖过期/空覆盖/切tab/刷新/超长/关闭来源/后台关闭与加载隔离；[本组证据](artifacts/manual-user-20261014-142318/user-evidence.json) |
| SP-08 原生侧栏Mock往返 | PASS | [用户明确文字确认](artifacts/manual-user-20261014-140054/user-confirmation.txt)：摘要成功，等45秒再点也成功；对应0.0.2复验指导 |
| SP-09 故障UI | PASS | 504/502、断服务及重试、普通恢复均有人工证据；[客户端限速超时/重试/取消限速恢复文字确认](artifacts/manual-user-20261014-145526/user-evidence.json)通过 |
| SP-10 当前包审查 | PASS（自动核验） | 0.0.2 ZIP最小权限审查；[当前Profile磁盘目录与ZIP五文件一致](artifacts/manual-user-20261014-145526/current-profile-package-check.json)，不声称内存字节核验 |
| SP-11 内部页/禁止注入页 | PASS | [用户四步文字确认](artifacts/manual-user-20261014-140901/user-confirmation.txt)：三个受限页拒绝、普通页恢复成功，无旧正文/摘要残留 |
| SP-12 浏览器重启/第二Profile全复验 | BLOCKED（待人工） | 45秒空闲复测只是一项补充，不能代替完整浏览器重开和第二Profile |

当前：**11 PASS / 0未解决FAIL / 1 BLOCKED**。旧0.0.0授权失败、0.0.1快照误失效及修复证据均保留于[完整报告](evidence.md)。

## 补充：45秒空闲后再次调用

PASS（用户人工文字确认）。只记录用户完成的等待与再次成功，不由45秒时长单独断言生产worker确实终止；真实worker停止/恢复的夹具证据见[生命周期对照](artifacts/worker-lifecycle-fix/chrome-lifecycle-probe.json)。

## 已完成：SP-04

证据：[原始文字](artifacts/manual-user-20261014-140449/user-confirmation.txt)、[结构化记录](artifacts/manual-user-20261014-140449/user-evidence.json)。按此前四步指导对应编号；没有新增截图或Network日志。

| 子项 | 状态 | 实际回传 |
|---|---|---|
| A 全新IANA标签页，未点击A图标，直接读取 | PASS | 1拒绝 |
| B 同一IANA标签页点击A后读取与Mock | PASS | 2成功 |
| C 在该已授权IANA标签页地址栏跨源导航到example.com，未重新点击A就读取 | PASS | 3拒绝 |
| D 在C当前页重新点击A后读取 | PASS | 4成功 |

## 已完成：SP-11受限页面

证据：[原始文字](artifacts/manual-user-20261014-140901/user-confirmation.txt)、[结构化记录](artifacts/manual-user-20261014-140901/user-evidence.json)。按此前四步指导对应编号；无新增截图或日志。

| 子项 | 状态 | 实际回传 |
|---|---|---|
| A chrome://version | PASS | 1拒绝 |
| B Chrome新标签页 | PASS | 2拒绝 |
| C Chrome Web Store | PASS | 3拒绝 |
| D 回到example.com点击A后重新读取与Mock | PASS | 4成功 |

用户同时明确确认：没有旧正文或摘要残留。

## 已完成：SP-06及SP-07一次消费子项

用户回传“结果如图，成功”，四张截图按此前指导顺序原样归档，SHA256记录于[user-evidence.json](artifacts/manual-user-20261014-141247/user-evidence.json)。截图为侧栏局部，原生右键步骤依用户操作确认，不虚构菜单展开截图或整窗录屏。

| 子项 | 状态 | 实际结果与证据 |
|---|---|---|
| 1 Example短选区右键发送后接收 | PASS | [截图](artifacts/manual-user-20261014-141247/06-selection-example.png)：中文短选区；https://example.com/；tabId=1183769424 |
| 2 再次接收Example选区 | PASS（SP-07子项） | [截图](artifacts/manual-user-20261014-141247/07-consumed-example.png)：NO_SELECTION，无旧选区 |
| 3 另一IANA标签页不同选区右键发送后接收 | PASS | [截图](artifacts/manual-user-20261014-141247/06-selection-iana.png)：英文段落；https://www.iana.org/help/example-domains；tabId=1183769425 |
| 4 再次接收IANA选区 | PASS（SP-07子项） | [截图](artifacts/manual-user-20261014-141247/07-consumed-iana.png)：NO_SELECTION，无旧选区 |

## 已完成：SP-07选区有效期与失效（第一组）

用户按此前指导确认四项均拒绝、均无旧选中文字残留。[原始文字](artifacts/manual-user-20261014-141951/user-confirmation.txt)及[结构化记录](artifacts/manual-user-20261014-141951/user-evidence.json)归档；没有新增截图、计时录屏或确切错误码。

| 子项 | 状态 | 实际回传 |
|---|---|---|
| A 发送后原页等待至少65秒再接收 | PASS（人工文字） | 1拒绝，无旧选中文字残留 |
| B 有效选区后发送空选区覆盖再接收 | PASS（人工文字） | 2拒绝，无旧选中文字残留 |
| C 发送后切tab再切回接收 | PASS（人工文字） | 3拒绝，无旧选中文字残留 |
| D 发送后同URL刷新、点击A后再接收 | PASS（人工文字） | 4拒绝，无旧选中文字残留 |

## 已完成：SP-07剩余边界与隔离（第二组）

本地既有fixture服务已由代理启动：`http://127.0.0.1:8001/long.html`，仅监听127.0.0.1、只托管tests/fixtures。供页HTTP200、正文段落长度及hash见[HTTP检查](artifacts/manual-user-20261014-141951/fixture-http-check.json)。这只证明测试页可访问，不代表任何Chrome操作通过。服务exec session=33538，保留运行供用户验收。

| 子项 | 状态 | 操作与预期 |
|---|---|---|
| 1 长正文截断和超长选区 | PASS（人工文字） | 截断正常、选区拒绝 |
| 2 关闭发起tab | PASS（人工文字） | 拒绝 |
| 3 关闭无关后台tab | PASS（人工文字） | 成功 |
| 4 无关后台tab新导航 | PASS（人工文字） | 成功 |

用户确认没有文字或来源异常。[原始回传](artifacts/manual-user-20261014-142318/user-confirmation.txt)与[结构化记录](artifacts/manual-user-20261014-142318/user-evidence.json)保留；无新增截图或录屏。连同先前一次消费及第一组，SP-07本轮矩阵所需子项均PASS。可选iframe人工子项未执行，不伪装已通过。

## 已完成：SP-05异步请求与页面上下文隔离

代理已停止原普通Mock API（session25050），以同一精确EXTENSION_ORIGIN启动既有`SPIKE_FAULT=delay`服务（session26170）。真实HTTP200、约1200ms延迟、请求ID匹配、精确CORS及错误Origin403检查见[延迟API证据](artifacts/manual-user-20261014-142318/delay-api-http-check.json)。仅127.0.0.1:8787、Mock，无新增扩展权限或产品功能；HTTP检查不是Chrome原生验收。

测试窗口只保留两个测试tab：A为Example，B为IANA，避免快捷键切至其他页面。切页前先在B点扩展A图标使侧栏可用，再回到Example；每次测试重新点击扩展A、读取页面，见“正在请求”后立即操作。先做一次不切页的控制调用确认正常成功。delay约1.2秒，动作需在返回前完成；若已成功后才切页，应重做。建议录屏，保留可判断“请求中→切换/刷新→等待无旧结果”的顺序。

| 子项 | 状态 | 操作与预期 |
|---|---|---|
| 0 测试前不变化页面的控制调用 | 未单独回传（补充项） | 不推断已完成；第4项恢复成功已确认不切页正常调用 |
| 1 请求中A切B并停留后返回 | PASS（人工文字） | 1隔离正常 |
| 2 请求中A→B→A | PASS（人工文字） | 2隔离正常 |
| 3 请求中同URL刷新 | PASS（人工文字） | 3隔离正常 |
| 4 重新读取后恢复 | PASS（人工文字） | 4恢复成功 |

[原始回传](artifacts/manual-user-20261014-143057/user-confirmation.txt)、[结构化记录](artifacts/manual-user-20261014-143057/user-evidence.json)已归档；无新增录屏、精确切换耗时或Network时序。按用户对上轮操作四项的明确确认记SP-05 PASS，不将文字伪装成已有录屏或工具自动操作。

## 已完成：SP-09故障UI

代理已停止delay服务（session26170），启动既有`SPIKE_FAULT=timeout`服务（session47091），精确扩展Origin、仅127.0.0.1:8787、Mock。真实HTTP返回504/PROVIDER_TIMEOUT及随后health200见[HTTP证据](artifacts/manual-user-20261014-143057/timeout-api-http-check.json)；当时该结果只证明HTTP；随后用户已补齐504侧栏UI截图及两次重试确认。普通Mock将在故障组完成后恢复。

| 子项 | 状态 | 当前指导/预期 |
|---|---|---|
| A 服务端超时504及重试 | PASS | [截图](artifacts/manual-user-20261014-143413/09-server-timeout-504.png)及[用户文字](artifacts/manual-user-20261014-143413/user-confirmation.txt)：两次API_HTTP_504，按钮均恢复，无成功摘要、无一直加载 |
| B1 非法Provider输出502提示 | PASS（截图） | [截图](artifacts/manual-user-20261014-143754/09-invalid-provider-502.png)：API_ERROR：API_HTTP_502、Mock按钮可用，截图中无成功摘要 |
| B2 502重复调用与恢复 | PASS（人工文字） | [用户后续确认](artifacts/manual-user-20261014-143902/user-evidence.json)：再次502、按钮恢复、无成功摘要或持续加载 |
| C1 断服务错误提示/重试 | PASS（人工文字） | [原始回传](artifacts/manual-user-20261014-144122/user-confirmation.txt)：两次Failed to fetch，按钮均恢复，无成功摘要/持续加载 |
| C2 普通Mock恢复 | PASS（人工文字） | [用户确认](artifacts/manual-user-20261014-144356/user-confirmation.txt)：Mock往返成功、摘要正常、旧错误消失、按钮恢复 |
| D0 正常网络基线 | PASS（截图） | [Network截图](artifacts/manual-user-20261014-144851/09-network-no-throttling-baseline.png)：No throttling、summary fetch200/preflight204、Initiator为sidepanel脚本；完整URL与Headers未展开 |
| D1 客户端2.5秒超时及恢复 | PASS（人工文字） | [用户按具体步骤确认完成且符合预期](artifacts/manual-user-20261014-145526/user-evidence.json)：两次API_TIMEOUT、按钮恢复，取消限速后成功；无新增截图/时序 |

504截图原样归档，hash及证据范围见[结构化记录](artifacts/manual-user-20261014-143413/user-evidence.json)。一张截图不独立证明两次重试；两次结果依用户明确文字确认。

下一项502服务已生效：旧timeout session47091停止后启动invalid-provider，工具返回中断后独立确认本spike监听PID22092，并完成两次HTTP502/INVALID_PROVIDER_RESPONSE及health200检查，见[HTTP证据](artifacts/manual-user-20261014-143413/invalid-provider-http-check.json)。没有重复启动进程，当前仅127.0.0.1:8787、精确扩展Origin、Mock。该模式是服务端拒绝非法Provider输出，再向侧栏返回HTTP502；不声称侧栏收到裸非法JSON。SP-09剩余原生子项继续BLOCKED。

最新502截图已原样归档，hash和证据范围见[结构化记录](artifacts/manual-user-20261014-143754/user-evidence.json)。用户随后对502重试明确回复“确认”，[原始文字](artifacts/manual-user-20261014-143902/user-confirmation.txt)及对应上下文已记录，B2现PASS。

断服务历史准备：核验后仅停止本spike的fault listener PID22092，[端口连接失败与health拒绝连接](artifacts/manual-user-20261014-143902/offline-api-check.json)保留；随后用户已明确确认C1通过，见[结构化记录](artifacts/manual-user-20261014-144122/user-evidence.json)。

当前服务状态：代理已重启普通Mock（npm run api，session60546），仅127.0.0.1:8787，原精确扩展Origin；[health200及实际摘要HTTP200](artifacts/manual-user-20261014-144122/normal-mock-recovery-http-check.json)已确认。当时HTTP检查不能替代用户C2恢复验收；用户随后按同页直接重试指导确认恢复，见[结构化记录](artifacts/manual-user-20261014-144356/user-evidence.json)，C2现PASS。8001静态fixture服务未动。

用户先前回传正常Network基线，[原始文字及证据范围](artifacts/manual-user-20261014-144851/user-evidence.json)保留；随后按3000ms设置、重试、取消限速恢复指导明确确认已完成且符合预期，SP-09现PASS。

D项已完成，原操作流程见[指南第8.1节](manual-chrome-acceptance.md#81-客户端25秒超时仅限真正侧栏)。需在侧栏内部右键检查，先在Network看见127.0.0.1:8787/api/ai/summary请求，以确认开发者工具确实检查侧栏；开发者工具Settings→Throttling新增Phase0-3000ms，下载/上传10000 Kbps、Latency 3000 ms；返回Network选该profile，保持页面不变两次调用Mock均应API_TIMEOUT且按钮恢复、无成功摘要。随后切回No throttling再调用应成功，完成后关闭开发者工具。控件不存在或结果不同则保留原文/截图，不用504或断服务代替。当前普通Mock服务保持不变（session60546）。

## 当前进行：SP-12完整退出/重开、扩展重载与第二Profile

普通Mock API session60546及fixture服务8001仍正常，[服务检查](artifacts/manual-user-20261014-145526/services-before-restart-check.json)保留。当前Profile为`.runtime/manual-profile-20261014-132426`；只读目标扩展配置确认其加载`.output/chrome-mv3`，manifest为0.0.2，与归档0.0.2 ZIP五个文件逐字节一致，[路径/hash证据](artifacts/manual-user-20261014-145526/current-profile-package-check.json)保留，不声称内存字节核验。第二Profile应使用这个同一磁盘目录。

| 子项 | 状态 | 操作与验收范围 |
|---|---|---|
| A 同Profile完整退出再重开 | BLOCKED（准备关闭） | 先恢复No throttling并关闭所有DevTools；Example发送短选区但不消费；关闭该测试Profile所有Chrome窗口；回传“已关闭，选区未接收”，代理只读核验该Profile进程已退出后再指导重开；重开后旧快照/未消费选区不应恢复，工具栏→重新读取→Mock→新划词均应成功 |
| B 正常空闲后的可用性 | BLOCKED（待人工） | 关闭DevTools后约1分钟，再通过图标/右键使用应恢复；不以等待时间单独断言worker已终止，生命周期fixture另有真实stopWorker证据 |
| C 扩展重新加载 | BLOCKED（待人工） | chrome://extensions重新加载0.0.2，旧快照/选区不继续使用，重新授权读取/Mock/划词恢复 |
| D 第二个全新Profile | BLOCKED（待人工） | 新目录、不复制旧配置，加载同一最终磁盘目录，核对ID后执行原生侧栏→读取→划词→Mock；如ID变化只调整本地API的精确Origin后重启 |

当前只引导A的退出准备；尚未宣称任何完整重启或第二Profile子项通过。不删除任何Profile/证据目录，不自动进入P1–P8。
