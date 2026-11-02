# H12–H14 知识衔接与重复审查

H14增量是沿prepare/dispatch/complete追踪最终权威结果和模型顺序提交，而非重教工具名单或流式块组装。

| 已有知识 | 最短复习 | 本课新增问题与证据 | 保留边界 |
| --- | --- | --- | --- |
| H06 Waterfall/next/短路 | 进入下游，再接返回；外层仍能改决策 | 三个不同返回契约；C-policy证明普通deny可被外层覆盖，guard在最终allow后拒绝 | 不重跑27项事件核心专项，不重复计B |
| H07 Effect/资源静止 | 撤销登记不等于在途Promise退出 | 取消与内部调度失败均先drain；C门闩证明等待，D实例在工作完成后卸载 | 不重讲Fiber状态与独立Disposer顺序 |
| H10 Turn/Step/Attempt | 本Step响应可能含整个工具批次 | batch结果/concluded/additionalContexts决定下一Step；D有正常/取消/错误三类Turn | 不重画整个Agent状态机 |
| H12 ToolCallBlock/ToolResultMessage | id/name/原始JSON字符串与toolCallId | 坏JSON保留后诊断；实际tool/call不等于业务开始；tools/result与tool/result异层 | 不重教所有StreamChunk或Assembler |
| H13定义/Scope/Schema/步骤准入 | 请求声明与当前资格分开 | dispatch再核定义；输入Schema包装晚于pre；规范value经过后置处理和最终快照 | 不重做完整DSL/继承可见表 |

两处重要细化以真实源码为准：H13的readonly是执行契约，H14实测整个exec直到tools/result前才冻结，不能扩大成全时段强制防篡改；H06已提醒Waterfall拒绝可被外层改，H14不能再把普通pre deny描述为天然单调。旧课字节不变，新课明确衔接契约与运行时行为。

四项跨课因果产物：A将H06返回链接到H13输出定义；B将H10批次接到H12结果顺序；C将H07在途退出接到错误/取消结算；D把H13准入、Session记录与下一请求闭合。每项10分作者Rubric；十题中2/3/5/6/8/10有具体代码或轨迹推导。评分未经真实学员校准。

课程默认正文与含折叠代码量见content-check。蓝图110–150分钟，本稿估230–310，端点增加120/160分钟，分三段。增加来自四项真实实践、调度/取消/内部失败，不能据此声称学习效果提高。默认路线只选5个主文件，events/Native/Loop/Session repair按问题辅助，不要求先通读所有大包。

H15仅预告审批、权限与沙箱责任；H16仅预告能力提供方；H20仅预告未知结果恢复。当前D只用内存Session，未接真实提供方、外部工具或完整应用。没有为新课改写H01–H13或前三次集中审查。
