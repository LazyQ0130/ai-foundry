# H13 Renderer 与内容检查

当前工作区既有 `tests/lesson-renderer.test.ts` 的 **12 项通过**，原测试与 Renderer 源文件没有被本课修改。使用用户当前未提交版本验证，不套用 H12 旧文档的9项计数。原始 TAP 在 evidence/renderer-regression.txt，带参数与哈希的记录为 check-*-renderer.json。

新增检查放在 H13 作者脚本：实际 parseLessonContent、LessonMarkdown SSR；四个唯一checkKey；七份程序与lab字节同步；4张图；21个默认关闭折叠区（7程序+4答案+10思考）；保存HTML等于当前实际SSR。AST核 ToolsService、执行器、SystemPrompt/Loop成员与5函数/5接口字段集合。AST证明存在及结构，语义仍由源码审阅和C/D行为负责。

三宽度1440/390/320的真实React挂载检查全部通过：七份程序逐份点击复制并与文件比对、全部折叠键盘开关、十题答案长度、四个原图popup、移动代码局部横向滚动、图片decode、全页无横溢出/无pageerror/无请求失败。静态页保留原生details，移除未水合复制按钮，图片映射相邻文件。没有访问课程数据库或产品路由。

负担信号：默认正文 6990 个CJK字、53 行代码；含折叠答案为 9295 个CJK字、333 行代码。统计去除代码/URL/注释，不能换算成实测学习时长。完整JSON见 content-check.json，视觉和交互见 visual-qa.json。
