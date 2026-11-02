# H17 交付验收

作者侧 **CONDITIONAL GO**；无未决确认P0/P1；仅内部研发，不发布。机器最终门禁与范围保护见[evidence/validation.json](evidence/validation.json)，实际行为见[test-evidence.md](test-evidence.md)。

| 要求 | 可审查交付与结果 |
|---|---|
| 1 完整正文 | course-content/internal/deepseek-harness/h17/lesson.md；覆盖14部分主线、逐概念输入输出及边界 |
| 2 HTML阅读预览 | reading-preview.html；真实Renderer SSR，静态折叠可用 |
| 3 四图与源 | figures/source四SVG、figures四PNG、draw_figures.py；图注/alt/固定Commit齐全 |
| 4 四可运行实践/答案 | lab的append/surface/projection/agent；正文8完整程序逐字同步；单项和总入口 |
| 5 综合推理 | trace.ts、trace-fixture.json、正文16行事件表/9项问题/详细评分；真实Session与Registry核对 |
| 6 折叠思考 | 12题，5题事件/代码推导，答案解释依据 |
| 7 固定源码断言 | source-checklist.md、source-assertions.json；38项带位置、符号、结论、行为/证据等级 |
| 8 C/D与原始记录 | 20项C17/D3通过；成功/失败/拒绝结算；全部时间戳raw run留存，错误答案断言失败 |
| 9 Renderer及新增检查 | 现有12项通过；H17元数据/唯一key/程序同步/数组/弃用禁入/SSR检查 |
| 10 三宽度/交互 | 1440/390/320无文档溢出；折叠、键盘、24份完整程序复制、原图、代码横滚；作者实际看图另存hash |
| 11 知识衔接 | knowledge-bridge.md；H10/H12/H14及H03/H09/H11/H16的增量与证据 |
| 12 H18前置 | h18-handoff.md；只交接，未开发持久化/恢复/Fork正文 |
| 13 质量报告与范围 | quality-review.md区分内容、事实、Surface/Projection、持久化和学员；final-audit核保护字节与暂存路径 |

未验证项目不是自动验收失败的隐藏项，也不计PASS：真实后端/JSONL/硬崩溃/跨进程/Fork、完整Harness应用E、真实Provider/协议/原生进程隔离、真实学员效果/时长和独立外审。作者GO不代表这些能力已验证。

不发布课程，不开发H18，不修改原价格/权限/数据库/线上业务。不批量删除任何目录或文件。提交只允许H17两目录；原H01–H16、四次审查、历史证据、output与用户其他改动全部保留。
