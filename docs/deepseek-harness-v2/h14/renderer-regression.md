# H14 Renderer 与新增作者检查

既有Renderer测试12项通过，实际使用用户当前工作区版本，没有修改组件、CSS或原测试。原始TAP为evidence/renderer-regression.txt，check-*-renderer.json保留命令/输入哈希/退出值。

新增检查只在H14：实际parseLessonContent与LessonMarkdown SSR、四个唯一checkKey、六份完整程序与lab逐字同步、四图、21个默认关闭折叠（语法1+程序6+实践答案4+思考10），保存HTML与当前SSR一致。AST核Pipeline/BatchSettlement/ToolsService/Native/ToolCallRecovery成员，4个接口字段集合与3个函数位置。AST只证明结构存在，不替代行为验证。

1440/390/320真实React挂载均检查：图片decode与图注、全页无横溢出、六份程序逐一点击复制且与文件比较、全部折叠键盘开关、十题答案、四原图popup、移动长代码局部横滚、无pageerror/请求失败。静态页移除未水合复制按钮，保留details与相邻图片；不冒充产品登录页或完整无障碍审计。

负担信号：默认6482个CJK字/21行代码，含折叠8765字/253代码行。统计去代码/URL/注释，不换算成实测课时。图几何/字体与交互详见visual-qa，作者看图另记manual-review。
