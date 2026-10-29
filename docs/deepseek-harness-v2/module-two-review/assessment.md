# H05–H08 综合理解测验（14题，100分）

适用固定 Commit `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`。建议先遮住 [答案和评分](assessment-answers.md) 作答，再查源码核对。75–110 分钟只是作者估算，未施测、未校准。无 API Key、真实 Agent 或个人 Home 操作。片段为题目结构，不是可独立运行的完整项目；运行依据见 test-evidence.md。

提交每题“结果/顺序、原因、证据、适用边界”；自由题接受其他有证据的设计。无特别说明时监听按登记顺序、没有 prepend、同一服务域、普通非根 Fiber、无更新拦截，所有指定 await 已等到当前转换稳定。题目之间互相独立。

## Q01 · 五种对象（5分）

仓库里有 `greeter.ts` 模块，导出带 apply 的 Plugin；apply 用 Service 构造器提供 greeter；消费者通过自己的 Context 调用它；Loader 配置行 id 是 greeting。分别指出 Module、Plugin、Service、Context、Entry 解决什么问题。删除类型声明是否等于卸载运行服务？

## Q02 · 有声明为何没运行（6分）

Consumer 声明 inject=['greeter']，已经 ctx.plugin 挂载。项目有 greeter 的声明合并和已安装/导入的 Provider 模块，但未挂载 Provider。预测 Consumer 状态、apply 次数和 `await consumer.await()` 能否返回。给出最小正确修复；解释为什么给 Context 加 any 不是修复。

## Q03 · 同一返回值，不同分发模式（7分）

同一事件依次登记 A/B/C。A 是 async：记录 A+，等待门闩，记录 A-，返回 false；B 记录 B，返回0；C 记录 C，返回9。

分别从全新夹具调用 emit、parallel、serial、bail。门闩尚未放行时，哪些回调已开始？放行后哪些会完成？发布者得到什么？再令 parallel 的 B 同步 throw，A 仍在等待：发布者是否立即拒绝并取消 A？

## Q04 · Waterfall 的三个错误（6分）

外层 A：`const x=await next(); return x+1`。内层 B：`const x=await next(); return x*10`。主体返回2。写正常进入/回程和值。

三种独立改动：①B 直接返回 false、不 next；②A 保留 await next 但不 return；③A 连续 await next 两次并返回第二次结果。分别给主体调用数和最终值；③假定 B 不变、主体每次返回2。能否把重复 next 当通用修复？

## Q05 · 作用域不是进程（6分）

根域提供同名服务值 G。a、b 分别 `ctx.isolate('value')`，在各自域提供 A、B；s1、s2 使用同一 Symbol 调用 isolate，s1 提供 S。无缺失依赖，提供方均已 ACTIVE。根/a/b/s2 的 `get('value')` 分别是什么？为什么不能由此推断 OS 权限隔离，或把“来自同一 Bundle”当作同一 realm？

## Q06 · 状态有原因（6分）

分别分析：缺必需服务；加载入口登记清理后抛错；ACTIVE 普通更新被 Schema 拒绝；显式 dispose 后必需服务恢复。写稳定状态及旧资源/实例是否可恢复。指出根 Fiber 特例为何应排除在本题外。

## Q07 · 异步清理与顺序（8分）

同一插件按 A、B 顺序登记两个独立 Effect。A 的清理等待 flush；B 的清理等待 close。两者都有受控门闩。在一次 owner dispose 中，先观察到 B开始、A开始；然后放行 A，最后 B。

写开始/完成顺序，owner 何时结束。若业务要求 flush 完成才 close，应如何改登记方式？第一次 stop 返回的任务尚未完成时再调用 stop，能否用第二次返回值证明第一次完成？某清理失败但状态 DISPOSED，又能证明什么？

## Q08 · Patch 手算与边界（6分）

当前行 `{id:'model',name:'provider',config:{model:'base',temperature:0.2,retry:{attempts:2}}}`。依次应用 `{id:'model',config:{model:'surface',temperature:0.4}}`，再应用 `{id:'model',config:{model:'cli'}}`。写每步完整行。

再应用 `{id:'model',name:'different',config:{model:'x'}}` 会怎样？若目标 ID 位于另一 Include 文件，父文件 Patch 是否自动跨文件查找？

## Q09 · “热更新失败都会回滚”（7分）

评审者提出这句话。分别用“Include 读到坏 YAML”“App Boot 已应用新 config 后 apply 抛错”“HMR 预导入失败”“替换激活后恢复旧插件也失败”反驳或限定它。哪几条本模块有实际执行证据？哪几条只静态选读？编辑启动时 `--patch` 原文件或 `.env` 是否一定触发相同路径？

## Q10 · 源码定位（5分）

定位三个问题：serial/bail 的停止判据；on 如何自动归属 Effect；ACTIVE config 校验为何能在重启前拒绝。每项交固定文件、符号/分支、行范围及一条关键语句/控制顺序。不能只贴目录或“官方文档说”。说明只找到测试文件和实际运行测试有何区别。

## Q11 · 综合题 A：插件注册与服务依赖（10分）

同域同级 Provider/Consumer，不是父子。Consumer inject=['catalog']，apply 读取 catalog.value 并记录，effect 登记本轮清理。先挂 Consumer；再挂 async Provider：先 provide catalog={value:'v1'}，然后等待 setup 门闩才返回。没有可选依赖。

逐阶段填写 Consumer 状态、apply 次数、服务是否可借用：①无 Provider；②Provider 仍 LOADING；③放行并 await 两者；④dispose Provider 并等稳定；⑤新 Provider 提供v2并 ACTIVE。比较第③与⑤的 Consumer uid、资源登记。最后显式 dispose Consumer，再换 Provider，它会复活吗？如果去掉 inject 但保留类型声明，为什么不是“服务有了就自然可访问”？

## Q12 · 综合题 B：事件与生命周期（10分）

三个同级插件依次登记 Waterfall：L 记录 L+，`r=await next()`，记录 L-，返回 `{...r,text:'log('+r.text+')'}`；P 根据题目固定布尔 allowed，false 直接返回 `{ok:false,text:'DENIED'}`，true return next；M 记录 M+，await next，记录 M-，原样返回。默认主体记录 BODY，返回 `{ok:true,text:'DATA'}`。P 两条分支都记录 P。L 还注册一个原生计时器，并以 Effect 交出 clearInterval；没有其他监听。

分别计算 allow/deny 的轨迹、主体次数及结果。之后卸载 L/M/P，未来分发会怎样？计时器怎样？若另一次 parallel 的异步监听在卸载前已经进入但卡在门闩上，卸载是否自动取消/等待这段任意工作？如何表达真实业务需要的停止与 drain？如果 L 改成 await next 后不 return，能否由 undefined 推断 BODY 未执行？

## Q13 · 综合题 C：Profile 动态组合（12分）

一个 Profile 依次选择 core、app 两个 Bundle。都只有下面声明的一个 Patch 文件。运行通过真实 Loader，Provider 提供 catalog；Consumer inject=['catalog']，on+Effect 归属自身。插件和所有 Schema 均支持本题字段，没有其他覆盖。

```javascript
// core
[{insert:[
 {id:'provider',name:'provider',config:{value:'base',retry:2}},
 {id:'consumer',name:'consumer'}
]}]
// app
[{id:'provider',config:{value:'app',timeout:30}}]
// Profile 用户 Patch
[{id:'provider',config:{value:'profile'}}]
// Home Patch
[{id:'provider',disabled:true}]
// 启动时 CLI overlays
[{id:'provider',config:{value:'cli'},disabled:false}]
```

交五层后的 Provider 完整配置、Consumer 是否激活以及没有保留 retry/timeout 的原因。下一代组合显式不再提供 CLI 的 disabled:false（仍保留 CLI config），其余层相同，状态怎样？再显式提交包含 disabled:false 的组合，比较 Provider Entry/Fiber 与 Consumer Fiber 身份，分析清理为何必要。

另一次已应用的新配置 `{value:'v4',fail:true}` 会使 Provider 的 apply 抛错；是否能保证自动恢复 cli？若启动约定把 consumer 列为 requiredId，PENDING 又会怎样？本题都是显式提交新组合，不假设运行时编辑 CLI 文件能自动刷新。

## Q14 · 架构与证据说明（6分）

为“Web 常驻、一次性 Headless、SDK 嵌入”设计摘要服务复用。给合理 Bundle/入口选择、稳定 ID、服务依赖与退出策略，说明 sdk-minimal 的官方例外。最后写一段对外验收陈述：手里只有教学模拟器通过、Cordis 测试通过、五官方模板解析通过和自定义 Profile App Boot 夹具通过，原生 HMR/完整官方应用/学员试读未做。可以宣称什么？

## 评分使用约定

逐点标准在答案册，总分100。建议试读时记录每题耗时、查阅次数、提示次数及错误类型；两名评分者先独立评若干匿名答案再比较分歧。本轮没有这些数据，不给“已校准通过线”或学员通过率。将“模拟器等于官方 boot”“清理等于外部回滚”“类型声明自动注册”“稳定 ID 永不重建”作为必须订正的关键误解；即使总分较高也需补答相关题，不用平均分掩盖。
