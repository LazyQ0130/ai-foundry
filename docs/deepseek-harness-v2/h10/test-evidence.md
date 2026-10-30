# H10 实验与证据等级

本课按用户本轮定义分级，不能继承H09里同字母的含义。31项作者用例在Node TAP中互斥为C4、D27；不是按源码断言行数计数，也不是官方Vitest套件的31项。所有通过结论均限以下输入与子路径。

| 等级 | 本轮状态 | 实际对象与替身 |
| --- | --- | --- |
| A 自制教学Mock | NOT_RUN（独立模拟器） | 正文最小while和下载状态机是教学片段，未算真实Harness证据；模型脚本是D中的替身 |
| B 真实Cordis局部 | NOT_RUN（独立专项） | C/D内部均运行真实Context/插件/事件；不另算31次Cordis测试 |
| C 真实AgentLoop组件 | PASS，4项 | 实际ReactLoopInbox、Session与projection；最小结构Agent载体；实际AssistantStreamAttempt组件 |
| D Loop+Session+LLM+Tools局部集成 | PASS，27项 | 实际ReactLoopAgent、注册工厂、SessionStore、LLM Runtime、Tools和NativeToolExecutor；模型/文本工具受控 |
| E 完整Harness应用 | NOT_RUN | 未启动Boot/Profile/CLI/TUI、真实模型、磁盘后端或官方整套测试 |

实践A/B/C/D是教学任务名称，与上表等级不是对应关系。所有原始stdout/stderr、退出值、依赖与程序哈希在[lab-results.json](evidence/lab-results.json)；[lab-tests.txt](evidence/lab-tests.txt)是易读TAP；[lab-demo.txt](evidence/lab-demo.txt)保留全部场景。demo中的multi/retry原样解析为[trace-fixtures.json](evidence/trace-fixtures.json)，随机id/时刻保留，计数/次序/脚本结果确定，不宣称不同运行逐字节相同。

| 用例 | 等级 / 数量 | 执行与关键反证 |
| --- | --- | --- |
| C01 | C / 1 | 真Inbox领取全部next-step再一条next-turn；两个splice先于claimed；没有普通user/message |
| C02 | C / 1 | 跨表同一消息身份拒绝，Session seq不增长 |
| C03 | C / 1 | clear先next-step后next-turn，均记canceled |
| C04 | C / 1 | 真Stream组件：块可见时无Assistant事实，settle append之后才发committed end；直接helper不当成全模型调用 |
| D01十场景 | D / 10 | direct、one-tool、multi、two-tools、reject、empty、retry、terminal、tool-error、max-tokens；同时断言Step/请求/工具/Turn reason/idle及边界配对；tool-error额外断言isError和真实错误文本 |
| D02 | D / 1 | 三Step严格事实序列，旧请求不增长，后续请求含1/2份工具结果；校验工具归属，错标read-1到Step 2必须失败 |
| D03 | D / 1 | retry正确标注通过；把2次Attempt写成2个Step必须失败；用户仅接纳1次、失败attempt 1条 |
| D04 | D / 1 | 维护公开idle/内部maintenance；释放门后I,S,F1再F2，Turn编号1/2，各Step 1 |
| D05三路由 | D / 3 | 已运行中的steer/inject到(1,2)，followup到(2,1)，每项2次真实派发 |
| D06五取消点 | D / 5 | pre-step为0Step/0请求；request为1/0；stream为1/1且interrupted内容；keep/drop未领取两列表分别保留/清空 |
| D07 | D / 1 | idle inject零Turn/请求，随后steer才唤醒 |
| D08 | D / 1 | 首次拒绝不重新入队已领取输入，第二条next-turn仍停放；whenIdle非耗尽回执 |
| D09 | D / 1 | 重试pre-step/assemble各1，agent/request/模型各2 |
| D10 | D / 1 | request中间件throw，0模型请求、0恢复监听器调用、Turn error |
| D11 | D / 1 | stopping监听器steer再开同Turn Step；先前max-tokens保持最终reason |
| D12 | D / 1 | 当前候选选择快照固定，首次request中select的模型在下一Step生效 |

独立negative-answer.ts故意把retry第二次请求标成Step 2，进程非零为EXPECTED_FAILURE，原始错误见[lab-mutation.txt](evidence/lab-mutation.txt)。这是一项答案负例，未改变官方实现，也没有算成第32项正向测试。CLI另用两份reference JSON实跑retry/multi，按toolPositions核工具归属；自由文字解释不靠关键词自动给分。

装配与Mock来源：support改编官方scope-lifecycle/request-error的真实最小服务挂载；official-mock.ts逐字节等于固定上游同名fixture，内容检查另比字节。工具用官方defineContentToolFixture注册纯文本execute，经过真实Tools/Native执行器；它不读取真实README、测试、私人文件或Shell。LLM没有外部网络或费用。Session没有存储后端，不能称官方JSONL恢复通过。

运行器新建OS临时目录，显式环境白名单，DSH_HOME指向新的fixture-home。没有递归清理；失败与成功原始run JSON都保留。[run-1793328693111-tests.json](evidence/run-1793328693111-tests.json)记录最初D09监听器参数错误导致30/31，后续修正夹具签名后31/31；没有删除失败或放松断言。具体见review-log。

仍未执行：真实应用E、磁盘flush/崩溃/跨进程恢复、未知工具副作用、批次基础设施故障修复、concluded工具、含工具max-tokens、绑定metadata内部取消、abort后发送竞态、流结算失败与恢复监听器失败等组合。源码清单明确STATIC_ONLY/CONTROL_FLOW_READ，不把相邻实测升级成全路径通过。
