# H10→H11知识衔接与重复审查

H10解决“谁在何时推进一次任务”；H11解决“下一次请求携带什么”。H10的31项局部测试没有自动覆盖H11的Section、Variable、complete、抑制及系统消息协调分支。本节重读固定源码并重新建立40项行为证据。

| 已学内容 | H11需要的最小回顾 | 本节新增 |
| --- | --- | --- |
| Stage4 System/User/Tool Calling | 消息角色与工具声明属于请求的不同材料 | Runtime Context user快照有来源，不等于用户亲自输入 |
| H03请求主流程 | 从输入经Loop到模型的整体位置 | 具体公共请求中messages/tools分别怎样形成 |
| H05 Service/Context/贡献 | ctx是获取服务和绑定注册的入口 | SystemPrompt的具名Section/Context/Variable与匿名Tool Provider |
| H06 Waterfall | 等待next并变换中间结果 | PromptPresentation只含展示数据；工具声明所有权不转移 |
| H09 Agent Scope | 全局默认+作用域视图与disposer | 同名Section先覆盖再求值，变量先逐层求值；匿名Provider叠加；真实双Agent输入 |
| H10候选Step/准备/提交/派生 | 候选组装先于pre-step；请求准备成功后才接纳消息 | renderPrompt在正式Step中、prepareRequest之前；refresh与Context render在prepare后；能力相关系统节点协调 |

正文以代码助手“中文A/英文B、动态目录、隐藏工具”的同一场景贯穿，旧知识回顾限六分钟，不复制H10的Inbox、流式输出或完整Turn状态表。H10交接文字概述“step/start后准备路线”，本节补足其前面还有系统文本render；不据概述省略真实顺序。失败位置也区分：Context候选渲染失败可无Step，系统文本渲染失败可已有Step但无prepare/请求。

重复审查采用实际结构与知识目标对照，并不把字符串相似度当教学重复率。H11新增核心概念5、核心源码文件5；默认正文7805 CJK，全部10253；代码211行，默认23，其余程序和答案折叠。H10对应默认6622/全部8751、代码186/默认26。长度增长来自输入组成、刷新例外、真实请求差异与错误推导，不据此承诺学习时长。H11作者估计170–230分钟，拆为50–65/50–65/70–100三段；首次准备环境另计，实际时长未测。

| 后续课 | H11允许触及 | 留到后续 |
| --- | --- | --- |
| H12 | 已准备调用的systemPromptUpdate能力影响协调 | Adapter接口、供应商wire转换、StreamChunk与流式协议 |
| H13 | 本次可见Schema、known-hidden、toolOrder | Registry定义与完整Schema生命周期 |
| H14–H15 | Schema可见不保证执行一定获准 | 完整工具执行流水线、守卫、审批、权限 |
| H17 | 系统事件/user来源与deriveMessages的当前效果 | Event Sourcing、完整投影、持久化与恢复 |
| H19 | 长输入与稳定前缀可能影响开销 | Compaction、预算和长上下文策略 |

H11没有把组装称为上下文压缩，也没有因Scope产生不同视图而把它称为安全沙箱。图、实践和结尾均以公共模型请求为终点。H12仅提供[前置交接](h12-handoff.md)，没有制作其正文、实验、图片或目录。
