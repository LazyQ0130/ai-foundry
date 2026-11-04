# H23 Renderer 与视觉复验

实际执行 `node --import tsx --test --test-reporter=tap tests/lesson-renderer.test.ts`，既有12项全部通过，原 TAP 在 [renderer-regression.txt](evidence/renderer-regression.txt)。使用用户当前的 Renderer/CSS 进行检查，没有将其已有修改包含进 H23 提交。

| 检查 | 实际结果 |
| --- | --- |
| 真实 LessonMarkdown + React createRoot + 实际平台 CSS | 本地作者夹具挂载，1440/390/320 三宽度 PASS |
| 13 份完整程序 | 每宽度逐份复制并和执行源文件比较，共39次一致 |
| 折叠 | 默认关闭、鼠标开合、键盘操作；12思考、四实践、综合和完整程序均可访问 |
| 正文/任务 | 四 checkKey 唯一；任务区、表格、长代码横向滚动限制在容器内；无页面横溢出 |
| 四图 | SVG 文字边界/重叠与字体加载检查、PNG生成；12个三宽度图样本及原图链接可用 |
| 静态阅读页 | 来自实际 SSR，保留折叠与相对图片；移除无脚本复制按钮；无 script，不接课程路由 |
| 资源 | SVG/PNG/可复现脚本均保留；无 Harness Web UI/业务鉴权声明 |

新增 H23 特定检查包括13份逐字复制、54源码断言与82处正文引用同步、四任务与12思考、31折叠、完整程序源同步、复现命令及25项等级口径。自动检查详情见 visual-qa/content-check；实际人工样本与哈希见 manual-review。

四图最小辅助字体约12.6px（320视口），当前作者样本可辨、无裁切/遮挡；不代替低视力审查、目标学员试读或独立外审。课程阅读器的真实浏览器交互，不是 Harness 产品 WebSocket、认证或 E 级端到端证据。
