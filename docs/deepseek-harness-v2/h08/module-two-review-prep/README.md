# 第二模块 H05–H08 集中审查准备包

2026-10-29。状态：**PREPARED / REVIEW NOT STARTED**。本目录是H08交付的一部分，只汇总既有材料、设计未来审查路线；没有开展集中审查、修订H05–H07或发布课程。

| 课 | 主问题与关键知识 | 实践与原始证据 | 图示与质量材料 |
| --- | --- | --- | --- |
| H05 | 能力如何按Plugin/Service/Context连接；类型不创建实例 | 普通接口A＋真实Cordis B；[9项历史证据](../../h05/evidence/lab-results.json) | 三图；[质量报告](../../h05/quality-review.md) |
| H06 | 发布、监听、五种分发与Waterfall返回/短路 | 五模式、请求四路径、真实事件定位；[27项历史证据](../../h06/evidence/lab-results.json) | 三图；[质量报告](../../h06/quality-review.md) |
| H07 | Fiber状态、Effect、Disposer与持续依赖 | 状态、资源、Provider恢复；[24项历史证据](../../h07/evidence/lab-results.json) | 三图；[质量报告](../../h07/quality-review.md) |
| H08 | 有序配置、完整config替换、身份与动态重组 | 五层推导、真实Loader、Profile/App Boot故障；[20项本轮证据](../evidence/lab-results.json) | 四图；[质量报告](../quality-review.md) |

四课共13张图、11项实践、19道思考题。测试数来自不同层级与历史运行，不能相加当模块覆盖率、理解率或完整应用通过数。H05–H07证据保留原时点，本轮没有宣称重新执行了它们。

先读[知识递进](../knowledge-bridge.md)，再读[待审议题](review-agenda.md)、[跨课题候选](assessment-candidates.md)与[验证边界](verification-boundaries.md)。[artifact-inventory.json](artifact-inventory.json)记录正文、图、实验与报告路径/哈希，供未来审查固定输入，不复制或覆盖原课。

连续学习的作者估算合计485～645分钟，约8小时5分～10小时45分；蓝图原估算315～430分钟。增加主要来自真实运行反例、失败路径与详细答案。两组都是估算，实际学习时长、提示次数、负担与迁移效果未测；集中审查应先决定试读分段，不能以平均字数直接核定课时。

模块一制作标准v1.0已经用于H08：关键概念默认可见、实际控制流、原图和三宽度、完整代码复制、未运行层级分账。模块二是否还需修改标准，留未来授权审查决定。本包不颁发新的模块GO或发布许可。
