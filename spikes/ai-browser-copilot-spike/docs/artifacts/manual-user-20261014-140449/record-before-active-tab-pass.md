# Phase 0 当前验收记录

更新：2026-10-14 14:00（Asia/Shanghai）。**NO-GO，继续Phase 0，不进入P1–P8。**

工程当前修复版本0.0.2；Chrome155.0.8059.41、独立Profile及扩展ID `hijkflihajcoealnhjnepmgabohaimcn` 已由先前截图记录。本次Mock成功由用户文字确认，无新增截图/Network记录或实际加载包hash；不把这些缺失材料伪装成已有证据。

| 编号 | 状态 | 实际结果与证据 |
|---|---|---|
| SP-01 加载MV3 | PASS | [扩展卡片截图](artifacts/manual-user-20261014-133518/01-extension-loaded.png)，首次0.0.0；后续0.0.1原生面板截图及当前版本复验过程另记 |
| SP-02 工具栏打开原生侧栏 | PASS | [完整窗口截图](artifacts/manual-user-20261014-133518/02-toolbar-sidepanel.png)与用户完成操作声明；普通action授权修复保留 |
| SP-03 授权后读取HTTPS | PASS | [0.0.1读取截图](artifacts/manual-user-20261014-134717/03-read-success.png)，标题、URL、tabId、snapshotId和正文对应 |
| SP-04 未授权/跨源撤权 | BLOCKED（待人工） | 当前下一组；子项见下表 |
| SP-05 切tab后旧请求返回 | BLOCKED（待人工） | 确定性测试通过；真实延迟→切tab/A→B→A/同URL刷新待测 |
| SP-06 两站点原生划词 | BLOCKED（待人工） | Example与IANA的真实右键及来源归属待测 |
| SP-07 空/长/失效选区 | BLOCKED（待人工） | 空选区、>2000字符、65秒、一次消费、切tab/刷新/关tab待测 |
| SP-08 原生侧栏Mock往返 | PASS | [用户明确文字确认](artifacts/manual-user-20261014-140054/user-confirmation.txt)：摘要成功，等45秒再点也成功；对应0.0.2复验指导 |
| SP-09 故障UI | BLOCKED（待人工） | 断服务、504、502、客户端超时恢复待测 |
| SP-10 当前包审查 | PASS（自动核验） | [0.0.2实际ZIP审查](artifacts/worker-lifecycle-fix/package-audit.json)：最小权限，无host权限；实际加载包hash尚待补录 |
| SP-11 内部页/禁止注入页 | BLOCKED（待人工） | chrome://version、新标签页、Web Store待测 |
| SP-12 浏览器重启/第二Profile全复验 | BLOCKED（待人工） | 45秒空闲复测只是一项补充，不能代替完整浏览器重开和第二Profile |

当前：**5 PASS / 0未解决FAIL / 7 BLOCKED**。旧0.0.0授权失败、0.0.1快照误失效及修复证据均保留于[完整报告](evidence.md)。

## 补充：45秒空闲后再次调用

PASS（用户人工文字确认）。只记录用户完成的等待与再次成功，不由45秒时长单独断言生产worker确实终止；真实worker停止/恢复的夹具证据见[生命周期对照](artifacts/worker-lifecycle-fix/chrome-lifecycle-probe.json)。

## 当前进行：SP-04

| 子项 | 状态 | 期望/待填结果 |
|---|---|---|
| A 全新IANA标签页，未点击A图标，直接读取 | BLOCKED（待回传） | 提示授权，不显示旧Example正文或摘要 |
| B 同一IANA标签页点击A后读取与Mock | BLOCKED（待回传） | 成功，来源为IANA当前页 |
| C 在该已授权IANA标签页地址栏跨源导航到example.com，未重新点击A就读取 | BLOCKED（待回传） | 再次拒绝，不能复用原IANA授权或旧结果；不要切回原有Example标签页代替此项 |
| D 在C当前页重新点击A后读取 | BLOCKED（待回传） | 恢复成功，来源为example.com |

每个子项按用户实际回传更新；异常保存完整窗口/状态文字。未测试不记PASS，已授权的旧tab不用于冒充未授权测试。

后续顺序：SP-11受限页 → SP-06/07选区 → SP-05延迟竞态 → SP-09故障恢复 → SP-12浏览器重开和第二Profile。详细操作见[人工指南](manual-chrome-acceptance.md)。
