# H20 Renderer与视觉验证

当前工作区真实LessonMarkdown、parser、lessonMarkdown工具与平台CSS保持原字节。沿用的[12项Renderer基线](evidence/renderer-regression.txt)通过，未改测试求绿；用户原有Renderer改动仍保留。

H20新增检查：五字段元数据、4个全局唯一key、正文无H1、四图alt/caption、九份完整程序与文件逐字相等、四实践与综合答案、15思考与7推导、56条独立结论、真实类/方法AST、无新弃用同步读与agent/request监听器、静态预览与当前SSR一致。见[content-check](evidence/content-check.json)。

真实React挂载、实际CSS和Chrome在1440/390/320检查：无整页横向越界，四图加载/原图打开，九份代码复制逐字相等，29个折叠默认关闭且可键盘开关，15题答案逐项展开，长代码容器可横滚，A及综合答案完整捕获。静态页也逐宽度加载并验证原生折叠，不放未水合的复制按钮。见[visual-qa](evidence/visual-qa.json)。

SVG最小字号28；320实际图中文字约12.60 CSS px，390约15.66。字体已加载、文字无相交/越界。作者实际查看四图的全部12份宽度截图，以及320开头、A长答案、综合长答案，共15份终稿样本；数字串换行P2已调整分隔并复核。记录与hash见[manual-review](evidence/manual-review.json)，不称独立外审或真实低视力/学员验证。

全部预览与私有图放docs，教材/course-media只作本地映射，没有公开素材、产品课路由、权限、价格、数据库或发布构建。正式产品登录页、所有浏览器/辅助技术矩阵、真实学习效果仍未验证。
