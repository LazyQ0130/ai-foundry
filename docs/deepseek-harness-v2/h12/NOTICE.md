# H12来源与许可

研究对象为DeepSeek Harness固定Commit `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`。官方源码/测试位置在source-checklist；实际组件从只读缓存导入，保留[上游MIT许可](SOURCE-LICENSE.txt)。

本课ScriptedAdapter为作者固定响应夹具，不是官方模型或供应商服务。服务装配参考官方agent-loop测试模式，未复制一整份上游测试或运行其清理钩子；C27/28直接执行官方translate函数，不包含HTTP。课程图为本轮原创SVG，可由Python再生成。

真实Cordis与Zod隔离缓存的许可分别见[CORDIS-LICENSE](CORDIS-LICENSE.txt)、[ZOD-LICENSE](ZOD-LICENSE.txt)，版本/integrity留证，node_modules不打包进课程。源码资料与许可证保留不代表完整上游套件、应用或安全审计已通过。
