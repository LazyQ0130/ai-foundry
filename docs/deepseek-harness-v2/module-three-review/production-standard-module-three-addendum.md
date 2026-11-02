# 制作标准：第三模块增补

保留第一模块[作者标准v1](../module-one-review/production-standard-v1.md)与第二模块[增补](../module-two-review/production-standard-module-two-addendum.md)，不为升级版本号改成熟规则。以下只约束遇到复杂执行链的作者工作；作者研发标准可复用，真实学习效果仍须试读。

| 遇到的机制 | 新增具体要求 | 本轮依据 |
|---|---|---|
| 多层状态机 | 给具体输入与可观察状态，先最小轨迹，再相邻失败位置；实例/Turn/Step/Attempt/块分层计数，状态图标公开与内部不同 | maintenance公开idle，零Step，准备期1Step0请求 |
| 事件轨迹 | 每行标实时/Session/模型/工具/决策；关键边连实际函数与await/return；真实输出保留原seq和position，教学省略显式标注 | M3 A/B/C实际trace；不创造伪Session事件 |
| C/D证据 | 每项说明真实受测组件、实际跨边界断言、替身与未触发能力；必要依赖不重复记B/C，参数化按原TAP展开 | H09 D无模型、H11 D工具主要只Schema；144互斥矩阵 |
| 完整请求对照 | 同时保存Loop边界输入与Adapter实际输入；每次捕获相关事件前缀，核重建messages/header/tools/toolHistory；能力投影导致差异须解释 | 新探针从第二真实Session重建；Runtime可投影文件/图片/工具更新与Replay |
| 流与事实 | 区分原始chunk、Assembler块、消息值、实时帧、紧凑记录与结算；committed必须回查实际seq，abandoned不得补造事实 | 新D逐片expand对照，H12拒绝结算 |
| 失败/取消 | 至少一例成功、一例按阶段可控失败；本地signal和提供方终态分别判断；重试写明确决策与所在循环，不画无条件恢复箭头 | C-retry/cancel，H12 in-band-aborted；组合未测明确static |
| 综合任务 | 模块至少四项跨课因果推导，给必要前提、中间值、标准答案、推导、分项Rubric和误答解释；不靠术语命中给满分 | 16题中的A/B/C/D，100分自评但未校准 |
| 安全实验边界 | 优先受控Adapter、常量工具、新fixture-home与门闩；等待提前失败要报告，不无限等未到达门；不读取个人Home、不用真实模型凑E | 首轮探针等待缺陷与后续guard；无批量清理 |
| 失败历史 | 每次运行保留args/exit/stdout/stderr/程序hash/目录；诊断编码失败与测试失败分开；修夹具不算改官方实现 | QA01–03，baseline与时间戳探针记录 |
| 学习负担 | 字数/范围只是信号；把核心路线与辅助链接分开；公开正式稿与蓝图估时差异，通过分段例子降低同时处理的概念数 | 625–835分钟，H12辅助引用台阶；非实测 |

继续执行原门禁：先登记问题，再作最小有依据修改，保留原失败与前后差异，重跑受影响实验/断言/Renderer/视觉，核Git与保护范围。当前未确认原四课需修的技术P0/P1，不为显示修改数量而重写正确正文或图。
