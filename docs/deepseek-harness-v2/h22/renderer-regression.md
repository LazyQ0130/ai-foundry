# Renderer及视觉回归

实际命令 `node --import tsx --test --test-reporter=tap tests/lesson-renderer.test.ts`，当前用户已有Renderer修改一字未改。12/12通过，完整TAP见[evidence/renderer-regression.txt](evidence/renderer-regression.txt)。

| 序号 | 既有回归身份 | 状态 |
| --- | --- | --- |
| 1 | V2 parses YAML and Markdown with LF, CRLF and BOM; preserves stable keys | PASS |
| 2 | V2 rejects missing, malformed, duplicate or unsupported metadata and old JSON | PASS |
| 3 | Markdown renders headings, prose, formatting, code, GFM, links and captioned images | PASS |
| 4 | all seven teaching blocks and image placeholder render; prompt copies only its code; deep dive is closed | PASS |
| 5 | directive allowlist rejects arbitrary components/attributes and malformed prompts | PASS |
| 6 | help extraction ignores prose and fenced examples and uses the directive allowlist | PASS |
| 7 | help extraction preserves ordered blocks, exact Markdown, references and nested teaching blocks | PASS |
| 8 | help panels cover all authored courses without duplicating article IDs, including 19 troubleshooting blocks | PASS |
| 9 | raw HTML and scripts never execute; unsafe URLs and forged custom elements are removed | PASS |
| 10 | resource renders only fixed registry IDs; rejects arbitrary URLs, paths, attributes and forged HTML | PASS |
| 11 | published courses render in full with unique stable progress keys | PASS |
| 12 | every authored lesson parses and renders with globally unique progress keys | PASS |

H22附加检查：五元YAML、4任务/4全局唯一key、无正文H1、46准确范围断言、11份完整代码与文件同步、12折叠思考答案、4合法图片/图注、无新旧式Session读取、SSR预览逐字一致。长完整程序折叠，不新增Renderer能力或发布路由。

真实LessonMarkdown由React createRoot挂载，使用现有index.css经PostCSS/Tailwind编译。Chrome localhost私有夹具按1440/390/320运行，四图lazy加载后decode；SVG中文字体、文本边界/重叠核验并导出PNG。每宽11份完整程序实际复制并逐字比较，共33次；全部29折叠区Enter开关、12答案长度、图片原图popup、长代码块内横滚、页面无外溢、无JS错误与失败请求均通过。CSS/table容器不横向撑开页；最小辅助图字约12.6px，不当作低视力可用性认证。

静态reading-preview.html来自同组件SSR、同CSS；仅把作者图片映射相对路径并移除无事件绑定复制按钮，不装成有死按钮的产品页。每宽检查静态图片4张、折叠/无溢出、copy按钮0。实际React的复制交互单列，不将静态HTML当作已接线上路由。

作者实际查看四张320配图、320实践A长答案、390综合答案、1440/390开篇及320实践B完整程序，具体hash和观察见[evidence/manual-review.json](evidence/manual-review.json)。SVG源、PNG、逐宽截图与原始浏览器报告齐全；几何检查不替代方向、因果和教学审阅。

未验证鉴权产品页、进度API、线上媒体、更多浏览器/设备、低视力体验或学员理解。未执行发布构建，无public素材/目录/权限/价格变更。
