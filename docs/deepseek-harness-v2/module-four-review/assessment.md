---
estimatedTime: "100～150分钟；作者估计，未施测"
difficulty: "第四模块跨课理解与迁移"
objective: "用实际轨迹解释可见性、决策、后端边界与会话事实"
checklist:
  - "已完成18题的独立推导并按Rubric复核安全边界"
checkKeys:
  - "check-f04a202611020001"
---

## 作答约定

共18题100分，先独立预测再展开答案。所有前提均绑定固定Commit f3803c96974ad4a94195fb97e5c637e9c2a3afe3。题13–16为跨课A/B/C/D，题17按四层递进。建议保留中间值和证据，不以术语命中评分；可接受其他正确定位路线。自评分数与建议时长均未由真实学员校准。安全关键误解单独登记，不能被总分抵消。

## 01｜定义与Schema推导（4分）

使用defineTool：参数data为必填object，additionalProperties=false；其中values为number数组。隐式参数根未写关闭。输入①{data:{values:[2,4]},note:"x"}；②{data:{values:[2,"4"]}}；③{data:{values:[]}}。业务主体要求非空并返回{total:number}。逐项判断；再分析oneOf[number,integer]的2和2.5。

:::deepdive{title="第01题标准答案与评分"}
**标准答案：** ①形状通过，根note允许，主体返回total=6。②数组元素类型错，包装器在主体前拒绝。③形状通过但业务可拒绝；空数组不是自动Schema错误。oneOf中的2命中两个分支失败，2.5恰好一个通过。

**逐步推导：** 先区分隐式根开放与显式嵌套关闭；再检查元素类型；最后分离业务非空规则。oneOf数命中分支，不能按TS联合推断。Schema通过仍没有证明当前调用有权执行。

**Rubric（4分）：** 根/嵌套1；元素1；空数组业务1；oneOf1。

**常见错误：** 把根额外字段判非法；把default当自动补值；把oneOf当至少一个；把形状通过等同安全。

**依赖知识：** H13 DSL、defineTool、业务/授权边界
:::

## 02｜Scope逐层计算（4分）

根登记x、y。A自己登记x、z；A加allow=[x]与deny=[x]，子级B无自身工具，父链显式为A。分别求A/B视图；撤销deny后呢？这些操作是否限制OS文件访问？

:::deepdive{title="第02题标准答案与评分"}
**标准答案：** A为自身x/z；B为空。撤销deny后A仍x/z，B仅继承x。根y和A的z在B处受祖先allow排除。Scope不提供OS文件隔离。

**逐步推导：** 先在每层计算继承贡献的过滤交集，再叠本层自身登记。自身豁免相对当前层：A的z到了B是继承项。最后区分贡献路由和资源强制。

**Rubric（4分）：** 初始A1；B1；撤销后1；OS边界1。

**常见错误：** 把父级自身豁免延伸到后代；把allow覆盖deny；认为同名x同时发给模型。

**依赖知识：** H13 shadow/restrict；H09 Scope
:::

## 03｜when与旧集合（4分）

conditional在Step1的when=true并获set S。之后enabled=false；同Step明确retry。随后注销并重登记同一个definition对象。预测retry声明、旧S资格、新Step及S.dispose效果。

:::deepdive{title="第03题标准答案与评分"}
**标准答案：** 闭包变false不重算S的when，同Step重试复用已组装声明；新Step重算会排除。注销重登记产生新注册身份，旧S不承认它，即使对象相同；新resolve按当时条件判断。S.dispose永久读空，不注销全局定义。

**逐步推导：** 按“步骤决定”和“调用时当前有效性”两条轴分析。旧S保留准入身份，读视图仍核Scope与登记。已发请求不会被追溯改写。

**Rubric（4分）：** retry1；重登记1；新Step1；dispose1。

**常见错误：** 说快照永远有效；说每次调用重新when；把dispose当撤销工具。

**依赖知识：** H13 resolve、H11请求准备
:::

## 04｜解析和校验在哪里（4分）

Native收到arguments="{broken"的原始ToolCallBlock，工具由defineTool定义。对照pre直接deny与pre委托allow。分别列JSON解析、深冻结、审批/guard、输入Schema与主体的位置。

:::deepdive{title="第04题标准答案与评分"}
**标准答案：** batch解析失败保留字符串；prepare分离/冻结参数，再跑pre以及条件性的ask/guard。pre拒绝不进定义包装，不能断言已得INVALID_ARGS。allow经guard后dispatch包装才校输入，得到INVALID_ARGS，作者主体0。

**逐步推导：** 沿batch→prepare→dispatchToolBody→defineTool，而非按“解析验证”一个词跳步。参数冻结不等于整个exec在pre时已冻结。

**Rubric（4分）：** 解析1；准备与顺序1；两路结果1；冻结分层1。

**常见错误：** 以为坏JSON必在batch抛错；以为所有Schema都在pre之前；以为readonly等同全程冻结。

**依赖知识：** H13包装校验；H14三阶段
:::

## 05｜Waterfall与单调守卫（4分）

外层pre await next后把内层deny改成allow；guard返回拒绝原因。post尝试accept.value=99。无恶意同进程绕过。推导主体是否启动、post能否复活成功，以及guard的保证边界。

:::deepdive{title="第05题标准答案与评分"}
**标准答案：** 最终pre是allow，所以到guard；guard拒绝，主体0。后置结果可以被处理，但不能用新规范值把失败复活为成功。普通pre deny可被外层改，guard只拒绝/不表态；这不是防任意同进程代码的OS隔离。

**逐步推导：** 区分Waterfall回程修改和最终守卫检查。再看post只允许对成功结果替换value的条件。已进入的外层仍能运行，不等于拒绝能被所有后续机制放宽。

**Rubric（4分）：** pre回程1；guard/body1；post1；边界1。

**常见错误：** 说所有deny都不可逆；说批准/allow越过guard；说guard防宿主恶意插件。

**依赖知识：** H06 Waterfall；H14/H15 guard
:::

## 06｜规范值、内容与副作用（4分）

工具已经完成一次写入并成功返回value={n:1}、meta={label:"one"}。比较post仅改content、改value={n:2}、block三种结果；哪个证明写入没发生？假定输出Schema与渲染都正常。

:::deepdive{title="第06题标准答案与评分"}
**标准答案：** 改content保留value/meta；改value重新校验并render/meta，不重跑projectContent；block去除成功值、旧meta及主体上下文，仅留阻止方上下文。三者都不证明写入未发生，post不是回滚。

**逐步推导：** 先确认副作用在post之前。按候选结果分支逐层追value/content/meta和上下文。tools/result随后观察冻结权威结果，持久消息不全量保存规范value。

**Rubric（4分）：** content1；value1；block1；副作用1。

**常见错误：** 隐藏文本当保密；block当撤销外部效果；把tool消息当完整规范值存档。

**依赖知识：** H14结果处理；H13输出契约
:::

## 07｜滚动池与有序结算（4分）

调用模型顺序A/B/D/C；A/B/D分类明确true，C独占，上限2。B先完成，A仍挂起，D可完成。列启动、主体完成、complete/提交与C屏障允许的顺序。无取消和故障。

:::deepdive{title="第07题标准答案与评分"}
**标准答案：** 先启动A/B；B腾出位可启动D，A未完成时B/D不能抢先complete/提交。A结束后按A/B/D结算；C在前序全部结算后独占启动。D是否先于A结束由门闩决定，不是框架固定时间。

**逐步推导：** 区分填池、dispatch完成与commitReady连续前缀。滚动补位不等于固定两人一组；有序提交不等于主体全串行。每项启动前的模式还会复核。

**Rubric（4分）：** 启动/补位1；完成不固定1；有序提交1；独占1。

**常见错误：** 按B/D/A结果顺序写Session；把并发安全声明当权限；认为C只等B。

**依赖知识：** H14调度/重分类
:::

## 08｜审批的两种ID和四结果（4分）

有效Turn内，同一callId两次审批，答案先allowed-once再rejected。另问never加预先取消的signal，以及ask无人应答。列结果、应答次数及审计含义。

:::deepdive{title="第08题标准答案与评分"}
**标准答案：** 两次请求分别产生不同ApprovalRequestId与两对asked/decided，第二次拒绝，没有callId授权缓存。never且预先取消先得cancelled，不询问；ask无人得unavailable。allowed-once只准所问一次，不承诺服务自动限制主体执行次数。

**逐步推导：** 先区分请求ID和工具ID；按每次request单独记账，再看decide的预取消→never→应答链。审计记录为log-only，不自动成为模型聊天消息。

**Rubric（4分）：** 重复请求1；ID/审计1；两异常1；单次边界1。

**常见错误：** 复用callId当永久批准；应答者读req.id；认为never永远不可能cancelled。

**依赖知识：** H15 ApprovalService、H14 call关联
:::

## 09｜沙箱两条坐标（4分）

Session A持久workspace-write；部署read-only；本次调用方已获批mode=read-only。另一次Windows后端报告partial。分别解析模式、下一调用、根与网络承诺。再判断无runner时是否应裸跑。

:::deepdive{title="第09题标准答案与评分"}
**标准答案：** 显式本次mode优先，当前read-only；下次不传回到Session workspace-write。根来自Session不可变header cwd，否则部署回退。partial与模式正交；模式仅讲文件效果，不保证网络隔离或其他目录不可读。无runner受限执行应SANDBOX_UNAVAILABLE，不静默透传。

**逐步推导：** 先解析覆盖优先级，再看消费者是否实际confine和enforcement。resolve不替调用方审批；本次mode不写sandbox/mode。临时区域/额外根也影响写范围。

**Rubric（4分）：** 当前/下次1；根1；partial/网络1；fail closed1。

**常见错误：** 把partial隐藏为full；把workspace-write当只能读工作区；认为resolve已批准。

**依赖知识：** H15 SandboxPolicy/provider/consumer
:::

## 10｜观察状态与会话恢复（4分）

已挂Observation且消费者正确发fs事件、后端遵守expected。目标三种状态：未见、absent、present(v1)。分别写/edit怎样？旧Session同ID重建新对象后，持久模式和观察表各怎样？

:::deepdive{title="第10题标准答案与评分"}
**标准答案：** 未见/absent写用createIfAbsent；未见edit为FS_NOT_OBSERVED，absent为FS_NOT_FOUND；present写/编辑携旧版本，后端可报FS_STALE_VERSION。持久模式可从事件恢复，观察以Session对象为WeakMap键，新对象需重读。

**逐步推导：** 先选意图，再看后端条件。直接readText不发观察事件；插件可选且单槽规则可能被不当拦截。原子发布不等于任意外部写者的内核CAS。

**Rubric（4分）：** 三状态写1；edit1；恢复1；组合/竞态边界1。

**常见错误：** 没读过禁止一切创建；恢复同ID自动信任旧版本；把单槽waterfall叫单调guard。

**依赖知识：** H15 FS；H16 tool-fs
:::

## 11｜Web选择和步骤准入（4分）

启用web_search：①只有一个available Provider且ready=true；②它ready=false；③没有available Provider；④未显式配置且两个available。分别判断注册、Step Schema、执行。无真实联网。

:::deepdive{title="第11题标准答案与评分"}
**标准答案：** 四种配置都保留工具注册。①准入且可调用；②当前Step排除，正常调用无资格；③选择失败被ready路径当true，Schema仍可出现，执行WEB_PROVIDER_UNAVAILABLE；④同样可能准入但执行WEB_PROVIDER_AMBIGUOUS。ready不是网络健康。

**逐步推导：** 先看稳定开关决定注册，再读selectedProviderReady对选择失败的处理；最后真正search选择可能抛结构化错误。显式配置优先于唯一推断，configured-missing/unavailable另有码。

**Rubric（4分）：** 注册1；readyfalse1；none1；ambiguous1。

**常见错误：** 注册了必可搜；无提供方必从Schema消失；ready代表Internet可达。

**依赖知识：** H13 when；H16 WebRuntime/tool-web
:::

## 12｜MCP名字与断连（4分）

serverName=alpha，远端raw工具metadata。另有a.b与a/b这类需规范化名字。连接已建立后断开且禁重连；随后手动dispose。解释名字、wire调用、工具与资源行为，以及一次自动重连成功能证明什么。

:::deepdive{title="第12题标准答案与评分"}
**标准答案：** 普通名mcp__alpha__metadata；需改写/截断者保留身份摘要，预算64，不承诺数学上零碰撞。调用闭包发送原raw名，不从public名倒推。禁重连断开可保留上次注册，调用/资源失败；dispose才撤销并关闭。一次新pid成功只证明受控stdio恢复，不覆盖HTTP/完整退避。

**逐步推导：** 分公开名和远端原名，分注册与连接可用性；phase1发现失败留旧，phase2注册冲突回滚自有新工具，不能统称旧目录一定保留。

**Rubric（4分）：** 命名1；wire1；断连/释放1；证据限制1。

**常见错误：** 断连立即全部消失；stdio当沙箱；发现当授权；一次重连当全协议认证。

**依赖知识：** H13 Registry；H16 MCP
:::

## 13｜综合A：可见、批准、仍被拒绝（8分）

真实Loop的Step1收到audit_sum Schema；模型发id=visible-denied、合法参数。pre返回ask，ApprovalService答allowed-once，guard拒绝。Native带log。请求2正常完成。要求画至少8节点链、列主体数/审计/两类结果事件/下一请求，并引用本轮cross-A证据。

:::deepdive{title="第13题标准答案与评分"}
**标准答案：** Schema可见→ToolCallBlock→batch记tool/call→prepare/pre ask→asked/decided allowed-once→guard deny→主体0→错误结果处理/冻结→tools/result→Session tool/result→下一请求工具消息。批准与最后拒绝可同时为真；普通工具错误未必终止Turn。

**逐步推导：** 从cross-A.json找请求1声明和模型call，再看cross-A-body.json的pre/approval/guard轨迹与bodies0；按callId配对Session，最后在请求2找isError工具消息。不得把观察回调当持久记录。

**Rubric（8分）：** 声明/提议1；call及审批顺序2；guard/body2；运行时与Session区分1；下一请求1；证据/限制1。

**常见错误：** 省略guard；说批准就一定成功；错误结果意味着Turn必崩溃；把log条件省略。

**依赖知识：** H13+H14+H15；新增D-A
:::

## 14｜综合B：权限检查与并发结算（8分）

模型顺序A/B/C，上限2；A/B分类true、C独占。A已进入主体挂起；B在pre ask中获批准后被guard拒绝。保证B已形成可结算失败后才放A，C无拒绝。列各主体次数、允许的运行重叠、结果顺序与副作用结论。该精确组合未单独实测，应说明推导证据。

:::deepdive{title="第14题标准答案与评分"}
**标准答案：** A/C各1，B为0。B的准备决策可在A运行时发生，但其失败结果等A按模型顺序complete/提交，结果A/B/C。C等前序结算后独占。B批准无权越guard；A已经开始，不能把后来B拒绝当A事务回滚。

**逐步推导：** 组合H14调度和H15approved-guard，按prepare与dispatch不同阶段推导。前提已经限定门闩，不声称所有await精确时间固定；新增A与H14 parallel各提供局部证据，这个三调用审批组合属源码推导。

**Rubric（8分）：** 各主体2；重叠/阶段2；结果/屏障2；副作用1；静态推导与执行证据区分1。

**常见错误：** 把B预拒绝当整批取消；按失败先后提交；并发安全等同审批通过。

**依赖知识：** H13准入；H14滚动池；H15 guard
:::

## 15｜综合C：File、Shell与陈旧编辑（8分）

真实File工具读取fixture.txt(v1)；外部编辑器先把它改成长得不同的v2；随后File edit仍用v1。Observation已挂。模型提出通过pwsh直接写来绕开失败，并声称有workspace-write沙箱所以等价。请诊断并给受控恢复；比较新同ID Session。

:::deepdive{title="第15题标准答案与评分"}
**标准答案：** File edit应先报FS_STALE_VERSION；重读v2再形成新修改可成功。不得用Shell绕过版本条件；进程文件范围不自动带File观察策略，File围栏也不限制任意Shell。新Session对象无旧观察，须重读；模式可能持久。

**逐步推导：** 用cross-B完整8调用证明未见→读→编辑→外改→陈旧拒绝→重读→成功；本轮外改用Node夹具，不是原生Shell实测。说明读过窗口记录版本不保证理解全部文件。原子发布仍有外部竞争窗口。

**Rubric（8分）：** 陈旧原因/码2；重读恢复2；File/Shell边界2；Session生命周期1；测试限制1。

**常见错误：** 搜索旧字符串失败当陈旧；切Shell视为正当恢复；把fs-sandbox当内核；宣称外部竞态全消除。

**依赖知识：** H14副作用；H15观察/沙箱；H16 File/Shell
:::

## 16｜综合D：Web与MCP故障诊断（8分）

一次模型请求仍见web_search和mcp__alpha__metadata。Web提供方available=false；MCP是已建立后断线且禁重连。有人删除本地权限插件来“让工具重新可见”，又把Fetch页面脚本被过滤当可信内容。诊断四个混淆并列排查证据。

:::deepdive{title="第16题标准答案与评分"}
**标准答案：** 两工具可保持登记，模型可见不证明当前后端可用。Web选取失败可仍准入，调用报WEB_PROVIDER_UNAVAILABLE；MCP旧注册可留但SDK调用/资源失败。删除权限不是修连接。HTML清洗/不可信标签都不授予信任，HTTP无内建完整私网/loopback拒绝。

**逐步推导：** 先比实际请求、登记和准入，再查具体Provider/SDK故障；从调用id/规范错误/Session结果定位。处理配置与连接生命周期，保留Scope/guard。区分Web普通404结果和网络异常，MCP远端isError与transport断线。

**Rubric（8分）：** Web2；MCP2；权限/信任2；错误层次与证据2。

**常见错误：** 断线等同权限拒绝；工具可见所以后端正常；允许loopback的纯URL测试当实际SSRF测试；stdio结论外推HTTP。

**依赖知识：** H13/H14诊断；H15安全；H16外部能力
:::

## 17｜阶梯综合任务：提交可审阅的项目说明（10分）

只用新临时目录和假资料；需求是读项目配置、必要时编辑、执行受控检查、查离线文档、取本地MCP元数据。第一层画四家族Service/Provider/Consumer；第二层给最小allowlist与读/改计划；第三层注入外改和MCP断线，写出逐调用/结果/下一请求；第四层设计恢复与证据报告。允许用本轮现成夹具，不要求实际原生Shell/联网。

:::deepdive{title="第17题标准答案与评分"}
**标准答案：** 第一层：File=tool-fs→fs，Shell=tool-pwsh→ShellExecutor，Web=tool-web→WebRuntime→提供方，MCP=每Server定义→SDK，无ctx.mcp。第二层仅允许任务所需名，read→edit，保留审批/guard/观察。第三层外改导致陈旧拒绝并重读；MCP断线记录失败，不能假装成功或扩大权限。第四层按副作用可知性恢复，保存两侧请求/关联结果/第二Session重建与Mock边界。

**逐步推导：** 逐层交可验证产物而非堆概念。先能定位角色，再判断当前资格，再走失败，再报告证据。可以不执行某能力，但必须标NOT_RUN；未知写结果不能自动重发。对已发生写入另核状态与幂等。

**Rubric（10分）：** 角色图2；最小范围/读改2；失败轨迹2；恢复/不可重放2；原始证据与未验证2。只列术语最多2分；无因果中间值不得高层分。

**常见错误：** 所有安全插件画成必经总链；远端声明write自动加allow；复原Session就重发全部工具；把FixtureShell写成Windows原生验证。

**依赖知识：** H13–H16全模块；H10/H11/H12请求与事实
:::

## 18｜诊断与H17交接：四份记录（10分）

持有①tools/result观察中的value/content/meta，②Session tool/call和tool/result，③下一请求的工具消息，④MCP Resource列表。同事要用①恢复整个应用、把④全塞进系统提示词并重放②的写操作。说明至少四个错误并设计一条可检查的交接断言。

:::deepdive{title="第18题标准答案与评分"}
**标准答案：** ①是运行时权威结果观察，规范值不全量持久保存；②事实经surface/投影形成③，内存append也非磁盘flush；④按需读资源，不自动把全内容送入系统提示词，server instructions是另条有Scope贡献；重放历史不能自动恢复进程/连接/观察表或重做写副作用。

**逐步推导：** 先按拥有者和生命周期分类，再按id/seq重建历史。可检查断言：从每次请求当时的事件前缀，在另一真实Session重建messages/config/tools/toolHistory相等；这是内存重建，不是跨进程JSONL恢复。H17接事件/读视图，H18才接resume/fork，H19/20接压缩与故障。

**Rubric（10分）：** 四个混淆各2分，共8；可执行前缀断言及边界2。

**常见错误：** 把所有SessionEvent都当模型消息；MCP resources当Prompt模板；replay等同重执行；内存快照当已落盘。

**依赖知识：** H14结果；H16资源；H10/H12与H17–20前置
:::
