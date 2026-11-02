# H15 13项交付验收

| 项 | 产物与状态 |
|---|---|
| 1 正式完整正文 | lesson.md，风险案例→机制→反例→实践→推导 |
| 2 HTML | reading-preview.html，实际SSR私有预览 |
| 3 四图 | figures/h15-01～04.svg/png、draw_figures.py、三宽度 |
| 4 四项实践 | A真实审批；B真实Pipeline；C真实Policy+模拟选择；D真实fs/观察，均完整代码和折叠详细答案 |
| 5 思考 | 10题折叠详细答案，前5题为配置/事件/轨迹推导 |
| 6 源码 | 52条事实与函数、实际路径/范围/官方测试参考/本轮等级；2218文件Git blob+SHA256锁定 |
| 7 C/D | 18 C + 13 D；原始timestamp运行、TAP、JSON与预期失败 |
| 8 原生覆盖 | 各平台进程runner NOT_RUN；Windows真实fs另列，不混计 |
| 9 Renderer | 既有12项 + 本课内容/AST通过 |
| 10 三宽度交互 | 1440/390/320及复制、折叠、键盘、原图、滚动通过；17图作者视觉检查 |
| 11 跨课衔接 | knowledge-bridge.md，保留复习与新增边界 |
| 12 H16交接 | h16-handoff.md，仅前置与未验证项，未开发 |
| 13 质量结论 | CONDITIONAL GO；作者内容与局部证据合格，未验证项独立保留 |

最终Git仅允许两条H15路径。保护文件逐字节核验与范围证据由final-audit写入validation.json；不修改价格、权限、数据库、发布状态或线上业务。
