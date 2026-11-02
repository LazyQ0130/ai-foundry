# H11–H13 衔接与重复审查

H13 的唯一增量主线是：给定完整定义、查看 Scope、准备 Step 与当前登记状态，推导模型声明和调用资格。README 助手承接 H10–H12 的需求，实验改用数字工具，避免读文件的外部边界妨碍理解注册机制。

| 前课已有内容 | H13 最短复习 | 本课新增证据/知识 | 重复边界判断 |
| --- | --- | --- | --- |
| H05 Plugin/Service/Context/inject/apply | 一段与登记形状 | ToolDefinition 条目不等于 tools 服务；Context 同时决定层与所有权 | 不重做 DI/缺 inject 全套 |
| H07 Effect/Disposer/清理归属 | 登记→撤销 | register 的层 Effect、插件卸载注销 temporary；旧引用不能当当前资格 | 不重讲状态机、异步 disposer 顺序 |
| H09 Agent Scope | 真实键与专属 Context | 同名遮蔽、继承项过滤、自己的豁免相对子级变化 | 不重做 Agent 创建事务 |
| H10 Step/Attempt | 同 Step 可重试 | resolve 的调用时机、捕获模型与集合释放；D_retry 两 Step/三请求/两 when | 不重画全 Loop 状态机 |
| H11 Schema/Prompt/Request | tools 是结构化声明 | defineTool DSL、output 契约、Executor 描述、注册视图与准入视图区别 | SystemPrompt 只回接 provider；不重教全变量/排序 |
| H12 ToolCallBlock/结果/Session | id/name/参数字符串与结果关联 | 模型提议在注销/替换/限制后被真实执行器拒绝，主体0 | 不重教 chunk 联合、Assembler 或 committed/abandoned |

四处可接受的重现都有新增问题：Schema 为了回答字段来源；Step 为了解释准入复用；Scope 为了推导注册层；调用/结果为核对当前身份。主要教程没有复制 H11/H12 全部源码。D 使用实际 prefix 重建 messages/config/tools/toolHistory，并保留 Runtime 投影后的 Adapter 输入，是第三模块的证据要求，不是重复教授整套请求重建。

原蓝图 H13 为 90–125 分钟、两幅建议图与教学小模拟。本次明确要求完整 DSL、四图、四项真实实践和失败证据，正式稿估 190–250 分钟，增加100–125分钟；两区间相同端点相减仅用于规划比较。分成三段且完整辅助代码/答案默认折叠，避免要求学员一次处理所有接口。字数与代码量见 content-check；没有实测学生时长，不能用字数换算宣称效率。

可交作业：A 的失败阶段表；B 的 A/B/子级视图；C 的四问表；D 的请求/调用/结果与主体次数。四项各10分，思考10另有4环节Rubric；这些只是作者自评设计，未进行学员评分校准。存在重复或理解负担的实证仍需试读。

不回改 H01–H12 或三次审查来适配新稿；原有材料的字节由保护基线核验。H14 的流水线、H15 审批/守卫/沙箱、H16 外部能力只列问题与边界，本次没有实现对应课程。
