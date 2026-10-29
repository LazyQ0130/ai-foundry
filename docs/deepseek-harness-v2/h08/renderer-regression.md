# H08 Renderer与三宽度回归报告

原始证据：[renderer-tests.tap](evidence/renderer-tests.tap)、[content-check.json](evidence/content-check.json)、[visual-qa.json](evidence/visual-qa.json)、[manual-review.json](evidence/manual-review.json)。既有平台组件与CSS未修改，使用实际parser、LessonMarkdown、PostCSS/Tailwind样式。

| 检查 | 1440 | 390 | 320 |
| --- | --- | --- | --- |
| 单H1/页面无横向溢出 | PASS | PASS | PASS |
| 四图加载、alt、图注 | PASS | PASS | PASS |
| 14折叠区默认关闭，键盘开合 | PASS | PASS | PASS |
| 四完整程序＋A参考JSON复制，LF规范化后与受测文件一致 | PASS | PASS | PASS |
| 长程序代码块横滚，不撑宽页面 | PASS | PASS | PASS |
| 七个思考答案完整可展开 | PASS | PASS | PASS |
| 四张原图真实弹页解码 | PASS | PASS | PASS |
| 私有静态预览，无失效复制按钮 | PASS | PASS | PASS |

静态HTML是当前正文的实际SSR，图路径映射到邻近文件；代码可选择复制，折叠用原生details。课程复制按钮的功能在另一份实际React挂载夹具验证，没有将静态页无水合按钮假装可用。

四图源SVG文字无边界溢出和文本相互重叠，系统中文字体实际可用；PNG为1280宽。最小字28，320课内图宽288，折算12.6px。原图语义和手机样本实际查看另有哈希记录；自动几何检查不能代替读图，所有视力与设备舒适度仍待真实试读。

既有Renderer测试9项全部通过。未验证真实产品鉴权页、进度API、线上私有媒体或真实用户学习效果。没有将截图放进public或改产品发布状态。
