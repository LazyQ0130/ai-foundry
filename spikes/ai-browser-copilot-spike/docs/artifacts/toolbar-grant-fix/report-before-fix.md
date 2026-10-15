# AI 网页阅读与知识整理助手：Phase 0 技术验证报告（第二轮收尾）

日期：**2026-10-14，Asia/Shanghai**。目录：`spikes/ai-browser-copilot-spike`。

**结论仍为 NO-GO，不进入 P1–P8。** 本轮保留既有WXT/React/Express/Mock方案，完成非图形验证和修复，并提供可由你亲自执行的 [Windows + Chrome人工验收指南](manual-chrome-acceptance.md) 与 [记录模板](manual-results-template.md)。用户回传已补齐可见Chrome扩展加载与工具栏打开原生Side Panel；右键、授权读取正例、侧栏摘要及第二Profile全流程仍BLOCKED。没有用模拟点击、合成事件或普通扩展标签页替代真实原生验收。

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
| 仅tabId+URL会遗漏同URL刷新及A→B→A的旧响应 | 背景请求前记录导航contextToken，切换/加载/URL变化同步失效；Panel在API前后CHECK_CONTEXT并在await后再核对generation | 确定性延迟测试覆盖切tab、同URL刷新、A→B→A、关tab；PASS。真实Chrome事件时序仍待人工 |
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
| 真正Side Panel点击、原生右键、重启及第二Profile | BLOCKED（组合场景） | 用户人工截图已补侧栏打开PASS；右键、重启及第二Profile仍待执行。机器GUI工具曾拒绝读取窗口，不将其算成扩展缺陷 |
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

**3 PASS / 0未解决的已确认FAIL / 9 BLOCKED。**（已纳入用户回传的SP-01/02人工证据。） 本轮非图形检查有更多PASS，但不改写需要原生证据的验收范围。

| 编号 | 状态 | 已有证据 / 尚缺证据 | 人工指南 |
|---|---|---|---|
| SP-01 干净MV3加载 | PASS | 用户声明按指南完成1–3步；Chrome155版本/独立Profile、启用的0.0.0扩展与Service Worker卡片均有截图，无可见错误按钮；实际加载包SHA仍需后补 | §2 |
| SP-02 图标打开侧栏 | PASS | 用户明确完成工具栏步骤，截图同时显示example.com、扩展图标和原生Side Panel及三个按钮；尚未包含正文/摘要结果 | §3 |
| SP-03 授权后读取 | BLOCKED | 抽取器真DOM通过；缺用户activeTab授权后通过scripting回到真正侧栏 | §5 |
| SP-04 无授权/跨源 | BLOCKED | 实际Chrome无grant注入拒绝PASS；缺原生侧栏提示、跨源撤权与恢复 | §6 |
| SP-05 切tab旧结果 | BLOCKED | 确定性延迟与代次回归PASS；缺真实导航/面板事件竞态 | §8 |
| SP-06 两站点划词 | BLOCKED | 严格契约/队列已验证，缺两个真实HTTPS站点原生右键与归属 | §7 |
| SP-07 空/长/失效选区 | BLOCKED | 过期边界、未来时间、并发消费、失效与worker重启测试PASS；缺真实菜单/UI反馈 | §7 |
| SP-08 Mock完整往返 | BLOCKED | 实际扩展worker/文档CORS和真实HTTP客户端已PASS；缺真实捕获页面→原生侧栏按钮→摘要 | §5 |
| SP-09 故障UI | BLOCKED | 真实HTTP客户端及服务端错误链路PASS；缺用户按钮的断连/504/502/超时UI证据 | §8 |
| SP-10 manifest与打包 | PASS | 最终ZIP审查/逐文件匹配、无全站权限及Key；只做启发式扫描，不声称形式证明 | §10 |
| SP-11 受限页面 | BLOCKED | 不支持页的确定性拒绝PASS，缺真实Chrome内部页/Web Store UI | §6 |
| SP-12 干净Profile全复验 | BLOCKED | 新依赖目录与headless Profile不能代替两个可见Profile的真实全链路 | §9 |

S0-1完整路径仍需重开浏览器后从图标恢复的证据；S0-2到S0-5仍分别缺授权读取/右键/侧栏摘要/第二Profile全流程。已通过的原生加载与侧栏打开不代表这些后续项目通过，也不是已确认核心路线不可行。

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

按原任务书，SP-01/02/03/04/06/08/10/12必须全PASS，且无密钥/跨页泄漏/全站权限问题方可GO。目前SP-01/02/10完整PASS，其余关键项目仍缺证据，因此**仍NO-GO**。本轮到修复、非图形验证和人工交接为止，不自行开始P1–P8。
