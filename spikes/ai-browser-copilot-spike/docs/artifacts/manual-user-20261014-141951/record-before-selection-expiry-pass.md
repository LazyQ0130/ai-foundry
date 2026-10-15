# Phase 0 当前验收记录

更新：2026-10-14 14:12（Asia/Shanghai）。**NO-GO，继续Phase 0，不进入P1–P8。**

工程当前修复版本0.0.2；Chrome155.0.8059.41、独立Profile及扩展ID `hijkflihajcoealnhjnepmgabohaimcn` 已由先前截图记录。Mock、SP-04及SP-11由用户文字确认；本次SP-06和SP-07一次消费子项新增四张v0.0.2侧栏截图及操作成功确认。没有新增Network记录或实际加载包hash。

| 编号 | 状态 | 实际结果与证据 |
|---|---|---|
| SP-01 加载MV3 | PASS | [扩展卡片截图](artifacts/manual-user-20261014-133518/01-extension-loaded.png)，首次0.0.0；后续0.0.1原生面板截图及当前版本复验过程另记 |
| SP-02 工具栏打开原生侧栏 | PASS | [完整窗口截图](artifacts/manual-user-20261014-133518/02-toolbar-sidepanel.png)与用户完成操作声明；普通action授权修复保留 |
| SP-03 授权后读取HTTPS | PASS | [0.0.1读取截图](artifacts/manual-user-20261014-134717/03-read-success.png)，标题、URL、tabId、snapshotId和正文对应 |
| SP-04 未授权/跨源撤权 | PASS | [用户四步文字确认](artifacts/manual-user-20261014-140449/user-confirmation.txt)：拒绝→成功→拒绝→成功；子项见下表 |
| SP-05 切tab后旧请求返回 | BLOCKED（待人工） | 确定性测试通过；真实延迟→切tab/A→B→A/同URL刷新待测 |
| SP-06 两站点原生划词 | PASS | [Example截图](artifacts/manual-user-20261014-141247/06-selection-example.png)、[IANA截图](artifacts/manual-user-20261014-141247/06-selection-iana.png)及用户操作确认；URL对应，tabId分别1183769424/1183769425 |
| SP-07 空/长/失效选区 | BLOCKED（待人工，部分通过） | 两站重复接收均NO_SELECTION，一次消费PASS；空/长/65秒/切tab/刷新/关tab等仍待测 |
| SP-08 原生侧栏Mock往返 | PASS | [用户明确文字确认](artifacts/manual-user-20261014-140054/user-confirmation.txt)：摘要成功，等45秒再点也成功；对应0.0.2复验指导 |
| SP-09 故障UI | BLOCKED（待人工） | 断服务、504、502、客户端超时恢复待测 |
| SP-10 当前包审查 | PASS（自动核验） | [0.0.2实际ZIP审查](artifacts/worker-lifecycle-fix/package-audit.json)：最小权限，无host权限；实际加载包hash尚待补录 |
| SP-11 内部页/禁止注入页 | PASS | [用户四步文字确认](artifacts/manual-user-20261014-140901/user-confirmation.txt)：三个受限页拒绝、普通页恢复成功，无旧正文/摘要残留 |
| SP-12 浏览器重启/第二Profile全复验 | BLOCKED（待人工） | 45秒空闲复测只是一项补充，不能代替完整浏览器重开和第二Profile |

当前：**8 PASS / 0未解决FAIL / 4 BLOCKED**。旧0.0.0授权失败、0.0.1快照误失效及修复证据均保留于[完整报告](evidence.md)。

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

## 当前进行：SP-07选区有效期与失效（第一组）

每个子项独立重新右键发送有效短选区，先不接收；完成指定动作后再接收。除65秒过期项外，其余动作和接收均应在60秒内完成，以区分失效原因。

| 子项 | 状态 | 操作与预期 |
|---|---|---|
| A 过期 | BLOCKED（待回传） | 发送后保持原标签页不刷新、不切换，等待至少65秒再接收；拒绝且无旧选区 |
| B 空选区覆盖 | BLOCKED（待回传） | 发送有效选区但不接收；点网页空白取消选择，在空白处右键发送同一菜单，再接收；拒绝，不能回退到有效旧文字 |
| C 切tab再切回 | BLOCKED（待回传） | 重新发送后切至另一标签页再切回接收；拒绝且无旧选区 |
| D 同URL刷新 | BLOCKED（待回传） | 重新发送后Ctrl+R，等待加载完成，必要时点击A恢复授权，再接收；拒绝且无旧选区 |

拒绝可能为NO_SELECTION或TAB_CHANGED，保留实际错误文字。若出现授权提示，尤其刷新子项，先点击A后再接收，才能确认旧选区真的失效。后续仍需超长选区、关闭发起tab及无关后台tab变化的隔离测试，不能仅凭本组将SP-07整项标PASS。

后续顺序：SP-07其余边界 → SP-05延迟竞态 → SP-09故障恢复 → SP-12浏览器重开和第二Profile。详细操作见[人工指南](manual-chrome-acceptance.md)。
