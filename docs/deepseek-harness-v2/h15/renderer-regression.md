# Renderer 与阅读验证

使用仓库当前真实parseLessonContent、LessonMarkdown及PostCSS/Tailwind编译的平台CSS，未改Renderer。Renderer既有12项回归通过，原始TAP见[renderer-regression.txt](evidence/renderer-regression.txt)。新增本课内容/AST检查见[content-check.json](evidence/content-check.json)：精确四项metadata/checkKey唯一性、4图、21折叠默认关闭、7份完整代码同步、四种闭合词汇、真实类/方法存在、effectivePolicy私有修饰、当前SSR与静态预览相等。

1440/390/320三宽度均通过：无页面横向溢出、图片/中文字体/图注正常、7个完整程序复制到剪贴板逐字匹配、21个折叠Enter开关、10题答案、4原图popup、移动代码局部横向滚动、静态页无失效复制按钮。静态页是私有审阅，不是有鉴权课程页面；真实课程路由、进度API、登录与移动设备实机未测。

四图SVG最小文字28px，Chrome生成PNG并检查text bbox无越界/相互覆盖。320页内最小折算约12.6px，提供已验证的原图入口；这不是可访问性完整认证。作者查看17份最终截图，见[manual-review.json](evidence/manual-review.json)，不是用几何检查替代视觉检查，也不是学员理解验证。

读取量：默认正文约8737个中日韩文字，总正文约11400个（均排除代码/URL/注释），完整代码255行，其中默认展开19行。统计不换算成已测时长；200～270分钟为作者三段估计。
