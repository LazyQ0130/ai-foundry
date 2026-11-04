# 全部正式配图统一审查

四份figures.json确认**16张**正式核心图，均有SVG源、PNG导出与正文引用。源位于`../hNN/figures/source/hNN-0K.svg`，PNG为`../hNN/figures/hNN-0K.png`。本轮导出位于`evidence/hNN/visual/figures/`，未覆盖原件。[逐图hash](evidence/figure-rerender.json)确认16/16重新导出与正式PNG字节相等。

|图ID|核查重点|判断|
|---|---|---|
|H17-01|Event Log/Surface/Projection分层，教学简化生命周期有标注|通过；不把每个日志当消息|
|H17-02|合法位置替换、原6变7、消息4变3、空developer不产消息|通过；原日志保留|
|H17-03|并行读模型、Surface与Registry职责不同|通过；不是Projection注册出全部历史|
|H17-04|真实Loop D的Seq分栏与flush接口边界|通过；未挂持久后端明示|
|H18-01|Persistence/Store/Handle分层、工厂取得writer|通过；普通Session不自动落盘|
|H18-02|通用契约与JSONL具体写路径分开|通过；200ms不是通用耐久保证，未声称断电验证|
|H18-03|物理有效尾与开放语义尾修复|通过；不画成删除完整事实|
|H18-04|含Seq9切点、marker后forked closer、独立未来|通过；无工具重放箭头，普通/持久分支分开|
|H19-01|X中36 summary仅日志、37 user替换、原事实保留|通过；有真实JSONL新实例边界|
|H19-02|W/O/B预算、Usage锚点、估计与路由价格|通过；UI值不冒充决策/账单|
|H19-03|start/summary/replace/end与失败/新生命周期|通过；逐事件提交不是全回滚|
|H19-04|Pruner码点/Token UTF-16、图片持久投影|通过；不是物理删除附件或等价摘要|
|H20-01|规范失败/日志/模型可见性/工具授权分层|通过；非所有中间件错误都进request-error|
|H20-02|真实A轨迹、计划/等待/started/成功分开|通过；虚拟时间不冒充性能|
|H20-03|取消控制信号、started工具排空/不回滚|通过；无任意进程强杀保证|
|H20-04|同一原始前缀的两种未来与未知工具结果|通过；Map幂等是教学策略，非通用Harness保证|

## 统一术语与视觉证据

事件名统一使用实际`user/message`、`assistant/message`、`assistant/attempt`、`tool/call`、`tool/result`及compaction/retry原名；不存在用summary日志自动喂模型、用Retry重跑全部工具、或用Fork重演历史的错误箭头。不同图省略的事件在图注有说明，不能把图上每条箭头当异步瞬间完成。

四课各1440/390/320共12个视口自动检查：图加载/alt/图注/展开原图、details键盘开合、全程序复制、代码横向滚动、静态预览和文档不溢出。母版与320宽截图的8份联系表（每份4图）实际人工看图；这覆盖16图各母版/窄宽样本，未宣称人工逐像素审完全部长课截图。文件为`evidence/h17-master-contact.png`至`h20-master-contact.png`、对应`hNN-320-contact.png`。

320宽下缩放文字约12.6px，能读但密集图建议点“原图”放大。原图打开实际通过，不把小屏舒适度说成经过真实用户研究。没有确认原16图P0/P1，因此不改源文件或更换正文引用；重导仍保留本轮证据。

## 新增模块图与测验

新增四份SVG/PNG为统一模型职责导航，完整条件/分支在[flowcharts.md](flowcharts.md)，不代表固定唯一运行顺序。新图初版预算T漏floor及长页浏览器栅格导出不完整已登记M5-QA03；改源公式并采用sharp/librsvg完整画布导出，中文字体/文本边界检查通过。四图最终[联系表](figures/qa/module-diagrams-contact.png)已实际审读，标题、背景卡、连线、脚注完整；SVG及PNG同步。

18题预览1440/390/320无文档横向溢出；18个答案均键盘可开关，筛选/笔记/自评分限幅正常。人工看过Q14与Q18的320宽完整答案、390宽入口，H17新增阅读路线320宽样本也已看过。参考[assessment-qa](evidence/assessment-qa.json)与各截图；不把自动几何检查代替人工成图审读。
