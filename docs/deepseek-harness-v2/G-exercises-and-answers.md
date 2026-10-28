# 课程实践、思考题与参考答案

## 本轮已实现的原型范围

六个核心模块各有一组小型内存实验，全部实现在 labs/reference.mjs，24 项验收在 labs/acceptance.test.mjs。运行 `node --test docs/deepseek-harness-v2/labs/acceptance.test.mjs`，无需安装依赖、API Key、数据库或 GUI，无文件删除或网络访问。Node 测试失败返回非零。此原型用来验证教学方案能给出确定性证据；不是已完成 30 讲正式实验包。

M1 职责与配置；M2 环绕/插件卸载；M3 受限循环/请求绑定；M4 执行与拒绝；M5 日志/分支/压缩/未知写结果；M6 子任务/虚拟调度/连接 generation/虚构画布/构建图。复杂真实 API 集成在正式单讲研发再做。

所有代码头部均标注“教学简化，非官方兼容 API”。差异必须讲清：两层可见表省略继承链；composeRows 不实现官方 group/insert/!!js；loop 的 maxSteps 是教学停止条件，非声称官方同名配置；pipeline 省略 batch/project/finalize；foldLog 的 message/add、view/replace 是教学事件名；forkLog 没实现 seed marker/closer；count_words 只计非空白段；虚拟 schedule 不是分布式可靠调度。真实行为以 A/B 固定源码为准。

## 逐讲练习参考方案

每讲先预测输出，再执行适用的模块 fixture，最后用源码解释差异。开放式路径/架构任务用下面的完整参考判断加源码证据验收，不能以点击“完成”代替。

## H01

**任务：**练习卡 L01：将“产生调用、执行调用、记录结果、批准写入”四项分给模型与 Runtime；运行 lab M1 核对两条轨迹。

**参考解答与预期：**propose=model；execute/record=runtime；approve=可信策略或用户通道。无工具可直答；工具提议必须经执行器。

**实现/验证入口：**labs/reference.mjs 中 M1 对应函数及 acceptance.test.mjs 的同类 fixture；H25–H30 另使用 countWordsPlugin、oneUseCall/replayStateFor、GenerationBridge、canvasAction、指标解释、topo。概念型任务按 A 字段 17 的证据要求人工审阅，不虚称均有自动评分。

**思考题：**为什么在系统提示词里写“不要越权”不能代替工具策略？

**参考答案：**提示词影响模型提议；执行器必须对不可信提议独立检查，工具返回内容也不是新授权。

## H02

**任务：**练习卡 L02：为一次工具执行列出三角色包、两个 import 和一个测试，不安装整个仓库。

**参考解答与预期：**从 package.json workspace→tsconfig paths→NativeToolExecutor.execute→tools pipeline→相邻 tests；不要按目录位置猜调用。

**实现/验证入口：**labs/reference.mjs 中 M1 对应函数及 acceptance.test.mjs 的同类 fixture；H25–H30 另使用 countWordsPlugin、oneUseCall/replayStateFor、GenerationBridge、canvasAction、指标解释、topo。概念型任务按 A 字段 17 的证据要求人工审阅，不虚称均有自动评分。

**思考题：**npm 包名和目录名不相同时，应该信搜索结果还是凭名称猜路径？

**参考答案：**先查 package.json 和 tsconfig paths，再验证真实源码及导出；目录邻近不代表调用。

## H03

**任务：**练习卡 L03：给固定 Mock 轨迹排序，找出 tool/result 后还欠的下一请求；运行 M1。

**参考解答与预期：**turn/start→step/start→assistant/message(tool-call)→tool/call→tool/result→step/end→下一 step→turn/end；live chunk 不是独立持久消息。

**实现/验证入口：**labs/reference.mjs 中 M1 对应函数及 acceptance.test.mjs 的同类 fixture；H25–H30 另使用 countWordsPlugin、oneUseCall/replayStateFor、GenerationBridge、canvasAction、指标解释、topo。概念型任务按 A 字段 17 的证据要求人工审阅，不虚称均有自动评分。

**思考题：**实时 chunk 到达但进程在 settlement 前退出，能保证日志已有完整回答吗？

**参考答案：**不能。已提交 message/attempt 才是持久来源；live stream 不能等价为逐 chunk 持久化。

## H04

**任务：**练习卡 L04：只用内存配置合成三层菜单并说明缺项；运行 M1 的 route fixture，不读本机 home。

**参考解答与预期：**层顺序为有序 bundles→profile→home→overlay；sdk-minimal 不应用 base；练习仅用虚构配置。

**实现/验证入口：**labs/reference.mjs 中 M1 对应函数及 acceptance.test.mjs 的同类 fixture；H25–H30 另使用 countWordsPlugin、oneUseCall/replayStateFor、GenerationBridge、canvasAction、指标解释、topo。概念型任务按 A 字段 17 的证据要求人工审阅，不虚称均有自动评分。

**思考题：**sdk-minimal 能否按“base 加 SDK”来画？

**参考答案：**不能；锁定版把它作为显式完整组合的例外，需要单独跟踪其 bundle。

## H05

**任务：**练习卡 L05：写一个只依赖日志接口的计数插件，替换内存日志实现；运行 M2。

**参考解答与预期：**消费方只用传入日志契约；更换日志对象不改插件。Context/inject 的官方版本还管理服务可用性，缩影不实现全部容器。

**实现/验证入口：**labs/reference.mjs 中 M2 对应函数及 acceptance.test.mjs 的同类 fixture；H25–H30 另使用 countWordsPlugin、oneUseCall/replayStateFor、GenerationBridge、canvasAction、指标解释、topo。概念型任务按 A 字段 17 的证据要求人工审阅，不虚称均有自动评分。

**思考题：**声明合并让 ctx.foo 在编译时存在，是否证明运行时已挂载？

**参考答案：**不证明；声明合并只扩展类型，服务还须注册且满足 inject 与作用域。

## H06

**任务：**练习卡 L06：实现环绕与拒绝两条路径；运行 M2，再运行官方 Cordis probe 对照。

**参考解答与预期：**A+ B+ body B- A-；不 next 时 body=0。serial 的 0 停止，false 继续；官方探针有实际轨迹。

**实现/验证入口：**labs/reference.mjs 中 M2 对应函数及 acceptance.test.mjs 的同类 fixture；H25–H30 另使用 countWordsPlugin、oneUseCall/replayStateFor、GenerationBridge、canvasAction、指标解释、topo。概念型任务按 A 字段 17 的证据要求人工审阅，不虚称均有自动评分。

**思考题：**观察工具的 listener 忘记 next() 会发生什么？0 与 false 对 bail 是否相同？

**参考答案：**前者可能截断后续策略与默认实现；0 是 bail 值，false 不是。

## H07

**任务：**练习卡 L07：模拟 mount→emit→dispose→emit，断言第二次不触发且重复 dispose 不新增事件；运行 M2。

**参考解答与预期：**挂载后 hit=1；释放后再 emit 仍 hit=1；同一 disposer 重复调用不增加动作。真实复杂资源的 drain 另查 lifecycle test。

**实现/验证入口：**labs/reference.mjs 中 M2 对应函数及 acceptance.test.mjs 的同类 fixture；H25–H30 另使用 countWordsPlugin、oneUseCall/replayStateFor、GenerationBridge、canvasAction、指标解释、topo。概念型任务按 A 字段 17 的证据要求人工审阅，不虚称均有自动评分。

**思考题：**取消 signal 已置位，为什么还可能要等待工具 promise？

**参考答案：**工具已经开始，须等待它静止并清理；signal 不会自动撤销副作用，也不是资源释放凭证。

## H08

**任务：**练习卡 L08：实现教学版整 config 替换，验证后层覆盖与未知目标诊断；扩展 M2 的 fixture。官方对不匹配目标报告 warn，不擅自改称 throw。

**参考解答与预期：**{provider:p,model:x} 被 config:{model:y} 覆盖后只剩 model:y；未知目标记录 missing 警告；原输入未变化。

**实现/验证入口：**labs/reference.mjs 中 M2 对应函数及 acceptance.test.mjs 的同类 fixture；H25–H30 另使用 countWordsPlugin、oneUseCall/replayStateFor、GenerationBridge、canvasAction、指标解释、topo。概念型任务按 A 字段 17 的证据要求人工审阅，不虚称均有自动评分。

**思考题：**用 patch 只写 config.model，能默认继承旧 config.provider 吗？

**参考答案：**不能按深合并推断；课程示例应给出完整替换配置，并核对实际 patch 操作。

## H09

**任务：**L09：给 setup/announce 各注入一次确定性异常，列回收台账；为 M3 增加失败不发布 fixture。

**参考解答与预期：**setup 或 announce 任一步失败都不得返回可工作的半发布 handle；记录 acquired→released 一一配对，先 drain 再释放依赖。

**实现/验证入口：**labs/reference.mjs 中 M3 对应函数及 acceptance.test.mjs 的同类 fixture；H25–H30 另使用 countWordsPlugin、oneUseCall/replayStateFor、GenerationBridge、canvasAction、指标解释、topo。概念型任务按 A 字段 17 的证据要求人工审阅，不虚称均有自动评分。

**思考题：**只删 registry 项是否等于 Agent 已完全销毁？

**参考答案：**不是；还须取消并 drain、释放 Session/write handle 和 agent scope，处理未发布失败。

## H10

**任务：**L10：用 M3 跑直答、工具续步、空输入和拒绝四种事件序列，断言不会空耗模型调用。

**参考解答与预期：**拒绝/空输入均 model=0、无 step；tool→done 为 model=2/tool=1；inject 等待唤醒；教学 maxSteps=3 非官方配置承诺。

**实现/验证入口：**labs/reference.mjs 中 M3 对应函数及 acceptance.test.mjs 的同类 fixture；H25–H30 另使用 countWordsPlugin、oneUseCall/replayStateFor、GenerationBridge、canvasAction、指标解释、topo。概念型任务按 A 字段 17 的证据要求人工审阅，不虚称均有自动评分。

**思考题：**首个 pre-step 拒绝后能否仍有 turn/start、turn/end？

**参考答案：**可以；turn 在 claim 前打开，拒绝关闭 blocked turn，未进入 step。

## H11

**任务：**L11：给 M3 输入两个时间点的工具清单，冻结入场版本；尝试篡改并验证历史不变。

**参考解答与预期：**入场清单为不可变 snapshot；attempt 重试保持选择与 assembly，runtime facts 可刷新；取消异步准备前无用户/system 提交。

**实现/验证入口：**labs/reference.mjs 中 M3 对应函数及 acceptance.test.mjs 的同类 fixture；H25–H30 另使用 countWordsPlugin、oneUseCall/replayStateFor、GenerationBridge、canvasAction、指标解释、topo。概念型任务按 A 字段 17 的证据要求人工审阅，不虚称均有自动评分。

**思考题：**能否把旧 request/context 当作当前 route 支持 system 更新的依据？

**参考答案：**不能，应使用本次 prepareCall 绑定的能力；日志记录本次实际请求封装。

## H12

**任务：**L12：M3 发送文本片段、工具参数片段与失败尾帧；断言半截 JSON 不执行。

**参考解答与预期：**文本按块拼装；半截工具参数不执行；failed attempt 计入日志但不派生为模型消息；最终 role/内容由公共流契约决定。

**实现/验证入口：**labs/reference.mjs 中 M3 对应函数及 acceptance.test.mjs 的同类 fixture；H25–H30 另使用 countWordsPlugin、oneUseCall/replayStateFor、GenerationBridge、canvasAction、指标解释、topo。概念型任务按 A 字段 17 的证据要求人工审阅，不虚称均有自动评分。

**思考题：**工具参数字符串流到一半就能调用工具吗？

**参考答案：**不能；须满足完整流协议、完成拼装与执行阶段校验。

## H13

**任务：**L13：M4 计算全局/子级/deny 的可见集，并让隐形工具调用被拒绝。

**参考解答与预期：**全局 read/write、自有 write、全局 deny write 时自有 write 仍可见；继承多层需用官方 view 算。unknown/hidden body=0。

**实现/验证入口：**labs/reference.mjs 中 M4 对应函数及 acceptance.test.mjs 的同类 fixture；H25–H30 另使用 countWordsPlugin、oneUseCall/replayStateFor、GenerationBridge、canvasAction、指标解释、topo。概念型任务按 A 字段 17 的证据要求人工审阅，不虚称均有自动评分。

**思考题：**删掉 prompt 里的工具说明就能作为权限拒绝吗？

**参考答案：**不能；展示与执行查找必须同受能力集合/策略约束，恶意模型仍可构造名字。

## H14

**任务：**L14：M4 注入 pre deny、body throw、post block；比较 body 次数与最终回执。

**参考解答与预期：**pre deny:body=0；body throw:body=1/isError；post block:body=1/isError。post 不能当副作用回滚，结果冻结。

**实现/验证入口：**labs/reference.mjs 中 M4 对应函数及 acceptance.test.mjs 的同类 fixture；H25–H30 另使用 countWordsPlugin、oneUseCall/replayStateFor、GenerationBridge、canvasAction、指标解释、topo。概念型任务按 A 字段 17 的证据要求人工审阅，不虚称均有自动评分。

**思考题：**post-execute 把成功改成 isError，是否证明文件没有写过？

**参考答案：**不证明；body 已运行，post 改的是结果。副作用回滚必须另有事务/补偿机制。

## H15

**任务：**L15：M4 模拟无渠道、拒绝、允许后守卫拒绝、允许后执行四种结果；所有资源使用内存。

**参考解答与预期：**无审批渠道、拒绝、批准后 guard deny、批准可执行的 body 次数依次 0/0/0/1；partial 不得标 full。

**实现/验证入口：**labs/reference.mjs 中 M4 对应函数及 acceptance.test.mjs 的同类 fixture；H25–H30 另使用 countWordsPlugin、oneUseCall/replayStateFor、GenerationBridge、canvasAction、指标解释、topo。概念型任务按 A 字段 17 的证据要求人工审阅，不虚称均有自动评分。

**思考题：**一次 allowed-once 能否覆盖 owner guard 的 deny？

**参考答案：**不能；准入通过后仍检查单调 guard。未审计实现也不能宣传为已验证生产安全方案。

## H16

**任务：**L16：把虚构远端搜索接到 M4 本地白名单，远端多声明 write 工具也不能增加执行计数。

**参考解答与预期：**四条 seam 用同一 pipeline，MCP 仅桥接协议；测试只在本地 registered=[read] 时请求 write，body=0。发现本身不是授权。

**实现/验证入口：**labs/reference.mjs 中 M4 对应函数及 acceptance.test.mjs 的同类 fixture；H25–H30 另使用 countWordsPlugin、oneUseCall/replayStateFor、GenerationBridge、canvasAction、指标解释、topo。概念型任务按 A 字段 17 的证据要求人工审阅，不虚称均有自动评分。

**思考题：**远端 tools/list 列出 write 能否当作本地批准？

**参考答案：**不能；发现是能力描述，本地注册、作用域与执行策略继续生效，返回文本是不可信内容。

## H17

**任务：**L17：M5 重建事件日志并比较两种投影；破坏 seq 必须拒绝，原事件不变。

**参考解答与预期：**三条教学事件仍 factCount=3，可见 messages=[summary]；破坏 seq 拒绝；deriveMessages 与 projection snapshot 是读视图。

**实现/验证入口：**labs/reference.mjs 中 M5 对应函数及 acceptance.test.mjs 的同类 fixture；H25–H30 另使用 countWordsPlugin、oneUseCall/replayStateFor、GenerationBridge、canvasAction、指标解释、topo。概念型任务按 A 字段 17 的证据要求人工审阅，不虚称均有自动评分。

**思考题：**所有 SessionEvent 都能直接传给模型吗？

**参考答案：**不能；模型历史由 surface 节点和纯消息投影派生，审计事件不必是消息。

## H18

**任务：**L18：M5 从同一前缀派生子分支，父日志保持不变；未知写结果不得自动重做。

**参考解答与预期：**子前缀深复制，改子不改父；unknown-write 禁止盲重试；只读/业务已证明幂等才可重做；官方还有 seed marker 和 closer。

**实现/验证入口：**labs/reference.mjs 中 M5 对应函数及 acceptance.test.mjs 的同类 fixture；H25–H30 另使用 countWordsPlugin、oneUseCall/replayStateFor、GenerationBridge、canvasAction、指标解释、topo。概念型任务按 A 字段 17 的证据要求人工审阅，不虚称均有自动评分。

**思考题：**Replay 为什么通常不应重新发 HTTP 写请求？

**参考答案：**Replay 重建历史/投影；重发是新的副作用，必须有独立授权与幂等设计。

## H19

**任务：**L19：M5 用固定摘要器比较保留全文、剪枝、摘要的字符预算与关键事实覆盖；记录不确定信息。

**参考解答与预期：**full 含两个事实，summary 只留一个时事实覆盖=1，字符数较少；必须同时报告成本与失真，不能称无损。

**实现/验证入口：**labs/reference.mjs 中 M5 对应函数及 acceptance.test.mjs 的同类 fixture；H25–H30 另使用 countWordsPlugin、oneUseCall/replayStateFor、GenerationBridge、canvasAction、指标解释、topo。概念型任务按 A 字段 17 的证据要求人工审阅，不虚称均有自动评分。

**思考题：**compaction/summary 本身是否自动成为模型消息？

**参考答案：**不是；它是记账事件，模型可见替换由另一 user/message 的 surfaceOp 实现。

## H20

**任务：**L20：M5 模拟迟到结果、请求失败重试与未知写结果；取消后后续 body=0。

**参考解答与预期：**取消在 body 前则后续新 body=0；同一步 failOnce 为 model=2、user 消息仍 1；未知写结果单列而非自动重做。

**实现/验证入口：**labs/reference.mjs 中 M5 对应函数及 acceptance.test.mjs 的同类 fixture；H25–H30 另使用 countWordsPlugin、oneUseCall/replayStateFor、GenerationBridge、canvasAction、指标解释、topo。概念型任务按 A 字段 17 的证据要求人工审阅，不虚称均有自动评分。

**思考题：**为什么同一 prompt 的两次请求不是严格幂等的外部操作？

**参考答案：**模型可能不同、计费可能发生，工具副作用更不自动幂等；幂等要针对业务结果定义并实现。

## H21

**任务：**L21：M6 创建两子任务，取消父级后拒绝新子任务并等待清理；比较 caller/parent 的通知数。

**参考解答与预期：**parent delivery 才追加父通知，caller 仅返回；取消后在跑子项 cancelled，拒绝新 child；既有完成结果不改。

**实现/验证入口：**labs/reference.mjs 中 M6 对应函数及 acceptance.test.mjs 的同类 fixture；H25–H30 另使用 countWordsPlugin、oneUseCall/replayStateFor、GenerationBridge、canvasAction、指标解释、topo。概念型任务按 A 字段 17 的证据要求人工审阅，不虚称均有自动评分。

**思考题：**spawn 与 fork 是否默认拥有同样的父上下文？

**参考答案：**不是；spawn provider 明确不继承父对话；fork 要按其 seed 规则讨论，不能只看“子代理”名称。

## H22

**任务：**L22：M6 对四个场景分类，使用虚拟时钟与内存队列验证调度；不创建系统定时器。

**参考解答与预期：**编排脚本=Workflow，长运行执行=Job，同会话续跑=Goal，未来触发=Schedule；虚拟时钟前后各 tick 一次，同 id 不重复投递。

**实现/验证入口：**labs/reference.mjs 中 M6 对应函数及 acceptance.test.mjs 的同类 fixture；H25–H30 另使用 countWordsPlugin、oneUseCall/replayStateFor、GenerationBridge、canvasAction、指标解释、topo。概念型任务按 A 字段 17 的证据要求人工审阅，不虚称均有自动评分。

**思考题：**WorkflowMeta.phases 是否决定脚本执行顺序？

**参考答案：**不是；它是展示信息，脚本与引擎 helper 决定实际结构。

## H23

**任务：**L23：给 M6 的事件适配器做断连/重连 fixture，基于 snapshot 重建，过滤旧 revision。

**参考解答与预期：**控制向内走 registry，状态向外由 snapshot/event；断连重建 snapshot 后只接新 revision，不把旧流片段重复附加。

**实现/验证入口：**labs/reference.mjs 中 M6 对应函数及 acceptance.test.mjs 的同类 fixture；H25–H30 另使用 countWordsPlugin、oneUseCall/replayStateFor、GenerationBridge、canvasAction、指标解释、topo。概念型任务按 A 字段 17 的证据要求人工审阅，不虚称均有自动评分。

**思考题：**UI 显示完成能否代替持久化确认？

**参考答案：**不能；需核对领域终态与持久边界，实时 UI 只是消费方。

## H24

**任务：**L24：运行 M1–M6，全链报告列成功、拒绝、取消、未知写结果；给一项未经测试的结论降级。

**参考解答与预期：**汇合 M1–M6 结果；拒绝/取消体数与父子清理都是可观察事实；四硬门槛任一非零即不通过。

**实现/验证入口：**labs/reference.mjs 中 M6 对应函数及 acceptance.test.mjs 的同类 fixture；H25–H30 另使用 countWordsPlugin、oneUseCall/replayStateFor、GenerationBridge、canvasAction、指标解释、topo。概念型任务按 A 字段 17 的证据要求人工审阅，不虚称均有自动评分。

**思考题：**没有 API Key 的 e2e 被跳过后，能写“真实模型集成已通过”吗？

**参考答案：**不能，必须列为未验证并保留具体 skip 原因；Mock 是固定行为证据。

## H25

**任务：**L25：基于 M2 的插件契约补 count_words，覆盖空字符串、重复注册、卸载后不可见；正式制课再做锁定仓库包级插件。

**参考解答与预期：**count_words 空串=0，one two=2；本模型“词”指非空白段；重复注册抛 duplicate；dispose 后调用抛 unknown，重复 dispose 不再改变。

**实现/验证入口：**labs/reference.mjs 中 M6 对应函数及 acceptance.test.mjs 的同类 fixture；H25–H30 另使用 countWordsPlugin、oneUseCall/replayStateFor、GenerationBridge、canvasAction、指标解释、topo。概念型任务按 A 字段 17 的证据要求人工审阅，不虚称均有自动评分。

**思考题：**只提供 execute 而不提供 output 契约能否按本版本注册？

**参考答案：**不能；本版本 register 要求 output schema/render，须按锁定接口实现。

## H26

**任务：**L26：扩展 M3 的两套 provider fixture，跨 adapter 切换剥离私有 replayState，并拒绝重复 dispatch。

**参考解答与预期：**不同 adapter owner 剥离 replayState，同一 owner 保留；变 config 和二次 dispatch 拒绝；不据 Provider 字符串假定同一适配器。

**实现/验证入口：**labs/reference.mjs 中 M6 对应函数及 acceptance.test.mjs 的同类 fixture；H25–H30 另使用 countWordsPlugin、oneUseCall/replayStateFor、GenerationBridge、canvasAction、指标解释、topo。概念型任务按 A 字段 17 的证据要求人工审阅，不虚称均有自动评分。

**思考题：**两个 provider 共用同一 adapter 实例与两个不同 adapter 实例能一概处理 replayState 吗？

**参考答案：**不能；须按当前 adapter 所有权规则判断，保留与剥离不是按字符串碰巧相同决定。

## H27

**任务：**L27：M4/M6 的内存 MCP fixture 重连三次，验证旧 generation 结果被忽略、卸载后清单为空。

**参考解答与预期：**A generation 迟到 publish=false；B 成功保留 read，B 失败刷新不替换，dispose 后 tools=[]；真实 MCP 还需 SDK/资源作用域集成。

**实现/验证入口：**labs/reference.mjs 中 M6 对应函数及 acceptance.test.mjs 的同类 fixture；H25–H30 另使用 countWordsPlugin、oneUseCall/replayStateFor、GenerationBridge、canvasAction、指标解释、topo。概念型任务按 A 字段 17 的证据要求人工审阅，不虚称均有自动评分。

**思考题：**重新发现失败后是否可以先删除全部旧工具再显示成功？

**参考答案：**不应据此虚报；锁定实现保留上一代工具并记录故障，只有成功发现才发布替代。

## H28

**任务：**L28：M6 的虚构画布记录一次 click，取消后不得新增 click；fork 只有日志，没有登录态。

**参考解答与预期：**第一次 click 已交付则计数=1；取消后不新增，不能把 1 回滚为 0；Fork 只复制日志不复制登录态。

**实现/验证入口：**labs/reference.mjs 中 M6 对应函数及 acceptance.test.mjs 的同类 fixture；H25–H30 另使用 countWordsPlugin、oneUseCall/replayStateFor、GenerationBridge、canvasAction、指标解释、topo。概念型任务按 A 字段 17 的证据要求人工审阅，不虚称均有自动评分。

**思考题：**把 click 结果标为 cancelled 是否证明用户界面从未收到输入？

**参考答案：**不证明；已经交付的输入不可撤回，应另行观察验证，不把取消当回滚。

## H29

**任务：**L29：M1–M6 产出只含虚构字段的报告；统计拒绝率/动作数和时序，不在本轮跑真实 API 基准。

**参考解答与预期：**usage 缺失标 null/unknown，不能记 0；分别记模型、工具、审批等待、flush；质量均值不得覆盖越权硬门槛；脱敏默认需挂规则。

**实现/验证入口：**labs/reference.mjs 中 M6 对应函数及 acceptance.test.mjs 的同类 fixture；H25–H30 另使用 countWordsPlugin、oneUseCall/replayStateFor、GenerationBridge、canvasAction、指标解释、topo。概念型任务按 A 字段 17 的证据要求人工审阅，不虚称均有自动评分。

**思考题：**90% 任务成功但发生一次越权写入，平均分能否判通过？

**参考答案：**不能；安全硬门槛独立计数，任一次即失败；质量/性能指标另看。

## H30

**任务：**L30：给六节点构建 DAG 排序，删一份生成声明时明确失败；将课程更新变更映射到所需复验层级。

**参考解答与预期：**types 先于 host，host 先于 desktop，desktop 先于 client，client 先于 web；缺依赖抛 missing artifact，环抛 cycle；真实 DAG 以 scripts/run-gates 为准。

**实现/验证入口：**labs/reference.mjs 中 M6 对应函数及 acceptance.test.mjs 的同类 fixture；H25–H30 另使用 countWordsPlugin、oneUseCall/replayStateFor、GenerationBridge、canvasAction、指标解释、topo。概念型任务按 A 字段 17 的证据要求人工审阅，不虚称均有自动评分。

**思考题：**tsconfig paths 能否解决同一个 ts.Program 中的 Host/Client Context 声明冲突？

**参考答案：**不能；模块解析与 program 内声明合并是不同问题，需保持 aggregate 边界。


## 统一验收与评分

源码定位/调用链 30 分，概念与类比边界 20 分，确定性实验及异常证据 25 分，设计取舍与已知限制 15 分，图示/表达 10 分。80 分且四项硬门槛均为零方可结课。硬门槛：越权执行、未批准写入、取消后启动新动作、虚报验证状态；错误解释必须纠正后再评。

模块成果依次是职责地图、可卸载插件、循环轨迹、拒绝矩阵、重建/分支/压缩报告、协作所有权与架构审计。终期提交一条跨模块功能路径、一个真实官方回归测试阅读报告、一个 Mock 故障注入与一份未验证清单。学员勾选属于自报进度，不是服务器或安全认证；未来如接自动验收必须独立设计可信执行环境。

学生练习起点可复制 reference 函数后留空最核心分支，完整答案放 deepdive/受控下载。制作正式 Starter 时每题必须给具体输入、预期输出、故障输入与同一条验收命令，不能只写“让 AI 帮你完成”。本轮未制作 30 份 Starter 或新增平台下载资源。
