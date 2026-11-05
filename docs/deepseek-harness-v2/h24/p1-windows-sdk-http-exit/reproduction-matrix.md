# 复现矩阵

矩阵来源result-index及原始run/trace。不是TAP独立场景计数；官方src全为作者核心Profile，非发行E。Observer开销样本另列，不作为通过。

| 版本/出口配置 | 方式 | 活跃HTTP | 实际exit / signal | 请求/Socket | Turn终态 | 判定/原始证据 |
| --- | --- | --- | --- | --- | --- | --- |
| v24.16.0 / default | protocol | False | 3221226505 / None | 3 / 剩余0 | completed | FAIL / [traces-1793855176003-26176.json](evidence/traces-1793855176003-26176.json) |
| v24.16.0 / default | eof | False | 0 / None | 3 / 剩余0 | completed | PASS_LOCAL_VARIANT / [traces-1793855178258-28484.json](evidence/traces-1793855178258-28484.json) |
| v24.16.0 / default | dispose | False | 0 / None | 3 / 剩余0 | completed | PASS_LOCAL_VARIANT / [traces-1793855180584-26544.json](evidence/traces-1793855180584-26544.json) |
| v24.16.0 / default | sigterm | False | None / SIGTERM | 3 / 剩余0 | None | FORCED_NOT_GRACEFUL / [traces-1793855182531-9880.json](evidence/traces-1793855182531-9880.json) |
| v24.16.0 / default | protocol | True | 0 / None | 1 / 剩余0 | aborted | PASS_LOCAL_VARIANT / [traces-1793855183776-28644.json](evidence/traces-1793855183776-28644.json) |
| v24.16.0 / patch | protocol | False | 0 / None | 3 / 剩余0 | completed | PASS_LOCAL_VARIANT / [traces-1793855186931-17928.json](evidence/traces-1793855186931-17928.json) |
| v24.16.0 / patch | protocol | True | 0 / None | 1 / 剩余0 | aborted | PASS_LOCAL_VARIANT / [traces-1793855187185-23016.json](evidence/traces-1793855187185-23016.json) |
| v24.22.1 / default | protocol | False | 0 / None | 3 / 剩余0 | completed | PASS_LOCAL_VARIANT / [traces-1793855191580-14104.json](evidence/traces-1793855191580-14104.json) |
| v24.16.0 / patch | protocol | False | 0 / None | 3 / 剩余0 | completed | PASS_LOCAL_VARIANT / [traces-1793855191794-21720.json](evidence/traces-1793855191794-21720.json) |
| v24.16.0 / patch | protocol | True | 0 / None | 1 / 剩余0 | aborted | PASS_LOCAL_VARIANT / [traces-1793855195076-27340.json](evidence/traces-1793855195076-27340.json) |
| v24.22.1 / default | protocol | False | 0 / None | 3 / 剩余0 | completed | PASS_LOCAL_VARIANT / [traces-1793855196212-26032.json](evidence/traces-1793855196212-26032.json) |
| v24.16.0 / patch | eof | True | 0 / None | 1 / 剩余0 | None | FAIL / [traces-1793855198497-24188.json](evidence/traces-1793855198497-24188.json) |
| v24.16.0 / patch | dispose | True | 0 / None | 1 / 剩余0 | None | FAIL / [traces-1793855199901-1548.json](evidence/traces-1793855199901-1548.json) |
| v24.22.1 / default | eof | True | 0 / None | 1 / 剩余0 | None | FAIL / [traces-1793856004582-3052.json](evidence/traces-1793856004582-3052.json) |
| v24.22.1 / default | dispose | True | 0 / None | 1 / 剩余0 | None | FAIL / [traces-1793856004587-7468.json](evidence/traces-1793856004587-7468.json) |

| 其他对照 | 实际结果 | 边界 |
| --- | --- | --- |
| A 基础SDK无HTTP | 原24.16默认出口C组通过 | 初始化、任务/关闭、Resume、启动前exit7；不替代HTTP组合 |
| B 官方Mock HTTP单组件 | 实际200/SSE、请求记录、关闭/端口复用通过 | 非产品Host WebServer |
| C 原SDK+HTTP | 旧依赖、全新固定依赖、直接固定SDK模块均重现0xC0000409 | 不由代理模块或3包替换独立解释 |
| D 协议/EOF/Dispose/信号 | 上表实际终态 | SIGTERM为强制；活跃EOF/Dispose缺Turn闭合保持FAIL |
| E 源码/构建 | 源码多组已执行；正式lib正向NOT_RUN | 固定树无apps/cli/lib/bin.js；不自打bundle冒充官方构建 |
| F Runtime/依赖 | 原官方24.16失败，新官方24.22.1同路径通过；8新锁树可复现 | 不改用户全局Node；只验证列明版本/Windows |

原生最小脚本在旧官方Node3/3失败，新官方Node3/3正常。正常小fetch对照通过，表明触发与工作/清理时序有关，而不是所有网络调用都会失败。完整exit采样会改变时序并使部分问题消失；带该观察器的通过不清除无观察器失败。

run-matrix.py显式并发2，两个候选补丁协议关闭/活动取消重复对照有重叠执行；各自产生不同world/PID/port，所有测试自有端口可重新bind。它不等全CI压力、所有平台或全部工具的资源认证。
