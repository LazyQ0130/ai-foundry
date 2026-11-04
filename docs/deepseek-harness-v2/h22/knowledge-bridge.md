# H21 → H22 技术与教学衔接审查

作者自审；没有独立第二审稿人。H21正式lesson、quality-review及h22-handoff以 `8ad7786` 为基线保存，未改前课正文。

| 前课已交出的契约 | H22新增可观察产出 | 防止偷换 |
| --- | --- | --- |
| Runtime按名选Provider，Activation管理一次委派 | Engine是单一服务；脚本组织一组Activation | 不是把两种registry同构化 |
| Subagent工具Parent Delivery先回childId，后发settled | Workflow前台等待聚合，Host用Caller Delivery | 不能把前台画成H21异步回执 |
| 父身份、Registry owner、Session lineage分别核 | A/B/C都归同一父Agent，依赖图A∥B→C | 依赖边不是父子树边 |
| Fork取已完成前缀，Spawn全新Session | 综合使用Spawn并显式给事实与model脚本 | 未重复Fork实验或暗示自动继承 |
| interrupt/cancel不是完整释放 | Run等待在途start、已发布子级和进程 | result/end与资源清理按实现分层 |
| 消息/结果/日志各通道有条件 | runtime事件、四类Session日志、ToolResult/Job通知分路 | 不把所有log当父模型输入 |
| 容量准入与深度由消费方政策决定 | Workflow槽/总量/item/PTC与Subagent容量互动 | Host未传maxDepth，不能偷用工具默认1 |

主线不重讲全部Spawn/Fork/冷消息基础，只自足复习六分钟；Stage4旧Workflow按状态衔接，与Harness脚本/PTC明确区分。旧课可选链接不构成新课权限前提。D1用真实父Loop+三个子Loop、真实Session/JSONL和Mock重验新增边界，不把H21旧证据算成新测试。

H17日志/Surface用于解释log-only不进模型；H18用于区分新实例读取与旧Promise恢复；H20用于取消排空、未知副作用不能重放。H22未作Compaction/Retry新验证，不把这些相邻机制因为依赖存在而标PASS。H21未验证的外部Provider、Host UI、Preset和E级边界仍保持未验证。

作者审阅未发现当前两课术语、交付方式或资源所有权冲突。仍有阅读负担P2：长夹具与跨五层预算同时出现；默认/展开文字和估时见质量报告，学员效果须实际试读。
