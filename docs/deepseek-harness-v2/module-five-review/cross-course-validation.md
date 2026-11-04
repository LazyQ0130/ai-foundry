# 跨课真实局部验证

原课123项已逐TAP复验；新增5项D见[测试程序](probes/cross-course.test.ts)、[最终TAP](evidence/cross/evidence/lab-tests.txt)、[完整事件/请求](evidence/cross/evidence/behavior-traces.json)。命令：`node docs/deepseek-harness-v2/module-five-review/scripts/run-existing.mjs cross`。Windows x64、Node24；固定源码/上游精确依赖，复制H20 support/clock/bootstrap到新mkdtemp，DSH_HOME指向fixture。无递归清理，无付费模型或真实业务资源变更。

|建议场景|复用与新增实际证据|Fixture边界/不能外推|
|---|---|---|
|A 完整保存恢复继续|H18 X正常保存/关闭/新实例Resume+持久Fork；本轮whole把压缩/Retry接入同一Agent，保存32事件、恢复marker32、继续至42|同进程新实例，不是实际崩溃；原工具纯内存|
|B Compaction/Surface|H19 C/B/D/X实际选区、配对、summary/replace/end、原前缀与JSONL恢复；whole再次核[5,8,10]→18摘要、近期13保留|真实Basic/Meter；摘要内容为脚本，不评价事实完整性|
|C 持久Retry|H20 C/X真实保存attempt/plan/started/成功；新prefix逐次以第二真实Session重建请求封装，真实JSONL比日志；whole跨压缩再恢复|虚拟timer仅替当前隔离进程timer，不替官方算法；非宿主性能|
|D 工具未知/取消|复用本轮H20 B/D/X与H18语义恢复：未开始/开始无结果/已有结果、原结果保留、排空、合成错误和效果不回滚|内存Map/计数是外部替身；未实际调用支付/发信/删除接口|

不为凑A–D数量重复实现等价测试；新增投入集中在准备包明确未测的顺序/预算与贯通链。

## 五个新增测试逐项

|名称|技术断言|真实组件|结果/等级|重复关系/剩余风险|
|---|---|---|---|---|
|order retry-first|自定义normal允许Overflow时先用普通计划、不摘要|Loop/Runtime/Retry/Basic/Session/Meter|PASS D；2普通/1计划/0摘要|新顺序反例；不证明策略推荐性|
|order basic-first|Basic先取得输入进展，不耗普通计划|同上|PASS D；2普通/0计划/1摘要|与上一项成对，非独立系统覆盖率|
|independent budgets|普通预算耗尽后委派尚有预算的Basic，同Step继续|同上|PASS D；3普通/1计划/1摘要/2attempt|不是全应用最大次数定理|
|prefix reconstruction|每次请求从当时前缀重建messages/config/tools/toolHistory，失败片段不污染；保存事件相等|Loop/Runtime/Retry/Session/JSONL|PASS D；2请求|扩展H17请求重建到持久Retry，非E|
|full chain whole|同一Agent工具→压缩→Retry→保存→新后端Resume→新任务；原前缀不变、工具仅1|Loop/Tools/Basic/Meter/Retry/JSONL/Session|PASS D；保存32/续至43条|受控业务与模型；跨进程崩溃仍未验|

首轮新增夹具因注册后改policy、Session.create seed签名错误出现1/4，见本目录保留的`run-*-tests.json`；正确接线后4/4，加入whole后5/5。终审再强化whole的五次完整请求封装捕获，恢复后观察器只见33起的新尾，错误用它构造从0连续的seed导致两次4/5；改取Session.snapshotEvents后最终5/5，精确前缀[8,13,26,29,40]均通过。Loop→Runtime的消息来源节点与Adapter工具声明投影分开记录。没有删断言、修改官方实现、放宽门禁或把失败改成PASS。原始失败和最终成功各含exit/stdout/stderr/args/scratch/程序hash；详见[修订台账](revisions.md)。

原报告123项=C64/D59；H20 raw-stream仅直接Runtime，复核由D降C，原123项复核为C65/D58。当前执行项128=C65/D63；A/B/E无单列项。纯业务Map与脚本Adapter存在于真实组件fixture内部，不应另计A/B或将D升级E。所有数量是执行身份，语义重合见逐项矩阵，不能推独立故障数。
