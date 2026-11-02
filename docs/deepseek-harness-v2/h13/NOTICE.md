# H13 来源与许可

官方研究对象固定为 DeepSeek Harness `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`。API 与官方测试出处在 source-checklist，实际运行从已核字节缓存导入。上游 [MIT](SOURCE-LICENSE.txt)、[Cordis](CORDIS-LICENSE.txt) 与 [Zod](ZOD-LICENSE.txt) 许可随交付保留，node_modules 与完整上游代码不打包进本课。

本课四图与数字业务例子为本轮原创。服务挂载与最小 Agent-like Scope 键参考官方 tools 的 activation/scoped 测试方式；请求重建沿用本项目第三模块集中审查的真实 Session 准备模式。ScriptedAdapter 是固定响应替身，Native 执行器与共享组件是真实官方实现；未复制整套上游测试或执行其清理钩子。
