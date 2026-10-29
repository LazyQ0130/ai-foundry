# 综合测验答案、评分与误答分析

对应 assessment.md，14题共100分。分值是作者拟定量表，未施测/校准；不是平台打分器。按事实与因果给分，不按中文关键词。允许其他正确源码路线和可论证设计。依据索引：technical-review.md；执行定位：test-evidence.md。

## Q01（5分）

Module 组织导入导出；Plugin 提供宿主挂载入口/元数据；Service 是以键暴露的能力值；Context 是当前访问/作用环境；Entry 是 Loader 管理的一行配置与运行关联。类型删除只影响编译检查，不会发出运行卸载动作；反过来声明存在也不创造服务。

评分：五角色各0.8分，共4分；编译/卸载区别1分。误答“每个 Plugin 就是一个 Service”混淆贡献与产物；“id 是 Fiber uid”混淆配置与运行身份。H05 #3–9、H08 #7–9 支持。

## Q02（6分）

Consumer 稳定 PENDING，apply=0；await 可以在当前转换稳定时返回，不能据返回就说 ACTIVE。应按宿主契约挂载真正 Provider，待同域服务 ACTIVE，或修复实际依赖/作用域装配。声明与 import 只提供类型/模块，any 只是去掉检查，不能创建实现、授予依赖访问或完成初始化。

评分：PENDING/0为2分，await 边界1分，正确装配2分，any 原因1分。误答“await 永远挂住”把稳定等待状态当未完成 Promise；“加服务类型”重复了缺失动作。H05 #5、H07 #4。

## Q03（7分）

| 模式 | 放行前 | 放行后与发布者结果 |
|---|---|---|
| emit | A+、B、C，发布者已得到 undefined | A- 后 A 自己完成；不会把已有发布返回改成 false，也没有收集业务结果 |
| parallel | A+、B、C，都已开始 | 等 A- 后整体兑现 undefined；完成顺序不是登记顺序 |
| serial | 只有 A+，发布者等待 | A-→B，false继续、0停止，不进 C；返回0 |
| bail | 只有 A+，A 返回的 Promise 对象已使分发停止 | 不进 B/C；立即返回的是该 Promise，调用者若 await 它最终得 false，不能追补继续分发 |

parallel 的 B throw 被收集，仍等 A 完成后 AggregateError；不会自动取消 A。评分：四模式各1.25分，共5分；parallel 错误与取消边界2分。误答“0 是 falsy 所以继续”不符合 isBailed；“bail 得 false 就会继续”混淆对象判断时点与调用者 await。

## Q04（6分）

正常 A入→B入→主体2→B返20→A返21。①B不委托，主体0次，返回 false 到 A，按题中 JS `false+1` 得1；这不是 serial/bail 判据在控制 Waterfall。②主体1次，B返20，A丢弃并隐式返回 undefined。③第一次 next 消费 B，主体一次返2、B返20；第二次共享游标已越过 B，默认主体再一次返2，A返回第二次的2，总主体2次。

评分：正常1.5分，三个变化各1.25分，重复委托风险0.75分。误答①“false 会继续下一监听”误套 bail；②“没返回说明没执行”会导致危险重试；③“框架自动报 next 重复”不是本版事实。H06 #5/7/18/24。

## Q05（6分）

根G、a为A、b为B、s2为S；同 Symbol 指向同一域。服务解析域改变键的选值，不建立进程/内核边界；Bundle 描述配置贡献来源，不自动定义域。是否共享看 isolate/realm 设置和 Context，不能凭文件来源判断。

评分：四值3分（各0.75），域原因1分，OS边界1分，Bundle区别1分。误答“同服务键只能全局唯一值”忽略域；“base/app两个Bundle自然隔离”混淆层序与服务可见性。新增 scope 探针实际验证原生 Cordis 选择；Loader 标签转换与复杂重组只静态核。

## Q06（6分）

缺服务：PENDING、未执行入口。加载入口抛错：已登记清理执行，稳定 FAILED、错误保留，await 拒绝。ACTIVE 更新校验拒绝：在本题普通路径中重启尚未开始，raw可新、effective/服务仍旧，仍 ACTIVE，不应给出统一 FAILED。显式 dispose：DISPOSED/uid空，服务恢复不会让此实例复活；另行挂载是新实例。根 Fiber 的 dispose 使用 restart，不能套普通终点图。

评分：四场景各1.25分，根特例1分。误答“凡校验错误都 FAILED”正是 M2-01 修订要防的跨阶段泛化；“DISPOSED 是外部成功证明”未检查清理错误。H07 #2/4/20、新 M2-01、H08 #19。

## Q07（8分）

开始 B→A，完成由门闩控制 A→B，owner 等两者已登记清理结束才完成。将需要严格先后的动作放一个 `effect(()=>async()=>{await flush();await close();})`；若 flush 失败仍必须 close，应再用 try/finally 并定义两类错误如何报告。只把 A/B 登记顺序调换不能保证异步完成先后。

公共 stop 的第二次调用可直接返回 undefined，不是首个任务的 join；保存并等待首次返回。owner 内部能加入已开始清理，不意味着任意重复句柄会这样做。DISPOSED 证明实例退出，正常 logger 下错误已记且继续其他清理，不能证明远端资源确实关闭。

评分：开始/完成各1分，owner 等待1分，单 Disposer 顺序与失败处理2分，首次任务2分，状态限制1分。误答“LIFO 就是全部串行”“第二次 await stop 已完成”分别混淆启动/完成和一次性/共享任务。H07 #10–16。

## Q08（6分）

第一步仍 id=model、name=provider，config **只有** `{model:'surface',temperature:0.4}`；retry 消失。第二步 config **只有** `{model:'cli'}`；temperature 消失，外层 id/name 保留。name=different 是断言不匹配，报告警告并跳过，结果仍 cli，不改名成新模块。父 Include 的 Patch 不自动穿过另一个文件找其 child ID；需在正确输入树/文件操作。

评分：两步各1.5分，name1.5分，Include1.5分。误答“cli 还保留 retry/temperature”是深合并错误；“Schema 可能填默认值，所以 Patch 就是深合并”混淆后续解析与当前赋值。H08 #3–6/C、深合并变异预期失败。

## Q09（7分）

Include 坏 YAML 在读取提交前失败，可保旧树；App Boot 已应用后入口失败可能保新 raw/config 和 FAILED，旧服务已撤销，不能保证还原。HMR 预导入失败发生旧实例卸载前，缓存有回退但不能推广到全部导入副作用；替换激活失败尝试恢复旧插件，恢复本身也可能失败，更不能还原已写外部世界和旧业务内存。

前两类（另含 Schema 反例）有作者真实 App Boot/Include 执行；后两类原生 HMR 只静态读固定实现及 modules 官方测试，未执行 watcher/原生模块替换。CLI overlays 是启动时内容快照，编辑原文件不保证重读；env/argv/构建产物和映射变化可能需正确关闭后重启。

评分：四阶段各1分，执行/静态区分2分，输入快照1分。误答“有catch就全部回滚”忽略应用阶段、restore再次失败与外部副作用。H08 #10/13/19/D；HMR NOT_RUN。

## Q10（5分）

可接受定位：`vendor/cordis/src/events.ts:isBailed:7–15`，只排除 null/false/undefined；`events.ts:254–259`，登记/移除由 ctx.effect 包装；`fiber.ts:update:764–782`，先写 `_config`，ACTIVE 时 resolveConfig 在 internal/update/restart 前，抛错就不到后续重启。

每个正确文件+分支+关键顺序1.5分，共4.5分；“定位≠执行”0.5分。行号允许覆盖完整相邻函数但需同固定版本，不能只有文件名。误答只贴测试目录没有 action/assertion，无法支撑控制顺序；说“官方测试已通过”须真的有运行日志。本轮官方 Vitest 未运行。

## Q11 · 综合 A（10分）

| 阶段 | Consumer | 累计 apply | catalog |
|---|---|---:|---|
| 无 Provider | PENDING | 0 | 不可用 |
| Provider LOADING | PENDING | 0 | 已 provide 不等于提供方已可用；不能借用 |
| Provider ACTIVE | ACTIVE | 1 | v1 |
| Provider 被释放 | 清理后 PENDING | 1 | 不可用 |
| 新 Provider ACTIVE | 原 Consumer 再加载后 ACTIVE | 2 | v2 |

Consumer uid 保持，旧轮资源已撤销，新轮重新登记；Provider 的新挂载是新 Fiber，不由此推成 Consumer 是其孩子。显式 dispose Consumer 后不再恢复。去 inject 只剩类型，不能建立所需访问/激活关系；固定实现可能抛依赖访问错误，any 也不解决。

评分：前两等待阶段2分，激活与失去/恢复各阶段共3分；uid/资源2分；非父子1分；永久释放1分；遗漏 inject1分。关键误答“provide 后立刻调 Consumer”“Consumer 必须新建”“给 Context 声明就能访问”分别忽略激活、身份和运行依赖。新 A/B级探针验证时序和 uid；H05 #6补遗漏 inject，H07 #19/20补资源与永久释放。

## Q12 · 综合 B（10分）

allow：L+→P→M+→BODY→M-→L-，主体1次，`{ok:true,text:'log(DATA)'}`。deny：L+→P→L-，主体0次，`{ok:false,text:'log(DENIED)'}`。已进入 L 的回程仍会包装，必须保留 ok=false；拒绝不自动跳过所有外层。

卸载三插件后未来 Waterfall 无这些监听，默认主体仍执行一次并返回原 DATA（假定发布者仍运行）；计时器通过 Effect 的 clearInterval 撤销，不再产生未来 tick。已经进入的 parallel 回调不因 on 移除自动取消/等待，仍可在门闩放行后完成；真实业务需显式停止新工作、发取消并等待自己持有的工作任务/业务 drain，再按依赖关闭资源，考虑失败。不能由 owner 已退出推一切异步工作静止。

L 漏 return 时，allow 主体已1次但最外层 undefined；deny 主体0次也可能 undefined，所以应看轨迹/业务证据，不能盲重试。评分：两轨迹与结果各2分（共4），未来监听/主体1分，计时器1分，在途/drain2分，漏return诊断2分。误答“撤销监听杀掉所有回调”“undefined就没有写入”是工程关键错误。H06 #21–24、H07 #7/23与新 B真实探针共同支撑。

## Q13 · 综合 C（12分）

Provider id/name 始终保留；config 五步为 `{value:'base',retry:2}` → `{value:'app',timeout:30}` → `{value:'profile'}` → 同前（Home只改 disabled）→ `{value:'cli'}`。disabled 最终 false。Consumer 条目仍在，满足已 ACTIVE 的 catalog 依赖后运行；不能把清单先后当必然初始化顺序。retry 在 app 消失，timeout 在 Profile 消失，完整 config 赋值而非合并。

下一代去掉 CLI 的 disabled:false，Home的 true 成为最终开关。Provider Entry保留、旧 Fiber DISPOSED；catalog撤销，Consumer 清理后PENDING，保留原 Fiber/uid。恢复显式 CLI false 后仍可同 Provider Entry，但创建新的 Provider Fiber，原 Consumer恢复并重新登记 on/Effect。旧监听/计时器若没清，下一轮会重复或访问旧连接；在途工作仍需业务退出安排，清理不恢复外部写入。

应用后 Provider apply抛错可留新配置和FAILED、catalog不可用，Consumer可PENDING；不能保证自动恢复cli。requiredId 把本应稳定等待的必需行视为启动/重组失败，但不能据拒绝就假定新条目消失或旧服务恢复。题目明确显式组合输入变化，不等同原生watch已验证。

评分：五层完整config及开关3分；丢字段原因1分；Consumer激活条件1分；禁用/恢复状态与三类身份3分；资源原因1分；应用失败/无通用回滚2分；requiredId边界1分。误答“CLI永远覆盖全部字段”“稳定ID保Provider Fiber”“Consumer缺服务就是FAILED”分别混合字段写入、身份与状态。H08 #3/7–9/10/17/20支持，未把自制A当真实boot。

## Q14（6分）

一种方案：共享能力 Bundle 提供模型/会话/摘要等稳定行，应用 Bundle 只提供各入口差异；Profile 有序选择，后层必须带完整所需 config。Consumer声明服务，Provider由组合选择；常驻入口登记监听和退出，Headless/SDK按应用关闭协议等待业务工作并释放资源。官方 sdk-minimal 是独立树，应单独选择而不是自动加base；自定义更小树也可，但要解释需要保留的能力和兼容成本。

合格陈述：“教学子集、固定 Cordis、官方组件及隔离自定义 Profile/App Boot 在列明范围通过；五个随附模板只解析配置。原生 HMR和完整官方应用未运行；学员无提示理解与时长尚未测量。”不能称完整Harness集成或学员掌握已通过。

评分：合理复用与入口2分，ID/依赖/退出各0.5分（共1.5），minimal例外0.5分，证据与未验证2分。误答只堆更多Bundle却无契约/退出，不能证明可维护；把D局部通过外推E属于关键误解。其他结构只要边界和取舍清楚，同等给分。

## 施测后才可以下的结论

自动探针只核题目依赖的运行事实；本册没有把学员中文解释自动判分。未来保留原始匿名答案、时间与提示日志；分别看概念、因果、证据和边界，再讨论通过阈值与评分一致性。本轮未招募/测量学员，不制造样本、准确率或完成时间。
