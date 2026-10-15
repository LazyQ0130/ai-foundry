# AI 网页阅读与知识整理助手：Phase 0 技术验证报告（第二轮收尾）

日期：**2026-10-14，Asia/Shanghai**。目录：`spikes/ai-browser-copilot-spike`。

**结论仍为 NO-GO，不进入 P1–P8。** 本轮保留既有WXT/React/Express/Mock方案，完成非图形验证和修复，并提供可由你亲自执行的 [Windows + Chrome人工验收指南](manual-chrome-acceptance.md) 与 [记录模板](manual-results-template.md)。用户回传已补齐可见Chrome扩展加载与工具栏打开原生Side Panel；0.0.1授权读取正例也已由用户人工验证PASS；0.0.2侧栏Mock及45秒空闲后复测已获用户人工文字确认PASS；未授权/跨源撤权及重新授权恢复已获用户四步文字确认PASS；受限页拒绝及普通页恢复已获人工文字确认PASS，无旧正文/摘要残留；两个HTTPS站点右键选区及一次消费已由用户四张截图与操作确认补齐；选区其余边界与后台tab隔离也已获用户文字确认PASS；三项异步隔离及恢复也已获用户确认PASS；故障UI已有504及重试人工PASS，502状态及可用按钮有截图PASS，重试也获后续明确文字确认PASS；断服务提示与重试也已获明确文字确认PASS；普通Mock恢复也已获人工文字确认PASS；客户端超时/重试/取消限速恢复也已获用户文字确认PASS；仅SP-12完整重启与第二Profile等组合复验仍BLOCKED。没有用模拟点击、合成事件或普通扩展标签页替代真实原生验收。

## 最新准备证据：SP-12用户完整退出，重开后的原生验收待执行

2026-10-14 14:59（Asia/Shanghai），用户确认“已关闭，选区未接收”。[原始文字](artifacts/manual-user-20261014-145920/user-confirmation.txt)、[结构化记录](artifacts/manual-user-20261014-145920/user-evidence.json)、[更新前报告](artifacts/manual-user-20261014-145920/report-before-profile-exit-confirmed.md)与[更新前验收记录](artifacts/manual-user-20261014-145920/record-before-profile-exit-confirmed.md)保留。随后15:00的[Win32_Process原始核验](artifacts/manual-user-20261014-145920/profile-exit-process-check.json)显示chrome.exe进程0个、目标Profile匹配0个、不可读命令行0个；退出由用户完成，代理没有终止浏览器。**退出准备子项PASS**，待消费选区存在依用户确认，不虚构关闭前session存储或截图。

[退出后Mock/fixture服务HTTP200](artifacts/manual-user-20261014-145920/services-after-profile-exit.json)正常。下一步由用户使用[同Profile路径重开命令](artifacts/manual-user-20261014-145920/reopen-same-profile-command.txt)启动Chrome，检查旧正文/摘要/未消费选区清除、读取/Mock及新右键选区恢复；命令仅为指导，不代表已执行。SP-12完整重开、空闲使用、扩展重载和第二Profile仍待人工完成，整项BLOCKED；总计仍11 PASS / 0未解决FAIL / 1 BLOCKED，整体NO-GO。

## 先前人工结果：SP-09客户端超时/恢复通过，最后一项SP-12待完成

2026-10-14 14:55（Asia/Shanghai），用户针对上一轮3000ms限速、两次API_TIMEOUT及按钮恢复、取消限速后正常调用步骤，回复“可以，已完成，符合预期”。[原始文字](artifacts/manual-user-20261014-145526/user-confirmation.txt)、[确认上下文与结构化证据](artifacts/manual-user-20261014-145526/user-evidence.json)、[更新前报告](artifacts/manual-user-20261014-145526/report-before-client-timeout-pass.md)及[更新前记录](artifacts/manual-user-20261014-145526/record-before-client-timeout-pass.md)保留。**客户端超时/重试/取消限速恢复子项PASS，SP-09整项更新为PASS**。结果依据用户对具体操作的明确确认，未新增配置截图、UI截图、录屏或精确Network时序。

**当前11 PASS / 0未解决FAIL / 1 BLOCKED，整体仍NO-GO。** 仅SP-12尚待完整同Profile退出/重开、无DevTools空闲使用、扩展重载以及第二个干净Profile原生复验，不能由45秒等待或headless fixture替代。

已只读核对当前测试Profile的目标扩展配置：加载目录为`.output/chrome-mv3`，磁盘manifest为0.0.2，与归档最终ZIP五个文件逐字节一致；[配置路径/文件hash/ZIP hash证据](artifacts/manual-user-20261014-145526/current-profile-package-check.json)补齐当前磁盘包来源，不声称Chrome进程内存字节核验。[Mock与fixture服务HTTP200](artifacts/manual-user-20261014-145526/services-before-restart-check.json)正常，服务保留供重启测试。当时安排的关闭准备及进程核验现已完成，见最新准备证据；重开后原生验收及第二Profile仍未通过。

## 先前补充证据：SP-09正常Network基线，客户端超时当时待测

2026-10-14 14:48（Asia/Shanghai），用户在客户端超时第1步回传“1显示这个”及[DevTools Network截图](artifacts/manual-user-20261014-144851/09-network-no-throttling-baseline.png)。[原始文字](artifacts/manual-user-20261014-144851/user-confirmation.txt)、[结构化记录与图片hash](artifacts/manual-user-20261014-144851/user-evidence.json)、[更新前报告](artifacts/manual-user-20261014-144851/report-before-network-baseline.md)及[更新前记录](artifacts/manual-user-20261014-144851/record-before-network-baseline.md)保留。

截图可见No throttling、summary fetch200、preflight204，fetch的Initiator为sidepanel脚本；**正常网络基线PASS**。完整Request URL/Headers未展开，不虚构这些数据，也不依据Console错误计数推断本次失败。当时尚未应用3000ms延迟；随后客户端超时/恢复已获用户明确确认，SP-09现PASS；SP-12继续BLOCKED，见最新人工结果。服务保持普通Mock session60546。

## 先前人工结果：SP-09普通Mock恢复通过，仅剩客户端超时/恢复

2026-10-14 14:43（Asia/Shanghai），用户按保持原网页/侧栏、不刷新重载、直接再次点Mock的指导回传“显示 Mock 往返成功，摘要正常，旧错误消失，按钮恢复可点击”。[原始文字](artifacts/manual-user-20261014-144356/user-confirmation.txt)、[结构化记录](artifacts/manual-user-20261014-144356/user-evidence.json)、[更新前报告](artifacts/manual-user-20261014-144356/report-before-normal-recovery-pass.md)及[更新前记录](artifacts/manual-user-20261014-144356/record-before-normal-recovery-pass.md)保留。**普通Mock恢复子项PASS**；无新增截图、录屏或Network记录。

SP-09仅剩客户端2.5秒超时及取消限速恢复的人工验收，整项仍BLOCKED；总计10 PASS / 0未解决FAIL / 2 BLOCKED，整体NO-GO。普通Mock保持运行session60546。补充了[Windows人工指南第8.1节](manual-chrome-acceptance.md#81-客户端25秒超时仅限真正侧栏)，先用Network实际summary请求确认检查的是侧栏，再配置3000ms延迟、核验API_TIMEOUT/按钮恢复与重试，最后取消限速验证正常成功。[官方限速文档核对与测试参数](artifacts/manual-user-20261014-144356/client-timeout-guide-source.json)只是测试准备，不算原生UI通过；[旧指南](artifacts/manual-user-20261014-144356/guide-before-client-timeout-details.md)保留。

## 先前人工结果：SP-09断服务错误与重试通过，普通Mock当时待人工确认

2026-10-14 14:41（Asia/Shanghai），用户确认两次均显示`API_ERROR：Failed to fetch`，按钮均恢复可点击，没有成功摘要或持续加载。[原始文字](artifacts/manual-user-20261014-144122/user-confirmation.txt)、[结构化记录](artifacts/manual-user-20261014-144122/user-evidence.json)、[更新前报告](artifacts/manual-user-20261014-144122/report-before-offline-ui-pass.md)及[更新前记录](artifacts/manual-user-20261014-144122/record-before-offline-ui-pass.md)均保留。**SP-09断服务错误提示与重试子项PASS**，依据用户真实Chrome操作的文字确认，无新增截图/录屏/Network记录。

代理已重新启动原普通Mock（`npm run api`，session60546，127.0.0.1:8787，原精确扩展Origin），[实际health200、摘要HTTP200与匹配ID/CORS](artifacts/manual-user-20261014-144122/normal-mock-recovery-http-check.json)通过；当时这只证明服务端恢复；随后用户已按不刷新或重载指导直接重试，确认正常成功及错误清除，见最新人工结果。客户端2.5秒超时/取消限速恢复仍未人工验收，SP-09整项继续BLOCKED。总计保持10 PASS / 0未解决FAIL / 2 BLOCKED，整体NO-GO。

## 先前人工结果：SP-09的502重试通过，准备断服务验收

2026-10-14 14:39（Asia/Shanghai），用户针对上轮明确要求的502重复调用结果回复“确认”。[原始文字](artifacts/manual-user-20261014-143902/user-confirmation.txt)、[确认上下文与结构化记录](artifacts/manual-user-20261014-143902/user-evidence.json)、[更新前报告](artifacts/manual-user-20261014-143902/report-before-502-retry-pass.md)及[更新前记录](artifacts/manual-user-20261014-143902/record-before-502-retry-pass.md)保留。**502重试、按钮恢复、无成功摘要/持续加载子项PASS**，依据用户对具体测试结果的文字确认，无新增截图或录屏。

SP-09整项仍BLOCKED，总计10 PASS / 0未解决FAIL / 2 BLOCKED，整体NO-GO。下一项断服务：代理先核验8787唯一loopback监听进程为本spike的fault夹具PID22092，再只停止该单进程；[真实socket连接拒绝及health不可达](artifacts/manual-user-20261014-143902/offline-api-check.json)证明API确已停止，当时普通Mock尚未重启，HTTP不可达只算测试准备；随后用户确认断服务UI通过，普通Mock已恢复，见最新人工结果。8001静态fixture服务不变。

## 先前人工结果：SP-09的502状态与可用按钮截图通过，重试当时待确认

2026-10-14 14:37（Asia/Shanghai），用户回复“可以”并回传一张v0.0.2侧栏截图。[原始文字](artifacts/manual-user-20261014-143754/user-confirmation.txt)、[原样截图](artifacts/manual-user-20261014-143754/09-invalid-provider-502.png)、[结构化记录与图片hash](artifacts/manual-user-20261014-143754/user-evidence.json)、[更新前报告](artifacts/manual-user-20261014-143754/report-before-502-ui-evidence.md)及[更新前记录](artifacts/manual-user-20261014-143754/record-before-502-ui-evidence.md)保留。

截图确认`API_ERROR：API_HTTP_502`、Mock按钮可用、截图范围没有成功摘要，**502状态与可用按钮子项PASS**。用户未明确描述两次操作，不将单张静态截图扩大为502重试或无持续加载时序已经验收；当时保持invalid-provider服务供重试；用户随后明确确认，重试现已PASS，见最新人工结果。SP-09整项仍BLOCKED，保持10 PASS / 0未解决FAIL / 2 BLOCKED与NO-GO。

## 先前人工结果：SP-09服务端504提示与重试通过（整项仍BLOCKED）

2026-10-14 14:34（Asia/Shanghai），用户确认两次均显示`API_ERROR：API_HTTP_504`，按钮均恢复可点击，没有成功摘要或持续加载。[原始文字](artifacts/manual-user-20261014-143413/user-confirmation.txt)、[原样截图](artifacts/manual-user-20261014-143413/09-server-timeout-504.png)、[结构化记录与图片hash](artifacts/manual-user-20261014-143413/user-evidence.json)、[更新前报告](artifacts/manual-user-20261014-143413/report-before-504-ui-pass.md)及[更新前记录](artifacts/manual-user-20261014-143413/record-before-504-ui-pass.md)保留。截图可见v0.0.2、504状态及可用按钮；两次操作顺序与恢复依用户文字确认，不虚构录屏或精确耗时。

**SP-09服务端504/重试子项PASS，SP-09整项仍BLOCKED**。总计保持10 PASS / 0未解决FAIL / 2 BLOCKED，整体NO-GO。下一项服务端非法Provider输出502：代理切换至既有invalid-provider夹具，启动工具调用被中断后独立核对监听PID22092和本spike进程路径；[两次真实HTTP502/INVALID_PROVIDER_RESPONSE及health200](artifacts/manual-user-20261014-143413/invalid-provider-http-check.json)确认服务已生效。此HTTP证据不代替侧栏UI验收；这是服务端验证并拒绝非法Provider输出，侧栏收到的是HTTP502，不声称裸非法JSON已到达侧栏。断服务、客户端2.5秒超时与恢复仍待人工完成。

## 先前人工结果：SP-05请求中切页/刷新及恢复通过

2026-10-14 14:30（Asia/Shanghai），用户按上一轮指导回复“1隔离正常、2隔离正常、3隔离正常、4恢复成功”。[原始文字](artifacts/manual-user-20261014-143057/user-confirmation.txt)、[结构化记录](artifacts/manual-user-20261014-143057/user-evidence.json)、[更新前报告](artifacts/manual-user-20261014-143057/report-before-tab-race-pass.md)及[更新前验收记录](artifacts/manual-user-20261014-143057/record-before-tab-race-pass.md)均保留。

**SP-05更新为PASS（用户人工文字确认）**：请求中从Example切IANA停留后切回、快速A→B→A、同URL刷新均隔离正常；重新读取后Mock恢复成功。没有新增录屏、截图、精确切换耗时或Network时序，不将文字确认为工具自动点击证据；测试前独立控制调用未单独回传，第4项不变页恢复调用已确认成功。

**当前10 PASS / 0未解决FAIL / 2 BLOCKED，仍NO-GO。** SP-09/12仍需完成。代理停止原delay服务并切至既有timeout模式；[真实HTTP检查](artifacts/manual-user-20261014-143057/timeout-api-http-check.json)确认约1.8秒后504/PROVIDER_TIMEOUT、精确CORS及服务仍可用。当时下一项为真实侧栏504错误提示、无假成功/无限等待及按钮恢复和重试，现已由用户截图及文字确认通过；HTTP通过不代替其他UI验收。

## 先前人工结果：SP-07选区边界与隔离全部通过

2026-10-14 14:23（Asia/Shanghai），用户回传“1截断正常、选区拒绝；2拒绝；3成功；4成功，没有文字或来源异常”。[原始文字](artifacts/manual-user-20261014-142318/user-confirmation.txt)、[结构化记录](artifacts/manual-user-20261014-142318/user-evidence.json)、[更新前报告](artifacts/manual-user-20261014-142318/report-before-selection-boundaries-pass.md)及[更新前验收记录](artifacts/manual-user-20261014-142318/record-before-selection-boundaries-pass.md)均保留。

**SP-07更新为PASS**：本组长正文截断/超长选区拒绝、关闭来源tab后拒绝、关闭无关后台tab后当前选区仍成功、后台新页加载不干扰当前选区均人工通过，无文字或来源异常。连同先前一次消费截图及65秒/空覆盖/切tab/刷新人工确认，矩阵所需子项已完成。本组证据为用户文字，未新增截图、计时录屏或确切错误码；指南可选iframe人工子项未测，不声称通过。

**当时9 PASS / 0未解决FAIL / 3 BLOCKED，仍NO-GO。** 当时下一项SP-05，现已获后续用户文字确认通过。代理以既有`api:fault`的delay模式替换普通Mock服务，维持127.0.0.1:8787、精确扩展Origin及原权限边界；[真实HTTP检查](artifacts/manual-user-20261014-142318/delay-api-http-check.json)记录约1200ms成功响应、ID匹配及非法Origin403。当时该服务准备和HTTP验证不代表用户已完成原生请求中切页/刷新验收；SP-05后来由用户文字确认PASS，SP-09/12继续BLOCKED。

## 先前人工结果：SP-07过期、空选区覆盖及页面变化失效子项通过

2026-10-14 14:19（Asia/Shanghai），用户回复“1拒绝、2拒绝、3拒绝、4拒绝，都没有旧选中文字残留”。[原始文字](artifacts/manual-user-20261014-141951/user-confirmation.txt)、[结构化证据](artifacts/manual-user-20261014-141951/user-evidence.json)、[更新前报告](artifacts/manual-user-20261014-141951/report-before-selection-expiry-pass.md)及[更新前验收记录](artifacts/manual-user-20261014-141951/record-before-selection-expiry-pass.md)保留。

对应此前指导，**SP-07的65秒过期、空选区覆盖、切tab返回、同URL刷新后接收四项人工PASS**，均无旧选中文字残留。证据为用户文字确认，未新增截图、计时录屏或确切错误码，不推断实际worker终止。一次消费子项此前已有两站点截图PASS；超长选区、关闭来源tab与无关后台tab变化仍待测，**当时SP-07整项仍BLOCKED**，当时总计8 PASS / 0未解决FAIL / 4 BLOCKED；剩余项随后通过，见最新人工结果，整体仍NO-GO。

当时下一组使用现有长文本fixture和真实Chrome标签页操作，现已获用户回传通过。代理已启动仅监听127.0.0.1:8001的tests/fixtures静态服务，[HTTP200/正文长度/hash检查](artifacts/manual-user-20261014-141951/fixture-http-check.json)仅证明供页可用，不冒充Chrome截断/全选/超长拒绝验收。没有变更扩展或正式业务逻辑。

## 先前人工结果：SP-06两站点划词与SP-07一次消费子项通过

2026-10-14 14:12（Asia/Shanghai），用户回传“结果如图，成功”及四张v0.0.2侧栏截图。已原样保存[Example选区](artifacts/manual-user-20261014-141247/06-selection-example.png)、[Example重复接收](artifacts/manual-user-20261014-141247/07-consumed-example.png)、[IANA选区](artifacts/manual-user-20261014-141247/06-selection-iana.png)、[IANA重复接收](artifacts/manual-user-20261014-141247/07-consumed-iana.png)；[原始文字](artifacts/manual-user-20261014-141247/user-confirmation.txt)和[结构化证据/图片SHA256](artifacts/manual-user-20261014-141247/user-evidence.json)可追溯。[更新前报告](artifacts/manual-user-20261014-141247/report-before-selection-pass.md)与[更新前验收记录](artifacts/manual-user-20261014-141247/record-before-selection-pass.md)保留。

**SP-06更新为PASS**：Example截图显示中文选区、https://example.com/、tabId=1183769424；IANA截图显示不同英文选区、https://www.iana.org/help/example-domains、tabId=1183769425。两个接收成功界面均显示选区已通过后台传到侧栏；真实右键步骤依用户按指导完成并确认成功，截图为侧栏局部，不声称另有菜单展开截图/整窗录屏。两个重复接收截图均为`NO_SELECTION：没有有效选区，请重新选择。`且无旧选区，**SP-07一次消费子项PASS，整项仍BLOCKED**。

当时安排的65秒过期、空选区覆盖、切tab返回与同URL刷新失效已由后续人工文字确认通过；超长/关闭来源tab/无关后台tab隔离等仍待完成。没有新增Network日志或加载包hash，整体仍NO-GO。

## 先前人工结果：SP-11受限页面安全拒绝通过

2026-10-14 14:09（Asia/Shanghai），用户回复“1拒绝、2拒绝、3拒绝、4成功，没有旧正文或摘要残留”。[原始文字](artifacts/manual-user-20261014-140901/user-confirmation.txt)与[结构化证据](artifacts/manual-user-20261014-140901/user-evidence.json)已归档；[更新前报告](artifacts/manual-user-20261014-140901/report-before-restricted-pages-pass.md)及[更新前验收记录](artifacts/manual-user-20261014-140901/record-before-restricted-pages-pass.md)保留。

**SP-11更新为PASS（用户人工文字确认）**：chrome://version、Chrome新标签页、Chrome Web Store均拒绝读取；回到example.com点击A后重新读取与Mock恢复成功，用户确认没有旧正文或摘要残留。未新增截图、错误原文、Console/Network日志或加载包hash，不推断确切错误码。当时安排的SP-06及SP-07一次消费子项现已获四张截图与用户操作确认通过，见最新人工结果；其他未完成项目仍BLOCKED，整体仍NO-GO。

## 先前人工结果：SP-04未授权/跨源撤权通过

2026-10-14 14:04（Asia/Shanghai），用户按上一轮四步指导回复“1拒绝、2成功、3拒绝、4成功”。[原始文字](artifacts/manual-user-20261014-140449/user-confirmation.txt)及[结构化证据](artifacts/manual-user-20261014-140449/user-evidence.json)已归档；[更新前报告](artifacts/manual-user-20261014-140449/report-before-active-tab-pass.md)和[更新前验收记录](artifacts/manual-user-20261014-140449/record-before-active-tab-pass.md)保留。

**SP-04更新为PASS（用户人工文字确认）**：全新未授权IANA标签页读取拒绝；点击A后读取/Mock成功；同一标签页跨源导航到example.com后未重新授权时拒绝；再次点击A后读取恢复。没有新增截图、录屏、Network日志或加载包hash，不将本次文字确认扩展为其他项目通过。当时安排的SP-11已由后续四步回传通过，见最新人工结果；其他未执行项目继续BLOCKED，整体仍NO-GO。

## 先前人工结果：Mock摘要及45秒空闲后复测通过

2026-10-14 14:00（Asia/Shanghai），用户在0.0.2复验指导后明确回复：“这次 Mock 摘要成功了，等了45秒再点也能成功。”已保存[原始文字确认](artifacts/manual-user-20261014-140054/user-confirmation.txt)及[结构化证据](artifacts/manual-user-20261014-140054/user-evidence.json)，更新前报告保留于[report-before-mock-pass.md](artifacts/manual-user-20261014-140054/report-before-mock-pass.md)。

**SP-08更新为PASS（用户人工文字确认）。** 未变化页面等待45秒后再次调用也PASS；这不是截图或Network实测记录，也不单凭等待时间断言生产worker确实终止。实际worker停止/恢复的独立夹具证据另见生命周期修复节。当前没有新的加载包hash，沿用本轮0.0.2复验背景并如实标明来源。

旧版SP-08失败、两个缺陷的根因与修复前证据全部保留。当时安排的SP-04已由后续四步回传通过，见最新人工结果。SP-09/12未执行部分继续BLOCKED；SP-05/06/07/11后续人工通过，保持NO-GO，不进入P1–P8。

## 修复记录：0.0.2 后台休眠导致快照误失效（用户Mock复验已通过）

用户在0.0.1成功读取后调用Mock，回报 `API_ERROR：TAB_CHANGED：快照已失效，请重新读取。`，原文保存在[user-reported-error.txt](artifacts/worker-lifecycle-fix/user-reported-error.txt)。错误由扩展CHECK_CONTEXT产生，可能出现在API调用前或后；没有Network记录，不断言该次请求是否已到API。这是旧包实测FAIL记录；0.0.2随后获用户Mock及45秒复测成功确认，SP-08现为PASS，见最新人工结果节。

已复现根因：contextToken只存在worker内存Map；后台正常休眠/重启后产生新的随机值，即使页面不变也拒绝原快照。这违反了原方案“不依赖worker内存保存需要跨休眠的状态”的要求。此前测试把worker重启一律视为选区失效，未覆盖正常休眠后的继续使用；现已修正该错误要求，不以保活轮询掩盖问题。没有取得用户worker终止的现场日志，根因为可复现的实现缺陷，而非声称已捕获当时进程轨迹。

**0.0.2修复**：将每个tab的匿名代次UUID保存在storage.session，不保存URL/正文；worker恢复时重新载入。真正切tab/加载/URL变化仍同步替换内存lease并串行写入session，防止异步初始化覆盖新代次。页面/选区tab与URL检查、60秒TTL及一次消费不变；浏览器/扩展会话重置仍需重新读取。存储失败拒绝处理，不扩权或跳过校验。

证据：

- [修复前复现](artifacts/worker-lifecycle-fix/reproduction-before-fix.txt)：普通worker重建后快照/有效选区的两个期望用例失败，保留原始输出。
- [44项测试](artifacts/worker-lifecycle-fix/test.txt)与[最终类型检查](artifacts/worker-lifecycle-fix/typecheck-probe.txt)PASS；涵盖跨重启恢复、真实导航代次跨重启仍失效、TTL不延长、初始化/写入竞争与存储失败。测试前一次类型错误及更正日志保留。
- [真实Chrome生命周期对照](artifacts/worker-lifecycle-fix/chrome-lifecycle-probe.json)：Chrome155实际stopWorker后重新唤醒，记录不同worker实例UUID。旧实现重启后CHECK_CONTEXT失败；修复实现通过；导航后再重启仍拒绝旧快照。该**独立测试扩展**使用真实Chrome worker/storage.session，tab与scripting为固定夹具，不能当作原生授权/Side Panel/用户网页摘要成功证据。没有模拟点击。
- [新目录重建](artifacts/worker-lifecycle-fix/rebuild/rebuild-test.txt)：ci/typecheck/test/build/zip；44项通过。esbuild0.28.2原已是传递工具依赖，本轮显式固定为devDependency用于只生成测试夹具，不进入扩展包。
- [当前0.0.2 ZIP](artifacts/worker-lifecycle-fix/ai-browser-copilot-phase0-0.0.2-chrome.zip)及[包审查](artifacts/worker-lifecycle-fix/package-audit.json)PASS：仍为5个权限、无host权限，SHA256 `c42d91517699e4d4335c3c8bc8330e227a987d48ee7551026c45d9b8b18f6bab`。旧0.0.0/0.0.1和[修改前报告](artifacts/worker-lifecycle-fix/report-before-fix.md)保留。

原生复验：重新加载扩展，确认**v0.0.2**，回到网页点击A图标、重新读取、调用Mock。正常后，保持tab/URL不变、关闭worker DevTools等待45秒，再次调用Mock，验证跨正常休眠仍成功。用户已回传Mock与45秒空闲复测成功，SP-08已PASS；SP-12尚未完成浏览器重开/第二Profile全复验，仍BLOCKED，继续NO-GO。

官方依据：[worker生命周期](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle)说明正常空闲终止与全局变量丢失；[storage.session](https://developer.chrome.com/docs/extensions/reference/api/storage)提供当前浏览器会话内状态。只以本地UUID维护上下文，不将session当浏览历史库。

## 0. 先前修复：0.0.1 工具栏授权链路（读取正例已人工通过）

用户在普通example.com网页、原生Side Panel中读取仍收到授权提示，已保存[局部截图](artifacts/toolbar-grant-fix/03-read-permission-denied.png)及[完整窗口截图](artifacts/toolbar-grant-fix/03-read-permission-denied-full-window.png)。**0.0.0的SP-03是已观察到的FAIL，不再仅算缺证据。** 之前让用户反复点击同一按钮不能解决该实现问题。

核对与用户完全相同的[Chromium155.0.8059.41源码](https://chromium.googlesource.com/chromium/src/+/155.0.8059.41/chrome/browser/extensions/extension_action_runner.cc)：自动Side Panel action分支在GrantTabPermissions之前返回，因此openPanelOnActionClick=true打开侧栏不授予activeTab。原实现把这两种action路径混同。[源码取证](artifacts/toolbar-grant-fix/chromium-source-evidence.json)保留版本、来源和片段。

修复为显式设置openPanelOnActionClick=false，在chrome.action.onClicked原生回调中同步调用sidePanel.open；不在侧栏按钮请求新grant，不增加tabs或host权限。启动/安装/重启均覆盖旧持久设置。扩展版本提高为**0.0.1**并在侧栏显示，仅用于辨识本地修复包，未发布课程/扩展。

[37项测试日志](artifacts/toolbar-grant-fix/test.txt)、[类型检查](artifacts/toolbar-grant-fix/typecheck.txt)、[构建](artifacts/toolbar-grant-fix/build.txt)与[打包](artifacts/toolbar-grant-fix/zip.txt)PASS。新增两项只验证事件注册/同步调用和false配置，不模拟用户授权验收。[真实Chrome启动检查](artifacts/toolbar-grant-fix/chrome-worker-startup.json)确认版本0.0.1、behavior=false、action listener存在、无host权限、API health200；没有触发action，**不证明已获得原生grant**。

当前交付：[0.0.1 ZIP](artifacts/toolbar-grant-fix/ai-browser-copilot-phase0-0.0.1-chrome.zip)，[包审查](artifacts/toolbar-grant-fix/package-audit.json)PASS，SHA256 `60980224d62019fac9fbf88e8d5a93c4e826aa30ef5a697f8a67122a7c50b3b3`。旧ZIP/旧测试/旧报告均保留。[修复前报告](artifacts/toolbar-grant-fix/report-before-fix.md)可追溯原状态。

复验：chrome://extensions点击现有扩展卡片上的重新加载圆形箭头，确认版本0.0.1；关闭旧侧栏，回到example.com，点工具栏A图标，再点读取、Mock。用户随后回传0.0.1原生侧栏读取成功，SP-03已PASS，详见下节；跨源撤权、右键及Mock尚未验证，**保持NO-GO**。下文35项/0.0.0包是第二轮历史验证，不能当作0.0.1原生通过证据。

## 用户回传补充：0.0.1 原生读取成功

2026-10-14 13:47（Asia/Shanghai），用户按修复复验步骤操作后明确表示成功，提交[03-read-success.png](artifacts/manual-user-20261014-134717/03-read-success.png)。截图显示v0.0.1、读取成功、Example Domain、https://example.com/、tabId=1183769424、snapshotId=6db6d919-4b7f-49d0-be30-8681c8eb23f5及正文；文字与前一张完整窗口网页对应，Mock按钮已启用。

**SP-03从旧包FAIL更新为修复后PASS。** 这是用户真实原生操作证据，不是测试替身或合成点击。旧失败截图、根因与修复前报告均保留，见第0节。[结构化证据](artifacts/manual-user-20261014-134717/user-evidence.json)记录来源、版本、字段和图片SHA256；[本次更新前报告](artifacts/manual-user-20261014-134717/report-before-read-pass.md)保留失败状态。

此段为当时读取成功的记录：截图没有Mock输出；后续SP-08报错与0.0.2修复见最新修复节。下一步在同一侧栏点“调用本机Mock摘要”，核对成功状态和[MOCK]文字。API health本次仍为200，不将健康检查当作侧栏摘要成功。

## 用户回传补充：前三步完成，第四步配置已修正

收到时间：2026-10-14 13:35（Asia/Shanghai）。用户亲自完成指南1–3步并提交三张截图，已按原名保存在 [人工证据目录](artifacts/manual-user-20261014-133518/user-evidence.json)：

- [00-chrome-version.png](artifacts/manual-user-20261014-133518/00-chrome-version.png)：Chrome155.0.8059.41，Windows11 26H2，独立manual-profile-20261014-132426。
- [01-extension-loaded.png](artifacts/manual-user-20261014-133518/01-extension-loaded.png)：扩展ID `hijkflihajcoealnhjnepmgabohaimcn`、版本0.0.0、已启用、Service Worker链接，无可见错误按钮。
- [02-toolbar-sidepanel.png](artifacts/manual-user-20261014-133518/02-toolbar-sidepanel.png)：example.com和原生侧栏同时显示，读取/接收选区可操作，未读取时Mock按钮禁用；结合用户完成步骤的声明，SP-02 PASS。

截图没有页面快照或摘要，不能用于SP-03/08。实际加载包的SHA256未提供，不从截图推断它等于报告ZIP。后续完整复验应记录实际包hash。

第四步失败原因为把占位符 `chrome-extension://实际ID` 原样填入，启动校验按预期拒绝；不是CORS、activeTab或模型故障，未改动代码或放宽校验。已在本机使用截图真实ID启动原Mock服务，[启动日志](artifacts/manual-user-20261014-133518/api-server.txt)、[health实测](artifacts/manual-user-20261014-133518/health.json)证明服务正常200。该服务保留运行以供用户继续操作侧栏；健康检查不当作扩展摘要成功。

更新前报告保留在 [report-before-user-evidence.md](artifacts/manual-user-20261014-133518/report-before-user-evidence.md)。

## 1. 原始资料与证据保留

- [首轮报告原文](evidence-round1.md) 与 [首轮决策原文](decisions-round1.md) 已单独保存；首轮artifacts、旧ZIP、工具阻断原文均未覆盖。
- 首轮源码快照：[pre-fix-source.zip](artifacts/round2/pre-fix-source.zip)。本轮新日志和包均在artifacts/round2子目录，重建脚本改为默认新增目录。
- 用户的[Phase0任务书](inputs/phase0-task.md)与[蓝图V1.1](inputs/blueprint-v1.1.md)原件副本保持不变。本轮只执行Phase0收尾，没有执行文档中的未来课程、平台迁移或发布建议。
- 平台工作区原有未提交修改保留。本轮代码、测试、包和文档都在该Spike，未改正式课程/Capstone/数据库/权益/发布状态，未提交、推送、部署或调用真实模型。

## 2. 已发现并修复的问题

| 问题 | 修复 | 验证与结果 |
|---|---|---|
| 仅tabId+URL会遗漏同URL刷新及A→B→A的旧响应 | 背景请求前记录导航contextToken，切换/加载/URL变化同步失效；Panel在API前后CHECK_CONTEXT并在await后再核对generation | 确定性延迟测试覆盖切tab、同URL刷新、A→B→A、关tab；PASS。真实Chrome请求中切tab/同URL刷新/A→B→A及恢复已获用户文字确认PASS，未取得录屏/Network时序 |
| 并发TAKE_SELECTION的先读后删可能消费两次 | window内串行get/remove/set，一次消费 | 两个同时接收只有一个成功；PASS |
| 选区可能在异步存储后才开始计时，未来时间未拒绝 | 事件开头计时；age<0或>=60000拒绝；最新事件胜出 | 59999/60000/-1ms、延迟存储、连续选区、导航中写入测试PASS |
| 任意后台tab导航会清掉当前tab有效选区 | 仅影响当前交互上下文的事件清除窗口队列；无关tab仅失效自身代次 | 无关后台导航与worker重启遗留选区测试PASS |
| 内容格式错误被误报成无权限 | 注入失败与schema校验分别处理 | NEEDS_PERMISSION、BAD_MESSAGE、NO_CONTENT分别测试PASS |
| Panel消费结果只靠宽泛联合schema | 按CAPTURE/TAKE_SELECTION分别解析，并核对响应来源tab/URL；选区显示URL/tabId以便人工取证 | 类型检查PASS；后台伪造来源、额外字段、受限页测试PASS；原生Panel显示待人工 |
| API宽松接受不合适的预检/类型/方法 | 校验OPTIONS的请求方法及header、POST与JSON类型；客户端固定URL、拒绝跳转、不带credentials；断连向Provider传取消信号 | 真HTTP测试覆盖403/405/415、502/504、断连/跳转/错配ID等，PASS |
| Vitest将.runtime旧副本也收集进来 | 添加include=tests/**/*.test.ts，重建复制该配置 | 正确独立测试数35；首轮扩展测试阶段显示41=本轮35+旧副本6，不再作为最终统计 |
| 首次网络负例探针把任意异常当作权限拒绝 | 调查到tsx序列化的`__name`辅助函数错误；使用固定原始测试JS，只接受真实权限错误 | 错误探针原文保留于network-final；校正后真实Chrome返回Cannot access contents…must request permission。只以chrome-verified结果为准 |

背景逻辑只提取为可注入Chrome适配器的协调器以便测试，未重做工程或改换技术路线。contextToken是页面代次标识，不是模型Key或业务授权。

## 3. 非图形验证：逐项结果

环境沿用Windows、Node24.16.0、npm11.13.0、WXT0.21.4、TS5.9.3、React18.3.1、Express5.2.1、Zod4.6.5、Vitest5.0.4。新增测试使用现有依赖，无新费用。Chrome实际155.0.8059.41；116仍仅manifest目标下限。

| 检查 | 状态 | 证据与范围 |
|---|---|---|
| 新目录npm ci、typecheck、test、build、zip | PASS | [final-rebuild日志目录](artifacts/round2/final-rebuild/rebuild-environment.txt)，逐命令日志见下表；无删除 |
| 类型检查含所有scripts | PASS | [typecheck-delivery.txt](artifacts/round2/typecheck-delivery.txt) |
| 7项原API/schema测试 | PASS | [最终35项测试](artifacts/round2/final-rebuild/rebuild-test.txt)：真实回环服务，CORS、Host、输入、限流、Provider超时/错配等 |
| 9项Panel共享fetch客户端测试 | PASS | 同上；真HTTP正常/非法JSON/错配ID/schema/HTTP错误/重定向/超时/取消/服务关闭；**不是Panel UI** |
| 19项协调器测试 | PASS | 同上；Chrome适配器替身、可控异步顺序；**不证明Chrome实际grant或事件时序** |
| 真Chrome扩展worker到本机API | PASS | [chrome-network-probe.json](artifacts/round2/chrome-verified/chrome-network-probe.json)：无host权限，OPTIONS/POST精确Origin，200且两ID匹配 |
| 真Chrome独立扩展文档到本机API | PASS | 同上；实际构建的sidepanel.html及CSP上下文，200；**普通扩展tab，不是原生Side Panel** |
| 真Chrome无activeTab授权的注入负例 | PASS | 同上；真实权限拒绝消息，不是模拟点击或伪造grant；跨源撤权/重新授权正例未测 |
| 真Chrome受控DOM抽取 | PASS | 同上；A正文77字符、隐藏/表单/导航被排除；长文6000字符且truncated；空页0字符。直接fixture DOM执行，**不是授权注入正例** |
| 最终包审查 | PASS | [package-audit.json](artifacts/round2/final-rebuild/package-audit.json)：5文件、最小权限、无.env/API/test/map、密钥启发式扫描无命中 |
| 真正Side Panel点击、原生右键、重启及第二Profile | BLOCKED（组合场景） | 用户人工截图与操作确认已补侧栏打开、两站点右键选区PASS；重启及第二Profile仍待执行。机器GUI工具曾拒绝读取窗口，不将其算成扩展缺陷 |
| 真模型 | BLOCKED（未测且不在本轮授权范围） | Mock接口保留，没有读Key、请求模型或产生计费 |

新目录重建详情（实际目录见rebuild-path.txt）：

| 命令 | 证据 |
|---|---|
| npm ci | [rebuild-ci.txt](artifacts/round2/final-rebuild/rebuild-ci.txt)，240安装/241审计、0已知漏洞 |
| npm run typecheck | [rebuild-typecheck.txt](artifacts/round2/final-rebuild/rebuild-typecheck.txt) |
| npm test | [rebuild-test.txt](artifacts/round2/final-rebuild/rebuild-test.txt)，3文件35项PASS |
| npm run build | [rebuild-build.txt](artifacts/round2/final-rebuild/rebuild-build.txt)，329.05kB运行文件 |
| npm run zip | [rebuild-zip.txt](artifacts/round2/final-rebuild/rebuild-zip.txt)，100987 bytes |

交付 [第二轮MV3 ZIP](artifacts/round2/final-rebuild/ai-browser-copilot-phase0-0.0.0-chrome.zip)，SHA256：

```text
8eb36c8d0d18d81020884e23b8db5eeb1e38b0f9a6f52b438575d9522f3446d4
```

该ZIP每个运行文件与无界面Chrome加载的`.output/chrome-mv3`逐文件SHA256一致。原始ZIP仍保留在首轮artifacts；测试日志/包不等同于发布标记。

## 4. 本机API最小权限：已核实的结论与限制

**当前Chrome155+本API配置下，新增host权限为0即可工作，不申请全站权限。** 真实扩展worker和扩展文档均按普通CORS发送请求，实际Origin为`chrome-extension://hijkflihajcoealnhjnepmgabohaimcn`；API对该精确来源返回允许头。预检可能缓存，独立文档请求未再出现OPTIONS是正常现象。凭据不需要，activeTab也不参与本机API授权。

manifest保留5个权限，无host_permissions；CSP固定`http://127.0.0.1:8787`；共享客户端禁止跳转。服务只绑定回环，精确校验Host/Origin、POST/JSON、预检方法/header、64KiB body/6000正文/30每分钟/1.8秒Provider超时/结构化输出，Panel客户端2.5秒超时。

[Chrome跨源文档](https://developer.chrome.com/docs/extensions/develop/concepts/network-requests)说明无host特权的请求按跨源处理，[match-pattern文档](https://developer.chrome.com/docs/extensions/develop/concepts/match-patterns)描述回环与port。探针另外证明Chrome155能解析`http://127.0.0.1:8787/*`测试manifest，但未证明该模式全部权限语义，也未将其加入实际包。首轮“无法限制端口”的绝对断言撤回；当前无需这个权限。

此结论只覆盖实际版本和测试上下文；真正Side Panel以及Chrome116、企业策略或本地网络提示变化仍须人工验证。遇到失败应取证，不放行任意/空Origin，也不关闭安全机制。[当前决策](decisions.md)列出完整边界与官方来源。

## 5. SP-01–SP-12 最终闸门

**11 PASS / 0未解决FAIL / 1 BLOCKED。**（SP-04、SP-08、SP-11在0.0.2复验指导后获用户人工文字确认PASS，SP-06新增四张截图与操作确认，SP-07所需两组边界与隔离、SP-05四项及SP-09全部故障/恢复获用户文字确认或截图PASS；旧版失败与修复证据保留。45秒复测不替代SP-12整项。） 本轮非图形检查有更多PASS，但不改写需要原生证据的验收范围。

| 编号 | 状态 | 已有证据 / 尚缺证据 | 人工指南 |
|---|---|---|---|
| SP-01 干净MV3加载 | PASS | 用户声明按指南完成1–3步；Chrome155版本/独立Profile、启用的0.0.0扩展与Service Worker卡片均有截图，无可见错误按钮；实际加载包SHA仍需后补 | §2 |
| SP-02 图标打开侧栏 | PASS | 用户明确完成工具栏步骤，截图同时显示example.com、扩展图标和原生Side Panel及三个按钮；尚未包含正文/摘要结果 | §3 |
| SP-03 授权后读取 | PASS（0.0.1） | 用户按重载→工具栏→读取顺序复验成功，截图含版本、标题、URL、tabId/snapshotId及对应正文；旧版失败仍保留。此正例不覆盖跨源撤权 | §5 |
| SP-04 无授权/跨源 | PASS | 用户四步人工确认：未授权拒绝→授权成功→同tab跨源后拒绝→重新授权成功；[文字证据](artifacts/manual-user-20261014-140449/user-confirmation.txt) | §6 |
| SP-05 切tab旧结果 | PASS | 用户确认请求中切tab/A→B→A/同URL刷新隔离正常，重新读取恢复；[文字证据](artifacts/manual-user-20261014-143057/user-confirmation.txt) | §8 |
| SP-06 两站点划词 | PASS | 用户两站点右键操作确认及选区截图，URL对应、不同tabId；[结构化证据](artifacts/manual-user-20261014-141247/user-evidence.json) | §7 |
| SP-07 空/长/失效选区 | PASS | 两站一次消费截图；65秒/空覆盖/切tab/刷新及超长/关闭来源/后台隔离人工文字均PASS；[本组证据](artifacts/manual-user-20261014-142318/user-evidence.json) | §7 |
| SP-08 Mock完整往返 | PASS（人工文字确认） | 用户明确确认Mock成功且45秒后再点也成功；对应0.0.2复验指导。本次无截图/Network/包hash，来源限制已注明；旧失败保留 | §5 |
| SP-09 故障UI | PASS | 504/502、断服务与重试、普通恢复、客户端超时/重试/取消限速恢复均人工通过；[最终子项确认](artifacts/manual-user-20261014-145526/user-evidence.json) | §8 |
| SP-10 manifest与打包 | PASS | 当前0.0.2包审查见worker-lifecycle-fix/package-audit.json，无全站权限及Key；此前0.0.0逐文件证据仍保留，不混作新包运行证据 | §10 |
| SP-11 受限页面 | PASS | 用户确认内部页、新标签页、Web Store拒绝，普通页恢复；无旧正文/摘要残留；[文字证据](artifacts/manual-user-20261014-140901/user-confirmation.txt) | §6 |
| SP-12 干净Profile全复验 | BLOCKED | 用户退出及进程归零已核验；同Profile重开/空闲/扩展重载/第二Profile原生全链路仍待测，不能以headless替代 | §9 |

S0-1完整路径仍需重开恢复的证据；S0-2读取正例、无授权/跨源撤销及重新授权恢复、受限页拒绝与普通页恢复均已人工PASS；S0-3两站点右键、消息归属、一次消费、空/长/过期及切页/刷新/关闭来源失效、后台tab隔离均已人工PASS；S0-4扩展Mock正常往返、504提示与重试已人工PASS，502提示及可用按钮截图、502重试及断服务错误/重试文字确认PASS；普通恢复文字确认PASS；客户端超时/重试与取消限速恢复也已人工文字确认PASS；S0-5仍缺第二Profile全流程。已通过的原生加载与侧栏打开不代表这些后续项目通过，也不是已确认核心路线不可行。

## 6. 人工交接与错误收集

请按[详细指南](manual-chrome-acceptance.md)顺序操作，最短路径：

1. 构建，使用新的可见Chrome Profile，加载`.output/chrome-mv3`，记录版本、ID、包hash和错误面板。
2. 在Example Domain亲自点击扩展工具栏图标，确认真正Side Panel；读取当前页。
3. 用实际ID设置EXTENSION_ORIGIN，启动`npm run api`；点侧栏Mock按钮，记录成功与请求Origin。
4. 在Example与IANA两个HTTPS站点原生划词；分别核对文字、URL/tabId，测试空/长/65秒/一次消费。
5. 测未授权tab、跨源、内部页；用`api:fault`测延迟期间切tab/同URL刷新、504与502，停服务测断连。
6. 正常重开并在第二个独立Profile重复全链路；按[结果模板](manual-results-template.md)填写证据。

指南给出精确PowerShell命令、网页、按钮、预期UI、文件命名、worker/Panel DevTools与Network取证方法。`api:fault`仅是Mock QA夹具，不增加产品功能或模型调用。保留截图/录屏、Console堆栈、Origin和状态码；没有执行填BLOCKED，出现不符合预期填FAIL。不要只用最终静态截图证明异步竞态。

## 7. 仍有的技术闸门与解决方案

| 阻断/风险 | 解决方案 |
|---|---|
| 真实action/sidePanel/activeTab手势缺证据 | 你按人工指南执行；不靠CDP action/合成事件补PASS。失败后按真实错误修复，再重复同一操作 |
| 真实导航/worker休眠/面板冷启动时序 | 录屏延迟切tab、A→B→A、同URL刷新、65秒和worker恢复；确定性测试只是前置保护 |
| 不同Chrome的CORS/LNA/策略差异 | 记录具体版本、Origin、预检和提示，维持精确来源；当前155无需新增host权限。必要时另行验证最窄来源/凭据，不申请全站 |
| Chrome116下限没有实测 | 不写成“116已通过”；人工优先当前Chrome，后续在受控兼容环境验证下限再冻结教材 |
| Mock不证明真实模型质量/注入防护 | 当前只Mock，不收费；真实Provider与评估在未来另行授权，不能借Mock宣布已通过 |

蓝图建议沿用首轮：扩展独立Node环境、区分版本目标和实测版本、Phase0硬闸门、独立项目进度维度、保留平台授权边界。新增：记录CORS与原生Side Panel证据层级；snapshot需导航代次而不只tab/URL；选区队列及TTL边界要进入后续契约验收；测试必须排除.runtime副本。

## 8. Git与停止条件

main分支，基础SHA `d5cb93798e9293fe95033ba92755b7090a3e548f`。本轮无新commit、未暂存/推送；未运行主站构建、数据库seed/迁移或部署。所有改变局限现有Spike，原始工作区修改保留，未批量删除。

按原任务书，SP-01/02/03/04/06/08/10/12必须全PASS，且无密钥/跨页泄漏/全站权限问题方可GO。目前SP-01–SP-11已PASS，SP-12尚缺完整重启与第二Profile原生复验证据，因此**仍NO-GO**。本轮到修复、非图形验证和人工交接为止，不自行开始P1–P8。
