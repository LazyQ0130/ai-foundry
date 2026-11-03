# H18 Renderer 与阅读交互

使用仓库当前真实parser、LessonMarkdown、平台CSS；用户在这些文件中的原有改动不重写。静态HTML由实际SSR生成，/course-media只在作者localhost临时映射，没有公开目录/课程路由接入。

共同Renderer回归执行 `node --import tsx --test --test-reporter=tap tests/lesson-renderer.test.ts`，12项结果保存evidence/renderer-regression.txt。H18新增作者检查在check-content.ts：五元字段、4个全局唯一key、唯一页面H1、4图/图注、14思考/完整答案、13完整程序逐字同步、实际SSR相等、无新弃用同步读取调用、真实所属类/成员AST辅助定位。AST不代替行为测试。

真实React挂载在1440/390/320检查文档宽度、图片decode、默认折叠；13程序各宽复制，共39份与源文件LF规范后完全一致；长代码横向滚动、32折叠键盘开闭、14思考、4图原图popup均检查。静态预览不保留无水合复制按钮，原生details可用；长A与综合答案独立完整截图，防长页面裁切掩盖尾部。

四图SVG源经真实Chrome导PNG，核Microsoft YaHei字体、文字bbox和互相遮挡，三宽度正文截图含alt/caption。机器通过后另实际看源图/320样本/答案/首屏，文件与hash在manual-review.json；图二的箭头错误由实际审读发现并修复，几何检查不能替代语义。

evidence/content-check.json和visual-qa.json绑定当前正文及实际Renderer哈希。没有声称产品鉴权页、进度API、独立学员、低视力设备或线上媒体已验收；平台完整typecheck/build不在此次内容交付范围。
