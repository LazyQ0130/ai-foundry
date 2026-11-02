# 作者审查与修订记录

未确认遗留技术P0/P1；作者自审不是独立审查。

| 发现 | 处理与证据 | 当前状态 |
|---|---|---|
| 首次导入缺yaml | 从上游锁核定yaml2.9.0并接隔离依赖，未改官方源码/业务依赖；最初run JSON保留 | 已解决 |
| 测试把never的完整audit误当仅问答对 | 原始日志保留approval/policy，断言按asked/decided过滤 | 已解决，失败记录保留 |
| 测试误要求上下文含裸never单词 | 实际完整语句为disabled；改查语义对应的上下文及真实请求 | 已解决 |
| 测试无依据要求contexts数组冻结 | 此非已承诺契约，改检查实际sandbox:policy贡献 | 已解决，无上游改动 |
| 文档推荐effectivePolicy，实现却private | 正文、源码清单与诊断程序明确区别；AST核private，不宣传公开稳定API | 已记录版本差异 |
| roots的workspace与extra校验不可混说 | workspace只canonicalPath并保留失败写法；strict物理校验只针对additionalRoot | 正文与52条源码清单已细化 |
| 上游默认原子写入/官方测试含递归清理 | 不运行上游套件；只替换清理钩子，每次明确一个文件，空目录保留 | 用户指令例外公开说明 |

最终错误答案非零是预期门禁，用于拒绝“批准可绕过守卫”的错误预测。三平台原生进程runner、完整E、真实学员与实测时长保持未验证，不改成PASS。
