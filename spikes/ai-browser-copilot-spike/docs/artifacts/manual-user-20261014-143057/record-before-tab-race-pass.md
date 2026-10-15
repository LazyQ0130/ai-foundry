# Phase 0 当前验收记录

更新：2026-10-14 14:23（Asia/Shanghai）。**NO-GO，继续Phase 0，不进入P1–P8。**

工程当前修复版本0.0.2；Chrome155.0.8059.41、独立Profile及扩展ID `hijkflihajcoealnhjnepmgabohaimcn` 已由先前截图记录。Mock、SP-04及SP-11由用户文字确认；本次SP-06和SP-07一次消费子项新增四张v0.0.2侧栏截图及操作成功确认。SP-07两组八项均获用户文字确认；没有新增Chrome Network记录或实际加载包hash。

| 编号 | 状态 | 实际结果与证据 |
|---|---|---|
| SP-01 加载MV3 | PASS | [扩展卡片截图](artifacts/manual-user-20261014-133518/01-extension-loaded.png)，首次0.0.0；后续0.0.1原生面板截图及当前版本复验过程另记 |
| SP-02 工具栏打开原生侧栏 | PASS | [完整窗口截图](artifacts/manual-user-20261014-133518/02-toolbar-sidepanel.png)与用户完成操作声明；普通action授权修复保留 |
| SP-03 授权后读取HTTPS | PASS | [0.0.1读取截图](artifacts/manual-user-20261014-134717/03-read-success.png)，标题、URL、tabId、snapshotId和正文对应 |
| SP-04 未授权/跨源撤权 | PASS | [用户四步文字确认](artifacts/manual-user-20261014-140449/user-confirmation.txt)：拒绝→成功→拒绝→成功；子项见下表 |
| SP-05 切tab后旧请求返回 | BLOCKED（待人工） | 确定性测试通过；真实延迟→切tab/A→B→A/同URL刷新待测 |
| SP-06 两站点原生划词 | PASS | [Example截图](artifacts/manual-user-20261014-141247/06-selection-example.png)、[IANA截图](artifacts/manual-user-20261014-141247/06-selection-iana.png)及用户操作确认；URL对应，tabId分别1183769424/1183769425 |
| SP-07 空/长/失效选区 | PASS | 一次消费截图、两组文字确认覆盖过期/空覆盖/切tab/刷新/超长/关闭来源/后台关闭与加载隔离；[本组证据](artifacts/manual-user-20261014-142318/user-evidence.json) |
| SP-08 原生侧栏Mock往返 | PASS | [用户明确文字确认](artifacts/manual-user-20261014-140054/user-confirmation.txt)：摘要成功，等45秒再点也成功；对应0.0.2复验指导 |
| SP-09 故障UI | BLOCKED（待人工） | 断服务、504、502、客户端超时恢复待测 |
| SP-10 当前包审查 | PASS（自动核验） | [0.0.2实际ZIP审查](artifacts/worker-lifecycle-fix/package-audit.json)：最小权限，无host权限；实际加载包hash尚待补录 |
| SP-11 内部页/禁止注入页 | PASS | [用户四步文字确认](artifacts/manual-user-20261014-140901/user-confirmation.txt)：三个受限页拒绝、普通页恢复成功，无旧正文/摘要残留 |
| SP-12 浏览器重启/第二Profile全复验 | BLOCKED（待人工） | 45秒空闲复测只是一项补充，不能代替完整浏览器重开和第二Profile |

当前：**9 PASS / 0未解决FAIL / 3 BLOCKED**。旧0.0.0授权失败、0.0.1快照误失效及修复证据均保留于[完整报告](evidence.md)。

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

## 当前进行：SP-05异步请求与页面上下文隔离

代理已停止原普通Mock API（session25050），以同一精确EXTENSION_ORIGIN启动既有`SPIKE_FAULT=delay`服务（session26170）。真实HTTP200、约1200ms延迟、请求ID匹配、精确CORS及错误Origin403检查见[延迟API证据](artifacts/manual-user-20261014-142318/delay-api-http-check.json)。仅127.0.0.1:8787、Mock，无新增扩展权限或产品功能；HTTP检查不是Chrome原生验收。

测试窗口只保留两个测试tab：A为Example，B为IANA，避免快捷键切至其他页面。切页前先在B点扩展A图标使侧栏可用，再回到Example；每次测试重新点击扩展A、读取页面，见“正在请求”后立即操作。先做一次不切页的控制调用确认正常成功。delay约1.2秒，动作需在返回前完成；若已成功后才切页，应重做。建议录屏，保留可判断“请求中→切换/刷新→等待无旧结果”的顺序。

| 子项 | 状态 | 操作与预期 |
|---|---|---|
| 0 不变化页面的控制调用 | BLOCKED（待回传） | 重新读取Example后点Mock，保持页面不变；约1.2秒后正常成功 |
| 1 请求中A切B并停留 | BLOCKED（待回传） | Example点Mock，正在请求时立即Ctrl+Tab切IANA；等3秒后仍无Example旧正文/摘要；切回Example也无旧结果 |
| 2 请求中A→B→A | BLOCKED（待回传） | Example重新授权读取点Mock，正在请求时快速Ctrl+Tab再Ctrl+Shift+Tab返回；等3秒，旧正文/摘要不恢复，需要重读 |
| 3 请求中同URL刷新 | BLOCKED（待回传） | Example重新授权读取点Mock，正在请求时立即点击左侧网页空白处再按Ctrl+R，确认刷新的是网页、URL不变；加载完等3秒，无旧正文/摘要，需要重读 |
| 4 恢复 | BLOCKED（待回传） | 当前页点击扩展A、重新读取并调用Mock，不切页；正常成功 |

没有新增上述原生验收证据前SP-05保持BLOCKED。服务当前保留delay模式，便于用户执行；之后故障UI测试再切换，最终恢复普通Mock API。

后续顺序：SP-05完成后 → SP-09故障恢复 → SP-12浏览器重开和第二Profile。详细操作见[人工指南](manual-chrome-acceptance.md)。
