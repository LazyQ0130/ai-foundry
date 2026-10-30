# 后续集中审查建议议程（本轮未执行）

先确认四课材料哈希与同一固定Commit，再沿“一个已创建Agent读取README”追四个问题：谁负责它结束、谁推进工作、下一请求带什么、响应怎样成为事实。不要直接把四张课程总图拼成一张无条件调用链。

| 交接 | 应对照的真实源码与材料 | 待集中审查的疑点，不是已确认缺陷 |
| --- | --- | --- |
| H09→H10 | agent-loop/index.ts initializeAgent与teardown；agent.ts Driver；H09创建/销毁图、H10 Phase/Inbox图 | create可查/通知完成/ready/Handle返回是否被读者合并？维护公开idle是否误判无活动？ |
| H10→H11 | preStep、step、prepareRequest、buildRequest；H11图4 | renderPrompt在prepare前、Context refresh/render在后是否在图文/答案一致？同Step重试哪些不重做？ |
| H11→H12 | llm/index.ts prepareCall、forAdapter、adapterStream；H11请求冻结与H12图1/3 | 准备代次与历史路由当前所有权是否误说为字符串匹配？Loop请求与手工单次调用的冻结义务是否区分？ |
| H10→H12 | agent.ts 487–607、core assistant-stream.ts；两课取消/重试实验 | start/chunk/finish与settlement是否被误当同一终态？in-band aborted与本地signal是否能独立推导？ |
| 全模块→H13 | SystemPrompt工具Provider、Runtime ToolCallBlock、Tools入口 | Schema、提议、执行定义、结果四者是否清楚？max-tokens已关闭调用也去掉是否留下旧直觉？ |

源码依据按四份source-checklist逐项查看；H12新增47条是当前课范围，不能覆盖/替换H09–H11原断言。关键源码集中于agent/agent-loop、system-prompt、llm及Session接口；官方测试的定位/选读/作者实际执行状态分别看，不把固定行范围有效当语义验证。

图示复查建议：16图各自认知任务、箭头和caption/alt同步；对“发布/持久/结束/所有权/Scope/index”做术语表；手机320的长图与英文密度做真实读者任务。当前只对H12进行了本轮三宽度复核，没有重新审16图。

负担基线：正式估时H09 120–160、H10 150–200、H11 170–230、H12 185–245，总625–835分钟；蓝图对应385–525分钟。增长必须公开讨论，不改写旧蓝图掩盖；综合测验另计且未定时长。每课已分三段，未来应记录实际停顿、提示次数、错误模式和迁移能力，而不是仅比较字数。

后续若确认P0/P1，先登记事实/范围，保存原件与patch后最小修订，重跑受影响内容/实验/Renderer/图。现有“不自动审查”的任务边界继续生效，此议程不触发执行。
