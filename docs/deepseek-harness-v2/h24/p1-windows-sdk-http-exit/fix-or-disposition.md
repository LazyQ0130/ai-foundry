# 最小修补分支与处置

**固定原版不变，原P1未解除。** 本轮没有把上游cache改了再声称仍是原Commit。

## 独立候选SDK补丁

[sdk-natural-default-exit.patch](patches/sdk-natural-default-exit.patch)，SHA256 `260e899eb2342c070247902d2921a7e70ae0ca1897a8608cb9b3910a163b72ef`。只改变默认退出动作：process.exit(code)改为记录process.exitCode并暂停输入，让事件循环自然结束；shutdown请求、响应、transport.flush、rootFiber.dispose及配置测试钩子契约均保留。没有降低外层观察：仍等实际child.close，核exit0、无原生断言、文件/JSONL与端口/Socket。

补丁只写新scratch的SDK index副本。[patch-apply-check](evidence/patch-apply-check.json)证明git apply在另一隔离SDK源副本中可用，结果逐字等于预期单行修改；单次命令关闭autocrlf，不改全局Git配置。由于执行副本不在上游目录，probe将其server.ts两个相对引用改为固定源码file URL，确保共用同一真实服务类；这只是测试覆盖定位，不是正式patch内容。所有其他Harness包仍由固定源aliases解析，没有引入lib第二单例。元数据标variant=patch、actualPrograms SHA及SDK模块路径；这份证据应称f3803c9＋本地patch，不能称f3803c9原版。

Node24.16.0的候选补丁23项通过（[run-1793855546659-5580-tests.json](evidence/run-1793855546659-5580-tests.json)），H23补丁版25项也通过；协议正常关闭和真实HTTP活动取消的重复/受控并行对照，exit0/无断言/Socket0/端口复用/领域预期均过。活跃EOF/直接Dispose仍缺turn/end，不在补丁成功范围。候选补丁未覆盖完整发行Profile、所有输入/平台、任意不响应工具或其他资源持有者，不能立即当作生产通用修复。

## 独立官方Runtime对照

官方Node24.22.1完整路径：`C:\Users\QYF\AppData\Local\Temp\aifoundry-h24-p1-node-official-26p14uci\node.exe`，SHA256 `d702daa815eabbff763c7d3808e235cf031cf2ca70211b56847bc72f51e240e5`，与nodejs.org发行清单一致。固定原版SDK直接Loader行、不装exit钩子，在新锁环境23项通过（[run-1793855545427-16132-tests.json](evidence/run-1793855545427-16132-tests.json)）。它说明存在可工作的限定Runtime路径，不自动改用户Node，不把未测试的版本区间都写为安全。

## 本轮处置

原基线Windows＋Node24.16.0＋固定SDK默认出口仍失败，故解除门禁二不满足，维持NO-GO。候选源码补丁和替代Runtime都与原基线分开。活跃EOF/直接Dispose的领域闭合缺口另保留，未把exit0或root dispose Promise结算等同全部事实已闭合。建议上游核默认进程退出策略，课程负责人未来明确支持Runtime后再申请原路径/发行入口复验；本轮不提交上游PR、不发布、不开展模块正式审查。
