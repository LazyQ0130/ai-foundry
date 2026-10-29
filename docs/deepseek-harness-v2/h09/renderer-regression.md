# Renderer与三宽度回归

既有`tests/lesson-renderer.test.ts`九项使用实际parser与LessonMarkdown，全部通过，原始TAP在evidence/renderer-tests.tap。未修改Renderer、样式或产品路由来迁就H09。

新增H09检查使用实际parseLessonContent、实际组件SSR和平台CSS，元数据五字段、四项checklist/checkKeys及全课程键唯一性通过；保存HTML与当前正文SSR逐字相符。五份折叠完整程序与受测文件逐字同步；八个AST成员定位核所属类与精确行，另核1590个固定文件字节、100个源码引用范围。

实际React createRoot挂载在localhost作者夹具，对1440、390、320分别检查：单一h1、四图decode/alt/caption、无文档横向溢出、15个折叠默认关闭且全部键盘开合、七思考答案内容、五完整程序剪贴板逐字一致、长代码块内部横滚、四原图打开可读、无脚本错误与失败请求。静态HTML也检查三宽度和四图，明确移除无水合复制按钮，保留原生details与可选择代码。详见evidence/visual-qa.json。

四图源SVG逐文字bbox与相交检查，Microsoft YaHei字体验证通过；PNG由浏览器从源SVG导出。作者实际查看四张母图、四张320课页含图注样本、390/320静态首屏、390展开代码、1440展开参考答案等，见带哈希manual-review。手机重要边界在正文重述，320图最小文字估算12.6px；低视力、其他字体/设备舒适度仍待试读，不称通用可访问性认证。

平台真实鉴权课页、媒体线上授权、进度接口、学习效果没有在此本地夹具验证；`/course-media`仅本地映射，素材没有写入public或对外发布。
