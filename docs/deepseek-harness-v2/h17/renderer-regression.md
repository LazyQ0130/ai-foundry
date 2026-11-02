# Renderer 与三宽度证据

真实parseLessonContent、当前工作区LessonMarkdown与平台CSS参与验证；没有修改Renderer或用户界面代码。已有Renderer **12项通过**，TAP记录见[evidence/renderer-regression.txt](evidence/renderer-regression.txt)；H17特有内容检查见[evidence/content-check.json](evidence/content-check.json)。

新增检查涵盖五字段元数据、4个全局唯一checkKeys、正文无H1、4图私有路径/图注、25个默认关闭折叠、12思考答案、四实践/综合答案、8份完整程序逐字同步、Surface数组与源引用代码正常保留、弃用同步读取调用禁入、实际类成员定位和HTML与当前SSR一致。这些是契约检查，不评价学员是否理解。

1440、390、320各挂真实React/CSS：4图加载/几何/图注，8份完整程序实际复制，共24次精确LF规范化匹配；全部折叠键盘Enter开关，12思考逐个展开；B代码在窄屏横滚；4原图弹页逐个加载。文档无横向溢出、无浏览器pageerror或失败请求。另看长A答案和综合X答案完整截图。

静态reading-preview来自实际LessonMarkdown SSR，映射相邻私有PNG；移除未水合的复制按钮，可原生折叠。静态3宽度无文档溢出，不把有按钮但不工作的静态HTML冒充复制已验。

四张SVG保留在figures/source，生成器为scripts/draw_figures.py，PNG在figures。Chrome检查中文字体可用、所有文字在viewBox内、文字无几何重叠。重要限制仍在正文：replacement不删日志、只部分事件产Message、append不承诺fsync。

320宽度最小图字约12.6px，390约15.66px；作者看图可辨，不代表低视力或更多设备已经舒适性验收。实际查看的最终文件与hash在[evidence/manual-review.json](evidence/manual-review.json)；浏览器自动截图不替代人工语义审读。

只创建临时本机服务器，结束后关闭；没有登录产品页、连进度API、注册公开课程或发布媒体。认证产品流程及真实学员阅读仍未验证。
