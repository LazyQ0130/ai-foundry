# H09/H10/H12/H14/H17→H18 知识衔接

| 前课已建立的能力 | H18具体新增与核对 | 仍保留的边界 |
|---|---|---|
| H09 create/resume发布、caller/Handle/factory、历史与runtime父级 | resume先write-open/read/修复再prepare；X关闭后新对象，D普通Fork不加parentSession | 不把持久谱系当实时owner，不重复完整初始化失败课程 |
| H10 Turn/Step/Attempt与失败时刻 | C按开放Turn/Step补closer，闭Step旧缺结果不追修；resume继续Turn2 | completed非业务成功；H20才深讲重试/取消预算 |
| H12实时chunk、紧凑流与message/attempt结算 | 仅已存事实可重读；未结算stream不恢复；X保留原消息/头再做新请求 | 不把子进程终止当模型中断全矩阵，不恢复原Adapter连接 |
| H14提议、调度接手、工具结果与源关联 | NOT_STARTED/UNKNOWN及call源引用；Fork提醒父可能在切点后完成 | tool/call不证明主体成功，缺result不证明无副作用 |
| H17日志/Surface/deriveMessages、Seq/Offset、end-seed与flush反例 | 真JSONL落盘/新进程；含boundary继承数；tagged继承标记与普通resume标记 | 不重讲完整消息投影；新lab无弃用同步读取API |
| Stage4.6的业务表/未知写结果 | 自足6分钟回顾，并对照事件日志与句柄 | 不假定原课权限，不冒称同名Session/Run实现相同 |

H17 D与H18 X原始受控轨迹都为16事件，但不能把H17 X的确定性16条组件轨迹和H18真实Loop混用：前者Surface替换用户3，后者call在9。H18 D又是0～13多Turn组件输入。正文分别给输入/输出，图四只用H18 X。

H17“构造重建多一个end-seed”在H18细化：普通resume仅在完整seed未以marker结尾时追加普通marker；新Fork在精确cut拥有tagged marker并在其后闭合。X的16→17是本输入结果，不是任何resume必增1的定律。H18还用新程序证明“挂了监听且Store.flush=true，但writer已关则内存3磁盘2”，继续强化旧反例。

前置输入身份在[evidence/preparation-inputs.json](evidence/preparation-inputs.json)。阅读含30讲蓝图、四模块报告及全部增补标准、前课指定主线、H17正文/实践/断言/质量与H18交接；源码语义与实际行为按source-checklist/test-evidence另列，不以hash枚举冒充审读。

H18对外部幂等只建立判断规则，不开发完整重试引擎；对上下文窗口只提出后续问题。H19/H20仍有独立产出。H18完成不自动开发H19，不发布课程。
