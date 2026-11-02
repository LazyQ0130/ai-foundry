# 第三模块综合测验详细答案

16题 / 100分，1–12题各5分，综合A–D各10分。先独立作答，再对照推导与Rubric。建议90–130分钟，作者估计、未施测。自由解释按因果与中间值评分，不作术语关键词自动打分。安全关键误解须逐题纠正，不由总分掩盖；分值/阈值/评分一致性未校准。

<a id="q01"></a>
## 1. 查询、取消、释放分别交给谁

P通过Registry创建A，面板M保存Handle，统计插件Q只调用get(A.id)。A完成一个Turn后公开idle。Q建议直接销毁A，P认为Turn结束后Handle已失效。判断两人的说法，并给三方各自应持有的入口及一个同进程安全限制。

**标准答案**

get返回裸Agent，Q没有因查询而取得Handle.dispose；M可用持有的Handle结束整个实例；P的调用方Fiber仍有结构退出责任。Turn结束通常不销毁A，Handle仍对应本生命周期。cancel只停止活动，whenIdle只等活动收敛。类型/API分离不是恶意插件隔离。

**详细推导**

1. 先分对象：Registry查的是当前Agent，外层Handle才附释放能力；二者引用Agent可相同，能力集合不同。
2. 再分生命周期：Turn收束回idle，实例仍登记，可再次接任务；未发生dispose就不能推Handle失效。
3. 传递Handle引用不解除P原有Fiber归属；可信同进程插件可持有强Context，不能把这个设计当业务授权。

**评分Rubric**

| 分值 | 必需论证 |
|---:|---|
| 2 | 正确分Agent/Handle和Q/M入口 |
| 1 | Turn结束实例仍在 |
| 1 | P结构责任未转移 |
| 1 | 说明安全限制及cancel/whenIdle边界 |

**常见错误及解释**

- 把get所得对象当Handle：漏掉公开API的释放能力分层。
- 把idle当销毁：混淆工作状态与实例存在。

依据：[H09-04 · packages/core/agent/src/index.ts:586](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent/src/index.ts#L586-L593)；[H09-14 · packages/core/agent/src/index.ts:150](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent/src/index.ts#L150-L167)；[H09-31 · packages/core/agent-loop/src/index.ts:495](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/index.ts#L495-L546)；[H10-13 · packages/core/agent-loop/src/agent.ts:253](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L253-L280)。

<a id="q02"></a>
## 2. 创建通知被挂住时可见什么

无存储后端。setup已经完成并返回同步commit，agent/created第一个监听器在等待门闩。此时分别判断Session查询、Agent查询、create Promise、setup贡献、排队followup能否开始Turn。放行后第二监听器抛错，应该出现哪些退出通知？

**标准答案**

Session与Agent都可查询，setup已等待完成的感知Scope贡献可见，create尚未成功，排队Turn仍被初始化维护阻挡。第二监听器失败后收回Scope及实时登记，并配对agent/disposed再session/disposed；不能撤回前一个观察者已见的通知。

**详细推导**

1. Session enter/同步announce早于setup；Agent enter早于串行Agent通知，所以可查早于create成功。
2. ready在串行通知全部完成且有效后设置，初始化维护finally才放行唤醒；不能只看公开idle。
3. Agent创建通知已经开始，即使后续失败也要给观察者配对退出；失败前只到setup时则只有Session退出。

**评分Rubric**

| 分值 | 必需论证 |
|---:|---|
| 2 | 五项中间可见性判断正确 |
| 1 | 以维护屏障解释零Turn |
| 1 | 两种disposed顺序正确 |
| 1 | 说明补偿不撤回外部观察 |

**常见错误及解释**

- 可查所以Promise已成功：忽略announce的await。
- setup失败与Agent通知失败一律只发Session退出：未区分已经开始的创建边。

依据：[H09-20 · packages/core/agent-loop/src/index.ts:620](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/index.ts#L620-L636)；[H09-22 · packages/core/agent-loop/src/index.ts:629](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/index.ts#L629-L641)；[H09-24 · packages/core/agent/src/index.ts:562](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent/src/index.ts#L562-L583)；[H09-25 · packages/core/agent-loop/src/agent.ts:200](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L200-L229)；[H09-33 · packages/core/agent/src/index.ts:522](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent/src/index.ts#L522-L583)。

<a id="q03"></a>
## 3. 五种关系只改一项

插件P创建C，Handle交M，parentAgent为活对象A，meta.parentSession为X。仅把历史X改为Y，Registry的roots/isOwnedBy会变吗？若关闭A的Handle但P仍在，能仅凭parentAgent断言C已退出吗？给出真正应等待的退出顺序。

**标准答案**

不会；roots看entry.owner是否undefined，isOwnedBy比较确切A对象。parentSession是历史谱系。仅parentAgent不建立完整级联委派，独立P持有结构责任时不能断言C已退出。C的正常退出要先取消并等活动、再Scope、可选写句柄、Agent、Session。

**详细推导**

1. 历史ID与运行owner对象是两个字段，单改历史不改变实时名单。
2. P的调用归属、M的释放能力、A的运行父级不能互相代替；后代传播需要另外的委派协议。
3. 清表之前必须保留活动仍使用的Scope/Session，signal置位也不等于工作已结束。

**评分Rubric**

| 分值 | 必需论证 |
|---:|---|
| 2 | roots/isOwnedBy与历史独立 |
| 1 | 明确无隐含级联 |
| 2 | 退出顺序和先等待理由 |

**常见错误及解释**

- 同id假A也能isOwnedBy：真实比较对象身份。
- 先删表再停止：让仍在途活动失去资源与可观察登记。

依据：[H09-27 · packages/core/agent-loop/src/index.ts:733](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/index.ts#L733-L745)；[H09-28 · packages/core/agent/src/index.ts:595](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent/src/index.ts#L595-L625)；[H09-29 · packages/core/agent-loop/src/index.ts:566](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/index.ts#L566-L594)；[H09-31 · packages/core/agent-loop/src/index.ts:495](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/index.ts#L495-L546)。

<a id="q04"></a>
## 4. 为准备期取消找到可执行证据

观察到turn/start、step/start、step/end、turn/end(aborted)，Adapter调用0，本次system/user消息0。请在固定Commit定位至少两个实现片段解释此结果，给路径/函数/行范围，并指出不能据此推出所有取消都有Turn结束。

**标准答案**

agent-loop/src/agent.ts的turn在361–370行先写step/start再await step；step在435–478行先render/prepare/refresh并检查取消，之后才append system/user。prepareRequest在613–652行等待agent/request和prepareCall并查signal。因此request门取消可有1Step0请求、0消息；turn开头327–342行在turn/start前查取消，预先已取消可能没有新Turn。路径均位于packages/core。

**详细推导**

1. 先从事实倒推：Step边界已打开，不表示其内部的准备已经完成。
2. 找到await与随后的signal检查，而非仅搜索cancel字样；消息append在检查之后。
3. 用turn前置检查构造反例，限制观察结果的适用范围。

**评分Rubric**

| 分值 | 必需论证 |
|---:|---|
| 2 | 两个真实路径/函数/范围可定位且对应行为 |
| 2 | 解释await、取消检查和提交先后 |
| 1 | 给出Turn开始前取消反例 |

**常见错误及解释**

- 只贴包含cancel的搜索结果：没有证明控制流。
- 为补齐界面伪造Assistant：此路径根本未开始响应流。

依据：[H10-14 · packages/core/agent-loop/src/agent.ts:327](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L327-L342)；[H10-20 · packages/core/agent-loop/src/agent.ts:361](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L361-L370)；[H10-21 · packages/core/agent-loop/src/agent.ts:613](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L613-L652)；[H10-22 · packages/core/agent-loop/src/agent.ts:441](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L441-L478)。

<a id="q05"></a>
## 5. 维护阶段的两份队列

已创建Agent正在maintenance中。按顺序inject I、followup F1、followup F2、steer S；无取消、无工具，所有pre-step默认接纳，两次模型均直接回答。预测维护时status、两Turn首次领取顺序、Step编号。whenIdle能否一般性证明每条输入成功？

**标准答案**

维护时公开idle。放行后Turn1 Step1领取I、S、F1，Turn2 Step1领取F2；next-step全部优先于一条next-turn，不按四次调用时间合并。此给定正常路径完成两轮，但一般whenIdle只证明活动收敛，拒绝/异常等可留未领取输入，completed也非业务成功。

**详细推导**

1. inject/steer进next-step，followup进next-turn；唤醒在维护期锁存。
2. claim(next-turn)先取全部next-step再取一条next-turn，下一Turn重置Step计数。
3. 不能从特定正常夹具外推whenIdle的全局成功语义。

**评分Rubric**

| 分值 | 必需论证 |
|---:|---|
| 1 | status判断 |
| 2 | 领取顺序及原因 |
| 1 | 两个Step二元编号 |
| 1 | whenIdle适用限制 |

**常见错误及解释**

- I,F1,F2,S混排：忽略两队列。
- 两个Turn的Step连续编号1/2：每轮重置。

依据：[H10-02 · packages/core/agent-loop/src/agent.ts:156](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L156-L168)；[H10-08 · packages/core/agent-loop/src/inbox.ts:104](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/inbox.ts#L104-L112)；[H10-13 · packages/core/agent-loop/src/agent.ts:253](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L253-L280)；[H10-36 · packages/core/agent-loop/src/agent.ts:427](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L427-L432)。

<a id="q06"></a>
## 6. 失败请求与新的判断

一个输入，第一次模型请求限流，request-error明确retry；第二次输出两个工具调用；工具结果都提交后第三次模型请求最终回答。无额外输入、无concluded、无其他错误。数Turn/Step/实际请求/工具/失败attempt事实/正常message事实；哪次重新组装Prompt？

**标准答案**

1Turn、2Step、3请求、2工具、1失败assistant/attempt、2个assistant/message事实。第二次请求仍Step1，复用已接纳assembly；第三次进入Step2才重新preStep、resolve和assemble。普通用户消息只接纳一次。

**详细推导**

1. retry的continue在step内部，未触发Step结束与重新候选。
2. 同一Assistant的两个工具共享Step1，工具完成后Step2重新判断。
3. assistant/attempt是失败记账，不是全部三次请求的列表。

**评分Rubric**

| 分值 | 必需论证 |
|---:|---|
| 2 | 六项计数正确 |
| 2 | 区分重试和新Step组装 |
| 1 | 用户一次及attempt非总尝试数 |

**常见错误及解释**

- 3次HTTP请求即3Step：把请求与工作边界一一对应。
- 两个工具各开一个Step：忽略一份输出的批次。

依据：[H10-23 · packages/core/agent-loop/src/agent.ts:441](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L441-L478)；[H10-27 · packages/core/agent-loop/src/agent.ts:541](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L541-L564)；[H10-29 · packages/core/agent-loop/src/agent.ts:566](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L566-L597)；[H11-40 · packages/core/agent-loop/src/agent.ts:452](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L452-L479)；[H12-36 · packages/core/agent-loop/src/agent.ts:541](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L541-L563)。

<a id="q07"></a>
## 7. 准备句柄的两道检查

prepareCall绑定A1和model m，返回config含默认maxTokens=128。先用model other调用prepared.stream并同步失败，再以正确config取得流句柄但不消费；此时路由换A2。能否再用prepared派发？消费已取得的流走谁？如果在消费前改了可变请求model，结果怎样？假定A1内部准备正确捕获代次。

**标准答案**

首次配置不匹配未占用，第二次正确取得句柄已占用，不能第三次派发。已取得的流仍绑定A1。消费前改model会在惰性最终Adapter边界被拒绝并规范成INVALID_PREPARED_CALL失败finish，A1实际stream不调用。手工请求须由调用方保持稳定。

**详细推导**

1. prepared.stream先检查dispatched和config匹配，匹配成功才设置dispatched=true。
2. 一次性占用发生在接受分发而非消费完成；注册项闭包避免能力与端点跨代。
3. 最终Adapter边界再次检查配置，拦截取得句柄后发生的漂移。

**评分Rubric**

| 分值 | 必需论证 |
|---:|---|
| 2 | 占用两个时刻准确 |
| 1 | 旧A1绑定 |
| 1 | 惰性漂移失败与零Adapter分发 |
| 1 | 手工输入稳定/内部代次前提 |

**常见错误及解释**

- 未消费所以可重复取得句柄：占用时刻错。
- Runtime冻结任意Adapter内部字段：须Adapter自己的prepare实现。

依据：[H12-08 · packages/llm/llm/src/index.ts:960](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/llm/llm/src/index.ts#L960-L998)；[H12-10 · packages/llm/llm/src/index.ts:999](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/llm/llm/src/index.ts#L999-L1017)；[H12-11 · packages/llm/llm/src/index.ts:1089](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/llm/llm/src/index.ts#L1089-L1099)；[H12-12 · packages/llm/llm/src/index.ts:960](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/llm/llm/src/index.ts#L960-L1017)。

<a id="q08"></a>
## 8. 相同名称，不同材料

把当前目录直接登记为变量cwd并在最早Section引用，同时另有required目录Context。assemble时目录A，agent/request等待期间改B。没有新的assemble。系统文本和动态快照分别用哪一版？快照是什么角色/来源？工具Schema是否因此重算？

**标准答案**

系统变量仍A，动态Context刷新可读B；快照是user角色且source.kind=runtime-context，系统指令来自system/message。refresh不重求变量/Section/工具/Waterfall，Schema沿用候选。cwd在本题显式登记，不代表固定Loop内置cwd。

**详细推导**

1. 变量在assemble求值，renderPrompt随后只消费已取得值。
2. 准备后refresh只刷新接纳的Context名字并补required，动态Provider读取新值。
3. 角色和source应同时识别；两者都含目录不说明它们是同一消息。

**评分Rubric**

| 分值 | 必需论证 |
|---:|---|
| 2 | A/B版本推导及阶段 |
| 1 | 角色/source正确 |
| 1 | 工具不重算 |
| 1 | 显式cwd非内置 |

**常见错误及解释**

- 所有动态项都会刷新到B：把refresh当assemble。
- Context归system角色：忽略独立user快照。

依据：[H11-08 · packages/core/system-prompt/src/index.ts:286](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/system-prompt/src/index.ts#L286-L300)；[H11-21 · packages/core/system-prompt/src/index.ts:577](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/system-prompt/src/index.ts#L577-L607)；[H11-34 · packages/core/agent-loop/src/index.ts:337](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/index.ts#L337-L338)；[H11-39 · packages/core/agent-loop/src/agent.ts:445](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L445-L451)；[H12-06 · packages/llm/llm/src/types.ts:530](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/llm/llm/src/types.ts#L530-L597)。

<a id="q09"></a>
## 9. 看到工具与执行工具

当前knownNames为read/hidden，schemas只有read，toolOrder=[hidden,<unlisted-tools>]。模型仍提出hidden调用。判断组装是否报错、请求tools内容、ToolCallBlock能否证明hidden已执行。指出接下来分别需要H13/H14/H15回答的问题。

**标准答案**

组装不因hidden缺席报错，tools只有read；hidden已知但受限，toolOrder不会恢复它。ToolCallBlock仅是提议。H13核当前可见定义与toolSet，H14核执行/结果处理，H15核审批/守卫/沙箱。不能仅凭Schema或模型提议授权执行。

**详细推导**

1. unknown配置名与known-hidden是两种条件；rest只插入未显式列出的可见工具。
2. 模型可生成不在声明中的名字，上层仍要按执行定义/接纳集合检查。
3. 能力描述、执行流水线和安全强制是不同责任。

**评分Rubric**

| 分值 | 必需论证 |
|---:|---|
| 2 | 组装与tools结果 |
| 1 | 提议非执行 |
| 2 | 三课责任与授权限制 |

**常见错误及解释**

- 把hidden列进顺序就是重新授权：顺序不扩大集合。
- JSON合法即执行：参数完整不能替代定义和策略。

依据：[H11-23 · packages/core/tools/src/index.ts:111](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/tools/src/index.ts#L111-L117)；[H11-28 · packages/core/system-prompt/src/index.ts:237](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/system-prompt/src/index.ts#L237-L244)；[H12-16 · packages/llm/llm/src/types.ts:111](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/llm/llm/src/types.ts#L111-L119)；[H12-35 · packages/core/agent-loop/src/agent.ts:566](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L566-L597)。

<a id="q10"></a>
## 10. 逐片组装的权威值

同一响应按顺序收到text-delta(index9,甲)、reasoning-delta(index1,乙)、text-delta(index9,丙)、block-end(index9,text=定稿)、text-delta(index9,迟到)、finish(stop)。给blocks顺序和文本、usage；若改finish为max-tokens且插入已关闭合法工具块，会保留工具吗？

**标准答案**

首次出现顺序9/1，最终text=定稿、reasoning=乙；迟到delta不再增加已关闭块，usage为undefined。若有工具后max-tokens，全部tool-call被去掉，包括已关闭合法工具。组装值仍不自动写Session。

**详细推导**

1. 索引是关联键，order是首次出现列表，不按1/9排序。
2. block-end首次整块权威覆盖预览值，后续delta和重复close忽略。
3. 用量缺失不记零，max-tokens是独立保留规则，不按JSON是否闭合判断。

**评分Rubric**

| 分值 | 必需论证 |
|---:|---|
| 2 | 块顺序与最终值 |
| 1 | 权威/迟到解释 |
| 1 | usage缺值 |
| 1 | 上限去工具及非自动提交 |

**常见错误及解释**

- 甲乙丙拼成一个字符串：混角色块。
- 定稿再追加迟到：忽略关闭状态。

依据：[H12-20 · packages/llm/llm/src/assembler.ts:49](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/llm/llm/src/assembler.ts#L49-L105)；[H12-21 · packages/llm/llm/src/assembler.ts:62](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/llm/llm/src/assembler.ts#L62-L83)；[H12-23 · packages/llm/llm/src/assembler.ts:130](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/llm/llm/src/assembler.ts#L130-L159)；[H12-25 · packages/llm/llm/src/assembler.ts:181](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/llm/llm/src/assembler.ts#L181-L198)。

<a id="q11"></a>
## 11. 协议约定和实际包装边界

自定义Adapter正常yield finish(stop)，再yield usage并结束；另一Adapter正常空结束。LlmRuntime会自动截断/补finish吗？若Adapter的iterator.next抛可信LlmError(TRANSPORT)呢？若llm/stream中间件自己抛错呢？

**标准答案**

正常yield原样转发，坏顺序不自动截断，空流不补finish；Assembler缺finish的getter默认stop不能充当已收到终态。Adapter.next的异常会被规范成error/aborted finish，保留结构化failure；中间件自身错误不在该catch保证内，可直接抛出。

**详细推导**

1. 合约要求usage在唯一finish之前且终态后return，但Runtime正常迭代循环没有协议校正状态机。
2. try/catch只包最终Adapter查找/分发/iterator/next，yield已离开此边界。
3. 本地signal可能影响终态aborted，不能仅看错误文案推取消。

**评分Rubric**

| 分值 | 必需论证 |
|---:|---|
| 2 | 两个坏协议结果 |
| 1 | 默认stop不能当证据 |
| 1 | next规范化 |
| 1 | 中间件与signal边界 |

**常见错误及解释**

- 包装Runtime就自动合规：把文档约定当执行验证器。
- 所有throw都变finish：越过catch范围。

依据：[H12-25 · packages/llm/llm/src/assembler.ts:181](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/llm/llm/src/assembler.ts#L181-L198)；[H12-40 · packages/llm/llm/src/index.ts:1063](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/llm/llm/src/index.ts#L1063-L1195)；[H12-41 · packages/llm/llm/src/index.ts:1129](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/llm/llm/src/index.ts#L1129-L1156)；[H12-42 · packages/llm/llm/src/adapter-failure.ts:16](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/llm/llm/src/adapter-failure.ts#L16-L107)。

<a id="q12"></a>
## 12. 给绿色测试的结论降级

一份报告称“149项通过，B没单跑所以Cordis失败，C/D通过所以E全应用可靠；所有学员能在半天学完”。逐项纠正，并给一个有价值且不触碰真实模型的下一次验证建议。

**标准答案**

149项是互斥A1/C65/D83加总，B未独立运行不是失败，真实Cordis在C/D内部；E仍未运行。固定模型/工具与内存Session不能证明完整应用、真实模型性能、落盘恢复或学员效果。625–835分钟为四课作者估时，试读和真实耗时待测。可用受控Adapter记录请求前缀重建与结算，或开展真实学员无提示迁移试读，必须明确各自证明范围。

**详细推导**

1. 先核实际受测对象与替身，不按测试标题提高等级。
2. 未运行和失败不同；同一用例不能把内部Cordis再算B一次。
3. 代码测试与理解/耗时属于不同证据，不能跨类别推出。

**评分Rubric**

| 分值 | 必需论证 |
|---:|---|
| 1 | A/C/D与B状态纠正 |
| 2 | E/模型/持久范围 |
| 1 | 估时非实测 |
| 1 | 具体下一验证及边界 |

**常见错误及解释**

- 为证明E而重复跑同一Mock：没有增加应用边界。
- 把自评满分当试读通过：没有独立作答与耗时数据。

依据：[模块test-evidence](test-evidence.md)；[模块workload](workload.md)。

<a id="q13"></a>
## 13. 综合A：从创建到第一次模型请求

默认Factory，空新Session、无存储、已注册Adapter；setup安装Section R='助手：{{tone}}'、tone变量返回简洁、required目录Context返回A。无排队任务，create成功后才followup一次；agent/request里把目录改B、tone外部值改详细。默认pre-step接纳、无取消、无工具、Adapter正常stop。画从Registry.create到首次Adapter.stream的真实链，标R实时对象/S事实/M模型边界/C决策。列出实际系统文本、动态Context角色/来源、用户接纳次数，并给一个能让链在step/start后但模型调用前结束的反例。

**标准答案**

Registry委托Factory→prepare Session/所有权/Agent与Scope→Session enter/同步created→setup await/commit→Agent enter/serial created→ready/维护退出/Handle→followup splice/唤醒→turn/start→claim→捕获selection→resolve工具→assemble→pre-step→step/start→renderPrompt→prepareRequest/request钩子→prepareCall绑定→refresh/render Context→system/user提交→header/context及derive/freeze→llm/stream→Runtime能力投影→绑定Adapter.stream。系统文本助手：简洁；Context是B的user/runtime-context快照；普通用户1次。request等待时取消可有正式Step但0调用/0本次system/user。

**详细推导**

1. 创建有两次不同通知：Session同步、Agent串行；这些是实时生命周期边，不是模型请求历史消息。
2. 候选阶段抓selection/toolSet/assembly，默认pre-step才作接纳；Step正式开始后系统render仍用assemble取得的简洁。
3. 请求钩子改变环境，准备绑定后Context刷新读B，但不会重新求tone；Loop显式提交才使模型材料可重建。
4. buildRequest记录header/context，从Session派生冻结输入；Runtime可按能力再投影，Adapter输入不是任意情况下与原请求同对象。
5. 列出request门取消作为反例，解释在消息接纳前的signal检查，不仅画成功箭头。

**评分Rubric**

| 分值 | 必需论证 |
|---:|---|
| 2 | 创建/发布/Handle边界及R/S区分 |
| 2 | claim→selection→resolve→assemble→pre-step→Step正确 |
| 2 | 两种render、prepare绑定、消息提交顺序 |
| 2 | 简洁/B、角色source与一次用户输入均推导正确 |
| 2 | 派生冻结/Runtime投影/M边界及具体失败反例 |

**常见错误及解释**

- 在pre-step后才选模型或组装：与真实候选流程相反。
- 先派发模型再把system/user补日志：破坏输入可重建边界。
- 写出名词链却不给中间值或取消位置：综合题不能满分。

依据：[H09-20 · packages/core/agent-loop/src/index.ts:620](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/index.ts#L620-L636)；[H09-24 · packages/core/agent/src/index.ts:562](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent/src/index.ts#L562-L583)；[H10-15 · packages/core/agent-loop/src/agent.ts:283](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L283-L309)；[H10-20 · packages/core/agent-loop/src/agent.ts:361](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L361-L370)；[H11-37 · packages/core/agent-loop/src/agent.ts:435](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L435-L445)；[H11-39 · packages/core/agent-loop/src/agent.ts:445](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L445-L451)；[H11-46 · packages/core/agent-loop/src/agent.ts:656](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L656-L743)；[H12-08 · packages/llm/llm/src/index.ts:960](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/llm/llm/src/index.ts#L960-L998)。

<a id="q14"></a>
## 14. 综合B：一个Turn多Step的完整轨迹

同一Agent接一个用户任务，固定Prompt/Context/工具集合，无新输入。Step1第一次请求先给草稿再TRANSPORT失败，request-error只在本次返回retry；第二次请求提出id=c1的read_fixture，工具返回T；Step2请求读取T后回答并stop。无concluded、所有append成功、stopping不加输入。写结构事件与live提交关联、Turn/Step/请求/工具计数、三份历史的关键差异，以及assemble/pre-step/request各调用几次。可省略Inbox/请求封装的重复细节，但必须标明省略。

**标准答案**

1Turn、2Step、3请求、1工具；assemble=2/pre-step=2/request=3。结构顺序为turn/start→step/start(1,1)→system/user及封装→请求1→assistant/attempt→其committed end→retry→请求2→assistant/message(工具c1)→committed end→tool/call(c1)→tool/result(message.toolCallId=c1,T)→step/end(1,1)→候选2→step/start(1,2)→请求3→assistant/message(答复)→committed end→step/end→stopping复查空→turn/end(completed)。每份流有独立start/chunk；end必须指向先前实际事实。请求2不含失败草稿的正常Assistant消息，请求3新增成功工具提议与T；普通用户只提交1次。

**详细推导**

1. 第一次失败finish已规范化，先结算attempt再问恢复；continue仍Step1，不关闭Step，不重新assemble。
2. 第二次正常输出结算为message之后才进入工具；callId与结果message.toolCallId相等，不能从实时工具delta提前执行。
3. Step1结束后工具反馈需要新候选；Step2派生到T，旧两份请求不会随Session增长而变。
4. 固定Prompt/Context可不重复新增system/runtime-context事实，封装按需写；没有逐chunk Session事件。
5. 停止是候选加队列复查，completed只说明控制流；给定所有分支成功才结束此Turn。

**评分Rubric**

| 分值 | 必需论证 |
|---:|---|
| 2 | 四项计数和三类钩子计数正确 |
| 2 | 同Step失败attempt→retry与live seq关联 |
| 2 | message→call→result→Step结束关联与顺序 |
| 2 | 三份请求差异、旧请求不变、用户一次 |
| 2 | 第二候选/停止复查/省略项边界明确 |

**常见错误及解释**

- 失败草稿出现在请求2的正常Assistant历史：attempt不是surface message。
- 把request2记Step2、request3记Step3：把retry提级。
- 只报2Step而不给事件/输入关联：没有证明因果。

依据：[H10-23 · packages/core/agent-loop/src/agent.ts:441](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L441-L478)；[H10-27 · packages/core/agent-loop/src/agent.ts:541](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L541-L564)；[H10-29 · packages/core/agent-loop/src/agent.ts:566](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L566-L597)；[H10-33 · packages/core/agent-loop/src/agent.ts:394](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L394-L400)；[H11-40 · packages/core/agent-loop/src/agent.ts:452](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L452-L479)；[H12-34 · packages/core/agent-loop/src/assistant-stream.ts:73](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/assistant-stream.ts#L73-L108)；[H12-36 · packages/core/agent-loop/src/agent.ts:541](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L541-L563)。

<a id="q15"></a>
## 15. 综合C：由Section、Context与Schema推导输入

关闭内置身份，空Persona，无complete，无展示Waterfall。先登记zeta(order20,text='Z')、Alpha(order20,text='A={{tone}}')、first(order-10,text='R')；tone在assemble时为短，随后改长。Context directory为required、interpolate=false、文本Provider在assemble读A，agent/request内改B。knownNames=[read,hidden,audit]，可见schemas=[read,audit]，toolOrder=[hidden,<unlisted-tools>,read]。空新Session，默认pre-step，一次正常请求。给有效Section顺序、assembly中的Alpha/变量、系统渲染精确文本、Context完整快照正文、请求messages主要角色/source与tools顺序；说明何者记入日志以及若拼错hidden为typo在哪阶段失败。

**标准答案**

有效非空Section顺序first/Alpha/zeta；assembly Alpha仍A={{tone}}，variables.tone=短。系统文本为R

A=短

Z。最终Context完整文本为Current runtime context. This snapshot supersedes earlier runtime-context snapshots.

B。默认输入为system消息、普通user任务、带source.kind=runtime-context的user快照（本题固定首次默认路径）；tools顺序audit/read，hidden正常缺席。Loop提交system/user、按需header保存config/tools、request/context能力记录后派生冻结；变量表/assembly不作为独立模型消息。typo在assemble时工具顺序核knownNames失败，正式Step尚未开始。

**详细推导**

1. Section按order再名称代码单元，不按注册先后；空Persona段渲染过滤，题目要的是有效段。
2. 变量assemble时求短，render只插入旧值；Context准备后刷新读B，字面B不参与变量插值。
3. hidden已知但不可见，rest收未显式列出的audit，最后显式read；顺序配置不恢复hidden。
4. system通过system/message进历史；动态事实是user/runtime-context而非system尾巴，tools是独立字段。
5. 未知工具名字在候选assemble阶段失败；若错误是Section未知占位符，通常要到正式Step render才失败，不能混阶段。

**评分Rubric**

| 分值 | 必需论证 |
|---:|---|
| 2 | Section顺序、旧模板与变量值 |
| 2 | 精确系统文本和完整动态快照 |
| 2 | messages角色/source/首次顺序 |
| 2 | tools顺序及hidden/typo区别 |
| 2 | 提交/derive/freeze与失败阶段，非独立assembly消息 |

**常见错误及解释**

- 系统用长、Context用A：把两个求值时刻倒置。
- tools含hidden或顺序read/audit：把配置顺序当可见授权或忽略rest。
- 只给一个最终Prompt大字符串：遗漏结构化消息和工具字段。

依据：[H11-04 · packages/core/system-prompt/src/index.ts:247](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/system-prompt/src/index.ts#L247-L259)；[H11-08 · packages/core/system-prompt/src/index.ts:286](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/system-prompt/src/index.ts#L286-L300)；[H11-16 · packages/core/system-prompt/src/index.ts:302](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/system-prompt/src/index.ts#L302-L342)；[H11-21 · packages/core/system-prompt/src/index.ts:577](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/system-prompt/src/index.ts#L577-L607)；[H11-27 · packages/core/system-prompt/src/index.ts:226](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/system-prompt/src/index.ts#L226-L245)；[H11-28 · packages/core/system-prompt/src/index.ts:237](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/system-prompt/src/index.ts#L237-L244)；[H11-46 · packages/core/agent-loop/src/agent.ts:656](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L656-L743)。

<a id="q16"></a>
## 16. 综合D：分片、取消与最终结算

一Turn一Step，输入已接纳、流已start。依次收到text-delta(7,'半句')、reasoning-delta(2,'核对')、tool-call-delta(4,id=c1,name=read_fixture,args='{}')、block-end(4,完整合法工具c1)。没有usage/finish。确认这四片均已交付后本地cancel(user)，生成器协作退出，所有append成功，无恢复监听器。推导块预览、安全前缀、最终事实/帧与Turn reason、工具执行数、是否新请求/Step。再分别只改为“signal未取消且收到finish(error)”与“本地取消但匹配message append被拒绝”，各说明差异。

**标准答案**

普通blocks预览按7/2/4首见顺序含text半句、reasoning核对、tool c1；取消用interruptedBlocks只留前两块。主路径写interrupted=true的assistant/message，compact stream保留四片可无finish，usage缺失；随后committed end指其seq，step/end、turn/end(aborted)，工具0、无新请求/Step。error且signal未取消则写assistant/attempt、草稿不进正常历史，committed end指attempt，未retry时Turn error。取消message append拒绝则无匹配成功Assistant事实，end abandoned，Turn仍按本地signal归aborted并报告结算错误，不能伪造seq或落盘保证。

**详细推导**

1. 工具即使闭合也不进入取消安全前缀；安全指协议保留边界，不证明半句事实正确。
2. 本地取消进入流catch，非空text/reasoning决定message并标interrupted；Loop在下一signal检查拒收后续分片，故紧凑记录不必有finish。
3. settle先同步append，拿seq之后才能committed，之后收束Step/Turn；signal不导致自动retry。
4. 换成提供方error走正常消费结束后的失败终态支路，attempt不会自动成为正常Assistant消息。
5. 取消与结算拒绝组合仍由turn catch优先识别本地signal，reason=aborted；实际错误/abandoned需单列。该组合依据源码推导，本轮未额外实跑此精确组合，不能称已测试。

**评分Rubric**

| 分值 | 必需论证 |
|---:|---|
| 2 | 三块预览/两块安全前缀与顺序 |
| 2 | interrupted事实、四片stream、usage缺值 |
| 2 | append→committed seq→Step/Turn及零工具/无重试 |
| 2 | error变attempt/正常历史/Turn error |
| 2 | 取消+写拒绝的abandoned与aborted、证据范围限制 |

**常见错误及解释**

- 工具闭合便执行：取消保留规则明确省略全部工具。
- 本地取消一定attempt或所有aborted都是用户取消：忽略安全前缀与signal。
- 写入失败仍发committed或改Turn error：前者伪造事实，后者忽略本地signal优先分支。

依据：[H12-24 · packages/llm/llm/src/assembler.ts:162](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/llm/llm/src/assembler.ts#L162-L179)；[H12-34 · packages/core/agent-loop/src/assistant-stream.ts:73](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/assistant-stream.ts#L73-L108)；[H12-36 · packages/core/agent-loop/src/agent.ts:541](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L541-L563)；[H12-37 · packages/core/agent-loop/src/agent.ts:499](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L499-L539)；[H10-35 · packages/core/agent-loop/src/agent.ts:402](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/agent.ts#L402-L425)。
