# H10 Renderer与阅读检查

沿用既有parser、LessonMarkdown和平台CSS，没有改Renderer、产品路由或public。私有reading-preview是实际SSR，替换相邻图片路径，移除未水合复制按钮并说明可选择文本；代码复制在React真实挂载夹具另测，不能用静态按钮冒充交互。

既有9项回归全部通过，原始TAP见[evidence/renderer-tests.tap](evidence/renderer-tests.tap)：YAML/行尾/BOM与稳定键；坏metadata/旧JSON拒绝；Markdown/GFM/图注；七种教学块与默认折叠；指令白名单；原始HTML/脚本/危险URL隔离；固定resource注册表；已发布课程完整渲染/唯一键；全部已创作课文解析渲染/全局唯一键。这里没有新建重复的Renderer单元测试。

本课必要新增检查在check-content与preview-and-qa中，见[内容记录](evidence/content-check.json)和[浏览器记录](evidence/visual-qa.json)：

| 检查 | 1440 | 390 | 320 |
| --- | --- | --- | --- |
| 实际parser/SSR与保存预览逐字对应，恰一标题 | PASS | PASS | PASS |
| 正文/表格/代码无页面级横向溢出 | PASS | PASS | PASS |
| 4张图解码、alt/图注、原图打开 | PASS | PASS | PASS |
| 18个details默认关闭，全量键盘Enter开/关 | PASS | PASS | PASS |
| 8道思考答案可展开且有实质解释 | PASS | PASS | PASS |
| 6段完整程序实际复制与文件LF归一化逐字相同 | PASS | PASS | PASS |
| routing完整程序块内横滚，页面宽度不变 | PASS | PASS | PASS |
| 静态预览4图、无无效复制按钮、无溢出 | PASS | PASS | PASS |
| pageerror / requestfailed | 0 / 0 | 0 / 0 | 0 / 0 |

六段代码是support、trace-answer、routing、execution、branches、demo。检查也确认五元metadata、4个唯一checkKeys、6个程序与正文同步、官方MockAdapter逐字节未改，AST核Phase三分支/18个方法和公开接口归属。AST防定位错误，不用来代替控制流审读或C/D行为执行。

四份SVG为640宽、最小28px中文字体，浏览器核字体可用、文字无越界/相互重叠，生成2倍PNG并记录图源/成图SHA256。实际课页图宽为760、358、288px，最小文字约33.25、15.66、12.6px；尺寸不证明低视力或所有设备舒适。四图关键判断全部在正文另解释，均可打开原图。

作者实际查看12张三宽度图截图，以及三宽度的导入、展开答案、展开完整程序，共21样本；最终答案JSON改分行后重看，见[manual-review.json](evidence/manual-review.json)。未见裁切、中文缺字、重叠、误连箭头或妨碍操作的问题。实验程序长行在代码块内横滚是既有设计，完整复制另有实测。没有把几何脚本当作人工方向审查，也没有将作者看图称独立外审。

未验证：产品登录/授权课页、进度API、线上媒体映射、更多浏览器/低视力/真实学员设备。本课保持未发布，静态本地映射不代表线上可用。
