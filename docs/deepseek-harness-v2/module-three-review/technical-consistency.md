# 技术事实、术语与八项不变式

固定版结论：四课正式正文和16张正式图没有确认的P0/P1技术矛盾。以下按用户检查项逐一落到位置；不是把不同阶段统一叫“准备”就视为一致。

| 交接 / 检查项 | 正文具体位置与一致结论 | 源码与执行证据 |
|---|---|---|
| H09/H10 实例、Loop与Driver | H09“什么叫活跃Agent/Factory”与H10“最小循环/三种Phase”：Agent公开接口，ReactLoopAgent具体对象，AgentLoop服务提供工厂，Driver是一轮活动的推进；不对应三个进程 | agent.ts 113–156、230–280；H09 D01/07，H10 D04/05 |
| Agent与Turn生命周期 | H09回顾与H10末段：Turn完回idle，实例/Session/Scope仍保留；维护期间公开idle也可有活动 | agent.ts 156–168、327–433；H10 D04/05 |
| Registry/Driver | H09 Factory、H10 preStep：Registry查询/委托/登记，具体循环只在默认实现；没有Factory不能create | agent/index.ts 401–440；H09 C01/02 |
| dispose/cancel/whenIdle | H09 dispose段与H10“会话事实/实时观察”：取消活动、等静止、结束实例三件事；whenIdle不是所有消息完成或业务成功 | agent.ts 191–280；index.ts 495–559；H09 D07/11，H10 D08/10 |
| 模型选择捕获 | H10“Turn先开始”与H11“系统文本进入请求”：claim后model.current，before tools.resolve/assemble/pre-step；request钩子不得临时换已固定选择 | agent.ts 283–317、632–642；H10 D12 |
| Prompt/pre-step/正式Step | 两课均assemble在pre-step前，enter且有执行需要才step/start；Context候选render在默认pre-step内，Section render在正式Step内 | agent.ts 297–317、343–370、435–443；H11 D06三例 |
| 用户接纳/历史 | H10“先准备再写事实”和H11图4/实践D：准备成功并refresh/取消检查后，Loop append system/user；derive取Session Surface，不拼Inbox/UI | agent.ts 445–486、656–744；H10 D06，M3全部prefix重建 |
| retry的重新执行范围 | H10“同一Step内重试”与H11 refresh/实践D：同一assembly/selection/toolSet；prepare、Context刷新和buildRequest重新发生；普通用户firstAttempt只提交一次 | agent.ts 441–478、549–571；H10 D09，H11 D08，M3 C-retry |
| 工具Schema解析与固定 | H10 preStep/H11 Schema：候选先resolve工具；SystemPrompt Provider用同一toolSet描述，展示Waterfall不能伪造tools替换；执行也携同toolSet | agent.ts 291–309、591–594；system-prompt 638–693；H11 C23、D03/09，M3 B |
| GenerateOptions | H11“没有独立system字段”明确限Loop请求；H12“准备调用单”明确类型仍有system供单次调用。两者不矛盾 | types.ts 530–597；H12 AST/C13，H11 D01，M3 Loop请求 |
| 系统文本/Runtime Context | H11五种材料/系统投影、H12请求简介：system/message派生为system角色；运行事实是source.kind=runtime-context的user快照；不是同一种消息 | runtime-context.ts 93–114、151–167；H11 D04/10/11；M3 A |
| Tool Schema/请求tools | H11 Provider/工具顺序与H12公共请求：Schema独立于system文本，按需记request/header；Runtime还可按toolUpdate能力投影实际Adapter输入 | agent.ts 656–744；llm/index.ts 1103–1134；H11 D03；后者实现静态核对，非全模式实测 |
| Adapter能力/配置/prepareCall | H11使用本次绑定能力协调system；H12详述默认、一次性、代次与内部分发捕获。不能用旧request/context或model字符串代替能力 | llm/index.ts 960–1017；H12 C13/16–20/29；H11 D01/02 |
| 冻结与Adapter边界 | H11冻结是Loop模型输入证据；H12明确手工调用需自己稳定输入。冻结不禁止Runtime生成能力投影副本；Replay过滤按当前历史路由的Adapter实例所有权 | llm/index.ts 1026–1041、1063–1134；H12 C17/18/26；M3原始Loop与Adapter请求并存 |
| Step/Attempt/chunk/message | H10“四单位”和H12“消息/分片/三件事”：Step是控制边界，一次尝试一份流；chunk不对应一条message；attempt事实也不是全部尝试总数 | agent.ts 441–609；H10 D03，H12 D-retry；M3 C-retry |
| 实时流/持久结算 | H10事件表与H12图3/实践C：start/chunk先于结算；settle先append、再带真实seq的committed end；拒绝或最终组装失败abandoned | assistant-stream.ts 49–108；H10 C04，H12 D-write-failure/assembly-failure |
| 失败/正常/本地取消 | H10取消表是非空正文子路径；H12补齐空/工具/推理/提供方aborted。正常message、失败attempt、本地安全前缀interrupted message并列，阶段不同不能互换 | agent.ts 503–587；H12 D全部分支；M3 C-retry/cancel |
| retry与新Step | 失败finish且明确retry→同Step；正常工具结果反馈或next-step输入→重新preStep/新Step；中间件准备throw不走失败finish恢复钩子 | agent.ts 343–404、549–609；H10 D09/10、M3 B/C-retry |
| 最大输出Token | H10只演示无工具上限；H12展示丢掉全部工具，包括闭合工具；message结算后返回max-tokens候选，Turn reason有保留性 | assembler.ts 135–149；agent.ts 368–370、587；H10 D11、H12 C04/D-max-tokens、M3 C-max-tokens |

术语采用六个问题防串层：

| 词 | 每次必须问清 | 不可互换 |
|---|---|---|
| owner | caller Fiber、factory、Handle持有者、parentAgent、历史谱系还是归因？ | 业务ownerId、登录授权、Scope父链 |
| 开始/结束 | 实例、Turn、Step、请求准备、Attempt、块、流还是结算？ | finish、live end、step/end、turn/end、dispose |
| 接纳 | 队列splice、候选enter、正式Step还是模型可见消息提交？ | 入队、领取、pre-step接纳、user/message |
| 持久 | Session事实、后端写入、flush还是重启恢复？ | 本轮内存append与磁盘保障 |
| 上下文 | Cordis Context、Runtime Context、LLM messages还是窗口容量？ | ctx服务访问与动态user快照 |
| index/id/seq | 块索引、Attempt帧交付序号、attemptId、callId、Message.id还是Session.seq？ | 按块index升序排内容、用callId关联消息身份 |

不变式逐项验收：

| 项 | 适用条件及例外 | 本轮支持与未验证 |
|---|---|---|
| A运行时所有权 | get得到Agent，create/resume得Handle；同进程可信插件的API责任分离 | H09 C/D真对象；非恶意代码安全验证 |
| BTurn/Step | 有真实Turn边界即可零/一/多Step；同Step可多请求；Step也可零调用 | H10真实拒绝/准备取消/retry；M3 B/C |
| C模型输入 | Loop请求依赖事件前缀、相应投影与已记录header/toolHistory；进程signal不是日志数据；Adapter能力投影需对应固定代码 | M3每次Loop请求用另一真实Session重建比较；独立一次性调用、HTTP字节、全附件/工具更新模式未据此验证 |
| DPrompt对象 | assembly、renderPrompt、Context渲染和tools声明分开；complete仍有变量和Waterfall | H11 C01/03/09/23；M3 A的旧变量/新Context |
| E准备绑定 | 有效config、能力与注册代次绑定；仅接受分发一次；自定义Adapter内部代次需自己捕获 | H12 C16–20/29；不外推HMR watcher/真实HTTP |
| F流层次 | chunk→Assembler块→消息；紧凑流保留交付事实，非每片Session事件 | H12 C01–11/D共同断言；M3展开逐片对照 |
| G持久结算 | 匹配append成功才committed；失败可abandoned；内存提交非flush | H12故障注入；M3全部committed序号与先后。磁盘失败未测 |
| H失败/取消 | 只有特定分支产生message/attempt或retry；开始前错误可无stream；本地信号与提供方标签分开 | H10/H12列明分支；M3 C。复杂全部竞态与恢复策略未测 |

定位约定同[统一模型](unified-execution-model.md)。技术判断来自控制流与测试断言；172项逐条引用/边界结果在[source-review.md](source-review.md)，不会给STATIC_ONLY加执行标签。
