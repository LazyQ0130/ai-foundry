# 16张正式教学图审查

源图与PNG均在原分课私有目录，以下逐图对照正文alt/caption、SVG文字/节点/箭头和固定源码。实际LessonMarkdown+当前平台CSS在1440/390/320共12个课页挂载，48张图截图、16次源重导逐字节等同原PNG；没有需要重画的确定错误。

| 图 | 源文件 / 成图 | 技术与箭头审查 | 1440/390/320 | 处置 |
|---|---|---|---|---|
| h13-01 | [SVG](../h13/figures/h13-01.svg) / [PNG](../h13/figures/h13-01.png) | 显式模型字段投影；执行/输出/Host展示留进程内；箭头不是全部执行顺序。 | PASS/PASS/PASS | 保持原图；[源/320对照](figures/qa/h13-01-review-pair.png) |
| h13-02 | [SVG](../h13/figures/h13-02.svg) / [PNG](../h13/figures/h13-02.png) | Scope继承/自身遮蔽/继承过滤交集；子级题设先撤A限制再看祖先贡献。图的deny还含style，与正文单deny shared不同但结论一致，自身style豁免；各自输入明确。 | PASS/PASS/PASS | 保持原图；[源/320对照](figures/qa/h13-02-review-pair.png) |
| h13-03 | [SVG](../h13/figures/h13-03.svg) / [PNG](../h13/figures/h13-03.png) | when逐项等待、失败不交部分；Step复用与当前登记/Scope/dispose复查并存；signal不强杀Promise。 | PASS/PASS/PASS | 保持原图；[源/320对照](figures/qa/h13-03-review-pair.png) |
| h13-04 | [SVG](../h13/figures/h13-04.svg) / [PNG](../h13/figures/h13-04.png) | 登记→Scope→resolve→executor描述→Prompt/请求→模型提议；PTC SDK区别；后续结果仅作交接，caption显式省略Runtime投影。 | PASS/PASS/PASS | 保持原图；[源/320对照](figures/qa/h13-04-review-pair.png) |
| h14-01 | [SVG](../h14/figures/h14-01.svg) / [PNG](../h14/figures/h14-01.png) | 成功路径三阶段；输入Schema在defineTool包装，参数快照不代替校验；deny仍post，wrapper throw跳post，skip不进Pipeline。 | PASS/PASS/PASS | 保持原图；[源/320对照](figures/qa/h14-01-review-pair.png) |
| h14-02 | [SVG](../h14/figures/h14-02.svg) / [PNG](../h14/figures/h14-02.png) | 三种Waterfall各有返回契约；审批后guard且只否决；委托纪律是插件契约，不假称核心自动防重复next。 | PASS/PASS/PASS | 保持原图；[源/320对照](figures/qa/h14-02-review-pair.png) |
| h14-03 | [SVG](../h14/figures/h14-03.svg) / [PNG](../h14/figures/h14-03.png) | A/B可重叠，B先结束而complete/commit等A，C为独占屏障；标题/箭头/caption都区分主体结束与提交。 | PASS/PASS/PASS | 保持原图；[源/320对照](figures/qa/h14-03-review-pair.png) |
| h14-04 | [SVG](../h14/figures/h14-04.svg) / [PNG](../h14/figures/h14-04.png) | 规范value、content/meta、additionalContexts分开；tools/result观察早于有log的tool/result；内存接受非flush。 | PASS/PASS/PASS | 保持原图；[源/320对照](figures/qa/h14-04-review-pair.png) |
| h15-01 | [SVG](../h15/figures/h15-01.svg) / [PNG](../h15/figures/h15-01.png) | 上部通用允许路径，下部Shell/file两条能力，审批/沙箱/观察非所有工具必经；没有画成统一安全总链。 | PASS/PASS/PASS | 保持原图；[源/320对照](figures/qa/h15-01-review-pair.png) |
| h15-02 | [SVG](../h15/figures/h15-02.svg) / [PNG](../h15/figures/h15-02.png) | 有效Turn、asked/decided审批ID配对、预取消先于never、仅allowed-once授权；无Turn/提交失败单独出口。 | PASS/PASS/PASS | 保持原图；[源/320对照](figures/qa/h15-02-review-pair.png) |
| h15-03 | [SVG](../h15/figures/h15-03.svg) / [PNG](../h15/figures/h15-03.png) | 模式与完整度两个维度；workspace含extra/temp；Windows partial；平台事实为静态，原生runner未启动，网络不承诺。 | PASS/PASS/PASS | 保持原图；[源/320对照](figures/qa/h15-03-review-pair.png) |
| h15-04 | [SVG](../h15/figures/h15-04.svg) / [PNG](../h15/figures/h15-04.png) | 消费者observed→可选观察意图→后端版本；write与edit不同；新Session/卸载清空；原子不消除全部TOCTOU。 | PASS/PASS/PASS | 保持原图；[源/320对照](figures/qa/h15-04-review-pair.png) |
| h16-01 | [SVG](../h16/figures/h16-01.svg) / [PNG](../h16/figures/h16-01.png) | 共同入口后分到各家族；注册/准入/执行不合一，统一结果不统一权限。 | PASS/PASS/PASS | 保持原图；[源/320对照](figures/qa/h16-01-review-pair.png) |
| h16-02 | [SVG](../h16/figures/h16-02.svg) / [PNG](../h16/figures/h16-02.png) | 角色图不画调用时序；WebRuntime选择、MCP每Server桥接与独立资源runtime；无ctx.mcp。 | PASS/PASS/PASS | 保持原图；[源/320对照](figures/qa/h16-02-review-pair.png) |
| h16-03 | [SVG](../h16/figures/h16-03.svg) / [PNG](../h16/figures/h16-03.png) | Web选择失败ready=true与明确false不同；MCP两阶段失败、断连保留、耗尽撤销和资源工具生命周期分列。 | PASS/PASS/PASS | 保持原图；[源/320对照](figures/qa/h16-03-review-pair.png) |
| h16-04 | [SVG](../h16/figures/h16-04.svg) / [PNG](../h16/figures/h16-04.png) | 上限1的受控顺序示例，File/stdio真实、Shell/Web/模型替身；5call结果下一请求，额外write被本地Scope拒绝。 | PASS/PASS/PASS | 保持原图；[源/320对照](figures/qa/h16-04-review-pair.png) |

自动记录见[visual-qa.json](evidence/visual-qa.json)：字体就绪、SVG文本边界/重叠、原图弹窗、caption、图片自然尺寸、页面无横向溢出；长代码块局部横滚。几何通过不能替代方向、职责和安全含义的审读。

作者实际查看16份源/320图对照，另查看H13-02/H15-04的390与H14-03/H16-03的1440。最低手机辅助字约12.6px是本尺寸下的几何值，不能据此保证低视力或所有设备阅读舒适；重要边界在正文复述且能打开原图。未做真实学员可读性研究。

新增测验预览另做3宽度：18折叠答案、键盘、4道适合选择预测题的控制与自评输入；自评不自动判开放题。作者查看最终q13-320、q17-390/1440与320顶部预览，长答案完整在截图内。QA04原始加粗标记暴露说明：交互/几何通过仍需人工看图；修正文案空格后新增DOM断言并重验，未改产品组件。
