# H19 差异与修订记录

所有官方路径均对应 `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`。[54项源码断言](source-checklist.md)记录准确位置；失败运行保留在 evidence/run-*.json，未删除或计为PASS。

## 文档措辞与实现顺序

`docs/subsystems/compaction.zh.md:101` 原文：“失败请求的恢复在失败的步骤关闭后通过 `agent/request-error` 运行”。实际 `packages/core/agent-loop/src/agent.ts:538–568` 在请求尝试循环内结算失败 attempt 后发 request-error；压缩授权重试后继续同Step请求，step/end更晚。D:overflow核对 attempt < compaction/start < step/end；不是新开Step。正文采用实际实现顺序，文档措辞只作概括，不将其画成关闭Step后重启。

## 内存可接纳，不等于持久格式可恢复

Pruner 的公共 `pruneSession(session)`遍历当前工具节点，没有在自身入口要求开放Turn。初版X在已关闭Turn后直接调用，内存追加成功，JSONL新实例读取拒绝：`tool/result is outside an open turn`。原始失败在 [run-1793767611889-tests.json](evidence/run-1793767611889-tests.json)，对应临时副本及文件保留。

依据：Pruner `src/index.ts:150–185`；持久格式 `packages/session/session-format-v3-to-v4/src/relationships.ts:73–155` 的 requireTurn 及tool/result分支。不能把这种分层差异理解成后端损坏恢复，也不能为凑PASS放宽格式验证。X已改为真实开放Turn内的下一次pre-step修剪，再在空闲维护中摘要；关闭、新实例读取、agents.resume及下一请求通过。正文明确限制B/X的修剪时机。记录为固定版本调用边界，不向学生推荐关闭Turn后任意持久剪枝；未改官方代码。

## retain0与“保留近期”的范围

`selectCompactableRange`从最后节点先累计，再检查预算，所以retain0仍保留尾节点；尾节点可以是无普通文本的developer材料。初版D错误地把常规保留answer3的断言也用于Overflow。实际Overflow绕过保留预算；当前夹具重试只有system与框定检查点。已删除错误预期并以真实请求输出解释该差别，保留“常规pressure/switch必须保留answer3”的断言。独立 D overflow 输出另见时间戳运行记录。没有为通过而减少源码规定的保留保证。

## 夹具与审校修正

- 初次缺少固定内部模块别名、缺少image/offload拥有者投影：补足锁定源码解析与真实插件依赖，不Mock投影。
- Cordis能力通过await ctx.plugin(Basic)安装，避免绕过服务代理注入；仍是真实实现。
- end失败后旧range已经失效；先对新Surface重新选合法range，再断言活动锁busy，分别验证两道前置条件。
- 手动busy可能同步抛出；assert.rejects用异步包裹，门控release放finally，避免失败断言阻塞后续任务。早期超时保留，后续34项全通过。
- 命令不进入Surface按事件身份检查；不使用字符串“compact”判断（正文标签也含该字）。
- config整体返回结构按源码逐字段核对，未把内部解析结构误写成教学API。
- 源码锚S07纠正为measurement-projection实际函数范围；AST维护实现类为ReactLoopAgent，不将接口Agent误当class。
- 正文修剪标记从手误37纠正为39码点，总输出159；已用实际B输出和源码固定标记核对。

本轮没有发现需要修改课程既有H01–H18或Renderer的事项。没有通过忽略异常、修改官方源码、替换真实后端或删除失败证据获得最终结果。已知分层约束在教材中限制使用；作者侧无遗留P0/P1教学阻断。真实Provider与外审仍是验收条件。
