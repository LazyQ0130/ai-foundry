# 知识依赖与术语一致性矩阵

对象：完成 Stage 4 和 H01–H04、未系统学习 Cordis 的学员。D=主线定义，U=用于新问题，R=必要短复习，P=预告，—=不要求。正式课文在 `course-content/internal/deepseek-harness/h05–h08/lesson.md`；位置以章节标题定位，机器引用表另给当前行号。

| 概念与统一含义 | 已有基础 | H05 | H06 | H07 | H08 | 依赖与一致性结论 |
|---|---|---|---|---|---|---|
| 模块：import/export 组织代码 | H02 包/模块/服务对照 | D，与挂载区分 | R，事件声明不登记 | U，定义≠实例 | U，导入≠激活 | 导入模块不自动挂载插件；四课一致 |
| Plugin：供宿主挂载的贡献，函数/类/对象入口 | H01–H04 用途级 | D，五概念及最小插件 | U，三个事件参与插件 | U，同定义可多 Fiber | U，配置行选择实现 | 不是一个服务名或配置文件的别名 |
| Service：具名能力；Service 基类是提供方式之一 | H01 服务对象非必然网络进程 | D，键/值/调用/接口 | U，服务内部可开事件 | R，服务有运行所有者 | U，配置条目不等于服务已存在 | 不要求每个插件都提供服务，也不要求用基类才算能力 |
| Context：当前插件的访问入口与归属上下文 | Stage 3 模型 context 只是同名词 | D，代理、子上下文、访问 | U，登记回调 | U，当前 Fiber/资源所有者 | U，Loader 树与 realm | 不等于提示词上下文、全局字典、OS 隔离 |
| DI/依赖注入：把实现选择移到装配 | Stage 4 Tool Registry 可作问题对照 | D，参数注入→Cordis inject | R，参与者不相互 new | U，持续依赖检查 | U，缺提供方的装配诊断 | H05 先给普通接口例子，避免理解 DI 先依赖 Fiber |
| inject：声明使用的服务依赖，不创建实现 | 无 Cordis 先修 | D，先消费者仍可等待 | U，ctx 服务访问前提 | D，服务失去/恢复 | U，组合结果仍受依赖约束 | H05 启动条件→H07 持续跟踪是新增深度，合理复习 |
| apply：挂载后的一次初始化入口 | 普通函数调用 | D，非每请求调用 | U，登记事件 | U，可重跑且需配套退出 | U，普通更新/重启可再执行 | “同一 Fiber”不等于 apply 只调用一次 |
| 类型声明/运行时登记 | H02 TypeScript 与 JS | D，合并不注册 | D，Events 扩展不 on | U，擦除与资源登记分开 | U，YAML 存在不保证 ACTIVE | 同一边界在不同对象上练习，非无增量重复 |
| Event/Listener/Dispatch：边界、回调、选择执行规则 | H03 通知与事实区分；旧 hook 非 Cordis | P | D，三段代码 | R，登记后归谁回收 | U，更新协调也用事件 | H06 主线先补 callback/Promise/return；没有先懂 H07 才能理解分发 |
| emit/parallel/serial/bail | Promise 基础由 H06 自足回顾 | — | D，五模式表及 A | U，卸载不取消在途回调 | U，等待稳定≠业务成功 | 判据按真实值与等待时点解释，不能仅凭名称 |
| Waterfall：next 委托剩余回调，返回向外传播 | async/await/返回值 | — | D，两层、三层、拒绝与错误 | U，已登记监听的退出边界 | U，internal/update 可拦截重启 | 非“把第一个数自动传给第二人”的流水线 |
| next()/return next()/await next() | 普通 return；H06 补 Promise | — | D，游标/包装/漏 return | U，在途与未来分发分开 | U，更新截获有别于统一重启 | next 非一次性；H08 不重复 H06 全部演算 |
| Fiber：一次挂载的运行实例 | H05 先用宿主挂载，不需内部结构 | P | P | D，状态、uid、Context | U，与 Entry 两层身份 | 非线程、非 Agent 实例；同定义可多挂载 |
| Lifecycle：带原因的状态变化 | H05 缺服务等待 | P | P，finally 只为夹具 | D，六状态精选路径 | U，配置变化选择退出/更新 | M2-01 修复：FAILED 的校验例子限定加载阶段 |
| Effect/Disposer：登记运行资源及退出方式 | on 已会用；旧 try/finally 由 H07 补齐 | P | P，on 归属留待 H07 | D，自动登记/手工配对/错误 | U，旧版本退出的必要基础 | 非 React 渲染 Effect，非任意副作用自动追踪 |
| 清理启动、完成、工作静止 | H06 Promise 与并发 | — | U，等待收集范围 | D，逆序启动不等于串行完成 | U，清理不是状态迁移/外部回滚 | 同一 Disposer 内明确 await 才表达严格先后 |
| 父子所有权 vs 服务依赖 | H05 Context 来源 | P | — | D，左右对照与兄弟例 | U，组层级/realm/Agent scope 不等同 | Provider/Consumer 同级也能依赖；不画成父子边 |
| Profile：有序 Bundle 选择及用户覆盖 | H04 五入口/层序导航 | P | — | P | D，manifest 与加载过程 | 非正在运行的 Agent、非插件实例 |
| Bundle：贡献一个/多个有序 Patch 文件 | H04 模板只作导航 | P | — | P | D，base/应用/独立 minimal | 非每 Bundle 一个插件；无默认继承关系 |
| Patch：按目标顺序修订条目 | H04 结果级顺序 | — | — | — | D，整 config 替换、name 断言、组边界 | id/name 不在 config 内，不随整 config 赋值消失 |
| Entry/稳定 ID | 无需 H07 前先懂 | — | — | — | D，配置身份 vs Fiber 身份 | 首用即定义；普通更新可同 Fiber，禁用再启用新 Fiber |
| raw/effective/运行服务 | H05 类型≠运行；H07 配置加载 | — | — | 新短反例 | D，Schema 拒绝/应用失败 | 必须三列观察，不能只用配置树推 ACTIVE |
| Loader/Include/Group | H04 配置树用途 | — | — | P | D，精读路线与加载图 | Loader 协调条目，不是所有插件实例的统称；Include 文件边界非任意递归文件合并 |
| realm/isolate | H05 只解释作用域与边界 | P | 不展开筛选 | 保留复杂变化边界 | D，true 本地域、标签共享域 | 原生 Cordis 域值由本轮探针补证；Loader 完整动态隔离矩阵仍未运行 |
| HMR/重新组合/重启 | H04 输入来源与启动 | — | — | P，restart 非完整 HMR | D，输入/时序/失败阶段 | watcher、模块预导入与 App Boot 子路径证据分开 |
| SessionEvent 与运行时事件 | H03 commit/flush/实时旁路 | — | R，在真实事件里区分 | U，卸载不恢复外部事实 | U，通知变化非持久化 | Stage 4 登录 Session/Run 不映射为同名实现 |

## H07 → H08 必须能复述的因果链

配置输入变更 →（有 HMR 等协调入口时）读取并重新组合 → 稳定 ID 定位 Entry → 依新选项决定更新、禁用、导入或重挂 → Fiber 处理依赖/初始化 → 对旧运行启动其登记的清理 → 新运行重新登记资源。

这不是无条件串行全局时序：兄弟资源可能交错；普通 config update 可重用 Fiber；禁用后再启用可产生新 Fiber；Schema 在 ACTIVE 更新前拒绝时尚未进入重启。若 Provider 消失，同级 Consumer 因 inject 清理后 PENDING，保留 uid；恢复可重载原 Consumer。已显式 dispose 的实例不会复活。

H07 的 on 移除和 Effect 配对能防止下一次运行叠加旧监听/计时器；未登记的资源、已开始的异步回调、已写外部数据仍须由业务退出协议处理。故清理是可靠重载的重要基础，却不构成事务回滚证明。综合题 A/B/C 共同检查这条链。

## 首次术语与直观解释核查

H06 callback/Promise/同步异步/并发、Waterfall/continuation、bail 判据均在使用前或相邻段解释；H07 uid、门闩、幂等、Disposer、父子所有权有可观察对象；H08 manifest、overlay、Entry、稳定 ID、realm、raw/effective、HMR 均先给用途和输入。setup/announce 等属于 H09 交接问题，不要求读者先会。

核心知识没有只能去下一课补齐的闭环依赖。风险仍在 H06 的 Promise 判断时点、H07 清理并发、H08 多输入失败阶段的连续密度：应按 workload.md 的分段产出停顿；是否足够易懂须真实学员测量。H08 Node 缓存内部、复杂 realm 动态重组和 Agent scope 只标边界，不包装成已教会。
