# 根因与排除过程

**证据支持的归类：Windows／Node24.16.0 Runtime兼容性缺陷，被默认SDK显式process.exit暴露。** 不是已证的产品WebServer、SDK协议编码或三个包Native Binding缺陷。H24作者核心配置与发行完整Profile不同，结论不扩张到所有应用或平台。

本地因果链：同一Windows/x64，官方SHA匹配的Node24.16.0；无npm/SDK/Loader/tsx的最小脚本，Listener/连接已关闭，process.exit仍3/3同断言；换经官方SHA核验的Node24.22.1，相同脚本3/3正常，固定Harness源码默认出口23项也通过。原旧Runtime下更换全新固定依赖、统一loader后，实际H24原路径仍失败。Node源码对照显示旧DelayedTaskScheduler在Stop后仍可向closing async handle提交任务，新版含has_shut_down_守卫。

与[Node官方issue56645](https://github.com/nodejs/node/issues/56645)、[官方修复61999](https://github.com/nodejs/node/pull/61999)的内置fetch/exit回归相符。上游补丁在PostDelayedTask/Stop的同一锁下检查和设置停止状态，防止关闭后继续唤醒。两版node_platform.cc、上游patch、二进制SHASUMS均保存并有hash。**平台层归因由本地无依赖复现支持；具体C++调用栈未本机单步捕获，关联上游内部机制是源码/官方回归支持的解释，不能冒称本机Native Stack。**

| 候选 | 支持/反例 | 本轮结论 |
| --- | --- | --- |
| 作者脚本自身写错exit码 | 外层确实要求0，实际原生非0；纯Node也失败 | 不是简单断言写错；历史加载器代表性偏差另修正调查环境 |
| 三包缓存污染 | 旧纠正缓存、fresh正式锁、before-version候选同故障；无npm最小例也失败 | 不能独立解释；不排除时序影响 |
| src/lib混用 | 全部组合明确src；固定aliases；无正式lib产物加载 | 没有支持它为此次触发原因的证据；lib正向仍未验 |
| 生命周期清理顺序 | SDK协议先回响应、再flush/root dispose，原生例Listener已关闭 | 无法归咎产品HTTP清理；活跃EOF/直接Dispose缺领域终态是独立合同缺口 |
| SDK协议关闭异常 | initialize/run/shutdown帧和业务结果成功，但终态失败；无SDK例也复现 | 不是协议编码必要条件，默认SDK显式退出是触发点 |
| HTTP Socket/Listener | 基础HTTP和Socket关闭可过；最小例关闭Listener后还崩 | 未关Listener不是必要条件；不可把进程OS回收当正常业务结算 |
| Node/Windows | 官方旧二进制最小例3/3、新官方二进制3/3过、源码守卫差异 | 平台限定归类成立；其他Node范围、非Windows未测 |

没有人为延迟process.exit、不用隐藏stderr/强杀/禁用HTTP作修复。完整exit report会改变竞态，所以仅做路径采样。没有证实“所有fetch后都会崩”或“所有新Node都修复”；目前只实测这两份官方Windows x64二进制。
