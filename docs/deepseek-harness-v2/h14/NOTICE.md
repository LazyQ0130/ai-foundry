# H14 来源与许可

研究对象为DeepSeek Harness固定Commit `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`。实际服务从字节锁定缓存导入；源码/官方测试出处见source-checklist。上游[MIT](SOURCE-LICENSE.txt)、[Cordis](CORDIS-LICENSE.txt)、[Zod](ZOD-LICENSE.txt)许可随交付保留；不打包node_modules或完整上游测试套件。

四图、字符串业务、阶段日志与课程题目为本轮原创。Native实例私有pipeline故障注入参考官方agent-loop/tests/tool-calls.spec.ts；第二Session重建请求沿用第三模块审查与H13的验证方式。MockAdapter只替代模型回复；Promise门闩只控制测试时机，没有用自制调度算法冒充官方实现。
