# H23 知识衔接核对

本轮按已有正文/实验中的准确边界核对，不修改 H01–H22 或集中报告；旧课测试数量不混入 H23 的 25 项。

| 前置与实际阅读锚点 | 沿用边界 | H23 新增可观察产物 | 一致性判定 |
| --- | --- | --- | --- |
| H03 输入→Turn→Step→工具反馈→下一请求 | 回执、模型请求、工具结果各有边界，Runtime 是职责不是一个万能类 | B1/C1 控制动作送入同一真实 Loop；不是 Client 重写执行器 | 一致 |
| H04 启动器、参数与 Profile | CLI 选择应用，不能凭名称说存在 TUI；依赖安装不等启动 | A1/A2 两段参数；A4 新 Home dump exit0/缺 Profile exit1 | 一致，五种名称仅解析，未启动五应用 |
| H08 Bundle/Patch/Loader 与 config 整体替换 | 配置条目、运行 Fiber、服务可用不同；普通更新不必整进程重启 | A3 insert 后 replace config；SDK 真作者 Profile/Loader settled 再握手 | 一致，不将空 Profile 验证推广发行版/HMR |
| H09 Registry/Factory/Handle 与精确实例所有权 | 查询活 Agent 不取得释放权；dispose 针对确切实例 | SDK Server ownsAgent/拥有的 Handle 关闭；Web passive page 可零 Agent | 一致；全其他根拒绝矩阵只静态 |
| H10 Inbox、running/idle、排队与唤醒 | 入队不等执行完，idle 不等业务成功或物理落盘 | C2 messageId 先于 wait；C3 两输入同活动区间 | 一致，高 run 与低 wait 终点分别说明 |
| H12 chunk/实时帧/结算与事实 | chunk 不是完整持久消息，Attempt 不等 Seq | B6 缺 revision 重建 baseline；SDK 通知另有协议帧 | 一致，不补造 rev2 或把实时流当旧历史 |
| H17 事件事实/Surface/Projection | append 是事实接纳，派生视图不是重新执行工具 | B follow opening snapshot+delta/cursor；页面读取旧结果 | 一致，Generation/revision/Seq 分开 |
| H18 writer/flush/正常恢复/Fork | 真恢复重建新 Agent，旧 Promise/进程句柄不复活；不盲重做副作用 | D1 新 PID Resume 无自动 prompt，真实 JSONL 前缀保持；D2 writer-held 拒绝 | 一致，未把正常关闭称突然崩溃恢复 |
| H21 activation、parent/caller、取消/结果 | 接受不等结果，signal 不等子树释放；目录不等活对象 | SDK 按确切 Agent 归属桥接；关闭等待自己拥有的运行时 | 一致，不按同 sessionId 授权其他对象 |
| H22 Run/Jobs/Goal/Schedule、观察与模型状态 | 本地 Job/Run 不因历史读取复活，Schedule 记录不等业务完成 | Client 断连、订阅撤销、SDK close 各标所有者；X 两入口各自 Session/writer | 一致，不凭断连推导后台任务/持久 Session 删除 |

重复只保留支撑本课的最小前置，新增焦点是“谁提交、谁消费、谁关闭”。H22 的工作生命周期没有被重写成网络协议；H23 没有接真实 Goal/Schedule 驱动，不能把 SDK 传输成功说成后台任务全链已覆盖。

H24 只接已具身份的 C/D 轨迹和限制，见 [h24-handoff.md](h24-handoff.md)。跨课矩阵是作者一致性判断，没有施测学员迁移或完成率。
