# 180 秒 Demo · AI 研究工作台

只用 synthetic fixture，关闭可能显示 Secret 的终端/网络面板。当前云 URL 未验证，明确演示本地 production-mode 容器。提前准备已完成的 Run，实时请求若未结束就切到“预先完成的 Run”，不伪装实时速度。

| 时间 | 画面 | 讲述 |
|---|---|---|
| 0–20s | Dashboard | 私人文件和外部搜索分散，我做了一个把研究任务、证据和知识沉淀串起来的工作台。 |
| 20–45s | synthetic TXT/PDF → READY | 文件私有存储，解析保留 page/offset，向量只在当前 Workspace 内检索。不是把资料公开成 URL。 |
| 45–75s | 新 Task/来源策略 | Task 是长期目标，Run 是这次执行；这次允许私人资料与公开研究摘要。 |
| 75–115s | 已完成 Brief/Steps | Agent 有 steps/tools/budget/deadline 边界。外部只有固定 MCP Crossref 搜索，metadata 不能支持事实 claim。 |
| 115–145s | Report/Citation/source | 点开 Citation 看 snapshot 和来源；来源删除不让历史证据消失。结构有效仍不等于语义准确，结论要审阅。 |
| 145–165s | Proposal/Edit/Approve/Note | 模型只提议。人审核精确内容再执行，重复批准返回同一 Note。 |
| 165–180s | Eval/architecture | 固定25-case Eval，跨用户泄漏和未批准写入为zero-only门。当前同步执行、无worker，云部署尚未验证。 |

安全/Eval 用一句真实数字，不现场跑全部 cases。演示失败就展示失败状态及排查方法，不把失败剪成成功。本地实测私有/mixed 两条链路通过，不能宣称所有模型调用都可靠；真实语义质量仍需人工判断。
