# 第三模块综合测验

16题 / 100分，1–12题各5分，综合A–D各10分。先独立作答，再对照推导与Rubric。建议90–130分钟，作者估计、未施测。自由解释按因果与中间值评分，不作术语关键词自动打分。安全关键误解须逐题纠正，不由总分掩盖；分值/阈值/评分一致性未校准。

[折叠答案与自评阅读预览](assessment-preview.html) · [全部详细答案](assessment-answers.md)

<a id="q01"></a>
## 1. 查询、取消、释放分别交给谁
**生命周期 · 5分**

P通过Registry创建A，面板M保存Handle，统计插件Q只调用get(A.id)。A完成一个Turn后公开idle。Q建议直接销毁A，P认为Turn结束后Handle已失效。判断两人的说法，并给三方各自应持有的入口及一个同进程安全限制。

[答题后看详细答案](assessment-answers.md#q01)

<a id="q02"></a>
## 2. 创建通知被挂住时可见什么
**生命周期 · 5分**

无存储后端。setup已经完成并返回同步commit，agent/created第一个监听器在等待门闩。此时分别判断Session查询、Agent查询、create Promise、setup贡献、排队followup能否开始Turn。放行后第二监听器抛错，应该出现哪些退出通知？

[答题后看详细答案](assessment-answers.md#q02)

<a id="q03"></a>
## 3. 五种关系只改一项
**生命周期 · 5分**

插件P创建C，Handle交M，parentAgent为活对象A，meta.parentSession为X。仅把历史X改为Y，Registry的roots/isOwnedBy会变吗？若关闭A的Handle但P仍在，能仅凭parentAgent断言C已退出吗？给出真正应等待的退出顺序。

[答题后看详细答案](assessment-answers.md#q03)

<a id="q04"></a>
## 4. 为准备期取消找到可执行证据
**源码定位 · 5分**

观察到turn/start、step/start、step/end、turn/end(aborted)，Adapter调用0，本次system/user消息0。请在固定Commit定位至少两个实现片段解释此结果，给路径/函数/行范围，并指出不能据此推出所有取消都有Turn结束。

[答题后看详细答案](assessment-answers.md#q04)

<a id="q05"></a>
## 5. 维护阶段的两份队列
**控制流 · 5分**

已创建Agent正在maintenance中。按顺序inject I、followup F1、followup F2、steer S；无取消、无工具，所有pre-step默认接纳，两次模型均直接回答。预测维护时status、两Turn首次领取顺序、Step编号。whenIdle能否一般性证明每条输入成功？

[答题后看详细答案](assessment-answers.md#q05)

<a id="q06"></a>
## 6. 失败请求与新的判断
**跨课控制流 · 5分**

一个输入，第一次模型请求限流，request-error明确retry；第二次输出两个工具调用；工具结果都提交后第三次模型请求最终回答。无额外输入、无concluded、无其他错误。数Turn/Step/实际请求/工具/失败attempt事实/正常message事实；哪次重新组装Prompt？

[答题后看详细答案](assessment-answers.md#q06)

<a id="q07"></a>
## 7. 准备句柄的两道检查
**请求绑定 · 5分**

prepareCall绑定A1和model m，返回config含默认maxTokens=128。先用model other调用prepared.stream并同步失败，再以正确config取得流句柄但不消费；此时路由换A2。能否再用prepared派发？消费已取得的流走谁？如果在消费前改了可变请求model，结果怎样？假定A1内部准备正确捕获代次。

[答题后看详细答案](assessment-answers.md#q07)

<a id="q08"></a>
## 8. 相同名称，不同材料
**跨课输入 · 5分**

把当前目录直接登记为变量cwd并在最早Section引用，同时另有required目录Context。assemble时目录A，agent/request等待期间改B。没有新的assemble。系统文本和动态快照分别用哪一版？快照是什么角色/来源？工具Schema是否因此重算？

[答题后看详细答案](assessment-answers.md#q08)

<a id="q09"></a>
## 9. 看到工具与执行工具
**跨课工具边界 · 5分**

当前knownNames为read/hidden，schemas只有read，toolOrder=[hidden,<unlisted-tools>]。模型仍提出hidden调用。判断组装是否报错、请求tools内容、ToolCallBlock能否证明hidden已执行。指出接下来分别需要H13/H14/H15回答的问题。

[答题后看详细答案](assessment-answers.md#q09)

<a id="q10"></a>
## 10. 逐片组装的权威值
**流式数据 · 5分**

同一响应按顺序收到text-delta(index9,甲)、reasoning-delta(index1,乙)、text-delta(index9,丙)、block-end(index9,text=定稿)、text-delta(index9,迟到)、finish(stop)。给blocks顺序和文本、usage；若改finish为max-tokens且插入已关闭合法工具块，会保留工具吗？

[答题后看详细答案](assessment-answers.md#q10)

<a id="q11"></a>
## 11. 协议约定和实际包装边界
**失败分析 · 5分**

自定义Adapter正常yield finish(stop)，再yield usage并结束；另一Adapter正常空结束。LlmRuntime会自动截断/补finish吗？若Adapter的iterator.next抛可信LlmError(TRANSPORT)呢？若llm/stream中间件自己抛错呢？

[答题后看详细答案](assessment-answers.md#q11)

<a id="q12"></a>
## 12. 给绿色测试的结论降级
**证据判断 · 5分**

一份报告称“149项通过，B没单跑所以Cordis失败，C/D通过所以E全应用可靠；所有学员能在半天学完”。逐项纠正，并给一个有价值且不触碰真实模型的下一次验证建议。

[答题后看详细答案](assessment-answers.md#q12)

<a id="q13"></a>
## 13. 综合A：从创建到第一次模型请求
**完整系统 · 10分**

默认Factory，空新Session、无存储、已注册Adapter；setup安装Section R='助手：{{tone}}'、tone变量返回简洁、required目录Context返回A。无排队任务，create成功后才followup一次；agent/request里把目录改B、tone外部值改详细。默认pre-step接纳、无取消、无工具、Adapter正常stop。画从Registry.create到首次Adapter.stream的真实链，标R实时对象/S事实/M模型边界/C决策。列出实际系统文本、动态Context角色/来源、用户接纳次数，并给一个能让链在step/start后但模型调用前结束的反例。

[答题后看详细答案](assessment-answers.md#q13)

<a id="q14"></a>
## 14. 综合B：一个Turn多Step的完整轨迹
**完整系统 · 10分**

同一Agent接一个用户任务，固定Prompt/Context/工具集合，无新输入。Step1第一次请求先给草稿再TRANSPORT失败，request-error只在本次返回retry；第二次请求提出id=c1的read_fixture，工具返回T；Step2请求读取T后回答并stop。无concluded、所有append成功、stopping不加输入。写结构事件与live提交关联、Turn/Step/请求/工具计数、三份历史的关键差异，以及assemble/pre-step/request各调用几次。可省略Inbox/请求封装的重复细节，但必须标明省略。

[答题后看详细答案](assessment-answers.md#q14)

<a id="q15"></a>
## 15. 综合C：由Section、Context与Schema推导输入
**完整系统 · 10分**

关闭内置身份，空Persona，无complete，无展示Waterfall。先登记zeta(order20,text='Z')、Alpha(order20,text='A={{tone}}')、first(order-10,text='R')；tone在assemble时为短，随后改长。Context directory为required、interpolate=false、文本Provider在assemble读A，agent/request内改B。knownNames=[read,hidden,audit]，可见schemas=[read,audit]，toolOrder=[hidden,<unlisted-tools>,read]。空新Session，默认pre-step，一次正常请求。给有效Section顺序、assembly中的Alpha/变量、系统渲染精确文本、Context完整快照正文、请求messages主要角色/source与tools顺序；说明何者记入日志以及若拼错hidden为typo在哪阶段失败。

[答题后看详细答案](assessment-answers.md#q15)

<a id="q16"></a>
## 16. 综合D：分片、取消与最终结算
**完整系统 · 10分**

一Turn一Step，输入已接纳、流已start。依次收到text-delta(7,'半句')、reasoning-delta(2,'核对')、tool-call-delta(4,id=c1,name=read_fixture,args='{}')、block-end(4,完整合法工具c1)。没有usage/finish。确认这四片均已交付后本地cancel(user)，生成器协作退出，所有append成功，无恢复监听器。推导块预览、安全前缀、最终事实/帧与Turn reason、工具执行数、是否新请求/Step。再分别只改为“signal未取消且收到finish(error)”与“本地取消但匹配message append被拒绝”，各说明差异。

[答题后看详细答案](assessment-answers.md#q16)
