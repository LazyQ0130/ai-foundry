# 问题处置与回归

依据[先行清单](issues-initial.md)作最小处置。原H09–H12正式正文、源图、PNG、实验、四份阅读预览及历史报告均保留，确认单课P0/P1为0。未为了统一措辞或增加diff而改正确解释；课程修订patch为空不是漏做核查。新增审查工具的两项P1已修复，无未决P0/P1。

| ID | 原始证据 → 修改 | 理由 → 验证 |
|---|---|---|
| M3-01 P1 | H12准备包只PREPARED → 新增25站统一执行模型、技术/依赖矩阵、五D探针、实际轨迹与16题 | 把独立课程接成可推导的完整执行过程；原144项复验+新增5项；每次Loop输入从Session前缀重建；四综合题要求中间值 |
| M3-02 P2 | 625–835分钟、H12辅助范围台阶 → workload公开统计/假设、依赖矩阵增加具体停顿卡 | 不删关键安全和失败知识；重新统计与历史一致，学习效果未声称已改善 |
| M3-03 P2 | 不同日期NOT_RUN与后课新覆盖 → 新矩阵逐用例核原始TAP与当前测试装配 | 只更新模块当前覆盖，不改历史报告当时结论；B/E保持未运行 |
| QA-01 P2 | baseline内容与Renderer exit0但Python打印✔编码失败 → runner stdout UTF-8 | 测试结果和报告程序错误分开；baseline原运行记录保留，final-content整体exit0 |
| QA-02 P1 | `evidence/cross-course/run-1793587048047.json`与同时间TAP，3例失败后取消门未到超时 → 按SessionStore.prepare真实返回Session直接调用derive/header/toolHistory，取消门增加Driver提前退出检测 | 不放松重建断言；原失败scratch与程序hash可查；后轮取消稳定退出，5/5 |
| QA-03 P1 | `run-1793587060477.json`，4/5，B期望callId实际undefined → 改为tool/result.data.message.toolCallId | 修新夹具字段，不改官方Schema/运行代码；下一轮5/5，保留错误关联断言诊断 |
| QA-04 P2 | `evidence/assessment-visual/failure-*.json/png`，390/391 → 独立测验预览长串overflow-wrap | 页脚Commit可折行；原失败保留，1440/390/320全部无溢出、全部交互通过 |
| QA-05 P2 | `evidence/final-audit-first-failure.txt`，验收结果自身尚未生成即查链接 → 延迟精确自身JSON目标的存在判断 | 不是放宽其他链接；最终结果成功写出后acceptance链接可达，原文件hash保持一致 |
| QA-06 P2 | `evidence/format-initial.txt`，题册/答案末尾多余空行 → 生成器规范单末尾换行 | 重新生成，HTML相同，暂存的作者文档/脚本空白检查通过 |

后续增强：B断言下一Step系统文本由简洁变详细且旧请求仍简洁，重新5/5；探针catch保存新的失败trace以便定位，而非只剩总数。未改上游实现，也未将答案负例说成实现级mutation testing。

回归边界：原144测试和四个错误答案负例在独立baseline复验；新增5项修改后重跑；172断言/443引用/1594文件核验；4课内容/AST与正式HTML SSR相等；共同Renderer12项；原16图与3宽度全查；新增16题计分/必需字段/本地链接及3宽度交互验收。未变的四课不另行反复跑相同业务测试凑次数，当前增强只重跑受影响新增探针。

`evidence/user-before.patch`记录用户既有产品改动；`workspace-before.json`保护所有基线文件。最终逐字节范围核验与暂存白名单在[acceptance.md](acceptance.md)。原始测试失败与所有临时fixture均保留，没有批量或递归删除。提交仅本独立目录；未自动制作H13或发布。
