# H16 C/D 实验证据

23项TAP通过：9 C + 14 D。实践A/B/C/D/X不是证据级别；B级Cordis依赖不重复计数，E完整应用未运行。

| 场景 | 实际断言边界 | 数量 |
|---|---|---|
| 参数/URL/命名 | 官方read参数3、无网络URL卫生4、公开MCP命名2 | 9 C |
| File A | 真实工具读/写/编辑、流窗口与源行截断提示、歧义/未观察/取消、观察缺失、附件条件与卸载 | 1 D |
| Shell B | 真实消费者/env/workingDirectory/Jobs，缺执行器、退出码7、无Jobs拒绝、取消、job_output；进程为替身 | 1 D |
| Web C | 八组真实Runtime/工具/准入组合，唯一/显式/零/歧义/配置缺失/不可用/ready=false/取消；404与格式上限 | 8 D |
| MCP D | 实际SDKstdio两本地Server，同名路由、资源、刷新失败保留、断线保留或一次重连、Scope、卸载 | 2 D |
| 综合X | 实际Loop四家族结果历史、两侧请求/每次事件前缀重建；允许集合阻止远端write，服务器计数0 | 2 D |

[practice-output.json](evidence/practice-output.json)保存全部逐场景输出，X含每次Loop边界与Adapter输入及事件前缀；D包含公开/原始名、PID、变更轨迹与失败。保留规范value/content/meta/isError及真实Session事件，教学trace不伪装成审计事实。

[lab-tests.txt](evidence/lab-tests.txt)、[lab-results.json](evidence/lab-results.json)为最新结果与hash。所有run-时间戳-*.json保留args、exit、stdout、stderr、程序hash、scratch，包括导入/夹具失败。negative-answer的非零为预期失败，拒绝“无provider必注销工具”的错误答案。上游完整测试套件未运行，不把静态参考计PASS。

## 实际TAP条目

- C File argument offset-zero
- C File argument limit-over-cap
- C File argument blank-path
- C HTTP URL hygiene file:///fixture
- C HTTP URL hygiene ftp://fixture.invalid
- C HTTP URL hygiene https://name:pass@fixture.invalid
- C HTTP URL hygiene https://fixture.invalid/xxxxxxxxxxx
- C MCP normalized names preserve identity and budget
- C MCP long raw names are stable and bounded
- D A real File tools, streaming window, edits, optional policy and lifecycle
- D B real Shell consumer/env/Jobs over explicit Mock Executor
- D C Web unique
- D C Web explicit
- D C Web none
- D C Web ambiguous
- D C Web configured-missing
- D C Web configured-unavailable
- D C Web not-ready
- D C Web cancel
- D D actual MCP SDK stdio disconnect retained
- D D actual MCP SDK stdio one reconnect
- D integrated AgentLoop four families
- D integrated AgentLoop remote discovery cannot expand allowlist
