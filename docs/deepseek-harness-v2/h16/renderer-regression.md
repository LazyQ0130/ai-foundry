# Renderer与阅读检查

既有Renderer12项通过；内容/AST检查使用真实parser和LessonMarkdown SSR，检查metadata/checkKey全局唯一、9完整程序、4图、24折叠默认关闭、10思考题与综合答案、实际组件/接口、图片注册调用无when等。源码AST只证明结构，运行行为看C/D。静态HTML与当前SSR逐字核对，未改Renderer或业务路由。

1440/390/320均验证：无页面横向溢出；图片加载/字体/图注；9程序剪贴板逐字匹配；24折叠Enter开闭；10答案；4原图popup；移动代码局部横滚；静态页无无效复制按钮。长答案截图暂增viewport高度以完整截取，DOM同时记录末段；不把截图截取问题算产品缺陷。17份最终PNG经作者view_image检查，非独立视觉审计。原始结果见[visual-qa.json](evidence/visual-qa.json)与[manual-review.json](evidence/manual-review.json)。

默认正文约8348个CJK字，总约11260字，代码302行、默认展开2行；排除代码/URL/注释的计数不代表实测时长。SVG最小文字28px，320折算约12.6px，原图可打开。真实登录课程页、进度API与设备实机未测。
