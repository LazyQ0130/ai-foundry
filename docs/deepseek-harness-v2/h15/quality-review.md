# H15 教学质量审查

**CONDITIONAL GO**：允许作为作者完成的内部课程研发交付。无已知未决确认P0/P1；这不是正式安全审计、平台隔离认证或发布批准。

## 作者侧内容质量

正式正文围绕“检查并修复配置”展开，先区分六层责任，再用七个术语的例子/定义/局限连接审批、守卫、沙箱和文件观察。4原创图、4完整实践及折叠详细答案、10思考题（5项配置/事件推导）齐全。H13/H14只保留必要复习，H16/H20只交接边界。默认正文约8737个CJK文字、默认代码19行，全部代码255行；200～270分钟为作者估计，实际负担未经试读校准。

## 已验证的局部安全策略行为

18项C验证真实Approval/Session：ask/never、四结果、缺失/异常/非法应答、晚到批准、有效Turn、审计提交前失败、同callId新请求、覆盖与上下文。13项D包括11个真实Tools/Native/Pipeline/Approval/Session轨迹，1个Policy/Approval/Session及模拟probe的真实provider选择，1个真实fs-sandbox/local/观察/Session生命周期实验。31项TAP通过，错误答案预期失败；不是31个原生平台集成。

52条源码事实核对，2218文件字节锁定；内容AST同时记录effectivePolicy为private这一文档差异。Renderer既有12项与内容/AST通过；真实React挂载和静态SSR三宽度通过，17份截图作者查看。原始证据与失败历史可复核，结果数量不作为全面安全保证。

## 未测试的原生平台能力

Linux bwrap/Landlock、macOS Seatbelt、Windows ACL进程runner均NOT_RUN。真实provider选择使用替身probe且不spawn，full/partial仅验证报告与argv。Windows真实本地fs使用Koffi/DACL/ReplaceFileW，仅替换清理钩子；这不升级为原生进程沙箱验证。未测恶意链接竞态、任意外部写入者与发布同时竞争、原生ACL授权撤销、runner实际执行失败归因、网络隔离或完整E应用。

## 仅适用于特定组合的结论

问答需要ApprovalService、有效Turn及负责的应答者；pre ask才进入通用审批分支。guard是可信插件契约下单调拒绝，不是同进程恶意代码隔离。Policy解析不替调用方审批；受限进程要有实际消费者/provider/runner，文件围栏要实际挂载fs-sandbox；模式不控制网络/全部进程能力。观察保护需要消费者正确发fs事件、插件占据单槽及后端遵守expected；D的消费者是明确夹具，不是完整tool-fs。

## 哪些条件下约束不生效或改变

裸fs-local省略expected不提供自动新鲜度保护；直接readText不发观察事件；观察插件卸载、抢槽或绕过消费者会失去自动guard；新/恢复Session对象没有旧观察。danger模式绕过文件约束，但本课只静态分析。缺审批应答者或runner应失败关闭，不应扩大能力。workspace-write含显式extra及后端临时区域，不能等同仅workspace。extra严格验证与workspace canonical处理不同，Windows进程不支持额外根。版本检查、进程内锁与原子发布不消除全部TOCTOU。

## 待真实学员验证及剩余条件

尚无独立外部审查、学员首次执行/理解数据或实测时长。应后续检查能否独立区分模式与完整度、持久策略与内存观察，以及为何批准后仍拒绝；再校准时间与讲解负担。当前已按用户要求保留这些条件，没有为追求GO启动危险实验或关闭约束。

## 范围与保留

基线42e489cb5e575b7b820178ad4b6f93b0f8f0e573；保护3534份已有文件（包含当前wechat-contact.jpg等用户修改）、既有H01–H14/审查/output及其他脏文件，最终门禁逐字节核验。新增范围仅docs/deepseek-harness-v2/h15与course-content/internal/deepseek-harness/h15。未修改业务权限/价格/数据库/线上或发布状态；完成后停止。
