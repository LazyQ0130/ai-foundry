# Phase 0 最终人工验收记录

更新：2026-10-14（Asia/Shanghai），最后一次合并实测用户确认于15:29回传。

**12 PASS / 0 FAIL / 0 BLOCKED；Phase0技术闸门GO；未发布，未进入P1–P8。** 状态限于Windows + Chrome155 + 0.0.2 + 本机Mock。完整结论及能力边界见[最终报告](evidence.md)。

| 编号 | 场景 | 状态 | 实际结果 | 证据 |
|---|---|---|---|---|
| SP-01 | 干净环境加载MV3 | PASS | 初始独立Profile加载截图；最终0.0.2在另一新Profile的安装配置及人工确认补齐。 | [加载截图](artifacts/manual-user-20261014-133518/01-extension-loaded.png)；[最终Profile包核对](artifacts/phase0-final-20261014-152950/final-profile-package-check.json) |
| SP-02 | 工具栏打开原生Side Panel | PASS | 真实窗口截图显示工具栏与原生侧栏；新Profile再次由用户执行。 | [原生侧栏截图](artifacts/manual-user-20261014-133518/02-toolbar-sidepanel.png)；[本次人工确认](artifacts/phase0-final-20261014-152950/user-evidence.json) |
| SP-03 | 授权后读取HTTPS网页 | PASS | 标题、URL、正文对应当前页；0.0.1读取截图与0.0.2重开/新Profile确认。 | [读取截图](artifacts/manual-user-20261014-134717/03-read-success.png)；[重开记录](artifacts/manual-user-20261014-150317/user-evidence.json) |
| SP-04 | 未授权/跨源撤权 | PASS | 新tab拒绝→点击A成功→同tab跨源后拒绝→重新授权成功。 | [四步文字确认](artifacts/manual-user-20261014-140449/user-evidence.json) |
| SP-05 | 请求中切tab/旧结果隔离 | PASS | 请求中切tab、A→B→A、同URL刷新均无旧结果恢复；重读后正常。 | [四项文字确认](artifacts/manual-user-20261014-143057/user-evidence.json)；[延迟HTTP](artifacts/manual-user-20261014-142318/delay-api-http-check.json) |
| SP-06 | 两个HTTPS站点右键划词 | PASS | Example与IANA选区正确，URL及不同tabId各自对应。 | [Example截图](artifacts/manual-user-20261014-141247/06-selection-example.png)；[IANA截图](artifacts/manual-user-20261014-141247/06-selection-iana.png) |
| SP-07 | 空/长/过期/失效选区 | PASS | 一次消费、65秒、空覆盖、切tab/刷新/关闭来源、超长拒绝与无关后台tab隔离通过。 | [一次消费截图](artifacts/manual-user-20261014-141247/07-consumed-example.png)；[有效期记录](artifacts/manual-user-20261014-141951/user-evidence.json)；[边界记录](artifacts/manual-user-20261014-142318/user-evidence.json) |
| SP-08 | 侧栏Mock真实往返 | PASS | 用户明确确认摘要成功；正常Network fetch200/preflight204；重启后仍可用。 | [Mock文字确认](artifacts/manual-user-20261014-140054/user-evidence.json)；[Network截图](artifacts/manual-user-20261014-144851/09-network-no-throttling-baseline.png) |
| SP-09 | API故障提示/重试/恢复 | PASS | 504、502、断服务Failed to fetch、客户端超时均反馈且按钮恢复；普通服务/取消限速后成功。 | [504截图](artifacts/manual-user-20261014-143413/09-server-timeout-504.png)；[502截图](artifacts/manual-user-20261014-143754/09-invalid-provider-502.png)；[超时恢复确认](artifacts/manual-user-20261014-145526/user-evidence.json) |
| SP-10 | manifest与打包审查 | PASS | 5个必要权限、无host_permissions/常驻content_scripts/popup；包中无.env/API源文件，启发式密钥扫描无命中；5个运行文件一致。 | [包审查](artifacts/worker-lifecycle-fix/package-audit.json)；[最终逐文件核对](artifacts/phase0-final-20261014-152950/final-profile-package-check.json) |
| SP-11 | 内部页/禁止注入页 | PASS | chrome://version、新标签页、Web Store拒绝；普通页恢复，无旧正文/摘要。 | [四步文字确认](artifacts/manual-user-20261014-140901/user-evidence.json) |
| SP-12 | 重开/空闲/重载/干净Profile | PASS | 完整退出和重开已核验，空闲可用；本次新Profile安装来源与实际操作补齐重载和第二环境。 | [退出进程](artifacts/manual-user-20261014-145920/profile-exit-process-check.json)；[空闲确认](artifacts/manual-user-20261014-150910/user-evidence.json)；[本次确认](artifacts/phase0-final-20261014-152950/user-evidence.json)；[新Profile进程](artifacts/phase0-final-20261014-152950/final-profile-process-check.json) |

## SP-12子项

| 子项 | 最终状态 | 依据 |
|---|---|---|
| A0 完整退出 | PASS | 用户关闭且选区未消费；[chrome.exe归零核验](artifacts/manual-user-20261014-145920/profile-exit-process-check.json) |
| A1 同Profile重开 | PASS | [重开后root进程](artifacts/manual-user-20261014-150317/same-profile-reopen-process-check.json)及[四步人工确认](artifacts/manual-user-20261014-150317/user-evidence.json)，旧状态清除、读取/Mock/新选区恢复 |
| B 无DevTools空闲65秒后使用 | PASS | [用户确认](artifacts/manual-user-20261014-150910/user-evidence.json)，不以等待时长推断worker终止 |
| C 重载前旧状态清除及恢复 | PASS | 本次[合并步骤](manual-final-smoke.md)中两个同Profile窗口的真实重载，由[最新文字确认](artifacts/phase0-final-20261014-152950/user-evidence.json)支持；未附新截图 |
| D 干净Profile完整链路 | PASS | [初始空目录](artifacts/manual-final-smoke-20261014-152338/preparation.json)、[实际进程](artifacts/phase0-final-20261014-152950/final-profile-process-check.json)、[目标扩展安装配置和相同包](artifacts/phase0-final-20261014-152950/final-profile-package-check.json)及最新人工链路确认 |

## 最后两组证据更正

先前“两组都符合预期”随后由用户明确更正为未验证，[原确认与更正](artifacts/phase0-final-20261014-151806/final-two-groups-disposition.json)保留，不用于PASS。本次另外创建空Profile并重新执行，目标路径为`.runtime/manual-profile-final-20261014-152338`，扩展ID由安装配置核对为`hijkflihajcoealnhjnepmgabohaimcn`，加载同一0.0.2目录；本次用户再次回传“都符合预期”，以此及新环境证据补齐C/D。两个回合明确区分，没有回填或改写旧证据。

## 证据限制与留存

截图、用户文字、实际HTTP/Chrome夹具和确定性替身分开表述。最后两组没有新增截图/录屏；动态操作按用户对具体步骤的确认记PASS，不伪造图形工具操作。当前表未包括Chrome116实测、真实模型、复杂网页或正式产品测试，详见最终报告的未测能力。

更新前全文保留于[历史记录](artifacts/phase0-final-20261014-152950/before-final-manual-acceptance-record.md)；原始截图未编辑，hash索引见[证据清单](artifacts/phase0-final-20261014-152950/evidence-index.json)。
