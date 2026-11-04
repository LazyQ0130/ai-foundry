# 第五模块跨课综合测验

18题，100分。对象为已完成Stage4与H01–H16的学习者。先独立推导中间状态，再运行隔离fixture，最后展开答案。综合A–E必须写证据和因果；只背术语不能取得相应分数。未知写盲重、错误耐久保证、删除原事实三项关键误解须订正，不用总分冲抵。分值/通过线未经试读校准；作者估额外140～200分钟，环境另计。

[交互预览](assessment-preview.html) / [详细答案与评分](assessment-answers.md)。自评分不自动判理解。

## Q01｜事件位置与Header（4分）

一个刚创建的Session有不可变Header，随后按顺序接纳6条合法事件。

**精确输入**

```text
日志Seq为0,1,2,3,4,5；读取区间[1,4)；没有持久后端。
```

**任务**：给出长度、末事件Seq、结尾Offset和读取结果，并判断现在可否承诺崩溃后读回。

## Q02｜按位置替换Surface（4分）

日志含0 system、1旧user、2assistant、3attempt、4tool结果、5空developer；6已合法替换1..2。

**精确输入**

```text
当前节点[0,6,4,5]。拟追加user摘要7，replace(start6,end4)，sourceEventSeqs=[6]。
```

**任务**：判断是否接纳；修正最小源引用后给节点、消息数和原始日志变化。

## Q03｜Projection不是另一份真源（4分）

使用H17任务单元：init=idle/0/0；turn/start设running并更新turn；turn/end把finished加1、按reason设状态；无关事件返回原state。

**精确输入**

```text
依次turn/start(1)、step/start(1,1)、step/end(1,1)、turn/end(completed)。wire.view返回state本身。
```

**任务**：逐步给状态、通知次数和snapshot.asOfSeq；说明将无关事件改成{...state}的风险。

## Q04｜读写所有权（4分）

Windows同一登录会话，真实JSONL会话已实体化，A持有write。

**精确输入**

```text
B同实例open(read)；C新后端open(write)；D独立Node进程open(read)；A之后await close。
```

**任务**：给三个打开结果和close后的写权；分别说明哪部分来自seam、哪部分来自JSONL实现。

## Q05｜Append与Flush（4分）

JSONL已挂载，Session按ID路由到活writer；后台缓冲可能尚未排空。

**精确输入**

```text
s.append(e)成功；随后只await writer.flush()。另一分支先close writer，再s.append(e2)，Store.flush(s)返回true。
```

**任务**：两条路径各缺什么证据？写出包含路由缓冲的正确检查点及失败处置。

## Q06｜JSONL重新打开的证据（4分）

H18保存Header与5事件，显式flush/close；新后端读取后，另起Node PID读取。

**精确输入**

```text
none文件6行；默认compression分支首魔数0xFD2FB528；某V3物理源只读返回header.version4。
```

**任务**：分别解释三组数字及已验证边界，指出为什么它们不等于完整应用崩溃恢复。

## Q07｜Resume、Fork与运行父级（4分）

原任务事件0..15完整；tool/call在9，result在10。

**精确输入**

```text
正常Resume原身份；普通Fork含切点9，新child ID。
```

**任务**：给两条初始长度、子继承数与新增事件顺序，判断是否自动有writer、parentAgent、工具重放。

## Q08｜物理尾与语义尾（4分）

两份新建JSONL fixture。

**精确输入**

```text
甲：完整5事件后半截JSON无换行；乙：完整turn/start、step/start、system、user、Assistant提议与call共6条，没有result。
```

**任务**：写甲读取与首次新append的动作，写乙归谁补何种语义。

## Q09｜缺失ToolResult的三种输入（4分）

同一个仍开放Step中Assistant依次提出a,b,c。

**精确输入**

```text
a无call；b有call@7无result；c有匹配append result@9。
```

**任务**：列修复结果、来源与后续结束顺序；说明call是否已证明主体生效。

## Q10｜Token预算与计量（4分）

使用Basic固定公式，R为比例保留。

**精确输入**

```text
W10000，O1000，B2000，thresholdRatio=.8，retainRatio=.16；P分别6999/7000；Usage input1000/cacheRead100/cacheWrite20/output50，其中reasoning10已含output。
```

**任务**：计算T、R、两个触发结果和Usage总量，并说明UI1120为何不矛盾。

## Q11｜Compaction选区与工具配对（4分）

当前Surface按位置为[S,U,A(call x),T(result x)]，S是首system。

**精确输入**

```text
尾部预算仅够T；另一个输入为[S,A(call x),T(巨大结果)]。
```

**任务**：分别给最晚安全保留切点、可压缩范围和无进展时Overflow能否凭空授权重试。

## Q12｜Overflow与普通Retry（4分）

真实request-error Waterfall按注册顺序执行。

**精确输入**

```text
normal自定义retryableCodes=[CONTEXT_WINDOW_EXCEEDED]、maxRetries1；Basic.maxOverflowRetries1；输入可摘要；脚本Overflow→成功。比较Retry→Basic与Basic→Retry。
```

**任务**：预测普通计划/辅助摘要数，并判断“全应用最多2次请求”是否成立。

## Q13｜指数退避与取消（4分）

normal d0=500、M10000、j=.1，r从1起。

**精确输入**

```text
第1次U=0，第2次U=1；另有Provider RetryAfter=20000；已写retry计划而尚在等待时用户取消。
```

**任务**：计算两次本地延迟、normal/always超上限行为及取消后的必要事件区别。

## Q14｜综合A：同一Agent跨四课重建请求（10分）

使用本轮M5-whole实际轨迹，省略长载荷但不省事件。节点口径为Loop进入Runtime前的Surface消息来源；Adapter可再作工具声明投影；工具inspect纯内存；Header6用于最初请求，25为后续完整快照，38为恢复后新快照。

**精确输入**

```text
0 inbox;1 turn1/start;2 inbox;3 step1/start;4 system;5旧user;6 header;7 context;8 Assistant(call);9 tool/call;10 result;11 step/end;12 step2/start;13回答;14 step/end;15 turn/end;16 compaction/start(null);17 summary;18摘要user replace(5,10),source=[16,17,5,8,10];19 end;20 inbox;21 turn2/start;22 inbox;23 step1/start;24新user;25 header;26失败attempt;27 retry;28 started;29成功回答;30 step/end;31 turn/end;flush/close;新后端Resume追加32 end-seed;33 inbox;34 turn3/start;35 inbox;36 step1/start;37新user;38 header;39 developer工具声明更新;40回答;41 step/end;42 turn/end。
```

**任务**：列全部普通请求在Loop→Runtime边界的事件截止前缀和消息来源节点；数Turn/Step/普通请求/摘要请求/工具执行；区分39节点与Adapter工具投影，说明恢复边界。

## Q15｜综合B：真实JSONL保存、恢复与Fork（10分）

设计仅作用于新建隔离root的真实局部实验，不调用真实付费Provider；沿用H18 X的完整16事件初任务，call在9。

**精确输入**

```text
保存16事件及Header；关闭Agent和后端；全新后端Resume；从包含Seq9生成持久子分支；父子分别接收PARENT_ONLY/CHILD_ONLY。
```

**任务**：写可运行接线步骤/关键API与断言；给17/14/26/23计数含义，区分普通内存Fork、持久分支和跨进程证据。

## Q16｜综合C：压缩后的历史与失败证据（10分）

使用综合A压缩前节点[4,5,8,10,13]，其中8/10是完整工具对，13为近期回答。

**精确输入**

```text
16 start；17 summary.shadowedSeqs=[5,8,10]；18摘要user replace(5,10),source=[16,17,5,8,10]；19 end。另两次独立故障分别发生在写18与写19的入口。
```

**任务**：给成功后的节点/Message/原日志变化、辅助摘要输入和故障后已存在事实；解释新的生命周期为何可处理陈旧锁。

## Q17｜综合D：Retry与取消的两条未来（8分）

H20 X实际开放前缀0..12：8失败Attempt、9 retry计划、推进500虚拟ms后10 started、11 Assistant提议write/read、12 write call；假效果已1且主体门闩未返回。

**精确输入**

```text
原任务现在cancel并放行；另一全新ID/root副本只保存0..12并真实Resume。
```

**任务**：给原任务与副本各自13以后的事件/错误码，说明取消时whenIdle、恢复时模型与工具次数；再对比若在9等待中取消。

## Q18｜综合E：非幂等未知结果的完整诊断（10分）

某资源创建工具不保证幂等，不能调用真实业务接口。已持久合法开放尾含Assistant提议和tool/call；外部监测在网络断开前可能已经看到创建成功，但结果事件未保存。

**精确输入**

```text
日志缺tool/result；有人建议“always重跑整个Turn，压缩删除旧错误，然后补成功result”；另一个已有相同业务键的只读查询接口可用。
```

**任务**：给安全恢复方案、所需证据、模型请求/工具恢复/Compaction/Cancel各自职责，列不能验证的事实与会阻断准入的错误。
