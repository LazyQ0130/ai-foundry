# 原生断言、退出阶段和堆栈

原文：`Assertion failed: !(handle->flags & UV_HANDLE_CLOSING), file src\win\async.c, line 94`。外层实际exit3221226505（0xC0000409），signal=null；请求退出码0不等操作系统终态0。原历史PID25240/2252及本轮多个PID均留完整stderr，未过滤。

直接原版复现之一：[原始trace](evidence/traces-1793855176003-26176.json)。该次SDK初始化、safe文件、HTTP三次请求、tool/result、正常Turn及shutdown响应均出现，随后子进程原生断言。JSONL/runtime已由自身effect写出，外层还执行Mock Listener清理/Socket close/port rebind。**harness finally完成与SDK进程正常退出是两项独立检查。** 前者成功不能冲销后者失败。

JavaScript路径采样见有exitObservations的run：官方sdk/server/src/index.ts:56的默认exit，经:73在transport.flush和rootFiber.dispose的await之后调用process.exit。采样通过exit事件读取JS stack/libuv，不覆写exit、不截断stderr；但完整report采样增加时序开销，原24.16部分样本因此不崩。这些采样仅用于定位代码路径，不作零开销成功证据。

本机PATH及常见Windows调试器位置未发现可用native debugger；原libuv断言没有输出C++ Native Stack，未伪造“本机原生栈”。JS stack不是Native Stack，上游issue中的栈也不是本机栈。原生内部机制的佐证来自Node官方源/修复，详见root-cause。独立minimum只含Node内置模块，关闭Listener后仍3次触发同断言，进一步排除必须有SDK、tsx、Koffi或未关Listener才触发。

额外生命周期观测：活跃HTTP中的EOF/直接root Dispose在24.16候选补丁以及新官方24.22.1均可能exit0、零Socket、端口释放，但没有turn/end；新对照的rootDisposePromiseSettled=true仍不等领域闭合已持久。该合同缺口独立保留，不能填为“全部正常退出方式通过”。
