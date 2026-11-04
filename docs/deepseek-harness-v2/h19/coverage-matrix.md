# H19 验证覆盖矩阵

固定源码 `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`。本轮 34 个 TAP 执行项互斥计为 C19/D15；一个执行项内多个断言不拆成额外测试。实践名称 A/B/C/D 与证据等级无关。原始 [TAP](evidence/lab-tests.txt)、[总体结果](evidence/lab-results.json)、[程序 hash / 启动参数 / 标准输出](evidence/) 可对照。

| 范围 | 本轮实际断言 | 原始测试 | 等级 / 边界 |
|---|---|---|---|
| TokenMeter 基本估价 | 空0；system5/user9=14；Schema22；新增12后48；工具结果9、提议/结果两节点；快照冻结；替换节点数不增 | A | C，内存 Session |
| Provider Usage 锚点 | 一致持久流1170；新增用户1179；temperature变化回退；过小Usage拒绝复用 | A | C，脚本Usage，未连接Provider |
| UI / 启发式构成 | pressure1120；breakdown5/22/39，与total非同义 | A | C，当前夹具投影 |
| 路由图片与文件 | 相同图111/2011；省略12；heuristic不变；官方文件句柄投影相等 | A | C，适配器声明价格 |
| 工具剪枝 | 等于阈值不剪；250码点→159；Unicode头尾与图片顺序；原事实保留；两事件；重复noop | B | C，开放Turn，真实Pruner |
| 选区与正常提交 | system保护、平衡前缀、来源列表、summary/replace/end顺序 | C:success | C，真实Basic/Runtime |
| 无范围 / 配对 / 压力不足 | noop、unbalanced、below | C 对应分支 | C，不写本次开始标记 |
| 失败摘要 | throw、非缩减、max-tokens、图片输出、取消；已有前缀不改，error end | C:failure/nonshrinking/max/image/cancel | C，模型输出受控 |
| 安全文本与原输出 | reasoning/tool-call/text原输出保留，检查点只用text | C:rich | C，不执行输出中的工具 |
| 日志锁 / 一致性 | 活动拒绝；新end-seed之前残留可越过；全Surface改变拒绝 | C:active/stale/changed | C，合法组件夹具 |
| 部分提交 | user替换拒绝留下summary；end拒绝留下新Surface与活动锁 | C:partial-commit/end-failed | C，append入口故障注入，非磁盘故障 |
| 策略数值 | T7000/R1440；小窗口默认headroom无效；互斥retain配置拒绝 | C:policy | C；精确modelPolicies覆盖全矩阵仅静态 |
| 正常自动触发 | below继续；pressure摘要进入下一请求并保留answer3 | D:below/pressure | D，真实Loop |
| 修剪后免摘要 | 普通请求2/工具1/摘要0；prune一次 | D:prune-only | D，真实Loop/Pruner |
| pre-step 失败 | 摘要error end，普通请求仍1，Turn完成 | D:pre-step-failure | D，受控摘要失败 |
| Overflow 与有界重试 | attempt后同Step压缩；两次普通调用；持续失败停止；无进展一次即停 | D:overflow/overflow-limit/no-progress | D，规范错误由Adapter生成 |
| 模型切换 | 旧large摘要→small请求；失败普通调用0且旧header保留 | D:switch/switch-failure | D，容量large100000/small2000 |
| 非窗口失败 / 取消 | SERVER不压缩；摘要期间取消，无普通请求且Turn闭合 | D:failure/cancel | D，取消门控安全释放 |
| 手动维护与FIFO | 同步busy；新输入分Turn FIFO；范围外inject保留 | D:manual-fifo | D，未验证任意第三方异步库取消 |
| 图片省略 | 同附件不同出现位置；重复目标拒绝；占位；取消；summary-error中同标记重试 | images | C；真实图片Provider/Loop request-error路径未验证 |
| 人类命令 | 空参数、run/done、summaryseq关联、无普通任务请求；非法参数拒绝 | humanCommand | D，真实Commands；产品UI未验 |
| 手动检查点失败 | 已闭合尝试保留；Surface已变；错误分类persistence | manualPersistenceFailure | D，人工flush监听器故障，非OS I/O失败 |
| 完整预算轨迹 | 1292→2830→1367→174；原前缀保留；39条有效历史；Surface[4,37,32] | X | D，真实Loop/Basic/JSONL none |
| 保存与恢复后请求 | 真实flush、关闭；新Context/新后端；真实agents.resume；消息逐对象相等；旧模型/工具0；新请求只读有效历史 | X | D，真实磁盘，同进程新实例 |

## 持久化和环境维度

| 项目 | H19 本轮状态 |
|---|---|
| 内存 Session | 已验证 A/B/C/D 与 extras；不冒称全是持久格式有效轨迹 |
| 原始 JSONL / Windows 本地临时磁盘 | 已验证 X，compression:none |
| 同进程恢复 | 已验证，关闭旧Context与后端后新建两者 |
| 独立后端实例重读 / Resume | 已验证 X；不是仅复用旧对象 |
| 独立进程、跨进程写所有权 | 未验证；H18历史结果不转记 |
| 默认Zstd、撕裂尾、写迁移、真实断电 | 本轮未验证 |
| 其他OS、网络盘、跨登录会话 | 未验证 |
| 活动或残留compaction跨崩溃恢复 | 当前只做C级标记/end-seed机制；X只正常闭合后恢复 |
| 真实Provider费用、Tokenization、缓存命中收益、真实摘要质量 | 未验证 |
| E级完整应用、真实学员、独立外审 | 未验证 |

## 数字的取样边界

X 的 long 和 afterPrune 在工具结束、下一 Assistant 之前采样；afterSummary 是任务结束后的手动维护。不能把每个差值都当作同一请求的精确节约。所有预测使用受控Adapter和固定Meter解释规则；只证明实现行为，不提供无限容量、无损记忆或外部副作用恰好一次保证。
