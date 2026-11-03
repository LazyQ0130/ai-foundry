# H18 最终交付验收

作者侧总体 **CONDITIONAL GO**，无未决确认P0/P1。所有证据只覆盖列明输入；详见[质量报告](quality-review.md)、[测试证据](test-evidence.md)与[最终门禁](evidence/validation.json)。

| 要求 | 交付与验收 |
|---|---|
| 1 正式正文 | course-content/internal/deepseek-harness/h18/lesson.md，五层→句柄→存储→恢复→Fork→兼容/保证表 |
| 2 HTML预览 | reading-preview.html，实际Renderer SSR，原生折叠，无失效复制按钮 |
| 3 四图及源 | figures/source四SVG、figures四PNG、draw_figures.py，中文alt/图注、固定Commit |
| 4 四可运行实践/答案 | handle/disk/recovery/fork，预测/命令/输出/故障/详细评分；13完整程序同步 |
| 5 真实综合 | agent.ts X，真实Loop/JSONL/官方Fork seed，新实例恢复与独立未来 |
| 6 折叠思考 | 14题，8事件/过程推导，完整原因与固定源码依据 |
| 7 源码断言 | source-checklist.md及50项JSON，位置/符号/结论/实际测试/等级；冲突单列 |
| 8 C/D与原始记录 | 24项C22/D2，错误答案exit1，所有lab失败/成功时间戳run留存 |
| 9 JSONL范围与平台 | jsonl-platform-coverage.md，原始/压缩/进程/物理/语义/迁移各分列 |
| 10 Renderer | 共同12项；H18元数据/key/程序同步/弃用禁入/所属类/真实SSR新增作者检查 |
| 11 三宽度与交互 | 1440/390/320，四图、39程序复制、32折叠键盘、14答案、代码横滚、原图，人工样本另列 |
| 12 前课知识衔接 | knowledge-bridge.md，H09/H10/H12/H14/H17/H18逐增量审查 |
| 13 H19前置 | h19-handoff.md，只交接窗口问题，不开发Compaction |
| 14 质量结论 | quality-review.md，内容/JSONL/Handle/Resume/Fork/恢复/平台/E/学员分别判定 |

范围保护：提交前baseline/hash/暂存清单，提交仅H18两目录，旧4096文件与用户其他改动保留。禁止批量删除；单明确产物unlink后保留空目录，综合/故障复核文件及scratch副本保留，未把全临时根自动清理记PASS。自动清理要求受用户AGENTS约束，不以递归删除换取形式验收。

未验证项独立保持NOT_RUN/PENDING：写迁移Worker、完整迁移/故障矩阵、真实断电、POSIX/NFS/跨登录会话、完整E、真实学员时长与外审。C/D通过不替这些结论。完成H18后停止，不自动开发H19，不发布课程。
