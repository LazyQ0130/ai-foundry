# H22 准备与范围核对

研发基线为H21独立提交 `8ad7786`，上一集中审查 `0aeaa54`；开始快照见[evidence/workspace-before.json](evidence/workspace-before.json)。完整30讲蓝图通读并核H22–H24逐项规格，未重排课程。正式H22是《Workflow、Jobs、Goal 与任务调度》，唯一目标为“根据生命周期选择四种任务抽象，并画清它们的组合”；任务暂题只强调Workflow，已据蓝图补齐Jobs/Goal/Schedule。

必读输入：A-blueprint-v2.md、第五模块review-report/production-standard/h21-h24-handoff、H21正式lesson/quality-review/h22-handoff，以及E规范、第一模块v1与第二至第五模块增补。输入路径/hash及30讲标题见[evidence/preparation-inputs.json](evidence/preparation-inputs.json)。H21的21项C8/D13仅是前课报告，未混入H22计数；第五模块128项的修订分级不改写原报告。

沿用一份虚构项目审查。H21解释执行单元与Parent/Caller交付，本课新增编排关系、Run所有权、后台Job与长期目标/时间触发；H23的控制/订阅载体与H24综合门禁只交接前置。按照用户最后指令，完成H22即停止。

## 执行策略

真实固定源码、五棵隔离依赖树全量版本/integrity锁；C/D以真实Engine、Node PTC及正式Windows ACL runner为核心。不得因原生环境失败而切换unrestricted。作者实测read-only/partial，native worker与runner仅作源码打包，不改官方源码、Schema或权限决策。

保留上游Vitest作静态setup/action/assertion参考；其递归清理不执行。新fixture、JSONL、Schedule JSON和junction全部保留。未用真实外部Provider/Agent、个人Home/项目或凭据，无付费调用；没有创建应用自动提醒或系统计划任务。

## 负担控制

先最小单子级，再parallel，再pipeline，最后取消、记录与四抽象组合。精读5个主文件，PTC/Realm/Host Binding细节和11份长程序折叠，关键安全与恢复限制保留主线。三个可交付停点55–75、65–90、90–125分钟，合210–290，为作者估计，环境准备另计。蓝图130–180增加80–110，前课180–250增加30–40；真实运行环境与扩展验收要求导致负担增加，保留W01 P2，不声称实测减负成功。

范围保护包括研发前4963个文件（追踪、原有未追踪及output），当前用户已改Renderer/CSS/Auth等文件保留。只允许 `course-content/internal/deepseek-harness/h22/` 与 `docs/deepseek-harness-v2/h22/` 新交付；无发布、数据库、权益、价格或课程目录变更。
