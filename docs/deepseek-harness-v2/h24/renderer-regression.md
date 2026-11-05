# H24 Renderer 与阅读交互

原有Renderer测试12/12，fail0，原始TAP见[evidence/renderer-regression.txt](evidence/renderer-regression.txt)。未修改Renderer或用户组件；验证使用工作区现有组件与平台CSS。

真实LessonMarkdown React挂载在临时localhost，Chrome headless检查1440/390/320三宽：页面无横向溢出、单h1、四图lazy实际加载、图注/alt/原图可打开、默认折叠及所有折叠键盘开关、代码容器横滚、14份完整程序复制42次逐字LF规范化匹配、15思考展开、A及综合长答案完整截图、静态HTML无伪复制按钮。静态阅读页实际SSR与正文一致。

四图保留SVG/PNG/生成脚本，几何和字体检查通过；图上真实/Mock/未验证分色，最小辅助字约12.60px，可打开原图。最终视觉样本与hash在[manual-review](evidence/manual-review.json)，作者实际看图；几何不替代语义，更多设备/低视力舒适性待试读。

这是真实浏览器的**教材Renderer**测试。未打开或验证Harness产品Web、登录态、真实Host/Connection/WebSocket/远程权限，因此不得计为产品Web或E。
