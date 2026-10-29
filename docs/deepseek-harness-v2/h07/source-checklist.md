# H07 固定 Commit 源码核对清单

基线 `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`，Cordis `4.0.6-alpha.1`。按资源创建、所有权、状态驱动、清理启动/完成、错误与恢复分支人工审读；字节/行号/AST只防漂移，不独自证明语义。

|断言|固定依据|条件与验证范围|
|---|---|---|
|L01 · 插件定义共享runtime，每次挂载创建独立Fiber及可等待包装|[vendor/cordis/src/registry.ts:316–335](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/registry.ts#L316-L335)|A及同一定义两实例真实核对；包装不恒等于await取得的Fiber|
|L02 · Fiber保存实例状态/上下文/依赖与清理记录，不是线程|[vendor/cordis/src/fiber.ts:178–210](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/fiber.ts#L178-L210)|实例身份/独立状态测试；未创造线程或进程|
|L03 · 插件Context扩展自父Context，关联当前Fiber|[vendor/cordis/src/fiber.ts:234–245](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/fiber.ts#L234-L245)|两个实例Context不同；不声称无条件全局可见|
|L04 · 六个FiberState枚举；初始PENDING|[vendor/cordis/src/fiber.ts:139–154](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/fiber.ts#L139-L154)|A真实internal/plugin+internal/status记录，非模拟状态数组|
|L05 · await等待当前转换稳定，PENDING可返回；失败则重抛|[vendor/cordis/src/fiber.ts:725–737](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/fiber.ts#L725-L737)|缺服务与Error失败分别真实执行|
|L06 · 依赖满足驱动LOADING，否则运行失效转UNLOADING|[vendor/cordis/src/fiber.ts:597–638](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/fiber.ts#L597-L638)|C及异步加载门闩；完整快速变化交错未穷举|
|L07 · 启动/校验失败先清理，再稳定FAILED|[vendor/cordis/src/fiber.ts:673–723](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/fiber.ts#L673-L723)|Error启动和配置校验真实用例；已登记资源回收一次|
|L08 · 稳定状态按uid、错误、激活信息判断|[vendor/cordis/src/fiber.ts:574–594](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/fiber.ts#L574-L594)|A/C/失败真实轨迹；图只含精选路径|
|L09 · 显式dispose清空uid移除实例，等待卸载；不能被依赖恢复唤醒|[vendor/cordis/src/fiber.ts:265–297](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/fiber.ts#L265-L297)|缺依赖dispose、运行dispose、服务重现不复活真实执行|
|L10 · 父Fiber通过Effect持有子Fiber释放入口|[vendor/cordis/src/fiber.ts:265–297](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/fiber.ts#L265-L297)|父级首次dispose等待子级异步清理；非全局串行承诺|
|L11 · 根Fiber uid0且dispose使用restart，非普通DISPOSED终点|[vendor/cordis/src/fiber.ts:320–332](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/fiber.ts#L320-L332)|静态特例审读；夹具用根清理，不宣称进程退出|
|L12 · effect检查所有者；UNLOADING与已dispose不得新建|[vendor/cordis/src/fiber.ts:415–442](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/fiber.ts#L415-L442)|两个失效场景真实INACTIVE_EFFECT；有效性不等同只准ACTIVE|
|L13 · Effect包装先登记所有权，再执行获取逻辑|[vendor/cordis/src/fiber.ts:517–560](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/fiber.ts#L517-L560)|获取立即执行与异步获取中卸载测试；源码读重入保护|
|L14 · execute返回函数/Promise/可迭代；非法形状失败|[vendor/cordis/src/fiber.ts:356–399](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/fiber.ts#L356-L399)|普通函数、异步setup、生成器及非法数值真实执行|
|L15 · 公共清理包装一次性；重复调用通常不加入在途Promise|[vendor/cordis/src/fiber.ts:504–515](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/fiber.ts#L504-L515)|stop和Fiber.dispose在首次未完成时重复调用真实核对|
|L16 · 结构所有者可通过effectInertia加入已开始的清理|[vendor/cordis/src/fiber.ts:110–117](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/fiber.ts#L110-L117)|手动stop在途时owner卸载仍等；内部WeakMap源码交叉|
|L17 · 整个Fiber的独立Effect按逆序取出并异步一起等待|[vendor/cordis/src/fiber.ts:702–713](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/fiber.ts#L702-L713)|B先启动/A后启动，门闩控制A先完成；不是完成顺序保证|
|L18 · 逆序来自DisposableList.clear|[vendor/cordis/src/utils.ts:27–30](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/utils.ts#L27-L30)|与L17共同解释启动顺序，不孤立搜reverse推导语义|
|L19 · 同一Effect内部的多个Disposer有串行组合逻辑|[vendor/cordis/src/fiber.ts:424–442](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/fiber.ts#L424-L442)|yield B异步结束后才A；正文主线只用单Disposer|
|L20 · 手动清理的同步throw/异步拒绝向首次调用方传播|[vendor/cordis/src/fiber.ts:485–514](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/fiber.ts#L485-L514)|同步assert.throws与异步assert.rejects；不自动重试|
|L21 · Fiber卸载记录每项清理错误并继续；不证明外部成功关闭|[vendor/cordis/src/fiber.ts:702–723](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/fiber.ts#L702-L723)|正常logger下同步/异步失败均记录，其他清理仍完成|
|L22 · logger自身失败不能套用吞错保证|[vendor/cordis/src/fiber.ts:287–295](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/fiber.ts#L287-L295)|静态边界；损坏logger进程级故障NOT_RUN|
|L23 · on把添加与移除监听封装为所属Fiber的Effect|[vendor/cordis/src/events.ts:254–259](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/events.ts#L254-L259)|B卸载后再emit无旧调用；manual/on注册位置交叉|
|L24 · 分发已经选出的回调/开始的异步工作不会因on移除自动取消|[vendor/cordis/src/events.ts:165–187](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/events.ts#L165-L187)|真实parallel监听开始后卸载，首次work仍待门闩，后续无旧回调|
|L25 · 服务运行时provide归属当前Fiber，移除后通知并等依赖转换|[vendor/cordis/src/reflect.ts:277–304](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/reflect.ts#L277-L304)|C Provider显式卸载后Consumer已清理PENDING|
|L26 · notify按inject和作用域筛选重新检查依赖|[vendor/cordis/src/reflect.ts:314–327](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/reflect.ts#L314-L327)|C单服务同作用域真实；复杂isolate树NOT_RUN|
|L27 · 依赖激活信息包含实现Fiber uid，支持更换实现重新加载|[vendor/cordis/src/fiber.ts:611–638](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/fiber.ts#L611-L638)|C新Provider v2、同Consumer uid、apply两次、旧on零残留|
|L28 · Service构造器提供运行时能力，声明合并不创建实例|[vendor/cordis/src/service.ts:42–58](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/service.ts#L42-L58)|C无提供方PENDING、提供v1/v2后实际服务值；strict类型另测|
|L29 · restart失活再刷新，不清uid；不同于显式永久dispose|[vendor/cordis/src/fiber.ts:739–751](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/fiber.ts#L739-L751)|同定义重跑apply、uid不变、on恰好一份；不是原生HMR|
|L30 · ToolsService.setExecutor通过Effect持有登记贡献|[packages/core/tools/src/index.ts:325–345](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/tools/src/index.ts#L325-L345)|静态辅助定位，不运行完整ToolsService|
|L31 · Agent收尾保存Promise，先等工作再scope/存储关闭/登记退出|[packages/core/agent-loop/src/index.ts:495–546](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/src/index.ts#L495-L546)|静态读真实顺序与try/catch/finally；不是普通Fiber通用保证|
|L32 · 官方资源测试用门闩检查scope不早于工作退出|[packages/core/agent-loop/tests/resource-lifecycle.spec.ts:20–78](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/tests/resource-lifecycle.spec.ts#L20-L78)|只选读setup/action/assertions，未运行其Vitest或递归清理|
|L33 · 官方shutdown-drain测试根清理后重开存储核末尾事件|[packages/core/agent-loop/tests/shutdown-drain.spec.ts:53–70](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/packages/core/agent-loop/tests/shutdown-drain.spec.ts#L53-L70)|只静态选读，未实测磁盘持久恢复|
|L34 · HMR教程另有监视与Loader，restart不等于完整热替换|[docs/cordis-tutorial/06-composition-and-hmr.zh.md:23–65](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/docs/cordis-tutorial/06-composition-and-hmr.zh.md#L23-L65)|完整文档阅读；本课未启动watcher、Loader或HMR|
|L35 · 获取后未交Disposer就失败，不能凭空释放未知资源|[vendor/cordis/src/fiber.ts:356–374](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/vendor/cordis/src/fiber.ts#L356-L374)|内存open标记反例真实执行并手动恢复，无外部资源|
|L36 · 安全审计尚未完成，资源测试不是安全认证|[SAFETY.zh.md:5–15](https://github.com/deepseek-ai/deepseek-harness/blob/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/SAFETY.zh.md#L5-L15)|保留官方预览限制，无安全认证测试|

正文24个固定范围、36条关键断言、32个逐字节文件。核心精读4文件为registry/fiber/events/reflect，教程/API/工具/Agent与官方测试是辅助依据，不是全都必读。全部文件Git blob与SHA256见 [机器清单](evidence/source-check.json)。

## 精度差异

- 教程线性状态示意不是完整状态机；Error启动失败在本版先UNLOADING回收，再稳定FAILED。
- await插件/句柄的文档简写不能读作一定ACTIVE；缺依赖可以稳定PENDING，已在H05核过。
- restart注释中的dispose/reload不是将uid置null的永久dispose；实现只失活再刷新，保持该Fiber身份。
- 公共Effect/Fiber清理重复调用不重复启动，也不保证重复调用加入在途Promise；结构所有者另有effectInertia加入路径。
- 整个Fiber独立Effect逆序启动但异步重叠；同一Effect内部串行组合是另一个层次。
- 卸载通常记录清理错误并继续，但logger失败另有边界；DISPOSED不能证明外部关闭成功。
- on撤销不自动取消已经开始的回调；AgentHandle业务级teardown的等待与错误规则不能推广给所有Fiber。

## 证据边界

24项是真实vendor Cordis的作者测试，另有遗漏计时器清理变异非零、strict消费方/TS2345负例。模拟时间与连接只替代外部资源；受控真实Node setInterval另有交叉测试。官方resource-lifecycle/shutdown-drain只选读setup/action/assertions，没有执行它们的递归目录清理，也没有运行完整Harness。

未执行原生HMR、文件监视、Profile/Bundle/Patch、复杂Scope变化、完整Agent/工具管线、真实网络连接/凭据、磁盘恢复或损坏logger进程故障。图一仅画普通非根实例的精选路径，未声称穷举状态机。
