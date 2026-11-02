# H15 前置与衔接

只交接，不开发H15正文、实验或发布内容。

进入H15前，应能从H14 A画出pre→ask解析→guard→around/body→project/post/finalize→tools/result→Session提交，且知道这是允许主线、不同失败可能跳阶段。必须能解释普通Waterfall返回值可被外层覆盖，guard只拒绝/不表态，并区分Schema、业务规则与执行权限。

保留H14的四份证据：A_guard主体0；A_ask缺服务拒绝；C_signal-replace更换wrapper信号仍不能脱离caller取消；D_internal已有call却无结果时只能保守认定OUTCOME_UNKNOWN。它们证明接入位置和局部行为，不证明真实用户审批、文件效果强制或沙箱完整性。

H15的新问题是批准从哪里来、绑定哪些可信身份和调用事实、有效期与取消/卸载如何管理、哪些规则不能被扩展插件放宽、OS后端实际强制了什么。应该分别验证approval allowed-once/rejected/cancelled/unavailable、资源所有者guard及平台full/partial，不能把H14缺服务路径当完整审批集成。

还要延续本课细化：类型readonly不等于所有阶段运行时冻结；Scope与Schema都不是独立安全边界；取消不回滚效果，drain不证明结果已提交。H14没有运行真实文件、Shell、Web、MCP或沙箱；H16才研究具体消费者/提供方，H20才深入恢复。

建议前置自查：预测pre/wrapper异常与业务异常是否到post；推导A/B并发、C屏障的真实提交顺序；解释concluded仍完成本批，以及上下文可能带来下一Step；区分tools/result、tool/result与磁盘flush。学生若不能解释，回看相应同一轨迹，而非先阅读H15补救H14缺口。此门槛仍是作者建议，未校准为学员考试。
