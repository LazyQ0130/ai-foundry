# H21 行为覆盖与证据边界

有效TAP执行项21=C8/D13；A/B/E没有单列执行项。必要Cordis依赖不重复算B，demo、历史重跑、同fixture多断言和X复用C不增加数量。逐项身份/原始run见[evidence/test-index.json](evidence/test-index.json)、[lab-results.json](evidence/lab-results.json)，完整事件见behavior-traces.json。

| 执行主题/测试名 | 真实对象与输入 | 等级/数量 | 实际限制 |
| --- | --- | --- | --- |
| A registry / capabilities / cancel-start | Runtime具名注册/能力拒绝/预取消；真实父实例，未运行子模型 | C3 | 不是完整Host设置或所有能力组合 |
| A no-persistence / caller | 本地Spawn、Factory、Loop、Session与Mock，parent缺持久拒绝、caller临时运行、无通知却有本地目录 | D2 | 父实例创建但无父模型调查；JSONL只在caller场景启用 |
| B spawn / child-failure / post-accept-abort | 真实父先完成Turn，独立子Scope/Session，受控正常/模型失败/原启动signal晚取消 | D3 | 没有权限服务和OS沙箱；付费模型未连接 |
| C completed-prefix / empty | 父有已完及当前开放Turn、真实Fork与普通Session Fork、逐前缀/marker/独立未来 | D2 | 保持继承模型路线；不是任意模型覆盖测试 |
| D messages | 真Inbox、消息回执与Step steering、子→父、非相邻拒绝 | D1 | 不宣称持久邮箱、网络或exactly-once |
| D cold-resume | 真JSONL、旧子释放/同ID新Agent与writer；Provider撤销后继续，旧dispose隔离 | D1 | 同进程同Context；未做跨进程恢复 |
| D limits-tree | 真子/孙Agent、共享池、深度、两级列表、非相邻发送拒绝、中断不杀孙及dispose释放名额 | D1 | fixture配置cell动态值，未跑Host UI或全部竞争窗口 |
| D interrupt | 真队列保留、回执先于idle、唤醒后续FIFO及完成 | D1 | 门闩最终合作放行，不保证任意外部可强杀 |
| X | 官方模型委派工具→子局部工具→send_message→父继续→结算→冷继续；附C比较 | D1 | Mock模型/常量工具；两种完成通知时序只代表本输入 |
| boundary tool-registration / external-cleanup / teardown-failure / startup-abort / parent-replaced | 真Runtime/Manager/模型注册，受控外部执行句柄，清理、启动取消及精确父身份 | C5 | 外部run为自制协作者，0外部Agent/0协议/PID；不得标E |
| persisted discovery | 真实子执行及JSONL关闭，新Context/Backend点读目录，0 Agent/0新模型调用 | D1 | 新实例不是新PID，更不是真实崩溃 |

真实持久化范围：Windows、JSONL none、新临时根、显式父flush、子结算/关闭、读回原前缀、同Context冷恢复、新Context只读发现。未覆盖Zstd、独立PID续跑、断电、全物理故障矩阵、最终flush故障注入。读取的是隔离虚构Session，未访问用户Session。

静态而非动态：Preset选择/恢复、delegation权限策略、结构化输出、Host用户覆盖链、ACP/DSH SDK/Codex/Claude Code具体后端、Agent Teams、所有未知模式/坏分支诊断、所有不可合作清理故障。源码断言中的D映射只覆盖该用例触发子分支，不等于整函数每个分支通过。
