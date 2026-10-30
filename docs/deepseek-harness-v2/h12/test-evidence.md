# H12验证分级与原始执行

最终 **49/49通过：A1、C33、D15**。错误答案负例另行非零退出，不计入49项。[原始运行结果](evidence/lab-results.json)保存完整stdout/stderr、退出值、源码/依赖/程序哈希与隔离目录；[TAP](evidence/lab-tests.txt)、[完整演示](evidence/lab-demo.txt)、[实践结构化输出](evidence/practice-output.json)可直接复核。

| 等级 | 本轮实际结果 | 限制 |
| --- | --- | --- |
| A 教学Mock或独立算法 | 1项，最小AsyncIterable例子 | 没有用自制Assembler/Runtime/Session替代实现 |
| B 真实Cordis专项 | 未单独运行 | Cordis在C/D内真实运行，不重复加计 |
| C 真实组件 | 33项 | 实际Assembler/Accumulator/Message、Runtime、官方DeepSeek.translate；模型端是本地受控Adapter |
| D Loop+Session+受控Adapter | 15项 | 真实Loop/SystemPrompt/Session/LLM Runtime及受控工具，含真实结算拒绝路径 |
| E 完整Harness应用 | 未运行 | 没有全Profile、真实凭据、外部API、付费模型或完整应用端到端验证 |

| 作者ID | 实际验证对象和行为 |
| --- | --- |
| A01 | 最小异步例子三次累计状态；不作为Harness行为证据 |
| C01–03 | 逐片文本、首次出现索引顺序、交错reasoning/工具参数、权威block-end与迟到片段 |
| C04–07 | max-tokens去掉全部工具及同步replay裁剪；安全中断前缀；开放未知类型失败；错误replay数量只丢私有状态 |
| C08 | 冻结、分离的消息身份；ToolResultMessage为tool角色并关联callId |
| C09–10 | 紧凑记录保留成员边界和精确时间（含负dt）；与展开后组装一致；快照不受原对象或后续push影响 |
| C11（3项） | 记录dt长度、负index、多余key分别拒绝 |
| C12–15 | 注册原子性/撤销、空catalog允许精确路由、默认及错误事实、prepare与直接stream的NO_ADAPTER差异、坏defaultMaxTokens拒绝 |
| C16–20 | 一次性与配置漂移、延后漂移再次拒绝、旧注册绑定、Adapter内部代次捕获、解析等待期间取消 |
| C21（3项） | Adapter同步分发、迭代器构造、迭代next失败规范化；迭代场景核message/code/status/providerRetryAfterMs/requestId完整事实 |
| C22–26 | 普通Error为UNKNOWN、信号影响aborted终态；中间件仍抛；短路不必查Adapter；坏终止顺序不自动修正；Replay按实例所有权过滤 |
| C27–28 | 实际官方DeepSeek.translate：原生Messages事件到公共块，index规范化，usage-before-finish，缺message_stop为STREAM_CLOSED |
| C29 | configure取得默认前的冻结controls/model；原路由保留；显式控制值与默认来源；回调throw在分发前拒绝 |

C编号到29，C11/C21各有三个参数化用例，因此是33项。A是1项。以下每个D场景各1项，互斥计15，不将内部同时运行的组件再加进C。

| D场景 | Assistant事实 / 最终Turn | 工具与实时边界 |
| --- | --- | --- |
| success | message / completed | committed seq与实际事实匹配 |
| failure | attempt / error | 已显示草稿不进正常Assistant历史 |
| throw | attempt / error | Adapter断流转TRANSPORT finish，前缀仍记在失败stream |
| cancel-empty | attempt / aborted | start后无安全内容，不伪造message |
| cancel-partial | interrupted message / aborted | 保留已经交付的非空半句，0工具 |
| cancel-reasoning | interrupted message / aborted | 只保留已交付推理前缀，0工具 |
| cancel-tools | attempt / aborted | 完整已关闭工具仍不执行 |
| max-tokens | message / max-tokens | 保留文字，去掉全部工具，主体0 |
| write-failure | 无成功Assistant事实 / error | 实际夹具Session拒绝message append，end abandoned |
| attempt-write-failure | 无成功Assistant事实 / error | 实际夹具Session拒绝attempt append，end abandoned |
| assembly-failure | 无成功Assistant事实 / error | 未知开放块在最终组装失败，end abandoned |
| middleware-failure | attempt / error | 本夹具返回生成器后迭代throw；有start，真实Adapter调用0 |
| retry | attempt后message / completed | 1 Step/2请求；新attemptId、revision连续，用户只接纳一次 |
| in-band-aborted | attempt / error | 本地signal未取消；提供方aborted不直接等于用户取消 |
| tool-chain | 两message / completed | 2 Step/2请求/1固定工具；Assistant先结算，第二请求读到关联结果 |

每个D测试核revision连续、Attempt内交付index稠密、无逐片assistant/chunk Session事件；所有committed end必须在匹配事实之后，seq/eventType正确，紧凑流展开逐项等于真实交付chunk。工具链另核旧请求不长出新结果、请求冻结、工具主体仅执行一次。取消用门闩确认边界后置signal并释放自制等待，未用睡眠猜竞态。

实践输出键：intro、A、A-max、B、C-各场景与D。D的stages从真实trace派生，不制造协议或Session事件。模型“选择读README”由脚本预设，只证明各层衔接，不证明模型自主规划。受控工具的README为代码常量，不访问工作区文件。

首次48项通过，补configure默认前回调验证后49项通过；最终又增强配置漂移错误码和结构化失败字段断言后49项通过。各次run记录保留；没有编造失败的行为测试。另有三处官方测试引用末行越界，原失败与修复patch单独保存，见[修订记录](review-log.md)。

[negative-answer.ts](../../../course-content/internal/deepseek-harness/h12/lab/negative-answer.ts)故意断言max-tokens保留已关闭工具，真实实现必须拒绝；[诊断](evidence/lab-mutation.txt)为EXPECTED_FAILURE。它是错误答案反证，没有修改上游实现，不称实现级mutation testing。

运行前核1594固定文件；依赖使用隔离Cordis与Zod4.4.3锁定integrity；所有夹具目录新建并保留。没有真实模型、私有Home、Shell工具或磁盘后端。Session append故障注入验证官方Loop/Attempt的结算逻辑，不等于真实存储故障或崩溃恢复；完整官方Vitest、完整DeepSeek/PiAi Adapter HTTP链、GUI/跨进程回放、Token/延迟/缓存性能均未验证。
