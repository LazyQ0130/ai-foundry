# H11验证等级与真实执行证据

结论：40项行为测试全部通过，C25、D15；错误答案另行非零退出，不计入40项。依据是[完整stdout/stderr、退出值和源码/程序哈希](evidence/lab-results.json)、[TAP](evidence/lab-tests.txt)、[演示输出](evidence/lab-demo.txt)与[结构化实践输出](evidence/practice-output.json)，不是关键词命中数。

| 等级 | 本轮结果 | 范围与局限 |
| --- | --- | --- |
| A 教学模拟/独立算法 | 未单独运行 | 图与推导是教学简化，不作为真实实现测试 |
| B 真实Cordis专项 | 未单独运行 | C/D内运行真实Cordis、Effect/Scope/Waterfall，不重复加计 |
| C 真实SystemPrompt服务 | 25/25 | 实际注册、组装、渲染、刷新；Schema-only Provider属于测试数据，不代表真实Tools注册 |
| D Loop+Prompt+Session+MockLLM | 15/15 | 实际AgentLoop与公共请求构造、Session提交/派生；实际Tools/NativeExecutor用于工具及多Agent场景 |
| E 完整Harness应用 | 未运行 | 无完整Profile启动、供应商网络、真实收费模型或产品端到端验证 |

| 测试ID | 行为证据 |
| --- | --- |
| C01–02 | order/name排序、空段、assemble保留模板、render使用已捕获值；unknown/undefined/malformed与字面量 |
| C03–05 | complete在Waterfall后恢复原段、变量仍可变化、多个完整段冲突；其他Section Provider失败仍传播 |
| C06–08 | 注册冲突与名称/order校验、空白/孤立花括号/非递归插值/不读原型；未被引用的变量Provider仍求值 |
| C09–14 | refresh不重跑Section/Variable/Tools/Waterfall；抑制器独立撤销；补required而非新optional；配置抑制；必需事实恢复；Context同order保持收集顺序 |
| C15–18 | 真实Scope同名覆盖、精确disposer恢复；全局变量Provider先运行；作用域Context/抑制/监听器；匿名Tool Provider叠加 |
| C19–23 | 默认/显式toolOrder，rest插入；known-hidden与unknown区别；两项错误形状（C21计2）；保留标记禁止当工具；Schema参数脱离原对象、Waterfall伪造tools被忽略 |
| C24 | 无complete时Waterfall展示顺序/文本有权威性，异常传播 |
| D01 plain / in-history（计2） | 五次请求的P1→P2→不变→空→仍空，真实准备路线能力决定系统节点处理；旧事件仍留存；没有独立system字段，历史/请求被冻结 |
| D02 | 新请求序列起点：不变时保留in-history版本，变更时整合有效系统节点 |
| D03 | Tools实际注册、可见性变化同步改变Schema、header及依赖工具集的说明；旧请求保持原值 |
| D04–05 | prepare后刷新动态事实，变量保持组装捕获值；请求准备阶段启用抑制仅留下required |
| D06三种失败（计3） | 系统render失败：1 Step/0请求；Context render及toolOrder失败：0 Step/0请求；均无本轮系统/用户接纳事实 |
| D07两种取消（计2） | assemble门等待时0 Step，agent/request门等待时1 Step；取消后释放门，均0模型请求/无待接纳系统与用户事实 |
| D08 | 同Step两次尝试：Section/Variable/assemble各1，Context 3（候选1+每次请求1），request hook2；用户输入只接纳一次，刷新快照变化可见 |
| D09 | 两个真实Agent：A中文/read，B英文/read+audit；匹配的监听器各1；撤销A局部贡献恢复全局默认，不改B |
| D10 | 四次请求产生初始/更新/清空三条带来源Runtime Context快照；第四次不变不追加，旧事实保留 |
| D11 | 初始空Prompt先记录空系统头但模型历史无system消息；后续非空替换该头，两个空请求不重复写系统事件 |

实践A对应C01–08、23–24；B对应C09–14、17；C由C15–23与D09共同支撑；D由D01–08、10–11支撑。正文提供完整主要程序，测试文件另见[lab](../../../course-content/internal/deepseek-harness/h11/lab)。C编号不是用例数：C21参数化为2；D01/D06/D07分别为2/3/2。

真实请求的系统文本结果（取自D01，不是手写程序输出）：plain五轮为 `[P1] → [P2] → [P2] → [] → []`；in-history为 `[P1] → [P1,P2] → [P1,P2] → [] → []`。这里P1/P2是轨迹中“指令第一版/指令第二版”的缩写。工具变化轨迹为 `[read_fixture] → [audit_fixture,read_fixture] → [audit_fixture]`。完整对象、消息来源与Session事件见practice-output，不将缩写当作原始JSON。

`negative-answer.ts`故意断言assemble的Alpha段已完成插值，[错误诊断](evidence/lab-mutation.txt)必须非零退出。它验证错误答案被拒绝，没有修改官方算法，也不等价于实现级mutation testing。首次运行39项全部通过，补入“初始为空”分支后为40项；留存run时间戳文件，最终结果指向最新运行，没有编造先失败后修复的测试历史。

运行前比对1593个源码文件的Git blob/SHA256；隔离H04/Cordis与Zod4.4.3依赖；实验复制到新OS临时目录，环境只允许系统路径与夹具配置，不读取真实Home配置、不调用文件/Shell工具、不请求模型。官方MockAdapter与固定源码逐字节相同。Session是官方真实内存实现，没有storage backend，提交事件不证明磁盘flush或崩溃恢复。原始JSON中的fixture sessionId用于跨Agent区分；它不是产品用户会话。

48条断言逐条标注精确函数/类型、行范围、预期、相关官方测试（选读）以及本轮行为证据/静态限制；[源码清单](source-checklist.md)与AST检查互补，不以AST存在代替执行正确性。未测量真实Token、供应商缓存、网络流式、权限执行、长上下文压缩或教学效果。
