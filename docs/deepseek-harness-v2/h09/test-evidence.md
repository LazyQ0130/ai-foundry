# H09真实运行与证据分级

固定Commit f3803c96974ad4a94195fb97e5c637e9c2a3afe3，Node 24.16.0。全部为作者Node测试，未直接执行上游Vitest。C使用结构Agent/Factory夹具；D加载真实AgentLoop/Scope/Session。恢复后端仅内存fixture。

| 作者用例 | 等级 | 状态 |
| --- | --- | --- |
| C01 Registry without factory rejects both creation operations | C | PASS |
| C02 real Registry delegates caller fiber, rejects duplicate factory and releases slot | C | PASS |
| C03 real entry identity and advanced detach reject mismatch, collision and stale teardown | C | PASS |
| D01 A uses real Loop: queries, roots, snapshots and collisions | D | PASS |
| D02 B: public Agent lacks dispose; stale Handle and former caller cannot delete replacement | D | PASS |
| D03-setup initialization/cleanup path | D | PASS |
| D03-commit initialization/cleanup path | D | PASS |
| D03-session-listener initialization/cleanup path | D | PASS |
| D03-agent-listener initialization/cleanup path | D | PASS |
| D03-cancel initialization/cleanup path | D | PASS |
| D03-normal initialization/cleanup path | D | PASS |
| D04 setup sees live writable Session and unpublished Agent; created sees committed scoped registrations | D | PASS |
| D05 serial listener barrier holds create; failed creation preserves queued input without starting model | D | PASS |
| D06 owner unload during async creation listener waits for listener and scope before detaching | D | PASS |
| D07-handle stops and drains real maintenance before scope/registries | D | PASS |
| D07-owner stops and drains real maintenance before scope/registries | D | PASS |
| D07-factory stops and drains real maintenance before scope/registries | D | PASS |
| D08 explicit parentAgent, caller, historical parent and object identity are independent | D | PASS |
| D09 real resume rejects absent backend; pre-aborted create announces nothing | D | PASS |
| D10 real resume reconstructs new objects through memory backend fixture; dispose retains stored facts | D | PASS |
| D11 teardown attempts registry cleanup after write-close failure and preserves rejection | D | PASS |
| D12 queued wake starts only after serial creation listeners; pre-step rejects before any model call | D | PASS |
| D13 aborting the creation signal after success does not dispose the live Agent | D | PASS |
| D14 concurrent same-id preparation publishes one lifecycle and preserves winner | D | PASS |

总计C3/D21，24项；每项只计一层。A没有独立Registry模拟实验，B在C/D内部运行但不重复计数，E=NOT_RUN。

原始记录：evidence/lab-tests.txt、lab-demo.txt、lab-results.json；错误所有权变异lab-mutation.txt非零且抓住D02。run-时间戳-tests.json保留每次失败和成功stdout/stderr，最终日志不冒称首次即全通过。

真实对象边界：D07用维护门闩验证取消后等待、Scope先于写close、close先于Agent退出（Agent通知内检查已close）、Session最后退出；D10核恢复新对象、旧事实前缀及新增end-seed，后端无磁盘/崩溃/租约语义。D12只放行Turn并在pre-step拒绝，stream调用零次。

失败演进见review-log：缺Zod、广义testkit无关chokidar导入、Context包装身份误断言、恢复新增end-seed。均修正对应夹具/限定，不改官方实现或删除断言。Zod独立目录安装4.4.3，完整性与固定pnpm-lock一致；其余外部包继承H04固定隔离依赖并逐项核版本/完整性。

未验证：官方真实持久化后端、完整Harness应用或套件、真实Provider、真实文件/Shell工具、根关停磁盘写入、跨进程恢复、学员/独立外审。没有用任意Map版AgentRegistry冒充官方实现；内存存储Map的替代范围在正文主线注明。

9项既有Renderer回归另在renderer-tests.tap；三宽度真实组件挂载、原图/复制/横滚在visual-qa.json。它们不是本表C/D业务测试，也不代表学习效果。
