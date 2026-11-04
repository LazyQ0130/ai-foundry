# H09、H13、H17、H18、H20、H21 衔接审查

| 已学边界 | H21新增证据 | 一致性判定与保留限制 |
| --- | --- | --- |
| H09 Agent/Factory/Registry/Handle | Manager通过ownerCtx.agents.create/resume取得精确Handle；B实时owner；D旧Activation不能误删新实例 | 一致。父Handle、历史父ID、结构Fiber、Manager所有权分层；不能称设置parentAgent就有完整委派清理 |
| H13 Scope、注册及Step准入 | X真实parent_only/child_only不同；Provider撤销后委派工具退出 | 一致。共享Host服务不意味着共享父局部注册；get/schema不是最终权限 |
| H14调用结果与下一请求 | X父Seq11为started id，子级结果后来才进入父请求；子工具事实留在子Session | 一致。原委派tool/result不装后台最终调查；两者归属不可混写 |
| H17历史、Surface与实时事件 | descriptor/catalog是各自Session日志；subagent/start/end是实时观察；relay/settled是不同message source | 一致。目录不是运行状态，生命周期不是物理耐久确认 |
| H18普通Fork/Resume | C普通Fork取当前输入，Subagent Fork只取前一已完成Turn；D冷重建同childId新Agent与writer | 一致。普通分支不自动加入子目录；JSONL与新Context不等于跨进程或崩溃 |
| H20 cancel/idle/排空/dispose | D interrupt先回、目标仍等门闩且孙仍运行；dispose才等所拥有分支清理 | 一致。原启动signal、当前活动取消与Activation释放分别取证，不保证任意外部进程立即强杀 |

本轮没有发现须改H01–H20的确认技术问题。H18普通Fork开放尾规则继续有效；H21 Provider自己选择完成前缀，不推翻旧课。H20报告中单独父取消未验证完整后代的边界也继续有效，本课增加Manager所有权与控制的限定证据。

概念递进采用父子调查→委派分层→回执/结果→历史→工具作用域→消息/容量/控制/发现。长源码只给五站；完整程序与相邻失败边界折叠，关键Scope、signal、通知和Fork条件在主线可见。默认7043汉字/全展开10383（不计代码和URL）仅为负担信号，不宣称实测减负。实际学习效果、耗时与独立外审仍待验证。
