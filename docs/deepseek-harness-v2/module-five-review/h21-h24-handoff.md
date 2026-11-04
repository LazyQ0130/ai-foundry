# H21–H24 前置知识交接

依据正式[A蓝图](../A-blueprint-v2.md#h21)，保持规划原课名和顺序。本页只交接输入要求；没有创建H21正文、程序、图或发布记录。

|顺序/实际课名|蓝图唯一核心目标|蓝图前置|第五模块应交出的能力|
|---|---|---|---|
|H21 Subagent、任务委派与多智能体协作|用activation的所有权和delivery区分新建、Fork与外部执行|H09、H18、H20|讲清普通Fork前缀与runtime父子对象不同；知道writer由谁取得、取消谁等待、未知外部效果不盲重做|
|H22 Workflow、Jobs、Goal 与任务调度|根据生命周期选择四种任务抽象，并画清它们的组合|H21；Run状态与预算|区分持久事实、进程内活动和后台进程；先指定预算/取消所有者，再谈任务是否可续行|
|H23 CLI、Web UI、SDK 与远程通信|追踪一个控制动作与一条状态订阅穿过载体边界|H04、H17、H21–H22；HTTP与流|以Session事实/Projection解释页面刷新与订阅；控制信号不是已停稳回执，读到事件不是耐久证明|
|H24 大型 Agent 系统测试与综合架构分析|为一条跨模块链建立事实、测试与限制的证据矩阵|H01–H23；Mock与故障注入|能标注C/D/E、真实文件/新实例/新PID/崩溃的区别，保留失败记录和未验证项|

必须先H21后H22，再H23，最后H24；不因本轮有跨课D级链就省略前置。H21蓝图中的Agent Teams只作显式启用的实验扩展边界，不把第五模块普通Fork解释成完整协作系统。

## 可交给高层能力的历史

可以重新derive的包括当前Surface消息、Header配置、toolHistory、已定义Projection以及确实保存的审计事实。compaction/summary有来源和rawOutput，但给普通模型的摘要来自独立Surface替换；高层审计若要追原选区应查原日志，而非只读短摘要。读取历史不自动取得执行权限，旧child目录记录也不自动成为活activation。

Resume重建新Agent/Scope/控制器，不能恢复旧Promise、AbortController、Adapter连接、timer、进程句柄或OS权限。子任务历史继承与父子生命周期须各自明确所有者；普通Fork的Header也不自动填parentSession/origin，运行关系更不能仅靠同名字段推断。

## 复杂任务必须继续携带的边界

1. 写入前说明谁有SessionHandle写权，读者只看到何种前缀；确认点说明使用Session/服务flush还是直接Handle屏障。
2. 将cancel请求、下游signal观察、已启动工作排空、idle、dispose和writer.close分别画在轨迹上；多Agent中的父取消不能直接当任意外部进程已终止。
3. 模型Attempt可按策略重试，但非幂等工具缺结果时先查外部事实或业务幂等键。UNKNOWN不撤销效果，不把跨Agent重新委派当安全自动重试。
4. 长任务继续使用Meter/Compaction，预算所有者跨组件仍独立。协作增大历史不代表可以非法切断工具对，或将压缩等同删证据。
5. 后续要宣称全应用行为，应补E级系统配置/载体/跨边界原始轨迹；本模块真实文件和新实例恢复仍是局部集成。

交接自检可复用综合题A–E：请求前缀、真实文件与Fork、summary/replace、retry/cancel、非幂等未知。学员需给出输入推导和责任链，不能只交术语表。本轮未执行H21 activation、真实父子树、Jobs或远程通信的新实验。
