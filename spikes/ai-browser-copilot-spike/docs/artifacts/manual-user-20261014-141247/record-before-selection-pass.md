# Phase 0 当前验收记录

更新：2026-10-14 14:09（Asia/Shanghai）。**NO-GO，继续Phase 0，不进入P1–P8。**

工程当前修复版本0.0.2；Chrome155.0.8059.41、独立Profile及扩展ID `hijkflihajcoealnhjnepmgabohaimcn` 已由先前截图记录。本次Mock、SP-04及SP-11结果由用户文字确认，无新增截图/Network记录或实际加载包hash；不把这些缺失材料伪装成已有证据。

| 编号 | 状态 | 实际结果与证据 |
|---|---|---|
| SP-01 加载MV3 | PASS | [扩展卡片截图](artifacts/manual-user-20261014-133518/01-extension-loaded.png)，首次0.0.0；后续0.0.1原生面板截图及当前版本复验过程另记 |
| SP-02 工具栏打开原生侧栏 | PASS | [完整窗口截图](artifacts/manual-user-20261014-133518/02-toolbar-sidepanel.png)与用户完成操作声明；普通action授权修复保留 |
| SP-03 授权后读取HTTPS | PASS | [0.0.1读取截图](artifacts/manual-user-20261014-134717/03-read-success.png)，标题、URL、tabId、snapshotId和正文对应 |
| SP-04 未授权/跨源撤权 | PASS | [用户四步文字确认](artifacts/manual-user-20261014-140449/user-confirmation.txt)：拒绝→成功→拒绝→成功；子项见下表 |
| SP-05 切tab后旧请求返回 | BLOCKED（待人工） | 确定性测试通过；真实延迟→切tab/A→B→A/同URL刷新待测 |
| SP-06 两站点原生划词 | BLOCKED（待人工） | Example与IANA的真实右键及来源归属待测 |
| SP-07 空/长/失效选区 | BLOCKED（待人工） | 空选区、>2000字符、65秒、一次消费、切tab/刷新/关tab待测 |
| SP-08 原生侧栏Mock往返 | PASS | [用户明确文字确认](artifacts/manual-user-20261014-140054/user-confirmation.txt)：摘要成功，等45秒再点也成功；对应0.0.2复验指导 |
| SP-09 故障UI | BLOCKED（待人工） | 断服务、504、502、客户端超时恢复待测 |
| SP-10 当前包审查 | PASS（自动核验） | [0.0.2实际ZIP审查](artifacts/worker-lifecycle-fix/package-audit.json)：最小权限，无host权限；实际加载包hash尚待补录 |
| SP-11 内部页/禁止注入页 | PASS | [用户四步文字确认](artifacts/manual-user-20261014-140901/user-confirmation.txt)：三个受限页拒绝、普通页恢复成功，无旧正文/摘要残留 |
| SP-12 浏览器重启/第二Profile全复验 | BLOCKED（待人工） | 45秒空闲复测只是一项补充，不能代替完整浏览器重开和第二Profile |

当前：**7 PASS / 0未解决FAIL / 5 BLOCKED**。旧0.0.0授权失败、0.0.1快照误失效及修复证据均保留于[完整报告](evidence.md)。

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

## 当前进行：SP-06两站点右键划词，附SP-07一次消费子项

在同一Chrome窗口保留两个不同标签页。每次右键发送后60秒内接收，期间不切换标签页、不刷新。

| 子项 | 状态 | 预期结果 |
|---|---|---|
| 1 Example页面短选区，原生右键发送后在侧栏接收 | BLOCKED（待回传） | 选中文字完全一致、URL为example.com，记录tabId |
| 2 不重新发送，再次接收Example选区 | BLOCKED（待回传） | NO_SELECTION，旧选区消失（SP-07子项） |
| 3 同窗口另一IANA标签页，不同短选区右键发送后接收 | BLOCKED（待回传） | 文字属于IANA、URL为当前IANA页，tabId与Example不同 |
| 4 不重新发送，再次接收IANA选区 | BLOCKED（待回传） | NO_SELECTION，旧选区消失（SP-07子项） |

菜单名称为“验证：发送选中文字到阅读侧栏”，接收按钮为“接收右键选区”。成功时建议保存06-selection-example.png和06-selection-iana.png。菜单缺失或来源/文字错误应记录具体异常，不能按成功处理。SP-07仍须另测空/长/过期选区、切tab/刷新/关闭等；本组不代表SP-07整项通过。

后续顺序：SP-06两站点选区 → SP-07选区边界与有效期 → SP-05延迟竞态 → SP-09故障恢复 → SP-12浏览器重开和第二Profile。详细操作见[人工指南](manual-chrome-acceptance.md)。
